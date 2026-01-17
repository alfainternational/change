-- Knowledge Platform Database Schema
-- PostgreSQL 16+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    user_type VARCHAR(50) CHECK (user_type IN ('learner', 'contributor', 'expert', 'moderator', 'admin')) DEFAULT 'learner',
    reputation_score INTEGER DEFAULT 0,
    status VARCHAR(50) CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')) DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- ============================================
-- CATEGORIES & TAGS
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    parent_id INTEGER REFERENCES categories(id),
    description TEXT,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);

-- ============================================
-- CONTENT MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    content_type VARCHAR(50) CHECK (content_type IN ('article', 'lesson', 'course', 'case_study', 'template')) NOT NULL,
    author_id UUID REFERENCES users(id) NOT NULL,
    content_body JSONB NOT NULL,
    excerpt TEXT,
    featured_image VARCHAR(500),
    status VARCHAR(50) CHECK (status IN ('draft', 'pending_review', 'published', 'archived')) DEFAULT 'draft',
    visibility VARCHAR(50) CHECK (visibility IN ('public', 'members', 'premium')) DEFAULT 'public',
    seo_meta JSONB,
    reading_time INTEGER,
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published ON content(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_views ON content(view_count DESC);

-- Full text search index
CREATE INDEX idx_content_search ON content USING gin(to_tsvector('arabic', title || ' ' || COALESCE(excerpt, '')));

-- Content Categories (Many-to-Many)
CREATE TABLE IF NOT EXISTS content_categories (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, category_id)
);

-- Content Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS content_tags (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (content_id, tag_id)
);

-- Content Likes
CREATE TABLE IF NOT EXISTS content_likes (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, user_id)
);

CREATE INDEX idx_content_likes_user ON content_likes(user_id);

-- Content Bookmarks
CREATE TABLE IF NOT EXISTS content_bookmarks (
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id, user_id)
);

CREATE INDEX idx_content_bookmarks_user ON content_bookmarks(user_id);

-- ============================================
-- LEARNING PATHS & EDUCATION
-- ============================================

CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES users(id),
    difficulty_level VARCHAR(50) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
    estimated_hours INTEGER,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    enrollment_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX idx_learning_paths_creator ON learning_paths(creator_id);

CREATE TABLE IF NOT EXISTS learning_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    unlock_criteria JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_modules_path ON learning_modules(path_id);

CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
    content_id UUID REFERENCES content(id),
    sort_order INTEGER NOT NULL,
    lesson_type VARCHAR(50) CHECK (lesson_type IN ('video', 'article', 'interactive', 'quiz', 'assignment')) DEFAULT 'article',
    duration_minutes INTEGER,
    resources JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lessons_module ON lessons(module_id);

-- User Enrollments
CREATE TABLE IF NOT EXISTS user_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_activity TIMESTAMP,
    UNIQUE(user_id, path_id)
);

CREATE INDEX idx_enrollments_user ON user_enrollments(user_id);
CREATE INDEX idx_enrollments_path ON user_enrollments(path_id);

-- Lesson Progress
CREATE TABLE IF NOT EXISTS lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
    completion_percentage INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    notes TEXT,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);

-- Assessments/Quizzes
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    instructions TEXT,
    passing_score INTEGER DEFAULT 70,
    time_limit_minutes INTEGER,
    questions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    answers JSONB NOT NULL,
    passed BOOLEAN,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_taken_minutes INTEGER
);

CREATE INDEX idx_assessment_results_user ON assessment_results(user_id);

-- ============================================
-- COMMUNITY & DISCUSSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS forums (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    parent_id INTEGER REFERENCES forums(id),
    category_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_private BOOLEAN DEFAULT FALSE,
    post_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forums_parent ON forums(parent_id);

CREATE TABLE IF NOT EXISTS discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    forum_id INTEGER REFERENCES forums(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    discussion_type VARCHAR(50) CHECK (discussion_type IN ('question', 'discussion', 'showcase', 'announcement')) DEFAULT 'discussion',
    status VARCHAR(50) CHECK (status IN ('open', 'closed', 'solved', 'pinned')) DEFAULT 'open',
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    best_answer_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discussions_forum ON discussions(forum_id);
CREATE INDEX idx_discussions_author ON discussions(author_id);
CREATE INDEX idx_discussions_activity ON discussions(last_activity DESC);
CREATE INDEX idx_discussions_status ON discussions(status);

-- Discussion Replies
CREATE TABLE IF NOT EXISTS discussion_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    discussion_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
    parent_reply_id UUID REFERENCES discussion_replies(id),
    author_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    is_best_answer BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_replies_discussion ON discussion_replies(discussion_id);
CREATE INDEX idx_replies_author ON discussion_replies(author_id);

-- ============================================
-- REPUTATION & GAMIFICATION
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    icon_url VARCHAR(500),
    badge_type VARCHAR(50) CHECK (badge_type IN ('bronze', 'silver', 'gold', 'platinum', 'special')) DEFAULT 'bronze',
    criteria JSONB NOT NULL,
    points_required INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 100,
    UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

-- Reputation Log
CREATE TABLE IF NOT EXISTS reputation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    points INTEGER NOT NULL,
    reference_type VARCHAR(100),
    reference_id UUID,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reputation_logs_user ON reputation_logs(user_id);
CREATE INDEX idx_reputation_logs_created ON reputation_logs(created_at DESC);

-- ============================================
-- REVIEW & MODERATION
-- ============================================

CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    submitter_id UUID REFERENCES users(id),
    reviewer_id UUID REFERENCES users(id),
    review_type VARCHAR(50) CHECK (review_type IN ('content', 'technical', 'language', 'seo')) DEFAULT 'content',
    status VARCHAR(50) CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'revision_needed')) DEFAULT 'pending',
    priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    deadline TIMESTAMP
);

