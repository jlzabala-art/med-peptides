"use client";

import React from 'react';
import PageHeader from '../ui/PageHeader';
import { Tabs } from '../ui/Tabs';
import AdminRFQTabClient from './AdminRFQTabClient';
import AdminBulkOrdersTab from './AdminBulkOrdersTab';
import AdminTabErrorBoundary from './AdminTabErrorBoundary';
import { ShoppingBag } from '@/lib/icons';

export default function AdminProcurementTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-bg-app)' }}>
      <PageHeader
        title="Procurement & Sourcing"
        subtitle="Manage Request For Quotes (RFQs) and Purchase Orders for your inventory."
        icon={ShoppingBag}
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
        <Tabs
          tabs={[
            {
              id: 'rfqs',
              label: 'RFQs',
              content: (
                <AdminTabErrorBoundary tabId="rfqs" tabLabel="RFQs">
                  <div style={{ padding: '1.5rem' }}>
                    <AdminRFQTabClient isSubTab={true} />
                  </div>
                </AdminTabErrorBoundary>
              )
            },
            {
              id: 'orders',
              label: 'Purchase Orders',
              content: (
                <AdminTabErrorBoundary tabId="orders" tabLabel="Purchase Orders">
                  <div style={{ padding: '1.5rem' }}>
                    <AdminBulkOrdersTab isSubTab={true} />
                  </div>
                </AdminTabErrorBoundary>
              )
            }
          ]}
          defaultTab="rfqs"
        />
      </div>
    </div>
  );
}
