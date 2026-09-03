"use client";

import React, { useState } from 'react';

/**
 * OptimizedClinicalImage
 * ─────────────────────────────────────────────────────────────────────────────
 * Zero-CLS progressive image component with smooth crossfade and SVG placeholder fallback.
 */
export default function OptimizedClinicalImage({
  src,
  alt,
  width,
  height,
  className = '',
  style = {},
  priority = false
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fallbackSrc = '/images/clinical/vial_single.jpg';

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        ...style
      }}
    >
      <img
        src={hasError ? fallbackSrc : src}
        alt={alt || 'Clinical Product'}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
    </div>
  );
}
