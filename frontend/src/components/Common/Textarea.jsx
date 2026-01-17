import { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Textarea = forwardRef(({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  rows = 4,
  maxLength = null,
  showCount = false,
  className = '',
  ...props
}, ref) => {
  const baseClasses = 'block px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none';

  const errorClasses = error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 dark:border-gray-600';

  const widthClass = fullWidth ? 'w-full' : '';

  const textareaClasses = `${baseClasses} ${errorClasses} ${widthClass} ${className}`;

  const currentLength = value?.length || 0;
  const showCounter = showCount || (maxLength && currentLength > maxLength * 0.8);

  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        className={textareaClasses}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        rows={rows}
        maxLength={maxLength}
        {...props}
      />

      <div className="flex items-center justify-between mt-1">
        <div className="flex-1">
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          {helperText && !error && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
        </div>

        {showCounter && maxLength && (
          <p className={`text-sm ${currentLength > maxLength ? 'text-red-600' : 'text-gray-500'} dark:text-gray-400`}>
            {currentLength} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

Textarea.propTypes = {
  label: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  showCount: PropTypes.bool,
  className: PropTypes.string
};

export default Textarea;
