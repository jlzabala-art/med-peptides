"use client";

import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSupplierOrders } from '../../../hooks/data/useSupplierOrders';
import { ShoppingBag } from '@/lib/icons';

export default function SupplierOrdersPage() {
  const { userProfile } = useAuth();
  const { orders, loading, error, hasMore, loadMore } = useSupplierOrders({ pageSize: 20 });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2rem', fontWeight: 900, color: 'var(--primary)' }}>
          <ShoppingBag size={32} /> B2B Orders
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage incoming wholesale and distribution orders.</p>
      </div>

      <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)', padding: '1.5rem' }}>
        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
        
        {loading && orders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No orders received yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Total</th>
                  <th style={{ padding: '1rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{order.id.substring(0, 8)}...</td>
                    <td style={{ padding: '1rem' }}>
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '999px', 
                        fontSize: '0.85rem', 
                        fontWeight: 700,
                        backgroundColor: order.status === 'pending' ? '#fef3c7' : '#dcfce7',
                        color: order.status === 'pending' ? '#92400e' : '#166534'
                      }}>
                        {order.status || 'Received'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      ${order.total ? order.total.toFixed(2) : '0.00'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.85rem'
                      }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button 
                  onClick={loadMore} 
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border)',
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
        )}
      </div>
    </div>
  );
}
