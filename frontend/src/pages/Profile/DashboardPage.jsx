import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  FaTrophy,
  FaFileAlt,
  FaComments,
  FaHeart,
  FaEye,
  FaBell,
  FaChartLine,
  FaStar,
  FaBookmark,
  FaUserFriends,
  FaMedal,
  FaFire,
  FaClock,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notification);
  const { theme } = useSelector((state) => state.theme);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate('/login');
      return;
    }

    // Simulate fetching dashboard data
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockData = {
          stats: {
            reputation: 1250,
            content_count: 24,
            discussions_count: 67,
            likes_received: 342,
            views_total: 12456,
            bookmarks: 89,
            followers: 156
          },
          recentContent: [
            {
              id: 1,
              title: 'دليل شامل للتسويق عبر السوشيال ميديا',
              category: 'تسويق رقمي',
              likes: 45,
              views: 1234,
              status: 'published',
              created_at: '2025-01-10'
            },
            {
              id: 2,
              title: 'كيفية بناء استراتيجية محتوى ناجحة',
              category: 'تسويق بالمحتوى',
              likes: 67,
              views: 2341,
              status: 'published',
              created_at: '2025-01-05'
            },
            {
              id: 3,
              title: 'أساسيات SEO للمبتدئين',
              category: 'تحسين محركات البحث',
              likes: 23,
              views: 567,
              status: 'draft',
              created_at: '2025-01-15'
            }
          ],
          recentDiscussions: [
            {
              id: 1,
              title: 'ما هي أفضل أدوات التسويق الرقمي؟',
              replies_count: 23,
              views: 456,
              created_at: '2025-01-12'
            },
            {
              id: 2,
              title: 'كيف أبدأ في التسويق بالمحتوى؟',
              replies_count: 15,
              views: 234,
              created_at: '2025-01-08'
            }
          ],
          learningPaths: [
            {
              id: 1,
              title: 'مسار التسويق الرقمي',
              progress: 75,
              total_courses: 8,
              completed_courses: 6,
              status: 'in_progress'
            },
            {
              id: 2,
              title: 'مسار التسويق بالمحتوى',
              progress: 40,
              total_courses: 10,
              completed_courses: 4,
              status: 'in_progress'
            },
            {
              id: 3,
              title: 'مسار السوشيال ميديا',
              progress: 100,
              total_courses: 6,
              completed_courses: 6,
              status: 'completed'
            }
          ],
          recentNotifications: [
            {
              id: 1,
              type: 'like',
              message: 'أعجب أحمد بمقالك "دليل شامل للتسويق"',
              read: false,
              created_at: '2025-01-15T10:30:00'
            },
            {
              id: 2,
              type: 'comment',
              message: 'علق محمد على نقاشك "أفضل أدوات التسويق"',
              read: false,
              created_at: '2025-01-15T09:15:00'
            },
            {
              id: 3,
              type: 'badge',
              message: 'حصلت على شارة "كاتب نشط"',
              read: true,
              created_at: '2025-01-14T16:45:00'
            },
            {
              id: 4,
              type: 'follow',
              message: 'بدأ سارة بمتابعتك',
              read: true,
              created_at: '2025-01-14T14:20:00'
            }
          ],
          achievements: [
            { id: 1, name: 'كاتب نشط', icon: '✍️', unlocked: true },
            { id: 2, name: 'مشارك ممتاز', icon: '💬', unlocked: true },
            { id: 3, name: 'مساعد', icon: '🤝', unlocked: true },
            { id: 4, name: 'خبير تسويق', icon: '📊', unlocked: false }
          ]
        };

        setDashboardData(mockData);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { stats, recentContent, recentDiscussions, learningPaths, recentNotifications, achievements } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            مرحباً، {user?.name || 'المستخدم'} 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            هذه لوحة التحكم الخاصة بك، تابع تقدمك ونشاطك
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <FaTrophy className="text-2xl text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.reputation}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">السمعة</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <FaFileAlt className="text-2xl text-blue-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.content_count}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">محتوى</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <FaComments className="text-2xl text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.discussions_count}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">مناقشة</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <FaHeart className="text-2xl text-red-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.likes_received}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">إعجاب</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <FaEye className="text-2xl text-purple-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.views_total}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">مشاهدة</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <FaBookmark className="text-2xl text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.bookmarks}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">مفضلة</p>
          </Card>

          <Card className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <FaUserFriends className="text-2xl text-pink-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.followers}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">متابع</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Content */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaFileAlt className="text-primary-600 dark:text-primary-400" />
                  <span>آخر المحتوى</span>
                </h2>
                <Link
                  to="/content/new"
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  إنشاء محتوى جديد
                </Link>
              </div>

              <div className="space-y-4">
                {recentContent.map((content) => (
                  <div
                    key={content.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => navigate(`/content/${content.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex-1">
                        {content.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        content.status === 'published'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                      }`}>
                        {content.status === 'published' ? 'منشور' : 'مسودة'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {content.category}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaHeart className="text-red-500" />
                        {content.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye />
                        {content.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock />
                        {new Date(content.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/profile/my/content')}
                variant="outline"
                className="w-full mt-4"
              >
                عرض كل المحتوى
              </Button>
            </Card>

            {/* Recent Discussions */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaComments className="text-primary-600 dark:text-primary-400" />
                  <span>آخر المناقشات</span>
                </h2>
                <Link
                  to="/discussions/new"
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  بدء نقاش جديد
                </Link>
              </div>

              <div className="space-y-4">
                {recentDiscussions.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
                    onClick={() => navigate(`/discussions/${discussion.id}`)}
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaComments className="text-primary-500" />
                        {discussion.replies_count} رد
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye />
                        {discussion.views} مشاهدة
                      </span>
                      <span className="flex items-center gap-1">
                        <FaClock />
                        {new Date(discussion.created_at).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/profile/my/discussions')}
                variant="outline"
                className="w-full mt-4"
              >
                عرض كل المناقشات
              </Button>
            </Card>

            {/* Learning Paths Progress */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaChartLine className="text-primary-600 dark:text-primary-400" />
                  <span>التقدم في المسارات</span>
                </h2>
                <Link
                  to="/learning"
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  عرض الكل
                </Link>
              </div>

              <div className="space-y-6">
                {learningPaths.map((path) => (
                  <div
                    key={path.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/learning/${path.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {path.status === 'completed' ? (
                          <FaCheckCircle className="text-2xl text-green-500" />
                        ) : (
                          <FaFire className="text-2xl text-orange-500" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {path.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {path.completed_courses} من {path.total_courses} دورات
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {path.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          path.status === 'completed'
                            ? 'bg-green-500'
                            : 'bg-primary-600 dark:bg-primary-400'
                        }`}
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Notifications */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaBell className="text-primary-600 dark:text-primary-400" />
                  <span>الإشعارات</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {unreadCount}
                    </span>
                  )}
                </h2>
                <Link
                  to="/notifications"
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  عرض الكل
                </Link>
              </div>

              <div className="space-y-3">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.read
                        ? 'bg-gray-50 dark:bg-gray-800'
                        : 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                    }`}
                  >
                    <p className="text-sm text-gray-900 dark:text-white mb-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(notification.created_at).toLocaleString('ar-SA')}
                    </p>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/notifications')}
                variant="outline"
                className="w-full mt-4"
              >
                عرض كل الإشعارات
              </Button>
            </Card>

            {/* Achievements */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaMedal className="text-primary-600 dark:text-primary-400" />
                  <span>الإنجازات</span>
                </h2>
                <Link
                  to="/profile/my/badges"
                  className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                >
                  عرض الكل
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg text-center transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 hover:scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 opacity-50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      {achievement.name}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                إجراءات سريعة
              </h2>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/content/new')}
                  variant="primary"
                  className="w-full justify-center"
                >
                  إنشاء محتوى جديد
                </Button>
                <Button
                  onClick={() => navigate('/discussions/new')}
                  variant="outline"
                  className="w-full justify-center"
                >
                  بدء نقاش
                </Button>
                <Button
                  onClick={() => navigate('/learning')}
                  variant="outline"
                  className="w-full justify-center"
                >
                  تصفح المسارات
                </Button>
                <Button
                  onClick={() => navigate('/profile/' + user?.id)}
                  variant="outline"
                  className="w-full justify-center"
                >
                  عرض الملف الشخصي
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
