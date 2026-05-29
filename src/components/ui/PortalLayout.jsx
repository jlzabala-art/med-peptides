import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, HelpCircle, User, Bot, X } from 'lucide-react';
import ClinicalAssistant from '../shared/ClinicalAssistant';
import SidebarGadget from '../shared/AppSidebar/SidebarGadget';

/**
 * PortalLayout - The universal layout wrapper for all private portals
 * Mimics Google Cloud Console layout (Left Sidebar + Topbar + Main Area + Right AI Drawer)
 */
export default function PortalLayout({ 
  children, 
  sidebarNavGroups = [], 
  activeNavId, 
  onNavigate,
  portalTitle = 'Cloud Console',
  roleContext = 'patient',
  pageContext = null,
  headerActions
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAiOpen, setAiOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // Holds live data injected by admin tab components via 'admin-context-update' events
  const [enrichedContext, setEnrichedContext] = useState(null);

  // Listen for context enrichment events from any admin tab
  useEffect(() => {
    const handleContextUpdate = (e) => {
      if (e?.detail) {
        setEnrichedContext(prev => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener('admin-context-update', handleContextUpdate);
    return () => window.removeEventListener('admin-context-update', handleContextUpdate);
  }, []);

  // Reset enrichedContext when the active tab/page changes
  useEffect(() => {
    setEnrichedContext(null);
  }, [pageContext?.activeTab]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
        setAiOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-bg-app)' }}>
      
      {/* TOPBAR */}
      <header style={{ 
        height: '60px', 
        background: 'rgba(255, 255, 255, 0.75)', 
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 50,
        color: 'var(--color-text-primary)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)'
      }}>
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Menu"
            >
              <Menu size={20} color="var(--color-text-primary)" />
            </button>
          )}
          <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--color-primary)', letterSpacing: '-0.3px' }}>
            {portalTitle}
          </div>
        </div>

        {/* Center - Global Search (Optional) */}
        {!isMobile && (
          <div style={{ flex: 1, maxWidth: '600px', margin: '0 2rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem 0.6rem 2.8rem',
                  borderRadius: '24px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = '#ffffff';
                  e.target.style.borderColor = 'var(--color-primary-light)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.08)';
                  e.target.style.boxShadow = 'inset 0 1px 3px rgba(0,0,0,0.02)';
                }}
              />
            </div>
          </div>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {headerActions}
          <button onClick={() => setAiOpen(!isAiOpen)} style={iconBtnStyle} title="Toggle System Assistant">
            <Bot size={20} color={isAiOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
          </button>
          <button style={iconBtnStyle} title="Help"><HelpCircle size={20} color="var(--color-text-secondary)" /></button>
          <button style={iconBtnStyle} title="Notifications"><Bell size={20} color="var(--color-text-secondary)" /></button>
          <div style={{ 
            width: '36px', height: '36px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            marginLeft: '0.75rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
            boxShadow: '0 2px 8px rgba(var(--color-primary-rgb), 0.3)'
          }}>
            U
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR GADGET */}
        <SidebarGadget 
          groups={sidebarNavGroups}
          activeId={activeNavId}
          onNavigate={onNavigate}
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={isMobile}
          header={{ title: '', subtitle: '' }} // Let PortalLayout topbar handle branding
          prefsKey={`${roleContext}_sidebar`}
        />

        {/* CENTER CONTENT */}
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          backgroundColor: 'var(--color-bg-app)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </main>

        {isAiOpen && (
          <aside style={{
            width: isMobile ? '100%' : '300px',
            position: isMobile ? 'absolute' : 'relative',
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'var(--color-bg-surface)',
            borderLeft: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: isMobile ? 60 : 40,
            boxShadow: isMobile ? '-4px 0 15px rgba(0,0,0,0.1)' : 'none'
          }}>
            {isMobile && (
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bot size={18} /> System Assistant
                </span>
                <button onClick={() => setAiOpen(false)} style={{ background: 'none', border: 'none' }}><X size={20} /></button>
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ClinicalAssistant 
                embedded={true} 
                isOpen={true} 
                setIsOpen={() => setAiOpen(false)} 
                pageContext={enrichedContext ? { ...pageContext, ...enrichedContext } : pageContext} 
                contextMode={roleContext} 
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  background: 'rgba(255,255,255,0.5)',
  border: '1px solid rgba(0,0,0,0.05)',
  padding: '0.5rem',
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
};
