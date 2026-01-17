import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  FaHome,
  FaSearch,
  FaArrowRight,
  FaCompass,
  FaBook,
  FaComments
} from 'react-icons/fa';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const quickLinks = [
    {
      icon: <FaHome />,
      label: 'الصفحة الرئيسية',
      path: '/',
      color: 'blue'
    },
    {
      icon: <FaBook />,
      label: 'المحتوى',
      path: '/content',
      color: 'green'
    },
    {
      icon: <FaComments />,
      label: 'المناقشات',
      path: '/discussions',
      color: 'purple'
    },
    {
      icon: <FaCompass />,
      label: 'المسارات التعليمية',
      path: '/learning',
      color: 'orange'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <Card className="overflow-hidden">
          <div className="p-8 md:p-12 text-center">
            {/* 404 Animation */}
            <div className="mb-8 relative">
              <div className="text-[150px] md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-600 to-primary-800 dark:from-primary-300 dark:via-primary-500 dark:to-primary-700 leading-none animate-pulse">
                404
              </div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl md:text-8xl opacity-20 dark:opacity-10">
                🔍
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                عذراً، الصفحة غير موجودة
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-2">
                الصفحة التي تبحث عنها قد تكون قد تم نقلها أو حذفها أو ربما لم تكن موجودة من الأساس.
              </p>
              <p className="text-md text-gray-500 dark:text-gray-500">
                دعنا نساعدك في العثور على ما تبحث عنه
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Button
                onClick={() => navigate('/')}
                variant="primary"
                size="lg"
                className="flex items-center gap-2 px-8"
              >
                <FaHome />
                <span>العودة للرئيسية</span>
              </Button>

              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-8"
              >
                <FaArrowRight />
                <span>الرجوع للخلف</span>
              </Button>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن محتوى، مناقشات، أو مواضيع..."
                  className="w-full px-6 py-4 pr-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      navigate(`/search?q=${encodeURIComponent(e.target.value.trim())}`);
                    }
                  }}
                />
                <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                أو تصفح هذه الأقسام
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.path}
                    className="group"
                  >
                    <div className={`p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-${link.color}-500 dark:hover:border-${link.color}-500 transition-all hover:shadow-lg hover:scale-105`}>
                      <div className={`text-4xl mb-3 text-${link.color}-500 group-hover:scale-110 transition-transform`}>
                        {link.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {link.label}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Additional Help */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                لا يزال لا يمكنك العثور على ما تبحث عنه؟
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/help"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  مركز المساعدة
                </Link>
                <span className="hidden sm:inline text-gray-400">•</span>
                <Link
                  to="/contact"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  اتصل بنا
                </Link>
                <span className="hidden sm:inline text-gray-400">•</span>
                <Link
                  to="/faq"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  الأسئلة الشائعة
                </Link>
              </div>
            </div>

            {/* Fun Facts or Tips */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                💡 <strong>هل تعلم؟</strong> خطأ 404 هو رمز حالة HTTP الذي يعني "غير موجود".
                الرقم 404 قد يكون مشتقاً من رقم الغرفة في CERN حيث كانت خوادم الويب الأولى!
              </p>
            </div>

            {/* User-specific suggestions */}
            {user && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  مقترحات لك
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-sm font-medium"
                  >
                    لوحة التحكم
                  </Link>
                  <Link
                    to={`/profile/${user.id}`}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-sm font-medium"
                  >
                    ملفي الشخصي
                  </Link>
                  <Link
                    to="/bookmarks"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-sm font-medium"
                  >
                    المفضلة
                  </Link>
                  <Link
                    to="/notifications"
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors text-sm font-medium"
                  >
                    الإشعارات
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            خطأ 404 - الصفحة غير موجودة
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
