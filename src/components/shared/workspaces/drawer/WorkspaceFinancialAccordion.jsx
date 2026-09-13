"use client";

import React from 'react';
import {
  DollarSign,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Check
} from '@/lib/icons';

export default function WorkspaceFinancialAccordion({
  isExpanded,
  onToggleExpand,
  activeWs,
  subtotalSaleAmount,
  totalSupplierCost,
  shippingCost,
  discountPercent,
  discountAmount,
  grandTotal,
  grossMarginAmount,
  marginPercent,
  onSetDiscountPercent,
}) {
  const isBuy = activeWs?.intent === 'buy';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        onClick={onToggleExpand}
        style={{
          padding: '0.85rem 1.1rem',
          backgroundColor: '#ffffff',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded ? <ChevronDown size={18} style={{ color: '#003666' }} /> : <ChevronRight size={18} style={{ color: '#64748b' }} />}
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <DollarSign size={17} /> Commercial Financials & Margins
          </span>
        </div>

        <span style={{ fontSize: '0.94rem', fontWeight: 900, color: '#003666' }}>
          ${grandTotal.toFixed(2)}
        </span>
      </div>

      {/* Body Content */}
      {isExpanded && (
        <div style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#ffffff' }}>
          {/* Detailed Financial Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: '#475569' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Items Subtotal:</span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>${subtotalSaleAmount.toFixed(2)}</span>
            </div>

            {shippingCost > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shipping & Cold-Chain:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>+${shippingCost.toFixed(2)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Applied Discount ({discountPercent}%):</span>
                <span style={{ fontWeight: 700 }}>-${discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '0.9rem', fontWeight: 900, color: '#003666' }}>
              <span>Grand Total:</span>
              <span>${grandTotal.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Quick Discount Selector Pills */}
          {!isBuy && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>Apply Quick Tier Discount:</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[0, 5, 10, 15, 20].map(pct => {
                  const isSel = discountPercent === pct;
                  return (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => onSetDiscountPercent(pct)}
                      style={{
                        flex: 1,
                        padding: '5px 2px',
                        borderRadius: '6px',
                        border: `1.5px solid ${isSel ? '#003666' : '#cbd5e1'}`,
                        backgroundColor: isSel ? '#003666' : '#ffffff',
                        color: isSel ? '#ffffff' : '#334155',
                        fontSize: '0.74rem',
                        fontWeight: isSel ? 800 : 600,
                        cursor: 'pointer',
                        touchAction: 'manipulation',
                      }}
                    >
                      {pct === 0 ? 'None' : `${pct}%`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Commercial Margins Bar (Only in SELL intent) */}
          {!isBuy && subtotalSaleAmount > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '9px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem' }}>
                <span style={{ fontWeight: 700, color: '#475569' }}>Estimated Gross Margin:</span>
                <span style={{ fontWeight: 900, color: marginPercent >= 50 ? '#16a34a' : marginPercent >= 25 ? '#d97706' : '#dc2626' }}>
                  {marginPercent}% (${grossMarginAmount.toFixed(2)} profit)
                </span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, marginPercent))}%`,
                    height: '100%',
                    backgroundColor: marginPercent >= 50 ? '#16a34a' : marginPercent >= 25 ? '#d97706' : '#dc2626',
                    borderRadius: '99px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b' }}>
                <span>Supplier Cost: ${totalSupplierCost.toFixed(2)}</span>
                <span>Revenue: ${subtotalSaleAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
