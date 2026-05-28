import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { Package, Minus, Plus } from 'lucide-react';
import { catalog } from '../../../data/v2/index.js';

export default function RealTimeStockManagerWidget() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, 'wholesaler_inventory'), where('wholesalerId', '==', user.uid));
    
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Merge with catalog for names if they don't exist yet
      setInventory(items);
    });

    return () => unsub();
  }, [user]);

  const updateQuantity = async (productId, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      const docRef = doc(db, 'wholesaler_inventory', `${user.uid}_${productId}`);
      const prodData = catalog.find(p => p.id === productId);
      
      await setDoc(docRef, {
        wholesalerId: user.uid,
        productId: productId,
        productName: prodData?.name || productId,
        quantity: newQty,
        threshold: 5 // Default low stock alert threshold
      }, { merge: true });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Package size={18} color="var(--primary)" /> Inventario Físico (Clinic)
      </h3>
      
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {catalog.slice(0, 5).map(prod => { // For demo purposes, we show 5 key products to track
          const invItem = inventory.find(i => i.productId === prod.id) || { quantity: 0, threshold: 5 };
          const isLow = invItem.quantity <= invItem.threshold;

          return (
            <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-app)', borderRadius: '12px', border: isLow ? '1px solid #fecaca' : '1px solid #f1f5f9' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{prod.name}</div>
                {isLow && <div style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 800, marginTop: '0.2rem' }}>Stock Bajo</div>}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => updateQuantity(prod.id, invItem.quantity, -1)}
                  style={{ background: 'var(--color-border)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={14} />
                </button>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', width: '30px', textAlign: 'center' }}>
                  {invItem.quantity}
                </div>
                <button 
                  onClick={() => updateQuantity(prod.id, invItem.quantity, 1)}
                  style={{ background: 'var(--color-border)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
