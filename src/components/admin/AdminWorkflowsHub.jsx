"use client";

import React, { useState } from 'react';
import { Network, ShieldCheck } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import AdminWorkflowsTab from './AdminWorkflowsTab';
import AdminApprovalsTab from './AdminApprovalsTab';

export default function AdminWorkflowsHub() {
  const [activeTab, setActiveTab] = useState('workflows');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f6f8' }}>
      <PageHeader
        title="Operations & Automation"
        subtitle="Manage automated workflows and quality approval processes"
      />

      <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #dadce0' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('workflows')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              color: activeTab === 'workflows' ? '#1a73e8' : '#5f6368',
              borderBottom: activeTab === 'workflows' ? '3px solid #1a73e8' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Network size={16} /> Workflows
          </button>
          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              color: activeTab === 'approvals' ? '#1a73e8' : '#5f6368',
              borderBottom: activeTab === 'approvals' ? '3px solid #1a73e8' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <ShieldCheck size={16} /> Approvals & Quality
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {activeTab === 'workflows' && <AdminWorkflowsTab isSubTab={true} />}
        {activeTab === 'approvals' && <AdminApprovalsTab isSubTab={true} />}
      </div>
    </div>
  );
}
