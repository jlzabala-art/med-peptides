import { forwardRef } from 'react';

/**
 * Button — Atlas Health design-system button.
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'|'outline'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean}  loading    — shows spinner, disables interactions
 * @param {React.ReactNode} icon — leading icon element (e.g. <Icon />)
 * @param {boolean}  disabled
 * @param {boolean}  fullWidth
 * @param {string}   type       — HTML button type
 * @param {string}   className
 * @param {React.ReactNode} children
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon = null,
    disabled = false,
    fullWidth = false,
    type = 'button',
    className = '',
    ...rest
  },
  ref,
) {
  const classes = [
    'gcp-btn',
    `gcp-btn-${variant}`,
    size && `gcp-btn-${size}`,
    loading && 'gcp-btn-loading',
    fullWidth && 'gcp-btn-fullwidth',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-disabled={disabled || loading || undefined}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span className="gcp-btn-spinner" aria-hidden="true">…</span>
      ) : (
        icon && <span className="gcp-btn-icon" aria-hidden="true">{icon}</span>
      )}
      {children}
    </button>
  );
});

export default Button;
export { Button };
