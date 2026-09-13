import React from 'react';

export default function StandardDrawerTabs({ tabs, activeTab, onChange, onTabChange }) {
  const handleChange = onTabChange || onChange || (() => {});

  return (
    <div style={{ 
      borderBottom: '1px solid #e2e8f0', 
      background: '#f8fafc', 
      padding: '4px 12px 0 12px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div 
        style={{ 
          display: 'flex', 
          gap: '6px', 
          overflowX: 'auto', 
          flexWrap: 'nowrap',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '2px'
        }}
      >
        {tabs.map((tab) => {
          const tabId = typeof tab === 'object' ? tab.id : tab;
          const tabLabel = typeof tab === 'object' ? tab.label : tab;
          const isActive = activeTab === tabId;

          return (
            <button
              key={tabId}
              type="button"
              onClick={() => handleChange(tabId)}
              style={{
                padding: '8px 14px',
                background: isActive ? '#ffffff' : 'transparent',
                border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                borderBottom: isActive ? '2px solid var(--color-primary, #003666)' : '2px solid transparent',
                borderRadius: '6px 6px 0 0',
                color: isActive ? 'var(--color-primary, #003666)' : '#64748b',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s ease',
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
