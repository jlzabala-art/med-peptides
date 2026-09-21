"use client";

import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';
import AdminAllCustomersDirectory from './customers/AdminAllCustomersDirectory';
import AdminClinicsTab from './AdminClinicsTab';
import AdminWholesellersTabClient from './AdminWholesellersTabClient';
import AdminPatientsTab from './AdminPatientsTab';
import AdminCrmTab from './AdminCrmTab';
import { Users2, Building2, User, Stethoscope, Briefcase } from '@/lib/icons';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import notifier from '../../services/NotificationService';

/**
 * AdminCustomersTab (Zoho Books Standard)
 * ─────────────────────────────────────────────────────────────────────────────
 * Unifies all customer channels into a single coherent interface:
 * 1. All Customers Directory (Consolidated Single Source of Truth)
 * 2. Clinics & Doctors (B2B Accounts)
 * 3. Wholesalers (Bulk Distributors / Resellers)
 * 4. Individuals / Patients (B2C Direct)
 * 5. All Accounts & CRM Overview
 *
 * Supports cross-counterparty identification (Customer that is also a Supplier).
 */
export default function AdminCustomersTab({ defaultSubTab = 'all' }) {
  const [activeTab, setActiveTab] = useState(defaultSubTab);
  const [isRegularizing, setIsRegularizing] = useState(false);

  const handleRegularizeCustomers = async () => {
    notifier.confirmCritical(
      'Consolidate and project all Clinics, Wholesalers, Patients, and Doctors into the authoritative Customers SSOT collection?',
      async () => {
        setIsRegularizing(true);
        try {
          const res = await fetch('/api/admin/regularize-customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Regularization failed');
          notifier.success(data.message || 'Customers collection consolidated successfully.');
        } catch (err) {
          notifier.error(err.message || 'Failed to regularize customers');
        } finally {
          setIsRegularizing(false);
        }
      }
    );
  };

  const tabs = [
    {
      id: 'all',
      label: 'All Customers',
      icon: Users2,
      content: (
        <div style={{ padding: '0.5rem 0' }}>
          <AdminAllCustomersDirectory onSyncSSOT={handleRegularizeCustomers} isSyncing={isRegularizing} />
        </div>
      )
    },
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
        showDashboardBack={false}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="gcp-btn-secondary"
              onClick={handleRegularizeCustomers}
              disabled={isRegularizing}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                fontSize: '0.80rem',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: isRegularizing ? 'wait' : 'pointer'
              }}
              title="Reconcile and consolidate all counterparty records into the unified customers collection"
            >
              <RefreshCw size={14} className={isRegularizing ? 'spin' : ''} />
              <span>{isRegularizing ? 'Regularizing...' : 'Sync Customers SSOT'}</span>
            </button>
          </div>
        }
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
