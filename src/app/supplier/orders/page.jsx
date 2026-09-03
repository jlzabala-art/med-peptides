"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSupplierOrders } from '../../../hooks/data/useSupplierOrders';
import { ShoppingBag } from '@/lib/icons';
import DataTable from '../../../components/ui/DataTable';
import CopyableId from '../../../components/ui/CopyableId';
import StatusBadge from '../../../components/ui/StatusBadge';

export default function SupplierOrdersPage() {
  const { userProfile } = useAuth();
  const { orders, loading, error, hasMore, loadMore } = useSupplierOrders({ pageSize: 20 });

  const columns = [
    {
      key: 'id',
      header: 'Order ID',
      width: '24%',
      render: (order) => (
        <CopyableId value={order.id} displayValue={order.id?.substring(0, 10) || '—'} />
      )
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
      )
    },
    {
      key: 'status',
      header: 'Status',
      width: '20%',
      render: (order) => (
        <StatusBadge status={order.status === 'pending' ? 'pending' : (order.status || 'active')} />
      )
    },
    {
      key: 'total',
      header: 'Total',
      width: '18%',
      render: (order) => (
        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
          ${order.total ? Number(order.total).toFixed(2) : '0.00'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '18%',
      align: 'right',
      render: (order) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => {}}
            className="gcp-btn-secondary"
            style={{
              minHeight: '44px',
              padding: '0 12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Details
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
          <ShoppingBag size={32} /> B2B Orders
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage incoming wholesale and distribution orders.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', padding: '1rem' }}>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        <DataTable
          columns={columns}
          data={orders}
          isLoading={loading && orders.length === 0}
          emptyTitle="No B2B orders yet"
          emptyDescription="Incoming wholesale orders will appear here automatically."
        />
        
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button 
              onClick={loadMore} 
              disabled={loading}
              className="gcp-btn-secondary"
              style={{
                minHeight: '44px',
                padding: '0 1.5rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Load More Orders'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
