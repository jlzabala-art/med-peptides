import React from 'react';
import AdminSettingsTabClient from './AdminSettingsTabClient';
import { fetchSettingsAction } from '../../actions/settingsActions';

/**
 * Server Component Container for Admin Settings
 * Pre-fetches the initial global settings securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminSettingsTab({ readOnly = false }) {
  const initialSettings = await fetchSettingsAction();
  
  return (
    <AdminSettingsTabClient 
      initialSettings={initialSettings}
      readOnly={readOnly}
    />
  );
}
