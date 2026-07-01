import React from 'react';

export default function StandardDrawerTabs({ tabs, activeTab, onChange }) {
  return (
    <div style={{ borderBottom: '1px solid #e2e8f0', marginTop: '1rem', marginBottom: '1rem' }}>
      <div className="modal-tabs-row" style={{ display: 'flex', gap: '0', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const tabId = typeof tab === 'object' ? tab.id : tab;
          const tabLabel = typeof tab === 'object' ? tab.label : tab;
          const isActive = activeTab === tabId;

          return (
            <button
              key={tabId}
              onClick={() => onChange(tabId)}
              style={{
                padding: '0.65rem 1.1rem',
                background: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2.5px solid #6366f1' : '2.5px solid transparent',
                color: isActive ? '#6366f1' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.875rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {tabLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
