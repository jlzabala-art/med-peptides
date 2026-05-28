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
        height: '48px', 
        backgroundColor: '#1a73e8', 
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 50,
        color: 'white'
      }}>
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Menu"
            >
              <Menu size={20} color="white" />
            </button>
          )}
          <div style={{ fontWeight: 500, fontSize: '1.1rem', color: 'white', letterSpacing: '0.2px' }}>
            {portalTitle}
          </div>
        </div>

        {/* Center - Global Search (Optional) */}
        {!isMobile && (
          <div style={{ flex: 1, maxWidth: '720px', margin: '0 2rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#5f6368' }} />
              <input 
                type="text" 
                placeholder="Search resources and services" 
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.5rem',
                  borderRadius: '4px',
                  border: '1px solid transparent',
                  backgroundColor: 'white',
                  color: '#3c4043',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'background-color 0.2s, box-shadow 0.2s',
                  boxShadow: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {headerActions}
          <button onClick={() => setAiOpen(!isAiOpen)} style={iconBtnStyle} title="Toggle System Assistant">
            <Bot size={20} color={isAiOpen ? '#8ab4f8' : 'white'} />
          </button>
          <button style={iconBtnStyle} title="Help"><HelpCircle size={20} color="white" /></button>
          <button style={iconBtnStyle} title="Notifications"><Bell size={20} color="white" /></button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0b57d0', border: '1px solid rgba(255,255,255,0.2)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
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
                pageContext={pageContext} 
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
  background: 'none',
  border: 'none',
  padding: '0.5rem',
  cursor: 'pointer',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s'
};
