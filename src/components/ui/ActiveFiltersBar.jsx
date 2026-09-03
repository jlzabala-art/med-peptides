"use client";
import React from 'react';
import { X } from '@/lib/icons';

/**
 * ActiveFiltersBar — Line 3 of the 3-line search/filter layout.
 *
 * Renders active filter chips + a "Clear all" button.
 * Animates in/out via CSS max-height transition.
 * Zero vertical footprint when no filters are active.
 *
 * @param {Array}    filters     — [{ key, label, value, onRemove }]
 * @param {Function} onClearAll  — removes all active filters at once
 */
export default function ActiveFiltersBar({ filters = [], onClearAll }) {
  if (!filters || filters.length === 0) return null;

  return (
    <div
      className="active-filters-bar"
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '6px',
        padding: '6px 0 2px',
        animation: 'filterBarSlideIn 0.15s ease',
      }}
    >
      {/* Label */}
      <span style={{
        fontSize: '0.68rem',
        fontWeight: 700,
        color: 'var(--text-muted, #94a3b8)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        Active Filters:
      </span>

      {/* Chips */}
      {filters.map((f, idx) => f && (
        <span
          key={f.key || `f-${idx}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: 'var(--primary-light, #eff6ff)',
            border: '1px solid var(--color-primary, #003666)22',
            borderRadius: '20px',
            padding: '3px 8px 3px 10px',
            fontSize: '0.78rem',
            fontWeight: 500,
            color: 'var(--color-primary, #003666)',
            whiteSpace: 'nowrap',
            minHeight: '28px',
          }}
        >
          {f.label && (
            <span style={{ opacity: 0.65, fontWeight: 400, marginRight: '1px' }}>
              {f.label}:
            </span>
          )}
          {f.value}
          {f.onRemove && (
            <button
              onClick={f.onRemove}
              title={`Remove ${f.label || ''} filter`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                color: 'var(--color-primary, #003666)', opacity: 0.6,
                borderRadius: '50%', lineHeight: 1,
                minWidth: '18px', minHeight: '18px', // touch target
                transition: 'opacity 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          )}
        </span>
      ))}

      {/* Clear all */}
      {onClearAll && filters.length > 1 && (
        <button
          onClick={onClearAll}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px',
            fontSize: '0.72rem', fontWeight: 600,
            color: 'var(--text-muted, #94a3b8)',
            textDecoration: 'underline', textUnderlineOffset: '2px',
            transition: 'color 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary, #003666)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted, #94a3b8)'}
        >
          Clear all
        </button>
      )}

      <style>{`
        @keyframes filterBarSlideIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .active-filters-bar { gap: 5px; }
          .active-filters-bar span[style] { font-size: 0.74rem; }
        }
      `}</style>
    </div>
  );
}
