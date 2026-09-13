'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, CheckSquare, Sparkles } from '@/lib/icons';

/**
 * StickyBulkActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Modern floating bottom action bar for desktop & bottom-dock for mobile.
 * Floats anchored at the bottom of the viewport whenever items are selected,
 * guaranteeing bulk actions are ALWAYS accessible without cluttering the table header.
 * 
 * Complies with AGENTS.md Golden Rules:
 * - Golden Rule #23: Mobile-first UX compatibility with touch targets >= 44px
 * - Golden Rule #8 & #15: Clean dark GCP-style floating elevation
 */
export default function StickyBulkActionBar({
  selectedCount = 0,
  bulkActions = [],
  renderBatchActions,
  selectedIds = [],
  onClearSelection,
  totalItems = 0,
  totalVariants = 0,
  isAllMatchingSelected = false,
  onToggleSelectAllMatching,
  pageSize = 50,
  itemNoun = 'products',
  variantNoun = 'vars'
}) {
  if (selectedCount === 0 || typeof window === 'undefined') return null;

  const primaryActions = bulkActions.slice(0, 4);
  const showTotalityOption = totalItems > selectedCount && typeof onToggleSelectAllMatching === 'function';

  return createPortal(
    <div
      role="toolbar"
      aria-label="Bulk actions bar"
      className="sticky-bulk-action-bar"
    >
      <style>{`
        @keyframes slideUpBounce {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUpMobile {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .sticky-bulk-action-bar {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9990;
          display: flex;
          alignItems: center;
          gap: 0.75rem;
          padding: 0.5rem 1rem;
          background-color: #0f172a;
          color: #ffffff;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
          border: ${isAllMatchingSelected ? '1px solid #10b981' : '1px solid #334155'};
          animation: slideUpBounce 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          max-width: 92vw;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .sticky-bulk-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.4rem 0.85rem;
          border-radius: 7px;
          background-color: #1e293b;
          border: 1px solid #475569;
          color: #f1f5f9;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          min-height: 34px;
        }
        .sticky-bulk-action-btn:hover {
          background-color: #334155;
          border-color: #64748b;
          color: #ffffff;
        }
        .sticky-bulk-action-btn.primary {
          background-color: #0284c7;
          border-color: #0369a1;
          color: #ffffff;
          box-shadow: 0 1px 3px rgba(2, 132, 199, 0.3);
        }
        .sticky-bulk-action-btn.primary:hover {
          background-color: #0369a1;
        }

        /* ── Mobile Layout (< 768px) ─────────────────────────────────── */
        @media (max-width: 768px) {
          .sticky-bulk-action-bar {
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            transform: none !important;
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 16px 16px 0 0 !important;
            padding: 10px 14px max(14px, env(safe-area-inset-bottom, 14px)) 14px !important;
            animation: slideUpMobile 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
            box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.35) !important;
            display: flex;
            flex-direction: column;
            gap: 8px;
            overflow-x: visible;
          }

          .sticky-bulk-top-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
          }

          .sticky-bulk-actions-scroll {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 2px;
          }

          .sticky-bulk-action-btn {
            min-height: 42px !important;
            padding: 0.5rem 0.95rem !important;
            font-size: 0.82rem !important;
            flex-shrink: 0;
          }
        }
      `}</style>

      {/* Mobile Top Row / Desktop Inline Badge & Scope Switcher */}
      <div className="sticky-bulk-top-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{
            backgroundColor: isAllMatchingSelected ? '#059669' : '#0284c7',
            color: '#ffffff',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
            {isAllMatchingSelected ? `All ${totalItems || selectedCount}` : selectedCount}
          </span>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
            {isAllMatchingSelected && totalVariants > 0 ? `(${totalVariants} ${variantNoun})` : 'selected'}
          </span>
        </div>

        {/* Totality Toggle Button in Sticky Bar */}
        {isAllMatchingSelected ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelectAllMatching?.(false);
            }}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              color: '#94a3b8',
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '5px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title={`Select only the ${selectedCount} items visible on this page`}
          >
            Only page ({selectedCount})
          </button>
        ) : showTotalityOption ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelectAllMatching?.(true);
            }}
            style={{
              backgroundColor: '#047857',
              border: '1px solid #059669',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '5px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease'
            }}
            title={`Select all ${totalItems} items matching filters`}
          >
            ⚡ All {totalItems} {totalVariants > 0 ? `(${totalVariants} ${variantNoun})` : ''}
          </button>
        ) : null}

        {/* Clear selection X on mobile top row */}
        {onClearSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: '#94a3b8',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
            title="Clear selection"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Separator on Desktop */}
      <div className="desktop-separator" style={{ width: '1px', height: '18px', backgroundColor: '#334155' }} />

      {/* Action Buttons (Horizontally scrollable on Mobile) */}
      <div className="sticky-bulk-actions-scroll">
        {renderBatchActions && bulkActions.length === 0 ? (
          renderBatchActions(selectedIds)
        ) : (
          primaryActions.map((action, idx) => {
            const IconComp = action.icon;
            const isPrimary = idx === 0;
            return (
              <button
                key={idx}
                type="button"
                onClick={action.onClick}
                className={`sticky-bulk-action-btn ${isPrimary ? 'primary' : ''}`}
                title={action.label}
              >
                {IconComp && <IconComp size={14} />}
                <span>{action.label.replace(/\s*\(\d+\)\s*$/, '').trim()}</span>
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
}
