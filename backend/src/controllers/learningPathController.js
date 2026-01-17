const LearningPath = require('../models/LearningPath');
const Reputation = require('../models/Reputation');
const { cacheHelper } = require('../config/redis');
const config = require('../config');

// @desc    Get all learning paths
// @route   GET /api/v1/learning-paths
// @access  Public
const getAllLearningPaths = async (req, res) => {
  try {
    const filters = req.query;

    const cacheKey = `learning_paths:list:${JSON.stringify(filters)}`;
    const cached = await cacheHelper.get(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true
      });
    }

    const result = await LearningPath.findAll(filters);
    await cacheHelper.set(cacheKey, result, 300);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get all learning paths error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المسارات التعليمية'
    });
  }
};

// @desc    Get single learning path
// @route   GET /api/v1/learning-paths/:id
// @access  Public
const getLearningPath = async (req, res) => {
  try {
    const { id } = req.params;

    const cacheKey = `learning_path:${id}`;
    let path = await cacheHelper.get(cacheKey);

    if (!path) {
      path = await LearningPath.findById(id);

      if (!path) {
        return res.status(404).json({
          success: false,
          message: 'المسار التعليمي غير موجود'
        });
      }

      await cacheHelper.set(cacheKey, path, 600);
    }

    // Get modules
    const modules = await LearningPath.getModules(id);

    // Get lessons for each module
    for (let module of modules) {
      module.lessons = await LearningPath.getLessons(module.id);
    }

    res.json({
      success: true,
      data: {
        path,
        modules
      }
    });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المسار التعليمي'
    });
  }
};

// @desc    Create new learning path
// @route   POST /api/v1/learning-paths
// @access  Private (Contributor, Expert, Admin)
const createLearningPath = async (req, res) => {
  try {
    const pathData = {
      ...req.body,
      creator_id: req.user.id
    };

    const path = await LearningPath.create(pathData);

    await cacheHelper.delPattern('learning_paths:list:*');

    // Award points
    await Reputation.awardPoints(
      req.user.id,
      'create_learning_path',
      config.reputation.points.createContent,
      {
        referenceType: 'learning_path',
        referenceId: path.id,
        description: 'إنشاء مسار تعليمي'
      }
    );

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المسار التعليمي بنجاح',
      data: { path }
    });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المسار التعليمي'
    });
  }
};

// @desc    Update learning path
// @route   PATCH /api/v1/learning-paths/:id
// @access  Private (Owner or Admin)
const updateLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const path = await LearningPath.update(id, updates);

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'المسار التعليمي غير موجود'
      });
    }

    await cacheHelper.del(`learning_path:${id}`);
    await cacheHelper.delPattern('learning_paths:list:*');

    res.json({
      success: true,
      message: 'تم تحديث المسار التعليمي بنجاح',
      data: { path }
    });
  } catch (error) {
    console.error('Update learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المسار التعليمي'
    });
  }
};

// @desc    Delete learning path
// @route   DELETE /api/v1/learning-paths/:id
// @access  Private (Owner or Admin)
const deleteLearningPath = async (req, res) => {
  try {
    const { id } = req.params;

    const path = await LearningPath.delete(id);

    if (!path) {
      return res.status(404).json({
        success: false,
        message: 'المسار التعليمي غير موجود'
      });
    }

    await cacheHelper.del(`learning_path:${id}`);
    await cacheHelper.delPattern('learning_paths:list:*');

    res.json({
      success: true,
      message: 'تم حذف المسار التعليمي بنجاح'
    });
  } catch (error) {
    console.error('Delete learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المسار التعليمي'
    });
  }
};

// @desc    Enroll in learning path
// @route   POST /api/v1/learning-paths/:id/enroll
// @access  Private
const enrollInPath = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already enrolled
    const existing = await LearningPath.getEnrollment(userId, id);

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'أنت مسجل بالفعل في هذا المسار'
      });
    }

    const enrollment = await LearningPath.enroll(userId, id);

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'فشل التسجيل في المسار'
      });
    }

    res.json({
      success: true,
      message: 'تم التسجيل في المسار بنجاح',
      data: { enrollment }
    });
  } catch (error) {
    console.error('Enroll in path error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التسجيل في المسار'
    });
  }
};

// @desc    Get user progress in learning path
// @route   GET /api/v1/learning-paths/:id/progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const progress = await LearningPath.getUserProgress(userId, id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'لم تسجل في هذا المسار بعد'
      });
    }

    res.json({
      success: true,
      data: { progress }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التقدم'
    });
  }
};

// @desc    Complete lesson
// @route   POST /api/v1/lessons/:id/complete
// @access  Private
const completeLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const progress = await LearningPath.completeLesson(userId, id);

    // Award points
    await Reputation.awardPoints(
      userId,
      'complete_lesson',
      config.reputation.points.completedLesson,
      {
        referenceType: 'lesson',
        referenceId: id,
        description: 'إكمال درس'
      }
    );

    res.json({
      success: true,
      message: 'تم إكمال الدرس بنجاح',
      data: { progress }
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إكمال الدرس'
    });
  }
};

// @desc    Update lesson progress
// @route   POST /api/v1/lessons/:id/progress
// @access  Private
const updateLessonProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const data = req.body;

    const progress = await LearningPath.updateLessonProgress(userId, id, data);

    res.json({
      success: true,
      message: 'تم تحديث التقدم بنجاح',
      data: { progress }
    });
  } catch (error) {
    console.error('Update lesson progress error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث التقدم'
    });
  }
};

module.exports = {
  getAllLearningPaths,
  getLearningPath,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  enrollInPath,
  getProgress,
  completeLesson,
  updateLessonProgress
};
