import React, { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, User, Calendar, Beaker, ClipboardList, 
  LogOut, ShieldCheck, HeartPulse, Stethoscope 
} from 'lucide-react';
import PortalLayout from '../components/ui/PortalLayout';

export default function ClinicalLayout() {
  const { user, isPhysician, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect or show loader if auth state isn't ready
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(0,54,102,0.12)', borderTopColor: 'var(--color-primary)', animation: 'spin 0.9s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Define navigation based on clinical role
  // Using PINNED_ITEMS pattern from AdminDashboard for simplicity
  const pinnedItems = isPhysician ? [
    { id: 'dashboard', label: 'Overview', path: '/doctor', icon: Activity },
    { id: 'patients', label: 'My Patients', path: '/doctor/patients', icon: User },
    { id: 'appointments', label: 'Appointments', path: '/doctor/appointments', icon: Calendar },
    { id: 'lab-results', label: 'Lab Results', path: '/doctor/lab-results', icon: Beaker },
    { id: 'research', label: 'Research', path: '/doctor/research', icon: ClipboardList }
  ] : [
    { id: 'treatments', label: 'My Treatments', path: '/patient/treatments', icon: Beaker },
    { id: 'appointments', label: 'Appointments', path: '/patient/appointments', icon: Calendar },
    { id: 'lab-results', label: 'Results', path: '/patient/lab-results', icon: Activity }
  ];

  // Map current path to active item ID
  const currentPath = location.pathname;
  const currentItem = pinnedItems.find(item => item.path === currentPath) || pinnedItems[0];
  const activeTab = currentItem?.id || 'dashboard';

  const navToTab = useCallback((tabId) => {
    const targetItem = pinnedItems.find(item => item.id === tabId);
    if (targetItem) {
      navigate(targetItem.path);
    }
  }, [navigate, pinnedItems]);

  const handleLogout = () => { if (logout) logout(); window.location.href = '/'; };

  return (
    <PortalLayout 
      sidebarNavGroups={[]} // No collapsible groups for clinical yet
      sidebarPinnedItems={pinnedItems}
      activeNavId={activeTab}
      onNavigate={navToTab}
      portalTitle={isPhysician ? "Physician Portal" : "Patient Portal"}
      roleContext={isPhysician ? "physician" : "patient"}
      pageContext={{
        activeTab: activeTab,
        label: currentItem?.label || 'Dashboard',
        group: isPhysician ? 'Clinical Desk' : 'Health Record'
      }}
      headerActions={
        <button 
          onClick={handleLogout} 
          style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title="Logout"
        >
          <LogOut size={18} color="var(--color-text-secondary)" />
        </button>
      }
    >
      <div style={{ padding: '1rem' }}>
        <Outlet />
      </div>
    </PortalLayout>
  );
}
