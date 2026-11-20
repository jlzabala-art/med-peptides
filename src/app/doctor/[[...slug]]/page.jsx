import React from 'react';
import DoctorPortalClient from './DoctorPortalClient';

export default async function DoctorPortalPage({ params }) {
  const resolvedParams = await params;
  return <DoctorPortalClient slug={resolvedParams?.slug || []} />;
}
