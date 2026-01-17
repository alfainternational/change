const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const config = require('../config');

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.initializeDirectories();
  }

  // Initialize upload directories
  async initializeDirectories() {
    const dirs = [
      path.join(this.uploadDir, 'images'),
      path.join(this.uploadDir, 'images/avatars'),
      path.join(this.uploadDir, 'images/content'),
      path.join(this.uploadDir, 'images/thumbnails'),
      path.join(this.uploadDir, 'documents'),
      path.join(this.uploadDir, 'temp')
    ];

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
      }
    }
  }

  // Multer storage configuration
  getStorage(subFolder = '') {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, subFolder);
        try {
          await fs.mkdir(uploadPath, { recursive: true });
          cb(null, uploadPath);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9]/g, '-')
          .substring(0, 50);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
      }
    });
  }

  // File filter for images
  imageFilter(req, file, cb) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع صورة (JPEG, PNG, GIF, WebP)'), false);
    }
  }

  // File filter for documents
  documentFilter(req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مدعوم. يرجى رفع مستند (PDF, Word, Excel)'), false);
    }
  }

  // Avatar upload middleware
  avatarUpload() {
    return multer({
      storage: this.getStorage('images/avatars'),
      fileFilter: this.imageFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      }
    }).single('avatar');
  }

  // Content image upload middleware
  contentImageUpload() {
    return multer({
      storage: this.getStorage('images/content'),
      fileFilter: this.imageFilter,
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
      }
    }).single('image');
  }

  // Multiple images upload middleware
  multipleImagesUpload(maxCount = 10) {
    return multer({
      storage: this.getStorage('images/content'),
      fileFilter: this.imageFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: maxCount
      }
    }).array('images', maxCount);
  }

  // Document upload middleware
  documentUpload() {
    return multer({
      storage: this.getStorage('documents'),
      fileFilter: this.documentFilter,
      limits: {
        fileSize: 20 * 1024 * 1024 // 20MB
      }
    }).single('document');
  }

  // Process and optimize image
  async processImage(inputPath, outputPath, options = {}) {
    const {
      width = null,
      height = null,
      quality = 80,
      format = 'jpeg'
    } = options;

    try {
      let image = sharp(inputPath);

      // Resize if dimensions provided
      if (width || height) {
        image = image.resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }

      // Convert and compress
      if (format === 'jpeg') {
        image = image.jpeg({ quality, progressive: true });
      } else if (format === 'png') {
        image = image.png({ quality, progressive: true });
      } else if (format === 'webp') {
        image = image.webp({ quality });
      }

      await image.toFile(outputPath);
      return outputPath;
    } catch (error) {
      console.error('Image processing error:', error);
      throw error;
    }
  }

  // Generate thumbnail
  async generateThumbnail(inputPath, outputPath, size = 300) {
    try {
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 75, progressive: true })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      throw error;
    }
  }

  // Generate multiple sizes
  async generateMultipleSizes(inputPath, baseName) {
    const sizes = {
      thumbnail: 150,
      small: 300,
      medium: 600,
      large: 1200
    };

    const results = {};

    for (const [sizeName, width] of Object.entries(sizes)) {
      const outputPath = path.join(
        path.dirname(inputPath),
        `${baseName}-${sizeName}${path.extname(inputPath)}`
      );

      try {
        await this.processImage(inputPath, outputPath, { width });
        results[sizeName] = outputPath;
      } catch (error) {
        console.error(`Failed to generate ${sizeName}:`, error);
      }
    }

    return results;
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      console.log('File deleted:', filePath);
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  // Delete multiple files
  async deleteFiles(filePaths) {
    const results = await Promise.allSettled(
      filePaths.map(filePath => this.deleteFile(filePath))
    );

    return results.map((result, index) => ({
      path: filePaths[index],
      success: result.status === 'fulfilled' && result.value
    }));
  }

  // Get file URL
  getFileUrl(filePath) {
    if (!filePath) return null;

    // Remove uploads directory prefix if present
    const relativePath = filePath.replace(this.uploadDir, '').replace(/^\//, '');

    return `${config.app.backendUrl}/uploads/${relativePath}`;
  }

  // Validate file size
  validateFileSize(fileSize, maxSize) {
    if (fileSize > maxSize) {
      throw new Error(`حجم الملف كبير جداً. الحد الأقصى ${maxSize / (1024 * 1024)}MB`);
    }
    return true;
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      const ext = path.extname(filePath);

      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        extension: ext,
        mimeType: this.getMimeType(ext)
      };
    } catch (error) {
      console.error('Get file info error:', error);
      throw error;
    }
  }

  // Get MIME type from extension
  getMimeType(ext) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };

    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
  }

  // Clean up old temporary files
  async cleanupTempFiles(olderThanHours = 24) {
    const tempDir = path.join(this.uploadDir, 'temp');
    const now = Date.now();
    const maxAge = olderThanHours * 60 * 60 * 1000;

    try {
      const files = await fs.readdir(tempDir);

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);

        if (now - stats.mtime.getTime() > maxAge) {
          await this.deleteFile(filePath);
        }
      }

      console.log('Temporary files cleanup completed');
    } catch (error) {
      console.error('Cleanup temp files error:', error);
    }
  }
}

// Export singleton instance
module.exports = new FileUploadService();
