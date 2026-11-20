import React from 'react';
import PharmacyPortalClient from './PharmacyPortalClient';

export default async function PharmacyPortalPage({ params }) {
  const resolvedParams = await params;
  return <PharmacyPortalClient slug={resolvedParams?.slug || []} />;
}
