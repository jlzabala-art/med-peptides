"use client";

import React from 'react';
import { calculateProductCompleteness } from '../../../utils/calculateProductCompleteness';

export default function DataCompletenessBadge({ product, onClick }) {
  const completeness = calculateProductCompleteness(product);
  const { score, color, bgColor, borderColor, statusLabel } = completeness;

  return (
    <button
      type="button"
      className="data-completeness-badge"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(product, completeness);
      }}
      title={`Data Quality: ${score}% (${statusLabel}). Click to enrich missing data.`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        minWidth: '18px',
        minHeight: '18px',
        maxWidth: '18px',
        maxHeight: '18px',
        padding: 0,
        borderRadius: '50%',
        backgroundColor: bgColor || '#f0fdf4',
        border: `1.5px solid ${borderColor || '#86efac'}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        flexShrink: 0,
        outline: 'none',
        WebkitAppearance: 'none',
        appearance: 'none',
        boxSizing: 'border-box',
        verticalAlign: 'middle',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.2)';
        e.currentTarget.style.boxShadow = `0 0 6px ${color}35`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
      }}
    >
      <span 
        className="data-completeness-dot" 
        style={{
          display: 'block',
          width: '6px',
          height: '6px',
          minWidth: '6px',
          minHeight: '6px',
          borderRadius: '50%',
          backgroundColor: color || '#16a34a',
          boxShadow: `0 0 3px ${color || '#16a34a'}`,
          flexShrink: 0,
        }} 
      />
    </button>
  );
}
