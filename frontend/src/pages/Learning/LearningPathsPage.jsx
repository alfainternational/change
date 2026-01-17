import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchLearningPaths,
  enrollInPath,
  selectPaths,
  selectIsLoading,
  selectError,
  selectPagination,
  selectFilters,
  selectEnrolledPaths,
  setFilters,
  clearFilters
} from '../../store/slices/learningSlice';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  AcademicCapIcon,
  UsersIcon,
  BookOpenIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const LearningPathsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const paths = useSelector(selectPaths);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const enrolledPaths = useSelector(selectEnrolledPaths);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchLearningPaths({ ...filters, limit: pagination.limit, offset: pagination.offset }));
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

  const handleEnroll = (e, pathId) => {
    e.stopPropagation();
    dispatch(enrollInPath(pathId));
  };

  const isEnrolled = (pathId) => enrolledPaths.includes(pathId);

  const getDifficultyBadge = (level) => {
    const badges = {
      beginner: { text: 'مبتدئ', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      intermediate: { text: 'متوسط', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      advanced: { text: 'متقدم', class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' }
    };
    return badges[level] || badges.beginner;
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <AcademicCapIcon className="h-24 w-24 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        لا توجد مسارات تعليمية
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        لم نتمكن من العثور على أي مسارات تطابق معايير البحث الخاصة بك
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
            المسارات التعليمية
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            اختر مسارك التعليمي وابدأ رحلتك في تطوير مهاراتك التسويقية
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
                placeholder="ابحث عن المسارات التعليمية..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
                  value={filters.sortBy || 'enrollment_count'}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="enrollment_count">الأكثر شعبية</option>
                  <option value="created_at">الأحدث</option>
                  <option value="title">الاسم</option>
                </select>
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(filters.difficulty_level || filters.search) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">الفلاتر النشطة:</span>
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

        {/* Learning Paths Grid */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : paths && paths.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paths.map((path) => {
                const difficulty = getDifficultyBadge(path.difficulty_level);
                const enrolled = isEnrolled(path.id);

                return (
                  <Card
                    key={path.id}
                    hoverable
                    className="cursor-pointer flex flex-col"
                    onClick={() => navigate(`/learning/paths/${path.id}`)}
                  >
                    {/* Difficulty Badge */}
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${difficulty.class}`}>
                        {difficulty.text}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {path.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3 flex-grow">
                      {path.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <UsersIcon className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">المتعلمين</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {path.enrollment_count || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <BookOpenIcon className="h-5 w-5 text-primary-600" />
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">الوحدات</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {path.module_count || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    {path.estimated_duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <ClockIcon className="h-4 w-4" />
                        <span>المدة المتوقعة: {path.estimated_duration}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    {enrolled ? (
                      <Button
                        fullWidth
                        variant="success"
                        icon={<CheckCircleIcon className="h-5 w-5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/learning/paths/${path.id}`);
                        }}
                      >
                        أكمل المسار
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="primary"
                        icon={<ArrowRightIcon className="h-5 w-5" />}
                        onClick={(e) => handleEnroll(e, path.id)}
                      >
                        ابدأ المسار
                      </Button>
                    )}

                    {/* Progress Bar for Enrolled Paths */}
                    {enrolled && path.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>التقدم</span>
                          <span>{Math.round(path.progress || 0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${path.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
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
              عرض {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} من {pagination.total} مسار
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default LearningPathsPage;
