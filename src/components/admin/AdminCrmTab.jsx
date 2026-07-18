import React from 'react';
import PageHeader from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';
import AdminLeadsTab from './AdminLeadsTab';
import AdminClinicsTab from './AdminClinicsTab';
import AdminAgencyDealsTab from './AdminAgencyDealsTab';
import AdminZohoCRMWidget from './gadgets/AdminZohoCRMWidget';

export default function AdminCrmTab() {
  const tabs = [
    { id: 'crm', label: 'CRM Master', content: <AdminZohoCRMWidget isSubTab={true} /> },
    { id: 'leads', label: 'Leads', content: <AdminLeadsTab isSubTab={true} /> },
    { id: 'clinics', label: 'Clinics', content: <AdminClinicsTab isSubTab={true} /> },
    { id: 'agency', label: 'Agency Deals', content: <AdminAgencyDealsTab isSubTab={true} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-app)' }}>
      <PageHeader
        title="CRM & Accounts"
        subtitle="Manage leads, clinics, agency deals, and Zoho CRM integration."
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        <Tabs tabs={tabs} defaultTab="crm" />
      </div>
    </div>
  );
}
