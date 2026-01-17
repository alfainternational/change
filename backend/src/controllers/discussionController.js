const Discussion = require('../models/Discussion');
const Reputation = require('../models/Reputation');
const { cacheHelper } = require('../config/redis');
const config = require('../config');

// @desc    Get all discussions
// @route   GET /api/v1/discussions
// @access  Public
const getAllDiscussions = async (req, res) => {
  try {
    const filters = req.query;

    const cacheKey = `discussions:list:${JSON.stringify(filters)}`;
    const cached = await cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true
      });
    }

    const result = await Discussion.findAll(filters);
    await cacheHelper.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المناقشات'
    });
  }
};

// @desc    Get single discussion with replies
// @route   GET /api/v1/discussions/:id
// @access  Public
const getDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `discussion:${id}`;
    let discussion = await cacheHelper.get(cacheKey);

    if (!discussion) {
      discussion = await Discussion.findById(id);

      if (!discussion) {
        return res.status(404).json({
          success: false,
          message: 'المناقشة غير موجودة'
        });
      }

      await cacheHelper.set(cacheKey, discussion, 600);
    }

    // Get replies
    const replies = await Discussion.getReplies(id);

    // Increment view count (don't await to not block response)
    Discussion.incrementViews(id).catch(err => console.error('View count error:', err));

    res.json({
      success: true,
      data: {
        discussion,
        replies
      }
    });
  } catch (error) {
    console.error('Get discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المناقشة'
    });
  }
};

// @desc    Create new discussion
// @route   POST /api/v1/discussions
// @access  Private
const createDiscussion = async (req, res) => {
  try {
    const discussionData = {
      ...req.body,
      author_id: req.user.id
    };

    const discussion = await Discussion.create(discussionData);

    await cacheHelper.delPattern('discussions:list:*');

    // Award points
    await Reputation.awardPoints(
      req.user.id,
      'create_discussion',
      config.reputation.points.createDiscussion,
      {
        referenceType: 'discussion',
        referenceId: discussion.id,
        description: 'إنشاء مناقشة'
      }
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المناقشة بنجاح',
      data: { discussion }
    });
  } catch (error) {
    console.error('Create discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المناقشة'
    });
  }
};

// @desc    Update discussion
// @route   PATCH /api/v1/discussions/:id
// @access  Private (Owner or Moderator/Admin)
const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const discussion = await Discussion.update(id, updates);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'المناقشة غير موجودة'
      });
    }

    await cacheHelper.del(`discussion:${id}`);
    await cacheHelper.delPattern('discussions:list:*');

    res.json({
      success: true,
      message: 'تم تحديث المناقشة بنجاح',
      data: { discussion }
    });
  } catch (error) {
    console.error('Update discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المناقشة'
    });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/v1/discussions/:id
// @access  Private (Owner or Moderator/Admin)
const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.delete(id);

    if (!discussion) {
      return res.status(404).json({
        success: false,
        message: 'المناقشة غير موجودة'
      });
    }

    await cacheHelper.del(`discussion:${id}`);
    await cacheHelper.delPattern('discussions:list:*');

    res.json({
      success: true,
      message: 'تم حذف المناقشة بنجاح'
    });
  } catch (error) {
    console.error('Delete discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المناقشة'
    });
  }
};

// @desc    Create reply to discussion
// @route   POST /api/v1/discussions/:id/replies
// @access  Private
const createReply = async (req, res) => {
  try {
    const { id } = req.params;
    const replyData = {
      discussion_id: id,
      author_id: req.user.id,
      content: req.body.content,
      parent_reply_id: req.body.parent_reply_id || null
    };

    const reply = await Discussion.createReply(replyData);

    await cacheHelper.del(`discussion:${id}`);

    // Award points
    await Reputation.awardPoints(
      req.user.id,
      'create_reply',
      config.reputation.points.createReply,
      {
        referenceType: 'discussion_reply',
        referenceId: reply.id,
        description: 'الرد على مناقشة'
      }
    );

    res.status(201).json({
      success: true,
      message: 'تم إضافة الرد بنجاح',
      data: { reply }
    });
  } catch (error) {
    console.error('Create reply error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة الرد'
    });
  }
};

// @desc    Update reply
// @route   PATCH /api/v1/discussions/replies/:id
// @access  Private (Owner or Moderator/Admin)
const updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const reply = await Discussion.updateReply(id, updates);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'الرد غير موجود'
      });
    }

    await cacheHelper.del(`discussion:${reply.discussion_id}`);

    res.json({
      success: true,
      message: 'تم تحديث الرد بنجاح',
      data: { reply }
    });
  } catch (error) {
    console.error('Update reply error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الرد'
    });
  }
};

// @desc    Delete reply
// @route   DELETE /api/v1/discussions/replies/:id
// @access  Private (Owner or Moderator/Admin)
const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;

    const reply = await Discussion.deleteReply(id);

    if (!reply) {
      return res.status(404).json({
        success: false,
        message: 'الرد غير موجود'
      });
    }

    await cacheHelper.del(`discussion:${reply.discussion_id}`);

    res.json({
      success: true,
      message: 'تم حذف الرد بنجاح'
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف الرد'
    });
  }
};