CREATE INDEX idx_review_requests_content ON review_requests(content_id);
CREATE INDEX idx_review_requests_status ON review_requests(status);
CREATE INDEX idx_review_requests_reviewer ON review_requests(reviewer_id);

CREATE TABLE IF NOT EXISTS review_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_request_id UUID REFERENCES review_requests(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    note_type VARCHAR(50) CHECK (note_type IN ('issue', 'suggestion', 'approval', 'rejection')) NOT NULL,
    content TEXT NOT NULL,
    line_reference VARCHAR(100),
    severity VARCHAR(50) CHECK (severity IN ('info', 'warning', 'error', 'critical')) DEFAULT 'info',
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_notes_request ON review_notes(review_request_id);

-- Content Revisions (History)
CREATE TABLE IF NOT EXISTS content_revisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    editor_id UUID REFERENCES users(id),
    revision_number INTEGER NOT NULL,
    changes JSONB NOT NULL,
    change_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_revisions_content ON content_revisions(content_id, revision_number DESC);

-- ============================================
-- ANALYTICS
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    page_url TEXT,
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);

CREATE TABLE IF NOT EXISTS content_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID REFERENCES content(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_time_spent INTEGER,
    completion_rate DECIMAL(5,2),
    bounce_rate DECIMAL(5,2),
    shares INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    UNIQUE(content_id, date)
);

CREATE INDEX idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_date ON content_analytics(date DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussions_updated_at BEFORE UPDATE ON discussions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA SEEDING
-- ============================================

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('التسويق الرقمي', 'digital-marketing', 'كل ما يتعلق بالتسويق الرقمي', 1),
('السوشيال ميديا', 'social-media', 'استراتيجيات وتقنيات التسويق عبر السوشيال ميديا', 2),
('تحسين محركات البحث', 'seo', 'SEO وتحسين ظهور المواقع في محركات البحث', 3),
('الإعلانات المدفوعة', 'paid-ads', 'إعلانات جوجل وفيسبوك والمنصات الأخرى', 4),
('التسويق بالمحتوى', 'content-marketing', 'إنشاء وتوزيع المحتوى التسويقي', 5),
('التحليلات والبيانات', 'analytics', 'تحليل البيانات وقياس الأداء', 6),
('البريد الإلكتروني', 'email-marketing', 'Email Marketing والأتمتة التسويقية', 7),
('التجارة الإلكترونية', 'ecommerce', 'التسويق للمتاجر الإلكترونية', 8);

-- Insert default badges
INSERT INTO badges (name, slug, description, badge_type, criteria, points_required) VALUES
('مرحباً بك', 'welcome', 'أكمل إعداد الملف الشخصي', 'bronze', '{"action": "complete_profile"}', 0),
('أول محتوى', 'first-content', 'نشر أول محتوى', 'bronze', '{"action": "publish_content", "count": 1}', 50),
('كاتب نشط', 'active-writer', 'نشر 10 محتويات', 'silver', '{"action": "publish_content", "count": 10}', 500),
('خبير محتوى', 'content-expert', 'نشر 50 محتوى', 'gold', '{"action": "publish_content", "count": 50}', 2500),
('متعلم متحمس', 'eager-learner', 'إكمال أول مسار تعليمي', 'bronze', '{"action": "complete_path", "count": 1}', 100),
('عضو نشط', 'active-member', 'المشاركة في 20 نقاش', 'silver', '{"action": "participate_discussion", "count": 20}', 300),
('مساعد المجتمع', 'community-helper', 'الحصول على 10 إجابات مفضلة', 'gold', '{"action": "best_answers", "count": 10}', 250),
('الأسطورة', 'legend', 'الوصول إلى 10,000 نقطة سمعة', 'platinum', '{"reputation": 10000}', 10000);

-- Insert default forums
INSERT INTO forums (name, slug, description, sort_order) VALUES
('الأسئلة العامة', 'general-questions', 'أسئلة عامة حول التسويق', 1),
('نقاشات متقدمة', 'advanced-discussions', 'نقاشات معمقة للخبراء', 2),
('عرض الأعمال', 'showcase', 'شارك مشاريعك ونجاحاتك', 3),
('طلب المساعدة', 'help', 'اطلب المساعدة من المجتمع', 4);

-- Create admin user (password: Admin@123456 - CHANGE IN PRODUCTION)
INSERT INTO users (email, username, password_hash, full_name, user_type, email_verified)
VALUES (
    'admin@knowledge-platform.com',
    'admin',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIbYvqpfyG',
    'مدير النظام',
    'admin',
    TRUE
);

COMMIT;
