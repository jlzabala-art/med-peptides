import React, { Suspense } from 'react';
import AdminCatalogTabClient from './AdminCatalogTabClient';
import { Skeleton } from '../ui';
import { fetchProductsAction, fetchProductsMetricsAction } from '../../actions/productsActions';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';

/**
 * Async Server Component Container for Admin Products & Catalog
 * Pre-fetches the initial 50 products and global catalog facets in parallel via Firebase Admin.
 */
export default async function AdminProductsTab({ readOnly = false, initialProducts = null, globalMetrics = null }) {
  const [fetchedProducts, fetchedMetrics] = await Promise.all([
    initialProducts ? Promise.resolve(initialProducts) : fetchProductsAction({ limitCount: 50 }),
    globalMetrics ? Promise.resolve(globalMetrics) : fetchProductsMetricsAction()
  ]);

  return (
    <AdminTabErrorBoundary tabId="products" tabLabel="Products & Catalog">
      <Suspense fallback={<div className="p-8"><Skeleton className="h-64 w-full" /></div>}>
        <AdminCatalogTabClient 
          initialProducts={fetchedProducts}
          globalMetrics={fetchedMetrics}
          readOnly={readOnly}
        />
      </Suspense>
    </AdminTabErrorBoundary>
  );
}
