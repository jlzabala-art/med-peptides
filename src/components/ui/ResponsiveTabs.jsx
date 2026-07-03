import React from 'react';

/**
 * ResponsiveTabs
 * Maps a list of tabs to our standard responsive-tabs CSS structure.
 * Scrolls horizontally on mobile.
 */
export default function ResponsiveTabs({ 
  tabs, // Array of { id, label, icon: Icon }
  activeTab, 
  onTabChange,
  className = '',
  style = {}
}) {
  return (
    <div className={`responsive-tabs ${className}`} style={style} role="tablist">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            className={`responsive-tabs__tab ${isActive ? 'responsive-tabs__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-8)',
              background: 'transparent',
              border: 'none',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          >
            {Icon && <Icon size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
