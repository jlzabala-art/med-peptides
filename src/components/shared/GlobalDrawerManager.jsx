"use client";
import OrderDetailsPanel from '../../features/orders/components/OrderDetailsPanel';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import StandardDrawer from '../ui/StandardDrawer';
import { useFirestoreDocument } from '../../hooks/data/useFirestoreDocument';
import { useDrawer } from '../../context/DrawerContext';
import PrescriptionIntakeWorkspace from '../../features/prescriptions/components/PrescriptionIntakeWorkspace';
import B2BCartDrawer from '../admin/orders/B2BCartDrawer';
import ScanPriceListWidget from '../admin/ScanPriceListWidget';

const PhysicianProfileDrawer = dynamic(() => import('../admin/physicians/PhysicianProfileDrawer'), {
  loading: () => <div style={{ padding: '2rem' }}>Loading physician profile...</div>,
  ssr: false,
});

const AIClinicalScribeModal = dynamic(
  () => import('../prescriptions/AIClinicalScribeModal'),
  { ssr: false }
);

const InviteUserModal = dynamic(
  () => import('../admin/users/InviteUserModal'),
  { ssr: false }
);

// Lazy-load the prescription builder (heavy component)
const UniversalOrderBuilder = dynamic(
  () => import('./order-builder/UniversalOrderBuilder'),
  { loading: () => <div style={{ padding: '2rem' }}>Loading Rx Builder...</div>, ssr: false }
);

const WorkspaceDrawer = dynamic(
  () => import('./workspaces/WorkspaceDrawer'),
  { ssr: false }
);

// --- Lazy loaded heavy components ---
const PatientProfileWorkspace = dynamic(() => import('../admin/patients/PatientProfileWorkspace'), {
  loading: () => <div style={{ padding: '2rem' }}>Loading workspace...</div>,
  ssr: false, // Optional: if it relies heavily on client window/browser APIs
});

const LeadProfileDrawer = dynamic(() => import('../admin/leads/LeadProfileDrawer'), {
  loading: () => <div style={{ padding: '2rem' }}>Loading lead profile...</div>,
  ssr: false,
});

const QuotationDetailDrawer = dynamic(() => import('../quotations/QuotationDetailDrawer'), {
  ssr: false,
});

const QuotationBuilderWizard = dynamic(() => import('../quotations/modals/QuotationBuilderWizard'), {
  ssr: false,
});

function QuotationDrawerContent({ id, data, onClose }) {
  const { data: quotation, loading } = useFirestoreDocument('quotations', id);
  const activeQuote = quotation || data?.quotation || data;
  if (loading && !activeQuote) return <div style={{ padding: '2rem' }}>Loading quotation details...</div>;
  if (!activeQuote) return <div style={{ padding: '2rem' }}>Quotation not found.</div>;
  return <QuotationDetailDrawer quotation={activeQuote} onClose={onClose} />;
}

function LeadDrawerContent({ id, onClose }) {
  const { data: lead, loading } = useFirestoreDocument('leads', id);
  if (loading) return null; // Or a spinner
  if (!lead) return null;
  return <LeadProfileDrawer lead={lead} onClose={onClose} />;
}

// Prescription Drawer
import PrescriptionDetailModal from '../../features/prescriptions/components/PrescriptionDetailModal';

function PrescriptionDrawerContent({ id, onClose }) {
  const { data: rx, loading } = useFirestoreDocument('prescriptions', id);
  if (loading) return <div style={{ padding: '2rem' }}>Loading prescription...</div>;
  if (!rx) return <div style={{ padding: '2rem' }}>Prescription not found.</div>;
  return <PrescriptionDetailModal rx={rx} onClose={onClose} />;
}

// Order Drawer
// Assuming we have an OrderDetailModal or we can render it. Let's check if it exists later.
// For now we'll just add a placeholder.
function OrderDrawerContent({ id, onClose }) {
  const { data: order, loading } = useFirestoreDocument('orders', id);
  if (loading) return <div style={{ padding: '2rem' }}>Loading order...</div>;
  if (!order) return <div style={{ padding: '2rem' }}>Order not found.</div>;
  
  return (
    <StandardDrawer title={`Order ${order.orderNumber || id}`} isOpen={true} onClose={onClose}>
      <OrderDetailsPanel order={order} />
    </StandardDrawer>
  );
}

