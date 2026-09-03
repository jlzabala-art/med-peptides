import React from 'react';
import UniversalProtocolsTable from '../shared/UniversalProtocolsTable';
import { fetchProtocolsAction, fetchProtocolsMetricsAction } from '../../actions/protocolsActions';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';

/**
 * Async Server Component Container for Admin Protocols
 * Instant 0ms Non-Blocking Server Render via Promise.all.
 */
export default async function AdminProtocolsTab({ isSubTab = false }) {
  const [initialProtocols, serverKPIs] = await Promise.all([
    fetchProtocolsAction({ limitCount: 50 }),
    fetchProtocolsMetricsAction()
  ]);

  return (
    <AdminTabErrorBoundary tabId="protocols" tabLabel="Protocols">
      <UniversalProtocolsTable 
        isSubTab={isSubTab}
        initialData={initialProtocols}
        serverKPIs={serverKPIs}
      />
    </AdminTabErrorBoundary>
  );
}
