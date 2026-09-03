"use client";

import React from 'react';
import { calculateProductCompleteness } from '../../../utils/calculateProductCompleteness';

export default function DataCompletenessBadge({ product, onClick }) {
  const completeness = calculateProductCompleteness(product);
  const { score, color, bgColor, borderColor, statusLabel } = completeness;

  return (
    <>
      <style>{`
        .data-completeness-badge {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0;
          outline: none;
          flex-shrink: 0;
          border: 1px solid;
          margin-left: 2px;
        }
        .data-completeness-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transition: transform 0.2s ease;
        }
        @media (max-width: 768px) {
          .data-completeness-badge {
            width: 14px !important;
            height: 14px !important;
            border-width: 1px !important;
          }
          .data-completeness-dot {
            width: 4.5px !important;
            height: 4.5px !important;
          }
        }
      `}</style>
      <button
        type="button"
        className="data-completeness-badge"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) onClick(product, completeness);
        }}
        title={`Data Quality: ${score}% (${statusLabel}). Click to enrich missing data.`}
        style={{
          backgroundColor: bgColor,
          borderColor: borderColor,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
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
            boxShadow: `0 0 3px ${color}80`
          }} 
        />
      </button>
    </>
  );
}
