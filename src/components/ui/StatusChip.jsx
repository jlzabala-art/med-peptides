import React from 'react';

/**
 * StatusChip
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
export default function StatusChip({ status, customLabel, style = {}, variant = 'pill' }) {
  if (!status && !customLabel) return null;
  
  // Safely get string for semantic mapping
  const s = (status || (typeof customLabel === 'string' ? customLabel : '')).toLowerCase();
  
  // Google Cloud Console Standard Semantic Maps
  let bg = '#f1f3f4';
  let border = '#dadce0';
  let color = '#5f6368';
  
  if (['active', 'approved', 'reconciled', 'published', 'success', 'completed', 'delivered', 'accepted', 'aceptada', 'linked', 'in_stock', 'in stock'].includes(s)) {
    bg = '#e6f4ea';
    border = '#ceead6';
    color = '#137333';
  } else if (['pending', 'draft', 'awaiting', 'processing', 'pendiente', 'unverified', 'awaiting payment', 'paused', 'on_demand', 'on demand', 'low_stock'].includes(s)) {
    bg = '#fef7e0';
    border = '#feefc3';
    color = '#b06000';
  } else if (['error', 'rejected', 'disputed', 'failed', 'cancelled', 'suspended', 'inactive', 'expired', 'caducada', 'revoked', 'out of stock', 'out_of_stock'].includes(s)) {
    bg = '#fce8e6';
    border = '#fad2cf';
    color = '#c5221f';
  } else if (['po_created', 'synced', 'converted', 'info', 'invited', 'sent', 'enviada', 'protected', 'in_transit', 'in transit', 'en tránsito', 'en transito', 'shipped'].includes(s)) {
    bg = '#e8f0fe';
    border = '#d2e3fc';
    color = '#1a73e8';
  } else if (['archived', 'hidden', 'disabled', 'unknown'].includes(s)) {
    bg = '#f1f3f4';
    border = '#dadce0';
    color = '#5f6368';
  }
  
  // Canonical English label dictionary for any legacy status string
  const SPANISH_TO_ENGLISH_MAP = {
    'en tránsito': 'In Transit',
    'en transito': 'In Transit',
    'pendiente': 'Pending',
    'aceptada': 'Accepted',
    'enviada': 'Sent',
    'caducada': 'Expired',
    'anulada': 'Cancelled',
    'rechazada': 'Rejected',
    'borrador': 'Draft',
  };

  const formattedDefault = status 
    ? (SPANISH_TO_ENGLISH_MAP[s] || (status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')))
    : '';

  const label = customLabel || formattedDefault;

  if (variant === 'dot') {
    return (
      <span
        title={label}
        style={{
          display: 'inline-block',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: color,
          ...style
        }}
      />
    );
  }

  return (
    <span
      className="status-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '0.70rem',
        fontWeight: 600,
        letterSpacing: '0.01em',
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        whiteSpace: 'nowrap',
        lineHeight: '1.2',
        ...style
      }}
    >
      {label}
    </span>
  );
}
