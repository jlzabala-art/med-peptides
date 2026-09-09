"use client";

import React, { useState, useEffect } from 'react';
import PackageSearch from "lucide-react/dist/esm/icons/package-search";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Truck from "lucide-react/dist/esm/icons/truck";
import StatusBadge from '../../ui/StatusBadge';
import EmptyState from '../../ui/EmptyState';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { subscribeToWholesaleOrders } from '../../../repositories/inventoryRepository';

export default function BulkOrderTrackerWidget() {
  const router = useRouter();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToWholesaleOrders(user?.uid || null, (data) => {
      setOrders(data || []);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="card" style={{ padding: '1.5rem', background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PackageSearch size={18} color="#003666" /> B2B Outbound Shipment Tracker
          </h3>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
            Active wholesale dispatches and partner clinic deliveries
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div className="skeleton" style={{ height: '70px', borderRadius: '12px' }} />
            <div className="skeleton" style={{ height: '70px', borderRadius: '12px' }} />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="No active dispatches"
            subtitle="Real-time clinic shipments and wholesale orders will appear here once created."
          />
        ) : (
          orders.map(o => (
            <div key={o.id} style={{ padding: '0.85rem 1rem', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', fontWeight: 800 }}>{o.id}</h4>
                    <span style={{ fontSize: '0.75rem', color: '#003666', fontWeight: 700 }}>• {o.clinic}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.2rem' }}>{o.items}</div>
                </div>
                <StatusBadge status={o.status} />
              </div>
              <div style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px dashed #e2e8f0', paddingTop: '0.5rem' }}>
                <Truck size={14} color="#0284c7" /> Estimated Delivery: <strong style={{ color: '#0f172a' }}>{o.date}</strong>
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => router.push('/admin/orders')}
        style={{ 
          background: 'transparent', border: 'none', color: '#003666', fontWeight: 700, 
          fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem', 
          cursor: 'pointer', padding: '0.6rem 0 0', marginTop: '0.75rem', alignSelf: 'flex-start' 
        }}
      >
        <span>View All Wholesale Orders</span> <ArrowRight size={14} />
      </button>
    </div>
  );
}