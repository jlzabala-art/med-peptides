"use client";

import React, { useState } from 'react';
import { calculatePrescriptionCompleteness } from '../../../utils/calculatePrescriptionCompleteness';
import { Sparkles } from '@/lib/icons';

export default function RxCompletenessBadge({ rx, onClick, onEnrich, size = 'md' }) {
  const [isHovered, setIsHovered] = useState(false);
  const completeness = calculatePrescriptionCompleteness(rx);
  const { score, color, bgColor, borderColor, statusLabel, missingFields } = completeness;

  const isCompact = size === 'sm';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onClick) {
            onClick(rx, completeness);
          } else if (onEnrich) {
            onEnrich(rx);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={`Clinical Quality: ${score}% (${statusLabel})`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: isCompact ? '2px 6px' : '3px 8px',
          borderRadius: '12px',
          backgroundColor: bgColor || '#f0fdf4',
          border: `1px solid ${borderColor || '#86efac'}`,
          boxShadow: isHovered ? `0 2px 6px ${color}25` : '0 1px 2px rgba(0,0,0,0.03)',
          cursor: (onClick || onEnrich) ? 'pointer' : 'default',
          flexShrink: 0,
          outline: 'none',
          transition: 'all 0.15s ease-in-out',
          transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          verticalAlign: 'middle',
        }}
      >
        <span
          style={{
            display: 'block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: color || '#16a34a',
            boxShadow: `0 0 4px ${color || '#16a34a'}`,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: isCompact ? '0.7rem' : '0.75rem',
            fontWeight: 700,
            color: color || '#16a34a',
            letterSpacing: '0.01em',
            lineHeight: 1,
          }}
        >
          {score}%
        </span>
        {score < 85 && (
          <Sparkles size={11} color={color} style={{ opacity: 0.8, flexShrink: 0 }} />
        )}
      </button>

      {/* GCP-Style Context Hover Card / Tooltip */}
      {isHovered && missingFields.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 6px)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            minWidth: '220px',
            maxWidth: '280px',
            padding: '8px 10px',
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '6px',
            fontSize: '0.72rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            lineHeight: 1.3,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', borderBottom: '1px solid #334155', paddingBottom: '3px' }}>
            <span style={{ fontWeight: 700, color: color }}>{statusLabel} ({score}%)</span>
            <span style={{ color: '#94a3b8', fontSize: '0.68rem' }}>AI Audited</span>
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '0.7rem', marginBottom: '4px' }}>
            Pending Clinical Elements:
          </div>
          <ul style={{ margin: 0, paddingLeft: '14px', color: '#e2e8f0', fontSize: '0.68rem' }}>
            {missingFields.slice(0, 3).map((f, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>{f.label}</li>
            ))}
            {missingFields.length > 3 && (
              <li style={{ color: '#94a3b8' }}>+{missingFields.length - 3} more</li>
            )}
          </ul>
          {(onClick || onEnrich) && (
            <div style={{ marginTop: '5px', paddingTop: '4px', borderTop: '1px solid #334155', color: '#38bdf8', fontSize: '0.66rem', fontWeight: 600 }}>
              ✨ Click to auto-repair & enrich with AI
            </div>
          )}
        </div>
      )}
    </div>
  );
}