// @desc    Like discussion
// @route   POST /api/v1/discussions/:id/like
// @access  Private
const likeDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Discussion.like(id, userId);

    await cacheHelper.del(`discussion:${id}`);

    // Award points to discussion author
    const discussion = await Discussion.findById(id, false);
    if (discussion && discussion.author_id !== userId) {
      await Reputation.awardPoints(
        discussion.author_id,
        'discussion_liked',
        config.reputation.points.contentLiked,
        {
          referenceType: 'discussion',
          referenceId: id,
          description: 'الإعجاب بمناقشة'
        }
      );
    }

    res.json({
      success: true,
      message: result.liked ? 'تم الإعجاب بالمناقشة' : 'تم إلغاء الإعجاب',
      data: { liked: result.liked }
    });
  } catch (error) {
    console.error('Like discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الإعجاب'
    });
  }
};

// @desc    Like reply
// @route   POST /api/v1/discussions/replies/:id/like
// @access  Private
const likeReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Discussion.likeReply(id, userId);

    // Award points to reply author
    const reply = await Discussion.getReplyById(id);
    if (reply && reply.author_id !== userId) {
      await Reputation.awardPoints(
        reply.author_id,
        'reply_liked',
        config.reputation.points.contentLiked,
        {
          referenceType: 'discussion_reply',
          referenceId: id,
          description: 'الإعجاب برد'
        }
      );
    }

    await cacheHelper.del(`discussion:${reply.discussion_id}`);

    res.json({
      success: true,
      message: result.liked ? 'تم الإعجاب بالرد' : 'تم إلغاء الإعجاب',
      data: { liked: result.liked }
    });
  } catch (error) {
    console.error('Like reply error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في الإعجاب'
    });
  }
};

// @desc    Mark reply as best answer
// @route   POST /api/v1/discussions/:id/best-answer/:replyId
// @access  Private (Discussion Owner)
const markBestAnswer = async (req, res) => {
  try {
    const { id, replyId } = req.params;

    const result = await Discussion.markBestAnswer(id, replyId);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: 'فشل تحديد الإجابة الأفضل'
      });
    }

    await cacheHelper.del(`discussion:${id}`);

    // Award points to reply author
    const reply = await Discussion.getReplyById(replyId);
    if (reply) {
      await Reputation.awardPoints(
        reply.author_id,
        'best_answer',
        config.reputation.points.bestAnswer,
        {
          referenceType: 'discussion_reply',
          referenceId: replyId,
          description: 'تحديد إجابة أفضل'
        }
      );
    }

    res.json({
      success: true,
      message: 'تم تحديد الإجابة الأفضل بنجاح'
    });
  } catch (error) {
    console.error('Mark best answer error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديد الإجابة الأفضل'
    });
  }
};

// @desc    Pin discussion
// @route   POST /api/v1/discussions/:id/pin
// @access  Private (Moderator/Admin)
const pinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    await Discussion.pin(id);
    await cacheHelper.del(`discussion:${id}`);
    await cacheHelper.delPattern('discussions:list:*');

    res.json({
      success: true,
      message: 'تم تثبيت المناقشة'
    });
  } catch (error) {
    console.error('Pin discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تثبيت المناقشة'
    });
  }
};

// @desc    Lock discussion
// @route   POST /api/v1/discussions/:id/lock
// @access  Private (Moderator/Admin)
const lockDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    await Discussion.lock(id);
    await cacheHelper.del(`discussion:${id}`);

    res.json({
      success: true,
      message: 'تم قفل المناقشة'
    });
  } catch (error) {
    console.error('Lock discussion error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في قفل المناقشة'
    });
  }
};

// @desc    Get user's discussions
// @route   GET /api/v1/users/:userId/discussions
// @access  Public
const getUserDiscussions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const discussions = await Discussion.findAll({
      author_id: userId,
      limit,
      offset
    });

    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    console.error('Get user discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب مناقشات المستخدم'
    });
  }
};

// @desc    Get trending discussions
// @route   GET /api/v1/discussions/trending
// @access  Public
const getTrendingDiscussions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const cacheKey = `discussions:trending:${limit}`;
    let discussions = await cacheHelper.get(cacheKey);

    if (!discussions) {
      discussions = await Discussion.getTrending(limit);
      await cacheHelper.set(cacheKey, discussions, 600);
    }

    res.json({
      success: true,
      data: discussions
    });
  } catch (error) {
    console.error('Get trending discussions error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المناقشات الرائجة'
    });
  }
};

module.exports = {
  getAllDiscussions,
  getDiscussion,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
  createReply,
  updateReply,
  deleteReply,
  likeDiscussion,
  likeReply,
  markBestAnswer,
  pinDiscussion,
  lockDiscussion,
  getUserDiscussions,
  getTrendingDiscussions
};
