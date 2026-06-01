import React, { Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

import PharmacyHome, { PharmacyDashboardTab, PlaceholderTab } from '../templates/PharmacyHome';
import UserSettings from '../templates/UserSettings';

const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));
const ClinicalAIWidget = React.lazy(() => import('../components/admin/ClinicalAIWidget'));
const OrdersTab = React.lazy(() => import('../components/admin/OrdersTab'));

const TabSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.25rem' }} />
    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '1.5rem' }} />
    <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
  </div>
);

export default function PharmacyRoutes() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();

  return (
    <Suspense fallback={<TabSkeleton />}>
      <Routes>
        <Route element={<PharmacyHome />}>
          <Route index element={<PharmacyDashboardTab />} />
          <Route path="messages" element={
            <AdminTabErrorBoundary tabId="messages" tabLabel="Messages">
              <MessagingWidget role="compounding_pharmacy" />
            </AdminTabErrorBoundary>
          } />
          <Route path="clinical-ai" element={
            <AdminTabErrorBoundary tabId="clinical-ai" tabLabel="Atlas Health">
              <ClinicalAIWidget />
            </AdminTabErrorBoundary>
          } />
          <Route path="incoming-orders" element={
            <AdminTabErrorBoundary tabId="incoming-orders" tabLabel="Incoming Orders">
              <OrdersTab buyerId={uid} readOnly={true} />
            </AdminTabErrorBoundary>
          } />
          <Route path="formulations" element={
            <AdminTabErrorBoundary tabId="formulations" tabLabel="Formulations">
              <PlaceholderTab />
            </AdminTabErrorBoundary>
          } />
          <Route path="new-order" element={
            <AdminTabErrorBoundary tabId="new-order" tabLabel="Buy APIs & Products">
              <PlaceholderTab />
            </AdminTabErrorBoundary>
          } />
          <Route path="order-history" element={
            <AdminTabErrorBoundary tabId="order-history" tabLabel="Order History">
              <OrdersTab buyerId={uid} readOnly={true} />
            </AdminTabErrorBoundary>
          } />
          <Route path="inventory" element={
            <AdminTabErrorBoundary tabId="inventory" tabLabel="Inventory">
              <PlaceholderTab />
            </AdminTabErrorBoundary>
          } />
          <Route path="settings" element={
            <AdminTabErrorBoundary tabId="settings" tabLabel="Settings">
              <UserSettings onBack={() => navigate('/pharmacy-dashboard')} />
            </AdminTabErrorBoundary>
          } />
          <Route path="*" element={<PlaceholderTab />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
