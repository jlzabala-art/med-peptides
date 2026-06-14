import React from 'react';
import Zap from "lucide-react/dist/esm/icons/zap";
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Play from "lucide-react/dist/esm/icons/play";
import Truck from "lucide-react/dist/esm/icons/truck";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import ShieldAlert from "lucide-react/dist/esm/icons/shield-alert";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Bell from "lucide-react/dist/esm/icons/bell";
import Target from "lucide-react/dist/esm/icons/target";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount || 0);
}

export default function SalesOrderActionCenter({ order }) {
  const marginPercent = order.subTotal > 0 ? ((order.subTotal - ((order.items || []).reduce((acc, item) => acc + ((parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0)), 0)) - (parseFloat(order.shippingCost) || 0)) / order.subTotal) * 100 : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem', gap: '2rem' }}>
      
      {/* 1. Recommended Actions (Pure Command Center) */}
      <div>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Actions</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {order.commercialStatus !== 'Accepted' ? (
            <button style={btnStyle('#2563eb', '#fff', true)}>
              <CheckCircle2 size={16} /> Confirm Order
            </button>
          ) : (order.commercialStatus === 'Accepted' && !order.poGenerated) ? (
            <button style={btnStyle('#7c3aed', '#fff', true)}>
              <FileText size={16} /> Generate PO
            </button>
          ) : (order.operationalStatus === 'Awaiting Stock' && order.poGenerated) ? (
            <button style={btnStyle('#0f172a', '#fff', true)}>
              <Play size={16} /> Start Manufacturing
            </button>
          ) : (order.operationalStatus === 'Manufacturing' || order.operationalStatus === 'Ready to Ship') ? (
            <button style={btnStyle('#059669', '#fff', true)}>
              <Truck size={16} /> Ship Order
            </button>
          ) : order.financialStatus === 'Unpaid' ? (
            <button style={btnStyle('#d97706', '#fff', true)}>
              <DollarSign size={16} /> Request Payment
            </button>
          ) : (
            <button style={secBtnStyle}>
              <CheckCircle2 size={16} /> Order Complete
            </button>
          )}

          {/* Contextual Secondary Actions */}
          {order.financialStatus === 'Unpaid' && (
            <button style={secBtnStyle}><Bell size={16} /> Send Payment Reminder</button>
          )}
          {order.commercialStatus === 'Accepted' && marginPercent < 20 && (
            <button style={secBtnStyle}><TrendingUp size={16} /> Improve Margin</button>
          )}
        </div>
      </div>

      {/* 2. Atlas AI Intelligence Hub */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Zap size={14} color="#8b5cf6" />
          <h3 style={{ margin: 0, fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atlas Intelligence</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           
           {/* Margin Risk */}
           {marginPercent < 20 ? (
             <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <ShieldAlert size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.2rem' }}>Margin Risk ({marginPercent.toFixed(1)}%)</div>
                  <div style={{ fontSize: '0.75rem', color: '#b91c1c' }}>Below target 20%. Consider reviewing supplier costs.</div>
                </div>
             </div>
           ) : (
             <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', marginBottom: '0.2rem' }}>Healthy Margin ({marginPercent.toFixed(1)}%)</div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d' }}>Above target. No action needed.</div>
                </div>
             </div>
           )}

           {/* Stock Warning */}
           {(order.items || []).some(i => i.stock < i.quantity) && (
             <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e', marginBottom: '0.2rem' }}>Stock Warning</div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Insufficient inventory. PO required immediately to avoid 5-day delay.</div>
                </div>
             </div>
           )}

           {/* Buying Patterns */}
           <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <Target size={16} color="#64748b" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.2rem' }}>Buying Pattern</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Usually orders on the 15th of the month. High LTV customer.</div>
              </div>
           </div>

        </div>
      </div>

    </div>
  );
}

const btnStyle = (bg, color, primary = false) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  background: bg,
  color: color,
  border: 'none',
  fontWeight: 700,
  fontSize: '0.85rem',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: primary ? '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' : 'none'
});

const secBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '8px',
  background: '#fff',
  color: '#475569',
  border: '1px solid #cbd5e1',
  fontWeight: 600,
  fontSize: '0.85rem',
  cursor: 'pointer'
};
