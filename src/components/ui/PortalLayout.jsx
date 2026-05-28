import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, HelpCircle, User, Bot, X } from 'lucide-react';
import ClinicalAssistant from '../shared/ClinicalAssistant';

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
        height: '60px', 
        backgroundColor: 'var(--color-bg-surface)', 
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1rem',
        zIndex: 50
      }}>
        {/* Left Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Toggle Menu"
          >
            <Menu size={20} color="var(--color-text-secondary)" />
          </button>
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
            {portalTitle}
          </div>
        </div>

        {/* Center - Global Search (Optional) */}
        {!isMobile && (
          <div style={{ flex: 1, maxWidth: '600px', margin: '0 2rem' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search resources and services" 
                style={{
                  width: '100%',
                  padding: '0.5rem 1rem 0.5rem 2.2rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg-app)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  transition: 'background-color 0.2s, border-color 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'var(--color-bg-surface)';
                  e.target.style.borderColor = 'var(--color-primary)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'var(--color-bg-app)';
                  e.target.style.borderColor = 'var(--color-border)';
                }}
              />
            </div>
          </div>
        )}

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {headerActions}
          <button onClick={() => setAiOpen(!isAiOpen)} style={iconBtnStyle} title="Toggle Clinical AI">
            <Bot size={20} color={isAiOpen ? 'var(--color-primary)' : 'var(--color-text-secondary)'} />
          </button>
          <button style={iconBtnStyle} title="Help"><HelpCircle size={20} color="var(--color-text-secondary)" /></button>
          <button style={iconBtnStyle} title="Notifications"><Bell size={20} color="var(--color-text-secondary)" /></button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
            U
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR */}
        <aside style={{
          width: isSidebarOpen ? '220px' : '0px',
          backgroundColor: 'var(--color-bg-surface)',
          borderRight: isSidebarOpen ? '1px solid var(--color-border)' : 'none',
          transition: 'width 0.2s ease',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40
        }}>
          {isSidebarOpen && (
            <div style={{ padding: '1rem 0' }}>
              {sidebarNavGroups.map((group, gIdx) => (
                <div key={group.id || gIdx} style={{ marginBottom: '1.5rem' }}>
                  {group.label && (
                    <div style={{ padding: '0 1.5rem', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                      {group.label}
                    </div>
                  )}
                  <ul style={{ listStyle: 'none', margin: 0, padding: '0 0.5rem' }}>
                    {(group.items || []).map(item => {
                      const isActive = activeNavId === item.id;
                      const Icon = item.icon;
                      return (
                        <li key={item.id} style={{ margin: '0.15rem 0' }}>
                          <button
                            onClick={() => onNavigate && onNavigate(item.id)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.5rem 1rem',
                              borderRadius: 'var(--radius-full)', // pill shape like GCP
                              border: 'none',
                              backgroundColor: isActive ? 'var(--color-bg-selected)' : 'transparent',
                              color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                              fontWeight: isActive ? 600 : 500,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textAlign: 'left',
                              transition: 'background-color 0.15s, color 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {Icon && <Icon size={18} />}
                            {item.label}
                            {item.badge && (
                              <span style={{ marginLeft: 'auto', background: 'var(--color-primary)', color: 'white', fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '10px', fontWeight: 700 }}>
                                {item.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </aside>

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
                  <Bot size={18} /> Clinical Assistant
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
