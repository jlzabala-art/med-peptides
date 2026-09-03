/**
 * AdminPatientsTab — Async React Server Component (RSC)
 *
 * Executes fetchPatientsAction + fetchPatientKPIsAction in parallel on the server.
 * The first 50 patients and all KPIs are pre-hydrated before the HTML reaches the client,
 * eliminating the initial Firestore round-trip from the browser.
 *
 * Architecture:
 *   AdminPatientsTab (RSC — this file, no "use client")
 *     └── UniversalPatientsTable ("use client" — handles filters, inline editing, modals)
 */

import React, { Suspense } from 'react';
import UniversalPatientsTable from '../shared/UniversalPatientsTable';
import { fetchPatientsAction, fetchPatientKPIsAction } from '../../actions/patientsActions';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';

// ─── Skeleton shown while the RSC suspends ────────────────────────────────────
function PatientsSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* KPI row skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            height: '88px', borderRadius: '10px',
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite'
          }} />
        ))}
      </div>
      {/* Table skeleton */}
      <div style={{ height: '400px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        {[1,2,3,4,5,6,7].map(i => (
          <div key={i} style={{
            height: '52px', margin: '0.5rem 1rem',
            backgroundColor: '#f1f5f9', borderRadius: '6px',
            opacity: 1 - (i * 0.1),
            animation: 'shimmer 1.4s infinite'
          }} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

// ─── Inner async component that does the actual server-side fetching ──────────
async function AdminPatientsTabInner({ isSubTab }) {
  // Parallel server-side prefetch — both queries run concurrently
  const [initialPatients, serverKPIs] = await Promise.all([
    fetchPatientsAction({ limitCount: 50 }),
    fetchPatientKPIsAction(),
  ]).catch(err => {
    console.error('[AdminPatientsTab RSC] prefetch failed:', err);
    return [[], { totalPatients: 0, activePatients: 0, newPatients: 0, awaitingFollowUp: 0 }];
  });

  return (
    <UniversalPatientsTable
      viewMode="admin"
      hideHeader={isSubTab}
      initialData={initialPatients}
      serverKPIs={serverKPIs}
    />
  );
}

// ─── Public export — Suspense boundary so the shell doesn't block ─────────────
export default function AdminPatientsTab({ isSubTab = false }) {
  return (
    <AdminTabErrorBoundary tabName="Patients">
      <Suspense fallback={<PatientsSkeleton />}>
        <AdminPatientsTabInner isSubTab={isSubTab} />
      </Suspense>
    </AdminTabErrorBoundary>
  );
}
