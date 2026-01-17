const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticate, optionalAuth, authorize, checkOwnership } = require('../middlewares/auth');
const { validate, contentSchemas } = require('../middlewares/validation');

// Public routes
router.get(
  '/',
  validate(contentSchemas.query, 'query'),
  contentController.getAllContent
);

router.get(
  '/trending',
  contentController.getTrendingContent
);

router.get(
  '/:id',
  optionalAuth,
  contentController.getContent
);

// Protected routes - require authentication
router.post(
  '/',
  authenticate,
  authorize('contributor', 'expert', 'admin'),
  validate(contentSchemas.create),
  contentController.createContent
);

router.patch(
  '/:id',
  authenticate,
  checkOwnership('id', 'content'),
  validate(contentSchemas.update),
  contentController.updateContent
);

router.post(
  '/:id/publish',
  authenticate,
  checkOwnership('id', 'content'),
  contentController.publishContent
);

router.post(
  '/:id/archive',
  authenticate,
  checkOwnership('id', 'content'),
  contentController.archiveContent
);

router.delete(
  '/:id',
  authenticate,
  checkOwnership('id', 'content'),
  contentController.deleteContent
);

// Interaction routes
router.post(
  '/:id/like',
  authenticate,
  contentController.likeContent
);

router.delete(
  '/:id/like',
  authenticate,
  contentController.unlikeContent
);

router.post(
  '/:id/bookmark',
  authenticate,
  contentController.bookmarkContent
);

router.delete(
  '/:id/bookmark',
  authenticate,
  contentController.removeBookmark
);

module.exports = router;
