"use client";

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
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
import { getNavigationForRole } from '../../config/navigationRegistry';
import React, { useState, useEffect } from 'react';














import AppSidebar from './AppSidebar/index';
import AppHeader from './AppHeader/index';
import RefillReminderBanner from './RefillReminderBanner';
import AtlasAssistantDrawer from '../../layout/AtlasAssistantDrawer';
import { useAuth } from '../../context/AuthContext';
import { useSimulationStore } from '../../hooks/admin/useAdminRoleSimulation';
import { useRoleAccess } from '../../hooks/useRoleAccess';

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
  const { user, activeRole, baseRole, switchActiveRole, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isPatientOrPublic = user && activeRole !== 'admin' && activeRole !== 'professional' && activeRole !== 'wholesaler';
  const showAIButton = isPatientOrPublic;

  const currentEffectiveRole = activeRole || 'admin';
  const activeGroups = user ? getNavigationForRole(currentEffectiveRole) : [];

  // Determine default sidebar props if none provided
  const computedSidebarProps = sidebarProps || {
    groups: activeGroups,
    activeId: pathname,
    // item.id values in navigationRegistry are now absolute paths like /admin/patients
    // so we pass them directly to router.push
    onNavigate: (path) => router.push(path),
    footer: user ? { label: 'Logout', icon: LogOut, onClick: () => { logout?.(); router.push('/login'); } } : undefined
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSimulating = baseRole === 'admin' && activeRole !== 'admin';
  const roleLabel = activeRole;

  // Find simulation role metadata for styled banner
  const simulatedRoleData = isSimulating
    ? [{ id: 'ceo', label: 'CEO', emoji: '👔', color: '#0ea5e9' }, { id: 'medical_director', label: 'Medical Director', emoji: '🩺', color: '#10b981' }, { id: 'doctor', label: 'Doctor', emoji: '👨‍⚕️', color: '#14b8a6' }, { id: 'clinic_manager', label: 'Clinic Manager', emoji: '🏥', color: '#8b5cf6' }, { id: 'pharmacist', label: 'Pharmacist', emoji: '💊', color: '#f59e0b' }, { id: 'sales', label: 'Sales', emoji: '📈', color: '#ef4444' }, { id: 'operations', label: 'Operations', emoji: '⚙️', color: '#64748b' }, { id: 'finance', label: 'Finance', emoji: '💰', color: '#22c55e' }, { id: 'supplier', label: 'Supplier', emoji: '🏭', color: '#f97316' }, { id: 'patient', label: 'Patient', emoji: '🧬', color: '#ec4899' }].find(r => r.id === activeRole)
    : null;
  const bannerColor = simulatedRoleData?.color || '#f59e0b';

  const exitSimulation = () => {
    if (switchActiveRole) switchActiveRole('admin');
    router.push('/admin');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Simulation Banner */}
      {isSimulating && (
        <div style={{ 
          background: bannerColor,
          color: 'white', 
          padding: '7px 16px', 
          textAlign: 'center', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '16px', 
          zIndex: 1100, 
          fontWeight: 500, 
          fontSize: '13px',
          letterSpacing: '0.01em',
          flexShrink: 0,
        }}>
          <span>{simulatedRoleData?.emoji} Viewing as: <strong>{simulatedRoleData?.label || roleLabel}</strong></span>
          <button onClick={exitSimulation} style={{ 
            background: 'rgba(0,0,0,0.18)', 
            color: 'white', 
            border: '1px solid rgba(255,255,255,0.3)', 
            padding: '3px 10px', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontSize: '12px', 
            fontWeight: 700,
            transition: 'background 0.15s',
          }}>
            ✕ Exit Simulation
          </button>
        </div>
      )}
      
      <div style={{ display: 'flex', flex: 1 }}>
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
            {children}
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
            <AtlasAssistantDrawer isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
          )}

        </div>
      </div>
    </div>
    </div>
  );
}