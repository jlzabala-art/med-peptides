'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import RoleDashboard from '../../../templates/RoleDashboard';
import AdminTabErrorBoundary from '../../../components/admin/AdminTabErrorBoundary';

const SupplierOrdersTab = dynamic(() => import('../../../components/supplier/SupplierOrdersTab'), { ssr: false });
const SupplierCatalogTab = dynamic(() => import('../../../components/supplier/SupplierCatalogTab'), { ssr: false });
const SupplierRFQsTab = dynamic(() => import('../../../components/supplier/SupplierRFQsTab'), { ssr: false });

export default function SupplierDynamicRoute({ params }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams?.slug || [];
  const path = slug.join('/');
  const tabId = slug[0] || 'orders';
  const router = useRouter();

  const renderContent = () => {
    switch (tabId) {
      case 'orders':
        return <SupplierOrdersTab />;
      case 'catalog':
        return <SupplierCatalogTab />;
      case 'rfqs':
        return <SupplierRFQsTab />;
      default:
        return <RoleDashboard onBack={() => router.push('/')} defaultTab={tabId} />;
    }
  };

  return (
    <AdminTabErrorBoundary tabId={path || tabId} tabLabel={path || tabId}>
      {renderContent()}
    </AdminTabErrorBoundary>
  );
}
