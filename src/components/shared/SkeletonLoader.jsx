 
import React from 'react';
import '../../styles/skeleton.css';

export const Skeleton = ({ className, width, height, circle, style }) => {
  const baseStyle = {
    width: width || '100%',
    height: height || '1rem',
    borderRadius: circle ? '50%' : 'var(--radius-sm, 4px)',
    ...style
  };

  return (
    <div 
      className={`skeleton-base ${className || ''}`} 
      style={baseStyle}
    />
  );
};

export const DetailSkeleton = () => (
  <div className="container detail-skeleton-grid">
    <div className="skeleton-col">
      <Skeleton height="400px" className="mb-8" />
      <div className="flex gap-4">
        <Skeleton width="80px" height="80px" />
        <Skeleton width="80px" height="80px" />
        <Skeleton width="80px" height="80px" />
      </div>
    </div>
    <div className="skeleton-col">
      <Skeleton className="skeleton-title" />
      <Skeleton className="skeleton-text" />
      <Skeleton className="skeleton-text" />
      <Skeleton className="skeleton-text" width="60%" />
      
      <div className="mt-12">
        <Skeleton height="60px" width="100%" className="mb-4" />
        <Skeleton height="60px" width="100%" />
      </div>
    </div>
  </div>
);

export default Skeleton;
