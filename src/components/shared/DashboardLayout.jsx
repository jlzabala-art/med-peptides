import React, { useState, useEffect } from 'react';
import SidebarGadget from './AppSidebar/SidebarGadget';
import AppHeader from './AppHeader/index';
import RefillReminderBanner from './RefillReminderBanner';
import ClinicalAssistant from './ClinicalAssistant';
import OnboardingWizard from '../onboarding/OnboardingWizard';
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
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [overrideContextMode, setOverrideContextMode] = useState(null);
  const { userProfile } = useAuth();
  
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (userProfile && userProfile.onboardingCompleted === false) {
      setShowOnboarding(true);
    }
  }, [userProfile]);

  // Determine if AI is available
  const showAIButton = ['doctor', 'patient', 'admin'].includes(roleContext);

  // The sidebar has built-in mobile handling, but we can track mobile state here if needed
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleContextEvent = (e) => {
      // Temporarily override the AI context when opening from a product
      setOverrideContextMode('clinical');
      if (isMobile) {
        setIsAIOpen(true);
      } else {
        setIsAIOpen(true);
      }
    };
    window.addEventListener('OPEN_ATLAS_CLINICAL_MODE', handleContextEvent);
    return () => window.removeEventListener('OPEN_ATLAS_CLINICAL_MODE', handleContextEvent);
  }, [isMobile]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--background, #F4F8FB)' }}>
      {showOnboarding && <OnboardingWizard onClose={() => setShowOnboarding(false)} />}
      
      {/* Universal App Sidebar Gadget */}
      <SidebarGadget 
        {...sidebarProps} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isMobile={isMobile}
        prefsKey={`${roleContext}_sidebar`}
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
          onToggleDesktopAI={() => setIsAIOpen(!isAIOpen)}
          isDesktopAIOpen={isAIOpen}
          showDesktopAIToggle={false} // Disable header toggle since we have FAB
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

        </div>
      </div>

      {/* FAB for Clinical Assistant */}
      {showAIButton && !isAIOpen && (
        <button 
          onClick={() => setIsAIOpen(true)}
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
      
      {showAIButton && (
        <ClinicalAssistant 
          embedded={false} 
          isOpen={isAIOpen} 
          setIsOpen={setIsAIOpen} 
          pageContext={pageContext} 
          contextMode={overrideContextMode || (roleContext === 'admin' ? 'admin' : roleContext === 'doctor' ? 'doctor' : 'patient')}
        />
      )}
    </div>
  );
}
