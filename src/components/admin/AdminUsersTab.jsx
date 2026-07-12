import React from 'react';
import AdminUsersTableClient from './AdminUsersTableClient';
import { fetchUsersAction } from '../../actions/usersActions';

/**
 * Server Component Container for Admin Users
 * Pre-fetches the initial page of users securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminUsersTab({ defaultRole = null, readOnly = false, canApprove = true }) {
  // We can fetch initial users here. 
  // AdminUsersTableClient internally uses a hook `useUsers` for complex pagination and real-time.
  // Passing initialUsers allows the client to hydrate immediately if the hook is updated to accept it,
  // or it just serves as a structural Server Component boundary.
  
  const initialUsers = await fetchUsersAction({ limitCount: 20 });
  
  return (
    <AdminUsersTableClient 
      initialUsers={initialUsers}
      defaultRole={defaultRole}
      readOnly={readOnly}
      canApprove={canApprove}
    />
  );
}
