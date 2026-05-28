import React from 'react';

export default function LanguageSplit({ counts }) {
  const total = counts.en + counts.es + counts.other || 1;
  const bars = [
    { label: 'English', key: 'en',    color: 'var(--color-primary)', emoji: '🇺🇸' },
    { label: 'Spanish', key: 'es',    color: 'var(--color-success)', emoji: '🇪🇸' },
    { label: 'Other',   key: 'other', color: 'var(--color-text-tertiary)', emoji: '🌐'  },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {bars.map(({ label, key, color, emoji }) => {
        const pct = Math.round((counts[key] / total) * 100);
        return (
          <div key={key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>{emoji} {label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color }}>
                {counts[key]} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({pct}%)</span>
              </span>
            </div>
            <div style={{ height: '8px', borderRadius: 'var(--radius-sm)', background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, borderRadius: 'var(--radius-sm)', background: color, transition: 'width 0.7s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
