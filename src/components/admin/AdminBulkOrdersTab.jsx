"use client";

import React, { useState } from 'react';
import DataTable from '../ui/DataTable';
import StatusChip from '../ui/StatusChip';
import CopyableId from '../ui/CopyableId';
import GlobalSearchBar from '../ui/GlobalSearchBar';
import EmptyState from '../ui/EmptyState';
import MetricCard from '../ui/MetricCard';
import { ShoppingCart, FileText, CheckCircle, Package, AlertCircle, TrendingUp, Clock, Eye } from 'lucide-react';
import { useBulkOrders } from '../../hooks/data/useBulkOrders';
import AppActionGroup from '../ui/AppActionGroup';

export default function AdminBulkOrdersTab({ isSubTab = false }) {
  const { orders, isLoading, error } = useBulkOrders();

  const [searchQuery, setSearchQuery] = useState('');
  
  const columns = [
    {
      key: 'id',
      label: 'PO Number',
      width: '18%',
      render: (row) => <CopyableId value={row.id} />
    },
    {
      key: 'supplierName',
      label: 'Supplier',
      width: '25%'
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      width: '15%',
      render: (row) => row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'N/A'
    },
    {
      key: 'totalAmount',
      label: 'Total Value',
      width: '15%',
      render: (row) => <span style={{ fontWeight: '500' }}>${(row.totalAmount || 0).toFixed(2)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      width: '15%',
      render: (row) => <StatusChip status={row.status} />
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '12%',
      render: (row) => (
        <div style={{ display: 'inline-flex', justifyContent: 'flex-end', width: '100%' }}>
          <AppActionGroup maxVisible={2} actions={[
            { type: 'view', onClick: (e) => { e.stopPropagation(); /* Action logic */ }, label: 'View' }
          ]} />
        </div>
      )
    }
  ];

  const expandedRowRender = (row) => {
    return (
      <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-app)', borderTop: '1px solid var(--color-border)' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-text-main)' }}>Order Items</h4>
        <DataTable
          data={row.items || []}
          pagination={false}
          columns={[
            { key: 'itemName', label: 'Item', width: '40%' },
            { key: 'quantity', label: 'Quantity', width: '20%' },
            { 
              key: 'unitPrice', 
              label: 'Unit Price', 
              width: '20%',
              render: (r) => `$${(r.unitPrice || 0).toFixed(2)}`
            },
            { 
              key: 'subtotal', 
              label: 'Subtotal', 
              width: '20%',
              render: (r) => <span style={{ fontWeight: '500' }}>${(r.quantity * (r.unitPrice || 0)).toFixed(2)}</span>
            }
          ]}
        />
      </div>
    );
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* KPIs */}
      <div className="kpi-grid-4">
        <MetricCard
          title="Active POs"
          value={isLoading ? '...' : safeOrders.filter(o => o.status !== 'delivered').length}
          icon={ShoppingCart}
          trend="+2 this week"
          trendDirection="up"
        />
        <MetricCard
          title="Pending Delivery"
          value={isLoading ? '...' : safeOrders.filter(o => o.status === 'processing').length}
          icon={Clock}
          trend="-1 from yesterday"
          trendDirection="down"
        />
        <MetricCard
          title="Delivered"
          value={isLoading ? '...' : safeOrders.filter(o => o.status === 'delivered').length}
          icon={Package}
        />
        <MetricCard
          title="Total Spent (MTD)"
          value={isLoading ? '...' : `$${safeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}`}
          icon={TrendingUp}
        />
      </div>

      {/* Global Search */}
      <GlobalSearchBar 
        placeholder="Search purchase orders by ID, supplier, or items..."
        value={searchQuery}
        onChange={setSearchQuery}
        size="lg"
      />

      {/* Main Table */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {isLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading purchase orders...</div>
        ) : safeOrders.length === 0 ? (
          <EmptyState 
            icon={Package}
            title="No Purchase Orders"
            subtitle="You haven't created any purchase orders yet."
            action={{ label: "Create PO", onClick: () => {} }}
          />
        ) : (
          <DataTable
            columns={columns}
            data={safeOrders}
            searchQuery={searchQuery}
            expandableRender={expandedRowRender}
          />
        )}
      </div>
    </div>
  );
}
