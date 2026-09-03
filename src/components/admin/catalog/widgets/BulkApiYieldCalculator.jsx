"use client";

import React, { useState, useMemo } from 'react';
import { FlaskConical, Calculator, Sparkles, Droplets, TrendingUp, DollarSign } from 'lucide-react';
import { formatNumberAdaptive } from '../../../../utils/formatters';

/**
 * BulkApiYieldCalculator
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive reconstitution & yield matrix calculator for Bulk Peptide APIs:
 * - Translates bulk grams (e.g. 5g) into total finished patient/clinic vials
 * - Calculates raw API cost per vial and finished product cost
 * - Forecasts clinical sales revenue and gross profit
 */
export default function BulkApiYieldCalculator({ variant, selectedProduct }) {
  const suppPricing = variant?.supplierPricing || {};
  const defaultGrams = variant?.moq || suppPricing.moq || 5;
  const netCostPerGram = variant?.unit_price || suppPricing.netCost || 3.55;

  const [batchGrams, setBatchGrams] = useState(defaultGrams);
  const [targetDoseMg, setTargetDoseMg] = useState(5);
  const [dilutionMl, setDilutionMl] = useState(2);
  const [vialPackagingCost, setVialPackagingCost] = useState(1.50);
  const [targetVialPrice, setTargetVialPrice] = useState(45);

  const calculations = useMemo(() => {
    const totalMg = Math.max(0, batchGrams * 1000);
    const totalBatchCost = batchGrams * netCostPerGram;
    const totalVials = targetDoseMg > 0 ? Math.floor(totalMg / targetDoseMg) : 0;
    const apiCostPerVial = totalVials > 0 ? totalBatchCost / totalVials : 0;
    const totalCostPerVial = apiCostPerVial + vialPackagingCost;
    const totalProductionCost = totalCostPerVial * totalVials;
    const totalRevenue = totalVials * targetVialPrice;
    const grossProfit = totalRevenue - totalProductionCost;
    const marginPct = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100) : 0;
    const totalBacteriostaticWaterLiters = (totalVials * dilutionMl) / 1000;

    return {
      totalMg,
      totalBatchCost,
      totalVials,
      apiCostPerVial,
      totalCostPerVial,
      totalProductionCost,
      totalRevenue,
      grossProfit,
      marginPct,
      totalBacteriostaticWaterLiters
    };
  }, [batchGrams, netCostPerGram, targetDoseMg, dilutionMl, vialPackagingCost, targetVialPrice]);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '0.875rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={15} style={{ color: '#7c3aed' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
            Bulk API → Finished Vials Yield & Dilution Matrix
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#7c3aed', backgroundColor: '#f3e8ff', padding: '1px 6px', borderRadius: '4px' }}>
            Interactive Calculator
          </span>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
          Simulates formulation of <strong>{selectedProduct?.canonicalName || selectedProduct?.name || 'Bulk Peptide API'}</strong>
        </span>
      </div>

      {/* Input Parameters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.625rem',
        padding: '0.625rem 0.75rem',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #f1f5f9'
      }}>
        <div>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
            Batch API Weight
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              value={batchGrams}
              onChange={(e) => setBatchGrams(Math.max(0.1, Number(e.target.value)))}
              step="any"
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff'
              }}
            />
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>g</span>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
            Target Dose / Vial
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              value={targetDoseMg}
              onChange={(e) => setTargetDoseMg(Math.max(0.1, Number(e.target.value)))}
              step="any"
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff'
              }}
            />
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>mg</span>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
            BAC Water / Vial
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="number"
              value={dilutionMl}
              onChange={(e) => setDilutionMl(Math.max(0.5, Number(e.target.value)))}
              step="any"
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff'
              }}
            />
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>ml</span>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
            Vial Hardware & Labor
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>$</span>
            <input
              type="number"
              value={vialPackagingCost}
              onChange={(e) => setVialPackagingCost(Math.max(0, Number(e.target.value)))}
              step="0.1"
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
            Target Clinic Price
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b' }}>$</span>
            <input
              type="number"
              value={targetVialPrice}
              onChange={(e) => setTargetVialPrice(Math.max(1, Number(e.target.value)))}
              step="1"
              style={{
                width: '100%',
                padding: '3px 6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff'
              }}
            />
          </div>
        </div>
      </div>

      {/* Yield & Output Results Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        paddingTop: '0.25rem'
      }}>
        <div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Vials Yield
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7c3aed' }}>
            {formatNumberAdaptive(calculations.totalVials)} viales
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
            de {targetDoseMg}mg ({calculations.totalBacteriostaticWaterLiters.toFixed(2)}L BAC Water)
          </span>
        </div>

        <div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Finished Cost / Vial
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
            ${calculations.totalCostPerVial.toFixed(2)}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
            (${calculations.apiCostPerVial.toFixed(2)} API + ${vialPackagingCost.toFixed(2)} Vial)
          </span>
        </div>

        <div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Est. Clinic Revenue
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803d' }}>
            ${formatNumberAdaptive(calculations.totalRevenue)}
          </div>
          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
            @ ${targetVialPrice}/vial
          </span>
        </div>

        <div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
            Gross Profit & Margin
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: calculations.grossProfit >= 0 ? '#15803d' : '#dc2626' }}>
            +${formatNumberAdaptive(calculations.grossProfit)}
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d' }}>
            {calculations.marginPct.toFixed(1)}% Gross Margin
          </span>
        </div>
      </div>
    </div>
  );
}
