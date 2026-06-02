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
  noPadding,
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

export function CardHeader({ className = '', children, style, ...rest }) {
  return (
    <div 
      className={className} 
      style={{ 
        padding: '1rem 1.5rem', 
        borderBottom: '1px solid var(--color-border, #dadce0)', 
        ...style 
      }} 
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, style, ...rest }) {
  return (
    <h3 
      className={className} 
      style={{ 
        margin: 0, 
        fontSize: '1.1rem', 
        fontWeight: 600, 
        color: 'var(--color-text-primary, #202124)', 
        ...style 
      }} 
      {...rest}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, style, ...rest }) {
  return (
    <p 
      className={className} 
      style={{ 
        margin: '0.25rem 0 0 0', 
        fontSize: '0.85rem', 
        color: 'var(--color-text-secondary, #5f6368)', 
        ...style 
      }} 
      {...rest}
    >
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, style, ...rest }) {
  return (
    <div 
      className={className} 
      style={{ 
        padding: '1.5rem', 
        ...style 
      }} 
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
