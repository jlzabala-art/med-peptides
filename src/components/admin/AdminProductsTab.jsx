import React from 'react';
import ProductsTable from '../../features/products/components/ProductsTable';
import { fetchProductsAction } from '../../actions/productsActions';

/**
 * Server Component Container for Admin Products
 * Pre-fetches the initial page of products securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminProductsTab({ readOnly = false }) {
  const initialProducts = await fetchProductsAction({ limitCount: 50 });
  
  return (
    <ProductsTable 
      role="admin"
      initialProducts={initialProducts}
      readOnly={readOnly}
    />
  );
}
