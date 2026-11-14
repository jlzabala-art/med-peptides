'use client';

import React, { useState, useMemo } from 'react';
import { X, Calculator, DollarSign, ArrowRight, RefreshCw, Copy, Check, Info } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * MarginSimulatorDrawer
 * ─────────────────────────────────────────────────────────────────────────────
 * GCP-style slide-over side drawer for testing commercial margin formulas,
 * volume discount tiers, and multi-currency simulations in real time.
 */
export default function MarginSimulatorDrawer({ group, onClose }) {
  const [baseCost, setBaseCost] = useState(50);
  const [platformMargin, setPlatformMargin] = useState(15);
  const [wholesalerMargin, setWholesalerMargin] = useState(15);
  const [clinicMarkup, setClinicMarkup] = useState(30);
  const [copied, setCopied] = useState(false);

  const currencySymbol = group?.currency === 'USD' ? '$' : group?.currency === 'AED' ? 'AED' : '€';

  const calculations = useMemo(() => {
    const cost = Math.max(0, Number(baseCost) || 0);
    const platformFee = cost * (platformMargin / 100);
    const platformPrice = cost + platformFee;

    const wholesaleFee = platformPrice * (wholesalerMargin / 100);
    const wholesalePrice = platformPrice + wholesaleFee;

    const clinicPrice = wholesalePrice * (1 + clinicMarkup / 100);
    const retailPrice = clinicPrice * 1.5; // Typical 50% clinic-to-patient markup

    const totalMarkupMultiplier = cost > 0 ? (wholesalePrice / cost).toFixed(4) : '1.3225';
    const netGrossProfit = wholesalePrice - cost;

    // Currency conversions (approx benchmark: 1 EUR = 1.08 USD = 3.96 AED = 3.93 QAR)
    let rateToUsd = 1.0;
    if (group?.currency === 'EUR') rateToUsd = 1.08;
    else if (group?.currency === 'AED') rateToUsd = 0.27;

    const wholesaleUsd = (wholesalePrice * rateToUsd).toFixed(2);
    const wholesaleEur = (wholesalePrice * (rateToUsd / 1.08)).toFixed(2);
    const wholesaleAed = (wholesalePrice * (rateToUsd * 3.67)).toFixed(2);

    return {
      cost,
      platformFee,
      wholesalePrice,
      totalMarkupMultiplier,
      clinicPrice,
      retailPrice,
      netGrossProfit,
      wholesaleUsd,
      wholesaleEur,
      wholesaleAed
    };
  }, [baseCost, platformMargin, wholesalerMargin, clinicMarkup, group?.currency]);

  const handleCopySummary = () => {
    const summary = `Atlas Commercial Simulation · ${group?.label || 'Catalog'}
Base Cost: ${currencySymbol}${calculations.cost.toFixed(2)}
Formula: Cost + ${platformMargin}% Platform + ${wholesalerMargin}% Wholesaler
Multiplier: ×${calculations.totalMarkupMultiplier}
Wholesale Price: ${currencySymbol}${calculations.wholesalePrice.toFixed(2)}
Clinic Price: ${currencySymbol}${calculations.clinicPrice.toFixed(2)}
Retail MSRP: ${currencySymbol}${calculations.retailPrice.toFixed(2)}
Net Platform & Wholesale Margin: ${currencySymbol}${calculations.netGrossProfit.toFixed(2)}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast.success('Simulation summary copied to clipboard ✓');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!group) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15,23,42,0.5)',
        zIndex: 110,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.2s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#ffffff',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 111
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Calculator size={18} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Margin &amp; Pricing Simulator
              </h3>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                Live formula testing for <strong>{group.label}</strong>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* Active Formula Reference */}
          <div style={{
            padding: '12px 14px', borderRadius: '8px',
            backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
              Standard Schedule Formula
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0c4a6e', marginTop: '2px' }}>
              {group.pricingNote}
            </div>
          </div>

          {/* Input: Base Lab Cost */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Base Laboratory Cost ({currencySymbol})
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                min="0"
                step="0.5"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 28px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#0f172a',
                  boxSizing: 'border-box'
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 11, fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
                {currencySymbol}
              </span>
            </div>
          </div>

          {/* Sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {/* Platform Margin */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                <span>Platform Margin</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>+{platformMargin}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={platformMargin}
                onChange={(e) => setPlatformMargin(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#003666', cursor: 'pointer' }}
              />
            </div>

            {/* Wholesaler Margin */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                <span>Wholesaler Margin</span>
                <span style={{ color: '#0284c7', fontWeight: 700 }}>+{wholesalerMargin}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                value={wholesalerMargin}
                onChange={(e) => setWholesalerMargin(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#003666', cursor: 'pointer' }}
              />
            </div>

            {/* Clinic Markup */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                <span>Clinic Client Markup</span>
                <span style={{ color: '#16a34a', fontWeight: 700 }}>+{clinicMarkup}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                value={clinicMarkup}
                onChange={(e) => setClinicMarkup(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#16a34a', cursor: 'pointer' }}
              />
            </div>
          </div>

          {/* Live Calculated Output Grid */}
          <div style={{
            border: '1px solid #e2e8f0', borderRadius: '8px',
            overflow: 'hidden', marginBottom: '20px'
          }}>
            <div style={{ padding: '10px 14px', backgroundColor: '#f1f5f9', fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Simulated Price Tiers
            </div>

            <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Wholesale Price</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Multiplier: ×{calculations.totalMarkupMultiplier}</div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#003666' }}>
                {currencySymbol}{calculations.wholesalePrice.toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Clinic Tier Price</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Authorized partner rate</div>
              </div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0284c7' }}>
                {currencySymbol}{calculations.clinicPrice.toFixed(2)}
              </div>
            </div>

            <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Retail MSRP</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Patient benchmark price</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                {currencySymbol}{calculations.retailPrice.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Multi-Currency Projections */}
          <div style={{
            padding: '12px 14px', backgroundColor: '#f8fafc',
            borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>
              Multi-Currency Wholesale Projections
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '6px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>USD ($)</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>${calculations.wholesaleUsd}</div>
              </div>
              <div style={{ padding: '6px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>EUR (€)</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>€{calculations.wholesaleEur}</div>
              </div>
              <div style={{ padding: '6px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '10px', color: '#64748b' }}>AED</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>AED {calculations.wholesaleAed}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <button
            type="button"
            onClick={handleCopySummary}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#003666',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
