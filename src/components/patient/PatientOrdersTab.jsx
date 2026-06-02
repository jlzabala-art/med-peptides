import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import StatusChip from '../ui/StatusChip';
import Spinner from '../ui/Spinner';
import { Package, Clock, Truck, CheckCircle2, Sparkles } from 'lucide-react';

const getStatusConfig = (status) => {
  const s = status?.toLowerCase();
  switch (s) {
    case 'completed':
    case 'delivered':
      return { color: 'success', icon: <CheckCircle2 size={16} /> };
    case 'shipped':
    case 'in transit':
      return { color: 'info', icon: <Truck size={16} /> };
    case 'pending':
    case 'processing':
      return { color: 'warning', icon: <Clock size={16} /> };
    case 'cancelled':
      return { color: 'error', icon: <Package size={16} /> };
    default:
      return { color: 'gray', icon: <Package size={16} /> };
  }
};

export default function PatientOrdersTab({ userId }) {
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['patientOrders', userId],
    queryFn: async () => {
      if (!userId) return [];
      const q = query(
        collection(db, 'orders'),
        where('uid', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    enabled: !!userId,
  });

  if (isLoading) return <Spinner text="Loading your orders..." />;
  if (isError) return <div style={{ color: 'red', padding: '1rem' }}>Failed to load orders.</div>;

  const columns = [
    {
      header: 'Order ID',
      key: 'orderId',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.orderId || row.id.slice(0, 8)}</span>
    },
    {
      header: 'Date',
      key: 'createdAt',
      render: (row) => row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'N/A'
    },
    {
      header: 'Items',
      key: 'items',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {row.items?.slice(0, 2).map((item, i) => (
            <span key={i} style={{ fontSize: '0.85rem' }}>
              {item.quantity}x {item.name}
            </span>
          ))}
          {row.items?.length > 2 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              +{row.items.length - 2} more
            </span>
          )}
        </div>
      )
    },
    {
      header: 'Total',
      key: 'total',
      render: (row) => <span style={{ fontWeight: 600 }}>${(row.total || 0).toFixed(2)}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const config = getStatusConfig(row.status);
        return <StatusChip status={row.status || 'Pending'} variant={config.color} icon={config.icon} />;
      }
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-clinical-ai', {
              detail: {
                message: `Can you check the status of my order #${row.orderId || row.id.slice(0, 8)}? It is currently marked as ${row.status || 'Pending'}.`,
                patientContext: true,
                autoSend: true
              }
            }));
          }}
          title="Ask Atlas about this order"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
            padding: '0.35rem 0.65rem', borderRadius: '6px',
            border: '1px solid rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <Sparkles size={14} /> Ask Atlas
        </button>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>My Orders</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>View and track your recent orders.</p>
      </div>
      <Card noPadding>
        <DataTable columns={columns} data={orders} emptyMessage="You haven't placed any orders yet." />
      </Card>
    </div>
  );
}
