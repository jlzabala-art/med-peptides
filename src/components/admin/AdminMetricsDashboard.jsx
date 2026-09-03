import React from 'react';
import AdminMetricsDashboardClient from './AdminMetricsDashboardClient';
import { fetchDashboardMetricsAction } from '../../actions/dashboardActions';

/**
 * Server Component Container for Admin Metrics Dashboard.
 * Pre-fetches initial metrics securely on the server via Firebase Admin SDK + Next.js cache.
 * Eliminates client-side waterfall so the initial view renders in 0ms.
 */
export default async function AdminMetricsDashboard({ wholesalerId = null }) {
  let initialMetricsData = null;
  try {
    initialMetricsData = await fetchDashboardMetricsAction();
  } catch (err) {
    console.warn('[AdminMetricsDashboard] Server-side prefetch fallback:', err.message);
  }

  return (
    <AdminMetricsDashboardClient 
      wholesalerId={wholesalerId}
      initialMetricsData={initialMetricsData}
    />
  );
}
