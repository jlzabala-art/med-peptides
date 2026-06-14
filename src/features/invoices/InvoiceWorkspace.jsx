import React, { useState } from 'react';
import Download from "lucide-react/dist/esm/icons/download";
import Mail from "lucide-react/dist/esm/icons/mail";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Link from "lucide-react/dist/esm/icons/link";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";

import ProductGrid from '../../components/admin/shared/ProductGrid';
import ActivityTimeline from "../../components/admin/shared/ActivityTimeline";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

function fmtDate(date) {
  if (!date) return 'N/A';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function InvoiceWorkspace({ invoice }) {

  const total = invoice.grandTotal || 0;
  const paid = invoice.status === 'Paid' ? total : (invoice.amountPaid || 0);
  const outstanding = total - paid;
  
  const dueDate = invoice.dueDate?.toDate ? invoice.dueDate.toDate() : new Date((invoice.createdAt?.seconds || Date.now() / 1000) * 1000 + 30 * 86400000); // Mock 30 days
  const isOverdue = invoice.status !== 'Paid' && dueDate < new Date();

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {invoice.documentNumber || invoice.id.slice(0, 8)}
            </h1>
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
              {invoice.customerName}
            </div>
          </div>

          <div style={{ height: '32px', width: '1px', background: '#e2e8f0' }} />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
             <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: invoice.status === 'Paid' ? '#d1fae5' : invoice.status === 'Overdue' ? '#fee2e2' : '#eff6ff', color: invoice.status === 'Paid' ? '#059669' : invoice.status === 'Overdue' ? '#dc2626' : '#2563eb', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
               {invoice.status || 'Draft'}
             </span>
             {isOverdue && (
               <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                 Overdue
               </span>
             )}
          </div>

          <div style={{ height: '32px', width: '1px', background: '#e2e8f0' }} />

          <div>
             <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Balance Due</div>
             <div style={{ fontSize: '1rem', fontWeight: 800, color: outstanding > 0 ? '#ef4444' : '#059669' }}>{fmtCurrency(outstanding)}</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
           <button style={quickBtn} title="Download PDF"><Download size={16} /></button>
           <button style={quickBtn} title="Send via Email"><Mail size={16} /></button>
           <button style={quickBtn} title="Copy Link"><Link size={16} /></button>
        </div>
      </div>

      {/* 1. Products */}
      <ProductGrid items={invoice.items || []} readOnly={true} />

      {/* Grid Layout for compact data */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* 2. Financial Summary */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Summary</h3>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Issue Date</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtDate(invoice.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Due Date</span><span style={{ fontWeight: 600, color: isOverdue ? '#ef4444' : '#0f172a' }}>{fmtDate(dueDate)}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Subtotal</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtCurrency(invoice.subTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Tax</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtCurrency(invoice.taxAmount)}</span>
            </div>
            <div style={{ height: '1px', background: '#e2e8f0', margin: '0.25rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              <span>Total</span><span>{fmtCurrency(total)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '0.5rem' }}>
              <span>Amount Paid</span><span style={{ fontWeight: 600, color: '#059669' }}>{fmtCurrency(paid)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
              <span>Balance Due</span><span style={{ fontWeight: 800, color: outstanding > 0 ? '#ef4444' : '#059669' }}>{fmtCurrency(outstanding)}</span>
            </div>
          </div>
        </div>

        {/* 3. Linkage & References */}
        <div>
           <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Linked Records</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={18} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Sales Order Reference</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{invoice.linkedDocumentNumber || 'N/A'}</div>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>View</button>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <RefreshCw size={18} color="#64748b" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Shipment Reference</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>SHP-2024-089</div>
                  </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Track</button>
              </div>
           </div>
        </div>
      </div>

      {/* 4. Timeline */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Activity Timeline</h3>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
          <ActivityTimeline document={invoice} />
        </div>
      </div>
    </div>
  );
}

const quickBtn = {
  width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
};
