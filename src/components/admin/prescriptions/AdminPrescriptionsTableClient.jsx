"use client";
import React from 'react';
import UniversalPrescriptionsTable from '../../shared/UniversalPrescriptionsTable';

/**
 * Client shell for AdminPrescriptionsTab.
 * Passes server-prefetched data as initialData so the table renders
 * immediately without a client-side Firestore round-trip on first load.
 */
export default function AdminPrescriptionsTableClient({ initialPrescriptions, serverKPIs, enableAskAtlas, askAtlasTopic }) {
  return (
    <UniversalPrescriptionsTable
      initialData={initialPrescriptions}
      serverKPIs={serverKPIs}
      enableAskAtlas={enableAskAtlas ?? true}
      askAtlasTopic={askAtlasTopic ?? 'Prescription'}
    />
  );
}
