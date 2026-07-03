import React from 'react';

/**
 * ResponsiveGrid
 * Handles 4-col (desktop), 2-col (tablet), and 1-col (mobile) layouts automatically.
 * Use `type="metrics"` for 4-column items, `type="widgets"` for 2-column items.
 */
export default function ResponsiveGrid({ children, type = 'metrics', className = '', style = {} }) {
  const baseClass = type === 'metrics' ? 'responsive-grid--metrics' : 'responsive-grid--widgets';
  
  return (
    <div className={`responsive-grid ${baseClass} ${className}`} style={style}>
      {children}
    </div>
  );
}
