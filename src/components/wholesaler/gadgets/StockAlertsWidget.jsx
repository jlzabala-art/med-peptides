"use client";

import React, { useState, useEffect } from 'react';
import { subscribeToLowStock } from '../../../repositories/inventoryRepository';
import { useAuth } from '../../../context/AuthContext';
import { AlertTriangle, CheckCircle2 } from '@/lib/icons';
import notifier from '../../../services/NotificationService';

export default function StockAlertsWidget() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }
    const unsub = subscribeToLowStock(user.uid, (lowStock) => {
      setAlerts(lowStock || []);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const handleRestock = (productName) => {
    notifier.info(`Draft purchase order generated for ${productName}. Added to procurement batch.`);
  };

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #fed7aa', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#9a3412', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} color="#ea580c" /> Warehouse Inventory Alerts
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Stock depletion thresholds & urgent supplier replenishment
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ height: '60px', borderRadius: '12px' }} />
          </div>
        ) : alerts.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#16a34a', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 1rem', gap: '0.5rem' }}>
            <CheckCircle2 size={32} color="#16a34a" />
            <span>All warehouse inventory is currently at optimal operating levels.</span>
          </div>
        ) : (
          alerts.map(a => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', border: '1px solid #ffedd5', borderRadius: '12px', background: '#fff7ed', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#9a3412', fontWeight: 700 }}>{a.productName}</h4>
                <div style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: '0.15rem', fontWeight: 600 }}>
                  Only {a.quantity} units remaining (threshold: {a.threshold || 50})
                </div>
              </div>
              <button 
                onClick={() => handleRestock(a.productName)}
                style={{ 
                  padding: '0.45rem 0.85rem', background: '#c2410c', color: '#ffffff', 
                  border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.78rem', 
                  cursor: 'pointer', minHeight: '36px', boxShadow: '0 1px 4px rgba(194, 65, 12, 0.2)' 
                }}
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