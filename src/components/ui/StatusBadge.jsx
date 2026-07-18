import React from 'react';

/**
 * StatusBadge
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-inspired status badge with semantic colors. Golden Rule #8.
 * 
 * Semantic Maps:
 * - Green: active, approved, reconciled, published, success
 * - Yellow: pending, draft, awaiting, processing
 * - Red: error, rejected, disputed, failed, cancelled
 * - Gray: inactive, archived, disabled
 * - Blue: po_created, synced, converted
 */
export default function StatusBadge({ status, style = {} }) {
  if (!status) return null;
  
  const s = status.toLowerCase();
  
  let bg = '#f1f5f9';
  let color = '#64748b';
  
  if (['active', 'approved', 'reconciled', 'published', 'success'].includes(s)) {
    bg = '#f0fdf4';
    color = '#16a34a';
  } else if (['pending', 'draft', 'awaiting', 'processing'].includes(s)) {
    bg = '#fffbeb';
    color = '#d97706';
  } else if (['error', 'rejected', 'disputed', 'failed', 'cancelled'].includes(s)) {
    bg = '#fef2f2';
    color = '#dc2626';
  } else if (['po_created', 'synced', 'converted', 'info'].includes(s)) {
    bg = '#eff6ff';
    color = '#2563eb';
  }
  
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.72rem',
        fontWeight: 600,
        backgroundColor: bg,
        color: color,
        textTransform: 'capitalize',
        ...style
      }}
    >
      {status}
    </span>
  );
}
