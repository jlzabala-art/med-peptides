"use client";

import React, { useState, useEffect, useRef } from 'react';

/**
 * Universal Tabs component (Google Cloud Console Style)
 *
 * Mobile-First Rule (Golden Rule #23):
 * ─────────────────────────────────────────────────────
 * On viewports < 768px, the tab bar renders as a NATIVE <select> dropdown.
 * NO horizontal scrolling. NO whiteSpace:nowrap overflow on mobile. Ever.
 *
 * Desktop (≥768px): standard horizontal underline tab bar.
 * Mobile  (<768px): full-width styled <select> with active tab label.
 *
 * @param {Array}    tabs          - Array of { id, label, icon: Icon, content: ReactNode, count?: number }
 * @param {string}   defaultTab    - ID of the tab active on mount
 * @param {string}   activeTab     - Controlled active tab ID (optional)
 * @param {function} onChange      - Callback when tab changes
 * @param {boolean}  mobileSelect  - Force select mode regardless of viewport (default: auto-detect)
 */
export function Tabs({ tabs = [], defaultTab, activeTab: controlledTab, onChange, mobileSelect }) {
  const [internalTab, setInternalTab] = useState(defaultTab || tabs[0]?.id);
  const [isMobile, setIsMobile] = useState(false);
  const resizeRef = useRef(null);

  // Detect mobile viewport
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    resizeRef.current = check;
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const isControlled = controlledTab !== undefined;
  const currentTab = isControlled ? controlledTab : internalTab;

  useEffect(() => {
    if (!isControlled && defaultTab) {
      setInternalTab(defaultTab);
    }
  }, [defaultTab, isControlled]);

  const handleTabClick = (id) => {
    if (!isControlled) setInternalTab(id);
    if (onChange) onChange(id);
  };

  const activeContent = tabs.find(t => t.id === currentTab)?.content;
  const activeTabData = tabs.find(t => t.id === currentTab);
  const useMobileSelect = mobileSelect !== undefined ? mobileSelect : isMobile;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>

      {/* ── MOBILE: Full-width select dropdown (GCP pattern) ─────────────── */}
      {useMobileSelect ? (
        <div style={{ padding: '0 0 0.75rem 0' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={currentTab}
              onChange={(e) => handleTabClick(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 2.5rem 0.65rem 0.9rem',
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--color-primary, #003666)',
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-primary, #003666)',
                borderRadius: '8px',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
                outline: 'none',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {tabs.map(tab => {
                const Icon = tab.icon;
                const countStr = tab.count != null ? ` (${tab.count})` : '';
                return (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}{countStr}
                  </option>
                );
              })}
            </select>
            {/* Chevron icon */}
            <div style={{
              position: 'absolute',
              right: '0.7rem',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: 'var(--color-primary, #003666)',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
          {/* Active tab badge indicator */}
          {activeTabData && (
            <div style={{
              marginTop: '0.35rem',
              fontSize: '0.72rem',
              color: '#64748b',
              paddingLeft: '0.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary, #003666)',
                display: 'inline-block',
                flexShrink: 0
              }} />
              <span>Viewing: <strong>{activeTabData.label}</strong></span>
            </div>
          )}
        </div>

      ) : (
        /* ── DESKTOP: Standard horizontal underline tab bar ────────────── */
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-border, #e2e8f0)',
        }}>
          <div style={{
            display: 'flex',
            gap: '1.25rem',
            width: '100%',
            paddingBottom: '2px'
          }}>
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
                    position: 'relative',
                    top: '1px'
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
                  {tab.count != null && (
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? 'var(--color-primary, #003666)' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#64748b',
                      marginLeft: '2px'
                    }}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tab Content ────────────────────────────────────────────────────── */}
      {activeContent !== undefined && activeContent !== null && (
        <div style={{ flex: 1, paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {activeContent}
        </div>
      )}
    </div>
  );
}

export default Tabs;
