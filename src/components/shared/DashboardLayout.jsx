import React, { useState, useEffect } from 'react';
import SidebarGadget from './AppSidebar/SidebarGadget';
import AppHeader from './AppHeader/index';
import RefillReminderBanner from './RefillReminderBanner';
import ClinicalAssistant from './ClinicalAssistant';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ 
  sidebarProps, 
  headerProps, 
  children, 
  showRefillBanner = false, 
  roleContext = "patient",
  pageContext = null
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAIOpen, setIsMobileAIOpen] = useState(false);
  const [isDesktopAIOpen, setIsDesktopAIOpen] = useState(true);

  // Show ClinicalAssistant as a 3rd column for doctors, patients and admins on desktop
  const showRightSidebar = !isMobile && ['doctor', 'patient', 'admin'].includes(roleContext) && isDesktopAIOpen;

  // The sidebar has built-in mobile handling, but we can track mobile state here if needed
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background, #F4F8FB)' }}>
      
      {/* Universal App Sidebar Gadget */}
      <SidebarGadget 
        {...sidebarProps} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isMobile={isMobile}
      />

      {/* Main Content Area Wrapper */}
      <div style={{ 
        flex: 1, 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: 'column',
      }}>
        
        {/* Universal Utility Header */}
        <AppHeader 
          {...headerProps} 
          onToggleSidebar={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onToggleDesktopAI={() => setIsDesktopAIOpen(!isDesktopAIOpen)}
          isDesktopAIOpen={isDesktopAIOpen}
          showDesktopAIToggle={!isMobile && ['doctor', 'patient', 'admin'].includes(roleContext)}
        />

        {/* Content & Optional Right Sidebar Container */}
        <div style={{ 
          display: 'flex', 
          flex: 1, 
          overflow: 'hidden' // prevent overall scroll, let columns scroll individually
        }}>
          
          {/* Main Content Column */}
          <main style={{ 
            flex: 1, 
            minWidth: 0,
            padding: isMobile ? '1.5rem 1rem 4rem' : '2rem 2.5rem 4rem', 
            overflowY: 'auto' 
          }}>
            {showRefillBanner && (
              <div style={{ marginBottom: '1.5rem' }}>
                <RefillReminderBanner role={roleContext} />
              </div>
            )}
            
            {children}
          </main>

          {/* Right Sidebar Column (ClinicalAI) */}
          {showRightSidebar && (
            <aside style={{
              flex: '0 0 30%',
              minWidth: '320px',
              maxWidth: '400px',
              padding: '2rem 2.5rem 2rem 0',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <ClinicalAssistant embedded={true} isOpen={true} setIsOpen={() => setIsDesktopAIOpen(false)} pageContext={pageContext} contextMode={roleContext === 'admin' ? 'admin' : roleContext === 'doctor' ? 'doctor' : 'patient'} />
            </aside>
          )}

        </div>
      </div>

      {/* Mobile FAB for Clinical Assistant */}
      {isMobile && ['doctor', 'patient', 'admin'].includes(roleContext) && !isMobileAIOpen && (
        <button 
          onClick={() => setIsMobileAIOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary, #004b87)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            zIndex: 990,
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/></svg>
        </button>
      )}
      
      {isMobile && ['doctor', 'patient', 'admin'].includes(roleContext) && (
        <ClinicalAssistant 
          embedded={false} 
          isOpen={isMobileAIOpen} 
          setIsOpen={setIsMobileAIOpen} 
          pageContext={pageContext} 
          contextMode={roleContext === 'admin' ? 'admin' : roleContext === 'doctor' ? 'doctor' : 'patient'}
        />
      )}
    </div>
  );
}
