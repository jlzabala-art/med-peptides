"use client";

import React from 'react';
import { DollarSign, TrendingUp, Percent, ShieldCheck, ArrowRight } from 'lucide-react';
import { formatCurrencyAdaptive } from '../../utils/formatters';

/**
 * MarginProfitabilityHUD
 * ─────────────────────────────────────────────────────────────────────────────
 * Real-Time Profitability and Commercial Margin Display for B2B Quotations,
 * Orders, and Procurement workflows.
 *
 * Props:
 *   - supplierCost: number (total supplier purchase cost)
 *   - sellingPrice: number (total client selling price)
 *   - marginPercent: number (e.g. 6.0)
 *   - currency: string (default 'USD')
 *   - onMarginChange: function(newMarginPercent) => optional interactive slider/input
 *   - editable: boolean (allows live margin simulation)
 */
export default function MarginProfitabilityHUD({
  supplierCost = 0,
  sellingPrice = 0,
  marginPercent = 6.0,
  currency = 'USD',
  onMarginChange,
  editable = false,
  compact = false
}) {
  const cost = Number(supplierCost || 0);
  const price = Number(sellingPrice || 0);
  const profit = Math.max(0, price - cost);
  const effectiveMargin = cost > 0 ? ((profit / cost) * 100) : marginPercent;

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.65rem',
        background: '#ecfdf5',
        border: '1px solid #a7f3d0',
        borderRadius: '8px',
        fontSize: '0.78rem',
        fontWeight: 700,
        color: '#047857'
      }}>
        <TrendingUp size={13} style={{ color: '#10b981' }} />
        <span>Margin: +{effectiveMargin.toFixed(1)}%</span>
        <span style={{ color: '#6ee7b7' }}>•</span>
        <span>Profit: +{formatCurrencyAdaptive(profit, currency)}</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      color: '#ffffff',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '8px',
            padding: '0.35rem',
            display: 'flex',
            color: '#10b981'
          }}>
            <TrendingUp size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Commercial Profitability HUD
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
              Gross Profit & Margin Analysis
            </div>
          </div>
        </div>

        {editable && onMarginChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Adjust Margin:</span>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '0.2rem 0.5rem' }}>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={marginPercent}
                onChange={(e) => onMarginChange(parseFloat(e.target.value) || 0)}
                style={{
                  width: '50px',
                  background: 'transparent',
                  border: 'none',
                  color: '#10b981',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>%</span>
            </div>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '0.9rem',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Supplier Net Cost</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#e2e8f0', marginTop: '2px' }}>
            {formatCurrencyAdaptive(cost, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Client Selling Price</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
            {formatCurrencyAdaptive(price, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Gross Profit ($)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
            +{formatCurrencyAdaptive(profit, currency)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Gross Margin (%)</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
            +{effectiveMargin.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
}
