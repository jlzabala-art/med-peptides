import Home from "lucide-react/dist/esm/icons/home";
import Search from "lucide-react/dist/esm/icons/search";
import Heart from "lucide-react/dist/esm/icons/heart";
import GraduationCap from "lucide-react/dist/esm/icons/graduation-cap";
import Shield from "lucide-react/dist/esm/icons/shield";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Activity from "lucide-react/dist/esm/icons/activity";
import Stethoscope from "lucide-react/dist/esm/icons/stethoscope";
import Users from "lucide-react/dist/esm/icons/users";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Building from "lucide-react/dist/esm/icons/building";
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';













import AppSidebar from './AppSidebar/index';
import AppHeader from './AppHeader/index';
import RefillReminderBanner from './RefillReminderBanner';
import ClinicalAssistant from './ClinicalAssistant';
import { useAuth } from '../../context/AuthContext';

const PUBLIC_GROUPS = [
  {
    id: 'discover', label: 'Discover',
    items: [
      { id: '/', label: 'Home', icon: Home },
      { id: '/search', label: 'Catalog', icon: Search },
      { id: '/protocol-finder', label: 'Protocols', icon: Heart },
      { id: '/academy', label: 'Academy', icon: GraduationCap },
    ]
  }
];

const PATIENT_GROUPS = [
  {
    id: 'health', label: 'Health',
    items: [
      { id: '/patient', label: 'Overview', icon: Activity },
      { id: '/patient/treatments', label: 'Treatments', icon: Heart },
      { id: '/patient/lab-results', label: 'Lab Results', icon: Stethoscope },
    ]
  }
];

const CEO_GROUPS = [
  {
    id: 'executive', label: 'Executive',
    items: [
      { id: '/admin', label: 'Command Center', icon: Activity },
      { id: '/finance', label: 'Finance', icon: ShoppingBag },
      { id: '/analytics', label: 'Analytics', icon: Search }
    ]
  }
];

const MEDICAL_GROUPS = [
  {
    id: 'clinical', label: 'Clinical',
    items: [
      { id: '/admin', label: 'Command Center', icon: Activity },
      { id: '/patients', label: 'Patients', icon: Users },
      { id: '/physicians', label: 'Physicians', icon: Stethoscope },
      { id: '/programs', label: 'Programs', icon: Heart }
    ]
  }
];

const OPERATIONS_GROUPS = [
  {
    id: 'ops', label: 'Operations',
    items: [
      { id: '/admin', label: 'Command Center', icon: Activity },
      { id: '/orders', label: 'Orders', icon: ShoppingBag },
      { id: '/tasks', label: 'Tasks', icon: Search },
      { id: '/suppliers', label: 'Suppliers', icon: Building }
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
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isPatientOrPublic = user && activeRole !== 'admin' && activeRole !== 'professional' && activeRole !== 'wholesaler';
  const showAIButton = isPatientOrPublic;

  // Determine role-aware groups
  let activeGroups = PUBLIC_GROUPS;
  if (user) {
    if (activeRole === 'admin') {
      if (roleContext === 'ceo') activeGroups = CEO_GROUPS;
      else if (roleContext === 'medical') activeGroups = MEDICAL_GROUPS;
      else activeGroups = OPERATIONS_GROUPS;
    } else if (isPatientOrPublic) {
      activeGroups = PATIENT_GROUPS;
    }
  }

  // Determine default sidebar props if none provided
  const computedSidebarProps = sidebarProps || {
    groups: activeGroups,
    activeId: location.pathname,
    onNavigate: (path) => navigate(path),
    footer: user ? { label: 'Logout', icon: LogOut, onClick: () => { logout?.(); navigate('/login'); } } : undefined
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Universal App Sidebar */}
      <AppSidebar 
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

          {/* AI Floating Action Button */}
          {showAIButton && !isAssistantOpen && (
            <button
              onClick={() => setIsAssistantOpen(true)}
              style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2.5rem',
                width: '56px',
                height: '56px',
                borderRadius: '28px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9000,
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              <Sparkles size={24} />
            </button>
          )}

          {/* Assistant Drawer Overlay */}
          {showAIButton && (
            <ClinicalAssistant 
              embedded={false} 
              isOpen={isAssistantOpen} 
              setIsOpen={setIsAssistantOpen} 
            />
          )}

        </div>
      </div>
    </div>
  );
}