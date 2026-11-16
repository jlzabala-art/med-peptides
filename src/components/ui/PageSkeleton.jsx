'use client';

import React from 'react';

/**
 * PageSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified loading skeleton across all public & portal pages
 * (variant: "datasheet" | "table" | "portal").
 */
export default function PageSkeleton({ variant = 'portal', message = '' }) {
  return (
    <div
      style={{
        minHeight: '72vh',
        maxWidth: 'var(--atlas-page-max-width, 1360px)',
        margin: '0 auto',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
      aria-busy="true"
      aria-label={message || 'Loading'}
    >
      {/* Top Hero / Header Skeleton */}
      <div
        className="atlas-skeleton-block"
        style={{
          height: variant === 'table' ? '88px' : '124px',
          borderRadius: 'var(--atlas-radius-card, 12px)',
        }}
      />

      {variant === 'table' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div className="atlas-skeleton-block" style={{ height: '48px', borderRadius: '8px' }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="atlas-skeleton-block" style={{ height: '54px', borderRadius: '8px' }} />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}
        >
          <div className="atlas-skeleton-block" style={{ height: '280px', borderRadius: 'var(--atlas-radius-card, 12px)' }} />
          <div className="atlas-skeleton-block" style={{ height: '280px', borderRadius: 'var(--atlas-radius-card, 12px)' }} />
          <div className="atlas-skeleton-block" style={{ height: '280px', borderRadius: 'var(--atlas-radius-card, 12px)' }} />
        </div>
      )}

      {message && (
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontWeight: 500, margin: '0.5rem 0 0' }}>
          {message}
        </p>
      )}

      <style jsx>{`
        .atlas-skeleton-block {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: atlasSkeletonPulse 1.4s ease-in-out infinite;
          border: 1px solid #e2e8f0;
        }
        @keyframes atlasSkeletonPulse {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
}
