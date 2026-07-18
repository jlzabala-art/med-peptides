import React from 'react';
import UsersTable from '../../features/users/components/UsersTable';
import { Users } from '@/lib/icons';
import { fetchUsersAction, fetchUsersAggregatesAction } from '../../actions/usersActions';
import { MetricCard } from '../ui';
import DataModule from '../ui/DataModule';

/**
 * Server Component Container for Admin Users
 * Pre-fetches the initial page of users securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminUsersTab({ defaultRole = null, readOnly = false, canApprove = true, isSubTab = false }) {
  // We can fetch initial users here. 
  // UsersTable internally uses a hook `useUsers` for complex pagination and real-time.
  
  const initialUsers = await fetchUsersAction({ limitCount: 20 });
  const kpis = await fetchUsersAggregatesAction();
  
  const kpiSection = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
      <MetricCard
        title="Total Users"
        value={kpis.total}
        color="var(--color-primary)"
      />
      <MetricCard
        title="Patients"
        value={kpis.patients}
        color="var(--color-success)"
      />
      <MetricCard
        title="Doctors"
        value={kpis.doctors}
        color="var(--color-warning)"
      />
      <MetricCard
        title="Pending Approval"
        value={kpis.pending}
        color="var(--color-danger)"
        alert={kpis.pending > 0}
      />
    </div>
  );

  return (
    <DataModule
      header={
        !isSubTab ? (
          <div className="flex items-center justify-between mb-4">
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
        ) : null
      }
      kpis={kpiSection}
    >
      <UsersTable 
        initialUsers={initialUsers}
        defaultRole={defaultRole}
        readOnly={readOnly}
        canApprove={canApprove}
      />
    </DataModule>
  );
}
