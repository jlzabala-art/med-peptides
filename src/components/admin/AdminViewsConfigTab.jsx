import React from 'react';
import AdminViewsConfigTabClient from './AdminViewsConfigTabClient';
import { fetchViewsConfigAction } from '../../actions/viewsConfigActions';

/**
 * Server Component Container for Admin Views Config Tab
 * Pre-fetches the initial page of view configurations securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminViewsConfigTab({ isSubTab = false }) {
  const initialConfigs = await fetchViewsConfigAction();
  
  return (
    <AdminViewsConfigTabClient 
      initialConfigs={initialConfigs}
      isSubTab={isSubTab}
    />
  );
}
