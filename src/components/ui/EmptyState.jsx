import Button from './Button';

/**
 * EmptyState — friendly zero-data placeholder.
 *
 * @param {React.ReactNode|string} icon — emoji string or React node
 * @param {string}  title
 * @param {string}  description
 * @param {object}  action — props forwarded to a Button (e.g. { children: 'Add', onClick: fn })
 * @param {string}  className
 * @param {React.ReactNode} children — extra content below the action
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
  children,
  ...rest
}) {
  const classes = ['ui-empty', className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status" {...rest}>
      {icon && (
        <div className="ui-empty__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      {title && <h3 className="ui-empty__title">{title}</h3>}

      {description && (
        <p className="ui-empty__description">{description}</p>
      )}

      {action && (
        <div className="ui-empty__action">
          <Button {...action} />
        </div>
      )}

      {children && <div className="ui-empty__children">{children}</div>}
    </div>
  );
}
