"use client";

import React, { useState, useEffect } from 'react';
import { createBulkRestockOrder } from '../../../repositories/inventoryRepository';
import { useAuth } from '../../../context/AuthContext';
import { getActiveProducts } from '../../../repositories/productRepository';
import { ShoppingCart, Plus, Minus, CheckCircle2 } from '@/lib/icons';
import EmptyState from '../../ui/EmptyState';

export default function BulkRestockPortalWidget() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const prods = await getActiveProducts();
        setProducts(prods || []);
      } catch (err) {
        console.error('Failed to load active products:', err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    load();
  }, []);

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
      const prod = products.find(p => p.id === id);
      return {
        productId: id,
        productName: prod?.name || id,
        quantity: cart[id]
      };
    });

    if (items.length === 0) return;

    setLoading(true);
    try {
      await createBulkRestockOrder({
        wholesalerId: user?.uid || 'wholesaler',
        wholesalerName: user?.displayName || 'Clinic Partner',
        items: items,
        status: 'pending',
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
    <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={18} color="#003666" /> B2B Wholesale Dispatch Portal
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Select inventory lots for direct clinic replenishment dispatch
          </p>
        </div>
        {totalItems > 0 && (
          <span style={{ background: '#003666', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px' }}>
            {totalItems} items selected
          </span>
        )}
      </div>

      {success ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#16a34a', gap: '0.75rem', padding: '2rem 1rem' }}>
          <CheckCircle2 size={44} color="#16a34a" />
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ margin: 0, fontWeight: 800, color: '#15803d', fontSize: '1.05rem' }}>Wholesale Order Dispatched</h4>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              The warehouse logistics team has received the packing order.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '340px' }}>
            {loadingProducts ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="skeleton" style={{ height: '56px', borderRadius: '12px' }} />
                <div className="skeleton" style={{ height: '56px', borderRadius: '12px' }} />
                <div className="skeleton" style={{ height: '56px', borderRadius: '12px' }} />
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="No products available"
                subtitle="Active catalog items will appear here for wholesale restocking once created in the catalog."
              />
            ) : (
              products.slice(0, 10).map(prod => {
                const qty = cart[prod.id] || 0;
                return (
                  <div key={prod.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{prod.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>{prod.category || 'Peptide'} • Active Catalog</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button 
                        onClick={() => updateCart(prod.id, -1)}
                        style={{ 
                          background: '#e2e8f0', border: 'none', borderRadius: '8px', 
                          width: '36px', height: '36px', cursor: qty === 0 ? 'not-allowed' : 'pointer', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty === 0 ? 0.4 : 1 
                        }}
                        disabled={qty === 0}
                      >
                        <Minus size={14} color="#1e293b" />
                      </button>
                      <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', minWidth: '28px', textAlign: 'center' }}>
                        {qty}
                      </div>
                      <button 
                        onClick={() => updateCart(prod.id, 1)}
                        style={{ 
                          background: '#003666', border: 'none', borderRadius: '8px', 
                          width: '36px', height: '36px', cursor: 'pointer', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center' 
                        }}
                      >
                        <Plus size={14} color="#ffffff" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button 
            onClick={handleOrder}
            disabled={loading || totalItems === 0}
            style={{ 
              marginTop: '1.25rem', padding: '0.85rem', width: '100%', minHeight: '44px',
              background: totalItems > 0 ? '#16a34a' : '#cbd5e1', color: '#ffffff', border: 'none', borderRadius: '10px',
              fontWeight: 800, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              cursor: totalItems > 0 && !loading ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
              boxShadow: totalItems > 0 ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none'
            }}
          >
            {loading ? 'Processing Dispatch...' : `Dispatch Wholesale Order (${totalItems} items)`}
          </button>
        </>
      )}
    </div>
  );
}