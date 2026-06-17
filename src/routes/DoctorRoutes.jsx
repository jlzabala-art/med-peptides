import React, { lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useOutletContext, Navigate } from 'react-router-dom';

import AdminTabErrorBoundary from '../components/admin/AdminTabErrorBoundary';
import DoctorDashboard from '../templates/DoctorDashboard';
const UserSettings = lazy(() => import('../templates/UserSettings'));

// ── Eager imports (small, always used) ───────────────────────────────────────
const DoctorOverviewTab = lazy(() => import('../components/doctor/DoctorOverviewTab'));
const PhysicianPatientsTab = lazy(() => import('../components/doctor/DoctorPatientsTab'));
const PhysicianRecommendationsTab = lazy(() => import('../components/doctor/DoctorRecommendationsTab'));
const PhysicianOrdersTab = lazy(() => import('../components/doctor/DoctorOrdersTab'));
const PhysicianProtocolsTab = lazy(() => import('../components/doctor/DoctorProtocolsTab'));
const DoctorPrescriptionsTab = lazy(() => import('../components/doctor/DoctorPrescriptionsTab'));
const PhysicianAssistantsTab = lazy(() => import('../components/doctor/DoctorAssistantsTab'));
const DoctorMessagesTab = lazy(() => import('../components/doctor/DoctorMessagesTab'));

// ── Additional Templates ─────────────────────────────────────────────────────
const DoctorAppointments = lazy(() => import('../templates/DoctorAppointments'));
const DoctorLabResults = lazy(() => import('../templates/DoctorLabResults'));
const DoctorResearch = lazy(() => import('../templates/DoctorResearch'));

// ── Lazy ─────────────────────────────────────────────────────────────────────
const CatalogCreatorFlow = lazy(() => import('../components/wholesaler/CatalogCreatorFlow'));
const UserProfileTab = lazy(() => import('../components/shared/UserProfileTab'));

const TabSkeleton = () => (
  <div style={{ padding: '2rem' }}>
    <div className="skeleton" style={{ height: 28, width: 200, marginBottom: '1.25rem' }} />
    <div className="skeleton" style={{ height: 14, width: '50%', marginBottom: '1.5rem' }} />
    <div className="skeleton" style={{ height: 240, borderRadius: 12 }} />
  </div>
);

// ── Bridge wrappers: get doctorId/meta from DoctorDashboard Outlet context ────
function OverviewWrapper() {
  const { doctorId, doctorMeta, sharedPatients, navigate } = useOutletContext() || {};
  return (
    <DoctorOverviewTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
      onNavigate={(id) => navigate?.(`/doctor/${id === 'overview' ? '' : id}`)}
    />
  );
}

function NewPrescriptionWrapper() {
  const { doctorId, doctorMeta, sharedPatients, navigate } = useOutletContext() || {};
  return (
    <DoctorPrescriptionsTab
      key="new-prescription"
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
      initialBuilderOpen={true}
      hideHistory={true}
      onSavedRedirect={() => navigate?.('/doctor/prescriptions-history')}
    />
  );
}

function PrescriptionsHistoryWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useOutletContext() || {};
  return (
    <DoctorPrescriptionsTab
      key="prescriptions-history"
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
      initialBuilderOpen={false}
      hideHistory={false}
    />
  );
}

function PatientsWrapper() {
  const { doctorId, doctorMeta, setSharedPatients } = useOutletContext() || {};
  return (
    <PhysicianPatientsTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      onPatientsLoaded={setSharedPatients}
    />
  );
}

function OrdersWrapper() {
  const { doctorId, sharedPatients } = useOutletContext() || {};
  return <PhysicianOrdersTab doctorId={doctorId} patients={sharedPatients} />;
}

function RecommendationsWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useOutletContext() || {};
  return (
    <PhysicianRecommendationsTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
    />
  );
}

function ProtocolsWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useOutletContext() || {};
  return (
    <PhysicianProtocolsTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
    />
  );
}

function CatalogBuilderWrapper() {
  const { doctorId } = useOutletContext() || {};
  return <CatalogCreatorFlow ownerId={doctorId} ownerType="doctor" />;
}

function MessagesWrapper() {
  const { doctorId } = useOutletContext() || {};
  return <DoctorMessagesTab doctorId={doctorId} />;
}

function AssistantsWrapper() {
  const { doctorId, doctorMeta } = useOutletContext() || {};
  return <PhysicianAssistantsTab doctorId={doctorId} doctorMeta={doctorMeta} />;
}

function SettingsWrapper() {
  const navigate = useNavigate();
  return <UserSettings onBack={() => navigate('/doctor')} />;
}

function AppointmentsWrapper() {
  return <DoctorAppointments />;
}

function LabResultsWrapper() {
  return <DoctorLabResults />;
}

function ResearchWrapper() {
  return <DoctorResearch />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DoctorRoutes() {
  return (
    <Suspense fallback={<TabSkeleton />}>
      <Routes>
        <Route element={<DoctorDashboard />}>
          <Route index element={
            <AdminTabErrorBoundary tabId="overview" tabLabel="Overview">
              <OverviewWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="new-prescription" element={
            <AdminTabErrorBoundary tabId="new-prescription" tabLabel="New Prescription">
              <NewPrescriptionWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="prescriptions-history" element={
            <AdminTabErrorBoundary tabId="prescriptions-history" tabLabel="Prescriptions History">
              <PrescriptionsHistoryWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="patients" element={
            <AdminTabErrorBoundary tabId="patients" tabLabel="My Patients">
              <PatientsWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="orders" element={
            <AdminTabErrorBoundary tabId="orders" tabLabel="Orders">
              <OrdersWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="recommendations" element={
            <AdminTabErrorBoundary tabId="recommendations" tabLabel="Recommendations">
              <RecommendationsWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="protocols" element={
            <AdminTabErrorBoundary tabId="protocols" tabLabel="Protocols">
              <ProtocolsWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="catalog-builder" element={
            <AdminTabErrorBoundary tabId="catalog-builder" tabLabel="Catalog Builder">
              <CatalogBuilderWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="messages" element={
            <AdminTabErrorBoundary tabId="messages" tabLabel="Messages">
              <MessagesWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="appointments" element={
            <AdminTabErrorBoundary tabId="appointments" tabLabel="Appointments">
              <AppointmentsWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="lab-results" element={
            <AdminTabErrorBoundary tabId="lab-results" tabLabel="Lab Results">
              <LabResultsWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="research" element={
            <AdminTabErrorBoundary tabId="research" tabLabel="Research">
              <ResearchWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="assistants" element={
            <AdminTabErrorBoundary tabId="assistants" tabLabel="Staff & Assistants">
              <AssistantsWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="settings" element={
            <AdminTabErrorBoundary tabId="settings" tabLabel="Settings">
              <SettingsWrapper />
            </AdminTabErrorBoundary>
          } />
          <Route path="my-profile" element={
            <AdminTabErrorBoundary tabId="my-profile" tabLabel="My Profile">
              <UserProfileTab />
            </AdminTabErrorBoundary>
          } />
          <Route path="*" element={<Navigate to="" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
