import React from 'react';
import AdminClinicalLogsTabClient from './AdminClinicalLogsTabClient';
import { fetchClinicalLogsAction } from '../../actions/adminActions';

/**
 * AdminClinicalLogsTab — Server Component
 * Fetches clinical logs securely via Firebase Admin SDK.
 * Passes initialData to the Client Component for interactive filtering.
 */
export default async function AdminClinicalLogsTab({ isSubTab = false }) {
  const initialLogs = await fetchClinicalLogsAction({ limitCount: 1000 });
  return <AdminClinicalLogsTabClient initialLogs={initialLogs} isSubTab={isSubTab} />;
}