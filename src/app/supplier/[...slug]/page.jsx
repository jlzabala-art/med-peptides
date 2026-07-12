'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import RoleDashboard from '../../../templates/RoleDashboard';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

export default function DynamicRoute({ params }) {
  const slug = params.slug || [];
  const path = slug.join('/');
  
  
  const router = useRouter();
  

  return (
    <AdminTabErrorBoundary tabId={path} tabLabel={path}>
      <RoleDashboard onBack={() => router.push('/')} defaultTab={defaultTab} />
    </AdminTabErrorBoundary>
  );
}