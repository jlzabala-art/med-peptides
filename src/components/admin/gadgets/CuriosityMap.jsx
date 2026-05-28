import React, { useState } from 'react';

// Shared utility
function computeItemFrequencies(logs, items, type) {
  return items
    .map((item) => {
      let count = 0;
      const name = item.name || item.title || 'Unknown';
      logs.forEach((log) => {
        const q = log.query?.toLowerCase() || '';
        const m = log.message?.toLowerCase() || '';
        if (q.includes(name.toLowerCase()) || m.includes(name.toLowerCase())) count++;
      });
      return { name, count };
    })
    .sort((a, b) => b.count - a.count);
}

export default function CuriosityMap({ logs, products, supplements, protocols }) {
  const [activeTab, setActiveTab] = useState('peptides');

  let items = [];
  let type = 'peptide';
  let label = 'compounds';

  if (activeTab === 'peptides') {
    items = products;
    type = 'peptide';
    label = 'peptides';
  } else if (activeTab === 'supplements') {
    items = supplements;
    type = 'supplement';
    label = 'supplements';
  } else {
    items = protocols;
    type = 'protocol';
    label = 'protocols';
  }

  const freqList = computeItemFrequencies(logs, items, type)
    .filter((x) => x.count > 0)
    .slice(0, 10);
  const max = freqList[0]?.count || 1;
  const COLORS = [
    '#8b5cf6',
    '#6d28d9',
    '#7c3aed',
    '#a78bfa',
    '#5b21b6',
    'var(--color-primary)',
    'var(--color-primary)',
    'var(--color-primary-hover)',
    '#60a5fa',
    '#1e3a8a',
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.25rem',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.75rem',
        }}
      >
        {[
          { id: 'peptides', label: 'Peptides' },
          { id: 'supplements', label: 'Supplements' },
          { id: 'protocols', label: 'Protocols' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'rgba(139,92,246,0.1)' : 'none',
                color: isActive ? '#8b5cf6' : 'var(--text-muted)',
                border: 'none',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {freqList.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          No {label} queries logged yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {freqList.map(({ name, count }, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '140px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  textAlign: 'right',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {name}
              </div>
              <div
                style={{
                  flex: 1,
                  height: '10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--border)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(count / max) * 100}%`,
                    borderRadius: 'var(--radius-sm)',
                    background: COLORS[i % COLORS.length],
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
              <div
                style={{
                  width: '28px',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                {count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
