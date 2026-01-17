const { query } = require('../config/database');
const config = require('../config');

class Reputation {
  // Award points to user
  static async awardPoints(userId, actionType, points, reference = {}) {
    const { referenceType = null, referenceId = null, description = '' } = reference;

    const client = await require('../config/database').getClient();

    try {
      await client.query('BEGIN');

      // Add reputation log
      const logSql = `
        INSERT INTO reputation_logs (
          user_id, action_type, points,
          reference_type, reference_id, description
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const logResult = await client.query(logSql, [
        userId, actionType, points,
        referenceType, referenceId, description
      ]);

      // Update user reputation score
      const updateSql = `
        UPDATE users
        SET reputation_score = reputation_score + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, reputation_score
      `;

      const userResult = await client.query(updateSql, [points, userId]);

      await client.query('COMMIT');

      // Check for new badges
      await this.checkAndAwardBadges(userId);

      return {
        log: logResult.rows[0],
        newScore: userResult.rows[0].reputation_score
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get user reputation logs
  static async getUserLogs(userId, limit = 50, offset = 0) {
    const sql = `
      SELECT *
      FROM reputation_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [userId, limit, offset]);
    return result.rows;
  }

  // Get reputation summary
  static async getSummary(userId) {
    const sql = `
      SELECT
        SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as total_earned,
        SUM(CASE WHEN points < 0 THEN points ELSE 0 END) as total_lost,
        COUNT(*) as total_actions,
        (SELECT reputation_score FROM users WHERE id = $1) as current_score
      FROM reputation_logs
      WHERE user_id = $1
    `;

    const result = await query(sql, [userId]);
    return result.rows[0];
  }

