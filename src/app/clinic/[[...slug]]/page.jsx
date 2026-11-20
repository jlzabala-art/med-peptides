import React from 'react';
import ClinicPortalClient from './ClinicPortalClient';

export default async function ClinicPortalPage({ params }) {
  const resolvedParams = await params;
  return <ClinicPortalClient slug={resolvedParams?.slug || []} />;
}
