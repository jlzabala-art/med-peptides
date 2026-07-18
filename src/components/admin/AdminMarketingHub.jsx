"use client";

import React, { useState } from 'react';
import { Mail, Globe } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import AdminEmailTemplatesTab from './AdminEmailTemplatesTab';
import AdminMarketingTab from './AdminMarketingTab';

export default function AdminMarketingHub() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f6f8' }}>
      <PageHeader
        title="Marketing & Communications"
        subtitle="Manage email templates and social media content"
      />

      <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #dadce0' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('templates')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              color: activeTab === 'templates' ? '#1a73e8' : '#5f6368',
              borderBottom: activeTab === 'templates' ? '3px solid #1a73e8' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Mail size={16} /> Email Templates
          </button>
          <button
            onClick={() => setActiveTab('marketing')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              color: activeTab === 'marketing' ? '#1a73e8' : '#5f6368',
              borderBottom: activeTab === 'marketing' ? '3px solid #1a73e8' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Globe size={16} /> Social Media
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {activeTab === 'templates' && <AdminEmailTemplatesTab isSubTab={true} />}
        {activeTab === 'marketing' && <AdminMarketingTab isSubTab={true} />}
      </div>
    </div>
  );
}
