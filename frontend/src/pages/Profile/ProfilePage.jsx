import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  FaUser,
  FaEdit,
  FaTrophy,
  FaFileAlt,
  FaComments,
  FaMedal,
  FaChartLine,
  FaStar,
  FaHeart,
  FaBookmark,
  FaClock,
  FaEye
} from 'react-icons/fa';

const ProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('content');
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user: currentUser } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    // Simulate fetching user profile data
    // In production, dispatch fetchUserProfile(userId)
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Mock data - replace with actual API call
        const mockProfile = {
          id: userId,
          name: 'أحمد محمد',
          username: '@ahmad_mohamed',
          bio: 'متخصص في التسويق الرقمي ومهتم بالتسويق بالمحتوى والسوشيال ميديا. أشارك خبراتي ومعرفتي مع المجتمع.',
          avatar: null,
          cover_image: null,
          reputation: 1250,
          level: 5,
          joined_date: '2024-01-15',
          stats: {
            content_count: 24,
            discussions_count: 67,
            badges_count: 12,
            followers: 342,
            following: 156
          },
          badges: [
            { id: 1, name: 'كاتب نشط', icon: '✍️', description: 'نشر 10 مقالات' },
            { id: 2, name: 'مشارك ممتاز', icon: '💬', description: 'شارك في 50 نقاش' },
            { id: 3, name: 'مساعد', icon: '🤝', description: 'ساعد 20 عضو' },
            { id: 4, name: 'خبير تسويق', icon: '📊', description: 'أكمل مسار التسويق الرقمي' }
          ],
          content: [
            {
              id: 1,
              title: 'دليل شامل للتسويق عبر السوشيال ميديا',
              excerpt: 'تعرف على أفضل الممارسات للتسويق عبر منصات التواصل الاجتماعي',
              category: 'تسويق رقمي',
              likes: 45,
              views: 1234,
              created_at: '2025-01-10'
            },
            {
              id: 2,
              title: 'كيفية بناء استراتيجية محتوى ناجحة',
              excerpt: 'خطوات عملية لإنشاء استراتيجية محتوى فعالة',
              category: 'تسويق بالمحتوى',
              likes: 67,
              views: 2341,
              created_at: '2025-01-05'
            }
          ],
          discussions: [
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
          activity: [
            { type: 'content', action: 'نشر مقال جديد', date: '2025-01-10', title: 'دليل شامل للتسويق' },
            { type: 'discussion', action: 'شارك في نقاش', date: '2025-01-09', title: 'أفضل أدوات التسويق' },
            { type: 'badge', action: 'حصل على شارة', date: '2025-01-08', title: 'كاتب نشط' }
          ]
        };

        setProfileData(mockProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            المستخدم غير موجود
          </h2>
          <Button onClick={() => navigate('/')} variant="primary">
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === parseInt(userId);

  const tabs = [
    { id: 'content', label: 'المحتوى', icon: <FaFileAlt />, count: profileData.stats.content_count },
    { id: 'discussions', label: 'المناقشات', icon: <FaComments />, count: profileData.stats.discussions_count },
    { id: 'badges', label: 'الشارات', icon: <FaMedal />, count: profileData.stats.badges_count },
    { id: 'stats', label: 'الإحصائيات', icon: <FaChartLine /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <Card className="mb-8 overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-700">
            {profileData.cover_image && (
              <img
                src={profileData.cover_image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="px-8 pb-8">
            {/* Avatar and Actions */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              {/* Avatar */}
              <div className="flex items-end gap-6 mb-4 md:mb-0">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <FaUser className="text-5xl text-primary-600 dark:text-primary-400" />
                  </div>
                )}
                <div className="pb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profileData.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">{profileData.username}</p>
                </div>
              </div>

              {/* Actions */}
              {isOwnProfile && (
                <Button
                  onClick={() => navigate('/settings/profile')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FaEdit />
                  <span>تعديل الملف</span>
                </Button>
              )}
            </div>

            {/* Bio */}
            {profileData.bio && (
              <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-3xl">
                {profileData.bio}
              </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 mb-2">
                  <FaTrophy className="text-xl" />
                  <span className="text-2xl font-bold">{profileData.reputation}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">السمعة</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileData.stats.content_count}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">محتوى</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileData.stats.discussions_count}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">مناقشة</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileData.stats.followers}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">متابع</p>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileData.stats.following}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">يتابع</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-sm">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData.content.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/content/${item.id}`)}
              >
                <div className="p-6">
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2 block">
                    {item.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {item.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaHeart className="text-red-500" />
                      {item.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {new Date(item.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'discussions' && (
          <div className="space-y-4">
            {profileData.discussions.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/discussions/${item.id}`)}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <FaComments className="text-primary-500" />
                      {item.replies_count} رد
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye />
                      {item.views} مشاهدة
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {new Date(item.created_at).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {profileData.badges.map((badge) => (
              <Card key={badge.id} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="text-5xl mb-4">{badge.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {badge.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {badge.description}
                </p>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  المستوى
                </h3>
                <FaStar className="text-3xl text-yellow-500" />
              </div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {profileData.level}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                المستوى الحالي
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  النشاط
                </h3>
                <FaChartLine className="text-3xl text-green-500" />
              </div>
              <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {profileData.stats.content_count + profileData.stats.discussions_count}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                إجمالي المساهمات
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  تاريخ الانضمام
                </h3>
                <FaClock className="text-3xl text-blue-500" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {new Date(profileData.joined_date).toLocaleDateString('ar-SA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                عضو منذ
              </p>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 md:col-span-2 lg:col-span-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                النشاط الأخير
              </h3>
              <div className="space-y-4">
                {profileData.activity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                      {activity.type === 'content' && <FaFileAlt className="text-primary-600 dark:text-primary-400" />}
                      {activity.type === 'discussion' && <FaComments className="text-primary-600 dark:text-primary-400" />}
                      {activity.type === 'badge' && <FaMedal className="text-primary-600 dark:text-primary-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        {activity.action}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {new Date(activity.date).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
