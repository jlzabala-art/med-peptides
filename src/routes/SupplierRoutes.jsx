import React, { useState, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

import SupplierHome, { SupplierDashboardTab, PlaceholderTab } from '../templates/SupplierHome';
import UserSettings from '../templates/UserSettings';

// ── All tab components lazy-loaded for optimal code splitting ──────────────────
import OrdersTab from '../components/admin/OrdersTab';
import AdminMetricsDashboard from '../components/admin/AdminMetricsDashboard';
import MessagingWidget from '../components/messaging/MessagingWidget';
import ClinicalAIWidget from '../components/admin/ClinicalAIWidget';
import AdminClientsTab from '../components/admin/AdminClientsTab';
import CatalogIntelligenceHub from '../components/admin/catalog/CatalogIntelligenceHub';
import AdminAccountManagersTab from '../components/admin/AdminAccountManagersTab';
import ShippingTrackerTab from '../components/supplier/ShippingTrackerTab';

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
        <Route path="orders" element={
          <AdminTabErrorBoundary tabId="orders" tabLabel="Orders">
            <OrdersTab buyerId={uid} />
          </AdminTabErrorBoundary>
        } />
        <Route path="clients" element={
          <AdminTabErrorBoundary tabId="clients" tabLabel="B2B Clients">
            <AdminClientsTab ownerId={uid} ownerType="supplier" />
          </AdminTabErrorBoundary>
        } />
        <Route path="catalog" element={
          <AdminTabErrorBoundary tabId="catalog" tabLabel="Mass Catalog / APIs">
            <CatalogIntelligenceHub readOnly={false} ownerId={uid} ownerType="supplier" />
          </AdminTabErrorBoundary>
        } />
        <Route path="shipments" element={
          <AdminTabErrorBoundary tabId="shipments" tabLabel="Shipping Tracker">
            <ShippingTrackerTab supplierId={uid} />
          </AdminTabErrorBoundary>
        } />
        <Route path="account-managers" element={
          <AdminTabErrorBoundary tabId="account-managers" tabLabel="Account Managers">
            <AdminAccountManagersTab supplierId={uid} />
          </AdminTabErrorBoundary>
        } />
        <Route path="messages" element={
          <AdminTabErrorBoundary tabId="messages" tabLabel="Messages">
            <MessagingWidget role="supplier" />
          </AdminTabErrorBoundary>
        } />
        <Route path="atlas-ai" element={
          <AdminTabErrorBoundary tabId="atlas-ai" tabLabel="Atlas Health">
            <ClinicalAIWidget role="supplier" />
          </AdminTabErrorBoundary>
        } />
        <Route path="settings" element={
          <AdminTabErrorBoundary tabId="settings" tabLabel="Settings">
            <UserSettings onBack={() => navigate('/supplier-dashboard')} />
          </AdminTabErrorBoundary>
        } />
        <Route path="*" element={<PlaceholderTab />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
