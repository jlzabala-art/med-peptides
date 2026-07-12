import React from 'react';
import AdminMetricsDashboardClient from './AdminMetricsDashboardClient';
import { fetchDashboardMetricsAction } from '../../actions/dashboardActions';

/**
 * Server Component Container for Admin Metrics Dashboard
 * Pre-fetches the initial metrics securely via Firebase Admin.
 */
export default async function AdminMetricsDashboard({ wholesalerId = null }) {
  const initialMetricsData = await fetchDashboardMetricsAction();
  
  return (
    <AdminMetricsDashboardClient 
      wholesalerId={wholesalerId}
      initialMetricsData={initialMetricsData}
    />
  );
}
