"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from '@/lib/icons';

/**
 * MobileRecordCard
 *
 * Renders one desktop table row as a structured, interactive mobile card conforming
 * to Google Cloud UX standards:
 * - Resource Identity & Primary Status on the right in the Card Header
 * - Clean, full-width or grid property fields in the Body
 * - Actions footer toolbar aligned with buttons (no label text)
 */
export default function MobileRecordCard({
  row,
  columns,
  onRowClick,
  expandableRender,
  _isSelected,
  _onSelectionChange,
}) {
  const [expanded, setExpanded] = useState(false);

  const isActionCol = (c) => Boolean(c.isAction || c.key === 'actions' || c.key === 'action');
  const isStatusCol = (c) => Boolean(c.key === 'status' || c.key === 'state' || c.mobileRole === 'status');

  // Partition columns by mobile role
  const headerCols = columns.filter(c => c.mobilePriority === 1 && !c.hideOnMobile);
  const statusCol  = columns.find(c => isStatusCol(c) && !c.hideOnMobile);
  const actionCols = columns.filter(c => isActionCol(c) && !c.hideOnMobile);
  const detailCols = columns.filter(c => c.mobilePriority === 3 && !c.hideOnMobile);

  // If no header columns designated, use the first non-action, non-status, non-hidden column
  const effectiveHeaderCols = headerCols.length > 0
    ? headerCols
    : columns.filter(c => !isActionCol(c) && !isStatusCol(c) && !c.hideOnMobile).slice(0, 1);

  // Body columns: real properties only (excluding header, status, actions, and details)
  const effectiveBodyCols = columns.filter(c =>
    !isActionCol(c) &&
    !isStatusCol(c) &&
    !c.hideOnMobile &&
    c.mobilePriority !== 1 &&
    c.mobilePriority !== 3 &&
    !effectiveHeaderCols.includes(c)
  );

  const hasExpandable = detailCols.length > 0 || Boolean(expandableRender);

  const renderValue = (col, row) => {
    const colKey = col.key || col.id || col.accessor;
    if (col.render) {
      try {
        return col.render(row);
      } catch {
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
    <div className="mobile-record-card" style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #dadce0', marginBottom: '12px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(60,64,67,0.06)' }}>
      {/* ── HEADER — Primary identity on left, Status Badge on right (Google Cloud UX) ── */}
      <div
        className="mobile-record-card-header"
        onClick={() => onRowClick?.(row)}
        role={onRowClick ? 'button' : undefined}
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onRowClick(row); } : undefined}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '12px 14px',
          gap: '10px',
          cursor: onRowClick ? 'pointer' : 'default',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <div className="mobile-record-card-title-area" style={{ flex: 1, minWidth: 0 }}>
          {effectiveHeaderCols.map((col, idx) => (
            <div key={col.key || col.id || col.accessor || `header-col-${idx}`} className="mobile-record-card-title">
              {renderValue(col, row)}
            </div>
          ))}
        </div>

        {/* Right-aligned Status Badge & Expand Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginTop: '2px' }}>
          {statusCol && (
            <div className="mobile-record-card-status" style={{ display: 'inline-flex', alignItems: 'center' }}>
              {renderValue(statusCol, row)}
            </div>
          )}
          {hasExpandable && (
            <button
              className="mobile-record-expand-btn"
              onClick={(e) => { e.stopPropagation(); setExpanded(x => !x); }}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
              aria-expanded={expanded}
              style={{
                width: '30px',
                height: '30px',
                minWidth: '30px',
                minHeight: '30px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                borderRadius: '4px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                padding: 0
              }}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* ── BODY — Metadata fields (Full width or balanced 2-column) ── */}
      {effectiveBodyCols.length > 0 && (
        <div
          className="mobile-record-card-body"
          style={{
            padding: '10px 14px',
            display: 'grid',
            gridTemplateColumns: effectiveBodyCols.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '10px 14px',
            background: '#ffffff'
          }}
        >
          {effectiveBodyCols.map((col, idx) => {
            const isFullWidth = col.mobileFullWidth || effectiveBodyCols.length <= 2;
            return (
              <div
                key={col.key || col.id || col.accessor || `body-col-${idx}`}
                className="mobile-record-card-field"
                style={{
                  gridColumn: isFullWidth ? '1 / -1' : 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px'
                }}
              >
                <span
                  className="mobile-record-card-label"
                  style={{
                    color: '#64748b',
                    fontSize: '0.67rem',
                    fontWeight: 650,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}
                >
                  {col.header || col.label || col.key || col.id || `Field ${idx + 1}`}
                </span>
                <div className="mobile-record-card-value" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                  {renderValue(col, row)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EXPANDABLE DETAIL ── */}
      {expanded && (
        <div className="mobile-record-card-detail" style={{ padding: '10px 14px', background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
          {detailCols.map((col, idx) => (
            <div key={col.key || col.id || col.accessor || `detail-col-${idx}`} className="mobile-record-card-field" style={{ marginBottom: '8px' }}>
              <span className="mobile-record-card-label" style={{ color: '#64748b', fontSize: '0.67rem', fontWeight: 650, textTransform: 'uppercase' }}>
                {col.header || col.label || col.key || col.id || `Detail ${idx + 1}`}
              </span>
              <div className="mobile-record-card-value">
                {renderValue(col, row)}
              </div>
            </div>
          ))}
          {expandableRender && (
            <div style={{ marginTop: '0.5rem', maxWidth: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              {expandableRender(row)}
            </div>
          )}
        </div>
      )}

      {/* ── ACTIONS FOOTER (Aligned toolbar, no awkward text label) ── */}
      {actionCols.length > 0 && (
        <div
          className="mobile-record-card-actions"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '8px 14px',
            background: '#fafafa',
            borderTop: '1px solid #f1f5f9',
            boxSizing: 'border-box'
          }}
        >
          {actionCols.map((col, idx) => (
            <div
              key={col.key || col.id || col.accessor || `action-col-${idx}`}
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%' }}
            >
              {renderValue(col, row)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
