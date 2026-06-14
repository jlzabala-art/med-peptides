import React, { useState } from 'react';
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Send from "lucide-react/dist/esm/icons/send";
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";

import ProductGrid from '../../components/admin/shared/ProductGrid';
import ActivityTimeline from "../../components/admin/shared/ActivityTimeline";
import SalesOrderActionCenter from './SalesOrderActionCenter';

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

function fmtShortDate(date) {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SalesOrderMobileViews({ orders, selectedOrder, onSelect }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (selectedOrder) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
        
        {/* Mobile Header */}
        <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={() => onSelect(null)} style={{ background: 'none', border: 'none', padding: '0.5rem', cursor: 'pointer', color: '#64748b' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{selectedOrder.documentNumber}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedOrder.customerName}</div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
          
          {/* Status Bar */}
          <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{fmtCurrency(selectedOrder.grandTotal)}</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: 700 }}>
                {selectedOrder.commercialStatus || 'Draft'}
              </span>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontWeight: 700 }}>
                {selectedOrder.operationalStatus || 'Awaiting'}
              </span>
            </div>
          </div>

          {/* Mobile Tabs */}
          <div style={{ display: 'flex', overflowX: 'auto', background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 1rem', scrollbarWidth: 'none' }}>
            {['overview', 'products', 'timeline', 'ai'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 0.5rem', background: 'transparent', border: 'none', whiteSpace: 'nowrap',
                  borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
                  color: activeTab === tab ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === tab ? 700 : 600,
                  fontSize: '0.85rem', textTransform: 'capitalize', cursor: 'pointer', marginRight: '1rem'
                }}
              >
                {tab === 'ai' ? 'Action Center & AI' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: '1rem' }}>
             {activeTab === 'overview' && (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                     <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Financial Summary</h3>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                       <span style={{ color: '#475569' }}>Subtotal</span><span style={{ fontWeight: 600 }}>{fmtCurrency(selectedOrder.subTotal)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                       <span style={{ color: '#475569' }}>Tax</span><span style={{ fontWeight: 600 }}>{fmtCurrency(selectedOrder.taxAmount)}</span>
                     </div>
                     <div style={{ height: '1px', background: '#e2e8f0', margin: '0.5rem 0' }} />
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem' }}>
                       <span>Total</span><span>{fmtCurrency(selectedOrder.grandTotal)}</span>
                     </div>
                  </div>
                  <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                     <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>Customer</h3>
                     <div style={{ fontWeight: 700 }}>{selectedOrder.customerName}</div>
                     <div style={{ fontSize: '0.85rem', color: '#475569' }}>{selectedOrder.contactName || 'Alex Chen'}</div>
                  </div>
               </div>
             )}

             {activeTab === 'products' && (
               <ProductGrid items={selectedOrder.items || []} readOnly={true} />
             )}

             {activeTab === 'timeline' && (
               <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                 <ActivityTimeline document={selectedOrder} />
               </div>
             )}

             {activeTab === 'ai' && (
               <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                 <SalesOrderActionCenter order={selectedOrder} />
               </div>
             )}
          </div>

        </div>

        {/* Bottom Persistent Action Bar */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #e2e8f0', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 20, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
          <button style={bottomBtn}><Edit2 size={18} /><span style={btnLabel}>Edit</span></button>
          <button style={bottomBtn}><Send size={18} /><span style={btnLabel}>Send</span></button>
          <button style={bottomBtn}><FileText size={18} /><span style={btnLabel}>PDF</span></button>
          <button style={{ ...bottomBtn, color: '#2563eb' }}><RefreshCw size={18} /><span style={btnLabel}>Convert</span></button>
        </div>

      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f8fafc' }}>
      
      {/* Mobile Header */}
      <div style={{ padding: '1rem', background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Sales Orders</h1>
        <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              placeholder="Search orders..." 
              style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
          <button style={{ padding: '0 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer' }}>
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => onSelect(order)}
              style={{ background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{order.documentNumber || order.id.slice(0, 8)}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem' }}>{order.customerName}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: 700 }}>
                    {order.commercialStatus || 'Draft'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>{fmtShortDate(order.createdAt)}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{fmtCurrency(order.grandTotal)}</div>
                <ChevronRight size={18} color="#cbd5e1" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

const bottomBtn = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer'
};
const btnLabel = { fontSize: '0.65rem', fontWeight: 600 };
