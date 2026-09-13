"use client";

import React from 'react';
import { FileText, X, Download } from '@/lib/icons';

export default function WorkspacePdfPreviewSheet({
  isOpen,
  onClose,
  activeWs,
  items,
  getItemUnitPrice,
  subtotalSaleAmount,
  shippingCost,
  discountAmount,
  grandTotal,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000000,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          width: 'min(720px, 100vw)',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #cbd5e1',
          animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '10px', paddingBottom: '4px', backgroundColor: '#003666' }}>
          <div style={{ width: '44px', height: '5px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '99px' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#003666', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} />
            <span style={{ fontWeight: 800, fontSize: '0.96rem' }}>Live Document Summary — {activeWs.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Document Body */}
        <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #003666', paddingBottom: '0.8rem' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#003666', margin: 0, letterSpacing: '-0.02em' }}>ATLAS HEALTH</h2>
              <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>Commercial & Clinical Workspace Document</span>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.76rem', color: '#475569' }}>
              <div><b>Date:</b> {new Date().toLocaleDateString()}</div>
              <div><b>Target:</b> {activeWs.targetEntity?.name || 'General Clinic'}</div>
              <div><b>Type:</b> {activeWs.intent === 'buy' ? 'Purchase Order' : 'Commercial Quotation'}</div>
            </div>
          </div>

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Item / Compound</th>
                <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1' }}>Dose / Format</th>
                <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>Rate</th>
                <th style={{ padding: '8px 10px', borderBottom: '1px solid #cbd5e1', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const rate = getItemUnitPrice(it);
                const name = it.canonicalName || it.name || it.displayName || 'Product Item';
                return (
                  <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{name}</td>
                    <td style={{ padding: '8px 10px', color: '#475569' }}>{it.dosage || 'Standard'} • {it.format || 'Vial'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{it.quantity || 1}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>${rate.toFixed(2)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#003666' }}>${((it.quantity || 1) * rate).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', paddingTop: '0.5rem', borderTop: '2px solid #cbd5e1' }}>
            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Subtotal: <b>${subtotalSaleAmount.toFixed(2)}</b></div>
            {shippingCost > 0 && <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Shipping: <b>${shippingCost.toFixed(2)}</b></div>}
            {discountAmount > 0 && <div style={{ fontSize: '0.82rem', color: '#16a34a' }}>Discount: <b>-${discountAmount.toFixed(2)}</b></div>}
            <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#003666', marginTop: '4px' }}>Grand Total: ${grandTotal.toFixed(2)} USD</div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '0.85rem 1.25rem', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              borderRadius: '7px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
