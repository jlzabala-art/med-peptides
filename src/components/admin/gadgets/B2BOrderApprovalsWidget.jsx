import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Building2, Check, X } from 'lucide-react';

export default function B2BOrderApprovalsWidget() {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'bulk_orders'),
      where('status', '==', 'pending_admin_approval')
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(list);
    });

    return () => unsub();
  }, []);

  const handleAction = async (orderId, action) => {
    setLoadingId(orderId);
    try {
      await updateDoc(doc(db, 'bulk_orders', orderId), {
        status: action === 'approve' ? 'approved_and_shipping' : 'rejected',
        processedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={18} color="var(--primary)" /> Wholesaler Orders (B2B)
        </h3>
        {orders.length > 0 && (
          <span style={{ background: 'var(--color-danger)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-md)' }}>
            {orders.length} Requests
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {orders.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            No pending B2B orders for approval.
          </div>
        ) : (
          orders.map(order => (
            <div key={order.id} style={{ padding: '1rem', border: '1px solid #f1f5f9', borderRadius: 'var(--radius-md)', background: 'var(--color-bg-app)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>{order.wholesalerName}</h4>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                    Date: {order.createdAt ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                {order.items?.map((item, idx) => (
                  <div key={idx} style={{ padding: '0.6rem 0.8rem', borderBottom: idx < order.items.length - 1 ? '1px solid #f1f5f9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{item.productName}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>{item.quantity} boxes</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button 
                  onClick={() => handleAction(order.id, 'reject')}
                  disabled={loadingId === order.id}
                  style={{ 
                    flex: 1, padding: '0.6rem', background: '#fee2e2', color: 'var(--color-danger)', 
                    border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                  }}
                >
                  <X size={16} /> Reject
                </button>
                <button 
                  onClick={() => handleAction(order.id, 'approve')}
                  disabled={loadingId === order.id}
                  style={{ 
                    flex: 2, padding: '0.6rem', background: 'var(--color-success)', color: 'white', 
                    border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem'
                  }}
                >
                  <Check size={16} /> Approve & Ship
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
