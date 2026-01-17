const Content = require('../models/Content');
const { cacheHelper } = require('../config/redis');

// @desc    Get all content
// @route   GET /api/v1/content
// @access  Public
const getAllContent = async (req, res) => {
  try {
    const filters = req.query;

    // Try to get from cache first
    const cacheKey = `content:list:${JSON.stringify(filters)}`;
    const cached = await cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true
      });
    }

    const result = await Content.findAll(filters);

    // Cache for 5 minutes
    await cacheHelper.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المحتوى'
    });
  }
};

// @desc    Get single content
// @route   GET /api/v1/content/:id
// @access  Public
const getContent = async (req, res) => {
  try {
    const { id } = req.params;

    // Try cache first
    const cacheKey = `content:${id}`;
    let content = await cacheHelper.get(cacheKey);

    if (!content) {
      content = await Content.findById(id);

      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'المحتوى غير موجود'
        });
      }

      // Cache for 10 minutes
      await cacheHelper.set(cacheKey, content, 600);
    }

    // Increment view count (async, don't wait)
    if (content.status === 'published') {
      Content.incrementViewCount(id).catch(err =>
        console.error('View count increment error:', err)
      );
    }

    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المحتوى'
    });
  }
};

// @desc    Create new content
// @route   POST /api/v1/content
// @access  Private
const createContent = async (req, res) => {
  try {
    const contentData = {
      ...req.body,
      author_id: req.user.id
    };

    const content = await Content.create(contentData);

    // Add categories and tags if provided
    if (req.body.category_ids && req.body.category_ids.length > 0) {
      await Content.addCategories(content.id, req.body.category_ids);
    }

    if (req.body.tag_ids && req.body.tag_ids.length > 0) {
      await Content.addTags(content.id, req.body.tag_ids);
    }

    // Clear cache
    await cacheHelper.delPattern('content:list:*');

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المحتوى بنجاح',
      data: { content }
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المحتوى'
    });
  }
};

// @desc    Update content
// @route   PATCH /api/v1/content/:id
// @access  Private (Owner or Admin)
const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const content = await Content.update(id, updates);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'المحتوى غير موجود'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);
    await cacheHelper.delPattern('content:list:*');

    res.json({
      success: true,
      message: 'تم تحديث المحتوى بنجاح',
      data: { content }
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المحتوى'
    });
  }
};

// @desc    Publish content
// @route   POST /api/v1/content/:id/publish
// @access  Private (Owner or Admin)
const publishContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.updateStatus(id, 'published');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'المحتوى غير موجود'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);
    await cacheHelper.delPattern('content:list:*');

    // Award points for publishing
    const User = require('../models/User');
    await User.updateReputation(content.author_id, 50);

    res.json({
      success: true,
      message: 'تم نشر المحتوى بنجاح',
      data: { content }
    });
  } catch (error) {
    console.error('Publish content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في نشر المحتوى'
    });
  }
};

// @desc    Archive content
// @route   POST /api/v1/content/:id/archive
// @access  Private (Owner or Admin)
const archiveContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.updateStatus(id, 'archived');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'المحتوى غير موجود'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);
    await cacheHelper.delPattern('content:list:*');

    res.json({
      success: true,
      message: 'تم أرشفة المحتوى بنجاح',
      data: { content }
    });
  } catch (error) {
    console.error('Archive content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في أرشفة المحتوى'
    });
  }
};

// @desc    Delete content
// @route   DELETE /api/v1/content/:id
// @access  Private (Owner or Admin)
const deleteContent = async (req, res) => {
  try {
    const { id } = req.params;

    const content = await Content.delete(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'المحتوى غير موجود'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);
    await cacheHelper.delPattern('content:list:*');

    res.json({
      success: true,
      message: 'تم حذف المحتوى بنجاح'
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المحتوى'
    });
  }
};

// @desc    Like content
// @route   POST /api/v1/content/:id/like
// @access  Private
const likeContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Content.like(id, userId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'تم الإعجاب مسبقاً'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);

    // Award points to content author
    const content = await Content.findById(id, false);
    const User = require('../models/User');
    await User.updateReputation(content.author_id, 2);

    res.json({
      success: true,
      message: 'تم الإعجاب بالمحتوى'
    });
  } catch (error) {
    console.error('Like content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الإعجاب بالمحتوى'
    });
  }
};

// @desc    Unlike content
// @route   DELETE /api/v1/content/:id/like
// @access  Private
const unlikeContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Content.unlike(id, userId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم الإعجاب مسبقاً'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);

    res.json({
      success: true,
      message: 'تم إلغاء الإعجاب بالمحتوى'
    });
  } catch (error) {
    console.error('Unlike content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الإعجاب'
    });
  }
};

// @desc    Bookmark content
// @route   POST /api/v1/content/:id/bookmark
// @access  Private
const bookmarkContent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Content.bookmark(id, userId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'تم الحفظ مسبقاً'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);

    // Award points to content author
    const content = await Content.findById(id, false);
    const User = require('../models/User');
    await User.updateReputation(content.author_id, 3);

    res.json({
      success: true,
      message: 'تم حفظ المحتوى'
    });
  } catch (error) {
    console.error('Bookmark content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حفظ المحتوى'
    });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/v1/content/:id/bookmark
// @access  Private
const removeBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Content.removeBookmark(id, userId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم الحفظ مسبقاً'
      });
    }

    // Clear cache
    await cacheHelper.del(`content:${id}`);

    res.json({
      success: true,
      message: 'تم إلغاء الحفظ'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الحفظ'
    });
  }
};

// @desc    Get trending content
// @route   GET /api/v1/content/trending
// @access  Public
const getTrendingContent = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Try cache first
    const cacheKey = `content:trending:${limit}`;
    let content = await cacheHelper.get(cacheKey);

    if (!content) {
      content = await Content.getTrending(limit);
      // Cache for 1 hour
      await cacheHelper.set(cacheKey, content, 3600);
    }

    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('Get trending content error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المحتوى الرائج'
    });
  }
};

module.exports = {
  getAllContent,
  getContent,
  createContent,
  updateContent,
  publishContent,
  archiveContent,
  deleteContent,
  likeContent,
  unlikeContent,
  bookmarkContent,
  removeBookmark,
  getTrendingContent
};
