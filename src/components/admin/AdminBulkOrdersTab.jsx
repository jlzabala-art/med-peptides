import React from 'react';
import AdminBulkOrdersTabClient from './AdminBulkOrdersTabClient';
import { fetchBulkOrdersAction } from '../../actions/ordersActions';

/**
 * Server Component Container for AdminBulkOrdersTab
 * Fetches the initial bulk orders payload securely via Firebase Admin
 * and passes it to the presentational Client Component for realtime hydration.
 */
export default async function AdminBulkOrdersTab({ isSubTab = false }) {
  // Fetch initial data securely on the server
  const initialData = await fetchBulkOrdersAction({ limitCount: 50 });
  
  return (
    <AdminBulkOrdersTabClient initialData={initialData} isSubTab={isSubTab} />
  );
}
