import React from 'react';
import AdminPrescriptionsTableClient from './AdminPrescriptionsTableClient';
import { fetchPrescriptionsAction } from '../../../actions/prescriptionsActions';

/**
 * Server Component Container for Admin Prescriptions
 * Pre-fetches the initial page securely via Firebase Admin.
 */
export default async function AdminPrescriptionsTab() {
  const initialPrescriptions = await fetchPrescriptionsAction({ limitCount: 50 });
  
  return (
    <AdminPrescriptionsTableClient 
      initialPrescriptions={initialPrescriptions}
    />
  );
}
