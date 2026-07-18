"use client";

import React, { useState } from 'react';
import { BarChart2, Network } from 'lucide-react';
import PageHeader from '../ui/PageHeader';
import AdminAnalyticsTab from './AdminAnalyticsTab';
import AdminAIAgentsTab from './AdminAIAgentsTab';

export default function AdminIntelligenceHub() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f4f6f8' }}>
      <PageHeader
        title="AI & Intelligence"
        subtitle="Business intelligence and autonomous agent network"
      />

      <div style={{ padding: '16px 24px', backgroundColor: '#fff', borderBottom: '1px solid #dadce0' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <button
            onClick={() => setActiveTab('analytics')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              color: activeTab === 'analytics' ? '#1a73e8' : '#5f6368',
              borderBottom: activeTab === 'analytics' ? '3px solid #1a73e8' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <BarChart2 size={16} /> Analytics & Insights
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            style={{
              padding: '8px 4px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              color: activeTab === 'agents' ? '#1a73e8' : '#5f6368',
              borderBottom: activeTab === 'agents' ? '3px solid #1a73e8' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <Network size={16} /> AI Agents
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        {activeTab === 'analytics' && <AdminAnalyticsTab isSubTab={true} />}
        {activeTab === 'agents' && <AdminAIAgentsTab isSubTab={true} />}
      </div>
    </div>
  );
}
