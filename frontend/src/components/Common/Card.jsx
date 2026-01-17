import PropTypes from 'prop-types';

const Card = ({
  children,
  header = null,
  footer = null,
  hoverable = false,
  padding = 'default',
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200';

  const hoverClasses = hoverable
    ? 'hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 cursor-pointer'
    : '';

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const classes = `${baseClasses} ${hoverClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick} {...props}>
      {header && (
        <div className={`border-b border-gray-200 dark:border-gray-700 ${paddingClasses[padding]} pb-4 mb-4`}>
          {header}
        </div>
      )}

      <div className={paddingClasses[padding]}>
        {children}
      </div>

      {footer && (
        <div className={`border-t border-gray-200 dark:border-gray-700 ${paddingClasses[padding]} pt-4 mt-4`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  header: PropTypes.node,
  footer: PropTypes.node,
  hoverable: PropTypes.bool,
  padding: PropTypes.oneOf(['none', 'sm', 'default', 'lg', 'xl']),
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Card;