  // Get reputation breakdown by action type
  static async getBreakdown(userId) {
    const sql = `
      SELECT
        action_type,
        COUNT(*) as count,
        SUM(points) as total_points
      FROM reputation_logs
      WHERE user_id = $1
      GROUP BY action_type
      ORDER BY total_points DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get user level based on reputation
  static getUserLevel(reputationScore) {
    const levels = config.reputation.levels;

    for (let i = levels.length - 1; i >= 0; i--) {
      if (reputationScore >= levels[i].minPoints) {
        return levels[i];
      }
    }

    return levels[0];
  }

  // Check and award badges
  static async checkAndAwardBadges(userId) {
    // Get user stats
    const statsSql = `
      SELECT
        u.reputation_score,
        (SELECT COUNT(*) FROM content WHERE author_id = $1 AND status = 'published') as published_content,
        (SELECT COUNT(*) FROM discussions WHERE author_id = $1) as discussions_created,
        (SELECT COUNT(*) FROM discussion_replies WHERE author_id = $1) as replies_made,
        (SELECT COUNT(*) FROM discussion_replies WHERE author_id = $1 AND is_best_answer = TRUE) as best_answers,
        (SELECT COUNT(*) FROM user_enrollments WHERE user_id = $1 AND completed_at IS NOT NULL) as completed_paths,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = $1) as current_badges
      FROM users u
      WHERE u.id = $1
    `;

    const statsResult = await query(statsSql, [userId]);
    const stats = statsResult.rows[0];

    // Get all active badges
    const badgesSql = `
      SELECT *
      FROM badges
      WHERE is_active = TRUE
    `;

    const badgesResult = await query(badgesSql);
    const badges = badgesResult.rows;

    // Check each badge criteria
    const newBadges = [];

    for (const badge of badges) {
      const alreadyHas = await this.userHasBadge(userId, badge.id);
      if (alreadyHas) continue;

      const criteria = badge.criteria;
      let qualifies = false;

      // Check different badge types
      if (criteria.reputation && stats.reputation_score >= criteria.reputation) {
        qualifies = true;
      } else if (criteria.action === 'publish_content' && stats.published_content >= criteria.count) {
        qualifies = true;
      } else if (criteria.action === 'participate_discussion' &&
                 (stats.discussions_created + stats.replies_made) >= criteria.count) {
        qualifies = true;
      } else if (criteria.action === 'best_answers' && stats.best_answers >= criteria.count) {
        qualifies = true;
      } else if (criteria.action === 'complete_path' && stats.completed_paths >= criteria.count) {
        qualifies = true;
      }

      if (qualifies) {
        await this.awardBadge(userId, badge.id);
        newBadges.push(badge);
      }
    }

    return newBadges;
  }

  // Award badge to user
  static async awardBadge(userId, badgeId) {
    const sql = `
      INSERT INTO user_badges (user_id, badge_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, badge_id) DO NOTHING
      RETURNING *
    `;

    const result = await query(sql, [userId, badgeId]);
    return result.rows[0];
  }

  // Check if user has badge
  static async userHasBadge(userId, badgeId) {
    const sql = `
      SELECT id
      FROM user_badges
      WHERE user_id = $1 AND badge_id = $2
    `;

    const result = await query(sql, [userId, badgeId]);
    return result.rows.length > 0;
  }

  // Get user badges
  static async getUserBadges(userId) {
    const sql = `
      SELECT b.*, ub.earned_at, ub.progress
      FROM user_badges ub
      JOIN badges b ON ub.badge_id = b.id
      WHERE ub.user_id = $1
      ORDER BY ub.earned_at DESC
    `;

    const result = await query(sql, [userId]);
    return result.rows;
  }

  // Get all badges
  static async getAllBadges() {
    const sql = `
      SELECT *
      FROM badges
      WHERE is_active = TRUE
      ORDER BY badge_type, name
    `;

    const result = await query(sql);
    return result.rows;
  }

  // Get leaderboard
  static async getLeaderboard(timeframe = 'all_time', category = null, limit = 100) {
    let sql;
    const params = [limit];

    if (timeframe === 'all_time') {
      sql = `
        SELECT
          u.id,
          u.username,
          u.full_name,
          u.avatar_url,
          u.reputation_score as score,
          u.user_type,
          ROW_NUMBER() OVER (ORDER BY u.reputation_score DESC) as rank
        FROM users u
        WHERE u.status = 'active'
        ORDER BY u.reputation_score DESC
        LIMIT $1
      `;
    } else {
      // For time-based leaderboards (daily, weekly, monthly)
      let interval;
      switch (timeframe) {
        case 'daily':
          interval = '1 day';
          break;
        case 'weekly':
          interval = '7 days';
          break;
        case 'monthly':
          interval = '30 days';
          break;
        default:
          interval = '7 days';
      }

      sql = `
        SELECT
          u.id,
          u.username,
          u.full_name,
          u.avatar_url,
          u.user_type,
          SUM(rl.points) as score,
          ROW_NUMBER() OVER (ORDER BY SUM(rl.points) DESC) as rank
        FROM users u
        JOIN reputation_logs rl ON u.id = rl.user_id
        WHERE u.status = 'active'
          AND rl.created_at >= NOW() - INTERVAL '${interval}'
        GROUP BY u.id, u.username, u.full_name, u.avatar_url, u.user_type
        ORDER BY score DESC
        LIMIT $1
      `;
    }

    const result = await query(sql, params);
    return result.rows;
  }

  // Update leaderboard cache
  static async updateLeaderboardCache() {
    const timeframes = ['daily', 'weekly', 'monthly', 'all_time'];

    for (const timeframe of timeframes) {
      const leaderboard = await this.getLeaderboard(timeframe, null, 100);

      // Store in leaderboards table
      const deleteSql = `
        DELETE FROM leaderboards
        WHERE timeframe = $1
      `;
      await query(deleteSql, [timeframe]);

      if (leaderboard.length > 0) {
        const values = leaderboard.map((entry, index) =>
          `('${timeframe}', NULL, '${entry.id}', ${entry.score}, ${index + 1})`
        ).join(', ');

        const insertSql = `
          INSERT INTO leaderboards (timeframe, category, user_id, score, rank)
          VALUES ${values}
        `;

        await query(insertSql);
      }
    }
  }

  // Award daily login bonus
  static async awardDailyLogin(userId) {
    // Check if already awarded today
    const checkSql = `
      SELECT id
      FROM reputation_logs
      WHERE user_id = $1
        AND action_type = 'daily_login'
        AND created_at >= CURRENT_DATE
    `;

    const checkResult = await query(checkSql, [userId]);

    if (checkResult.rows.length === 0) {
      return await this.awardPoints(
        userId,
        'daily_login',
        config.reputation.points.dailyLogin,
        { description: 'تسجيل دخول يومي' }
      );
    }

    return null;
  }
}

module.exports = Reputation;
