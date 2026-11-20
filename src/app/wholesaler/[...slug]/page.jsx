import React from 'react';
import WholesalerPortalClient from './WholesalerPortalClient';

export default async function WholesalerPortalPage({ params }) {
  const resolvedParams = await params;
  return <WholesalerPortalClient slug={resolvedParams?.slug || []} />;
}
