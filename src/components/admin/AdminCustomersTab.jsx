"use client";

import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';
import AdminClinicsTab from './AdminClinicsTab';
import AdminWholesellersTabClient from './AdminWholesellersTabClient';
import AdminPatientsTab from './AdminPatientsTab';
import AdminCrmTab from './AdminCrmTab';
import { Users2, Building2, User, Stethoscope, Briefcase } from '@/lib/icons';

/**
 * AdminCustomersTab (Zoho Books Standard)
 * ─────────────────────────────────────────────────────────────────────────────
 * Unifies all customer channels into a single coherent interface:
 * 1. Clinics & Doctors (B2B Accounts)
 * 2. Wholesalers (Bulk Distributors / Resellers)
 * 3. Individuals / Patients (B2C Direct)
 * 4. All Accounts & CRM Overview
 *
 * Supports cross-counterparty identification (Customer that is also a Supplier).
 */
export default function AdminCustomersTab({ defaultSubTab = 'clinics' }) {
  const [activeTab, setActiveTab] = useState(defaultSubTab);

  const tabs = [
    {
      id: 'clinics',
      label: 'Clinics & Doctors',
      icon: Stethoscope,
      content: (
        <div style={{ padding: '0.5rem 0' }}>
          <AdminClinicsTab isSubTab={true} />
        </div>
      )
    },
    {
      id: 'wholesalers',
      label: 'Wholesalers (B2B)',
      icon: Building2,
      content: (
        <div style={{ padding: '0.5rem 0' }}>
          <AdminWholesellersTabClient isSubTab={true} />
        </div>
      )
    },
    {
      id: 'individuals',
      label: 'Individual Patients',
      icon: User,
      content: (
        <div style={{ padding: '0.5rem 0' }}>
          <AdminPatientsTab isSubTab={true} />
        </div>
      )
    },
    {
      id: 'crm',
      label: 'All CRM Accounts & Leads',
      icon: Users2,
      content: (
        <div style={{ padding: '0.5rem 0' }}>
          <AdminCrmTab isSubTab={true} />
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-app)' }}>
      <PageHeader
        title="Customers"
        subtitle="Manage all customer accounts across Clinics, Wholesalers, and Individual Patients (Zoho Books Standard)."
        icon={Users2}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
        <Tabs
          tabs={tabs}
          defaultTab={defaultSubTab}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </div>
  );
}
