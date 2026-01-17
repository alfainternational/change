const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const config = require('./config');
const { connectRedis } = require('./config/redis');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler, initializeErrorHandlers } = require('./utils/errorHandler');

// Initialize error handlers
initializeErrorHandlers();

// Initialize Express app
const app = express();

// Connect to Redis
connectRedis();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: config.cors.credentials
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
app.use(logger.middleware);
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: config.rateLimit.standardHeaders,
  legacyHeaders: config.rateLimit.legacyHeaders,
  message: {
    success: false,
    message: 'تم تجاوز عدد الطلبات المسموح به. الرجاء المحاولة لاحقاً'
  }
});

app.use('/api/', limiter);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');
const learningPathRoutes = require('./routes/learningPathRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const reputationRoutes = require('./routes/reputationRoutes');

app.use(`${config.server.apiVersion}/auth`, authRoutes);
app.use(`${config.server.apiVersion}/content`, contentRoutes);
app.use(`${config.server.apiVersion}/learning-paths`, learningPathRoutes);
app.use(`${config.server.apiVersion}/discussions`, discussionRoutes);
app.use(`${config.server.apiVersion}/reputation`, reputationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'مرحباً بك في منصة المعرفة التسويقية',
    version: '1.0.0',
    documentation: '/api/v1/docs'
  });
});

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = config.server.port;

const server = app.listen(PORT, () => {
  logger.info(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   🚀 Knowledge Platform API Server                              ║
║                                                                  ║
║   Environment: ${config.server.env.padEnd(20)}                               ║
║   Port: ${PORT.toString().padEnd(20)}                                         ║
║   API Base: ${config.server.apiVersion.padEnd(20)}                             ║
║                                                                  ║
║   📊 Health: http://localhost:${PORT}/health                     ║
║   📚 Docs: http://localhost:${PORT}${config.server.apiVersion}/docs    ║
║                                                                  ║
║   🔌 Active Routes:                                              ║
║      • /api/v1/auth            (Authentication)                 ║
║      • /api/v1/content         (Content Management)             ║
║      • /api/v1/learning-paths  (Learning System)                ║
║      • /api/v1/discussions     (Forums & Q&A)                   ║
║      • /api/v1/reputation      (Gamification)                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    // Close database connections
    const { closePool } = require('./config/database');
    await closePool();

    // Close Redis connection
    const { closeRedis } = require('./config/redis');
    await closeRedis();

    logger.info('All connections closed. Exiting...');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
