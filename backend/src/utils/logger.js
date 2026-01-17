const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Console format (colorized for development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaStr = '';
    if (Object.keys(meta).length > 0) {
      metaStr = '\n' + JSON.stringify(meta, null, 2);
    }
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'knowledge-platform' },
  transports: [
    // Write all logs with importance level of 'error' or less to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Write all logs with importance level of 'info' or less to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Write HTTP access logs
    new winston.transports.File({
      filename: path.join(logsDir, 'access.log'),
      level: 'http',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

// Create a stream object for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Helper functions for structured logging

/**
 * Log HTTP request
 */
logger.logRequest = (req, res, duration) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
};

/**
 * Log database query
 */
logger.logQuery = (query, params, duration) => {
  logger.debug('Database Query', {
    query: query.substring(0, 200),
    params,
    duration: `${duration}ms`
  });
};

/**
 * Log authentication event
 */
logger.logAuth = (event, userId, details = {}) => {
  logger.info('Authentication Event', {
    event,
    userId,
    ...details
  });
};

/**
 * Log security event
 */
logger.logSecurity = (event, details = {}) => {
  logger.warn('Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Log error with context
 */
logger.logError = (error, context = {}) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

/**
 * Log business event
 */
logger.logBusiness = (event, data = {}) => {
  logger.info('Business Event', {
    event,
    ...data
  });
};

/**
 * Log performance metric
 */
logger.logPerformance = (operation, duration, details = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger.log(level, 'Performance Metric', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

/**
 * Log cache event
 */
logger.logCache = (action, key, hit = null) => {
  logger.debug('Cache Event', {
    action,
    key,
    hit: hit !== null ? (hit ? 'HIT' : 'MISS') : 'N/A'
  });
};

/**
 * Log email event
 */
logger.logEmail = (event, recipient, details = {}) => {
  logger.info('Email Event', {
    event,
    recipient,
    ...details
  });
};

/**
 * Log file operation
 */
logger.logFile = (operation, filename, details = {}) => {
  logger.info('File Operation', {
    operation,
    filename,
    ...details
  });
};

/**
 * Log API call to external service
 */
logger.logExternalAPI = (service, endpoint, status, duration) => {
  logger.info('External API Call', {
    service,
    endpoint,
    status,
    duration: `${duration}ms`
  });
};

/**
 * Log job/task execution
 */
logger.logJob = (jobName, status, details = {}) => {
  logger.info('Job Execution', {
    job: jobName,
    status,
    ...details
  });
};

// Express middleware for request logging
logger.middleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });

  next();
};

// Error logging middleware
logger.errorMiddleware = (err, req, res, next) => {
  logger.logError(err, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  next(err);
};

module.exports = logger;
