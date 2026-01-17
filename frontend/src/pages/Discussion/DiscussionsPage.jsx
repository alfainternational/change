import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchDiscussions,
  fetchTrendingDiscussions,
  selectDiscussions,
  selectTrendingDiscussions,
  selectIsLoading,
  selectError,
  selectPagination,
  selectFilters,
  setFilters,
  clearFilters
} from '../../store/slices/discussionSlice';
import Card from '../../components/Common/Card';
import Button from '../../components/Common/Button';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ClockIcon,
  FireIcon,
  PlusIcon,
  HandThumbUpIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid';

const DiscussionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const discussions = useSelector(selectDiscussions);
  const trendingDiscussions = useSelector(selectTrendingDiscussions);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);

  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchDiscussions({ ...filters, limit: pagination.limit, offset: pagination.offset }));
    dispatch(fetchTrendingDiscussions(5));
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

  const getDiscussionTypeBadge = (type) => {
    const badges = {
      question: { text: 'سؤال', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      discussion: { text: 'نقاش', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
      announcement: { text: 'إعلان', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    };
    return badges[type] || badges.discussion;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);

    if (seconds < 60) return 'منذ لحظات';
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
    return then.toLocaleDateString('ar-SA');
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(5)].map((_, index) => (
        <Card key={index} className="animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-3"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
              <div className="flex items-center gap-4">
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <ChatBubbleLeftRightIcon className="h-24 w-24 text-gray-400 dark:text-gray-600 mb-4" />
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        لا توجد مناقشات
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
        لم نتمكن من العثور على أي مناقشات تطابق معايير البحث الخاصة بك
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={handleClearFilters}>
          مسح الفلاتر
        </Button>
        <Button variant="primary" onClick={() => navigate('/discussions/new')}>
          إنشاء مناقشة جديدة
        </Button>
      </div>
    </div>
  );

  const TrendingSidebar = () => (
    <Card className="sticky top-8">
      <div className="flex items-center gap-2 mb-4">
        <FireIconSolid className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          المناقشات الرائجة
        </h3>
      </div>

      {trendingDiscussions && trendingDiscussions.length > 0 ? (
        <div className="space-y-3">
          {trendingDiscussions.map((discussion) => (
            <div
              key={discussion.id}
              className="pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
              onClick={() => navigate(`/discussions/${discussion.id}`)}
            >
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {discussion.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                <span className="flex items-center gap-1">
                  <ChatBubbleBottomCenterTextIcon className="h-3 w-3" />
                  {discussion.reply_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <HandThumbUpIcon className="h-3 w-3" />
                  {discussion.like_count || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-500">لا توجد مناقشات رائجة حالياً</p>
      )}
    </Card>
  );

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              المناقشات
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              شارك أفكارك واطرح أسئلتك وتفاعل مع المجتمع
            </p>
          </div>
          <Button
            variant="primary"
            icon={<PlusIcon className="h-5 w-5" />}
            onClick={() => navigate('/discussions/new')}
          >
            إنشاء مناقشة جديدة
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث في المناقشات..."
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
                  {/* Discussion Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نوع المناقشة
                    </label>
                    <select
                      value={filters.discussion_type || ''}
                      onChange={(e) => handleFilterChange('discussion_type', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">جميع الأنواع</option>
                      <option value="question">سؤال</option>
                      <option value="discussion">نقاش</option>
                      <option value="announcement">إعلان</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      ترتيب حسب
                    </label>
                    <select
                      value={filters.sortBy || 'created_at'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="created_at">الأحدث</option>
                      <option value="last_activity_at">آخر نشاط</option>
                      <option value="like_count">الأكثر إعجاباً</option>
                      <option value="reply_count">الأكثر ردوداً</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {(filters.discussion_type || filters.search) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">الفلاتر النشطة:</span>
                  {filters.discussion_type && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm">
                      نوع: {getDiscussionTypeBadge(filters.discussion_type).text}
                      <button onClick={() => handleFilterChange('discussion_type', null)}>
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
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4 mb-6">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Discussions List */}
            {isLoading ? (
              <LoadingSkeleton />
            ) : discussions && discussions.length > 0 ? (
              <>
                <div className="space-y-4 mb-6">
                  {discussions.map((discussion) => {
                    const typeBadge = getDiscussionTypeBadge(discussion.discussion_type);

                    return (
                      <Card
                        key={discussion.id}
                        hoverable
                        className="cursor-pointer"
                        onClick={() => navigate(`/discussions/${discussion.id}`)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            {/* Type Badge and Status Icons */}
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${typeBadge.class}`}>
                                {typeBadge.text}
                              </span>
                              {discussion.is_pinned && (
                                <span className="text-primary-600 dark:text-primary-400" title="مثبت">
                                  📌
                                </span>
                              )}
                              {discussion.is_locked && (
                                <LockClosedIcon className="h-4 w-4 text-gray-500" title="مقفل" />
                              )}
                              {discussion.has_best_answer && (
                                <CheckCircleIcon className="h-4 w-4 text-green-500" title="يوجد إجابة أفضل" />
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                              {discussion.title}
                            </h3>

                            {/* Content Preview */}
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {discussion.content}
                            </p>

                            {/* Meta Information */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-500">
                              {/* Author */}
                              <div className="flex items-center gap-1">
                                <UserIcon className="h-4 w-4" />
                                <span>{discussion.author?.full_name || 'مجهول'}</span>
                              </div>

                              {/* Reply Count */}
                              <div className="flex items-center gap-1">
                                <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />
                                <span>{discussion.reply_count || 0} رد</span>
                              </div>

                              {/* Like Count */}
                              <div className="flex items-center gap-1">
                                <HandThumbUpIcon className="h-4 w-4" />
                                <span>{discussion.like_count || 0} إعجاب</span>
                              </div>

                              {/* Last Activity */}
                              <div className="flex items-center gap-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>
                                  {discussion.last_activity_at
                                    ? `آخر نشاط ${formatTimeAgo(discussion.last_activity_at)}`
                                    : formatTimeAgo(discussion.created_at)
                                  }
                                </span>
                              </div>
                            </div>

                            {/* Forum/Category */}
                            {discussion.forum && (
                              <div className="mt-2">
                                <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                                  {discussion.forum.name}
                                </span>
                              </div>
                            )}
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
                  عرض {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} من {pagination.total} مناقشة
                </div>
              </>
            ) : (
              <EmptyState />
            )}
          </div>

          {/* Sidebar - Trending Discussions */}
          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>
        </div>

        {/* Mobile Trending Section */}
        <div className="lg:hidden mt-8">
          <TrendingSidebar />
        </div>
      </div>
    </div>
  );
};

export default DiscussionsPage;
