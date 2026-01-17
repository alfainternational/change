const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const config = require('../config');

class User {
  // Create new user
  static async create(userData) {
    const {
      email,
      username,
      password,
      full_name,
      user_type = 'learner'
    } = userData;

    const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

    const sql = `
      INSERT INTO users (email, username, password_hash, full_name, user_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, username, full_name, user_type, reputation_score, created_at
    `;

    const result = await query(sql, [email, username, hashedPassword, full_name, user_type]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const sql = `
      SELECT id, email, username, full_name, avatar_url, bio,
             user_type, reputation_score, status, email_verified,
             created_at, updated_at, last_login
      FROM users
      WHERE id = $1 AND status = 'active'
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = `
      SELECT id, email, username, password_hash, full_name, avatar_url,
             user_type, reputation_score, status, email_verified
      FROM users
      WHERE email = $1
    `;

    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Find user by username
  static async findByUsername(username) {
    const sql = `
      SELECT id, email, username, password_hash, full_name, avatar_url,
             user_type, reputation_score, status, email_verified
      FROM users
      WHERE username = $1
    `;

    const result = await query(sql, [username]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Update user
  static async update(id, updates) {
    const allowedFields = ['full_name', 'bio', 'avatar_url', 'email_verified'];
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
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, username, full_name, avatar_url, bio,
                user_type, reputation_score, updated_at
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, config.security.bcryptRounds);

    const sql = `
      UPDATE users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;

    const result = await query(sql, [hashedPassword, id]);
    return result.rows[0];
  }

  // Update last login
  static async updateLastLogin(id) {
    const sql = `
      UPDATE users
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await query(sql, [id]);
  }

  // Update reputation score
  static async updateReputation(id, points) {
    const sql = `
      UPDATE users
      SET reputation_score = reputation_score + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, reputation_score
    `;

    const result = await query(sql, [points, id]);
    return result.rows[0];
  }

  // Get user stats
  static async getStats(id) {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM content WHERE author_id = $1 AND status = 'published') as published_content,
        (SELECT COUNT(*) FROM discussions WHERE author_id = $1) as discussions_created,
        (SELECT COUNT(*) FROM discussion_replies WHERE author_id = $1) as replies_made,
        (SELECT COUNT(*) FROM user_enrollments WHERE user_id = $1) as enrollments,
        (SELECT COUNT(*) FROM user_enrollments WHERE user_id = $1 AND completed_at IS NOT NULL) as completed_paths,
        (SELECT COUNT(*) FROM user_badges WHERE user_id = $1) as badges_earned
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Search users
  static async search(searchTerm, limit = 20, offset = 0) {
    const sql = `
      SELECT id, username, full_name, avatar_url, bio,
             user_type, reputation_score
      FROM users
      WHERE (username ILIKE $1 OR full_name ILIKE $1)
        AND status = 'active'
      ORDER BY reputation_score DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await query(sql, [`%${searchTerm}%`, limit, offset]);
    return result.rows;
  }

  // Get leaderboard
  static async getLeaderboard(limit = 20, offset = 0) {
    const sql = `
      SELECT id, username, full_name, avatar_url,
             reputation_score, user_type
      FROM users
      WHERE status = 'active'
      ORDER BY reputation_score DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await query(sql, [limit, offset]);
    return result.rows;
  }

  // Delete user (soft delete)
  static async delete(id) {
    const sql = `
      UPDATE users
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = User;
