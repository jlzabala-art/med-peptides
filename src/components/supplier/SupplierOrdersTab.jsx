"use client";

import React, { useState, useMemo } from 'react';
import { useSupplierOrders } from '@/hooks/data/useSupplierOrders';
import { ShoppingBag, Clock, CheckCircle2, DollarSign } from '@/lib/icons';
import DataModule from '@/components/ui/DataModule';
import MetricCard from '@/components/ui/MetricCard';
import CopyableId from '@/components/ui/CopyableId';
import StatusBadge from '@/components/ui/StatusBadge';

export default function SupplierOrdersTab() {
  const { orders, loading, error, hasMore, loadMore } = useSupplierOrders({ pageSize: 20 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const status = (order.status || 'active').toLowerCase();
      if (statusFilter !== 'all' && status !== statusFilter) return false;
      if (!q) return true;
      return (
        String(order.id || '').toLowerCase().includes(q) ||
        status.includes(q)
      );
    });
  }, [orders, searchTerm, statusFilter]);

  const kpiStats = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter((o) => (o.status || '').toLowerCase() === 'pending').length;
    const completedCount = orders.filter((o) => ['delivered', 'completed', 'active'].includes((o.status || '').toLowerCase())).length;
    const totalVolume = orders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
    return { totalCount, pendingCount, completedCount, totalVolume };
  }, [orders]);

  const columns = [
    {
      key: 'id',
      header: 'Order ID',
      width: '24%',
      render: (order) => (
        <CopyableId value={order.id} displayValue={order.id?.substring(0, 10) || '—'} />
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      width: '20%',
      render: (order) => (
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {order.createdAt?.seconds
            ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
            : order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '20%',
      render: (order) => (
        <StatusBadge status={order.status === 'pending' ? 'pending' : (order.status || 'active')} />
      ),
    },
    {
      key: 'total',
      header: 'Total',
      width: '18%',
      render: (order) => (
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          ${order.total ? Number(order.total).toFixed(2) : '0.00'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '18%',
      align: 'right',
      render: () => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="gcp-btn-secondary"
            style={{
              minHeight: '44px',
              padding: '0 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Details
          </button>
        </div>
      ),
    },
  ];

  const activeFilters = statusFilter !== 'all'
    ? [{
        id: 'status',
        label: `Status: ${statusFilter}`,
        onRemove: () => setStatusFilter('all'),
      }]
    : [];

  return (
    <DataModule
      title="B2B Orders"
      subtitle="Manage incoming wholesale and distribution orders."
      icon={ShoppingBag}
      panel="supplier"
      namespace="supplier_orders"
      searchPlaceholder="Search by Order ID or status..."
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      resultCount={filteredOrders.length}
      totalCount={orders.length}
      filterOptions={[
        {
          id: 'status',
          label: 'Status',
          value: statusFilter,
          onChange: setStatusFilter,
          options: [
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'processing', label: 'Processing' },
            { value: 'delivered', label: 'Delivered' },
          ],
        },
      ]}
      filters={activeFilters}
      onClearAllFilters={() => {
        setSearchTerm('');
        setStatusFilter('all');
      }}
      kpis={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <MetricCard title="Loaded Orders" value={kpiStats.totalCount} subtitle="Current page batch" icon={ShoppingBag} color="#2563eb" />
          <MetricCard title="Pending Review" value={kpiStats.pendingCount} subtitle="Awaiting fulfillment" icon={Clock} color="#d97706" />
          <MetricCard title="Active / Delivered" value={kpiStats.completedCount} subtitle="Processed orders" icon={CheckCircle2} color="#16a34a" />
          <MetricCard title="Order Volume" value={`$${kpiStats.totalVolume.toFixed(2)}`} subtitle="Total across loaded orders" icon={DollarSign} color="#0f172a" />
        </div>
      }
      data={filteredOrders}
      columns={columns}
      loading={loading && orders.length === 0}
      hasMore={hasMore}
      onLoadMore={loadMore}
      isFetchingMore={loading && orders.length > 0}
      emptyState={{
        icon: ShoppingBag,
        title: 'No B2B orders yet',
        subtitle: error || 'Incoming wholesale orders will appear here automatically.',
      }}
    />
  );
}
