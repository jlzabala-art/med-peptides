import X from "lucide-react/dist/esm/icons/x";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import TrendingDown from "lucide-react/dist/esm/icons/trending-down";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import Activity from "lucide-react/dist/esm/icons/activity";
import React from 'react';






export default function ProductAnalysisDrawer({ isOpen, product, onClose }) {
  if (!isOpen || !product) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '500px',
        backgroundColor: 'var(--bg-default)',
        zIndex: 9999,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{product.name}</h2>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)' }}>Competitive Analysis</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text-muted)' }}>
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase' }}>Margin</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#047857' }}>{product.margin}</div>
            </div>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', padding: '1rem', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase' }}>Price / mg</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1d4ed8' }}>${product.ppm}</div>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Internal Pricing (Territory: Global)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Retail</span> <b>${product.retail}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Wholesale</span> <b>${product.wholesale}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Distributor</span> <b>${product.distributor}</b></div>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Competitor Averages</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>UAE Peptides</span> <b>${Math.round(product.compAvg * 0.9)}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Saudi Meds</span> <b>${Math.round(product.compAvg * 1.1)}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>EuroPept</span> <b>${Math.round(product.compAvg * 1.05)}</b></div>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700 }}>90-Day Price Trend</h3>
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '2rem 1rem', backgroundColor: '#f8fafc', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Activity size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <div>Price History Chart Placeholder</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}