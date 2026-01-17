const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const { cacheHelper } = require('../config/redis');

// Verify JWT token and authenticate user
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح - الرجاء تسجيل الدخول'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Check if token is blacklisted (logged out)
    const isBlacklisted = await cacheHelper.exists(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'الجلسة منتهية - الرجاء تسجيل الدخول مجدداً'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Check if user exists and is active
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'الحساب معطّل أو محذوف'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'رمز المصادقة غير صالح'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'انتهت صلاحية الجلسة - الرجاء تسجيل الدخول مجدداً'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ في المصادقة'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.userId);

      if (user && user.status === 'active') {
        req.user = user;
        req.token = token;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح - الرجاء تسجيل الدخول'
      });
    }

    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح - ليس لديك الصلاحيات المطلوبة'
      });
    }

    next();
  };
};

// Check if user is the owner of the resource
const checkOwnership = (resourceIdParam = 'id', resourceType = 'content') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const userId = req.user.id;

      // Admin can access everything
      if (req.user.user_type === 'admin' || req.user.user_type === 'moderator') {
        return next();
      }

      // Check ownership based on resource type
      let isOwner = false;

      if (resourceType === 'content') {
        const { query } = require('../config/database');
        const result = await query(
          'SELECT author_id FROM content WHERE id = $1',
          [resourceId]
        );
        isOwner = result.rows[0]?.author_id === userId;
      } else if (resourceType === 'discussion') {
        const { query } = require('../config/database');
        const result = await query(
          'SELECT author_id FROM discussions WHERE id = $1',
          [resourceId]
        );
        isOwner = result.rows[0]?.author_id === userId;
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'غير مصرح - لا يمكنك التعديل على هذا المورد'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الصلاحيات'
      });
    }
  };
};

// Check if email is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: 'الرجاء تأكيد البريد الإلكتروني أولاً'
    });
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
  requireEmailVerification
};
