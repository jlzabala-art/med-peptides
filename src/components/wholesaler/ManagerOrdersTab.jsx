import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Package, ExternalLink, CreditCard, Link2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import DataTable from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import PaymentLinkDialog from './gadgets/PaymentLinkDialog';

export default function ManagerOrdersTab() {
  const { currentUser } = useAuth();
  const [paymentOrder, setPaymentOrder] = React.useState(null);

  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['managerOrders', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return [];
      const ordersRef = collection(db, 'orders');
      const qOrders = query(ordersRef, where('assignedAccountManagerId', '==', currentUser.uid));
      const ordersSnap = await getDocs(qOrders);
      
      const ordersList = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by date descending
      return ordersList.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return dateB - dateA;
      });
    },
    enabled: !!currentUser?.uid,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading) {
    return <Spinner text="Loading orders..." />;
  }

  if (isError) {
    return <div style={{ padding: '2rem', color: 'red' }}>Failed to load orders.</div>;
  }

  const columns = [
    {
      header: 'Order ID',
      key: 'id',
      render: (row) => <span style={{ fontWeight: 500 }}>{row.id.slice(-6).toUpperCase()}</span>
    },
    {
      header: 'Date',
      key: 'date',
      render: (row) => <span style={{ color: 'var(--color-text-secondary)' }}>{row.createdAt?.toDate ? row.createdAt.toDate().toLocaleDateString() : 'N/A'}</span>
    },
    {
      header: 'Client',
      key: 'client',
      render: (row) => row.buyerName || 'Unknown Client'
    },
    {
      header: 'Total',
      key: 'total',
      render: (row) => <span style={{ fontWeight: 500 }}>${typeof row.total === 'number' ? row.total.toFixed(2) : row.total || '0.00'}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setPaymentOrder(row)}
            style={{ 
              background: 'none', border: '1px solid #cbd5e1', color: '#0f172a', 
              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', 
              gap: '0.25rem', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '4px' 
            }}>
            {row.paymentLink ? <Link2 size={12} color="var(--color-success)" /> : <CreditCard size={12} />}
            {row.paymentLink ? 'View Link' : 'Payment'}
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
            View <ExternalLink size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>Client Orders</h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: 0 }}>Review and manage orders placed by your assigned clients.</p>
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-border)', padding: '0.5rem 1rem', borderRadius: '20px' }}>
          Total: {orders.length}
        </div>
      </div>

      {orders.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={48} color="var(--color-border)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', margin: '0 0 0.5rem' }}>No Orders Found</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '400px', margin: '0 auto' }}>
            There are no orders from your assigned clients yet.
          </p>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <DataTable columns={columns} data={orders} keyField="id" />
        </Card>
      )}

      {paymentOrder && (
        <PaymentLinkDialog 
          order={paymentOrder} 
          onClose={() => setPaymentOrder(null)} 
        />
      )}
    </div>
  );
}
