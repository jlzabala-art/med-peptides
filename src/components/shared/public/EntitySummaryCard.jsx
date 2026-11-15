'use client';

import React from 'react';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';
import { Package } from 'lucide-react';

/**
 * EntitySummaryCard
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal card primitive for all Grid and Mobile card views across
 * /collection/*, /pricing/*, /proto, /vials, and /dr/[slug].
 */
export default function EntitySummaryCard({
  idCode = '',
  status = '',
  imageUrl = null,
  icon = null,
  title = '',
  subtitle = '',
  metadata = [], // max 2 items: [{ label, value }]
  priceLabel = null,
  actionLabel = 'View Details',
  onAction = null,
  onClick = null,
}) {
  return (
    <article
      onClick={onClick}
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.85rem',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
      }}
    >
      {/* Top: Copyable ID + StatusBadge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {idCode ? <CopyableId value={idCode} /> : <span />}
        {status && <StatusBadge status={status} />}
      </div>

      {/* Body: Media + Title + Subtitle */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            icon || <Package size={20} color="#64748b" />
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#0f172a',
              lineHeight: 1.35,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </h4>
          {subtitle && (
            <p
              style={{
                margin: '0.25rem 0 0',
                fontSize: '0.78rem',
                color: '#64748b',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Metadata (max 2 items) */}
      {Array.isArray(metadata) && metadata.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '0.5rem',
            paddingTop: '0.6rem',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          {metadata.slice(0, 2).map((item, idx) => (
            <div key={item.label || idx}>
              <div
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#64748b',
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer: Price + Primary Action */}
      {(priceLabel || onAction) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            paddingTop: '0.65rem',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
            {priceLabel || ''}
          </div>
          {onAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAction();
              }}
              style={{
                minHeight: '36px',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--color-primary, #003666)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
