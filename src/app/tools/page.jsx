import React from 'react';
import AdminToolsTab from '@/components/admin/AdminToolsTab';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';

export const metadata = {
  title: 'Clinical Operations & Multi-Portal Tools | Atlas Services',
  description: 'Atlas Clinical administration hub for multi-portal navigation, doctor and patient impersonation, label generation, and customs compliance.'
};

export default function ToolsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <PublicUnifiedHeader track="tools" />
      <main style={{ flex: 1 }}>
        <AdminToolsTab />
      </main>
      <PublicUnifiedFooter />
    </div>
  );
}
