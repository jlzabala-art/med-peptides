import React from 'react';
import SupplierPortalClient from './SupplierPortalClient';

export default async function SupplierPortalPage({ params }) {
  const resolvedParams = await params;
  return <SupplierPortalClient slug={resolvedParams?.slug || []} />;
}
