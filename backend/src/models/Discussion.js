const { query } = require('../config/database');

class Discussion {
  // Create new discussion
  static async create(discussionData) {
    const {
      forum_id,
      author_id,
      title,
      slug,
      content,
      discussion_type = 'discussion'
    } = discussionData;

    const sql = `
      INSERT INTO discussions (
        forum_id, author_id, title, slug,
        content, discussion_type
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await query(sql, [
      forum_id, author_id, title, slug,
      content, discussion_type
    ]);

    // Update forum post count
    await query(
      'UPDATE forums SET post_count = post_count + 1 WHERE id = $1',
      [forum_id]
    );

    return result.rows[0];
  }

  // Find discussion by ID
  static async findById(id) {
    const sql = `
      SELECT d.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        u.reputation_score as author_reputation,
        f.name as forum_name,
        f.slug as forum_slug
      FROM discussions d
      JOIN users u ON d.author_id = u.id
      JOIN forums f ON d.forum_id = f.id
      WHERE d.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all discussions
  static async findAll(filters = {}) {
    const {
      forum_id,
      author_id,
      discussion_type,
      status,
      search,
      limit = 20,
      offset = 0,
      sortBy = 'last_activity',
      sortOrder = 'DESC'
    } = filters;

    let conditions = ['1=1'];
    let params = [];
    let paramCount = 1;

    if (forum_id) {
      conditions.push(`d.forum_id = $${paramCount}`);
      params.push(forum_id);
      paramCount++;
    }

    if (author_id) {
      conditions.push(`d.author_id = $${paramCount}`);
      params.push(author_id);
      paramCount++;
    }

    if (discussion_type) {
      conditions.push(`d.discussion_type = $${paramCount}`);
      params.push(discussion_type);
      paramCount++;
    }

    if (status) {
      conditions.push(`d.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (search) {
      conditions.push(`(d.title ILIKE $${paramCount} OR d.content ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const allowedSortFields = ['created_at', 'last_activity', 'view_count', 'reply_count', 'like_count'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'last_activity';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit, offset);

    const sql = `
      SELECT d.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        f.name as forum_name,
        f.slug as forum_slug,
        COUNT(*) OVER() as total_count
      FROM discussions d
      JOIN users u ON d.author_id = u.id
      JOIN forums f ON d.forum_id = f.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY d.is_pinned DESC, d.${sortField} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    const result = await query(sql, params);
    return {
      data: result.rows,
      total: result.rows[0]?.total_count || 0,
      limit,
      offset
    };
  }

  // Get replies for discussion
  static async getReplies(discussionId, limit = 50, offset = 0) {
    const sql = `
      WITH RECURSIVE reply_tree AS (
        -- Base case: top-level replies
        SELECT dr.*,
          u.username as author_username,
          u.full_name as author_name,
          u.avatar_url as author_avatar,
          u.reputation_score as author_reputation,
          0 as depth,
          ARRAY[dr.created_at] as path
        FROM discussion_replies dr
        JOIN users u ON dr.author_id = u.id
        WHERE dr.discussion_id = $1 AND dr.parent_reply_id IS NULL

        UNION ALL

        -- Recursive case: nested replies
        SELECT dr.*,
          u.username as author_username,
          u.full_name as author_name,
          u.avatar_url as author_avatar,
          u.reputation_score as author_reputation,
          rt.depth + 1,
          rt.path || dr.created_at
        FROM discussion_replies dr
        JOIN users u ON dr.author_id = u.id
        JOIN reply_tree rt ON dr.parent_reply_id = rt.id
        WHERE rt.depth < 5  -- Limit nesting depth
      )
      SELECT *
      FROM reply_tree
      ORDER BY path
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [discussionId, limit, offset]);
    return result.rows;
  }

  // Create reply
  static async createReply(replyData) {
    const {
      discussion_id,
      parent_reply_id = null,
      author_id,
      content
    } = replyData;

    const sql = `
      INSERT INTO discussion_replies (
        discussion_id, parent_reply_id, author_id, content
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await query(sql, [
      discussion_id, parent_reply_id, author_id, content
    ]);

    // Update discussion reply count and last activity
    await query(`
      UPDATE discussions
      SET reply_count = reply_count + 1,
          last_activity = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [discussion_id]);

    return result.rows[0];
  }

  // Update discussion
  static async update(id, updates) {
    const allowedFields = ['title', 'content', 'status'];
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE discussions
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update reply
  static async updateReply(id, content) {
    const sql = `
      UPDATE discussion_replies
      SET content = $1,
          is_edited = TRUE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [content, id]);
    return result.rows[0];
  }

  // Increment view count
  static async incrementViewCount(id) {
    const sql = `
      UPDATE discussions
      SET view_count = view_count + 1
      WHERE id = $1
      RETURNING view_count
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Like discussion
  static async like(discussionId, userId) {
    const sql = `
      INSERT INTO discussion_likes (discussion_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (discussion_id, user_id) DO NOTHING
      RETURNING *
    `;

    const result = await query(sql, [discussionId, userId]);

    if (result.rows[0]) {
      await query(
        'UPDATE discussions SET like_count = like_count + 1 WHERE id = $1',
        [discussionId]
      );
      return true;
    }
    return false;
  }

  // Unlike discussion
  static async unlike(discussionId, userId) {
    const sql = `
      DELETE FROM discussion_likes
      WHERE discussion_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await query(sql, [discussionId, userId]);

    if (result.rows[0]) {
      await query(
        'UPDATE discussions SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1',
        [discussionId]
      );
      return true;
    }
    return false;
  }

  // Like reply
  static async likeReply(replyId, userId) {
    const sql = `
      INSERT INTO reply_likes (reply_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (reply_id, user_id) DO NOTHING
      RETURNING *
    `;

    const result = await query(sql, [replyId, userId]);

    if (result.rows[0]) {
      await query(
        'UPDATE discussion_replies SET like_count = like_count + 1 WHERE id = $1',
        [replyId]
      );
      return true;
    }
    return false;
  }

  // Mark reply as best answer
  static async markBestAnswer(discussionId, replyId) {
    const client = await require('../config/database').getClient();

    try {
      await client.query('BEGIN');

      // Unmark previous best answer
      await client.query(`
        UPDATE discussion_replies
        SET is_best_answer = FALSE
        WHERE discussion_id = $1 AND is_best_answer = TRUE
      `, [discussionId]);

      // Mark new best answer
      await client.query(`
        UPDATE discussion_replies
        SET is_best_answer = TRUE
        WHERE id = $1
      `, [replyId]);

      // Update discussion
      await client.query(`
        UPDATE discussions
        SET best_answer_id = $1,
            status = 'solved',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [replyId, discussionId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Pin/Unpin discussion
  static async togglePin(id) {
    const sql = `
      UPDATE discussions
      SET is_pinned = NOT is_pinned,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Lock/Unlock discussion
  static async toggleLock(id) {
    const sql = `
      UPDATE discussions
      SET is_locked = NOT is_locked,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Delete discussion
  static async delete(id) {
    const sql = `
      DELETE FROM discussions
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Delete reply
  static async deleteReply(id) {
    const sql = `
      DELETE FROM discussion_replies
      WHERE id = $1
      RETURNING id, discussion_id
    `;

    const result = await query(sql, [id]);

    if (result.rows[0]) {
      // Update discussion reply count
      await query(`
        UPDATE discussions
        SET reply_count = GREATEST(reply_count - 1, 0)
        WHERE id = $1
      `, [result.rows[0].discussion_id]);
    }

    return result.rows[0];
  }

  // Get forums
  static async getForums(parentId = null) {
    const sql = `
      SELECT f.*,
        c.name as category_name,
        c.slug as category_slug
      FROM forums f
      LEFT JOIN categories c ON f.category_id = c.id
      WHERE ${parentId ? 'f.parent_id = $1' : 'f.parent_id IS NULL'}
      ORDER BY f.sort_order ASC
    `;

    const result = parentId ?
      await query(sql, [parentId]) :
      await query(sql);

    return result.rows;
  }
}

// Create auxiliary tables
const createAuxiliaryTables = `
  CREATE TABLE IF NOT EXISTS discussion_likes (
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (discussion_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS reply_likes (
    reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (reply_id, user_id)
  );
`;

module.exports = Discussion;
