import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              عن المنصة
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              منصة المعرفة التسويقية هي مجتمع عربي متخصص في التسويق الرقمي،
              نوفر محتوى عالي الجودة ومسارات تعليمية شاملة لمساعدتك على النجاح.
            </p>
            <div className="flex gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-primary-100 dark:hover:bg-primary-900 transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              روابط سريعة
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/content"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  المحتوى
                </Link>
              </li>
              <li>
                <Link
                  to="/learning-paths"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  المسارات التعليمية
                </Link>
              </li>
              <li>
                <Link
                  to="/discussions"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  المناقشات
                </Link>
              </li>
              <li>
                <Link
                  to="/leaderboard"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  لوحة المتصدرين
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              الموارد
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  المدونة
                </Link>
              </li>
              <li>
                <Link
                  to="/help"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  المساعدة
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  الأسئلة الشائعة
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
              قانوني
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  سياسة الكوكيز
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 text-sm"
                >
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center md:text-right">
              © {currentYear} منصة المعرفة التسويقية. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                صُنع بـ ❤️ للمسوقين العرب
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
