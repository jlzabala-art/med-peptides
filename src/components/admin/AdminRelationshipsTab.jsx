import React from 'react';
import AdminRelationshipsTabClient from './AdminRelationshipsTabClient';
import { fetchProductsAction } from '../../actions/productsActions';

/**
 * Server Component Container for Admin Relationships
 * Pre-fetches the products securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminRelationshipsTab({ readOnly = false, isSubTab = false }) {
  // Fetch up to 500 products to ensure filtering works correctly on initial load
  const initialProducts = await fetchProductsAction({ limitCount: 500 });
  
  return (
    <AdminRelationshipsTabClient 
      initialProducts={initialProducts}
      readOnly={readOnly}
      isSubTab={isSubTab}
    />
  );
}
