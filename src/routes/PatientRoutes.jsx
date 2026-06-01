import React, { Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardEngine from '../engine/DashboardEngine';
import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';

import PatientHome from '../templates/PatientHome';
import PatientAppointments from '../templates/PatientAppointments';
import UserSettings from '../templates/UserSettings';

const MessagingWidget = React.lazy(() => import('../components/messaging/MessagingWidget'));
const ClinicalAIWidget = React.lazy(() => import('../components/admin/ClinicalAIWidget'));
const PatientPrescriptionPanel = React.lazy(() => import('../components/patient/PatientPrescriptionPanel'));
const OrdersTab = React.lazy(() => import('../components/admin/OrdersTab'));
const UserProfileTab = React.lazy(() => import('../components/shared/UserProfileTab'));

const TabSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.25rem' }} />
    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '1.5rem' }} />
    <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
  </div>
);

export default function PatientRoutes() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();

  return (
    <Suspense fallback={<TabSkeleton />}>
      <Routes>
        <Route element={<PatientHome />}>
          <Route index element={
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
              <DashboardEngine role="patient" dataContext={{}} />
            </div>
          } />
          <Route path="prescriptions" element={
            <AdminTabErrorBoundary tabId="prescriptions" tabLabel="Prescriptions">
              <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
                <PatientPrescriptionPanel patientUid={uid} />
              </div>
            </AdminTabErrorBoundary>
          } />
          <Route path="messages" element={
            <AdminTabErrorBoundary tabId="messages" tabLabel="Messages">
              <div style={{ height: 'calc(100vh - 80px)', margin: '-1.5rem' }}>
                <MessagingWidget />
              </div>
            </AdminTabErrorBoundary>
          } />
          <Route path="clinical-ai" element={
            <AdminTabErrorBoundary tabId="clinical-ai" tabLabel="Atlas Health">
              <div style={{ height: 'calc(100vh - 80px)', margin: '-1.5rem' }}>
                <ClinicalAIWidget />
              </div>
            </AdminTabErrorBoundary>
          } />
          <Route path="appointments" element={
            <AdminTabErrorBoundary tabId="appointments" tabLabel="Care Team">
              <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
                <PatientAppointments />
              </div>
            </AdminTabErrorBoundary>
          } />
          <Route path="orders" element={
            <AdminTabErrorBoundary tabId="orders" tabLabel="My Orders">
              <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
                <OrdersTab buyerId={uid} readOnly={true} />
              </div>
            </AdminTabErrorBoundary>
          } />
          <Route path="settings" element={
            <AdminTabErrorBoundary tabId="settings" tabLabel="Settings">
              <UserSettings onBack={() => navigate('/patient')} />
            </AdminTabErrorBoundary>
          } />
          <Route path="my-profile" element={
            <AdminTabErrorBoundary tabId="my-profile" tabLabel="My Profile">
              <div style={{ padding: '0 1.5rem 4rem' }}>
                <UserProfileTab />
              </div>
            </AdminTabErrorBoundary>
          } />
          <Route path="*" element={<Navigate to="" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
