import React from 'react';

/**
 * PublicationsSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional skeleton loader following Google Cloud Console UX.
 * Reserves exact layout dimensions for the horizontal clinical publication card,
 * eliminating Cumulative Layout Shift (CLS) on mobile and desktop.
 */
export default function PublicationsSkeleton() {
  return (
    <div 
      className="pds-pub-card pds-pub-card-horizontal pds-pub-skeleton"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        opacity: 0.85,
        minHeight: '220px',
        pointerEvents: 'none'
      }}
      aria-hidden="true"
    >
      <div className="pds-pub-card-primary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '120px', height: '22px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '50px', height: '22px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
        </div>
        <div style={{ width: '90%', height: '26px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '70%', height: '16px', background: '#f8fafc', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
          <div style={{ width: '100%', height: '40px', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>

      <div className="pds-pub-card-secondary" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '160px', height: '20px', background: '#f1f5f9', borderRadius: '6px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '100%', height: '16px', background: '#f8fafc', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '95%', height: '16px', background: '#f8fafc', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ width: '85%', height: '16px', background: '#f8fafc', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '0.5rem' }}>
          <div style={{ width: '90%', height: '14px', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '85%', height: '14px', background: '#f1f5f9', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
    </div>
  );
}
