/**
 * Skeleton — placeholder loading indicator.
 *
 * @param {'text'|'circle'|'rect'|'card'} variant
 * @param {string|number} width
 * @param {string|number} height
 * @param {number}  count   — repeat the skeleton N times
 * @param {boolean} animate — enable shimmer (default true)
 * @param {string}  className
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  animate = true,
  className = '',
  borderRadius,
  ...rest
}) {
  const classes = [
    'ui-skeleton',
    `ui-skeleton--${variant}`,
    animate && 'ui-skeleton--animate',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style = {};
  if (width != null) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height != null) style.height = typeof height === 'number' ? `${height}px` : height;
  if (borderRadius != null) style.borderRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  // Default heights per variant when not specified
  if (height == null) {
    switch (variant) {
      case 'text':   style.height = '0.85em'; break;
      case 'circle': style.height = style.width || '40px'; break;
      case 'rect':   style.height = '100px'; break;
      case 'card':   style.height = '140px'; break;
      default: break;
    }
  }
  if (variant === 'circle' && width == null) {
    style.width = style.height;
  }

  const items = Array.from({ length: count }, (_, i) => (
    <span
      key={i}
      className={classes}
      style={style}
      role="presentation"
      aria-hidden="true"
      {...rest}
    />
  ));

  return count === 1 ? items[0] : <>{items}</>;
}
