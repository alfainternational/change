import { useState } from 'react';
import PropTypes from 'prop-types';

const Avatar = ({
  src,
  alt,
  size = 'md',
  status = null,
  shape = 'circle',
  fallbackText = null,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500'
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const showFallback = !src || imageError;

  return (
    <div className={`relative inline-block ${className}`}>
      {showFallback ? (
        <div
          className={`${sizeClasses[size]} ${shapeClass} bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold`}
        >
          {fallbackText ? getInitials(fallbackText) : getInitials(alt)}
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={`${sizeClasses[size]} ${shapeClass} object-cover border-2 border-white dark:border-gray-700`}
          onError={() => setImageError(true)}
        />
      )}

      {status && (
        <span
          className={`absolute bottom-0 left-0 ${statusSizes[size]} ${statusColors[status]} border-2 border-white dark:border-gray-800 rounded-full`}
          title={status}
        />
      )}
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl']),
  status: PropTypes.oneOf(['online', 'offline', 'busy', 'away']),
  shape: PropTypes.oneOf(['circle', 'square']),
  fallbackText: PropTypes.string,
  className: PropTypes.string
};

export default Avatar;
