"use client";

import React from 'react';

/**
 * GcpKpiRow
 *
 * Shared Google Cloud Console 4-KPI Row used across all Doctor Portal views
 * (DNA Analysis, Atlas Recommendations, Prescriptions, Patients, Lab Diagnostics)
 * so every tab shares identical geometry, typography, borders, and spacing.
 */
export default function GcpKpiRow({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '12px',
        width: '100%'
      }}
    >
      {items.map((item, idx) => {
        const isClickable = typeof item.onClick === 'function';
        return (
          <div
            key={item.id || item.label || idx}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={item.onClick}
            onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') item.onClick(e); } : undefined}
            style={{
              backgroundColor: '#ffffff',
              border: item.active ? '1.5px solid #1a73e8' : '1px solid #dadce0',
              borderRadius: '8px',
              padding: '14px 16px',
              boxShadow: '0 1px 2px rgba(60,64,67,0.06)',
              cursor: isClickable ? 'pointer' : 'default',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {item.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.55rem', fontWeight: 600, color: item.valueColor || '#202124', whiteSpace: 'nowrap' }}>
                {item.value}
              </span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '0.70rem',
                    color: item.badgeColor || '#137333',
                    fontWeight: 500,
                    backgroundColor: item.badgeBg || '#e6f4ea',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            {item.subtitle && (
              <div style={{ fontSize: '0.70rem', color: '#70757a', marginTop: '4px' }}>
                {item.subtitle}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
