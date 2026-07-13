import React from 'react';
import UsersTable from '../../features/users/components/UsersTable';
import { Users } from '@/lib/icons';
import { fetchUsersAction } from '../../actions/usersActions';

/**
 * Server Component Container for Admin Users
 * Pre-fetches the initial page of users securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminUsersTab({ defaultRole = null, readOnly = false, canApprove = true }) {
  // We can fetch initial users here. 
  // UsersTable internally uses a hook `useUsers` for complex pagination and real-time.
  
  const initialUsers = await fetchUsersAction({ limitCount: 20 });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Users Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage all users across portals, approve access, and assign roles.
          </p>
        </div>
      </div>
      
    <UsersTable 
      initialUsers={initialUsers}
      defaultRole={defaultRole}
      readOnly={readOnly}
      canApprove={canApprove}
    />
    </div>
  );
}
