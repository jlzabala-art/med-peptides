"use client";

import React from 'react';
import InlineEditableCell from '../../../ui/InlineEditableCell';
import SearchableDropdown from '../../../ui/SearchableDropdown';
import { formatNumberAdaptive, formatCurrencyAdaptive } from '../../../../utils/formatters';
import { calculateTotalMg } from '../../../../utils/calculateTotalMg';
import { PRESENTATION_LABELS } from '../../../../constants/presentationTypes';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';

/**
 * catalogColumns.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modular column builders and price cell renderers for MasterCatalogTable.
 * Supports multi-channel pricing (Cost, Wholesale, Clinic, Retail, and Waterfall).
 */

// Helper: format dosage — supports single doses ("5 mg"), combination peptides ("5 mg + 5 mg"), and normalized total mg for liquid formats
export const formatDosage = (val, variant = null) => {
  if (!val) return '';
  const str = String(val).trim();

  // If it's custom compounding / raw magistral material (Fagron)
  if (/^custom(\s*\/\s*magistral)?$/i.test(str) || /^magistral$/i.test(str) || /^api\s+bulk$/i.test(str)) {
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#0f766e', background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }} title="Concentración personalizada en receta médica">
        Custom / Magistral
      </span>
    );
  }

  // If it's a diagnostic test kit (24Genetics, Fagron Genomics)
  if (/^(\d+\s+)?test(\s+kit)?$/i.test(str) || /^kit$/i.test(str)) {
    return (
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#4338ca', background: '#eef2ff', border: '1px solid #e0e7ff', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }} title="Diagnostic Test Kit">
        1 Test Kit
      </span>
    );
  }

  // If it's a generic standard label
  if (/^standard(\s+clinical(\s+strength)?)?$/i.test(str)) {
    return (
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }} title={str}>
        Clinical Std
      </span>
    );
  }

  const parts = str.split(/\s*\+\s*/);

  const renderPart = (part, idx) => {
    const match = part.trim().match(/^([\d.,]+)\s*([a-zA-Zµ/%]+(?:\/[a-zA-Zµ]+)?)/);
    if (match && match[2]) {
      let numVal = parseFloat(match[1].replace(',', '.'));
      let unit = match[2].toLowerCase();

      // If unit is per ml (e.g., mcg/ml, mg/ml), compute total mg for the bottle
      if (unit === 'mcg/ml' || unit === 'µg/ml' || unit === 'mg/ml') {
        const mgPerMl = (unit === 'mcg/ml' || unit === 'µg/ml') ? (numVal / 1000) : numVal;
        
        let volumeMl = null;
        if (variant) {
          const searchStr = `${variant.volume || ''} ${variant.size || ''} ${variant.quantity || ''} ${variant.name || ''} ${variant.title || ''} ${variant.presentation || ''} ${variant.format || ''}`;
          const volMatch = searchStr.match(/(\d+(?:\.\d+)?)\s*(?:ml|cc)\b/i);
          if (volMatch) {
            volumeMl = parseFloat(volMatch[1]);
          } else if (variant.format === 'nasal_spray' || variant.presentation === 'nasal_spray') {
            volumeMl = 15;
          } else if (variant.format === 'sublingual_drops' || variant.presentation === 'sublingual_drops' || variant.presentation === 'sublingual') {
            volumeMl = 30;
          }
        } else {
          if (numVal === 7500) volumeMl = 15;
        }

        if (volumeMl && volumeMl > 0) {
          const totalMg = parseFloat((mgPerMl * volumeMl).toFixed(2));
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.15' }} title={`${part.trim()} (${volumeMl} ml = ${totalMg} mg total)`}>
              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main, #0f172a)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
                {totalMg}
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: 500, color: 'var(--text-muted, #64748b)', textTransform: 'lowercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
                mg
              </span>
            </div>
          );
        }

        numVal = mgPerMl;
        unit = 'mg/ml';
      } else if ((unit === 'mcg' || unit === 'µg') && numVal >= 1000) {
        numVal = parseFloat((numVal / 1000).toFixed(2));
        unit = 'mg';
      }

      return (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.15' }} title={`Original: ${part.trim()}`}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main, #0f172a)', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            {numVal}
          </span>
          <span style={{ fontSize: '0.62rem', fontWeight: 500, color: 'var(--text-muted, #64748b)', textTransform: 'lowercase', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>
            {unit}
          </span>
        </div>
      );
    }
    return <span key={idx} style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.88rem' }}>{part.trim()}</span>;
  };

  if (parts.length === 1) {
    return renderPart(parts[0], 0);
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flexWrap: 'nowrap' }}>
      {parts.map((part, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && (
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: '#0284c7',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '3px',
              padding: '0 3px',
              lineHeight: '1.2'
            }}>+</span>
          )}
          {renderPart(part, idx)}
        </React.Fragment>
      ))}
    </div>
  );
};

