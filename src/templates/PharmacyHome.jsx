import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, ShoppingBag, Plus, History, Settings, FlaskConical, Inbox } from 'lucide-react';
import AppPortalLayout from '../layout/AppPortalLayout';
import DashboardEngine from '../engine/DashboardEngine';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import { useLocation, Outlet } from 'react-router-dom';
import { MessageSquare, Brain } from 'lucide-react';

export const PHARMACY_NAV_GROUPS = [
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

export function PharmacyDashboardTab({ userProfile }) {
  const { userProfile: ctxProfile } = useAuth();
  const profile = userProfile || ctxProfile;
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
            {profile?.firstName?.[0] || 'P'}
          </div>
          <div>
            <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
              {profile?.firstName} {profile?.lastName}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Compounding Pharmacy</div>
          </div>
        </div>
      </div>
      <DashboardEngine role="compounding_pharmacy" dataContext={{}} />
    </div>
  );
}

export function PlaceholderTab() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      <h2 style={{ marginBottom: '1rem' }}>Coming Soon</h2>
      <p>This module is under development.</p>
    </div>
  );
}

export default function PharmacyHome() {
  const { userProfile } = useAuth();
  const location = useLocation();

  const pathParts = location.pathname.split('/').filter(Boolean);
  const activeTab = pathParts.length > 1 ? pathParts[pathParts.length - 1] : 'dashboard';

  return (
    <AppPortalLayout allowedRoles={['compounding_pharmacy', 'admin']}>
      <div style={{ padding: '2rem' }}>
        <AdminTabErrorBoundary tabId={activeTab} tabLabel={activeTab}>
          <Outlet context={{ userProfile }} />
        </AdminTabErrorBoundary>
      </div>
    </AppPortalLayout>
  );
}
