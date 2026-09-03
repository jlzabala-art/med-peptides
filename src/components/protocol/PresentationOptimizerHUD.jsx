"use client";

import React, { useState, useMemo } from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, Clock, DollarSign, Package, CheckCircle2, ChevronRight } from 'lucide-react';
import { getOptimalPresentation } from '../../services/protocolStabilityOptimizer.js';
import { formatCurrencyAdaptive } from '../../utils/formatters.js';

/**
 * PresentationOptimizerHUD
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive Presentation & In-Use Stability Optimizer Widget.
 * Helps doctors and patients select between Vials and Pens, calculating
 * optimal sizing, zero waste, and lowest cost.
 */
export default function PresentationOptimizerHUD({
  initialDoseMg = 2.5,
  peptideName = 'Tirzepatide',
  onSelectPresentation
}) {
  const [weeklyDoseMg, setWeeklyDoseMg] = useState(initialDoseMg);
  const [formatPreference, setFormatPreference] = useState('all'); // 'all' | 'pen' | 'vial'

  const optimization = useMemo(() => {
    return getOptimalPresentation({
      weeklyDoseMg,
      formatPreference
    });
  }, [weeklyDoseMg, formatPreference]);

  const best = optimization.bestOption;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '1.25rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    }}>
      {/* Header & Format Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Pharmacokinetic & Economic Sizing Engine
          </div>
          <h4 style={{ margin: '2px 0 0', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            Optimal Presentation for {peptideName}
          </h4>
        </div>

        {/* Format Preference Pills */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', borderRadius: '10px', padding: '3px' }}>
          {[
            { id: 'all', label: '✨ Best Value' },
            { id: 'pen', label: '🖊️ Pen Device' },
            { id: 'vial', label: '🧪 Multi-Dose Vial' }
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFormatPreference(opt.id)}
              style={{
                border: 'none',
                backgroundColor: formatPreference === opt.id ? '#ffffff' : 'transparent',
                color: formatPreference === opt.id ? '#0f172a' : '#64748b',
                fontWeight: formatPreference === opt.id ? 800 : 600,
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: formatPreference === opt.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dose Selector Slider */}
      <div style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
            Weekly Prescribed Dose:
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d9488' }}>
            {weeklyDoseMg} mg / week
          </span>
        </div>

        <input
          type="range"
          min="1.0"
          max="20.0"
          step="0.5"
          value={weeklyDoseMg}
          onChange={(e) => setWeeklyDoseMg(parseFloat(e.target.value) || 2.5)}
          style={{ width: '100%', accentColor: '#0d9488', cursor: 'pointer' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
          <span>1.0 mg (Low/Titration)</span>
          <span>4-Week Total: <strong>{optimization.totalNeededMg} mg</strong></span>
          <span>20.0 mg (High/Maintenance)</span>
        </div>
      </div>

      {/* Recommended Sizing Card */}
      {best && (
        <div style={{
          background: best.exceedsStabilityWindow
            ? 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 100%)'
            : 'linear-gradient(135deg, #f0fdfa 0%, #ecfdf5 100%)',
          border: `1.5px solid ${best.exceedsStabilityWindow ? '#fde68a' : '#99f6e4'}`,
          borderRadius: '14px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                backgroundColor: best.exceedsStabilityWindow ? '#fef3c7' : '#ccfbf1',
                borderRadius: '8px',
                padding: '0.4rem',
                display: 'flex',
                color: best.exceedsStabilityWindow ? '#d97706' : '#0d9488'
              }}>
                {best.exceedsStabilityWindow ? <AlertTriangle size={18} /> : <Sparkles size={18} />}
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: best.exceedsStabilityWindow ? '#92400e' : '#0f766e' }}>
                  {best.exceedsStabilityWindow ? 'Suboptimal Stability Fit' : 'Clinically & Economically Optimal'}
                </span>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  {best.unitsNeeded} × {best.unitName}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e' }}>
                ${best.totalCostUSD.toFixed(2)} USD
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                (${best.unitPrice} / unit)
              </div>
            </div>
          </div>

          {/* Sizing Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '0.5rem',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '0.75rem',
            border: '1px solid rgba(0,0,0,0.06)'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Days to Consume 1 Unit</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: best.daysPerUnit > 28 ? '#dc2626' : '#059669', marginTop: '2px' }}>
                {best.daysPerUnit} Days {best.daysPerUnit <= 28 ? '✓ (< 28d)' : '⚠️ (> 28d)'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>In-Use Waste</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: best.totalWasteMg > 0 ? '#dc2626' : '#059669', marginTop: '2px' }}>
                {best.totalWasteMg === 0 ? '0.0 mg (100% Fresh)' : `${best.totalWasteMg} mg expired`}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Potency Quality</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                {best.stabilityRating === 'HIGH_FRESHNESS' ? '⭐⭐⭐ Maximum Freshness' : '⭐⭐ 100% Active'}
              </div>
            </div>
          </div>

          {/* Clinical Advice */}
          <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4, marginTop: '2px' }}>
            {optimization.clinicalAdvice}
          </div>

          {onSelectPresentation && (
            <button
              type="button"
              onClick={() => onSelectPresentation(best)}
              style={{
                marginTop: '0.25rem',
                padding: '0.55rem 1rem',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <CheckCircle2 size={15} /> Apply Recommended Presentation to Prescription
            </button>
          )}
        </div>
      )}
    </div>
  );
}
