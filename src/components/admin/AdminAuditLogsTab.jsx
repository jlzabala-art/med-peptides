import React from 'react';
import AdminAuditLogsTabClient from './AdminAuditLogsTabClient';
import { fetchAuditLogsAction } from '../../actions/adminActions';

/**
 * AdminAuditLogsTab — Server Component
 * Fetches the first 100 audit log entries securely via Firebase Admin SDK.
 * Passes initialData to the Client Component, which subscribes to
 * live updates via useAuditLogs hook (Firestore client SDK).
 */
export default async function AdminAuditLogsTab({ isSubTab = false }) {
  const initialData = await fetchAuditLogsAction({ limitCount: 100 });
  return <AdminAuditLogsTabClient initialData={initialData} isSubTab={isSubTab} />;
}
