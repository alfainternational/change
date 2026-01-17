const logger = require('./logger');

/**
 * Custom Application Error class
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation Error class
 */
class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }
}

/**
 * Authentication Error class
 */
class AuthenticationError extends AppError {
  constructor(message = 'غير مصرح. يرجى تسجيل الدخول') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization Error class
 */
class AuthorizationError extends AppError {
  constructor(message = 'غير مصرح لك بالوصول إلى هذا المورد') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/**
 * Not Found Error class
 */
class NotFoundError extends AppError {
  constructor(resource = 'المورد') {
    super(`${resource} غير موجود`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Conflict Error class
 */
class ConflictError extends AppError {
  constructor(message = 'تعارض في البيانات') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Rate Limit Error class
 */
class RateLimitError extends AppError {
  constructor(message = 'تم تجاوز حد الطلبات. يرجى المحاولة لاحقاً') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * Database Error class
 */
class DatabaseError extends AppError {
  constructor(message = 'خطأ في قاعدة البيانات') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

/**
 * External Service Error class
 */
class ExternalServiceError extends AppError {
  constructor(service, message = 'خطأ في الخدمة الخارجية') {
    super(`${service}: ${message}`, 502);
    this.name = 'ExternalServiceError';
  }
}

/**
 * Handle PostgreSQL errors
 */
function handlePostgresError(err) {
  let message = 'خطأ في قاعدة البيانات';
  let statusCode = 500;

  // Unique violation
  if (err.code === '23505') {
    const match = err.detail?.match(/Key \((.*?)\)=\((.*?)\)/);
    if (match) {
      const field = match[1];
      message = `${field} موجود بالفعل`;
    } else {
      message = 'البيانات موجودة بالفعل';
    }
    statusCode = 409;
  }

  // Foreign key violation
  if (err.code === '23503') {
    message = 'المورد المرتبط غير موجود';
    statusCode = 400;
  }

  // Not null violation
  if (err.code === '23502') {
    const field = err.column;
    message = `${field} مطلوب`;
    statusCode = 400;
  }

  // Check violation
  if (err.code === '23514') {
    message = 'البيانات غير صالحة';
    statusCode = 400;
  }

  return new AppError(message, statusCode);
}

/**
 * Handle JWT errors
 */
function handleJWTError(err) {
  if (err.name === 'JsonWebTokenError') {
    return new AuthenticationError('رمز المصادقة غير صالح');
  }

  if (err.name === 'TokenExpiredError') {
    return new AuthenticationError('انتهت صلاحية رمز المصادقة');
  }

  return new AuthenticationError();
}

/**
 * Handle Multer errors
 */
function handleMulterError(err) {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('حجم الملف كبير جداً');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return new ValidationError('عدد الملفات كبير جداً');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('حقل الملف غير متوقع');
  }

  return new ValidationError('خطأ في رفع الملف');
}

/**
 * Send error response in development
 */
function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
}

/**
 * Send error response in production
 */
function sendErrorProd(err, res) {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      success: false,
      status: err.status,
      message: err.message
    };

    // Include validation errors if present
    if (err.errors) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
  }
  // Programming or other unknown error: don't leak error details
  else {
    logger.logError(err, { type: 'UNHANDLED_ERROR' });

    res.status(500).json({
      success: false,
      status: 'error',
      message: 'حدث خطأ غير متوقع'
    });
  }
}

/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Handle specific error types
  if (err.code && err.code.startsWith('23')) {
    // PostgreSQL error
    err = handlePostgresError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    // JWT error
    err = handleJWTError(err);
  } else if (err.name === 'MulterError') {
    // Multer error
    err = handleMulterError(err);
  }

  // Log error
  logger.logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Send response
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
}

/**
 * Async error wrapper for async route handlers
 */
function catchAsync(fn) {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

/**
 * Handle unhandled promise rejections
 */
function handleUnhandledRejection() {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      reason: reason instanceof Error ? reason.message : reason,
      stack: reason instanceof Error ? reason.stack : undefined,
      promise
    });

    // In production, exit gracefully
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  });
}

/**
 * Handle uncaught exceptions
 */
function handleUncaughtException() {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack
    });

    // Exit immediately on uncaught exception
    process.exit(1);
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res, next) {
  next(new NotFoundError(`الرابط ${req.originalUrl} غير موجود`));
}

/**
 * Initialize error handlers
 */
function initializeErrorHandlers() {
  handleUncaughtException();
  handleUnhandledRejection();
}

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,

  // Error handlers
  errorHandler,
  notFoundHandler,
  catchAsync,

  // Initialization
  initializeErrorHandlers
};