export const getRawPrice = (v, field) => {
  if (!v) return undefined;
  if (field === 'unit_price' || field === 'cost_1') {
    return v.cost_tiers?.cost_1 ?? v.unit_price ?? v.price ?? v.supplierCost ?? v.supplierUnitCostUSD ?? v.perVialPriceUSD ?? v.perUnit;
  }
  if (field === 'cost_10' || field === 'kit_10') {
    return v.cost_tiers?.cost_10 ?? v.cost_10 ?? v.price_per_kit_10 ?? v.kitCost ?? v.supplierKitCostUSD ?? v.perKitPriceUSD ?? v.kitPriceUSD;
  }
  if (field === 'cost_50' || field === 'tier_50') {
    return v.cost_tiers?.cost_50 ?? v.cost_50 ?? v.price_per_tier_50 ?? v.tier50Cost;
  }
  if (field === 'cost_100' || field === 'tier_100') {
    return v.cost_tiers?.cost_100 ?? v.cost_100 ?? v.price_per_tier_100 ?? v.tier100Cost;
  }
  return v[field];
};

export const getConvertedPrice = (v, field, displayCurrency, settings) => {
  let priceUSD = getRawPrice(v, field);
  if (!priceUSD || isNaN(priceUSD)) return priceUSD;
  if (displayCurrency === 'EUR') {
    if (v.supplierId === 'supplier-nplabs' || v.supplier === 'NP LABS' || v.price_eur !== undefined) {
      if (field === 'unit_price' && v.price_eur !== undefined) return v.price_eur;
      if (field === 'cost_10' && v.kit_price_eur !== undefined) return v.kit_price_eur;
      if (v.price_eur && v.price) {
        const impliedRate = v.price / v.price_eur;
        return priceUSD / impliedRate;
      }
    }
  }

  if (displayCurrency === 'EUR') return priceUSD * (settings?.exchangeRates?.euro || 0.92);
  if (displayCurrency === 'AED') return priceUSD * (settings?.exchangeRates?.uae || 3.67);
  return priceUSD;
};

