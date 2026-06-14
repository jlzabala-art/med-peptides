import React, { useState } from 'react';
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import Copy from "lucide-react/dist/esm/icons/copy";
import Send from "lucide-react/dist/esm/icons/send";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Link from "lucide-react/dist/esm/icons/link";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";

import ProductGrid from '../../components/admin/shared/ProductGrid';
import ActivityTimeline from "../../components/admin/shared/ActivityTimeline";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

const STAGES = ['Confirmed', 'PO Generated', 'Manufacturing', 'Ready', 'Shipped', 'Delivered', 'Invoiced', 'Paid'];

function getStageIndex(order) {
  if (order.financialStatus === 'Paid') return 7;
  if (order.commercialStatus === 'Invoiced' || order.financialStatus === 'Unpaid') return 6;
  if (order.operationalStatus === 'Delivered') return 5;
  if (order.operationalStatus === 'In Transit') return 4;
  if (order.operationalStatus === 'Ready to Ship') return 3;
  if (order.operationalStatus === 'Manufacturing') return 2;
  if (order.poGenerated || order.operationalStatus === 'Awaiting Stock') return 1;
  return 0;
}

export default function SalesOrderWorkspace({ order }) {
  const currentStageIdx = getStageIndex(order);

  const total = order.grandTotal || 0;
  const cogs = (order.items || []).reduce((acc, item) => acc + ((parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0)), 0);
  const margin = order.subTotal > 0 ? order.subTotal - cogs : 0;
  const marginPercent = order.subTotal > 0 ? (margin / order.subTotal) * 100 : 0;
  const paid = order.financialStatus === 'Paid' ? total : 0;
  const outstanding = total - paid;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Ultra-Compact Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {order.documentNumber || order.id.slice(0, 8)}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
              {order.customerName}
            </div>
          </div>

          <div style={{ height: '32px', width: '1px', background: '#e2e8f0' }} />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
             <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#eff6ff', color: '#2563eb', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
               {order.commercialStatus || 'Draft'}
             </span>
             <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: order.operationalStatus === 'Awaiting Stock' ? '#fef3c7' : '#ede9fe', color: order.operationalStatus === 'Awaiting Stock' ? '#d97706' : '#7c3aed', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
               {order.operationalStatus || 'Awaiting'}
             </span>
             <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: order.financialStatus === 'Paid' ? '#d1fae5' : '#fee2e2', color: order.financialStatus === 'Paid' ? '#059669' : '#b91c1c', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
               {order.financialStatus || 'Unpaid'}
             </span>
          </div>

          <div style={{ height: '32px', width: '1px', background: '#e2e8f0' }} />

          <div>
             <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Amount</div>
             <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{fmtCurrency(total)}</div>
          </div>
          
          <div>
             <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Margin</div>
             <div style={{ fontSize: '1rem', fontWeight: 800, color: marginPercent >= 20 ? '#059669' : '#d97706' }}>{marginPercent.toFixed(1)}%</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button style={quickBtn} title="Edit"><Edit2 size={16} /></button>
           <button style={quickBtn} title="Duplicate"><Copy size={16} /></button>
           <button style={quickBtn} title="Send"><Send size={16} /></button>
           <button style={quickBtn} title="Convert"><RefreshCw size={16} /></button>
           <button style={quickBtn} title="Generate PDF"><FileText size={16} /></button>
           <button style={quickBtn} title="Share Link"><Link size={16} /></button>
        </div>
      </div>

      {/* 1. Products (Primary Content) */}
      <ProductGrid items={order.items || []} readOnly={false} />

      {/* Grid Layout for compact data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* 2. Financial Summary */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financials</h3>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtCurrency(order.subTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Shipping</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtCurrency(order.shippingCost || 0)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Tax</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtCurrency(order.taxAmount || 0)}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              <span>Total</span><span>{fmtCurrency(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '0.5rem' }}>
              <span>Amount Paid</span><span style={{ fontWeight: 600, color: '#059669' }}>{fmtCurrency(paid)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Balance Due</span><span style={{ fontWeight: 600, color: '#ef4444' }}>{fmtCurrency(outstanding)}</span>
            </div>
          </div>
        </div>

        {/* 3. Customer Information */}
        <div>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Info</h3>
           <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div>
                 <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Account</div>
                 <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.customerName}</div>
              </div>
              <div>
                 <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Contact</div>
                 <div style={{ fontWeight: 500, color: '#475569' }}>{order.contactName || 'Alex Chen'} • {order.customerEmail || 'alex@example.com'}</div>
              </div>
              <div>
                 <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Shipping Address</div>
                 <div style={{ fontWeight: 500, color: '#475569' }}>123 Pharma Logistics Blvd, Suite 200<br/>San Francisco, CA 94107</div>
              </div>
           </div>
        </div>

      </div>

      {/* 4. Horizontal Pipeline */}
      <div>
         <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pipeline</h3>
         <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', height: '2px', background: '#f1f5f9', zIndex: 0 }} />
              <div style={{ position: 'absolute', top: '12px', left: '12px', width: `calc(${(currentStageIdx / (STAGES.length - 1)) * 100}% - 24px)`, height: '2px', background: '#2563eb', zIndex: 0, transition: 'width 0.5s' }} />

              {STAGES.map((stage, idx) => {
                const isCompleted = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;
                return (
                  <div key={stage} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 1, width: '80px' }}>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: isCompleted ? '#2563eb' : '#fff', 
                      border: isCompleted ? '2px solid #2563eb' : '2px solid #cbd5e1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: isCurrent ? '0 0 0 4px #eff6ff' : 'none'
                    }}>
                      {isCompleted && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? '#0f172a' : '#64748b', textAlign: 'center', lineHeight: 1.2 }}>
                      {stage}
                    </div>
                  </div>
                );
              })}
           </div>
         </div>
      </div>

      {/* 5. Timeline */}
      <div>
         <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Feed</h3>
         <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
           <ActivityTimeline document={order} />
         </div>
      </div>

    </div>
  );
}

const quickBtn = {
  width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};
