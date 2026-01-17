-- ===================================
-- منصة المعرفة التسويقية - Seed Data
-- ===================================

-- 1. Insert Categories (الفئات)
INSERT INTO categories (name, slug, description, icon) VALUES
('التسويق الرقمي', 'digital-marketing', 'استراتيجيات وتقنيات التسويق الرقمي الحديثة', '📱'),
('تحسين محركات البحث', 'seo', 'تحسين ظهور موقعك في محركات البحث', '🔍'),
('التسويق عبر وسائل التواصل', 'social-media-marketing', 'استراتيجيات التسويق على منصات التواصل الاجتماعي', '📲'),
('التسويق بالمحتوى', 'content-marketing', 'إنشاء وتوزيع محتوى قيم لجذب الجمهور', '✍️'),
('التحليلات والبيانات', 'analytics', 'تحليل البيانات وقياس الأداء التسويقي', '📊'),
('البريد الإلكتروني', 'email-marketing', 'استراتيجيات التسويق عبر البريد الإلكتروني', '📧'),
('الإعلانات المدفوعة', 'paid-advertising', 'إعلانات Google وFacebook وغيرها', '💰'),
('التجارة الإلكترونية', 'ecommerce', 'بناء وتسويق المتاجر الإلكترونية', '🛒');

-- 2. Insert Tags (الوسوم)
INSERT INTO tags (name, slug) VALUES
('مبتدئ', 'beginner'),
('متقدم', 'advanced'),
('حالة دراسية', 'case-study'),
('أدوات', 'tools'),
('استراتيجية', 'strategy'),
('تحليلات', 'analytics'),
('تصميم', 'design'),
('كتابة', 'copywriting'),
('فيديو', 'video'),
('بودكاست', 'podcast'),
('انفوجرافيك', 'infographic'),
('دليل شامل', 'complete-guide'),
('نصائح سريعة', 'quick-tips'),
('اتجاهات', 'trends'),
('أفضل الممارسات', 'best-practices');

-- 3. Insert Forums (المنتديات)
INSERT INTO forums (name, slug, description, icon, display_order) VALUES
('أسئلة عامة', 'general-questions', 'اسأل أي سؤال عن التسويق الرقمي', '❓', 1),
('استراتيجيات التسويق', 'marketing-strategies', 'مناقشة استراتيجيات التسويق المختلفة', '🎯', 2),
('الأدوات والتقنيات', 'tools-tech', 'مناقشة الأدوات والتقنيات التسويقية', '🔧', 3),
('حالات دراسية', 'case-studies', 'شارك قصص نجاحك وتجاربك', '📈', 4),
('فرص العمل', 'job-opportunities', 'فرص عمل ومشاريع في مجال التسويق', '💼', 5),
('اعرض مشروعك', 'showcase', 'اعرض مشاريعك وحملاتك التسويقية', '🎨', 6);

-- 4. Insert Badges (الشارات)
INSERT INTO badges (name, description, icon, criteria, points_required, badge_type, color) VALUES
('مرحباً بك', 'أكمل ملفك الشخصي', '👋', '{"action": "complete_profile"}', 0, 'welcome', '#10b981'),
('أول محتوى', 'انشر أول محتوى لك', '✍️', '{"action": "publish_content", "count": 1}', 50, 'content', '#3b82f6'),
('كاتب نشط', 'انشر 10 محتويات', '📝', '{"action": "publish_content", "count": 10}', 500, 'content', '#8b5cf6'),
('كاتب محترف', 'انشر 50 محتوى', '🏆', '{"action": "publish_content", "count": 50}', 2500, 'content', '#f59e0b'),
('متعلم متحمس', 'أكمل 3 مسارات تعليمية', '🎓', '{"action": "complete_path", "count": 3}', 300, 'learning', '#06b6d4'),
('خبير تعليم', 'أكمل 10 مسارات تعليمية', '📚', '{"action": "complete_path", "count": 10}', 1000, 'learning', '#a855f7'),
('مناقش نشط', 'شارك في 50 مناقشة', '💬', '{"action": "participate_discussion", "count": 50}', 500, 'community', '#ec4899'),
('مساعد المجتمع', 'احصل على 20 إجابة أفضل', '⭐', '{"action": "best_answer", "count": 20}', 1000, 'community', '#f97316'),
('محبوب', 'احصل على 100 إعجاب', '❤️', '{"action": "receive_likes", "count": 100}', 200, 'social', '#ef4444'),
('مؤثر', 'احصل على 1000 إعجاب', '🌟', '{"action": "receive_likes", "count": 1000}', 2000, 'social', '#facc15');

