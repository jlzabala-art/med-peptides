import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Plus, History, Settings, LogOut, ShieldCheck } from 'lucide-react';
import PortalLayout from '../components/ui/PortalLayout';
import DashboardEngine from '../engine/DashboardEngine';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';

const CLINIC_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    id: 'orders',
    label: 'Orders & Inventory',
    items: [
      { id: 'new-order', label: 'New Order', icon: Plus },
      { id: 'order-history', label: 'Order History', icon: History },
      { id: 'inventory', label: 'Inventory', icon: ShoppingBag },
    ],
  },
  {
    id: 'settings',
    label: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  }
];

function ClinicDashboardTab({ userProfile }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
            <ShieldCheck size={36} /> Panel de Clinic
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
            Gestión B2B, Pedidos y Panel de Control.
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
            {userProfile?.firstName?.[0] || 'C'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
              {userProfile?.firstName} {userProfile?.lastName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Clinic
            </div>
          </div>
        </div>
      </div>
      <DashboardEngine role="clinic" dataContext={{}} />
    </div>
  );
}

function PlaceholderTab() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      <h2 style={{ marginBottom: '1rem' }}>Coming Soon</h2>
      <p>This module is under development.</p>
    </div>
  );
}

export default function ClinicHome() {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive active tab from URL (e.g. /clinic-dashboard/inventory -> inventory)
  const pathParts = location.pathname.split('/').filter(Boolean);
  // Default to 'dashboard' if exactly /clinic-dashboard
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'dashboard';

  const clinicName = userProfile?.firstName
    ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim()
    : user?.displayName || 'Clinic';

  const handleLogout = () => {
    logout?.();
    window.location.href = '/';
  };

  return (
    <PortalLayout
      sidebarNavGroups={CLINIC_NAV_GROUPS}
      activeNavId={activeTab}
      onNavigate={(id) => navigate(`/clinic-dashboard/${id === 'dashboard' ? '' : id}`)}
      portalTitle="Clinic Portal"
      roleContext="clinic"
      pageContext={{
        activeTab: activeTab,
        label: CLINIC_NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Dashboard',
        group: CLINIC_NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab))?.label || 'Overview'
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
      <div style={{ padding: '2rem' }}>
        <AdminTabErrorBoundary tabId={activeTab} tabLabel={activeTab}>
          <Routes>
            <Route index element={<ClinicDashboardTab userProfile={userProfile} />} />
            <Route path="*" element={<PlaceholderTab />} />
          </Routes>
        </AdminTabErrorBoundary>
      </div>
    </PortalLayout>
  );
}
