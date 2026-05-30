/**
 * Badge — small status label.
 *
 * @param {'info'|'success'|'warning'|'danger'|'neutral'} variant
 * @param {'sm'|'md'} size
 * @param {boolean} dot       — shows a colored dot indicator before text
 * @param {React.ReactNode} icon — optional leading icon element
 * @param {React.ReactNode} children
 */
export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon = null,
  className = '',
  ...rest
}) {
  const classes = [
    'ui-badge',
    `ui-badge--${variant}`,
    `ui-badge--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} role="status" {...rest}>
      {dot && <span className="ui-badge__dot" aria-hidden="true" />}
      {!dot && icon && (
        <span className="ui-badge__icon" aria-hidden="true">{icon}</span>
      )}
      {children}
    </span>
  );
}
