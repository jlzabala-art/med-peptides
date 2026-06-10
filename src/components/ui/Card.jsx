import React from 'react';

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
    !noPadding && `ui-card--pad-${padding}`,
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

/**
 * Enhanced CardHeader
 * Supports optional standard parts: icon, title, subtitle, badge, actions.
 * If you pass standard parts, it formats them structurally.
 * If you pass children, it renders them normally.
 */
export function CardHeader({ 
  className = '', 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  badge, 
  actions, 
  style, 
  ...rest 
}) {
  const hasStandardProps = title || subtitle || Icon || badge || actions;

  return (
    <div className={`ui-card__header ${className}`} style={style} {...rest}>
      {hasStandardProps ? (
        <>
          <div className="ui-card__header-left">
            {Icon && <Icon size={20} className="ui-card__icon" color="var(--color-text-secondary)" />}
            <div>
              {title && <h3 className="ui-card__title">{title}</h3>}
              {subtitle && <p className="ui-card__subtitle">{subtitle}</p>}
            </div>
            {badge && <div className="ui-card__badge-wrapper">{badge}</div>}
          </div>
          {actions && <div className="ui-card__header-actions">{actions}</div>}
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function CardTitle({ className = '', children, style, ...rest }) {
  return (
    <h3 className={`ui-card__title ${className}`} style={style} {...rest}>
      {children}
    </h3>
  );
}

export function CardDescription({ className = '', children, style, ...rest }) {
  return (
    <p className={`ui-card__subtitle ${className}`} style={style} {...rest}>
      {children}
    </p>
  );
}

export function CardContent({ className = '', children, style, noPadding, ...rest }) {
  return (
    <div className={`ui-card__body ${className}`} style={{ padding: noPadding ? 0 : undefined, ...style }} {...rest}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, style, ...rest }) {
  return (
    <div className={`ui-card__footer ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

export default Card;
