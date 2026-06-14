import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

import SalesOrderListPane from './SalesOrderListPane';
import SalesOrderWorkspace from './SalesOrderWorkspace';
import SalesOrderActionCenter from './SalesOrderActionCenter';
import SalesOrderMobileViews from './SalesOrderMobileViews';

function normalizeOrderData(doc) {
  const data = { id: doc.id, ...doc.data() };
  if (!data.commercialStatus) {
    if (['CONFIRMED', 'IN_PROGRESS', 'SHIPPED', 'DELIVERED', 'INVOICED'].includes(data.status)) data.commercialStatus = 'Accepted';
    else if (data.status === 'CANCELLED') data.commercialStatus = 'Rejected';
    else data.commercialStatus = 'Draft';
  }
  if (!data.operationalStatus) {
    if (data.status === 'SHIPPED') data.operationalStatus = 'In Transit';
    else if (data.status === 'DELIVERED') data.operationalStatus = 'Delivered';
    else if (data.status === 'IN_PROGRESS') data.operationalStatus = 'Manufacturing';
    else data.operationalStatus = 'Awaiting Stock';
  }
  if (!data.financialStatus) {
    data.financialStatus = data.status === 'INVOICED' ? 'Unpaid' : 'Unpaid';
  }
  return data;
}

import ERPTriPaneLayout from '../../layout/ERPTriPaneLayout';

export default function SalesOrdersHub() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'b2b_sales_orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(normalizeOrderData);
      setOrders(data);
      if (data.length > 0) {
        setSelectedOrder(prev => {
          if (!prev && window.innerWidth >= 1024) return data[0];
          if (prev) return data.find(d => d.id === prev.id) || prev;
          return prev;
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '3rem' }}>
        <div className="spinner"></div>
        <style>{`.spinner { width: 40px; height: 40px; border: 4px solid var(--border); border-top-color: var(--color-primary); border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <ERPTriPaneLayout
      leftPaneWidth="430px"
      leftPane={
        <SalesOrderListPane 
          orders={orders} 
          selectedOrderId={selectedOrder?.id} 
          onSelect={setSelectedOrder} 
        />
      }
      centerPane={
        selectedOrder ? (
          <SalesOrderWorkspace order={selectedOrder} />
        ) : (
          <div style={{ margin: 'auto', marginTop: '5rem', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            Select an order to view workspace
          </div>
        )
      }
      rightPane={
        selectedOrder && (
          <SalesOrderActionCenter order={selectedOrder} />
        )
      }
      mobileView={
        <SalesOrderMobileViews 
          orders={orders} 
          selectedOrder={selectedOrder} 
          onSelect={setSelectedOrder} 
        />
      }
    />
  );
}
