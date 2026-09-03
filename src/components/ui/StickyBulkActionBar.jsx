'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckSquare, Sparkles } from '@/lib/icons';

/**
 * StickyBulkActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Modern floating bottom action bar for desktop tables (Linear / GCP Console style).
 * Floats anchored at the bottom center of the viewport whenever items are selected,
 * guaranteeing bulk actions are ALWAYS visible even during deep vertical scrolling.
 */
export default function StickyBulkActionBar({
  selectedCount = 0,
  bulkActions = [],
  renderBatchActions,
  selectedIds = [],
  onClearSelection
}) {
  if (selectedCount === 0 || typeof window === 'undefined') return null;

  const primaryActions = bulkActions.slice(0, 4);

  return createPortal(
    <div
      role="toolbar"
      aria-label="Bulk actions bar"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        border: '1px solid #334155',
        animation: 'slideUpBounce 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '90vw',
        flexWrap: 'nowrap',
        overflowX: 'auto',
      }}
    >
      <style>{`
        @keyframes slideUpBounce {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @media (max-width: 768px) {
          .desktop-sticky-bulk-bar { display: none !important; }
        }
      `}</style>

      {/* Selected badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
        <span style={{
          backgroundColor: '#0284c7', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800,
          padding: '2px 8px', borderRadius: '6px'
        }}>
          {selectedCount}
        </span>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
          selected
        </span>
      </div>

      <div style={{ width: '1px', height: '18px', backgroundColor: '#334155' }} />

      {/* Primary Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {renderBatchActions && bulkActions.length === 0 ? (
          renderBatchActions(selectedIds)
        ) : (
          primaryActions.map((action, idx) => {
            const isFirst = idx === 0;
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick?.();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: isFirst ? '#0284c7' : '#1e293b',
                  border: isFirst ? 'none' : '1px solid #475569',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = isFirst ? '#0369a1' : '#334155'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = isFirst ? '#0284c7' : '#1e293b'}
              >
                {action.icon && <action.icon size={14} />}
                <span>{action.label}</span>
              </button>
            );
          })
        )}
      </div>

      {/* Dismiss / Deselect */}
      {onClearSelection && (
        <>
          <div style={{ width: '1px', height: '18px', backgroundColor: '#334155' }} />
          <button
            type="button"
            onClick={onClearSelection}
            title="Clear selection (Esc)"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '24px', height: '24px', borderRadius: '50%',
              backgroundColor: '#1e293b', border: 'none', color: '#94a3b8',
              cursor: 'pointer', transition: 'color 0.15s'
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.backgroundColor = '#ef4444'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = '#1e293b'; }}
          >
            <X size={13} />
          </button>
        </>
      )}
    </div>,
    document.body
  );
}
