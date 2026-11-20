import React from 'react';
import PatientPortalClient from './PatientPortalClient';

export default async function PatientPortalPage({ params }) {
  const resolvedParams = await params;
  return <PatientPortalClient slug={resolvedParams?.slug || []} />;
}
