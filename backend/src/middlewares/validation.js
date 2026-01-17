const Joi = require('joi');

// Generic validation middleware
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'خطأ في البيانات المدخلة',
        errors
      });
    }

    // Replace request data with validated and sanitized data
    req[property] = value;
    next();
  };
};

// Validation schemas for User
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'البريد الإلكتروني غير صالح',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
    username: Joi.string().alphanum().min(3).max(30).required().messages({
      'string.alphanum': 'اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط',
      'string.min': 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'اسم المستخدم يجب أن لا يتجاوز 30 حرف',
      'any.required': 'اسم المستخدم مطلوب'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
      'any.required': 'كلمة المرور مطلوبة'
    }),
    full_name: Joi.string().min(3).max(100).required().messages({
      'string.min': 'الاسم الكامل يجب أن يكون 3 أحرف على الأقل',
      'string.max': 'الاسم الكامل يجب أن لا يتجاوز 100 حرف',
      'any.required': 'الاسم الكامل مطلوب'
    })
  }),

  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'البريد الإلكتروني غير صالح',
      'any.required': 'البريد الإلكتروني مطلوب'
    }),
    password: Joi.string().required().messages({
      'any.required': 'كلمة المرور مطلوبة'
    })
  }),

  update: Joi.object({
    full_name: Joi.string().min(3).max(100),
    bio: Joi.string().max(500).allow(''),
    avatar_url: Joi.string().uri().allow('')
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required().messages({
      'any.required': 'كلمة المرور الحالية مطلوبة'
    }),
    new_password: Joi.string().min(8).required().messages({
      'string.min': 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل',
      'any.required': 'كلمة المرور الجديدة مطلوبة'
    })
  })
};

// Validation schemas for Content
const contentSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(500).required().messages({
      'string.min': 'العنوان يجب أن يكون 5 أحرف على الأقل',
      'string.max': 'العنوان يجب أن لا يتجاوز 500 حرف',
      'any.required': 'العنوان مطلوب'
    }),
    slug: Joi.string().required(),
    content_type: Joi.string()
      .valid('article', 'lesson', 'course', 'case_study', 'template')
      .required(),
    content_body: Joi.object().required(),
    excerpt: Joi.string().max(500).allow(''),
    featured_image: Joi.string().uri().allow(''),
    difficulty_level: Joi.string()
      .valid('beginner', 'intermediate', 'advanced', 'expert')
      .default('beginner'),
    visibility: Joi.string()
      .valid('public', 'members', 'premium')
      .default('public'),
    category_ids: Joi.array().items(Joi.number()).default([]),
    tag_ids: Joi.array().items(Joi.number()).default([])
  }),

  update: Joi.object({
    title: Joi.string().min(5).max(500),
    slug: Joi.string(),
    content_body: Joi.object(),
    excerpt: Joi.string().max(500).allow(''),
    featured_image: Joi.string().uri().allow(''),
    difficulty_level: Joi.string()
      .valid('beginner', 'intermediate', 'advanced', 'expert'),
    visibility: Joi.string()
      .valid('public', 'members', 'premium'),
    reading_time: Joi.number().min(1),
    seo_meta: Joi.object()
  }),

  query: Joi.object({
    content_type: Joi.string()
      .valid('article', 'lesson', 'course', 'case_study', 'template'),
    status: Joi.string()
      .valid('draft', 'pending_review', 'published', 'archived'),
    difficulty_level: Joi.string()
      .valid('beginner', 'intermediate', 'advanced', 'expert'),
    author_id: Joi.string().uuid(),
    category_id: Joi.number(),
    tag_id: Joi.number(),
    search: Joi.string().max(100),
    limit: Joi.number().min(1).max(100).default(20),
    offset: Joi.number().min(0).default(0),
    sortBy: Joi.string()
      .valid('published_at', 'created_at', 'view_count', 'like_count', 'title')
      .default('published_at'),
    sortOrder: Joi.string()
      .valid('ASC', 'DESC')
      .default('DESC')
  })
};

// Validation schemas for Discussion
const discussionSchemas = {
  create: Joi.object({
    forum_id: Joi.number().required(),
    title: Joi.string().min(10).max(500).required().messages({
      'string.min': 'العنوان يجب أن يكون 10 أحرف على الأقل',
      'string.max': 'العنوان يجب أن لا يتجاوز 500 حرف',
      'any.required': 'العنوان مطلوب'
    }),
    content: Joi.string().min(20).required().messages({
      'string.min': 'المحتوى يجب أن يكون 20 حرف على الأقل',
      'any.required': 'المحتوى مطلوب'
    }),
    discussion_type: Joi.string()
      .valid('question', 'discussion', 'showcase', 'announcement')
      .default('discussion')
  }),

  reply: Joi.object({
    content: Joi.string().min(10).required().messages({
      'string.min': 'الرد يجب أن يكون 10 أحرف على الأقل',
      'any.required': 'محتوى الرد مطلوب'
    }),
    parent_reply_id: Joi.string().uuid().allow(null)
  }),

  update: Joi.object({
    title: Joi.string().min(10).max(500),
    content: Joi.string().min(20)
  })
};

// Validation schemas for Learning Path
const learningPathSchemas = {
  create: Joi.object({
    title: Joi.string().min(5).max(300).required(),
    slug: Joi.string().required(),
    description: Joi.string().max(2000),
    difficulty_level: Joi.string()
      .valid('beginner', 'intermediate', 'advanced', 'expert')
      .default('beginner'),
    estimated_hours: Joi.number().min(1),
    thumbnail_url: Joi.string().uri().allow('')
  }),

  enroll: Joi.object({
    path_id: Joi.string().uuid().required()
  }),

  progressUpdate: Joi.object({
    lesson_id: Joi.string().uuid().required(),
    completion_percentage: Joi.number().min(0).max(100).required(),
    time_spent_minutes: Joi.number().min(0).default(0),
    notes: Joi.string().max(1000).allow('')
  })
};

// Validation schemas for Review
const reviewSchemas = {
  create: Joi.object({
    content_id: Joi.string().uuid().required(),
    review_type: Joi.string()
      .valid('content', 'technical', 'language', 'seo')
      .default('content'),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .default('medium')
  }),

  addNote: Joi.object({
    note_type: Joi.string()
      .valid('issue', 'suggestion', 'approval', 'rejection')
      .required(),
    content: Joi.string().min(10).required(),
    line_reference: Joi.string().allow(''),
    severity: Joi.string()
      .valid('info', 'warning', 'error', 'critical')
      .default('info')
  }),

  updateStatus: Joi.object({
    status: Joi.string()
      .valid('pending', 'in_review', 'approved', 'rejected', 'revision_needed')
      .required()
  })
};

module.exports = {
  validate,
  userSchemas,
  contentSchemas,
  discussionSchemas,
  learningPathSchemas,
  reviewSchemas
};
