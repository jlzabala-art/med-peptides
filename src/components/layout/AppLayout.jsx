"use client";

import React, { useState } from 'react';
import { Menu, X } from '@/lib/icons';

/**
 * AppLayout
 * A highly responsive application shell for the Global Responsive Base Kit.
 * Handles desktop fixed sidebar, tablet collapsible sidebar, and mobile drawer.
 */
export default function AppLayout({
  sidebarContent,
  headerContent,
  children,
  isMobileDrawerOpen,
  setMobileDrawerOpen,
}) {
  const [isTabletCollapsed, setTabletCollapsed] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile Overlay */}
      {isMobileDrawerOpen && (
        <div 
          className="mobile-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40
          }}
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`app-sidebar ${isMobileDrawerOpen ? 'mobile-open' : ''} ${isTabletCollapsed ? 'tablet-collapsed' : ''}`}
        style={{
          ...(isMobileDrawerOpen ? { display: 'block', position: 'fixed', height: '100vh' } : {})
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-16)' }}>
          {/* Logo or Brand would go here inside sidebarContent typically */}
          {isMobileDrawerOpen && (
            <button 
              onClick={() => setMobileDrawerOpen(false)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="app-sidebar-content" style={{ padding: '0 var(--space-16)', overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="app-main">
        {/* Sticky Header */}
        <header 
          className="app-header"
          style={{
            position: 'sticky',
            top: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--border)',
            zIndex: 30,
            padding: 'var(--space-16) var(--space-24)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-16)',
            minHeight: '72px'
          }}
        >
          {/* Hamburger for mobile */}
          <button 
            className="mobile-menu-btn"
            style={{ display: 'none', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setMobileDrawerOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div style={{ flex: 1 }}>
            {headerContent}
          </div>
        </header>

        {/* Scrollable Content Container */}
        <div className="content-container">
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 767px) {
          .mobile-menu-btn { display: block !important; }
          .app-sidebar:not(.mobile-open) { display: none; }
          .app-header { padding: var(--space-12) var(--space-16) !important; min-height: 64px !important; }
        }
      `}</style>
    </div>
  );
}
