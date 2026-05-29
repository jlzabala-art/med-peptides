import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

import SupplierHome, { SupplierDashboardTab, PlaceholderTab } from '../templates/SupplierHome';
import OrdersTab from '../components/admin/OrdersTab';
import AdminMetricsDashboard from '../components/admin/AdminMetricsDashboard';
import MessagingWidget from '../components/messaging/MessagingWidget';
import ClinicalAIWidget from '../components/admin/ClinicalAIWidget';
import AdminClientsTab from '../components/admin/AdminClientsTab';
import AdminProductsTab from '../components/admin/AdminProductsTab';
import AdminAccountManagersTab from '../components/admin/AdminAccountManagersTab';
import ShippingTrackerTab from '../components/supplier/ShippingTrackerTab';

export default function SupplierRoutes() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [catalogToEdit, setCatalogToEdit] = useState(null);

  return (
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
            <AdminProductsTab readOnly={false} ownerId={uid} ownerType="supplier" />
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
          <AdminTabErrorBoundary tabId="messages" tabLabel="Mensajes">
            <React.Suspense fallback={<div>Cargando Mensajes...</div>}>
              <MessagingWidget role="supplier" />
            </React.Suspense>
          </AdminTabErrorBoundary>
        } />
        <Route path="atlas-ai" element={
          <AdminTabErrorBoundary tabId="atlas-ai" tabLabel="Atlas Health">
            <React.Suspense fallback={<div>Cargando Atlas Health AI...</div>}>
              <ClinicalAIWidget role="supplier" />
            </React.Suspense>
          </AdminTabErrorBoundary>
        } />
        <Route path="*" element={<PlaceholderTab />} />
      </Route>
    </Routes>
  );
}
