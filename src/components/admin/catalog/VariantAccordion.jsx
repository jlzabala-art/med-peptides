"use client";

import React, { useState, useMemo } from 'react';
import DataTable from '../../ui/DataTable';
import SegmentedControl from '../../ui/SegmentedControl';
import CurrencySelector from '../../ui/CurrencySelector';
import MobileVariantCard from './MobileVariantCard';
import VariantTimelinePanel from './VariantTimelinePanel';
import { COMMERCIAL_CHANNELS } from '../../../utils/commercialPricingHelper';
import { ChevronDown, ChevronRight, Building2, Layers, ListFilter, ShieldCheck, FileText, Share2, Download, DollarSign, TrendingUp, Clock, Zap } from 'lucide-react';

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

  // 1. Group variants by supplier, sort variants within each group ascending by dosage
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

    // Sort variants within each supplier: ascending by dosage (lowest first)
    map.forEach(group => {
      group.variants.sort((a, b) => parseDosageMg(a) - parseDosageMg(b));
    });

    // Sort supplier groups: ascending by number of variants (fewest first)
    return Array.from(map.values()).sort((a, b) => {
      const diff = a.variants.length - b.variants.length;
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });
  }, [typeFilteredVariants, resolveSupplierName]);

  // 2. Filtered variants based on supplier filter tab
  const filteredVariants = useMemo(() => {
    if (selectedSupplierFilter === 'all') return typeFilteredVariants;
    return typeFilteredVariants.filter(v => {
      const suppName = resolveSupplierName ? resolveSupplierName(v) : (v.supplierName || v.supplier || '');
      const key = v.supplierId || suppName;
      return key === selectedSupplierFilter || suppName === selectedSupplierFilter;
    });
  }, [typeFilteredVariants, selectedSupplierFilter, resolveSupplierName]);

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
          {/* Left: Volume / Weight Range selector ONLY when not in mixed all-view */}
          {(!hasMixedTypes || variantTypeFilter !== 'all') ? (
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

      {/* Supplier Filter Pills */}
      {supplierGroups.length > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}>
          <button
            onClick={() => setSelectedSupplierFilter('all')}
            style={{
              padding: '0.3rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: selectedSupplierFilter === 'all' ? 700 : 500,
              borderRadius: '9999px',
              border: selectedSupplierFilter === 'all' ? '1px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
              backgroundColor: selectedSupplierFilter === 'all' ? 'var(--color-primary, #003666)' : '#fff',
              color: selectedSupplierFilter === 'all' ? '#fff' : '#475569',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <span>All Suppliers</span>
            <span style={{
              fontSize: '0.68rem',
              opacity: selectedSupplierFilter === 'all' ? 0.9 : 0.6,
              padding: '0 4px',
              borderRadius: '10px',
              backgroundColor: selectedSupplierFilter === 'all' ? 'rgba(255,255,255,0.25)' : '#f1f5f9'
            }}>
              {typeFilteredVariants.length}
            </span>
          </button>
          {supplierGroups.map(group => {
            const isSelected = selectedSupplierFilter === group.key;
            return (
              <button
                key={group.key}
                onClick={() => setSelectedSupplierFilter(prev => prev === group.key ? 'all' : group.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? 700 : 500,
                  borderRadius: '9999px',
                  border: isSelected ? '1px solid var(--color-primary, #003666)' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? 'var(--color-primary, #003666)' : '#fff',
                  color: isSelected ? '#fff' : '#475569',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{group.name}</span>
                <span style={{
                  fontSize: '0.68rem',
                  opacity: isSelected ? 0.9 : 0.6,
                  padding: '0 4px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9'
                }}>
                  {group.variants.length}
                </span>
                {group.hasCOA && <ShieldCheck size={12} style={{ color: isSelected ? '#86efac' : '#10b981' }} />}
              </button>
            );
          })}
        </div>
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
                  {/* Supplier Header */}
                  <div
                    onClick={() => toggleSupplierCollapse(group.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.625rem 1rem',
                      backgroundColor: '#f8fafc',
                      borderBottom: isCollapsed ? 'none' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ color: isCollapsed ? '#94a3b8' : '#003666', display: 'flex', alignItems: 'center' }}>
                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                      </span>
                      <Building2 size={16} style={{ color: 'var(--color-primary, #003666)' }} />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                        {group.name}
                      </span>
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
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#64748b',
                        backgroundColor: '#e2e8f0',
                        padding: '2px 8px',
                        borderRadius: '9999px'
                      }}>
                        {group.variants.length} {group.variants.length === 1 ? 'variant' : 'variants'}
                      </span>
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
    </div>
  );
}
