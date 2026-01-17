const { query } = require('../config/database');

class LearningPath {
  // Create new learning path
  static async create(pathData) {
    const {
      title,
      slug,
      description,
      creator_id,
      difficulty_level = 'beginner',
      estimated_hours,
      thumbnail_url
    } = pathData;

    const sql = `
      INSERT INTO learning_paths (
        title, slug, description, creator_id,
        difficulty_level, estimated_hours, thumbnail_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const result = await query(sql, [
      title, slug, description, creator_id,
      difficulty_level, estimated_hours, thumbnail_url
    ]);

    return result.rows[0];
  }

  // Find learning path by ID
  static async findById(id) {
    const sql = `
      SELECT lp.*,
        u.username as creator_username,
        u.full_name as creator_name
      FROM learning_paths lp
      JOIN users u ON lp.creator_id = u.id
      WHERE lp.id = $1 AND lp.is_active = TRUE
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all learning paths
  static async findAll(filters = {}) {
    const {
      difficulty_level,
      creator_id,
      limit = 20,
      offset = 0,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

    let conditions = ['lp.is_active = TRUE'];
    let params = [];
    let paramCount = 1;

    if (difficulty_level) {
      conditions.push(`lp.difficulty_level = $${paramCount}`);
      params.push(difficulty_level);
      paramCount++;
    }

    if (creator_id) {
      conditions.push(`lp.creator_id = $${paramCount}`);
      params.push(creator_id);
      paramCount++;
    }

    const allowedSortFields = ['created_at', 'title', 'enrollment_count', 'completion_rate'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit, offset);

    const sql = `
      SELECT lp.*,
        u.username as creator_username,
        u.full_name as creator_name,
        COUNT(*) OVER() as total_count
      FROM learning_paths lp
      JOIN users u ON lp.creator_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY lp.${sortField} ${order}
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

  // Get modules for a learning path
  static async getModules(pathId) {
    const sql = `
      SELECT *
      FROM learning_modules
      WHERE path_id = $1
      ORDER BY sort_order ASC
    `;

    const result = await query(sql, [pathId]);
    return result.rows;
  }

  // Get lessons for a module
  static async getLessons(moduleId) {
    const sql = `
      SELECT l.*,
        c.title as content_title,
        c.excerpt as content_excerpt,
        c.reading_time
      FROM lessons l
      LEFT JOIN content c ON l.content_id = c.id
      WHERE l.module_id = $1
      ORDER BY l.sort_order ASC
    `;

    const result = await query(sql, [moduleId]);
    return result.rows;
  }

  // Enroll user in learning path
  static async enroll(userId, pathId) {
    const sql = `
      INSERT INTO user_enrollments (user_id, path_id, last_activity)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, path_id) DO NOTHING
      RETURNING *
    `;

    const result = await query(sql, [userId, pathId]);

    if (result.rows[0]) {
      // Increment enrollment count
      await query(
        'UPDATE learning_paths SET enrollment_count = enrollment_count + 1 WHERE id = $1',
        [pathId]
      );
      return result.rows[0];
    }

    return null;
  }

  // Get user enrollment
  static async getEnrollment(userId, pathId) {
    const sql = `
      SELECT *
      FROM user_enrollments
      WHERE user_id = $1 AND path_id = $2
    `;

    const result = await query(sql, [userId, pathId]);
    return result.rows[0];
  }

  // Update progress
  static async updateProgress(userId, pathId, progressPercentage) {
    const sql = `
      UPDATE user_enrollments
      SET progress_percentage = $1,
          last_activity = CURRENT_TIMESTAMP,
          completed_at = CASE WHEN $1 >= 100 THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE user_id = $2 AND path_id = $3
      RETURNING *
    `;

    const result = await query(sql, [progressPercentage, userId, pathId]);
    return result.rows[0];
  }

  // Mark lesson as completed
  static async completeLesson(userId, lessonId) {
    const sql = `
      INSERT INTO lesson_progress (
        user_id, lesson_id, status,
        completion_percentage, completed_at
      )
      VALUES ($1, $2, 'completed', 100, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        status = 'completed',
        completion_percentage = 100,
        completed_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const result = await query(sql, [userId, lessonId]);
    return result.rows[0];
  }

  // Update lesson progress
  static async updateLessonProgress(userId, lessonId, data) {
    const {
      completion_percentage = 0,
      time_spent_minutes = 0,
      notes = ''
    } = data;

    const status = completion_percentage >= 100 ? 'completed' :
                   completion_percentage > 0 ? 'in_progress' : 'not_started';

    const sql = `
      INSERT INTO lesson_progress (
        user_id, lesson_id, status,
        completion_percentage, time_spent_minutes, notes,
        started_at, completed_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        CURRENT_TIMESTAMP,
        CASE WHEN $4 >= 100 THEN CURRENT_TIMESTAMP ELSE NULL END
      )
      ON CONFLICT (user_id, lesson_id)
      DO UPDATE SET
        status = $3,
        completion_percentage = $4,
        time_spent_minutes = lesson_progress.time_spent_minutes + $5,
        notes = $6,
        completed_at = CASE WHEN $4 >= 100 THEN CURRENT_TIMESTAMP ELSE lesson_progress.completed_at END
      RETURNING *
    `;

    const result = await query(sql, [
      userId, lessonId, status,
      completion_percentage, time_spent_minutes, notes
    ]);

    return result.rows[0];
  }

  // Get user progress for path
  static async getUserProgress(userId, pathId) {
    const sql = `
      SELECT ue.*,
        lp.title as path_title,
        (
          SELECT COUNT(*)
          FROM lessons l
          JOIN learning_modules lm ON l.module_id = lm.id
          WHERE lm.path_id = $2
        ) as total_lessons,
        (
          SELECT COUNT(*)
          FROM lesson_progress lp
          JOIN lessons l ON lp.lesson_id = l.id
          JOIN learning_modules lm ON l.module_id = lm.id
          WHERE lp.user_id = $1
            AND lm.path_id = $2
            AND lp.status = 'completed'
        ) as completed_lessons
      FROM user_enrollments ue
      JOIN learning_paths lp ON ue.path_id = lp.id
      WHERE ue.user_id = $1 AND ue.path_id = $2
    `;

    const result = await query(sql, [userId, pathId]);
    return result.rows[0];
  }

  // Update learning path
  static async update(id, updates) {
    const allowedFields = [
      'title', 'slug', 'description', 'difficulty_level',
      'estimated_hours', 'thumbnail_url', 'is_active'
    ];

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
      UPDATE learning_paths
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Delete learning path
  static async delete(id) {
    const sql = `
      UPDATE learning_paths
      SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = LearningPath;
