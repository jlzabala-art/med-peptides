import React from 'react';
import AdminSemanticTabClient from './AdminSemanticTabClient';
import { fetchSemanticProductsAction } from '../../actions/semanticActions';

/**
 * Server Component Container for Admin Semantic Sync Tab
 * Pre-fetches the initial page of products securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminSemanticTab({ isSubTab = false, readOnly = false }) {
  const initialProducts = await fetchSemanticProductsAction({ limitCount: 20 });
  
  return (
    <AdminSemanticTabClient 
      initialProducts={initialProducts}
      isSubTab={isSubTab}
      readOnly={readOnly}
    />
  );
}
