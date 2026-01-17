const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { connectRedis } = require('./config/redis');

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
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
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

// API Routes
const authRoutes = require('./routes/authRoutes');
const contentRoutes = require('./routes/contentRoutes');

app.use(`${config.server.apiVersion}/auth`, authRoutes);
app.use(`${config.server.apiVersion}/content`, contentRoutes);

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
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);

  // Joi validation error
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في البيانات المدخلة',
      errors: err.details
    });
  }

  // Database error
  if (err.code && err.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      message: 'خطأ في قاعدة البيانات',
      error: config.server.env === 'development' ? err.message : undefined
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطأ في الخادم',
    error: config.server.env === 'development' ? err : undefined
  });
});

// Start server
const PORT = config.server.port;

const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🚀 Knowledge Platform API Server                        ║
║                                                            ║
║   Environment: ${config.server.env.padEnd(20)}                     ║
║   Port: ${PORT.toString().padEnd(20)}                               ║
║   API Base: ${config.server.apiVersion.padEnd(20)}                   ║
║                                                            ║
║   📊 Health Check: http://localhost:${PORT}/health         ║
║   📚 API Docs: http://localhost:${PORT}${config.server.apiVersion}/docs║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    // Close database connections
    const { closePool } = require('./config/database');
    await closePool();

    // Close Redis connection
    const { closeRedis } = require('./config/redis');
    await closeRedis();

    console.log('All connections closed. Exiting...');
    process.exit(0);
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

module.exports = app;
