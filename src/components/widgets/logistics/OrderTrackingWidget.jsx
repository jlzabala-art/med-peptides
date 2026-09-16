"use client";

import React, { useState, useEffect } from 'react';
import { fetchRecentShipments } from '../../../services/procurementService';
import { Package, Truck } from '@/lib/icons';
import BaseWidget from '../core/BaseWidget';

export default function OrderTrackingWidget(props) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { role = 'admin', userId } = props;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const list = await fetchRecentShipments(5);
        setOrders(list);
      } catch (err) {
        // handled
      }
      setLoading(false);
    };

    fetchOrders();
  }, [role, userId]);

  return (
    <BaseWidget 
      title={role === 'patient' ? "My Orders" : "Logistics & Dispensing Tracking"} 
      icon={Truck} 
      {...props}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '120px' }}>
          <div style={{ width: '24px', height: '24px', border: '2px solid #003666', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: '#64748b' }}>
          <Package size={32} style={{ opacity: 0.5, marginBottom: '8px', color: '#94a3b8' }} />
          <p style={{ margin: 0, fontSize: '0.85rem' }}>No active shipments in transit</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {orders.map(order => (
            <div 
              key={order.id} 
              style={{
                padding: '10px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <p style={{ margin: 0, color: '#0f172a', fontWeight: 700, fontSize: '0.85rem' }}>
                  {order.supplierName || 'Order #' + order.id.slice(0, 6)}
                </p>
                <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.74rem' }}>
                  {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Standard Medical Courier'}
                </p>
              </div>
              <span 
                style={{
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  backgroundColor: order.status === 'DELIVERED' ? '#dcfce7' : order.status === 'SHIPPED' ? '#dbeafe' : '#fef9c3',
                  color: order.status === 'DELIVERED' ? '#166534' : order.status === 'SHIPPED' ? '#1e40af' : '#854d0e'
                }}
              >
                {order.status || 'PENDING'}
              </span>
            </div>
          ))}
        </div>
      )}
    </BaseWidget>
  );
}
