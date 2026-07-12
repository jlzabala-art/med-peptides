import React from 'react';
import AdminProductsTableClient from './AdminProductsTableClient';
import { fetchProductsAction } from '../../actions/productsActions';

/**
 * Server Component Container for Admin Products
 * Pre-fetches the initial page of products securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminProductsTab({ readOnly = false }) {
  const initialProducts = await fetchProductsAction({ limitCount: 50 });
  
  return (
    <AdminProductsTableClient 
      initialProducts={initialProducts}
      readOnly={readOnly}
    />
  );
}
