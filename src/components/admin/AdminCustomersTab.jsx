"use client";

import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import AdminAllCustomersDirectory from './customers/AdminAllCustomersDirectory';
import { Users2 } from '@/lib/icons';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw';
import notifier from '../../services/NotificationService';

/**
 * AdminCustomersTab (Zoho Books & Google Cloud Console Standard)
 * ─────────────────────────────────────────────────────────────────────────────
 * Authoritative Unified Customers Console projected from the master `users` collection.
 * Replaces redundant top tabs with an integrated 8-KPI server-side facet bar
 * and direct master-detail exploration.
 */
export default function AdminCustomersTab() {
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.5rem 1.5rem 1.5rem' }}>
        <AdminAllCustomersDirectory onSyncSSOT={handleRegularizeCustomers} isSyncing={isRegularizing} />
      </div>
    </div>
  );
}