-- 5. Insert Sample Users (مستخدمون تجريبيون)
-- Password for all: "password123" (hashed with bcrypt)
INSERT INTO users (email, username, password_hash, full_name, user_type, bio, avatar_url, status, email_verified) VALUES
('admin@platform.com', 'admin', '$2b$10$YourHashedPasswordHere', 'المدير العام', 'admin', 'مدير منصة المعرفة التسويقية', 'https://ui-avatars.com/api/?name=Admin&background=667eea&color=fff&size=200', 'active', TRUE),
('expert@platform.com', 'marketing_expert', '$2b$10$YourHashedPasswordHere', 'خبير التسويق', 'expert', 'خبير في التسويق الرقمي مع 10 سنوات خبرة', 'https://ui-avatars.com/api/?name=Expert&background=10b981&color=fff&size=200', 'active', TRUE),
('member@platform.com', 'active_member', '$2b$10$YourHashedPasswordHere', 'عضو نشط', 'member', 'متعلم متحمس في مجال التسويق', 'https://ui-avatars.com/api/?name=Member&background=3b82f6&color=fff&size=200', 'active', TRUE);

-- 6. Insert Sample Content (محتوى تجريبي)
INSERT INTO content (title, slug, content_type, content_body, excerpt, featured_image, author_id, difficulty_level, reading_time, status, visibility, published_at)
SELECT
  'دليل شامل للتسويق عبر وسائل التواصل الاجتماعي',
  'complete-guide-social-media-marketing',
  'article',
  '{"blocks": [{"type": "paragraph", "data": {"text": "التسويق عبر وسائل التواصل الاجتماعي..."}}]}'::jsonb,
  'تعلم كيفية بناء استراتيجية تسويق فعالة على منصات التواصل الاجتماعي',
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800',
  u.id,
  'beginner',
  15,
  'published',
  'public',
  NOW() - INTERVAL '5 days'
FROM users u WHERE u.username = 'marketing_expert';

INSERT INTO content (title, slug, content_type, content_body, excerpt, featured_image, author_id, difficulty_level, reading_time, status, visibility, published_at)
SELECT
  'أساسيات تحسين محركات البحث SEO',
  'seo-basics',
  'article',
  '{"blocks": [{"type": "paragraph", "data": {"text": "تحسين محركات البحث..."}}]}'::jsonb,
  'تعرف على أساسيات SEO وكيفية تحسين موقعك لمحركات البحث',
  'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800',
  u.id,
  'beginner',
  12,
  'published',
  'public',
  NOW() - INTERVAL '3 days'
FROM users u WHERE u.username = 'marketing_expert';

-- 7. Insert Learning Paths (مسارات تعليمية)
INSERT INTO learning_paths (title, slug, description, difficulty_level, estimated_hours, creator_id, is_active)
SELECT
  'مسار التسويق الرقمي للمبتدئين',
  'digital-marketing-beginner',
  'مسار شامل يغطي أساسيات التسويق الرقمي من الصفر',
  'beginner',
  40,
  u.id,
  TRUE
FROM users u WHERE u.username = 'marketing_expert';

INSERT INTO learning_paths (title, slug, description, difficulty_level, estimated_hours, creator_id, is_active)
SELECT
  'احتراف التسويق عبر وسائل التواصل',
  'social-media-mastery',
  'تعلم استراتيجيات متقدمة للتسويق على منصات التواصل',
  'intermediate',
  30,
  u.id,
  TRUE
FROM users u WHERE u.username = 'marketing_expert';

-- 8. Insert Path Modules (وحدات المسار)
INSERT INTO path_modules (path_id, title, description, order_index)
SELECT
  lp.id,
  'مقدمة في التسويق الرقمي',
  'فهم أساسيات التسويق الرقمي والقنوات المختلفة',
  1
FROM learning_paths lp WHERE lp.slug = 'digital-marketing-beginner';

INSERT INTO path_modules (path_id, title, description, order_index)
SELECT
  lp.id,
  'استراتيجية المحتوى',
  'كيفية إنشاء وتخطيط محتوى فعال',
  2
FROM learning_paths lp WHERE lp.slug = 'digital-marketing-beginner';

-- 9. Insert Discussions (مناقشات تجريبية)
INSERT INTO discussions (forum_id, author_id, title, content, discussion_type)
SELECT
  f.id,
  u.id,
  'ما هي أفضل أدوات التسويق المجانية؟',
  'أبحث عن أدوات تسويق مجانية أو منخفضة التكلفة للمبتدئين',
  'question'
FROM forums f, users u
WHERE f.slug = 'tools-tech' AND u.username = 'active_member';

INSERT INTO discussions (forum_id, author_id, title, content, discussion_type)
SELECT
  f.id,
  u.id,
  'كيف زادت مبيعاتي بنسبة 300% باستخدام التسويق بالمحتوى',
  'أشارك معكم قصة نجاحي في زيادة المبيعات...',
  'showcase'
FROM forums f, users u
WHERE f.slug = 'case-studies' AND u.username = 'marketing_expert';

-- 10. Update Statistics
UPDATE categories SET content_count = (
  SELECT COUNT(*) FROM content_categories cc WHERE cc.category_id = categories.id
);

UPDATE forums SET discussion_count = (
  SELECT COUNT(*) FROM discussions d WHERE d.forum_id = forums.id
);

-- Success Message
SELECT 'تم إضافة البيانات التجريبية بنجاح! ✅' AS message;
