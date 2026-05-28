import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Home, Search, Heart, GraduationCap, Shield, BookOpen, Activity, Stethoscope, Users, ShoppingBag, LogOut } from 'lucide-react';
import AppSidebar from './AppSidebar/index';
import AppHeader from './AppHeader/index';
import RefillReminderBanner from './RefillReminderBanner';
import ClinicalAssistant from './ClinicalAssistant';
import { useAuth } from '../../context/AuthContext';

const PUBLIC_GROUPS = [
  {
    id: 'discover', label: 'Discover', emoji: '🔍',
    items: [
      { id: '/', label: 'Home', icon: Home },
      { id: '/search', label: 'Catalog', icon: Search },
      { id: '/protocol-finder', label: 'Protocols', icon: Heart },
      { id: '/academy', label: 'Academy', icon: GraduationCap },
    ]
  },
  {
    id: 'resources', label: 'Resources', emoji: '📚',
    items: [
      { id: '/about', label: 'About Us', icon: Shield },
      { id: '/faq', label: 'FAQ', icon: BookOpen },
    ]
  }
];

const PATIENT_GROUPS = [
  {
    id: 'health', label: 'Health', emoji: '🧬',
    items: [
      { id: '/patient', label: 'Overview', icon: Activity },
      { id: '/patient/treatments', label: 'Treatments', icon: Heart },
      { id: '/patient/lab-results', label: 'Lab Results', icon: Stethoscope },
    ]
  },
  {
    id: 'care', label: 'Care Team', emoji: '🩺',
    items: [
      { id: '/patient/appointments', label: 'Appointments', icon: Users },
      { id: '/account/supervisor', label: 'My Supervisor', icon: Shield },
    ]
  },
  {
    id: 'account', label: 'Account', emoji: '📦',
    items: [
      { id: '/paciente', label: 'Orders & Settings', icon: ShoppingBag },
    ]
  }
];

export default function GlobalAppLayout({ 
  children, 
  showRefillBanner = false, 
  roleContext = "patient",
  cartCount = 0,
  onOpenCart,
  sidebarProps = null,
  headerProps = null
}) {
  const { user, activeRole, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Show ClinicalAssistant as a 3rd column for patients on desktop
  const isPatientOrPublic = user && activeRole !== 'admin' && activeRole !== 'professional' && activeRole !== 'wholesaler';
  const showRightSidebar = !isMobile && isPatientOrPublic;

  // Determine default sidebar props if none provided
  const computedSidebarProps = sidebarProps || {
    groups: isPatientOrPublic ? PATIENT_GROUPS : PUBLIC_GROUPS,
    activeId: location.pathname,
    onNavigate: (path) => navigate(path),
    header: { title: 'RegenPept', subtitle: user ? 'Patient Portal' : 'Store' },
    footer: user ? { label: 'Logout', icon: LogOut, onClick: () => { logout?.(); navigate('/login'); } } : undefined,
    accentColor: user ? '#0071bd' : '#0f172a'
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false); // Reset when going back to desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      
      {/* Universal App Sidebar */}
      <AppSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isMobile={isMobile}
        {...computedSidebarProps}
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
          onToggleSidebar={isMobile ? () => setIsSidebarOpen(!isSidebarOpen) : undefined}
          cartCount={cartCount}
          onOpenCart={onOpenCart}
          title={headerProps?.title}
          subtitle={headerProps?.subtitle}
          onSearchClick={headerProps?.onSearchClick}
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
            
            {children || <Outlet />}
          </main>

          {/* Right Sidebar Column (ClinicalAI) */}
          {showRightSidebar && (
            <aside style={{
              width: '400px',
              padding: '2rem 2.5rem 2rem 0',
              display: 'flex',
              flexDirection: 'column',
            }}>
              <ClinicalAssistant embedded={true} isOpen={true} setIsOpen={() => {}} />
            </aside>
          )}

        </div>
      </div>
    </div>
  );
}
