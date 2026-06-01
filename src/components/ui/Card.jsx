/**
 * Card — Atlas Health container component.
 *
 * @param {'default'|'flat'|'glass'} variant
 * @param {boolean}  hover     — adds lift effect on hover
 * @param {'sm'|'md'|'lg'} padding
 * @param {string}   className
 * @param {Function} onClick
 * @param {React.ReactNode} children
 */
export function Card({
  children,
  variant = 'default',
  hover = false,
  padding = 'md',
  className = '',
  onClick,
  ...rest
}) {
  const isClickable = typeof onClick === 'function';

  const classes = [
    'ui-card',
    variant !== 'default' && `ui-card--${variant}`,
    `ui-card--pad-${padding}`,
    hover && 'ui-card--hover',
    isClickable && 'ui-card--clickable',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...rest }) {
  return (
    <div className={`px-6 py-4 border-b ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...rest }) {
  return (
    <h3 className={`text-lg font-semibold ${className}`} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, ...rest }) {
  return (
    <p className={`text-sm text-gray-500 ${className}`} {...rest}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, ...rest }) {
  return (
    <div className={`p-6 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export default Card;
