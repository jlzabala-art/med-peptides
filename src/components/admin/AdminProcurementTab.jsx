"use client";

import React, { useState } from 'react';
import PageHeader from '../ui/PageHeader';
import AdminRFQTab from './AdminRFQTab';
// import AdminBulkOrdersTab from './AdminBulkOrdersTab'; // Assume this exists or will exist
import { ShoppingBag } from '@/lib/icons';

export default function AdminProcurementTab() {
  const [activeTab, setActiveTab] = useState('rfqs'); // rfqs | orders

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-app)' }}>
      <PageHeader
        title="Procurement & Sourcing"
        subtitle="Manage Request For Quotes (RFQs) and Purchase Orders for your inventory."
        icon={ShoppingBag}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('rfqs')}
              className={`btn ${activeTab === 'rfqs' ? 'btn-primary' : 'btn-outline'}`}
            >
              RFQs
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-outline'}`}
            >
              Purchase Orders
            </button>
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {activeTab === 'rfqs' && <AdminRFQTab isSubTab={true} />}
        {activeTab === 'orders' && (
          <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)' }}>
            Purchase Orders module is currently being integrated.
          </div>
        )}
      </div>
    </div>
  );
}
