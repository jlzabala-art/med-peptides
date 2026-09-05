"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from '@/lib/icons';

/**
 * MobileRecordCard
 *
 * Renders one desktop table row as a structured, interactive mobile card.
 * Column definitions from DataTable drive the content layout.
 *
 * Column definition extensions for mobile:
 *   mobilePriority: 1  → card header (bold primary identity)
 *   mobilePriority: 2  → card body (key metadata fields, always visible)
 *   mobilePriority: 3  → expandable detail section (shown on tap)
 *   hideOnMobile: true → never shown on mobile
 *   isAction: true     → card footer action row
 *   (no mobilePriority) → treated as priority 2 (body)
 */
export default function MobileRecordCard({
  row,
  columns,
  onRowClick,
  expandableRender,
  isSelected,
  onSelectionChange,
}) {
  const [expanded, setExpanded] = useState(false);

  // Partition columns by mobile role
  const headerCols = columns.filter(c => c.mobilePriority === 1 && !c.hideOnMobile);
  const bodyCols   = columns.filter(c => !c.isAction && !c.hideOnMobile && c.mobilePriority !== 1 && c.mobilePriority !== 3);
  const detailCols = columns.filter(c => c.mobilePriority === 3 && !c.hideOnMobile);
  const actionCols = columns.filter(c => c.isAction && !c.hideOnMobile);

  // If no header columns designated, use the first non-action, non-hidden column
  const effectiveHeaderCols = headerCols.length > 0
    ? headerCols
    : columns.filter(c => !c.isAction && !c.hideOnMobile).slice(0, 1);

  const effectiveBodyCols = headerCols.length > 0
    ? bodyCols
    : bodyCols.slice(1); // skip first (used as header already)

  const hasExpandable = detailCols.length > 0 || !!expandableRender;

  const renderValue = (col, row) => {
    const colKey = col.key || col.id || col.accessor;
    if (col.render) {
      try {
        // Match DataTable's call signature: col.render(row)
        // DataTable never passes rawValue as first arg — it passes the full row.
        return col.render(row);
      } catch {
        // Fallback: read raw key value
        const rawValue = colKey ? row[colKey] : undefined;
        return rawValue !== null && rawValue !== undefined && rawValue !== ''
          ? String(rawValue)
          : '—';
      }
    }
    const rawValue = colKey ? row[colKey] : undefined;
    if (rawValue === null || rawValue === undefined || rawValue === '') return '—';
    return String(rawValue);
  };

  return (
    <div className="mobile-record-card">
      {/* ── HEADER — primary identity ─────────────────────────────────── */}
      <div
        className="mobile-record-card-header"
        onClick={() => onRowClick?.(row)}
        role={onRowClick ? 'button' : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick(row); } : undefined}
      >
        <div className="mobile-record-card-title-area">
          {effectiveHeaderCols.map((col, idx) => (
            <div key={col.key || col.id || col.accessor || `header-col-${idx}`} className="mobile-record-card-title">
              {renderValue(col, row)}
            </div>
          ))}
        </div>

        {hasExpandable && (
          <button
            className="mobile-record-expand-btn"
            onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            aria-expanded={expanded}
            style={{ minWidth: '44px', minHeight: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        )}
      </div>

      {/* ── BODY — key metadata ──────────────────────────────────────── */}
      {effectiveBodyCols.length > 0 && (
        <div className="mobile-record-card-body">
          {effectiveBodyCols.map((col, idx) => (
            <div key={col.key || col.id || col.accessor || `body-col-${idx}`} className="mobile-record-card-field">
              <span className="mobile-record-card-label">
                {col.header || col.label || col.key || col.id || `Field ${idx + 1}`}
              </span>
              <span className="mobile-record-card-value" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                {renderValue(col, row)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── EXPANDABLE DETAIL ────────────────────────────────────────── */}
      {expanded && (
        <div className="mobile-record-card-detail">
          {detailCols.map((col, idx) => (
            <div key={col.key || col.id || col.accessor || `detail-col-${idx}`} className="mobile-record-card-field">
              <span className="mobile-record-card-label">
                {col.header || col.label || col.key || col.id || `Detail ${idx + 1}`}
              </span>
              <span className="mobile-record-card-value">
                {renderValue(col, row)}
              </span>
            </div>
          ))}
          {/* Custom expandable content (from DataTable expandableRender prop).
              Wrapped with overflow:hidden so sub-tables (e.g. VariantRow)
              cannot cause horizontal overflow on mobile. */}
          {expandableRender && (
            <div style={{
              marginTop: '0.5rem',
              maxWidth: '100%',
              overflowX: 'auto',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
            }}>
              {expandableRender(row)}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIONS FOOTER ───────────────────────────────────────────── */}
      {actionCols.length > 0 && (
        <div className="mobile-record-card-actions" style={{ width: '100%' }}>
          {actionCols.map((col, idx) => (
            <div key={col.key || col.id || col.accessor || `action-col-${idx}`} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {renderValue(col, row)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