function PatientDrawerContent({ id, data: drawerData, onClose }) {
  // Try 'patients' collection first (authoritative registry)
  const { data: patientDoc, loading: loadingPatient } = useFirestoreDocument('patients', id);
  // Fallback to 'users' collection if not found in 'patients'
  const { data: userDoc, loading: loadingUser } = useFirestoreDocument('users', (!patientDoc && !loadingPatient) ? id : null);
  
  const loading = loadingPatient || (loadingUser && !patientDoc);
  const patient = patientDoc || userDoc || drawerData?.patient;
  
  if (loading && !patient) return <div style={{ padding: '2rem' }}>Loading patient profile...</div>;
  if (!patient) return <div style={{ padding: '2rem' }}>Patient not found.</div>;
  
  return (
    <PatientProfileWorkspace 
      patient={{ ...patient, id: patient.id || id }} 
      initialTab={drawerData?.initialTab || 'overview'}
      onClose={onClose} 
    />
  );
}

// ── Physician Drawer ────────────────────────────────────────────────────────
function PhysicianDrawerContent({ id, onClose }) {
  const { data: doctor, loading } = useFirestoreDocument('users', id);
  if (loading) return <div style={{ padding: '2rem' }}>Loading physician profile...</div>;
  if (!doctor) return <div style={{ padding: '2rem' }}>Physician not found.</div>;
  return (
    <PhysicianProfileDrawer
      doctor={{ ...doctor, id }}
      onClose={onClose}
    />
  );
}

// ── Rx Builder Drawer ─────────────────────────────────────────────────────────
// Triggered by any module via: openDrawer('rx-builder', 'new', { initialPatient, initialProtocol, initialDoctor, initialItems })
function RxBuilderDrawerContent({ data, onClose }) {
  return (
    <StandardDrawer
      title="New Prescription"
      isOpen={true}
      onClose={onClose}
      width="min(92vw, 960px)"
    >
      <div style={{ padding: '1.5rem' }}>
        <UniversalOrderBuilder
          mode="prescription"
          sourceModule={data?.sourceModule || 'unknown'}
          initialPatient={data?.initialPatient || null}
          initialProtocol={data?.initialProtocol || null}
          initialDoctor={data?.initialDoctor || null}
          initialItems={data?.initialItems || []}
          initialProtocolId={data?.initialProtocolId || null}
          initialProtocolName={data?.initialProtocolName || null}
          initialDoctorId={data?.initialDoctorId || null}
          initialDoctorName={data?.initialDoctorName || null}
          onSaved={onClose}
          onCanceled={onClose}
        />
      </div>
    </StandardDrawer>
  );
}

// ── AI Intake Drawer ────────────────────────────────────────────────────────────
function AiIntakeDrawerContent({ onClose }) {
  return (
    <PrescriptionIntakeWorkspace
      isOpen={true}
      onClose={onClose}
    />
  );
}

