const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    apiVersion: '/api/v1'
  },

  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'knowledge_platform',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
  },

  // Redis Configuration
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  // Email Configuration
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    },
    from: process.env.EMAIL_FROM || 'noreply@knowledge-platform.com'
  },

  // File Upload Configuration
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    path: process.env.UPLOAD_PATH || './uploads'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false
  },

  // Pagination
  pagination: {
    defaultPage: 1,
    defaultLimit: 20,
    maxLimit: 100
  },

  // Security
  security: {
    bcryptRounds: 12,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    cookieMaxAge: 24 * 60 * 60 * 1000 // 24 hours
  },

  // Frontend URL
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // Reputation System
  reputation: {
    points: {
      createContent: 10,
      publishContent: 50,
      contentLiked: 2,
      contentBookmarked: 3,
      createDiscussion: 5,
      replyDiscussion: 3,
      bestAnswer: 25,
      completedLesson: 10,
      completedPath: 100,
      passedAssessment: 20,
      dailyLogin: 1
    },
    levels: [
      { level: 1, minPoints: 0, title: 'مبتدئ' },
      { level: 2, minPoints: 100, title: 'متحمس' },
      { level: 3, minPoints: 500, title: 'نشط' },
      { level: 4, minPoints: 1500, title: 'خبير' },
      { level: 5, minPoints: 5000, title: 'محترف' },
      { level: 6, minPoints: 15000, title: 'قائد' },
      { level: 7, minPoints: 50000, title: 'أسطورة' }
    ]
  }
};
