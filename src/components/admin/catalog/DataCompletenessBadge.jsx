"use client";

import React from 'react';
import { calculateProductCompleteness } from '../../../utils/calculateProductCompleteness';

export default function DataCompletenessBadge({ product, onClick }) {
  const completeness = calculateProductCompleteness(product);
  const { score = 0, statusLabel = '' } = completeness || {};
  // GCP Console standard status dot colors
  const dotColor = score >= 80 ? '#137333' : score >= 50 ? '#b06000' : '#c5221f';

  return (
    <button
      type="button"
      className="data-completeness-badge"
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(product, completeness);
      }}
      title={`Data Quality: ${score}% (${statusLabel}). Click to enrich with AI.`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '14px',
        height: '14px',
        padding: 0,
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        outline: 'none',
        verticalAlign: 'middle',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      <span 
        className="data-completeness-dot" 
        style={{
          display: 'block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
        }} 
      />
    </button>
  );
}
