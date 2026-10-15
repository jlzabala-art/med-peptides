import React from 'react';
import AdminToolsTab from '@/components/admin/AdminToolsTab';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';

export const metadata = {
  title: 'Account Manager Multi-Portal Hub | Atlas Services',
  description: 'Account Manager console for direct single-click navigation without passwords: Public Views, Doctor Portals, Patient Dossiers, and Product Catalog.'
};

export default function AccountManagerPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <PublicUnifiedHeader track="account-manager" />
      <main style={{ flex: 1 }}>
        <AdminToolsTab />
      </main>
      <PublicUnifiedFooter />
    </div>
  );
}
