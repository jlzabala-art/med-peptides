import React, { useState, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

import SupplierHome, { SupplierDashboardTab, PlaceholderTab } from '../templates/SupplierHome';
const UserSettings = lazy(() => import('../templates/UserSettings'));

// ── All tab components lazy-loaded for optimal code splitting ──────────────────
const OrdersTab = lazy(() => import('../components/admin/OrdersTab'));
import AdminMetricsDashboard from '../components/admin/AdminMetricsDashboard';
const MessagingWidget = lazy(() => import('../components/messaging/MessagingWidget'));
const ClinicalAIWidget = lazy(() => import('../components/admin/ClinicalAIWidget'));
const AdminClientsTab = lazy(() => import('../components/admin/AdminClientsTab'));
const CatalogIntelligenceHub = lazy(
  () => import('../components/admin/catalog/CatalogIntelligenceHub')
);
const AdminAccountManagersTab = lazy(() => import('../components/admin/AdminAccountManagersTab'));
const ShippingTrackerTab = lazy(() => import('../components/supplier/ShippingTrackerTab'));

// ── Premium loading skeleton ──────────────────────────────────────────────────
const TabSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.25rem' }} />
    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '1.5rem' }} />
    <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
  </div>
);

export default function SupplierRoutes() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  return (
    <Suspense fallback={<TabSkeleton />}>
      <Routes>
        <Route element={<SupplierHome />}>
          <Route index element={<SupplierDashboardTab />} />
          <Route
            path="orders"
            element={
              <AdminTabErrorBoundary tabId="orders" tabLabel="Orders">
                <OrdersTab buyerId={uid} />
              </AdminTabErrorBoundary>
            }
          />
          <Route
            path="clients"
            element={
              <AdminTabErrorBoundary tabId="clients" tabLabel="B2B Clients">
                <AdminClientsTab ownerId={uid} ownerType="supplier" />
              </AdminTabErrorBoundary>
            }
          />
          <Route
            path="catalog"
            element={
              <AdminTabErrorBoundary tabId="catalog" tabLabel="Mass Catalog / APIs">
                <CatalogIntelligenceHub readOnly={false} ownerId={uid} ownerType="supplier" />
              </AdminTabErrorBoundary>
            }
          />
          <Route
            path="shipments"
            element={
              <AdminTabErrorBoundary tabId="shipments" tabLabel="Shipping Tracker">
                <ShippingTrackerTab supplierId={uid} />
              </AdminTabErrorBoundary>
            }
          />
          <Route
            path="account-managers"
            element={
              <AdminTabErrorBoundary tabId="account-managers" tabLabel="Account Managers">
                <AdminAccountManagersTab supplierId={uid} />
              </AdminTabErrorBoundary>
            }
          />
          <Route
            path="messages"
            element={
              <AdminTabErrorBoundary tabId="messages" tabLabel="Messages">
                <MessagingWidget role="supplier" />
              </AdminTabErrorBoundary>
            }
          />
          <Route
            path="atlas-ai"
            element={
              <AdminTabErrorBoundary tabId="atlas-ai" tabLabel="Atlas Health">
                <ClinicalAIWidget role="supplier" />
              </AdminTabErrorBoundary>
            }
          />
          <Route
            path="settings"
            element={
              <AdminTabErrorBoundary tabId="settings" tabLabel="Settings">
                <UserSettings onBack={() => navigate('/supplier-dashboard')} />
              </AdminTabErrorBoundary>
            }
          />
          <Route path="*" element={<PlaceholderTab />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
