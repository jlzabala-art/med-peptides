import React from 'react';
import AdminProtocolsTableClient from './AdminProtocolsTableClient';
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
    <AdminProtocolsTableClient 
      initialProtocols={initialProtocols}
      globalMetrics={globalMetrics}
    />
  );
}
