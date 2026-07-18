'use client';
import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import AdminSettingsTab from './AdminSettingsTab';
import AdminUsersTab from './AdminUsersTab';
import AdminInvitationsTab from './AdminInvitationsTab';
import AdminAuditLogsTab from './AdminAuditLogsTab';
import AdminViewsConfigTab from './AdminViewsConfigTab';
import AdminSemanticTab from './AdminSemanticTab';
import AdminRelationshipsTab from './AdminRelationshipsTab';
import Settings from "lucide-react/dist/esm/icons/settings";

export default function AdminSystemHub() {
  const [activeTab, setActiveTab] = useState('settings');

  const tabs = [
    { id: 'settings', label: 'General Settings' },
    { id: 'users', label: 'Users' },
    { id: 'invitations', label: 'Invitations' },
    { id: 'audit-logs', label: 'Audit Logs' },
    { id: 'views-config', label: 'Views Config' },
    { id: 'semantic', label: 'Semantic' },
    { id: 'relationships', label: 'Relationships' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        subtitle="Manage global system settings, users, and configurations"
        icon={Settings}
      />

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 mt-4">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Render Active Tab */}
      <div className="mt-6">
        {activeTab === 'settings' && <AdminSettingsTab isSubTab={true} />}
        {activeTab === 'users' && <AdminUsersTab isSubTab={true} />}
        {activeTab === 'invitations' && <AdminInvitationsTab isSubTab={true} />}
        {activeTab === 'audit-logs' && <AdminAuditLogsTab isSubTab={true} />}
        {activeTab === 'views-config' && <AdminViewsConfigTab isSubTab={true} />}
        {activeTab === 'semantic' && <AdminSemanticTab isSubTab={true} />}
        {activeTab === 'relationships' && <AdminRelationshipsTab isSubTab={true} />}
      </div>
    </div>
  );
}
