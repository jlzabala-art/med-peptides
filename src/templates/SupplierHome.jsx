import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Globe, History, Settings, LogOut, Package } from 'lucide-react';
import PortalLayout from '../components/ui/PortalLayout';
import DashboardEngine from '../engine/DashboardEngine';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import OrdersTab from '../components/admin/OrdersTab';
import AdminClientsTab from '../components/admin/AdminClientsTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminAccountManagersTab from '../components/admin/AdminAccountManagersTab';
import ShippingTrackerTab from '../components/supplier/ShippingTrackerTab';
import ClinicalAIWidget from '../components/admin/ClinicalAIWidget';
const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));
const SUPPLIER_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    ],
  },
  {
    id: 'operations',
    label: 'B2B Sales Operations',
    items: [
      { id: 'catalog', label: 'Mass Catalog / APIs', icon: Package },
      { id: 'orders', label: 'Wholesale Orders', icon: ShoppingBag },
      { id: 'clients', label: 'B2B Clients', icon: Globe },
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

function SupplierDashboardTab({ userProfile }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
            <Globe size={36} /> Supplier Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>
            Panel de control B2B corporativo (Venta de materias primas y distribución masiva).
          </p>
        </div>
        
        <div style={{ background: 'white', padding: '1rem 1.5rem', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 800 }}>
            {userProfile?.firstName?.[0] || 'S'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
              {userProfile?.firstName} {userProfile?.lastName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Supplier
            </div>
          </div>
        </div>
      </div>
      <DashboardEngine role="supplier" dataContext={{}} />
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

export default function SupplierHome() {
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
      sidebarNavGroups={SUPPLIER_NAV_GROUPS}
      activeNavId={activeTab}
      onNavigate={(id) => navigate(`/supplier-dashboard/${id === 'dashboard' ? '' : id}`)}
      portalTitle="Supplier Portal"
      roleContext="supplier"
      pageContext={{
        activeTab: activeTab,
        label: SUPPLIER_NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Dashboard',
        group: SUPPLIER_NAV_GROUPS.find(g => g.items.some(i => i.id === activeTab))?.label || 'Overview'
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
            <Route index element={<SupplierDashboardTab userProfile={userProfile} />} />
            <Route path="messages" element={
              <React.Suspense fallback={<div>Cargando Mensajes...</div>}>
                <MessagingWidget role="supplier" />
              </React.Suspense>
            } />
            <Route path="orders" element={<OrdersTab buyerId={user?.uid} />} />
            <Route path="clients" element={<AdminClientsTab ownerId={user?.uid} ownerType="supplier" />} />
            <Route path="catalog" element={<AdminProductsTab readOnly={false} ownerId={user?.uid} ownerType="supplier" />} />
            <Route path="shipments" element={<ShippingTrackerTab supplierId={user?.uid} />} />
            <Route path="account-managers" element={<AdminAccountManagersTab supplierId={user?.uid} />} />
            <Route path="atlas-ai" element={
              <React.Suspense fallback={<div>Cargando Atlas Health AI...</div>}>
                <ClinicalAIWidget role="supplier" />
              </React.Suspense>
            } />
            <Route path="*" element={<PlaceholderTab />} />
          </Routes>
        </AdminTabErrorBoundary>
      </div>
    </PortalLayout>
  );
}