export default function GlobalDrawerManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { drawers, openDrawer, closeDrawer } = useDrawer();
  const [isScribeOpen, setIsScribeOpen] = React.useState(false);
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);

  useEffect(() => {
    const handleOpenCart = () => openDrawer('b2b-cart', 'cart');
    const handleOpenScribe = () => setIsScribeOpen(true);
    const handleOpenInvite = () => setIsInviteOpen(true);

    window.addEventListener('open-cart', handleOpenCart);
    window.addEventListener('OPEN_AI_CLINICAL_SCRIBE', handleOpenScribe);
    window.addEventListener('OPEN_INVITE_USER_MODAL', handleOpenInvite);

    return () => {
      window.removeEventListener('open-cart', handleOpenCart);
      window.removeEventListener('OPEN_AI_CLINICAL_SCRIBE', handleOpenScribe);
      window.removeEventListener('OPEN_INVITE_USER_MODAL', handleOpenInvite);
    };
  }, [openDrawer]);

  useEffect(() => {
    const drawerType = searchParams.get('drawer');
    const drawerId = searchParams.get('drawerId') || searchParams.get('id');
    
    if (drawerType && drawerId) {
      // Add it to context if not already there to prevent infinite loops
      const exists = drawers.some(d => d.type === drawerType && d.resourceId === drawerId);
      if (!exists) {
        openDrawer(drawerType, drawerId);
      }
    }
  }, [searchParams, drawers, openDrawer]);

  const handleClose = (drawerObj) => {
    closeDrawer(drawerObj.id);

    // If this drawer was triggered by URL, clean the URL
    const urlDrawerType = searchParams.get('drawer');
    const urlDrawerId = searchParams.get('drawerId') || searchParams.get('id');
    
    if (urlDrawerType === drawerObj.type && urlDrawerId === drawerObj.resourceId) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('drawer');
      if (searchParams.has('drawerId')) {
         params.delete('drawerId');
      } else if (urlDrawerType !== 'patient_page') {
         params.delete('id');
      }
      router.replace(`${pathname}?${params.toString()}`);
    }
  };

  // Defensively deduplicate drawers by ID just in case of stale state
  const uniqueDrawers = drawers.filter((drawer, index, self) =>
    index === self.findIndex((d) => d.id === drawer.id)
  );

  return (
    <>
      {uniqueDrawers.map((drawer, index) => {
        // We use zIndex to stack them properly over any table or nested drawer
        const zIndex = 10000 + index * 10;
        
        if (drawer.type === 'patient') {
          return (
            <StandardDrawer
              key={drawer.id}
              title="Patient Profile & Workspace"
              isOpen={true}
              onClose={() => handleClose(drawer)}
              width="min(94vw, 1150px)"
              hideHeader={true}
              bodyPadding="0"
              style={{ zIndex }}
            >
              <PatientDrawerContent id={drawer.resourceId} data={drawer.data} onClose={() => handleClose(drawer)} />
            </StandardDrawer>
          );
        }
        
        if (drawer.type === 'lead') {
          return (
            <div key={drawer.id} style={{ zIndex, position: 'relative' }}>
              <LeadDrawerContent id={drawer.resourceId} onClose={() => handleClose(drawer)} />
            </div>
          );
        }

        if (drawer.type === 'prescription') {
          return (
            <div key={drawer.id} style={{ zIndex, position: 'relative' }}>
              <PrescriptionDrawerContent id={drawer.resourceId} onClose={() => handleClose(drawer)} />
            </div>
          );
        }

        if (drawer.type === 'physician') {
          return (
            <StandardDrawer
              key={drawer.id}
              title="Physician Profile"
              isOpen={true}
              onClose={() => handleClose(drawer)}
              style={{ zIndex }}
            >
              <PhysicianDrawerContent id={drawer.resourceId} onClose={() => handleClose(drawer)} />
            </StandardDrawer>
          );
        }

        if (drawer.type === 'order') {
          return (
            <div key={drawer.id} style={{ zIndex, position: 'relative' }}>
              <OrderDrawerContent id={drawer.resourceId} onClose={() => handleClose(drawer)} />
            </div>
          );
        }

        if (drawer.type === 'rx-builder') {
          return (
            <div key={drawer.id} style={{ zIndex, position: 'relative' }}>
              <RxBuilderDrawerContent data={drawer.data} onClose={() => handleClose(drawer)} />
            </div>
          );
        }

        if (drawer.type === 'ai-intake') {
          return (
            <div key={drawer.id} style={{ zIndex, position: 'relative' }}>
              <AiIntakeDrawerContent onClose={() => handleClose(drawer)} />
            </div>
          );
        }

        if (drawer.type === 'b2b-cart') {
          return (
            <div key={drawer.id} style={{ zIndex, position: 'relative' }}>
              <B2BCartDrawer onClose={() => handleClose(drawer)} />
            </div>
          );
        }

        if (drawer.type === 'quotation') {
          return (
            <div key={drawer.id} style={{ zIndex, position: 'relative' }}>
              <QuotationDrawerContent id={drawer.resourceId} data={drawer.data} onClose={() => handleClose(drawer)} />
            </div>
          );
        }

        if (drawer.type === 'import-price-list' || drawer.type === 'scan-price-list' || drawer.type === 'import_prices') {
          return (
            <ScanPriceListWidget key={drawer.id} onClose={() => handleClose(drawer)} initialData={drawer.data} zIndex={zIndex} />
          );
        }

        return null;
      })}
      <QuotationBuilderWizard />
      <QuotationDetailDrawer />
      <WorkspaceDrawer />
      {isScribeOpen && (
        <AIClinicalScribeModal 
          isOpen={isScribeOpen} 
          onClose={() => setIsScribeOpen(false)} 
          onPrescriptionGenerated={(rxData) => {
            setIsScribeOpen(false);
            openDrawer('rx-builder', 'new', { initialItems: rxData?.items || [] });
          }}
        />
      )}
      {isInviteOpen && (
        <InviteUserModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
        />
      )}
    </>
  );
}