export const buildPeptideColumns = ({
  sharedCols = [],
  commercialChannel = 'cost',
  priceGapCol,
  activePriceCol,
  marginCol,
  waterfallCols = [],
  activeMgCol,
  actionCol,
  updateVariantField,
  presentationOptions,
  selectedProduct,
  resolveSupplierName
}) => {
  if (commercialChannel === 'all' && waterfallCols.length > 0) {
    return [
      ...sharedCols,
      {
        key: 'dosage',
        header: 'Dosage',
        width: '85px',
        nowrap: true,
        sortValue: (v) => parseFloat(v.dosage || v.dose) || 0,
        render: (v) => (
          <InlineEditableCell
            value={v.dosage || v.dose || ''}
            type="dosage"
            placeholder="+ Add dosage"
            format={(val) => formatDosage(val, v)}
            onSave={(newVal) => updateVariantField(v.id, 'dosage', newVal)}
          />
        )
      },
      {
        key: 'presentation',
        header: 'Format',
        width: '120px',
        nowrap: true,
        render: (v) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <SearchableDropdown
              value={v.presentation || ''}
              options={presentationOptions}
              placeholder="Format"
              inline={true}
              displayValue={PRESENTATION_LABELS[v.presentation] || v.presentation || ''}
              onChange={async (newVal) => {
                if (!selectedProduct?.id) return;
                const ref = doc(db, 'products', selectedProduct.id, 'variants', v.id);
                await updateDoc(ref, {
                  presentation:     newVal,
                  presentationName: PRESENTATION_LABELS[newVal] || newVal,
                  updatedAt:        new Date().toISOString(),
                });
              }}
            />
          </div>
        )
      },
      ...waterfallCols,
      actionCol
    ].filter(Boolean);
  }

  return [
    ...sharedCols,
    {
      key: 'dosage',
      header: 'Dosage / Scale',
      width: '105px',
      nowrap: true,
      sortValue: (v) => parseFloat(v.dosage || v.dose || v.moq) || 0,
      render: (v) => {
        const isRawApi = v.unitOfMeasure === 'g' || v.unitOfMeasure === 'kg' || v.supplierPricing?.unitOfMeasure === 'g' || v.type === 'raw_material' || v.format === 'raw_api' || (v.moq && v.moq > 50);
        if (isRawApi) {
          const rawDose = v.dosage || v.dose;
          const isGenericDose = !rawDose || rawDose === 'Standard Dose' || rawDose === 'Standard';
          let doseStr = '';
          if (v.moq && !isNaN(v.moq)) {
            doseStr = `${Number(v.moq).toLocaleString()}g (MOQ)`;
          } else if (!isGenericDose) {
            doseStr = rawDose;
          } else {
            doseStr = `${v.weight || '100g'} (Bulk)`;
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: '1.2' }}>
              <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#003666', whiteSpace: 'nowrap' }}>
                {doseStr}
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#059669', background: '#ecfdf5', padding: '1px 5px', borderRadius: '3px', whiteSpace: 'nowrap', border: '1px solid #d1fae5' }}>
                {v.purity || v.strength || '99% USP'}
              </span>
            </div>
          );
        }
        return (
          <InlineEditableCell
            value={v.dosage || v.dose || ''}
            type="dosage"
            placeholder="+ Add dosage"
            format={(val) => formatDosage(val, v)}
            onSave={(newVal) => updateVariantField(v.id, 'dosage', newVal)}
          />
        );
      }
    },
    {
      key: 'presentation',
      header: 'Format',
      width: '140px',
      align: 'left',
      nowrap: true,
      render: (v) => {
        const isRawApi = v.unitOfMeasure === 'g' || v.unitOfMeasure === 'kg' || v.supplierPricing?.unitOfMeasure === 'g' || v.type === 'raw_material' || v.format === 'raw_api';

        if (isRawApi) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f766e', background: '#f0fdfa', padding: '2px 7px', borderRadius: '4px', border: '1px solid #ccfbf1', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                🧪 Bulk API ({v.unitOfMeasure || v.supplierPricing?.unitOfMeasure || 'g'})
              </span>
            </div>
          );
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <SearchableDropdown
              value={v.presentation || ''}
              options={presentationOptions}
              placeholder="Format"
              inline={true}
              displayValue={PRESENTATION_LABELS[v.presentation] || v.presentation || ''}
              onChange={async (newVal) => {
                if (!selectedProduct?.id) return;
                const ref = doc(db, 'products', selectedProduct.id, 'variants', v.id);
                await updateDoc(ref, {
                  presentation:     newVal,
                  presentationName: PRESENTATION_LABELS[newVal] || newVal,
                  updatedAt:        new Date().toISOString(),
                });
              }}
            />
          </div>
        );
      }
    },
    activePriceCol,
    ...(marginCol ? [marginCol] : []),
    ...(commercialChannel === 'cost' && priceGapCol ? [priceGapCol] : []),
    ...(activeMgCol ? [activeMgCol] : []),
    actionCol
  ].filter(Boolean);
};

