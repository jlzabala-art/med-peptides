/**
 * AdminClinicsTabWrapper — Async React Server Component
 *
 * Pre-fetches the clinics list + KPIs on the server in parallel.
 * AdminClinicsTab receives initialData + serverKPIs props for a
 * zero-spinner first render.
 */
import React, { Suspense } from 'react';
import AdminClinicsTab from './AdminClinicsTab';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';
import { fetchClinicsListAction, fetchClinicsKPIsAction } from '../../actions/clinicsActions';

function ClinicsSkeleton() {
  return (
    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            height: '88px', borderRadius: '10px',
            background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite'
          }} />
        ))}
      </div>
      <div style={{ height: '380px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{
            height: '58px', margin: '0.5rem 1rem',
            backgroundColor: '#f1f5f9', borderRadius: '8px', opacity: 1 - (i * 0.1)
          }} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

async function AdminClinicsTabInner({ isSubTab }) {
  const [initialData, serverKPIs] = await Promise.all([
    fetchClinicsListAction({ limitCount: 50 }),
    fetchClinicsKPIsAction(),
  ]).catch(err => {
    console.error('[AdminClinicsTabWrapper RSC]', err);
    return [[], { total: 0, active: 0, newLast30d: 0, withoutPhysician: 0 }];
  });

  return (
    <AdminClinicsTab
      isSubTab={isSubTab}
      initialData={initialData}
      serverKPIs={serverKPIs}
    />
  );
}

export default function AdminClinicsTabWrapper({ isSubTab = false }) {
  return (
    <AdminTabErrorBoundary tabName="Clinics">
      <Suspense fallback={<ClinicsSkeleton />}>
        <AdminClinicsTabInner isSubTab={isSubTab} />
      </Suspense>
    </AdminTabErrorBoundary>
  );
}
