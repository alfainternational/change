const { query } = require('../config/database');

class Content {
  // Create new content
  static async create(contentData) {
    const {
      title,
      slug,
      content_type,
      author_id,
      content_body,
      excerpt,
      featured_image,
      difficulty_level,
      visibility = 'public'
    } = contentData;

    const sql = `
      INSERT INTO content (
        title, slug, content_type, author_id, content_body,
        excerpt, featured_image, difficulty_level, visibility, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft')
      RETURNING *
    `;

    const result = await query(sql, [
      title, slug, content_type, author_id, JSON.stringify(content_body),
      excerpt, featured_image, difficulty_level, visibility
    ]);

    return result.rows[0];
  }

  // Find content by ID
  static async findById(id, includeStats = true) {
    let sql = `
      SELECT c.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar
      FROM content c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = $1
    `;

    const result = await query(sql, [id]);

    if (!result.rows[0]) return null;

    const content = result.rows[0];

    if (includeStats) {
      // Get categories and tags
      const categoriesSql = `
        SELECT c.id, c.name, c.slug
        FROM categories c
        JOIN content_categories cc ON c.id = cc.category_id
        WHERE cc.content_id = $1
      `;
      const categories = await query(categoriesSql, [id]);

      const tagsSql = `
        SELECT t.id, t.name, t.slug
        FROM tags t
        JOIN content_tags ct ON t.id = ct.tag_id
        WHERE ct.content_id = $1
      `;
      const tags = await query(tagsSql, [id]);

      content.categories = categories.rows;
      content.tags = tags.rows;
    }

    return content;
  }

  // Find content by slug
  static async findBySlug(slug) {
    const sql = `
      SELECT c.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar
      FROM content c
      JOIN users u ON c.author_id = u.id
      WHERE c.slug = $1 AND c.status = 'published'
    `;

    const result = await query(sql, [slug]);
    return result.rows[0];
  }

