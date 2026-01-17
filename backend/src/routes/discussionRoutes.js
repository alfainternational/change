const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/discussionController');
const { authenticate, authorize, checkOwnership } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { discussionSchemas } = require('../middlewares/validation');

// Public routes
router.get('/trending', getTrendingDiscussions);
router.get('/', getAllDiscussions);
router.get('/:id', getDiscussion);

// User discussions
router.get('/users/:userId/discussions', getUserDiscussions);

// Protected routes - require authentication
router.post(
  '/',
  authenticate,
  validate(discussionSchemas.create),
  createDiscussion
);

router.patch(
  '/:id',
  authenticate,
  validate(discussionSchemas.update),
  async (req, res, next) => {
    // Check if user is owner, moderator, or admin
    const isOwner = await checkOwnership('discussions', req.params.id, req.user.id);
    const isModerator = ['moderator', 'admin'].includes(req.user.user_type);

    if (!isOwner && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذه المناقشة'
      });
    }
    next();
  },
  updateDiscussion
);

router.delete(
  '/:id',
  authenticate,
  async (req, res, next) => {
    const isOwner = await checkOwnership('discussions', req.params.id, req.user.id);
    const isModerator = ['moderator', 'admin'].includes(req.user.user_type);

    if (!isOwner && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذه المناقشة'
      });
    }
    next();
  },
  deleteDiscussion
);

// Reply routes
router.post(
  '/:id/replies',
  authenticate,
  validate(discussionSchemas.createReply),
  createReply
);

router.patch(
  '/replies/:id',
  authenticate,
  validate(discussionSchemas.updateReply),
  async (req, res, next) => {
    const isOwner = await checkOwnership('discussion_replies', req.params.id, req.user.id);
    const isModerator = ['moderator', 'admin'].includes(req.user.user_type);

    if (!isOwner && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا الرد'
      });
    }
    next();
  },
  updateReply
);

router.delete(
  '/replies/:id',
  authenticate,
  async (req, res, next) => {
    const isOwner = await checkOwnership('discussion_replies', req.params.id, req.user.id);
    const isModerator = ['moderator', 'admin'].includes(req.user.user_type);

    if (!isOwner && !isModerator) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا الرد'
      });
    }
    next();
  },
  deleteReply
);

// Like routes
router.post('/:id/like', authenticate, likeDiscussion);
router.post('/replies/:id/like', authenticate, likeReply);

// Best answer route (only discussion owner)
router.post(
  '/:id/best-answer/:replyId',
  authenticate,
  async (req, res, next) => {
    const isOwner = await checkOwnership('discussions', req.params.id, req.user.id);

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: 'فقط صاحب المناقشة يمكنه تحديد الإجابة الأفضل'
      });
    }
    next();
  },
  markBestAnswer
);

// Moderation routes (moderator/admin only)
router.post(
  '/:id/pin',
  authenticate,
  authorize(['moderator', 'admin']),
  pinDiscussion
);

router.post(
  '/:id/lock',
  authenticate,
  authorize(['moderator', 'admin']),
  lockDiscussion
);

module.exports = router;
