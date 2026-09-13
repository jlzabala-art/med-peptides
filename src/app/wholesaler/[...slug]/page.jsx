'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import RoleDashboard from '../../../templates/RoleDashboard';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

export default function DynamicRoute({ params }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams?.slug || [];
  const path = slug.join('/');
  
  
  const router = useRouter();
  const defaultTab = slug[0] || 'bulk-orders';

  if (path === 'profile' || path === 'my-profile') {
    const UserProfileTab = require('../../../components/shared/UserProfileTab').default;
    return (
      <AdminTabErrorBoundary tabId="my-profile" tabLabel="My Profile">
        <UserProfileTab />
      </AdminTabErrorBoundary>
    );
  }

  return (
    <AdminTabErrorBoundary tabId={path} tabLabel={path}>
      <RoleDashboard onBack={() => router.push('/')} defaultTab={defaultTab} />
    </AdminTabErrorBoundary>
  );
}