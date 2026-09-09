"use client";

import React from 'react';
import { calculateProductCompleteness } from '../../../utils/calculateProductCompleteness';

export default function DataCompletenessBadge({ product, onClick }) {
  const completeness = calculateProductCompleteness(product);
  const { score, color, bgColor, borderColor, statusLabel } = completeness;

  return (
    <>
      <button
        type="button"
        className="data-completeness-badge"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(product, completeness);
        }}
        title={`Data Quality: ${score}% (${statusLabel}). Click to enrich missing data.`}
        style={{
          width: '14px',
          height: '14px',
          minWidth: '14px',
          minHeight: '14px',
          maxWidth: '14px',
          maxHeight: '14px',
          padding: 0,
          borderRadius: '50%',
          backgroundColor: bgColor,
          borderColor: borderColor,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
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
            backgroundColor: color,
            boxShadow: `0 0 2px ${color}80`
          }} 
        />
      </button>
    </>
  );
}
