 
import React, { useState } from 'react';

/**
 * OptimizedImage
 * ──────────────
 * Drop-in replacement for <img> that adds:
 *  • Native lazy-loading  (loading="lazy")
 *  • Explicit width/height to prevent Cumulative Layout Shift (CLS)
 *  • Skeleton placeholder while the image is downloading
 *  • Graceful fallback on network errors
 *  • decoding="async" to avoid blocking the main thread
 */
const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  style = {},
  className = '',
  fallback = null,
  eager = false,          // set true for above-the-fold hero images
  objectFit = 'cover',
  borderRadius,
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);

  const wrapStyle = {
    position: 'relative',
    overflow: 'hidden',
    width: width  || '100%',
    height: height || '100%',
    borderRadius: borderRadius,
    backgroundColor: 'rgba(255,255,255,0.04)',
    ...style,
  };

  const skeletonStyle = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 50%, rgba(255,255,255,0.04) 75%)',
    backgroundSize: '600px 100%',
    animation: 'shimmer 1.4s infinite linear',
    opacity: loaded ? 0 : 1,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit,
    display: 'block',
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.35s ease',
    borderRadius: borderRadius,
  };

  if (error && fallback) return fallback;

  return (
    <div style={wrapStyle} className={className}>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }
      `}</style>
      {/* Shimmer skeleton */}
      <div style={skeletonStyle} />

      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={imgStyle}
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); setError(true); }}
        {...rest}
      />
    </div>
  );
};

export default OptimizedImage;
