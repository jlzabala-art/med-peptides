'use client';
import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { PatientContext } from '../../../templates/PatientHome';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

// ── Dynamic imports ──────────────────────────────────────────────────────────
const PatientPrescriptionPanel = dynamic(() => import('../../../components/patient/PatientPrescriptionPanel'), { ssr: false });
const MessagingWidget = dynamic(() => import('../../../components/messaging/MessagingWidget'), { ssr: false });
const ClinicalAIWidget = dynamic(() => import('../../../components/admin/ClinicalAIWidget'), { ssr: false });
const PatientAppointments = dynamic(() => import('../../../templates/PatientAppointments'), { ssr: false });
const OrdersTab = dynamic(() => import('../../../components/admin/OrdersTab'), { ssr: false });
const UserSettings = dynamic(() => import('../../../templates/UserSettings'), { ssr: false });
const UserProfileTab = dynamic(() => import('../../../components/shared/UserProfileTab'), { ssr: false });

// ── Bridge wrappers ──────────────────────────────────────────────────────────
function PrescriptionsWrapper() {
  const { uid } = useContext(PatientContext) || {};
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <PatientPrescriptionPanel patientUid={uid} />
    </div>
  );
}

function MessagesWrapper() {
  return (
    <div style={{ height: 'calc(100vh - 80px)', margin: '-1.5rem' }}>
      <MessagingWidget />
    </div>
  );
}

function ClinicalAIWrapper() {
  return (
    <div style={{ height: 'calc(100vh - 80px)', margin: '-1.5rem' }}>
      <ClinicalAIWidget />
    </div>
  );
}

function AppointmentsWrapper() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <PatientAppointments />
    </div>
  );
}

function OrdersWrapper() {
  const { uid } = useContext(PatientContext) || {};
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
      <OrdersTab buyerId={uid} readOnly={true} />
    </div>
  );
}

function SettingsWrapper() {
  const router = useRouter();
  return <UserSettings onBack={() => router.push('/patient')} />;
}

function ProfileWrapper() {
  return (
    <div style={{ padding: '0 1.5rem 4rem' }}>
      <UserProfileTab />
    </div>
  );
}

// ── Main Dynamic Router ──────────────────────────────────────────────────────
export default function DynamicRoute({ params }) {
  const slug = params.slug || [];
  const path = slug.join('/');
  
  
  

  switch (path) {
    case 'prescriptions': return (
      <AdminTabErrorBoundary tabId="prescriptions" tabLabel="Prescriptions">
        <PrescriptionsWrapper />
      </AdminTabErrorBoundary>
    );
    case 'messages': return (
      <AdminTabErrorBoundary tabId="messages" tabLabel="Messages">
        <MessagesWrapper />
      </AdminTabErrorBoundary>
    );
    case 'clinical-ai': return (
      <AdminTabErrorBoundary tabId="clinical-ai" tabLabel="Atlas Health">
        <ClinicalAIWrapper />
      </AdminTabErrorBoundary>
    );
    case 'appointments': return (
      <AdminTabErrorBoundary tabId="appointments" tabLabel="Care Team">
        <AppointmentsWrapper />
      </AdminTabErrorBoundary>
    );
    case 'orders': return (
      <AdminTabErrorBoundary tabId="orders" tabLabel="My Orders">
        <OrdersWrapper />
      </AdminTabErrorBoundary>
    );
    case 'settings': return (
      <AdminTabErrorBoundary tabId="settings" tabLabel="Settings">
        <SettingsWrapper />
      </AdminTabErrorBoundary>
    );
    case 'my-profile': return (
      <AdminTabErrorBoundary tabId="my-profile" tabLabel="My Profile">
        <ProfileWrapper />
      </AdminTabErrorBoundary>
    );
    default: return <div>Tab Not Found: {path}</div>;
  }
}
