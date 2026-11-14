'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import DashboardEngine from '../../../engine/DashboardEngine';
import RoleDashboard from '../../../templates/RoleDashboard';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

export default function PharmacyDynamicRoute({ params }) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const slug = resolvedParams?.slug || [];
  const path = slug.join('/');

  if (!path) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <DashboardEngine role="compounding_pharmacy" dataContext={{}} />
      </div>
    );
  }

  const defaultTab = slug[0] || 'prescriptions';

  return (
    <AdminTabErrorBoundary tabId={path} tabLabel={path}>
      <RoleDashboard onBack={() => router.push('/')} defaultTab={defaultTab} />
    </AdminTabErrorBoundary>
  );
}
