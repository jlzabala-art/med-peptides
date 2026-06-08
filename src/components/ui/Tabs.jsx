import React, { useState, useEffect } from 'react';

/**
 * Universal Tabs component (Material Design 3 / Google Cloud Style)
 * @param {Array} tabs - Array of { id, label, icon: Icon, content: ReactNode }
 * @param {string} defaultTab - ID of the tab to be active on mount
 * @param {string} activeTab - ID of the controlled active tab (optional)
 * @param {function} onChange - Callback when tab changes (optional)
 */
export function Tabs({ tabs = [], defaultTab, activeTab: controlledTab, onChange }) {
  const [internalTab, setInternalTab] = useState(defaultTab || (tabs[0]?.id));
  
  const isControlled = controlledTab !== undefined;
  const currentTab = isControlled ? controlledTab : internalTab;

  useEffect(() => {
    if (!isControlled && defaultTab) {
      setInternalTab(defaultTab);
    }
  }, [defaultTab, isControlled]);

  const handleTabClick = (id) => {
    if (!isControlled) {
      setInternalTab(id);
    }
    if (onChange) {
      onChange(id);
    }
  };

  const activeContent = tabs.find(t => t.id === currentTab)?.content;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {/* Tab Header List */}
      <div 
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border)',
          overflowX: 'auto',
          // hide scrollbar cleanly
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <style>
          {`.hide-scroll::-webkit-scrollbar { display: none; }`}
        </style>
        
        <div className="hide-scroll" style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-bottom-color 0.2s',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                  top: '1px' // Pull border over the container's bottom border
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--color-text-primary)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--color-text-secondary)';
                }}
              >
                {Icon && <Icon size={16} />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeContent !== undefined && activeContent !== null && (
        <div style={{ flex: 1, paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeContent}
        </div>
      )}
    </div>
  );
}

export default Tabs;
