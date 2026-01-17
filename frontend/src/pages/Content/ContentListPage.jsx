import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchContent,
  selectContent,
  selectIsLoading,
  selectError,
  selectPagination,
  selectFilters,
  setFilters,
  clearFilters
} from '../../store/slices/contentSlice';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  BookOpenIcon,
  UserIcon,
  ClockIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const ContentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const content = useSelector(selectContent);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchContent({ ...filters, limit: pagination.limit, offset: pagination.offset }));
  }, [dispatch, filters, pagination.limit, pagination.offset]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, offset: 0 }));
  };

  const handleFilterChange = (filterName, value) => {
    dispatch(setFilters({ [filterName]: value, offset: 0 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const handlePageChange = (newOffset) => {
    dispatch(setFilters({ offset: newOffset }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDifficultyBadge = (level) => {
    const badges = {
      beginner: { text: 'مبتدئ', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      intermediate: { text: 'متوسط', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      advanced: { text: 'متقدم', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    };
    return badges[level] || badges.beginner;
  };

  const getContentTypeIcon = (type) => {
    const icons = {
      article: BookOpenIcon,
      video: ClockIcon,
      course: AcademicCapIcon,
      tutorial: BookOpenIcon
    };
    return icons[type] || BookOpenIcon;
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          </div>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <BookOpenIcon className="h-24 w-24 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        لا يوجد محتوى
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        لم نتمكن من العثور على أي محتوى يطابق معايير البحث الخاصة بك
      </p>
      <Button variant="outline" onClick={handleClearFilters}>
        مسح الفلاتر
      </Button>
    </div>
  );

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            مكتبة المحتوى
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            استكشف مجموعة واسعة من المقالات والدروس والدورات التعليمية
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث عن المحتوى..."
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <Button type="submit" variant="primary">
              بحث
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="h-5 w-5" />}
            >
              فلاتر
            </Button>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Content Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  نوع المحتوى
                </label>
                <select
                  value={filters.content_type || ''}
                  onChange={(e) => handleFilterChange('content_type', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">جميع الأنواع</option>
                  <option value="article">مقالة</option>
                  <option value="video">فيديو</option>
                  <option value="course">دورة</option>
                  <option value="tutorial">درس تعليمي</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  مستوى الصعوبة
                </label>
                <select
                  value={filters.difficulty_level || ''}
                  onChange={(e) => handleFilterChange('difficulty_level', e.target.value || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">جميع المستويات</option>
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ترتيب حسب
                </label>
                <select
                  value={filters.sortBy || 'published_at'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="published_at">الأحدث</option>
                  <option value="view_count">الأكثر مشاهدة</option>
                  <option value="like_count">الأكثر إعجاباً</option>
                  <option value="title">الاسم</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(filters.content_type || filters.difficulty_level || filters.search) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">الفلاتر النشطة:</span>
              {filters.content_type && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                  نوع: {filters.content_type}
                  <button onClick={() => handleFilterChange('content_type', null)}>
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.difficulty_level && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                  صعوبة: {getDifficultyBadge(filters.difficulty_level).text}
                  <button onClick={() => handleFilterChange('difficulty_level', null)}>
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                  بحث: {filters.search}
                  <button onClick={() => { handleFilterChange('search', ''); setSearchTerm(''); }}>
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                مسح الكل
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Content Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : content && content.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {content.map((item) => {
                const difficulty = getDifficultyBadge(item.difficulty_level);
                const ContentIcon = getContentTypeIcon(item.content_type);

                return (
                  <Card
                    key={item.id}
                    hoverable
                    padding="none"
                    className="overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/content/${item.id}`)}
                  >
                    {/* Image */}
                    {item.featured_image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={item.featured_image}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    )}

                    <div className="p-4">
                      {/* Type and Difficulty Badges */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-xs">
                          <ContentIcon className="h-3 w-3" />
                          {item.content_type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${difficulty.class}`}>
                          {difficulty.text}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {item.excerpt || item.description}
                      </p>

                      {/* Author and Stats */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <UserIcon className="h-4 w-4" />
                          <span>{item.author?.full_name || 'مجهول'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-500">
                          <span>{item.view_count || 0} مشاهدة</span>
                          <span>{item.like_count || 0} إعجاب</span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <ClockIcon className="h-4 w-4" />
                        <span>
                          {new Date(item.published_at || item.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(pagination.offset - pagination.limit)}
                >
                  السابق
                </Button>

                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange((pageNum - 1) * pagination.limit)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(pagination.offset + pagination.limit)}
                >
                  التالي
                </Button>
              </div>
            )}

            {/* Results Info */}
            <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
              عرض {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} من {pagination.total} نتيجة
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default ContentListPage;
