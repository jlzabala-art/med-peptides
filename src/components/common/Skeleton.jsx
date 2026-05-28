 
import React from 'react';

/**
 * Premium Skeleton Component for loading states
 * @param {string} width - CSS width
 * @param {string} height - CSS height
 * @param {string} borderRadius - CSS border radius
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 */
const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  borderRadius = 'var(--radius-sm)',
  className = '', 
  style = {} 
}) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ 
        width, 
        height, 
        borderRadius,
        ...style 
      }}
    />
  );
};

export default Skeleton;
