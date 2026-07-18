import React from 'react';
import AdminCatalogTabClient from './AdminCatalogTabClient';
import { fetchProductsAction, fetchProductsMetricsAction } from '../../actions/productsActions';

/**
 * Server Component Container for Master Catalog Hub
 * Pre-fetches the initial page of products securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminProductsTab({ readOnly = false }) {
  const [initialProducts, globalMetrics] = await Promise.all([
    fetchProductsAction({ limitCount: 50 }),
    fetchProductsMetricsAction()
  ]);
  
  return (
    <AdminCatalogTabClient 
      initialProducts={initialProducts}
      globalMetrics={globalMetrics}
      readOnly={readOnly}
    />
  );
}
