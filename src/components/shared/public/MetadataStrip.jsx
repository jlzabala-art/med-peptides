'use client';

import React from 'react';
import CopyableId from '@/components/ui/CopyableId';

/**
 * MetadataStrip
 * ─────────────────────────────────────────────────────────────────────────────
 * Standardized key-value mini-card grid for CAS, Purity, Batch/Lot, Dates,
 * Currency, Document Ref, and Partner metadata across all entity & document views.
 */
export default function MetadataStrip({
  items = [], // [{ label, value, copyable?, mono? }]
  minItemWidth = '170px',
}) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        gap: '0.75rem',
      }}
    >
      {items.map((item, idx) => (
        <div
          key={item.label || idx}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '0.75rem 0.9rem',
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748b',
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              marginTop: '0.25rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              color: '#0f172a',
              fontFamily: item.mono ? 'monospace' : 'inherit',
            }}
          >
            {item.copyable && item.value ? (
              <CopyableId value={String(item.value)} />
            ) : (
              item.value || '—'
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
