import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import Spinner from '../ui/Spinner';
import { ShoppingBag, Package, Clock, Truck, CheckCircle2 } from 'lucide-react';

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

export default function DoctorOrdersTab({ doctorId, patients }) {
  const [filterPatient, setFilterPatient] = useState('');

  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['doctorOrders', doctorId],
    queryFn: async () => {
      if (!doctorId) return [];
      const q = query(collection(db, 'orders'), where('supervisingPhysicianId', '==', doctorId));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      return list;
    },
    enabled: !!doctorId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) return <Spinner text="Loading orders..." />;
  if (isError) return <div style={{ color: 'red', padding: '1rem' }}>Failed to load orders.</div>;

  const filteredOrders = filterPatient ? orders.filter(o => o.uid === filterPatient) : orders;

  const columns = [
    {
      header: 'Patient',
      key: 'patient',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.customer?.fullName || 'Patient'}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{row.customer?.email}</div>
        </div>
      )
    },
    {
      header: 'Order Details',
      key: 'details',
      render: (row) => {
        const dateStr = row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'Unknown date';
        return (
          <div>
            <div style={{ fontWeight: 500, fontFamily: 'monospace' }}>{row.orderId || row.id.slice(0, 8)}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{dateStr}</div>
          </div>
        );
      }
    },
    {
      header: 'Items',
      key: 'items',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {row.items?.slice(0, 2).map((item, i) => (
            <span key={i} style={{ fontSize: '0.85rem' }}>{item.quantity}x {item.name}</span>
          ))}
          {row.items?.length > 2 && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>+{row.items.length - 2} more</span>}
        </div>
      )
    },
    {
      header: 'Total',
      key: 'total',
      render: (row) => <div style={{ fontWeight: 600 }}>{row.totalDisplay || `$${Number(row.total || 0).toFixed(2)}`}</div>
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const config = getStatusConfig(row.status);
        return <StatusBadge status={row.status || 'Pending'} variant={config.color} icon={config.icon} />;
      }
    }
  ];

  return (
    <div style={{ padding: '2rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>Patient Orders</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', margin: 0 }}>Monitor orders placed by patients under your supervision.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <select
            value={filterPatient}
            onChange={e => setFilterPatient(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
          >
            <option value=''>— All Patients —</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>{[p.firstName, p.lastName].filter(Boolean).join(' ') || p.email}</option>
            ))}
          </select>
          <button onClick={() => refetch()} className="btn" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: 'var(--color-bg-app)', border: '1px solid #e2e8f0', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>

      <Card noPadding>
        {filteredOrders.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <ShoppingBag size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
            <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '1.1rem', margin: '0 0 0.5rem' }}>No orders found</p>
            <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>When supervised patients place orders, they will appear here.</p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredOrders} />
        )}
      </Card>
    </div>
  );
}
