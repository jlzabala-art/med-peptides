'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from '@/lib/icons';

/**
 * StickyBulkActionBar
 * ─────────────────────────────────────────────────────────────────────────────
 * Google Cloud Console Standard Floating Bulk Action Toolbar.
 * Floats anchored at the bottom of the viewport whenever items are selected,
 * guaranteeing bulk actions are ALWAYS accessible without cluttering the table.
 * 
 * Complies with AGENTS.md Golden Rules:
 * - Golden Rule #23: Mobile-first UX compatibility with touch targets >= 44px
 * - Golden Rule #39: Homogeneous GCP button styling (gcp-btn-secondary / GCP white toolbar)
 * - Strict single-line horizontal alignment (no wrapping, smooth horizontal scroll)
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

  const showTotalityOption = totalItems > selectedCount && typeof onToggleSelectAllMatching === 'function';

  return createPortal(
    <div
      role="toolbar"
      aria-label="Bulk actions toolbar"
      className="sticky-bulk-action-bar"
    >
      <style>{`
        @keyframes slideUpGcp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        @keyframes slideUpMobileGcp {
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
          align-items: center;
          gap: 0.75rem;
          padding: 6px 12px;
          background-color: #ffffff;
          color: #202124;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(60, 64, 67, 0.18), 0 1px 3px rgba(60, 64, 67, 0.12);
          border: ${isAllMatchingSelected ? '1px solid #16a34a' : '1px solid #dadce0'};
          animation: slideUpGcp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          max-width: 94vw;
          flex-wrap: nowrap;
          white-space: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .sticky-bulk-top-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .sticky-bulk-badge {
          background-color: ${isAllMatchingSelected ? '#dcfce7' : '#e8f0fe'};
          color: ${isAllMatchingSelected ? '#15803d' : '#1967d2'};
          font-size: 0.8125rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: 1px solid ${isAllMatchingSelected ? '#86efac' : '#c2e7ff'};
        }

        .sticky-bulk-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #3c4043;
        }

        .sticky-bulk-separator {
          width: 1px;
          height: 22px;
          background-color: #dadce0;
          flex-shrink: 0;
          margin: 0 2px;
        }

        .sticky-bulk-actions-scroll {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .sticky-bulk-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 12px;
          height: 32px;
          border-radius: 4px;
          background-color: #ffffff;
          border: 1px solid #dadce0;
          color: #3c4043;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          flex-shrink: 0;
        }
        .sticky-bulk-action-btn:hover {
          background-color: #f8f9fa;
          border-color: #dadce0;
          color: #202124;
          box-shadow: 0 1px 2px rgba(60, 64, 67, 0.25);
        }

        .sticky-bulk-action-btn.primary {
          background-color: #1a73e8;
          border-color: #1a73e8;
          color: #ffffff;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(26, 115, 232, 0.3);
        }
        .sticky-bulk-action-btn.primary:hover {
          background-color: #174ea6;
          border-color: #174ea6;
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(26, 115, 232, 0.4);
        }

        .sticky-bulk-clear-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background-color: transparent;
          border: none;
          color: #5f6368;
          cursor: pointer;
          transition: all 0.15s ease;
          padding: 0;
          margin-left: 2px;
        }
        .sticky-bulk-clear-btn:hover {
          background-color: #f1f3f4;
          color: #202124;
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
            border-radius: 12px 12px 0 0 !important;
            padding: 8px 12px max(12px, env(safe-area-inset-bottom, 12px)) 12px !important;
            animation: slideUpMobileGcp 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
            box-shadow: 0 -4px 16px rgba(60, 64, 67, 0.18) !important;
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

          .sticky-bulk-separator {
            display: none;
          }

          .sticky-bulk-actions-scroll {
            width: 100%;
            padding-bottom: 2px;
            gap: 8px;
          }

          .sticky-bulk-action-btn {
            height: 38px !important;
            padding: 0 14px !important;
            font-size: 0.8125rem !important;
          }
        }
      `}</style>

      {/* GCP Selection Indicator & Scope Switcher */}
      <div className="sticky-bulk-top-row">
        <span className="sticky-bulk-badge">
          {isAllMatchingSelected ? `All ${totalItems || selectedCount}` : selectedCount}
        </span>
        <span className="sticky-bulk-label">
          {isAllMatchingSelected && totalVariants > 0
            ? `(${totalVariants} ${variantNoun}) selected`
            : `selected`}
        </span>

        {/* Totality Toggle (GCP Standard) */}
        {isAllMatchingSelected ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelectAllMatching?.(false);
            }}
            style={{
              backgroundColor: '#f1f3f4',
              border: '1px solid #dadce0',
              color: '#3c4043',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
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
              backgroundColor: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#15803d',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title={`Select all ${totalItems} items matching filters`}
          >
            Select all {totalItems} {totalVariants > 0 ? `(${totalVariants} ${variantNoun})` : ''}
          </button>
        ) : null}

        {/* Clear selection X button */}
        {onClearSelection && (
          <button
            type="button"
            onClick={onClearSelection}
            className="sticky-bulk-clear-btn"
            title="Deselect all"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Separator on Desktop */}
      <div className="sticky-bulk-separator" />

      {/* Action Buttons (Strictly single horizontal row, scrollable on overflow) */}
      <div className="sticky-bulk-actions-scroll">
        {renderBatchActions && bulkActions.length === 0 ? (
          renderBatchActions(selectedIds)
        ) : (
          bulkActions.map((action, idx) => {
            const IconComp = action.icon;
            const isPrimary = action.variant === 'primary' || action.isPrimary;
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
