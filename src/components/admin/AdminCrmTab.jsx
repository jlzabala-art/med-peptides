"use client";

import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import AdminLeadsTab from './AdminLeadsTab';
import AdminClinicsTab from './AdminClinicsTab';
import AdminAgencyDealsTab from './AdminAgencyDealsTab';
import AdminZohoCRMWidget from './gadgets/AdminZohoCRMWidget';

export default function AdminCrmTab() {
  const [activeTab, setActiveTab] = useState('crm'); // crm | leads | clinics | agency

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-app)' }}>
      <PageHeader
        title="CRM & Accounts"
        subtitle="Manage leads, clinics, agency deals, and Zoho CRM integration."
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('crm')}
              className={`btn ${activeTab === 'crm' ? 'btn-primary' : 'btn-outline'}`}
            >
              CRM Master
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`btn ${activeTab === 'leads' ? 'btn-primary' : 'btn-outline'}`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab('clinics')}
              className={`btn ${activeTab === 'clinics' ? 'btn-primary' : 'btn-outline'}`}
            >
              Clinics
            </button>
            <button
              onClick={() => setActiveTab('agency')}
              className={`btn ${activeTab === 'agency' ? 'btn-primary' : 'btn-outline'}`}
            >
              Agency Deals
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {activeTab === 'crm' && <AdminZohoCRMWidget isSubTab={true} />}
        {activeTab === 'leads' && <AdminLeadsTab isSubTab={true} />}
        {activeTab === 'clinics' && <AdminClinicsTab isSubTab={true} />}
        {activeTab === 'agency' && <AdminAgencyDealsTab isSubTab={true} />}
      </div>
    </div>
  );
}
