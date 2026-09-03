'use client';

import React, { useContext } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DoctorContext } from '../../../templates/DoctorDashboard';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

// ── Eager imports (small, always used) ───────────────────────────────────────
// DoctorOverviewTab is kept eager as it's the default
import DoctorOverviewTab from '../../../components/doctor/DoctorOverviewTab';

// ── Dynamic imports ──────────────────────────────────────────────────────────
const PhysicianPatientsTab = dynamic(() => import('../../../components/doctor/DoctorPatientsTab'), { ssr: false });
const DoctorLeadsTab = dynamic(() => import('../../../components/doctor/DoctorLeadsTab'), { ssr: false });
const PhysicianRecommendationsTab = dynamic(() => import('../../../components/doctor/DoctorRecommendationsTab'), { ssr: false });
const PhysicianOrdersTab = dynamic(() => import('../../../components/doctor/DoctorOrdersTab'), { ssr: false });
const PhysicianProtocolsTab = dynamic(() => import('../../../components/doctor/DoctorProtocolsTab'), { ssr: false });
const DoctorPrescriptionsTab = dynamic(() => import('../../../components/doctor/DoctorPrescriptionsTab'), { ssr: false });
const PhysicianAssistantsTab = dynamic(() => import('../../../components/doctor/DoctorAssistantsTab'), { ssr: false });
const DoctorMessagesTab = dynamic(() => import('../../../components/doctor/DoctorMessagesTab'), { ssr: false });

// ── Dynamic imports ──────────────────────────────────────────────────────────
const UserSettings = dynamic(() => import('../../../templates/UserSettings'), { ssr: false });
const DoctorAppointments = dynamic(() => import('../../../templates/DoctorAppointments'), { ssr: false });
const DoctorLabResults = dynamic(() => import('../../../templates/DoctorLabResults'), { ssr: false });
const DoctorResearch = dynamic(() => import('../../../templates/DoctorResearch'), { ssr: false });
const CatalogCreatorFlow = dynamic(() => import('../../../components/wholesaler/CatalogCreatorFlow'), { ssr: false });
const UserProfileTab = dynamic(() => import('../../../components/shared/UserProfileTab'), { ssr: false });

// ── Bridge wrappers ──────────────────────────────────────────────────────────
function OverviewWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useContext(DoctorContext) || {};
  const router = useRouter();
  return (
    <DoctorOverviewTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
      onNavigate={(id) => router.push(`/doctor/${id === 'overview' ? '' : id}`)}
    />
  );
}

function NewPrescriptionWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useContext(DoctorContext) || {};
  const router = useRouter();
  return (
    <DoctorPrescriptionsTab
      key="new-prescription"
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
      initialBuilderOpen={true}
      hideHistory={true}
      onSavedRedirect={() => router.push('/doctor/prescriptions-history')}
    />
  );
}

function PrescriptionsHistoryWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useContext(DoctorContext) || {};
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
  const { doctorId, doctorMeta, setSharedPatients } = useContext(DoctorContext) || {};
  return (
    <PhysicianPatientsTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      onPatientsLoaded={setSharedPatients}
    />
  );
}

function OrdersWrapper() {
  const { doctorId, sharedPatients } = useContext(DoctorContext) || {};
  return <PhysicianOrdersTab doctorId={doctorId} patients={sharedPatients} />;
}

function RecommendationsWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useContext(DoctorContext) || {};
  return (
    <PhysicianRecommendationsTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
    />
  );
}

function ProtocolsWrapper() {
  const { doctorId, doctorMeta, sharedPatients } = useContext(DoctorContext) || {};
  return (
    <PhysicianProtocolsTab
      doctorId={doctorId}
      doctorMeta={doctorMeta}
      patients={sharedPatients}
    />
  );
}

function CatalogBuilderWrapper() {
  const { doctorId } = useContext(DoctorContext) || {};
  return <CatalogCreatorFlow ownerId={doctorId} ownerType="doctor" />;
}

function MessagesWrapper() {
  const { doctorId } = useContext(DoctorContext) || {};
  return <DoctorMessagesTab doctorId={doctorId} />;
}

function AssistantsWrapper() {
  const { doctorId, doctorMeta } = useContext(DoctorContext) || {};
  return <PhysicianAssistantsTab doctorId={doctorId} doctorMeta={doctorMeta} />;
}

function SettingsWrapper() {
  const router = useRouter();
  return <UserSettings onBack={() => router.push('/doctor')} />;
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

function LeadsWrapper() {
  const { doctorId } = useContext(DoctorContext) || {};
  return <DoctorLeadsTab doctorId={doctorId} />;
}

// ── Main Dynamic Router ──────────────────────────────────────────────────────
export default function DynamicRoute({ params }) {
  const slug = params.slug || [];
  const path = slug.join('/');

  switch (path) {
    case 'new-prescription': return <NewPrescriptionWrapper />;
    case 'prescriptions-history': return <PrescriptionsHistoryWrapper />;
    case 'patients': return <PatientsWrapper />;
    case 'leads': return <LeadsWrapper />;
    case 'orders': return <OrdersWrapper />;
    case 'recommendations': return <RecommendationsWrapper />;
    case 'protocols': return <ProtocolsWrapper />;
    case 'catalog-builder': return <CatalogBuilderWrapper />;
    case 'messages': return <MessagesWrapper />;
    case 'appointments': return <AppointmentsWrapper />;
    case 'lab-results': return <LabResultsWrapper />;
    case 'research': return <ResearchWrapper />;
    case 'assistants': return <AssistantsWrapper />;
    case 'settings': return <SettingsWrapper />;
    case 'my-profile': return <UserProfileTab />;
    default: return <div>Tab Not Found: {path}</div>;
  }
}