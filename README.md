# 🚀 منصة المعرفة التسويقية | Arabic Marketing Knowledge Platform

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**منصة تعليمية ومجتمعية شاملة للمسوقين الرقميين العرب**

[المميزات](#-المميزات-الرئيسية) •
[التقنيات](#️-التقنيات-المستخدمة) •
[التثبيت](#-التثبيت-والإعداد) •
[الاستخدام](#-الاستخدام) •
[المساهمة](#-المساهمة)

</div>

---

## 📋 نظرة عامة

منصة المعرفة التسويقية هي مجتمع عربي احترافي يجمع بين التعليم والمحتوى المعرفي والنقاشات التفاعلية في مكان واحد. تم بناء المنصة خصيصاً للسوق العربي مع فهم عميق للتحديات والفرص المحلية.

### 🎯 الهدف

بناء أكبر وأقوى مجتمع معرفي تسويقي عربي في العالم، يمكّن المسوقين من التعلم والنمو والتواصل.

## ✨ المميزات الرئيسية

### 📚 المساحة التعليمية (Education Hub)
- مسارات تعليمية متكاملة للمبتدئين والمتقدمين
- دروس تطبيقية مرتبطة بأمثلة حقيقية من السوق العربي
- نظام تتبع التقدم والإنجازات
- شهادات إتمام معتمدة
- اختبارات تقييمية

### 📝 المدونة الاحترافية وقاعدة المعرفة
- مقالات تحليلية معمّقة
- دراسات حالة واقعية (Case Studies)
- قوالب وأدوات جاهزة للاستخدام
- محتوى محدث باستمرار
- نظام تقييم وتوصيات ذكية

### 💬 ساحات النقاش والمجتمع
- منتديات متخصصة حسب التخصص
- نظام أسئلة وأجوبة
- نظام سمعة ونقاط
- أوسمة وإنجازات
- توثيق الخبرات والحلول

### 🎓 نظام الحوكمة والجودة
- مراجعة محتوى احترافية
- معايير جودة صارمة
- فريق مراجعة متخصص
- تحديثات دورية للمحتوى

## 🏗️ البنية المعمارية

```
knowledge-platform/
├── backend/                 # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/         # التكوينات
│   │   ├── controllers/    # Controllers
│   │   ├── middlewares/    # Middlewares
│   │   ├── models/         # Database Models
│   │   ├── routes/         # API Routes
│   │   ├── services/       # Business Logic
│   │   ├── utils/          # Utilities
│   │   └── server.js       # Entry Point
│   ├── tests/              # Tests
│   └── package.json
│
├── frontend/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── pages/         # Page Components
│   │   ├── services/      # API Services
│   │   ├── store/         # Redux Store
│   │   ├── styles/        # Styles
│   │   ├── utils/         # Utilities
│   │   └── App.jsx        # Main App
│   └── package.json
│
├── database/              # Database
│   ├── migrations/       # SQL Migrations
│   └── seeds/            # Seed Data
│
├── docs/                 # Documentation
├── .github/              # GitHub Actions
├── docker-compose.yml    # Docker Compose
└── README.md
```

## 🛠️ التقنيات المستخدمة

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Authentication**: JWT
- **Validation**: Joi
- **Security**: Helmet, bcrypt

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Rich Text Editor**: TipTap

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Logging with Winston

## 📦 التثبيت والإعداد

### المتطلبات الأساسية

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 16
- Redis >= 7
- Docker & Docker Compose (اختياري)

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-username/knowledge-platform.git
cd knowledge-platform
```

### 2. إعداد Environment Variables

```bash
# نسخ ملف المثال
cp .env.example .env

# تعديل القيم حسب بيئتك
nano .env
```

### 3. التثبيت باستخدام Docker (موصى به)

```bash
# تشغيل جميع الخدمات
docker-compose up -d

# عرض اللوجات
docker-compose logs -f

# إيقاف الخدمات
docker-compose down
```

الخدمات المتاحة:
- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **pgAdmin**: http://localhost:5050

### 4. التثبيت اليدوي

#### Backend

```bash
cd backend

# تثبيت الحزم
npm install

# إنشاء قاعدة البيانات
createdb knowledge_platform

# تشغيل Migrations
psql -d knowledge_platform -f ../database/migrations/001_initial_schema.sql

# تشغيل السيرفر
npm run dev
```

#### Frontend

```bash
cd frontend

# تثبيت الحزم
npm install

# تشغيل التطبيق
npm run dev
```

## 🚀 الاستخدام

### تشغيل المشروع في وضع التطوير

```bash
# Backend
cd backend && npm run dev

# Frontend (في terminal آخر)
cd frontend && npm run dev
```

### البناء للإنتاج

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build
```

### تشغيل الاختبارات

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## 📚 API Documentation

### Authentication Endpoints

```
POST   /api/v1/auth/register     # تسجيل مستخدم جديد
POST   /api/v1/auth/login        # تسجيل الدخول
POST   /api/v1/auth/logout       # تسجيل الخروج
GET    /api/v1/auth/me           # بيانات المستخدم الحالي
PATCH  /api/v1/auth/me           # تحديث الملف الشخصي
```

### Content Endpoints

```
GET    /api/v1/content           # جميع المحتويات
GET    /api/v1/content/:id       # محتوى محدد
POST   /api/v1/content           # إنشاء محتوى جديد
PATCH  /api/v1/content/:id       # تحديث محتوى
DELETE /api/v1/content/:id       # حذف محتوى
POST   /api/v1/content/:id/like  # الإعجاب بمحتوى
```

## 🗄️ قاعدة البيانات

### الجداول الرئيسية

- **users**: معلومات المستخدمين
- **content**: المحتوى (مقالات، دروس، دراسات حالة)
- **learning_paths**: المسارات التعليمية
- **discussions**: النقاشات والمنتديات
- **reviews**: المراجعات والحوكمة
- **reputation_logs**: سجل النقاط والسمعة

## 🔒 الأمان

- **Authentication**: JWT tokens مع refresh tokens
- **Password Hashing**: bcrypt مع cost factor 12
- **Input Validation**: Joi validation على جميع المدخلات
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Content sanitization
- **CORS**: Configured properly
- **Rate Limiting**: حماية من DDoS
- **Helmet**: Security headers

## 🌍 التوطين (Localization)

المنصة مصممة بالكامل للغة العربية:
- **RTL Support**: دعم كامل للكتابة من اليمين لليسار
- **Arabic Fonts**: خط Cairo للعربية
- **Content**: جميع المحتوى بالعربية
- **UI/UX**: مصمم للمستخدم العربي

## 🤝 المساهمة

نرحب بمساهماتكم! لتقديم مساهمة:

1. Fork المشروع
2. أنشئ فرعاً للميزة (`git checkout -b feature/AmazingFeature`)
3. Commit تغييراتك (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص بموجب رخصة MIT.

## 👥 الفريق

- **المؤسس**: Knowledge Platform Team
- **Tech Stack**: Node.js, React, PostgreSQL, Redis

## 📞 التواصل

- **Website**: https://knowledge-platform.com
- **Email**: contact@knowledge-platform.com

---

<div align="center">

**صُنع بـ ❤️ للمجتمع العربي**

[الصفحة الرئيسية](https://knowledge-platform.com) •
[التوثيق](./docs) •
[المجتمع](https://community.knowledge-platform.com)

</div>
