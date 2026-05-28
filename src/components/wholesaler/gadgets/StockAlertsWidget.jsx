import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export default function StockAlertsWidget() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'wholesaler_inventory'), where('wholesalerId', '==', user.uid));
    
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const lowStock = items.filter(i => i.quantity <= (i.threshold || 5));
      setAlerts(lowStock);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fca5a5', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', color: '#7f1d1d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertTriangle size={18} color="var(--color-danger)" /> Alerts de Inventario
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto' }}>
        {alerts.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
            Todo tu inventario está en niveles óptimos.
          </div>
        ) : (
          alerts.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #fecaca', borderRadius: '12px', background: 'var(--color-danger-bg)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#7f1d1d', fontWeight: 700 }}>{a.productName}</h4>
                <div style={{ fontSize: '0.8rem', color: '#991b1b', marginTop: '0.2rem' }}>Quedan {a.quantity} unidades</div>
              </div>
              <button 
                onClick={() => alert("Por favor usa el Portal B2B para reabastecer.")}
                style={{ padding: '0.4rem 0.8rem', background: 'var(--color-danger)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Re-Stock
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
