import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { Users, ShoppingBag, Calendar, Mail, FileText, CheckCircle, Clock } from 'lucide-react';

export default function ClientsTab() {
  const { userProfile } = useAuth();
  const tenantId = userProfile?.assignedTenantId || userProfile?.tenantId;

  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('clients'); // clients, orders

  useEffect(() => {
    if (!tenantId) return;

    async function fetchAttributedData() {
      setLoading(true);
      try {
        // Query users attributed to this tenant
        const usersRef = collection(db, 'users');
        const usersQ = query(usersRef, where('tenantId', '==', tenantId));
        const usersSnap = await getDocs(usersQ);
        const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClients(usersList);

        // Query orders stamped with this tenantId
        const ordersRef = collection(db, 'orders');
        const ordersQ = query(ordersRef, where('tenantId', '==', tenantId));
        const ordersSnap = await getDocs(ordersQ);
        const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort orders by createdAt local descending
        ordersList.sort((a, b) => {
          const ad = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
          const bd = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
          return bd - ad;
        });
        setOrders(ordersList);
      } catch (err) {
        console.error('Failed to load wholesaler attributed data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAttributedData();
  }, [tenantId]);

  if (!tenantId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Users size={40} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>No Franchise Tenant Assigned</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Please contact Med-Peptides support to link your account.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading attributed data...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '8px' }}>
            <Users size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Client Management</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>View registered clinics and track franchise client orders.</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'var(--color-border)', borderRadius: '8px', padding: '0.25rem' }}>
          <button
            onClick={() => setActiveSubTab('clients')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeSubTab === 'clients' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeSubTab === 'clients' ? '#0f172a' : 'var(--color-text-secondary)',
              boxShadow: activeSubTab === 'clients' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Clinics & Patients ({clients.length})
          </button>
          <button
            onClick={() => setActiveSubTab('orders')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeSubTab === 'orders' ? 'var(--color-bg-surface)' : 'transparent',
              color: activeSubTab === 'orders' ? '#0f172a' : 'var(--color-text-secondary)',
              boxShadow: activeSubTab === 'orders' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            Invoiced Orders ({orders.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'clients' ? (
        <div style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {clients.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              No clients or clinics registered under your franchise yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-app)', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Institution</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(client => (
                  <tr key={client.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {client.firstName} {client.lastName}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)' }}>
                      <a href={`mailto:${client.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'inherit', textDecoration: 'none' }}>
                        <Mail size={14} /> {client.email}
                      </a>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)' }}>{client.institution || '—'}</td>
                    <td style={{ padding: '14px 16px', textTransform: 'capitalize', color: 'var(--color-text-secondary)' }}>{client.role || 'guest'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: client.approved ? '#dcfce7' : '#fee2e2',
                        color: client.approved ? 'var(--color-success)' : '#b91c1c'
                      }}>
                        {client.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div style={{ background: 'var(--color-bg-surface)', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
              No orders received under your franchise yet.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-app)', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Order ID</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Customer</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Date</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Total</th>
                  <th style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const date = order.createdAt?.seconds 
                    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                    : order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—';
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>
                        {order.orderId || order.id}
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-primary)' }}>
                        <div>{order.customer?.fullName || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{order.customer?.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--color-text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={14} /> {date}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a' }}>
                        {order.totalDisplay || `$${order.total?.toFixed(2)}`}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: order.status === 'completed' || order.status === 'fulfilled' ? '#dcfce7' : '#fef3c7',
                          color: order.status === 'completed' || order.status === 'fulfilled' ? 'var(--color-success)' : '#b91c1c'
                        }}>
                          {order.status === 'completed' || order.status === 'fulfilled' ? (
                            <>
                              <CheckCircle size={12} /> Fulfilled
                            </>
                          ) : (
                            <>
                              <Clock size={12} /> {order.status || 'Pending'}
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
