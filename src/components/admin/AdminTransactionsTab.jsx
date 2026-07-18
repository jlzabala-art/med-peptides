"use client";

import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import AdminFinanceTab from './AdminFinanceTab';
import { TrendingUp } from '@/lib/icons';

export default function AdminTransactionsTab() {
  const [activeTab, setActiveTab] = useState('finance'); // finance

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-app)' }}>
      <PageHeader
        title="Transactions Ledger"
        subtitle="Manage invoices, supplier bills, and synchronize financial records."
        icon={TrendingUp}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('finance')}
              className={`btn ${activeTab === 'finance' ? 'btn-primary' : 'btn-outline'}`}
            >
              CFO Intelligence Hub
            </button>
            <button
              onClick={() => setActiveTab('bills')}
              className={`btn ${activeTab === 'bills' ? 'btn-primary' : 'btn-outline'}`}
            >
              Supplier Bills
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {activeTab === 'finance' && <AdminFinanceTab isSubTab={true} />}
        {activeTab === 'bills' && (
          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            Supplier Bills module is under construction.
          </div>
        )}
      </div>
    </div>
  );
}
