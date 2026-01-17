const express = require('express');
const router = express.Router();
const {
  getUserLogs,
  getUserSummary,
  getBreakdown,
  getUserBadges,
  getAllBadges,
  getLeaderboard,
  updateLeaderboardCache,
  awardPointsManually,
  checkBadges,
  awardDailyLogin
} = require('../controllers/reputationController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');
const Joi = require('joi');

// Public routes
router.get('/badges', getAllBadges);
router.get('/leaderboard', getLeaderboard);
router.get('/users/:userId/summary', getUserSummary);
router.get('/users/:userId/breakdown', getBreakdown);
router.get('/users/:userId/badges', getUserBadges);

// Protected routes
router.get('/users/:userId/logs', authenticate, getUserLogs);

router.post('/daily-login', authenticate, awardDailyLogin);

// Admin routes
router.post(
  '/admin/update-leaderboard',
  authenticate,
  authorize(['admin']),
  updateLeaderboardCache
);

router.post(
  '/admin/award-points',
  authenticate,
  authorize(['admin']),
  validate({
    body: Joi.object({
      userId: Joi.string().uuid().required(),
      actionType: Joi.string().required(),
      points: Joi.number().integer().required(),
      referenceType: Joi.string().optional(),
      referenceId: Joi.string().uuid().optional(),
      description: Joi.string().optional()
    })
  }),
  awardPointsManually
);

router.post(
  '/admin/check-badges/:userId',
  authenticate,
  authorize(['admin']),
  checkBadges
);

module.exports = router;
