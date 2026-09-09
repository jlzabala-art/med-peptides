import React from 'react';
import { fetchPortalDashboardDataAction } from '../../actions/portalDashboardActions';
import SupplierPageClient from './SupplierPageClient';

/**
 * Server Component (RSC) for Supplier Root Page.
 * Follows Golden Rule #21.
 */
export default async function SupplierRootPage() {
  const initialData = await fetchPortalDashboardDataAction('supplier');

  return (
    <SupplierPageClient initialData={initialData} />
  );
}