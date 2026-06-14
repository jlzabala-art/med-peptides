import ShoppingCart from "lucide-react/dist/esm/icons/shopping-cart";
import Plus from "lucide-react/dist/esm/icons/plus";
import Minus from "lucide-react/dist/esm/icons/minus";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import React, { useState } from 'react';
import { db } from '../../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';




import { catalog } from '../../../data/v2/index.js';

export default function BulkRestockPortalWidget() {
  const { user } = useAuth();
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const updateCart = (prodId, delta) => {
    setCart(prev => {
      const current = prev[prodId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[prodId];
        return copy;
      }
      return { ...prev, [prodId]: next };
    });
  };

  const handleOrder = async () => {
    const items = Object.keys(cart).map(id => {
      const prod = catalog.find(p => p.id === id);
      return {
        productId: id,
        productName: prod?.name || id,
        quantity: cart[id]
      };
    });

    if (items.length === 0) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'bulk_orders'), {
        wholesalerId: user.uid,
        wholesalerName: user.displayName || 'Clinic',
        items: items,
        status: 'pending_admin_approval',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCart({});
      }, 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="card" style={{ padding: '2rem', background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingCart size={18} color="var(--primary)" /> Portal de Abastecimiento B2B
        </h3>
        {totalItems > 0 && (
          <span style={{ background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>
            {totalItems} items
          </span>
        )}
      </div>

      {success ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)', gap: '1rem', padding: '1rem 0' }}>
          <CheckCircle2 size={40} />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: 800 }}>Pedido B2B Enviado</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>El administrador procesará tu solicitud de inventario.</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Añade cajas o viales a tu pedido mayorista. Se enviarán directamente a tu clínica.</p>
            {catalog.slice(0, 5).map(prod => { // Using 5 products for demo
              const qty = cart[prod.id] || 0;
              return (
                <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-app)', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{prod.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>Cajas de 10 viales</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button 
                      onClick={() => updateCart(prod.id, -1)}
                      style={{ background: 'var(--color-border)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty === 0 ? 0.5 : 1 }}
                      disabled={qty === 0}
                    >
                      <Minus size={14} />
                    </button>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#0f172a', width: '30px', textAlign: 'center' }}>
                      {qty}
                    </div>
                    <button 
                      onClick={() => updateCart(prod.id, 1)}
                      style={{ background: 'var(--color-border)', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={handleOrder}
            disabled={loading || totalItems === 0}
            style={{ 
              marginTop: '1.5rem', padding: '0.85rem', width: '100%',
              background: totalItems > 0 ? 'var(--color-success)' : 'var(--color-border)', color: 'white', border: 'none', borderRadius: '12px',
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: totalItems > 0 && !loading ? 'pointer' : 'not-allowed', transition: 'background 0.2s'
            }}
          >
            {loading ? 'Procesando...' : `Enviar Pedido (${totalItems} items)`}
          </button>
        </>
      )}
    </div>
  );
}