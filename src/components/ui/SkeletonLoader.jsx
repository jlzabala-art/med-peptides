import React from 'react';
import './skeleton.css';

export default function SkeletonLoader({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) {
  return (
    <div 
      className={`skeleton-loader ${className}`}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#e2e8f0',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite'
      }}
    />
  );
}
