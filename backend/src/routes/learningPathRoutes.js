const express = require('express');
const router = express.Router();
const {
  getAllLearningPaths,
  getLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  enrollInPath,
  getProgress,
  completeLesson,
  updateLessonProgress
} = require('../controllers/learningPathController');
const { authenticate, authorize, checkOwnership } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const { learningPathSchemas } = require('../middlewares/validation');

// Public routes
router.get('/', getAllLearningPaths);
router.get('/:id', getLearningPath);

// Protected routes - require authentication
router.post(
  '/',
  authenticate,
  authorize(['contributor', 'expert', 'admin']),
  validate(learningPathSchemas.create),
  createLearningPath
);

router.patch(
  '/:id',
  authenticate,
  validate(learningPathSchemas.update),
  async (req, res, next) => {
    // Check if user is owner or admin
    const isOwner = await checkOwnership('learning_paths', req.params.id, req.user.id);
    if (!isOwner && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل هذا المسار'
      });
    }
    next();
  },
  updateLearningPath
);

router.delete(
  '/:id',
  authenticate,
  async (req, res, next) => {
    const isOwner = await checkOwnership('learning_paths', req.params.id, req.user.id);
    if (!isOwner && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بحذف هذا المسار'
      });
    }
    next();
  },
  deleteLearningPath
);

// Enrollment routes
router.post('/:id/enroll', authenticate, enrollInPath);
router.get('/:id/progress', authenticate, getProgress);

// Lesson progress routes
router.post('/lessons/:id/complete', authenticate, completeLesson);
router.post(
  '/lessons/:id/progress',
  authenticate,
  validate(learningPathSchemas.updateProgress),
  updateLessonProgress
);

module.exports = router;
