import React from 'react';

export default function FrictionSignals({ signals }) {
  if (signals.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        No unmatched queries — great coverage! ✅
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
      {signals.map(({ query, count }, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)',
          background: i === 0 ? 'rgba(239,68,68,0.06)' : 'rgba(239,68,68,0.03)',
          border: '1px solid rgba(239,68,68,0.1)',
          gap: '0.75rem',
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-main)', fontWeight: 600, flex: 1,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {query}
          </span>
          <span style={{
            fontSize: '0.7rem', fontWeight: 800,
            color: 'var(--color-danger)', background: 'rgba(239,68,68,0.08)',
            padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)', flexShrink: 0,
          }}>
            ×{count}
          </span>
        </div>
      ))}
    </div>
  );
}
