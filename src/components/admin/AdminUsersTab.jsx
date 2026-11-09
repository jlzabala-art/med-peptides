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
  let initialUsers = [];
  let kpis = null;

  try {
    const [usersResult, kpisResult] = await Promise.allSettled([
      fetchUsersAction({ limitCount: 20 }),
      fetchUsersAggregatesAction()
    ]);

    if (usersResult.status === 'fulfilled') {
      initialUsers = usersResult.value || [];
    }
    if (kpisResult.status === 'fulfilled') {
      kpis = kpisResult.value || null;
    }
  } catch (err) {
    console.error('[AdminUsersTab] Error prefetching users:', err);
  }

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
