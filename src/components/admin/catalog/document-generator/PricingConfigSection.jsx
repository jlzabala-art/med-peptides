'use client';
import React from 'react';
import { PRICE_SOURCES, CURRENCIES, INCOTERMS } from '@/hooks/admin/useDocumentGeneratorState';
import { TrendingUp, Edit3, Sparkles, CheckCircle2, AlertCircle, Globe, ShieldCheck } from 'lucide-react';

export default function PricingConfigSection({
  includePrices,
  setIncludePrices,
  priceSource,
  setPriceSource,
  currency,
  setCurrency,
  priceDisplayMode,
  setPriceDisplayMode,
  kitSize,
  setKitSize,
  setIsExWorks,
  incoterm,
  setIncoterm,
  bestSourcingOnly,
  setBestSourcingOnly,
  adjustmentType,
  setAdjustmentType,
  adjustmentValue,
  setAdjustmentValue,
  adjustmentScope,
  setAdjustmentScope,
  pricingSummary,
  onOpenGranularEditor,
  isMobile,
}) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: isMobile ? '14px' : '16px 18px',
      marginBottom: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    }}>
      {/* Header with ON/OFF switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: includePrices ? 14 : 0 }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>💵 Pricing & Commercial Terms</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: 1 }}>
            Control prices, currency, kit sizing, Incoterms, and profit markups.
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: includePrices ? '#003666' : '#94a3b8' }}>
            {includePrices ? 'Prices ON' : 'Prices OFF'}
          </span>
          <input
            type="checkbox"
            checked={Boolean(includePrices)}
            onChange={e => setIncludePrices(e.target.checked)}
            style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#003666' }}
          />
        </label>
      </div>

      {includePrices && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Row 1: Price Source & Currency */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Price Source
              </label>
              <select
                value={priceSource || 'cost'}
                onChange={e => setPriceSource(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              >
                {PRICE_SOURCES.map(ps => (
                  <option key={ps.value} value={ps.value}>{ps.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Billing Currency
              </label>
              <select
                value={currency || 'USD'}
                onChange={e => setCurrency(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  boxSizing: 'border-box',
                }}
              >
                {CURRENCIES.map(c => (
                  <option key={c} value={c}>{c} — Live FX Conversion</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Price Mode & Kit Size */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.3fr 1fr', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                Price Display Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                {[
                  { value: 'unit', label: 'Unit Price' },
                  { value: 'kit', label: 'Kit Price' },
                  { value: 'both', label: 'Both' },
                ].map(mode => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setPriceDisplayMode(mode.value)}
                    style={{
                      padding: '7px 8px',
                      borderRadius: 8,
                      border: `1.5px solid ${priceDisplayMode === mode.value ? '#003666' : '#cbd5e1'}`,
                      background: priceDisplayMode === mode.value ? '#eff6ff' : '#ffffff',
                      color: priceDisplayMode === mode.value ? '#003666' : '#475569',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {(priceDisplayMode === 'kit' || priceDisplayMode === 'both') && (
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                  Kit Pack Size (Units)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={kitSize ?? 10}
                    onChange={e => setKitSize(parseInt(e.target.value, 10) || 10)}
                    style={{
                      width: 70,
                      padding: '7px 8px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      textAlign: 'right',
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>units per kit</span>
                </div>
              </div>
            )}
          </div>

          {/* Row 3: Trade Terms (Incoterms) & Sourcing Optimization */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 10 }}>
            {/* Incoterms Selector */}
            <div style={{
              background: incoterm !== 'NONE' ? '#eff6ff' : '#f8fafc',
              border: `1px solid ${incoterm !== 'NONE' ? '#93c5fd' : '#e2e8f0'}`,
              borderRadius: 10,
              padding: '10px 12px',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Globe size={13} color="#003666" /> Commercial Terms (Incoterms)
                </span>
                {incoterm !== 'NONE' && (
                  <span style={{ fontSize: '0.66rem', background: '#dbeafe', color: '#1e40af', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                    {incoterm} ACTIVE
                  </span>
                )}
              </label>
              <select
                value={incoterm || 'EXW'}
                onChange={e => {
                  const val = e.target.value;
                  setIncoterm(val);
                  setIsExWorks(val === 'EXW');
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#0f172a',
                }}
              >
                {INCOTERMS.map(inc => (
                  <option key={inc.value} value={inc.value}>{inc.label}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: 3 }}>
                {INCOTERMS.find(i => i.value === incoterm)?.desc || 'Standard catalog pricing'}
              </div>
            </div>

            {/* Best Sourcing Only Filter */}
            <div style={{
              background: bestSourcingOnly ? '#f0fdf4' : '#f8fafc',
              border: `1px solid ${bestSourcingOnly ? '#86efac' : '#e2e8f0'}`,
              borderRadius: 10,
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <input
                  type="checkbox"
                  id="best-sourcing-toggle"
                  checked={Boolean(bestSourcingOnly)}
                  onChange={e => setBestSourcingOnly(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#16a34a', marginTop: 2, flexShrink: 0 }}
                />
                <label htmlFor="best-sourcing-toggle" style={{ cursor: 'pointer' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span>🎯 Best Sourcing Only</span>
                    {bestSourcingOnly && (
                      <span style={{ fontSize: '0.64rem', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>
                        LOWEST COST
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: 1, lineHeight: 1.2 }}>
                    Consolidates catalog to 1 lowest supplier variant per dosage.
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Row 4: Commercial Profit Adjustment (Markup / Target Margin) */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '12px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 5 }}>
                <TrendingUp size={14} color="#003666" /> Commercial Price Adjustment
              </span>
              {pricingSummary.hasOverrides && (
                <span style={{ fontSize: '0.72rem', color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>
                  Custom overrides active
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr', gap: 10, alignItems: 'center' }}>
              <div>
                <select
                  value={adjustmentType}
                  onChange={e => setAdjustmentType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: 7,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    background: '#ffffff',
                  }}
                >
                  <option value="none">No adjustment (Base catalog price)</option>
                  <option value="markup">Add mark-up percentage (+X%)</option>
                  <option value="margin">Target profit margin percentage (X%)</option>
                </select>
              </div>

              {adjustmentType !== 'none' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 7, padding: '2px 6px' }}>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={adjustmentValue}
                      onChange={e => setAdjustmentValue(parseFloat(e.target.value) || 0)}
                      style={{ width: 48, border: 'none', fontSize: '0.84rem', fontWeight: 700, textAlign: 'right', outline: 'none' }}
                    />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>%</span>
                  </div>

                  <select
                    value={adjustmentScope}
                    onChange={e => setAdjustmentScope(e.target.value)}
                    style={{
                      padding: '7px 6px',
                      borderRadius: 7,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.78rem',
                      background: '#ffffff',
                      flex: 1,
                    }}
                  >
                    <option value="unpriced">Only unpriced</option>
                    <option value="all">Apply to all</option>
                  </select>
                </div>
              )}
            </div>

            {/* Live Example Calculation */}
            {adjustmentType === 'markup' && (
              <div style={{ fontSize: '0.74rem', color: '#0369a1', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> Example: $100.00 cost → ${(100 * (1 + adjustmentValue / 100)).toFixed(2)} selling price (+{adjustmentValue}% markup)
              </div>
            )}
            {adjustmentType === 'margin' && (
              <div style={{ fontSize: '0.74rem', color: '#0369a1', marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> Example: $100.00 cost → ${(100 / (1 - Math.min(99, adjustmentValue) / 100)).toFixed(2)} selling price ({adjustmentValue}% target margin)
              </div>
            )}
          </div>

          {/* Granular Edit Trigger & Warning Indicators */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 4,
            borderTop: '1px solid #f1f5f9',
            flexWrap: 'wrap',
            gap: 8,
          }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {pricingSummary.unpricedCount > 0 ? (
                <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <AlertCircle size={13} /> {pricingSummary.unpricedCount} variant{pricingSummary.unpricedCount !== 1 ? 's' : ''} have no retail selling price
                </span>
              ) : (
                <span style={{ color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={13} /> All {pricingSummary.totalCount} variants have prices defined
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenGranularEditor}
              style={{
                padding: '6px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: 7,
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#003666',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Edit3 size={13} /> Edit individual prices
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
