import React, { useState } from 'react';
import CheckCircle2 from "lucide-react/dist/esm/icons/check-circle-2";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import X from "lucide-react/dist/esm/icons/x";
import PackageCheck from "lucide-react/dist/esm/icons/package-check";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";

function fmtCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount || 0);
}

export default function QuotationConvertWizard({ quote, onClose, onConfirm }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const subTotal = parseFloat(quote.subTotal) || 0;
  const cogs = (quote.items || []).reduce((acc, item) => acc + ((parseFloat(item.unitCost) || 0) * (parseInt(item.quantity) || 0)), 0);
  const margin = subTotal > 0 ? subTotal - cogs : 0;
  const marginPercent = subTotal > 0 ? (margin / subTotal) * 100 : 0;

  // Mock inventory check
  const hasInventoryWarning = quote.items?.some(i => i.stock < i.quantity);

  const handleConvert = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm(); // Trigger actual conversion logic in parent
    }, 1500);
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
      
      <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Convert to Sales Order</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>{quote.documentNumber} • {quote.customerName}</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem', color: '#64748b' }}><X size={20} /></button>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Validation Checks */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pre-conversion Validation</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                 <CheckCircle2 size={18} color="#16a34a" />
                 <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>Pricing & Margins Approved ({marginPercent.toFixed(1)}% Margin)</span>
              </div>

              {hasInventoryWarning ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                   <AlertTriangle size={18} color="#d97706" />
                   <div>
                     <span style={{ fontSize: '0.9rem', color: '#92400e', fontWeight: 600, display: 'block' }}>Inventory Shortage Detected</span>
                     <span style={{ fontSize: '0.8rem', color: '#b45309' }}>Some items lack sufficient stock. A Purchase Order will be required.</span>
                   </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                   <PackageCheck size={18} color="#16a34a" />
                   <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: 600 }}>Inventory Available for immediate fulfillment.</span>
                </div>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Configuration</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Order Type</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}>
                  <option>Standard Distribution</option>
                  <option>Dropship</option>
                  <option>Manufacturing (Compounding)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Initial Status</label>
                <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#fff' }}>
                  {hasInventoryWarning ? <option>Awaiting Stock</option> : <option>Manufacturing</option>}
                  <option>Ready to Ship</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{ padding: '1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
           <button onClick={onClose} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
           <button onClick={handleConvert} disabled={loading} style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             {loading ? <span className="spinner-small" /> : <CheckCircle2 size={16} />}
             Confirm Conversion
           </button>
        </div>

        <style>{`.spinner-small { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; }`}</style>
      </div>

    </div>
  );
}
