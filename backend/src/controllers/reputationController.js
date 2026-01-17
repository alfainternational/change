const Reputation = require('../models/Reputation');
const { cacheHelper } = require('../config/redis');

// @desc    Get user reputation logs
// @route   GET /api/v1/users/:userId/reputation/logs
// @access  Private (Own data) or Admin
const getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check if user is requesting their own data or is admin
    if (req.user.id !== userId && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بعرض هذه البيانات'
      });
    }

    const logs = await Reputation.getUserLogs(userId, limit, offset);

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    console.error('Get user logs error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب سجل النقاط'
    });
  }
};

// @desc    Get user reputation summary
// @route   GET /api/v1/users/:userId/reputation/summary
// @access  Public
const getUserSummary = async (req, res) => {
  try {
    const { userId } = req.params;

    const cacheKey = `reputation:summary:${userId}`;
    let summary = await cacheHelper.get(cacheKey);

    if (!summary) {
      summary = await Reputation.getSummary(userId);
      await cacheHelper.set(cacheKey, summary, 300);
    }

    // Get user level
    const level = Reputation.getUserLevel(summary.current_score);

    res.json({
      success: true,
      data: {
        summary,
        level
      }
    });
  } catch (error) {
    console.error('Get user summary error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب ملخص النقاط'
    });
  }
};

// @desc    Get reputation breakdown by action type
// @route   GET /api/v1/users/:userId/reputation/breakdown
// @access  Public
const getBreakdown = async (req, res) => {
  try {
    const { userId } = req.params;

    const cacheKey = `reputation:breakdown:${userId}`;
    let breakdown = await cacheHelper.get(cacheKey);

    if (!breakdown) {
      breakdown = await Reputation.getBreakdown(userId);
      await cacheHelper.set(cacheKey, breakdown, 600);
    }

    res.json({
      success: true,
      data: { breakdown }
    });
  } catch (error) {
    console.error('Get breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب تفاصيل النقاط'
    });
  }
};

// @desc    Get user badges
// @route   GET /api/v1/users/:userId/badges
// @access  Public
const getUserBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const cacheKey = `user:badges:${userId}`;
    let badges = await cacheHelper.get(cacheKey);

    if (!badges) {
      badges = await Reputation.getUserBadges(userId);
      await cacheHelper.set(cacheKey, badges, 600);
    }

    res.json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    console.error('Get user badges error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الشارات'
    });
  }
};

// @desc    Get all available badges
// @route   GET /api/v1/badges
// @access  Public
const getAllBadges = async (req, res) => {
  try {
    const cacheKey = 'badges:all';
    let badges = await cacheHelper.get(cacheKey);

    if (!badges) {
      badges = await Reputation.getAllBadges();
      await cacheHelper.set(cacheKey, badges, 3600);
    }

    res.json({
      success: true,
      data: { badges }
    });
  } catch (error) {
    console.error('Get all badges error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الشارات'
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/v1/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const {
      timeframe = 'all_time', // daily, weekly, monthly, all_time
      category = null,
      limit = 100
    } = req.query;

    const cacheKey = `leaderboard:${timeframe}:${category}:${limit}`;
    let leaderboard = await cacheHelper.get(cacheKey);

    if (!leaderboard) {
      leaderboard = await Reputation.getLeaderboard(timeframe, category, limit);
      await cacheHelper.set(cacheKey, leaderboard, 600);
    }

    res.json({
      success: true,
      data: { leaderboard }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب لوحة المتصدرين'
    });
  }
};

// @desc    Update leaderboard cache (scheduled job)
// @route   POST /api/v1/admin/reputation/update-leaderboard
// @access  Private (Admin only)
const updateLeaderboardCache = async (req, res) => {
  try {
    await Reputation.updateLeaderboardCache();

    // Clear all leaderboard caches
    await cacheHelper.delPattern('leaderboard:*');

    res.json({
      success: true,
      message: 'تم تحديث لوحة المتصدرين بنجاح'
    });
  } catch (error) {
    console.error('Update leaderboard cache error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث لوحة المتصدرين'
    });
  }
};

// @desc    Award points manually (admin only)
// @route   POST /api/v1/admin/reputation/award-points
// @access  Private (Admin only)
const awardPointsManually = async (req, res) => {
  try {
    const {
      userId,
      actionType,
      points,
      referenceType,
      referenceId,
      description
    } = req.body;

    const result = await Reputation.awardPoints(
      userId,
      actionType,
      points,
      { referenceType, referenceId, description }
    );

    // Clear user reputation caches
    await cacheHelper.delPattern(`reputation:*:${userId}`);
    await cacheHelper.delPattern(`user:badges:${userId}`);

    res.json({
      success: true,
      message: 'تم منح النقاط بنجاح',
      data: result
    });
  } catch (error) {
    console.error('Award points manually error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في منح النقاط'
    });
  }
};

// @desc    Check and award badges (can be called manually or by cron)
// @route   POST /api/v1/admin/reputation/check-badges/:userId
// @access  Private (Admin only)
const checkBadges = async (req, res) => {
  try {
    const { userId } = req.params;

    const newBadges = await Reputation.checkAndAwardBadges(userId);

    await cacheHelper.del(`user:badges:${userId}`);

    res.json({
      success: true,
      message: 'تم فحص الشارات',
      data: { newBadges }
    });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في فحص الشارات'
    });
  }
};

// @desc    Award daily login bonus
// @route   POST /api/v1/reputation/daily-login
// @access  Private
const awardDailyLogin = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Reputation.awardDailyLogin(userId);

    if (result) {
      await cacheHelper.delPattern(`reputation:*:${userId}`);

      res.json({
        success: true,
        message: 'تم منح مكافأة الدخول اليومي',
        data: result
      });
    } else {
      res.json({
        success: true,
        message: 'لقد حصلت بالفعل على مكافأة الدخول اليوم',
        data: null
      });
    }
  } catch (error) {
    console.error('Award daily login error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في منح مكافأة الدخول اليومي'
    });
  }
};

module.exports = {
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
};
