import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Plus, History, Settings, LogOut, FlaskConical, Inbox } from 'lucide-react';
import PortalLayout from '../components/ui/PortalLayout';
import DashboardEngine from '../engine/DashboardEngine';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MessageSquare, Brain } from 'lucide-react';

const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));
const ClinicalAIWidget = React.lazy(() => import('../components/admin/ClinicalAIWidget'));

const PHARMACY_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'messages', label: 'Mensajes', icon: MessageSquare },
      { id: 'clinical-ai', label: 'Atlas Health', icon: Brain },
    ],
  },
  {
    id: 'sales',
    label: 'Sales & Formulations (Downstream)',
    items: [
      { id: 'incoming-orders', label: 'Incoming Orders', icon: Inbox },
      { id: 'formulations', label: 'Formulations', icon: FlaskConical },
    ],
  },
  {
    id: 'procurement',
    label: 'Procurement (Upstream)',
    items: [
      { id: 'new-order', label: 'Buy APIs & Products', icon: Plus },
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

function PharmacyDashboardTab({ userProfile }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
            <FlaskConical size={36} /> Compounding Pharmacy
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
            Gestión B2B Dual: Compras (APIs) y Ventas (Fórmulas Magistrales).
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
            {userProfile?.firstName?.[0] || 'P'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
              {userProfile?.firstName} {userProfile?.lastName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Compounding Pharmacy
            </div>
          </div>
        </div>
      </div>
      <DashboardEngine role="compounding_pharmacy" dataContext={{}} />
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

export default function PharmacyHome() {
  const { user, userProfile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'dashboard';

  const handleLogout = () => {
    logout?.();
    window.location.href = '/';
  };

  return (
    <PortalLayout
      sidebarNavGroups={PHARMACY_NAV_GROUPS}
      activeNavId={activeTab}
      onNavigate={(id) => navigate(`/pharmacy-dashboard/${id === 'dashboard' ? '' : id}`)}
      portalTitle="Pharmacy Portal"
      roleContext="compounding_pharmacy"
      pageContext={{
        activeTab: activeTab,
        label: PHARMACY_NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Dashboard',
        group: PHARMACY_NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab))?.label || 'Overview'
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
            <Route index element={<PharmacyDashboardTab userProfile={userProfile} />} />
            <Route path="messages" element={
              <React.Suspense fallback={<div>Cargando Mensajes...</div>}>
                <MessagingWidget role="compounding_pharmacy" />
              </React.Suspense>
            } />
            <Route path="clinical-ai" element={
              <React.Suspense fallback={<div>Cargando Atlas Health...</div>}>
                <ClinicalAIWidget />
              </React.Suspense>
            } />
            <Route path="*" element={<PlaceholderTab />} />
          </Routes>
        </AdminTabErrorBoundary>
      </div>
    </PortalLayout>
  );
}
