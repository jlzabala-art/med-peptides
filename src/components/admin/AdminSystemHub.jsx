import React from 'react';
import PageHeader from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';
import AdminSettingsTab from './AdminSettingsTab';
import AdminUsersTab from './AdminUsersTab';
import AdminInvitationsTab from './AdminInvitationsTab';
import AdminAuditLogsTab from './AdminAuditLogsTab';
import AdminViewsConfigTab from './AdminViewsConfigTab';
import AdminSemanticTab from './AdminSemanticTab';
import AdminRelationshipsTab from './AdminRelationshipsTab';
import Settings from "lucide-react/dist/esm/icons/settings";

export default function AdminSystemHub() {
  const tabs = [
    { id: 'settings', label: 'General Settings', content: <AdminSettingsTab isSubTab={true} /> },
    { id: 'users', label: 'Users', content: <AdminUsersTab isSubTab={true} /> },
    { id: 'invitations', label: 'Invitations', content: <AdminInvitationsTab isSubTab={true} /> },
    { id: 'audit-logs', label: 'Audit Logs', content: <AdminAuditLogsTab isSubTab={true} /> },
    { id: 'views-config', label: 'Views Config', content: <AdminViewsConfigTab isSubTab={true} /> },
    { id: 'semantic', label: 'Semantic', content: <AdminSemanticTab isSubTab={true} /> },
    { id: 'relationships', label: 'Relationships', content: <AdminRelationshipsTab isSubTab={true} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-app)' }}>
      <PageHeader
        title="System Settings"
        subtitle="Manage global system settings, users, and configurations"
        icon={Settings}
      />

      <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <Tabs tabs={tabs} defaultTab="settings" />
      </div>
    </div>
  );
}
