import React from 'react';
import Zap from "lucide-react/dist/esm/icons/zap";
import Target from "lucide-react/dist/esm/icons/target";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Mail from "lucide-react/dist/esm/icons/mail";
import Send from "lucide-react/dist/esm/icons/send";
import Edit from "lucide-react/dist/esm/icons/edit";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import MessageCircle from "lucide-react/dist/esm/icons/message-circle";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

export default function QuotationIntelligencePane({ quote, onConvert }) {
  const status = quote.status || 'Draft';
  
  const probability = quote.probability || (status === 'Accepted' ? 100 : status === 'Negotiation' ? 65 : status === 'Sent' ? 40 : 10);
  let closeLabel = probability >= 70 ? 'High' : probability >= 40 ? 'Medium' : 'Low';
  let probColor = probability >= 70 ? '#059669' : probability >= 40 ? '#d97706' : '#dc2626';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', padding: '1.5rem', gap: '2rem', overflowY: 'auto' }}>
      
      {/* 1. Action Center */}
      <div>
        <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quotation Actions</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          
          {status === 'Draft' && (
            <>
              <button style={btnStyle('#8b5cf6', '#fff')}><Send size={16} /> Send to Customer</button>
              <button style={secBtnStyle}><Edit size={16} /> Edit Products & Pricing</button>
              <button style={secBtnStyle}><FileText size={16} /> Preview PDF</button>
            </>
          )}

          {status === 'Sent' && (
             <>
               <button style={btnStyle('#2563eb', '#fff')}><MessageCircle size={16} /> Schedule Follow-up</button>
               <button style={secBtnStyle}><Mail size={16} /> Resend Quote</button>
               <button style={secBtnStyle}>Create Reminder</button>
             </>
          )}

          {status === 'Negotiation' && (
             <>
               <button style={btnStyle('#d97706', '#fff')}><Edit size={16} /> Create New Version (v2)</button>
               <button style={secBtnStyle}>Add Special Discount</button>
               <button style={secBtnStyle}>Add Internal Note</button>
             </>
          )}

          {status === 'Accepted' && (
             <>
               <button onClick={onConvert} style={btnStyle('#059669', '#fff')}><CheckCircle2 size={16} /> Convert to Sales Order</button>
               <button style={secBtnStyle}><FileCheck size={16} /> Generate Invoice</button>
               <button style={secBtnStyle}>Generate Purchase Order</button>
             </>
          )}

        </div>
      </div>

      {/* 2. Atlas AI Sales Assistant */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <Zap size={14} color="#8b5cf6" />
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atlas AI Insights</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Target size={14} /> Close Probability
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: probColor }}>{probability}%</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: probColor, marginBottom: '0.25rem' }}>({closeLabel})</span>
            </div>
          </div>

          <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '1rem', fontSize: '0.8rem', color: '#6b21a8', lineHeight: 1.5 }}>
            <strong>Upsell Opportunity:</strong> Customer previously purchased Tirzepatide. Suggest adding NAD+ or MOTS-C to this quote to increase margin.
          </div>
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
            <strong>Pricing Insight:</strong> This customer usually accepts quotes instantly when margin is below 22%. Current margin is 24%, expect some negotiation.
          </div>
        </div>
      </div>

      {/* 3. Customer 360 */}
      <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer 360</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Lifetime Value (LTV)</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtCurrency(42500)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Avg Order Value</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{fmtCurrency(2100)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Open Orders</span>
            <span style={{ fontWeight: 600, color: '#2563eb' }}>2 Active</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Unpaid Invoices</span>
            <span style={{ fontWeight: 600, color: '#ef4444' }}>{fmtCurrency(1500)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Credit Risk</span>
            <span style={{ fontWeight: 600, color: '#059669' }}>Low</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
            <span>Sales Rep</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Alex Chen</span>
          </div>
        </div>
      </div>

    </div>
  );
}

const btnStyle = (bg, color) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.85rem 1rem',
  borderRadius: '8px',
  background: bg,
  color: color,
  border: 'none',
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

const secBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.6rem 1rem',
  borderRadius: '6px',
  background: '#fff',
  color: '#475569',
  border: '1px solid #cbd5e1',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer',
};
