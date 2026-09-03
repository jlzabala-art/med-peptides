import React from 'react';
import AdminRFQTabClient from './AdminRFQTabClient';
import { fetchRfqsAction } from '../../actions/adminActions';

export default async function AdminRFQTab({ isSubTab = false }) {
  // Fetch initial data on the server
  const initialRfqs = await fetchRfqsAction({ limitCount: 100 });

  return (
    <AdminRFQTabClient initialRfqs={initialRfqs} isSubTab={isSubTab} />
  );
}