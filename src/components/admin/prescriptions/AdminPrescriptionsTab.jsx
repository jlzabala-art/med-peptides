import React from 'react';
import AdminPrescriptionsTableClient from './AdminPrescriptionsTableClient';
import { fetchPrescriptionsAction } from '../../../actions/prescriptionsActions';
import AdminTabErrorBoundary from '../AdminTabErrorBoundary';
import { getCollectionKPIs } from '../../../app/actions/kpiActions';

/**
 * Server Component Container for Admin Prescriptions
 * Pre-fetches the initial page securely via Firebase Admin.
 * Uses Promise.all to run queries in parallel (not sequential).
 */
export default async function AdminPrescriptionsTab() {
  // Run both queries in PARALLEL — reduces latency from (A+B) to max(A,B)
  const [initialPrescriptions, kpis] = await Promise.all([
    fetchPrescriptionsAction({ limitCount: 50 }),
    getCollectionKPIs('prescriptions', [], {
      total:    { type: 'count' },
      active:   { type: 'count', conditions: [['status', 'in', ['Active', 'active', 'sent', 'viewed_by_patient', 'ordered', 'added_to_bulk']]] },
      awaiting: { type: 'count', conditions: [['status', 'in', ['assigned_to_wholesaler', 'draft']]] }
    }),
  ]);

  return (
    <AdminTabErrorBoundary tabId="prescriptions" tabLabel="Prescriptions">
      <AdminPrescriptionsTableClient
        initialPrescriptions={initialPrescriptions}
        serverKPIs={kpis}
        enableAskAtlas={true}
        askAtlasTopic="Prescription"
      />
    </AdminTabErrorBoundary>
  );
}
