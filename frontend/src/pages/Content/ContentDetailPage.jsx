import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchContentById,
  likeContent,
  bookmarkContent,
  fetchSimilarContent
} from '../../store/slices/contentSlice';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import {
  FaHeart,
  FaRegHeart,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaClock,
  FaUser,
  FaEye,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';

const ContentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [shareMessage, setShareMessage] = useState('');

  const {
    currentContent,
    similarContent,
    loading,
    error
  } = useSelector((state) => state.content);

  const { user } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.theme);

  useEffect(() => {
    if (id) {
      dispatch(fetchContentById(id));
      dispatch(fetchSimilarContent({ contentId: id, limit: 4 }));
    }
  }, [dispatch, id]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(likeContent(id)).unwrap();
    } catch (error) {
      console.error('Error liking content:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await dispatch(bookmarkContent(id)).unwrap();
    } catch (error) {
      console.error('Error bookmarking content:', error);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: currentContent?.title,
        text: currentContent?.excerpt,
        url: url,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url);
      setShareMessage('تم نسخ الرابط!');
      setTimeout(() => setShareMessage(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            حدث خطأ
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Button onClick={() => navigate(-1)} variant="primary">
            العودة للخلف
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full text-center p-8">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            المحتوى غير موجود
          </h2>
          <Button onClick={() => navigate('/content')} variant="primary">
            تصفح المحتوى
          </Button>
        </Card>
      </div>
    );
  }

  const isLiked = currentContent.is_liked || false;
  const isBookmarked = currentContent.is_bookmarked || false;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <FaArrowRight className="rtl:hidden" />
          <FaArrowLeft className="ltr:hidden" />
          <span>العودة</span>
        </button>

        {/* Main Content */}
        <Card className="overflow-hidden mb-8">
          {/* Header Image */}
          {currentContent.image_url && (
            <div className="w-full h-96 overflow-hidden">
              <img
                src={currentContent.image_url}
                alt={currentContent.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Header */}
          <div className="p-8">
            {/* Category Badge */}
            {currentContent.category && (
              <span className="inline-block bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium mb-4">
                {currentContent.category}
              </span>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {currentContent.title}
            </h1>

            {/* Excerpt */}
            {currentContent.excerpt && (
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {currentContent.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              {/* Author */}
              {currentContent.author && (
                <Link
                  to={`/profile/${currentContent.author.id}`}
                  className="flex items-center gap-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {currentContent.author.avatar ? (
                    <img
                      src={currentContent.author.avatar}
                      alt={currentContent.author.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <FaUser className="text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                  <span className="font-medium">{currentContent.author.name}</span>
                </Link>
              )}

              {/* Date */}
              <div className="flex items-center gap-2">
                <FaClock />
                <span>{new Date(currentContent.created_at).toLocaleDateString('ar-SA')}</span>
              </div>

              {/* Views */}
              <div className="flex items-center gap-2">
                <FaEye />
                <span>{currentContent.views || 0} مشاهدة</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <Button
                onClick={handleLike}
                variant={isLiked ? 'primary' : 'outline'}
                className="flex items-center gap-2"
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span>إعجاب</span>
                {currentContent.likes_count > 0 && (
                  <span className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full text-sm">
                    {currentContent.likes_count}
                  </span>
                )}
              </Button>

              <Button
                onClick={handleBookmark}
                variant={isBookmarked ? 'primary' : 'outline'}
                className="flex items-center gap-2"
              >
                {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
                <span>حفظ</span>
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FaShare />
                <span>مشاركة</span>
              </Button>

              {shareMessage && (
                <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                  {shareMessage}
                </span>
              )}
            </div>

            {/* Content Body */}
            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:text-gray-900 dark:prose-headings:text-white
                prose-p:text-gray-700 dark:prose-p:text-gray-300
                prose-a:text-primary-600 dark:prose-a:text-primary-400
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-code:text-primary-600 dark:prose-code:text-primary-400
                prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800"
              dangerouslySetInnerHTML={{ __html: currentContent.content_body }}
            />

            {/* Tags */}
            {currentContent.tags && currentContent.tags.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  الوسوم
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentContent.tags.map((tag, index) => (
                    <Link
                      key={index}
                      to={`/content?tag=${tag}`}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Similar Content */}
        {similarContent && similarContent.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              محتوى مشابه
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarContent.map((content) => (
                <Card
                  key={content.id}
                  className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/content/${content.id}`)}
                >
                  {content.image_url && (
                    <div className="w-full h-48 overflow-hidden">
                      <img
                        src={content.image_url}
                        alt={content.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    {content.category && (
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2 block">
                        {content.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {content.title}
                    </h3>
                    {content.excerpt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {content.excerpt}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentDetailPage;
