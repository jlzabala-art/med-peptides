import React from 'react';
import ProtocolsTable from '../../features/protocols/components/ProtocolsTable';
import { fetchProtocolsAction, fetchProtocolsMetricsAction } from '../../actions/protocolsActions';

/**
 * Server Component Container for Admin Protocols
 * Pre-fetches the initial page of protocols securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminProtocolsTab() {
  const initialProtocols = await fetchProtocolsAction({ limitCount: 50 });
  const globalMetrics = await fetchProtocolsMetricsAction();
  
  return (
    <ProtocolsTable 
      initialProtocols={initialProtocols}
      globalMetrics={globalMetrics}
    />
  );
}