  // Get all content with filters
  static async findAll(filters = {}) {
    const {
      content_type,
      status,
      difficulty_level,
      author_id,
      category_id,
      tag_id,
      search,
      limit = 20,
      offset = 0,
      sortBy = 'published_at',
      sortOrder = 'DESC'
    } = filters;

    let conditions = ['1=1'];
    let params = [];
    let paramCount = 1;

    if (content_type) {
      conditions.push(`c.content_type = $${paramCount}`);
      params.push(content_type);
      paramCount++;
    }

    if (status) {
      conditions.push(`c.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    } else {
      conditions.push(`c.status = 'published'`);
    }

    if (difficulty_level) {
      conditions.push(`c.difficulty_level = $${paramCount}`);
      params.push(difficulty_level);
      paramCount++;
    }

    if (author_id) {
      conditions.push(`c.author_id = $${paramCount}`);
      params.push(author_id);
      paramCount++;
    }

    if (category_id) {
      conditions.push(`EXISTS (
        SELECT 1 FROM content_categories cc
        WHERE cc.content_id = c.id AND cc.category_id = $${paramCount}
      )`);
      params.push(category_id);
      paramCount++;
    }

    if (tag_id) {
      conditions.push(`EXISTS (
        SELECT 1 FROM content_tags ct
        WHERE ct.content_id = c.id AND ct.tag_id = $${paramCount}
      )`);
      params.push(tag_id);
      paramCount++;
    }

    if (search) {
      conditions.push(`(c.title ILIKE $${paramCount} OR c.excerpt ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    const allowedSortFields = ['published_at', 'created_at', 'view_count', 'like_count', 'title'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'published_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit, offset);

    const sql = `
      SELECT c.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        COUNT(*) OVER() as total_count
      FROM content c
      JOIN users u ON c.author_id = u.id
      WHERE ${conditions.join(' AND ')}
      ORDER BY c.${sortField} ${order}
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

  // Update content
  static async update(id, updates) {
    const allowedFields = [
      'title', 'slug', 'content_body', 'excerpt', 'featured_image',
      'difficulty_level', 'visibility', 'seo_meta', 'reading_time'
    ];

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = $${paramCount}`);
        values.push(key === 'content_body' || key === 'seo_meta'
          ? JSON.stringify(updates[key])
          : updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE content
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Update content status
  static async updateStatus(id, status) {
    const sql = `
      UPDATE content
      SET status = $1,
          ${status === 'published' ? 'published_at = CURRENT_TIMESTAMP,' : ''}
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const result = await query(sql, [status, id]);
    return result.rows[0];
  }

  // Increment view count
  static async incrementViewCount(id) {
    const sql = `
      UPDATE content
      SET view_count = view_count + 1
      WHERE id = $1
      RETURNING view_count
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Like content
  static async like(contentId, userId) {
    const sql = `
      INSERT INTO content_likes (content_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (content_id, user_id) DO NOTHING
      RETURNING *
    `;

    const result = await query(sql, [contentId, userId]);

    if (result.rows[0]) {
      await query('UPDATE content SET like_count = like_count + 1 WHERE id = $1', [contentId]);
      return true;
    }
    return false;
  }

  // Unlike content
  static async unlike(contentId, userId) {
    const sql = `
      DELETE FROM content_likes
      WHERE content_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await query(sql, [contentId, userId]);

    if (result.rows[0]) {
      await query('UPDATE content SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1', [contentId]);
      return true;
    }
    return false;
  }

  // Bookmark content
  static async bookmark(contentId, userId) {
    const sql = `
      INSERT INTO content_bookmarks (content_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (content_id, user_id) DO NOTHING
      RETURNING *
    `;

    const result = await query(sql, [contentId, userId]);

    if (result.rows[0]) {
      await query('UPDATE content SET bookmark_count = bookmark_count + 1 WHERE id = $1', [contentId]);
      return true;
    }
    return false;
  }

  // Remove bookmark
  static async removeBookmark(contentId, userId) {
    const sql = `
      DELETE FROM content_bookmarks
      WHERE content_id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await query(sql, [contentId, userId]);

    if (result.rows[0]) {
      await query('UPDATE content SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = $1', [contentId]);
      return true;
    }
    return false;
  }

  // Add categories to content
  static async addCategories(contentId, categoryIds) {
    const values = categoryIds.map((catId, i) => `($1, $${i + 2})`).join(', ');
    const sql = `
      INSERT INTO content_categories (content_id, category_id)
      VALUES ${values}
      ON CONFLICT (content_id, category_id) DO NOTHING
    `;

    await query(sql, [contentId, ...categoryIds]);
  }

  // Add tags to content
  static async addTags(contentId, tagIds) {
    const values = tagIds.map((tagId, i) => `($1, $${i + 2})`).join(', ');
    const sql = `
      INSERT INTO content_tags (content_id, tag_id)
      VALUES ${values}
      ON CONFLICT (content_id, tag_id) DO NOTHING
    `;

    await query(sql, [contentId, ...tagIds]);
  }

  // Get trending content
  static async getTrending(limit = 10) {
    const sql = `
      SELECT c.*,
        u.username as author_username,
        u.full_name as author_name,
        u.avatar_url as author_avatar,
        (c.view_count * 0.3 + c.like_count * 0.5 + c.bookmark_count * 0.2) as trending_score
      FROM content c
      JOIN users u ON c.author_id = u.id
      WHERE c.status = 'published'
        AND c.published_at > NOW() - INTERVAL '30 days'
      ORDER BY trending_score DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  // Delete content (soft delete)
  static async delete(id) {
    const sql = `
      UPDATE content
      SET status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

// Create required tables for likes and bookmarks
const createAuxiliaryTables = `
  CREATE TABLE IF NOT EXISTS content_likes (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS content_bookmarks (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, user_id)
  );
`;

module.exports = Content;