export const buildGeneticTestColumns = ({
  sharedCols = [],
  commercialChannel = 'cost',
  priceGapCol,
  activePriceCol,
  marginCol,
  waterfallCols = [],
  activeMgCol,
  actionCol,
  updateVariantField
}) => {
  if (commercialChannel === 'all' && waterfallCols.length > 0) {
    return [
      ...sharedCols,
      {
        key: 'sample_type',
        header: 'Sample Type',
        width: '15%',
        nowrap: true,
        render: (v) => (
          <InlineEditableCell
            value={v.sampleType || v.extractionMethod || v.dosage || ''}
            type="select"
            options={[{ label: 'Saliva', value: 'Saliva' }, { label: 'Blood', value: 'Blood' }]}
            placeholder="Sample Type"
            onSave={(newVal) => updateVariantField(v.id, 'sampleType', newVal)}
          />
        )
      },
      ...waterfallCols,
      actionCol
    ].filter(Boolean);
  }

  return [
    ...sharedCols,
    {
      key: 'sample_type',
      header: 'Sample Type',
      width: '16%',
      nowrap: true,
      render: (v) => (
        <InlineEditableCell
          value={v.sampleType || v.extractionMethod || v.dosage || ''}
          type="select"
          options={[{ label: 'Saliva', value: 'Saliva' }, { label: 'Blood', value: 'Blood' }]}
          placeholder="Sample Type"
          onSave={(newVal) => updateVariantField(v.id, 'sampleType', newVal)}
        />
      )
    },
    {
      key: 'tat',
      header: 'Turnaround (TAT)',
      width: '12%',
      nowrap: true,
      render: (v) => (
        <InlineEditableCell
          value={v.turnaroundTime || ''}
          type="text"
          placeholder="e.g. 5-7 days"
          onSave={(newVal) => updateVariantField(v.id, 'turnaroundTime', newVal)}
        />
      )
    },
    activePriceCol,
    ...(marginCol ? [marginCol] : []),
    ...(commercialChannel === 'cost' && priceGapCol ? [priceGapCol] : []),
    ...(activeMgCol ? [activeMgCol] : []),
    actionCol
  ].filter(Boolean);
};

export const buildApiColumns = ({
  sharedCols = [],
  commercialChannel = 'cost',
  priceGapCol,
  activePriceCol,
  marginCol,
  waterfallCols = [],
  activeGramCol,
  actionCol,
  updateVariantField
}) => {
  const customBatchCostCol = activePriceCol ? {
    ...activePriceCol,
    header: (activePriceCol.header || '').replace(/COST \(X1\)/i, 'COST ($/g)').replace(/PRICE \(X1\)/i, 'PRICE ($/g)').replace(/Cost \(x1\)/i, 'Cost ($/g)'),
    width: '135px'
  } : null;

  const refinedGramCol = activeGramCol ? {
    ...activeGramCol,
    width: '85px'
  } : null;

  if (commercialChannel === 'all' && waterfallCols.length > 0) {
    return [
      ...sharedCols,
      {
        key: 'weight',
        header: 'Batch MOQ / Weight (g)',
        width: '130px',
        nowrap: true,
        render: (v) => (
          <InlineEditableCell
            value={v.weight || v.moq || v.size || v.dosage || ''}
            type="text"
            placeholder="e.g. 5g, 100g"
            onSave={(newVal) => updateVariantField(v.id, 'weight', newVal)}
          />
        )
      },
      {
        key: 'purity',
        header: 'Purity & Grade',
        width: '120px',
        nowrap: true,
        render: (v) => (
          <InlineEditableCell
            value={v.purity || v.strength || v.specs || ''}
            type="text"
            placeholder="99% USP"
            format={(val) => <span style={{ fontWeight: 650, color: 'var(--text-main)' }}>{val || '99% USP'}</span>}
            onSave={(newVal) => updateVariantField(v.id, 'purity', newVal)}
          />
        )
      },
      ...waterfallCols,
      actionCol
    ].filter(Boolean);
  }

  return [
    ...sharedCols,
    {
      key: 'weight',
      header: 'Batch MOQ / Weight (g)',
      width: '130px',
      nowrap: true,
      render: (v) => (
        <InlineEditableCell
          value={v.weight || v.moq || v.size || v.dosage || ''}
          type="text"
          placeholder="e.g. 5g, 100g"
          onSave={(newVal) => updateVariantField(v.id, 'weight', newVal)}
        />
      )
    },
    {
      key: 'purity',
      header: 'Purity & Grade',
      width: '120px',
      nowrap: true,
      render: (v) => (
        <InlineEditableCell
          value={v.purity || v.strength || v.specs || ''}
          type="text"
          placeholder="99% USP"
          format={(val) => <span style={{ fontWeight: 650, color: 'var(--text-main)' }}>{val || '99% USP'}</span>}
          onSave={(newVal) => updateVariantField(v.id, 'purity', newVal)}
        />
      )
    },
    customBatchCostCol || activePriceCol,
    ...(marginCol ? [marginCol] : []),
    ...(commercialChannel === 'cost' && priceGapCol ? [priceGapCol] : []),
    refinedGramCol || activeGramCol,
    actionCol
  ].filter(Boolean);
};
