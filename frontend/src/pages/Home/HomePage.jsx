import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Button, Badge } from '../../components/Common';
import {
  fetchTrendingContent,
  selectTrendingContent,
  selectIsLoading as selectContentLoading
} from '../../store/slices/contentSlice';
import {
  fetchLearningPaths,
  selectPaths,
  selectIsLoading as selectLearningLoading
} from '../../store/slices/learningSlice';
import {
  BookOpenIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  LightBulbIcon,
  FireIcon,
  TrophyIcon,
  ClockIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const dispatch = useDispatch();
  const trendingContent = useSelector(selectTrendingContent);
  const learningPaths = useSelector(selectPaths);
  const isContentLoading = useSelector(selectContentLoading);
  const isLearningLoading = useSelector(selectLearningLoading);

  useEffect(() => {
    // Fetch trending content (limit 6)
    dispatch(fetchTrendingContent(6));

    // Fetch learning paths (limit 3)
    dispatch(fetchLearningPaths({ limit: 3, sortBy: 'enrollment_count', sortOrder: 'DESC' }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <SparklesIcon className="w-5 h-5 text-yellow-300" />
              <span className="text-sm font-semibold">منصة المعرفة التسويقية الشاملة</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              اكتشف عالم
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-200 to-yellow-300">
                التسويق الرقمي
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-gray-100 max-w-3xl mx-auto mb-10 leading-relaxed">
              انضم إلى مجتمع من المسوقين المحترفين واستفد من محتوى تعليمي متنوع، مسارات تعليمية منظمة، ومناقشات تفاعلية لتطوير مهاراتك التسويقية
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/learning">
                <Button
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  icon={<RocketLaunchIcon className="w-6 h-6" />}
                  iconPosition="left"
                >
                  ابدأ التعلم الآن
                </Button>
              </Link>
              <Link to="/content">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-white text-white hover:bg-white/10 shadow-xl"
                  icon={<BookOpenIcon className="w-6 h-6" />}
                  iconPosition="left"
                >
                  استكشف المحتوى
                </Button>
              </Link>
            </div>

            {/* Stats Mini */}
            <div className="flex flex-wrap justify-center gap-8 mt-16 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">+10,000</div>
                <div className="text-sm text-gray-200">متعلم نشط</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">+500</div>
                <div className="text-sm text-gray-200">محتوى تعليمي</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">+2,000</div>
                <div className="text-sm text-gray-200">مناقشة فعالة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              className="fill-gray-50 dark:fill-gray-900"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            لماذا تختار منصتنا؟
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            نوفر لك كل ما تحتاجه لتطوير مهاراتك التسويقية والوصول إلى النجاح المهني
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature 1 */}
          <Card
            hoverable
            className="text-center group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <BookOpenIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                محتوى متنوع
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                مقالات، فيديوهات، دراسات حالة، وأدوات تفاعلية لجميع مستويات الخبرة
              </p>
            </div>
          </Card>

          {/* Feature 2 */}
          <Card
            hoverable
            className="text-center group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <AcademicCapIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                مسارات تعليمية
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                مسارات منظمة ومتدرجة تأخذك من المبتدئ إلى المحترف خطوة بخطوة
              </p>
            </div>
          </Card>

          {/* Feature 3 */}
          <Card
            hoverable
            className="text-center group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                مجتمع تفاعلي
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                مناقشات حية، تبادل الخبرات، والتواصل مع المسوقين من جميع أنحاء العالم
              </p>
            </div>
          </Card>

          {/* Feature 4 */}
          <Card
            hoverable
            className="text-center group"
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                تتبع التقدم
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                راقب تقدمك، احصل على شهادات، وتابع إنجازاتك في رحلتك التعليمية
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Trending Content Section */}
      <section className="bg-white dark:bg-gray-800 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <FireIcon className="w-8 h-8 text-orange-500" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                المحتوى الرائج
              </h2>
            </div>
            <Link to="/content">
              <Button variant="ghost" icon={<ArrowLeftIcon className="w-5 h-5" />} iconPosition="left">
                عرض الكل
              </Button>
            </Link>
          </div>

          {isContentLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </Card>
              ))}
            </div>
          ) : trendingContent && trendingContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingContent.map((content) => (
                <Link key={content.id} to={`/content/${content.id}`}>
                  <Card hoverable className="h-full">
                    <div className="flex flex-col h-full">
                      {/* Content Image/Icon */}
                      <div className="relative h-40 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        {content.cover_image ? (
                          <img
                            src={content.cover_image}
                            alt={content.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpenIcon className="w-16 h-16 text-white/50" />
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant="warning" className="backdrop-blur-sm bg-white/90">
                            {content.content_type === 'article' ? 'مقالة' :
                             content.content_type === 'video' ? 'فيديو' :
                             content.content_type === 'case_study' ? 'دراسة حالة' : 'أداة'}
                          </Badge>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {content.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                          {content.description || 'محتوى تعليمي متميز في مجال التسويق الرقمي'}
                        </p>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                content.difficulty_level === 'beginner' ? 'success' :
                                content.difficulty_level === 'intermediate' ? 'warning' : 'danger'
                              }
                              size="sm"
                            >
                              {content.difficulty_level === 'beginner' ? 'مبتدئ' :
                               content.difficulty_level === 'intermediate' ? 'متوسط' : 'متقدم'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            <span>{content.reading_time || 5} دقيقة</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          👍 {content.likes_count || 0} إعجاب
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          👁️ {content.views_count || 0} مشاهدة
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">لا يوجد محتوى رائج حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* Learning Paths Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <AcademicCapIcon className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              المسارات التعليمية
            </h2>
          </div>
          <Link to="/learning">
            <Button variant="ghost" icon={<ArrowLeftIcon className="w-5 h-5" />} iconPosition="left">
              جميع المسارات
            </Button>
          </Link>
        </div>

        {isLearningLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </Card>
            ))}
          </div>
        ) : learningPaths && learningPaths.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {learningPaths.slice(0, 3).map((path) => (
              <Link key={path.id} to={`/learning/${path.id}`}>
                <Card hoverable className="h-full border-2 border-transparent hover:border-primary-500 dark:hover:border-primary-600">
                  <div className="flex flex-col h-full">
                    {/* Path Icon */}
                    <div className="w-full h-32 bg-gradient-to-br from-green-500 to-green-600 rounded-lg mb-4 flex items-center justify-center">
                      <AcademicCapIcon className="w-16 h-16 text-white" />
                    </div>

                    {/* Path Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">
                          {path.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                        {path.description || 'مسار تعليمي شامل ومنظم في مجال التسويق الرقمي'}
                      </p>

                      {/* Path Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{path.enrollment_count || 0} متعلم</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpenIcon className="w-4 h-4" />
                          <span>{path.modules_count || 0} وحدة</span>
                        </div>
                      </div>

                      {/* Difficulty Badge */}
                      <Badge
                        variant={
                          path.difficulty_level === 'beginner' ? 'success' :
                          path.difficulty_level === 'intermediate' ? 'warning' : 'danger'
                        }
                      >
                        {path.difficulty_level === 'beginner' ? 'مبتدئ' :
                         path.difficulty_level === 'intermediate' ? 'متوسط' : 'متقدم'}
                      </Badge>
                    </div>

                    {/* CTA Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Button fullWidth variant="outline" size="sm">
                        ابدأ المسار
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AcademicCapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد مسارات تعليمية متاحة حالياً</p>
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-900 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              منصة موثوقة من الآلاف
            </h2>
            <p className="text-lg text-gray-100 max-w-2xl mx-auto">
              انضم إلى مجتمع متنامٍ من المسوقين والمتعلمين الذين يطورون مهاراتهم يومياً
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <UserGroupIcon className="w-8 h-8 text-yellow-300" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">+10,000</div>
              <div className="text-gray-200">مستخدم نشط</div>
              <div className="text-sm text-gray-300 mt-1">ينمو بمعدل 20% شهرياً</div>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <BookOpenIcon className="w-8 h-8 text-green-300" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">+500</div>
              <div className="text-gray-200">محتوى تعليمي</div>
              <div className="text-sm text-gray-300 mt-1">مقالات، فيديوهات، ودراسات</div>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-300" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">+2,000</div>
              <div className="text-gray-200">مناقشة نشطة</div>
              <div className="text-sm text-gray-300 mt-1">تبادل الخبرات والمعرفة</div>
            </div>

            {/* Stat 4 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
                <TrophyIcon className="w-8 h-8 text-orange-300" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">+1,500</div>
              <div className="text-gray-200">شهادة ممنوحة</div>
              <div className="text-sm text-gray-300 mt-1">إنجازات موثقة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <Card className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-2 border-primary-200 dark:border-primary-800">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-3xl mb-6">
              <LightBulbIcon className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              هل أنت مستعد لتطوير مهاراتك؟
            </h2>

            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              انضم إلى آلاف المسوقين الذين يطورون مهاراتهم ويحققون نجاحات مبهرة في مجال التسويق الرقمي. ابدأ رحلتك اليوم واحصل على وصول مجاني لجميع المحتويات!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button
                  size="lg"
                  className="shadow-lg hover:shadow-xl"
                  icon={<RocketLaunchIcon className="w-6 h-6" />}
                  iconPosition="left"
                >
                  أنشئ حساب مجاني
                </Button>
              </Link>
              <Link to="/discussions">
                <Button
                  size="lg"
                  variant="outline"
                  icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
                  iconPosition="left"
                >
                  انضم للمجتمع
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-12 pt-8 border-t border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">مجاني 100%</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">محتوى عربي أصيل</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">تحديث مستمر</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">مجتمع داعم</span>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default HomePage;
