import React from 'react';
import AdminInvitationsTabClient from './AdminInvitationsTabClient';
import { fetchInvitationsAction } from '../../actions/invitationsActions';

/**
 * Server Component Container for Admin Invitations
 * Pre-fetches the initial page of invitations securely via Firebase Admin
 * and passes the data to the interactive Client Component.
 */
export default async function AdminInvitationsTab({ restrictedRoles = null, readOnly = false, tenantId = null }) {
  const initialInvitations = await fetchInvitationsAction({ 
    limitCount: 50,
    tenantId
  });
  
  return (
    <AdminInvitationsTabClient 
      initialInvitations={initialInvitations}
      restrictedRoles={restrictedRoles}
      readOnly={readOnly}
      tenantId={tenantId}
    />
  );
}
