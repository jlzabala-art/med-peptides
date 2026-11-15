'use client';

import React from 'react';

/**
 * TemplateSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Template-matched loading skeleton so pages never render generic spinners:
 *  - 'catalog'  : Hero + 4 KPI cards + Search bar + Table rows
 *  - 'detail'   : Hero + 2/3 Main + 1/3 Sidebar
 *  - 'document' : Letterhead + 3 Metadata boxes + Line items
 */
export default function TemplateSkeleton({ variant = 'catalog' }) {
  const pulseStyle = {
    background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
    backgroundSize: '200% 100%',
    borderRadius: '10px',
    animation: 'atlasPulse 1.5s ease-in-out infinite',
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <style>{`
        @keyframes atlasPulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Hero / Letterhead */}
      <div style={{ ...pulseStyle, height: variant === 'document' ? '110px' : '130px', width: '100%' }} />

      {variant === 'catalog' && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ ...pulseStyle, height: '86px' }} />
            ))}
          </div>
          <div style={{ ...pulseStyle, height: '48px', width: '100%' }} />
          <div style={{ ...pulseStyle, height: '320px', width: '100%' }} />
        </>
      )}

      {variant === 'detail' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ flex: '999 1 560px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ ...pulseStyle, height: '180px' }} />
            <div style={{ ...pulseStyle, height: '240px' }} />
          </div>
          <div style={{ flex: '1 1 280px', ...pulseStyle, height: '340px' }} />
        </div>
      )}

      {variant === 'document' && (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ ...pulseStyle, height: '92px' }} />
            ))}
          </div>
          <div style={{ ...pulseStyle, height: '260px', width: '100%' }} />
        </>
      )}
    </div>
  );
}
