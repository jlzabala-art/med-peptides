import LayoutDashboard from "lucide-react/dist/esm/icons/layout-dashboard";
import ShoppingBag from "lucide-react/dist/esm/icons/shopping-bag";
import Globe from "lucide-react/dist/esm/icons/globe";
import History from "lucide-react/dist/esm/icons/history";
import Settings from "lucide-react/dist/esm/icons/settings";
import LogOut from "lucide-react/dist/esm/icons/log-out";
import Package from "lucide-react/dist/esm/icons/package";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import React from 'react';
import { useAuth } from '../context/AuthContext';







import AppPortalLayout from '../layout/AppPortalLayout';
import DashboardEngine from '../engine/DashboardEngine';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import { Routes, Route, useNavigate, useLocation, Navigate, Outlet } from 'react-router-dom';

import OrdersTab from '../components/admin/OrdersTab';
import AdminClientsTab from '../components/admin/AdminClientsTab';
import CatalogIntelligenceHub from "../components/admin/catalog/CatalogIntelligenceHub";
import AdminAccountManagersTab from '../components/admin/AdminAccountManagersTab';
import ShippingTrackerTab from '../components/supplier/ShippingTrackerTab';
import ClinicalAIWidget from '../components/admin/ClinicalAIWidget';
import MessagingWidget from '../components/messaging/MessagingWidget';
const SUPPLIER_NAV_GROUPS = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'messages', label: 'Messages', icon: MessageSquare },
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

export function SupplierDashboardTab({ userProfile }) {
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

export function PlaceholderTab() {
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
    <AppPortalLayout allowedRoles={['supplier', 'admin']}>
      <div style={{ padding: '2rem' }}>
        <AdminTabErrorBoundary tabId={activeTab} tabLabel={activeTab}>
          <Outlet context={{ userProfile }} />
        </AdminTabErrorBoundary>
      </div>
    </AppPortalLayout>
  );
}