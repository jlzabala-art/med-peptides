import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { AlertOctagon, Calendar, PackageSearch, ArrowRight } from 'lucide-react';

// Demo data fallback for illustration
const DEMO_BATCHES = [
  { id: '1', batchId: 'LOT-A12-24', product: 'BPC-157 5mg', quantity: 240, expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }, // 15 days
  { id: '2', batchId: 'LOT-B99-23', product: 'TB-500 10mg', quantity: 85, expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },  // 45 days
  { id: '3', batchId: 'LOT-C04-24', product: 'GHK-Cu 50mg', quantity: 500, expiryDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000) } // 120 days
];

export default function BatchExpirationTrackerWidget() {
  const { user } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBatches() {
      if (!user?.uid) return;
      try {
        // En una app real, los lotes de B2B se guardarían bajo b2b_inventory
        const q = query(
          collection(db, 'b2b_inventory'), 
          where('wholesalerId', '==', user.uid),
          orderBy('expiryDate', 'asc'),
          limit(10)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          setBatches(snap.docs.map(d => ({ 
            id: d.id, 
            ...d.data(),
            expiryDate: d.data().expiryDate?.toDate() || new Date()
          })));
        } else {
          setBatches(DEMO_BATCHES); // fallback for UI demonstration
        }
      } catch (err) {
        console.error("Error fetching batches", err);
        setBatches(DEMO_BATCHES);
      } finally {
        setLoading(false);
      }
    }
    fetchBatches();
  }, [user]);

  const getDaysUntilExpiry = (date) => {
    const diff = date.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const getStatusColor = (days) => {
    if (days < 30) return 'var(--color-danger)'; // Red
    if (days < 90) return '#f59e0b'; // Amber
    return 'var(--color-success)'; // Green
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} color="var(--primary)" /> Vencimiento de Lotes
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Monitoreo de caducidad de inventario físico.</p>
        </div>
        <div style={{ padding: '0.5rem', background: '#fff1f2', borderRadius: '12px', color: '#e11d48' }}>
          <AlertOctagon size={20} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Cargando lotes...</div>
        ) : batches.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <PackageSearch size={32} opacity={0.5} />
            Sin lotes registrados
          </div>
        ) : (
          batches.map(batch => {
            const days = getDaysUntilExpiry(batch.expiryDate);
            const color = getStatusColor(days);
            
            return (
              <div key={batch.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--color-bg-app)', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>{batch.product}</span>
                  <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem', fontFamily: 'monospace' }}>Lote: {batch.batchId} • Qty: {batch.quantity} ud.</span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>Caduca en</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
                    <span style={{ fontWeight: 800, color: color, fontSize: '1.1rem' }}>{days} d</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button style={{ marginTop: '1rem', width: '100%', padding: '0.75rem', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: '12px', color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', cursor: 'pointer' }}>
        Ver inventario completo <ArrowRight size={14} />
      </button>
    </div>
  );
}
