import React from 'react';
import { CheckCircle, Clock, Send, FileCheck, ShoppingCart, XCircle, AlertCircle } from 'lucide-react';

// ─── Config Map ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  // RFQ States
  DRAFT:            { label: 'Draft',              color: '#64748b', bg: '#f1f5f9', icon: Clock },
  SENT:             { label: 'Sent',               color: '#2563eb', bg: '#eff6ff', icon: Send },
  PRICING_SUBMITTED:{ label: 'Pricing Received',   color: '#d97706', bg: '#fffbeb', icon: AlertCircle },
  APPROVED:         { label: 'Approved',           color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  CONVERTED_TO_PO:  { label: 'Converted to PO',   color: '#7c3aed', bg: '#f5f3ff', icon: ShoppingCart },
  CANCELLED:        { label: 'Cancelled',          color: '#dc2626', bg: '#fef2f2', icon: XCircle },
  // PO States
  PENDING_APPROVAL: { label: 'Pending Approval',  color: '#d97706', bg: '#fffbeb', icon: AlertCircle },
  SENT_TO_SUPPLIER: { label: 'Sent to Supplier',  color: '#2563eb', bg: '#eff6ff', icon: Send },
  PARTIALLY_RECEIVED:{ label: 'Partially Received',color: '#0891b2', bg: '#ecfeff', icon: FileCheck },
  RECEIVED:         { label: 'Received',           color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  BILLED:           { label: 'Billed',             color: '#7c3aed', bg: '#f5f3ff', icon: FileCheck },
  // Quotation States
  EXPIRED:          { label: 'Expired',            color: '#9ca3af', bg: '#f9fafb', icon: XCircle },
  ACCEPTED:         { label: 'Accepted',           color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  CONVERTED_TO_SO:  { label: 'Converted to SO',   color: '#7c3aed', bg: '#f5f3ff', icon: ShoppingCart },
  // Sales Order States
  CONFIRMED:        { label: 'Confirmed',          color: '#0891b2', bg: '#ecfeff', icon: CheckCircle },
  IN_PROGRESS:      { label: 'In Progress',        color: '#d97706', bg: '#fffbeb', icon: Clock },
  SHIPPED:          { label: 'Shipped',            color: '#2563eb', bg: '#eff6ff', icon: Send },
  DELIVERED:        { label: 'Delivered',          color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  INVOICED:         { label: 'Invoiced',           color: '#7c3aed', bg: '#f5f3ff', icon: FileCheck },
  // Bills
  PENDING:          { label: 'Pending',            color: '#d97706', bg: '#fffbeb', icon: Clock },
  SCHEDULED:        { label: 'Scheduled',          color: '#0891b2', bg: '#ecfeff', icon: Clock },
  PAID:             { label: 'Paid',               color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
  OVERDUE:          { label: 'Overdue',            color: '#dc2626', bg: '#fef2f2', icon: AlertCircle },
  VOID:             { label: 'Void',               color: '#9ca3af', bg: '#f9fafb', icon: XCircle },
};

/**
 * ERPStatusBadge
 * Universal status badge for all ERP document types.
 *
 * @param {string} status - Status code (e.g. "DRAFT", "SENT", "APPROVED")
 * @param {string} size - "sm" | "md" (default "md")
 * @param {boolean} showIcon - Whether to show icon (default true)
 */
export default function ERPStatusBadge({ status, size = 'md', showIcon = true }) {
  const normalized = (status || 'DRAFT').toUpperCase().replace(/ /g, '_');
  const config = STATUS_CONFIG[normalized] || {
    label: status || 'Unknown',
    color: '#64748b',
    bg: '#f1f5f9',
    icon: Clock,
  };

  const Icon = config.icon;
  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isSmall ? '0.25rem' : '0.35rem',
      padding: isSmall ? '0.2rem 0.6rem' : '0.3rem 0.75rem',
      borderRadius: '999px',
      fontSize: isSmall ? '0.7rem' : '0.78rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      backgroundColor: config.bg,
      color: config.color,
      border: `1px solid ${config.color}22`,
      whiteSpace: 'nowrap',
      lineHeight: 1.4,
    }}>
      {showIcon && <Icon size={isSmall ? 10 : 12} strokeWidth={2.5} />}
      {config.label}
    </span>
  );
}

// Export the raw config for use in other components (e.g. filters)
export { STATUS_CONFIG };
