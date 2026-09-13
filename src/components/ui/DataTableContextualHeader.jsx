"use client";

import React from 'react';
import { Check, X, Zap } from 'lucide-react';

/**
 * DataTableContextualHeader
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsive Selection Scope Banner for DataTable.
 * Dedicated SOLELY to selection scope management (page vs total filtered matching items)
 * without duplicating bulk actions (which live exclusively in StickyBulkActionBar).
 * Fully mobile-responsive (Golden Rule #23).
 */
export default function DataTableContextualHeader({
  selectedCount = 0,
  onClearSelection,
  totalItems = 0,
  totalVariants = 0,
  isAllMatchingSelected = false,
  onToggleSelectAllMatching,
  pageSize = 50,
  itemNoun = 'products',
  variantNoun = 'variants'
}) {
  const showTotalityOption = totalItems > selectedCount && typeof onToggleSelectAllMatching === 'function';

  return (
    <div
      className="dt-selection-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: '38px',
        padding: '4px 6px',
        backgroundColor: isAllMatchingSelected ? '#ecfdf5' : '#f0fdf4',
        fontFamily: 'var(--font-sans, inherit)',
        gap: '8px',
        flexWrap: 'wrap',
      }}
    >
      <style>{`
        .dt-selection-banner-left {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .dt-selection-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 700;
          font-size: 0.82rem;
          padding: 3px 10px;
          border-radius: 12px;
          user-select: none;
          white-space: nowrap;
        }
        .dt-toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
          min-height: 32px;
        }
        .dt-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          color: #64748b;
          font-weight: 600;
          font-size: 0.78rem;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
          min-height: 32px;
          transition: color 0.15s ease;
        }
        @media (max-width: 640px) {
          .dt-selection-banner {
            padding: 6px 8px;
            gap: 6px;
          }
          .dt-selection-banner-left {
            width: 100%;
            justify-content: space-between;
          }
          .dt-selection-badge {
            font-size: 0.76rem;
            padding: 2px 8px;
          }
          .dt-toggle-btn {
            font-size: 0.72rem;
            padding: 4px 8px;
            width: 100%;
            justify-content: center;
            margin-top: 2px;
          }
          .dt-clear-btn {
            font-size: 0.74rem;
            padding: 2px 6px;
          }
        }
      `}</style>

      {/* Left Area: Informational Badge + Scope Switcher Button */}
      <div className="dt-selection-banner-left">
        {/* Informational Selection Badge */}
        {isAllMatchingSelected ? (
          <span
            className="dt-selection-badge"
            style={{
              color: '#065f46',
              backgroundColor: '#a7f3d0',
              border: '1px solid #6ee7b7',
            }}
          >
            <Check size={13} strokeWidth={2.5} />
            <span>All {totalItems || selectedCount} {itemNoun}</span>
            {totalVariants > 0 && (
              <span style={{ opacity: 0.9, fontWeight: 600 }}>
                ({totalVariants} {variantNoun})
              </span>
            )}
          </span>
        ) : (
          <span
            className="dt-selection-badge"
            style={{
              color: '#0f766e',
              backgroundColor: '#ccfbf1',
              border: '1px solid #99f6e4',
            }}
          >
            <span>{selectedCount} selected</span>
            {totalItems > selectedCount && (
              <span style={{ opacity: 0.85, fontWeight: 500, fontSize: '0.74rem' }}>
                (page {selectedCount})
              </span>
            )}
          </span>
        )}

        {/* Scope Switcher Button */}
        {isAllMatchingSelected ? (
          <button
            type="button"
            className="dt-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelectAllMatching?.(false);
            }}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #10b981',
              color: '#047857',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            title={`Select only the ${selectedCount} items visible on this page`}
          >
            Select only {selectedCount} on page
          </button>
        ) : showTotalityOption ? (
          <button
            type="button"
            className="dt-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelectAllMatching?.(true);
            }}
            style={{
              backgroundColor: '#0f766e',
              border: '1px solid #0d6460',
              color: '#ffffff',
              boxShadow: '0 1px 3px rgba(15, 118, 110, 0.25)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d6460'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0f766e'}
            title={`Select all ${totalItems} items matching active filters`}
          >
            <Zap size={12} fill="#ffffff" />
            <span>Select all {totalItems} {itemNoun} {totalVariants > 0 ? `(${totalVariants} ${variantNoun})` : ''}</span>
          </button>
        ) : null}
      </div>

      {/* Right Area: Clear Selection Button */}
      <button
        type="button"
        className="dt-clear-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClearSelection?.();
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#be123c'}
        onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
        title="Deselect all items"
      >
        <X size={14} />
        <span>Clear</span>
      </button>
    </div>
  );
}
