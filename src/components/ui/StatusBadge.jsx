import React from 'react';
import { CheckCircle, Clock, Package, AlertCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || 'unknown';
  
  switch(normalized) {
    case 'completed':
    case 'delivered':
    case 'accepted':
      return (
        <span style={{ backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle size={12} /> {status}
        </span>
      );
    case 'pending':
    case 'processing':
    case 'awaiting payment':
      return (
        <span style={{ backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={12} /> {status}
        </span>
      );
    case 'cancelled':
    case 'rejected':
      return (
        <span style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertCircle size={12} /> {status}
        </span>
      );
    default:
      return (
        <span style={{ backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Package size={12} /> {status}
        </span>
      );
  }
}
