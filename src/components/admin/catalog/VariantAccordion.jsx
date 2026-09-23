"use client";

import React, { useState, useMemo } from 'react';
import DataTable from '../../ui/DataTable';
import SegmentedControl from '../../ui/SegmentedControl';
import CurrencySelector from '../../ui/CurrencySelector';
import MobileVariantCard from './MobileVariantCard';
import VariantTimelinePanel from './VariantTimelinePanel';
import { COMMERCIAL_CHANNELS, resolveChannelPrice } from '../../../utils/commercialPricingHelper';
import { calculateTotalMg } from '../../../utils/calculateTotalMg';
import { ChevronDown, ChevronRight, Building2, Layers, ListFilter, ShieldCheck, FileText, Share2, Download, DollarSign, TrendingUp, Clock, Zap, ArrowUpDown } from 'lucide-react';
import toast from 'react-hot-toast';
import ShareProductMonographDrawer from './drawers/ShareProductMonographDrawer';
import GcpSupplierFilterBar from './components/GcpSupplierFilterBar';

// Lead times by supplier geography & fulfillment SLA
const SUPPLIER_LEAD_TIMES = {
  'supplier-centrico': { label: '🇦🇪 24-48h (Dubai Direct)', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  'centrico': { label: '🇦🇪 24-48h (Dubai Direct)', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  'supplier-europeptides': { label: '🇪🇺 2-4 Days (EU Hub)', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  'europeptides': { label: '🇪🇺 2-4 Days (EU Hub)', color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe' },
  'supplier-lotusland': { label: '📦 7-10 Days (Air Freight)', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  'lotusland': { label: '📦 7-10 Days (Air Freight)', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  'supplier-fagron-iberia': { label: '🇪🇸 24-72h (Iberia Hub)', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  'supplier-fagron-genomics': { label: '🇪🇸 3-5 Days (Lab Processing)', color: '#047857', bg: '#ecfdf5', border: '#a7f3d0' },
  'supplier-pod-poland': { label: '🇵🇱 3-5 Days (EU Hub)', color: '#6b21a8', bg: '#faf5ff', border: '#e9d5ff' },
  'supplier-magenta': { label: '🇦🇪 24-48h (Dubai Compounding)', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' },
  'supplier-bioniq': { label: '🇬🇧 3-5 Days (UK/EU)', color: '#334155', bg: '#f8fafc', border: '#e2e8f0' },
  'supplier-nplabs': { label: '🇬🇷 3-5 Days (Athens Hub)', color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd' }
};

export function getSupplierLeadTime(suppIdOrName) {
  if (!suppIdOrName) return null;
  const key = String(suppIdOrName).toLowerCase().trim();
  if (SUPPLIER_LEAD_TIMES[key]) return SUPPLIER_LEAD_TIMES[key];
  if (key.includes('centrico')) return SUPPLIER_LEAD_TIMES['supplier-centrico'];
  if (key.includes('europept')) return SUPPLIER_LEAD_TIMES['supplier-europeptides'];
  if (key.includes('lotus')) return SUPPLIER_LEAD_TIMES['supplier-lotusland'];
  if (key.includes('fagron')) return SUPPLIER_LEAD_TIMES['supplier-fagron-iberia'];
  if (key.includes('poland') || key.includes('pod')) return SUPPLIER_LEAD_TIMES['supplier-pod-poland'];
  if (key.includes('magenta')) return SUPPLIER_LEAD_TIMES['supplier-magenta'];
  if (key.includes('bioniq')) return SUPPLIER_LEAD_TIMES['supplier-bioniq'];
  if (key.includes('np')) return SUPPLIER_LEAD_TIMES['supplier-nplabs'];
  return { label: '⚡ 3-5 Business Days', color: '#475569', bg: '#f8fafc', border: '#e2e8f0' };
}

// Native invoicing currencies by supplier
const SUPPLIER_ORIGINAL_CURRENCIES = {
  'supplier-centrico': { code: 'AED', symbol: 'AED', flag: '🇦🇪', label: 'AED' },
  'centrico': { code: 'AED', symbol: 'AED', flag: '🇦🇪', label: 'AED' },
  'supplier-magenta': { code: 'AED', symbol: 'AED', flag: '🇦🇪', label: 'AED' },
  'magenta': { code: 'AED', symbol: 'AED', flag: '🇦🇪', label: 'AED' },
  'supplier-lotusland': { code: 'USD', symbol: '$', flag: '🇺🇸', label: 'USD ($)' },
  'lotusland': { code: 'USD', symbol: '$', flag: '🇺🇸', label: 'USD ($)' },
  'supplier-europeptides': { code: 'EUR', symbol: '€', flag: '🇪🇺', label: 'EUR (€)' },
  'europeptides': { code: 'EUR', symbol: '€', flag: '🇪🇺', label: 'EUR (€)' },
  'supplier-fagron-iberia': { code: 'EUR', symbol: '€', flag: '🇪🇸', label: 'EUR (€)' },
  'supplier-fagron-genomics': { code: 'EUR', symbol: '€', flag: '🇪🇸', label: 'EUR (€)' },
  'supplier-pod-poland': { code: 'EUR', symbol: '€', flag: '🇵🇱', label: 'EUR (€)' },
  'supplier-bioniq': { code: 'GBP', symbol: '£', flag: '🇬🇧', label: 'GBP (£)' },
  'supplier-nplabs': { code: 'EUR', symbol: '€', flag: '🇬🇷', label: 'EUR (€)' },
  'nplabs': { code: 'EUR', symbol: '€', flag: '🇬🇷', label: 'EUR (€)' }
};

export function getSupplierOriginalCurrency(suppIdOrName, variants = []) {
  const firstWithCurr = (variants || []).find(v => v.originalCurrency || v.costCurrency || v.supplierPricing?.currency);
  if (firstWithCurr) {
    const code = (firstWithCurr.originalCurrency || firstWithCurr.costCurrency || firstWithCurr.supplierPricing?.currency || '').toUpperCase();
    if (code === 'AED') return { code: 'AED', symbol: 'AED', flag: '🇦🇪', label: 'AED' };
    if (code === 'USD') return { code: 'USD', symbol: '$', flag: '🇺🇸', label: 'USD ($)' };
    if (code === 'EUR') return { code: 'EUR', symbol: '€', flag: '🇪🇺', label: 'EUR (€)' };
    if (code === 'GBP') return { code: 'GBP', symbol: '£', flag: '🇬🇧', label: 'GBP (£)' };
  }

  if (!suppIdOrName) return { code: 'USD', symbol: '$', flag: '🌐', label: 'USD ($)' };
  const key = String(suppIdOrName).toLowerCase().trim();
  if (SUPPLIER_ORIGINAL_CURRENCIES[key]) return SUPPLIER_ORIGINAL_CURRENCIES[key];
  if (key.includes('centrico') || key.includes('magenta')) return SUPPLIER_ORIGINAL_CURRENCIES['supplier-magenta'];
  if (key.includes('lotus')) return SUPPLIER_ORIGINAL_CURRENCIES['supplier-lotusland'];
  if (key.includes('europept') || key.includes('fagron') || key.includes('np') || key.includes('poland') || key.includes('pod')) return SUPPLIER_ORIGINAL_CURRENCIES['supplier-europeptides'];
  if (key.includes('bioniq')) return SUPPLIER_ORIGINAL_CURRENCIES['supplier-bioniq'];
  return { code: 'USD', symbol: '$', flag: '🌐', label: 'USD ($)' };
}

/**
 * VariantAccordion
 * ─────────────────────────────────────────────────────────────────────────────
 * Intelligent Master-Detail accordion component for product variants table.
 * Adapts height dynamically to content size, supports grouping by supplier,
 * supplier filter tabs, multi-tier pricing, commercial channel margins,
 * and high-visibility quick actions for desktop and mobile.
 */
export default function VariantAccordion({
  sortedVariants = [],
  selectedProduct,
  priceView,
  setPriceView,
  displayCurrency,
  setDisplayCurrency,
  commercialChannel = 'cost',
  setCommercialChannel,
  columns = [],
  apiColumns = [],
  resolveSupplierName,
  onExportPdf,
  isApi = false,
  updateVariantField
}) {
  const isService = selectedProduct?.category?.toLowerCase().includes('service') ||
                    selectedProduct?.category?.toLowerCase().includes('subscription') ||
                    selectedProduct?.productType === 'service' ||
                    selectedProduct?.primaryType === 'service' ||
                    selectedProduct?.product_type === 'service';

  const isGenomicsOrTest = selectedProduct?.category?.toLowerCase().includes('genom') ||
                           selectedProduct?.category?.toLowerCase().includes('biomarker') ||
                           selectedProduct?.category === 'genomics_biomarkers' ||
                           selectedProduct?.category?.toLowerCase().includes('diagnostic') ||
                           selectedProduct?.productType === 'genomics_biomarkers' ||
                           selectedProduct?.product_type === 'dna_testing_kit';

  const isPeptide = !isGenomicsOrTest && !isService;
  const [sortBy, setSortBy] = useState(isPeptide ? 'cost_per_mg' : 'dosage'); // 'cost_per_mg' | 'dosage' | 'supplier'

  const [groupBy, setGroupBy] = useState('supplier'); // 'supplier' | 'none'
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState('all');
  const [variantTypeFilter, setVariantTypeFilter] = useState('all'); // 'all' | 'finished' | 'raw_material'
  const [collapsedSuppliers, setCollapsedSuppliers] = useState({});

  const isVariantRaw = (v) => {
    return v.unitOfMeasure === 'g' || v.unitOfMeasure === 'kg' || v.supplierPricing?.unitOfMeasure === 'g' || v.type === 'raw_material' || v.format === 'raw_api' || (v.moq && v.moq > 50);
  };

  const rawCount = sortedVariants.filter(isVariantRaw).length;
  const finishedCount = sortedVariants.filter(v => !isVariantRaw(v)).length;
  const hasMixedTypes = rawCount > 0 && finishedCount > 0;

  // Active nature (API in Grams vs Clinical Units)
  const activeIsApi = variantTypeFilter === 'raw_material' || (variantTypeFilter === 'all' && rawCount > 0 && finishedCount === 0) || isApi;

  // Filter variants by type first
  const typeFilteredVariants = useMemo(() => {
    if (variantTypeFilter === 'finished') return sortedVariants.filter(v => !isVariantRaw(v));
    if (variantTypeFilter === 'raw_material') return sortedVariants.filter(isVariantRaw);
    return sortedVariants;
  }, [sortedVariants, variantTypeFilter]);

  const toggleSupplierCollapse = (suppKey) => {
    setCollapsedSuppliers(prev => ({
      ...prev,
      [suppKey]: !prev[suppKey]
    }));
  };

  const [shareDrawerConfig, setShareDrawerConfig] = useState({ isOpen: false, supplierKey: null });

  const handleSharePublicDatasheet = (group) => {
    const slug = selectedProduct?.slug || selectedProduct?.id;
    if (!slug) {
      toast.error('Product identifier not found');
      return;
    }
    setShareDrawerConfig({
      isOpen: true,
      supplierKey: group?.key || group?.name || null
    });
  };

  // Helper: extract numeric mg value from a variant for sorting
  const parseDosageMg = (v) => {
    const raw = String(v.dosage || v.dose || v.moq || '').trim();
    const m = raw.match(/^([\d.,]+)\s*([a-zA-Zµ]+(?:\/[a-zA-Z]+)?)/);
    if (!m) return Infinity;
    let num = parseFloat(m[1].replace(',', '.'));
    const unit = m[2].toLowerCase();
    // Convert to mg for uniform comparison
    if (unit === 'mcg' || unit === 'µg') num /= 1000;
    else if (unit === 'mcg/ml' || unit === 'µg/ml') num = (num / 1000) * (v.volume_ml || 15);
    else if (unit === 'mg/ml') num = num * (v.volume_ml || 15);
    else if (unit === 'g') num *= 1000;
    return isNaN(num) ? Infinity : num;
  };

  // Helper: calculate normalized cost per mg for sorting
  const getVariantCostPerMg = (v) => {
    const res = resolveChannelPrice(v, commercialChannel, priceView);
    const cost = res.price;
    const totalMg = calculateTotalMg(v) || calculateTotalMg(selectedProduct) || (v.doseMg ?? v.totalMg);
    if (cost != null && !isNaN(cost) && cost > 0 && totalMg != null && !isNaN(totalMg) && totalMg > 0) {
      return cost / totalMg;
    }
    return Infinity;
  };

  // 1. Group variants by supplier, sort variants within each group
  const supplierGroups = useMemo(() => {
    const map = new Map();

    typeFilteredVariants.forEach(v => {
      const suppName = resolveSupplierName ? resolveSupplierName(v) : (v.supplierName || v.supplier || 'Other Suppliers');
      const key = v.supplierId || suppName || 'unknown';

      if (!map.has(key)) {
        map.set(key, {
          key,
          id: key,
          name: suppName,
          hasCOA: !!v.hasCOA,
          variants: []
        });
      }
      const group = map.get(key);
      if (v.hasCOA) group.hasCOA = true;
      group.variants.push(v);
    });

    // Sort variants within each supplier group
    map.forEach(group => {
      group.variants.sort((a, b) => {
        if (sortBy === 'cost_per_mg') {
          const cA = getVariantCostPerMg(a);
          const cB = getVariantCostPerMg(b);
          if (cA !== cB && !isNaN(cA) && !isNaN(cB)) return cA - cB;
          return parseDosageMg(a) - parseDosageMg(b);
        }
        if (sortBy === 'dosage') {
          return parseDosageMg(a) - parseDosageMg(b);
        }
        return 0;
      });
      const validPerMg = group.variants.map(v => getVariantCostPerMg(v)).filter(x => x !== Infinity && !isNaN(x));
      group.bestCostPerMg = validPerMg.length > 0 ? Math.min(...validPerMg) : Infinity;
    });

    // Sort supplier groups
    return Array.from(map.values()).sort((a, b) => {
      if (sortBy === 'cost_per_mg') {
        if (a.bestCostPerMg !== b.bestCostPerMg && !isNaN(a.bestCostPerMg) && !isNaN(b.bestCostPerMg)) {
          return a.bestCostPerMg - b.bestCostPerMg;
        }
      }
      const diff = a.variants.length - b.variants.length;
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [typeFilteredVariants, resolveSupplierName, sortBy, commercialChannel, priceView, selectedProduct]);

  // 2. Filtered variants based on supplier filter tab
  const filteredVariants = useMemo(() => {
    let list = typeFilteredVariants;
    if (selectedSupplierFilter !== 'all') {
      list = list.filter(v => {
        const suppName = resolveSupplierName ? resolveSupplierName(v) : (v.supplierName || v.supplier || '');
        const key = v.supplierId || suppName;
        return key === selectedSupplierFilter || suppName === selectedSupplierFilter;
      });
    }
    return [...list].sort((a, b) => {
      if (sortBy === 'cost_per_mg') {
        const cA = getVariantCostPerMg(a);
        const cB = getVariantCostPerMg(b);
        if (cA !== cB && !isNaN(cA) && !isNaN(cB)) return cA - cB;
      }
      return parseDosageMg(a) - parseDosageMg(b);
    });
  }, [typeFilteredVariants, selectedSupplierFilter, resolveSupplierName, sortBy, commercialChannel, priceView, selectedProduct]);

  // 3. Clean columns without redundant supplier column for grouped view
  const finishedSupplierColumns = useMemo(() => {
    return (columns || []).filter(c => c && c.key !== 'supplier' && c.key !== 'supplierName' && c.id !== 'supplier');
  }, [columns]);

  const rawSupplierColumns = useMemo(() => {
    const base = (apiColumns && apiColumns.length > 0) ? apiColumns : (columns || []);
    return base.filter(c => c && c.key !== 'supplier' && c.key !== 'supplierName' && c.id !== 'supplier');
  }, [apiColumns, columns]);

  // Custom mobile card renderer with reactive context
  const renderMobileCard = (cardProps) => (
    <MobileVariantCard
      {...cardProps}
      selectedProduct={selectedProduct}
      displayCurrency={displayCurrency}
      priceView={priceView}
      commercialChannel={commercialChannel}
      onUpdateVariantField={updateVariantField}
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Sleek Multi-Tier Responsive Toolbar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        padding: '0.75rem 0.875rem',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
      }}>
        {/* Tier 1: View Mode & Commercial Channels (Cost / Wholesale / Clinic / Retail / Waterfall) */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}>
          {/* Channel Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#003666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <DollarSign size={13} style={{ color: '#0284c7' }} /> Channel:
            </span>
            <SegmentedControl
              value={commercialChannel}
              onChange={setCommercialChannel}
              options={COMMERCIAL_CHANNELS.map(c => ({
                id: c.id,
                label: `${c.icon} ${c.shortLabel}`
              }))}
              layoutIdPrefix="commercial-channel-selector"
            />
          </div>

          {/* Controls: Sort Order & View Mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Sort Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <TrendingUp size={12} style={{ color: '#0284c7' }} /> Sort:
              </span>
              <SegmentedControl
                value={sortBy}
                onChange={setSortBy}
                options={isPeptide ? [
                  { id: 'cost_per_mg', label: '⚡ Best $/mg' },
                  { id: 'dosage', label: '💊 Dosage' },
                  { id: 'supplier', label: '🏢 Supplier' }
                ] : [
                  { id: 'dosage', label: '💊 Dosage' },
                  { id: 'supplier', label: '🏢 Supplier' }
                ]}
                layoutIdPrefix="variant-sort-selector"
              />
            </div>

            {/* View Mode (Group by Supplier vs Flat) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}>
                View:
              </span>
              <SegmentedControl
                value={groupBy}
                onChange={setGroupBy}
                options={[
                  { id: 'supplier', label: 'By Supplier' },
                  { id: 'none', label: 'Flat List' }
                ]}
                layoutIdPrefix="variant-group-selector"
              />
            </div>
          </div>
        </div>

        {/* Tier 2: Type Selector for Dual Products (Finished Formulations vs Bulk Raw Materials) */}
        {hasMixedTypes && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid #edf2f7',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#003666',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap'
            }}>
              Product Scope:
            </span>
            <SegmentedControl
              value={variantTypeFilter}
              onChange={setVariantTypeFilter}
              options={[
                { id: 'all', label: `All Variants (${sortedVariants.length})` },
                { id: 'finished', label: `💉 Finished Formulations (${finishedCount})` },
                { id: 'raw_material', label: `🧪 Bulk Raw Materials (${rawCount})` }
              ]}
              layoutIdPrefix="variant-type-selector"
            />
          </div>
        )}

        {/* Tier 3: Context-Aware Volume/Weight Tier Controls & Currency */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #edf2f7'
        }}>
          {/* Left: Volume / Weight Range selector OR Domain indicator for Services / Genomics */}
          {isService ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#0284c7',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                padding: '3px 10px',
                borderRadius: '6px'
              }}>
                ⚡ Subscription & Recurring Billing Plans
              </span>
            </div>
          ) : isGenomicsOrTest ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#4338ca',
                background: '#eef2ff',
                border: '1px solid #c7d2fe',
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                🧬 Non-Diagnostic Screening & Lab Panels
              </span>
            </div>
          ) : (!hasMixedTypes || variantTypeFilter !== 'all') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}>
                {activeIsApi ? 'Weight Range (g):' : 'Volume:'}
              </span>
              <SegmentedControl
                value={priceView}
                onChange={setPriceView}
                options={activeIsApi ? [
                  { id: 'unit', label: '1g – 4g' },
                  { id: 'kit', label: '5g – 9g (MOQ)' },
                  { id: 'tier_50', label: '10g – 49g' },
                  { id: 'tier_100', label: '50g+' }
                ] : [
                  { id: 'unit', label: 'Unit (×1)' },
                  { id: 'kit', label: 'Tier ×10' },
                  { id: 'tier_50', label: 'Tier ×50' },
                  { id: 'tier_100', label: 'Tier ×100' }
                ]}
                layoutIdPrefix="pricing-tier-selector"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.75rem' }}>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#475569',
                backgroundColor: '#f1f5f9',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                💡 Select <b>Finished Formulations</b> for Volume Tiers or <b>Bulk Raw Materials</b> for Weight Ranges (g).
              </span>
            </div>
          )}

          {/* Right: Currency Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap'
              }}>
                Currency:
              </span>
              <CurrencySelector value={displayCurrency} onChange={setDisplayCurrency} />
            </div>
          </div>
        </div>
      </div>

      {/* Google Cloud Platform Supplier Filter Bar */}
      {supplierGroups.length > 1 && (
        <GcpSupplierFilterBar
          supplierGroups={supplierGroups}
          selectedSupplierFilter={selectedSupplierFilter}
          onSelectSupplier={setSelectedSupplierFilter}
          totalVariantsCount={typeFilteredVariants.length}
        />
      )}

      {/* View Rendering: Grouped by Supplier vs Flat Table */}
      {groupBy === 'supplier' ? (
        <div className="flex flex-col gap-3">
          {supplierGroups
            .filter(group => selectedSupplierFilter === 'all' || selectedSupplierFilter === group.key)
            .map(group => {
              const isCollapsed = !!collapsedSuppliers[group.key];
              const isGroupRaw = group.variants.some(v => isVariantRaw(v));
              const currentGroupColumns = isGroupRaw ? rawSupplierColumns : finishedSupplierColumns;

              return (
                <div
                  key={group.key}
                  style={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Supplier Header — GCP Responsive 2-Tier Master-Detail Accordion */}
                  <div
                    onClick={() => toggleSupplierCollapse(group.key)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      padding: '0.625rem 0.875rem',
                      backgroundColor: '#f8fafc',
                      borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {/* Tier 1: Supplier Identity + Variant Count Badge */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      width: '100%'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <span style={{ color: isCollapsed ? '#94a3b8' : '#003666', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        </span>
                        <Building2 size={16} style={{ color: 'var(--color-primary, #003666)', flexShrink: 0 }} />
                        <span style={{
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {group.name}
                        </span>
                      </div>

                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#475569',
                        backgroundColor: '#e2e8f0',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        flexShrink: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        {group.variants.length} {group.variants.length === 1 ? 'variant' : 'variants'}
                      </span>
                    </div>

                    {/* Tier 2: Metadata Chips & Quick Actions (Wraps cleanly on mobile, zero overlap) */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      flexWrap: 'wrap',
                      paddingLeft: '1.5rem'
                    }}>
                      {/* 🌐 1-Click Public Datasheet Export & Share */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSharePublicDatasheet(group);
                        }}
                        title="Export & Share Public Datasheet"
                        aria-label="Export public datasheet"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#0284c7',
                          backgroundColor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                          transition: 'all 0.15s ease',
                          lineHeight: 1.4
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#0284c7';
                          e.currentTarget.style.backgroundColor = '#f0f9ff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.backgroundColor = '#ffffff';
                        }}
                      >
                        <Share2 size={12} style={{ color: '#0284c7' }} />
                        <span>Public Datasheet</span>
                      </button>

                      {group.hasCOA && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 600, color: '#059669', backgroundColor: '#dcfce7', padding: '1px 6px', borderRadius: '4px' }}>
                          <ShieldCheck size={11} /> COA Verified
                        </span>
                      )}

                      {isGroupRaw && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.68rem', fontWeight: 700, color: '#047857', backgroundColor: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', border: '1px solid #a7f3d0' }}>
                          🧪 Bulk Raw Material (g)
                        </span>
                      )}

                      {(() => {
                        const lt = getSupplierLeadTime(group.key || group.name);
                        if (!lt) return null;
                        return (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            color: lt.color,
                            backgroundColor: lt.bg,
                            border: `1px solid ${lt.border}`,
                            padding: '1px 6px',
                            borderRadius: '4px'
                          }}>
                            <Clock size={10} /> {lt.label}
                          </span>
                        );
                      })()}

                      {(() => {
                        const origCurr = getSupplierOriginalCurrency(group.key || group.name, group.variants);
                        return (
                          <span
                            title={`Supplier primary invoicing currency is ${origCurr.code}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              color: '#334155',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              padding: '1px 6px',
                              borderRadius: '4px'
                            }}
                          >
                            <span style={{ fontSize: '0.72rem' }}>{origCurr.flag}</span>
                            <span style={{ color: '#64748b' }}>Currency:</span>
                            <span style={{ color: '#0f172a', fontWeight: 800 }}>{origCurr.label}</span>
                          </span>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Supplier Variants Table (Compact & Intelligent Height) */}
                  {!isCollapsed && (
                    <DataTable
                      getRowProps={(v) => ({
                        className: v.isPreferred ? 'bg-emerald-50 hover:bg-emerald-100 transition-colors' : 'hover:bg-slate-50 transition-colors'
                      })}
                      columns={currentGroupColumns}
                      data={group.variants}
                      expandableRender={(v) => (
                        <VariantTimelinePanel 
                          variant={v} 
                          selectedProduct={selectedProduct} 
                          onUpdateVariantField={updateVariantField} 
                        />
                      )}
                      mobileCardComponent={renderMobileCard}
                      keyField="id"
                      minHeight="auto"
                      hidePagination={true}
                      emptyTitle="No variants found for this supplier"
                      emptySubtitle="Add a new variant or duplicate an existing one."
                    />
                  )}
                </div>
              );
            })}
        </div>
      ) : (
        /* Flat Table View */
        <DataTable
          getRowProps={(v) => ({
            className: v.isPreferred ? 'bg-emerald-50 hover:bg-emerald-100 transition-colors' : 'hover:bg-slate-50 transition-colors'
          })}
          columns={(activeIsApi && apiColumns.length > 0) ? apiColumns : columns}
          data={filteredVariants}
          expandableRender={(v) => (
            <VariantTimelinePanel 
              variant={v} 
              selectedProduct={selectedProduct} 
              onUpdateVariantField={updateVariantField} 
            />
          )}
          mobileCardComponent={renderMobileCard}
          keyField="id"
          minHeight="auto"
          hidePagination={filteredVariants.length <= 15}
          emptyTitle="No variants available for this supplier or filters"
          emptySubtitle="Try resetting filters or adding a new variant for this product."
        />
      )}

      {/* 🌐 Flexible Multi-Supplier & Format Share Drawer */}
      <ShareProductMonographDrawer
        isOpen={shareDrawerConfig.isOpen}
        onClose={() => setShareDrawerConfig({ isOpen: false, supplierKey: null })}
        product={selectedProduct}
        initialSupplierKey={shareDrawerConfig.supplierKey}
      />
    </div>
  );
}
