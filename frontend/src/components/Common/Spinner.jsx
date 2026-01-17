import PropTypes from 'prop-types';

const Spinner = ({
  size = 'md',
  color = 'primary',
  centered = false,
  fullScreen = false,
  text = null
}) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    success: 'text-green-600',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    white: 'text-white'
  };

  const spinner = (
    <div className={`${centered || fullScreen ? 'flex flex-col items-center justify-center' : 'inline-flex'} ${fullScreen ? 'fixed inset-0 bg-white dark:bg-gray-900 z-50' : ''}`}>
      <svg
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{text}</p>
      )}
    </div>
  );

  if (centered && !fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'white']),
  centered: PropTypes.bool,
  fullScreen: PropTypes.bool,
  text: PropTypes.string
};

export default Spinner;
