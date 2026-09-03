import React from 'react';
import UsersTable from '../../features/users/components/UsersTable';
import { Users, UserPlus, Stethoscope, Clock } from 'lucide-react';
import { fetchUsersAction, fetchUsersAggregatesAction } from '../../actions/usersActions';
import { MetricCard } from '../ui';


/**
 * Server Component Container for Admin Users
 * Pre-fetches the initial page of users securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminUsersTab({ defaultRole = null, readOnly = false, canApprove = true, isSubTab = false }) {
  const initialUsers = await fetchUsersAction({ limitCount: 20 });
  const kpis = await fetchUsersAggregatesAction();

  const safeInitialUsers = JSON.parse(JSON.stringify(initialUsers || []));
  const safeKpis = JSON.parse(JSON.stringify(kpis || null));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minHeight: 0, overflow: 'hidden', backgroundColor: 'transparent' }}>
      <UsersTable 
        initialUsers={safeInitialUsers}
        defaultRole={defaultRole}
        readOnly={readOnly}
        canApprove={canApprove}
        isSubTab={isSubTab}
        kpisData={safeKpis}
      />
    </div>
  );
}
