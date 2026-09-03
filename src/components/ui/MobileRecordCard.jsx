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
    if (col.render) {
      try {
        // Match DataTable's call signature: col.render(row)
        // DataTable never passes rawValue as first arg — it passes the full row.
        return col.render(row);
      } catch {
        // Fallback: read raw key value
        const rawValue = row[col.key];
        return rawValue !== null && rawValue !== undefined && rawValue !== ''
          ? String(rawValue)
          : '—';
      }
    }
    const rawValue = row[col.key];
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
          {effectiveHeaderCols.map(col => (
            <div key={col.key} className="mobile-record-card-title">
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
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {/* ── BODY — key metadata ──────────────────────────────────────── */}
      {effectiveBodyCols.length > 0 && (
        <div className="mobile-record-card-body">
          {effectiveBodyCols.map(col => (
            <div key={col.key} className="mobile-record-card-field">
              <span className="mobile-record-card-label">
                {col.header || col.label || col.key}
              </span>
              <span className="mobile-record-card-value">
                {renderValue(col, row)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── EXPANDABLE DETAIL ────────────────────────────────────────── */}
      {expanded && (
        <div className="mobile-record-card-detail">
          {detailCols.map(col => (
            <div key={col.key} className="mobile-record-card-field">
              <span className="mobile-record-card-label">
                {col.header || col.label || col.key}
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
        <div className="mobile-record-card-actions">
          {actionCols.map(col => (
            <div key={col.key}>
              {renderValue(col, row)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
