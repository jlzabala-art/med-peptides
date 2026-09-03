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
          width: 14px !important;
          height: 14px !important;
          min-width: 14px !important;
          min-height: 14px !important;
          max-width: 14px !important;
          max-height: 14px !important;
          border-radius: 50% !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer;
          transition: all 0.15s ease;
          padding: 0 !important;
          outline: none;
          flex-shrink: 0 !important;
          border: 1px solid;
          margin-left: 2px;
          line-height: 1 !important;
          box-sizing: border-box !important;
        }
        .data-completeness-dot {
          width: 4.5px !important;
          height: 4.5px !important;
          min-width: 4.5px !important;
          min-height: 4.5px !important;
          border-radius: 50% !important;
          display: block !important;
          flex-shrink: 0 !important;
          box-sizing: border-box !important;
        }
        @media (max-width: 768px) {
          .data-completeness-badge {
            width: 11px !important;
            height: 11px !important;
            min-width: 11px !important;
            min-height: 11px !important;
            max-width: 11px !important;
            max-height: 11px !important;
            border-width: 1px !important;
            margin-left: 1px !important;
          }
          .data-completeness-dot {
            width: 3.5px !important;
            height: 3.5px !important;
            min-width: 3.5px !important;
            min-height: 3.5px !important;
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
