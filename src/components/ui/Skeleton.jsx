import React from 'react';
import './Skeleton.css';

export default function Skeleton({ variant = 'text', width, height, style = {} }) {
  const inlineStyle = {
    width: width || (variant === 'text' ? '100%' : '100%'),
    height: height || (variant === 'text' ? '1em' : '100%'),
    borderRadius: variant === 'circular' ? '50%' : '4px',
    ...style
  };

  return <div className={`skeleton skeleton-${variant}`} style={inlineStyle} />;
}
