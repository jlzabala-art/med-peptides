/**
 * AdminLeadsTabWrapper — Async React Server Component
 *
 * Pre-fetches leads + KPIs on the server in parallel.
 * The actual AdminLeadsTab ("use client") receives initialLeads and serverKPIs
 * as props for a zero-latency first render — no client Firestore call needed.
 *
 * Architecture:
 *   AdminLeadsTabWrapper (RSC — this file)
 *     └── AdminLeadsTab ("use client" — handles Kanban, filters, inline editing)
 */

import React, { Suspense } from 'react';
import AdminLeadsTab from './AdminLeadsTab';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';
import { fetchLeadsAction, fetchLeadsKPIsAction } from '../../actions/leadsActions';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function LeadsSkeleton() {
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
      <div style={{ height: '420px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{
            height: '72px', margin: '0.5rem 1rem',
            backgroundColor: '#f1f5f9', borderRadius: '8px', opacity: 1 - (i * 0.12)
          }} />
        ))}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

// ─── Inner async RSC ──────────────────────────────────────────────────────────
async function AdminLeadsTabInner({ isSubTab }) {
  const [initialLeads, serverKPIs] = await Promise.all([
    fetchLeadsAction({ limitCount: 50 }),
    fetchLeadsKPIsAction(),
  ]).catch(err => {
    console.error('[AdminLeadsTabWrapper RSC] prefetch failed:', err);
    return [[], { total: 0, newLast30d: 0, hot: 0, converted: 0, rfqCount: 0 }];
  });

  return (
    <AdminLeadsTab
      isSubTab={isSubTab}
      initialLeads={initialLeads}
      serverKPIs={serverKPIs}
    />
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
export default function AdminLeadsTabWrapper({ isSubTab = false }) {
  return (
    <AdminTabErrorBoundary tabName="Leads">
      <Suspense fallback={<LeadsSkeleton />}>
        <AdminLeadsTabInner isSubTab={isSubTab} />
      </Suspense>
    </AdminTabErrorBoundary>
  );
}
