import React from 'react';
import AdminClientsTabClient from './AdminClientsTabClient';
import { fetchUsersAction } from '../../actions/usersActions';

/**
 * AdminClientsTab — Server Component
 * Loads the first 100 clients via Firebase Admin SDK on the server.
 * Passes initialData to the Client Component, which handles interactive
 * search, filtering and pagination on the client side.
 */
export default async function AdminClientsTab({ ownerId, ownerType }) {
  const initialData = await fetchUsersAction({ limitCount: 100 });
  return <AdminClientsTabClient ownerId={ownerId} ownerType={ownerType} initialData={initialData} />;
}
