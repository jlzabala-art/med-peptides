"use client";

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
        
        <div className="hide-scroll" style={{ display: 'flex', gap: '1.25rem', minWidth: '100%', overflowX: 'auto', paddingBottom: '2px' }}>
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
                  padding: '0.75rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--color-primary, #0d9488)' : 'var(--color-text-secondary, #64748b)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-primary, #0d9488)' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  minWidth: 'max-content',
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
