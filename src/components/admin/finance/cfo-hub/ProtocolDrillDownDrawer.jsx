import X from "lucide-react/dist/esm/icons/x";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Package from "lucide-react/dist/esm/icons/package";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import React from 'react';







export default function ProtocolDrillDownDrawer({ selectedProtocol, onClose }) {
  if (!selectedProtocol) return null;

  const originalProduct = selectedProtocol.originalProduct || selectedProtocol;
  const price = Number(originalProduct.price || selectedProtocol.price || 0);
  const cost = Number(originalProduct.costPrice || selectedProtocol.costPrice || 0);
  const margin = Number(selectedProtocol.margin || (price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0));
  
  // Real components or single base product component
  const components = (selectedProtocol.components && selectedProtocol.components.length > 0)
    ? selectedProtocol.components
    : [
        { name: originalProduct.name || selectedProtocol.name || 'Base Compound', cost: cost }
      ];

  const supplierName = originalProduct.supplier || selectedProtocol.supplier || 'Unassigned';
  const leadTime = originalProduct.leadTime ? `${originalProduct.leadTime} Days` : 'Standard (7-14 Days)';
  const reliabilityScore = originalProduct.reliabilityScore ?? 95;
  const stockCount = originalProduct.stockCount ?? originalProduct.stock ?? originalProduct.inventory ?? 0;
  const profitAtRisk = (stockCount <= 5) ? Math.max(0, (price - cost) * (10 - stockCount)) : 0;

  // Real dynamic recommendations based on financials
  const recommendations = [];
  if (margin < 15) {
    recommendations.push(`Margin (${margin}%) is below target threshold. Review supplier COGS or adjust retail pricing.`);
  } else if (margin >= 40) {
    recommendations.push(`Strong margin performance (${margin}%). Good candidate for volume scaling.`);
  } else {
    recommendations.push(`Margin (${margin}%) is operating within normal parameters.`);
  }

  if (stockCount <= 5) {
    recommendations.push(`Current stock (${stockCount} units) is low. Issue purchase order to prevent supply disruption.`);
  } else {
    recommendations.push(`Current stock (${stockCount} units) meets short-term demand requirements.`);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(2px)',
      zIndex: 9999,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        backgroundColor: 'var(--background)',
        width: '100%',
        maxWidth: '500px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--color-bg-surface)'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{selectedProtocol.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ 
                padding: '2px 8px', 
                backgroundColor: margin >= 30 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', 
                color: margin >= 30 ? 'var(--color-success)' : 'var(--color-danger)', 
                borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 
              }}>
                {margin}% Margin
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Component Cost Analysis */}
          <div>
             <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={14} /> Component Cost Analysis
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {components.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-main)' }}>{c.name}</span>
                    <span style={{ fontWeight: 600 }}>AED {Number(c.cost || 0).toFixed(2)}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--text-main)' }}>Total COGS</span>
                  <span>AED {cost.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.5rem' }}>
                  <span>Retail Price</span>
                  <span>AED {price.toFixed(2)}</span>
                </div>
              </div>
          </div>

          {/* Supplier Breakdown */}
          <div>
             <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Package size={14} /> Supplier Breakdown
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Primary Supplier:</span>
                  <span style={{ fontWeight: 600 }}>{supplierName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lead Time:</span>
                  <span style={{ fontWeight: 600 }}>{leadTime}</span>
                </div>
                {reliabilityScore && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Reliability Score:</span>
                    <span style={{ fontWeight: 600, color: 'var(--color-success)' }}>{reliabilityScore}/100</span>
                  </div>
                )}
              </div>
          </div>

          {/* Inventory Risk */}
          <div>
             <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={14} /> Inventory Profit Risk
              </h3>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem', backgroundColor: profitAtRisk > 0 ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Stock</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: stockCount <= 5 ? 'var(--color-danger)' : '#d97706' }}>{stockCount} units</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Est. Profit At Risk</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: profitAtRisk > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>AED {profitAtRisk.toFixed(2)}</div>
                  </div>
                </div>
              </div>
          </div>
          {/* AI Recommendations */}
          <div>
             <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={14} /> AI Recommendations
              </h3>
              <div style={{ backgroundColor: 'rgba(26,115,232,0.05)', border: '1px solid rgba(26,115,232,0.2)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--color-bg-surface)',
          display: 'flex',
          gap: '1rem'
        }}>
          <button className="gcp-btn-secondary" style={{ flex: 1 }}>Edit Pricing</button>
          <button className="gcp-btn-primary" style={{ flex: 1 }}>Create PO</button>
        </div>

      </div>
    </div>
  );
}