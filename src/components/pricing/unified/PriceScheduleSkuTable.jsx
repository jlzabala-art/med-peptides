'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  FileDown,
  FileText,
  Snowflake,
  Copy,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import CopyableId from '@/components/ui/CopyableId';
import TabSkeleton from '@/components/ui/TabSkeleton';
import InlineEditableCell from '@/components/ui/InlineEditableCell';
import EmptyState from '@/components/ui/EmptyState';
import ProductDetailInline from './ProductDetailInline';

import {
  fetchGroupProductsWithCache,
  updateScheduleProductCost,
  updateScheduleProductStock,
} from '@/hooks/pricing/usePriceSchedulesData';
import { exportPriceSchedulePdf } from '@/utils/exportPriceSchedulePdf';

/**
 * PriceScheduleSkuTable
 * ─────────────────────────────────────────────────────────────────────────────
 * Live SKU DataTable for an active Price Schedule catalog.
 * Golden Rules Compliance: #1, #2, #3, #4, #5, #8, #11, #20, #23, #30.
 */
export default function PriceScheduleSkuTable({
  group,
  tier,
  effectiveTier = tier,
  priceFor,
  formatPrice,
  isAdmin,
  searchQuery = '',
  selectedBrand = 'all',
  onBrandChange,
  selectedSubcategory = 'all',
  onSubcategoryChange,
  coldChainOnly = false,
  inStockOnly = false,
  onClearFilters,
  onStatsChange,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  const loadProducts = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const items = await fetchGroupProductsWithCache(group.id, group.fetchGroup, {
        forceRefresh,
        isAdmin,
      });
      setProducts(items);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [group.id, group.fetchGroup, isAdmin]);

  useEffect(() => {
    setSelectedIds([]);
    loadProducts(false);
  }, [loadProducts]);

  // Distinct brand/manufacturer categories in catalog
  const availableBrands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.brand) set.add(p.brand);
      else if (p.manufacturer) set.add(p.manufacturer.split(' ')[0]);
    });
    return Array.from(set).sort();
  }, [products]);

  // Distinct clinical subcategories (e.g. Biostimulators, Fine Lines, Polynucleotides)
  const availableSubcategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      if (p.subcategory) set.add(p.subcategory);
    });
    return Array.from(set).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;

    if (selectedBrand && selectedBrand !== 'all') {
      list = list.filter(
        (p) =>
          p.brand === selectedBrand ||
          p.manufacturer?.toLowerCase().includes(selectedBrand.toLowerCase())
      );
    }

    if (selectedSubcategory && selectedSubcategory !== 'all') {
      list = list.filter((p) => p.subcategory === selectedSubcategory);
    }

    if (coldChainOnly) {
      list = list.filter((p) => Boolean(p.requiresColdChain));
    }

    if (inStockOnly) {
      list = list.filter((p) => Boolean(p.inStock));
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;

    return list.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.canonicalName || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.manufacturer || '').toLowerCase().includes(q) ||
        (p.indication || '').toLowerCase().includes(q) ||
        (p.technology || '').toLowerCase().includes(q) ||
        (p.subcategory || '').toLowerCase().includes(q) ||
        (p.packSize || '').toLowerCase().includes(q) ||
        (p.dosage || '').toLowerCase().includes(q)
    );
  }, [products, searchQuery, selectedBrand, selectedSubcategory, coldChainOnly, inStockOnly]);

  // Report live stats to parent KPI strip
  useEffect(() => {
    if (!onStatsChange) return;
    const inStockCount = filtered.filter((p) => p.inStock).length;
    const coldChainCount = filtered.filter((p) => p.requiresColdChain).length;
    const prices = filtered
      .map((p) => {
        const r = priceFor(p);
        if (effectiveTier === 'clinic') return r.clinicPrice ?? p.pricing?.clinicPrice ?? r.price;
        return r.wholesalePrice ?? p.pricing?.wholesalePrice ?? r.price;
      })
      .filter((v) => typeof v === 'number' && !Number.isNaN(v) && v > 0);

    onStatsChange({
      totalCount: products.length,
      filteredCount: filtered.length,
      inStockCount,
      coldChainCount,
      brandsCount: availableBrands.length,
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    });
  }, [filtered, products.length, availableBrands.length, effectiveTier, priceFor, onStatsChange]);

  // Inline Cost Update (Admin only -> Firestore SSOT)
  const handleSaveCost = useCallback(async (row, newCost) => {
    const parsed = Number(newCost);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast.error('Please enter a valid positive cost');
      return;
    }
    const updated = await updateScheduleProductCost(row, parsed, group.id);
    setProducts((prev) =>
      prev.map((item) =>
        item.id === row.id
          ? {
              ...item,
              cost: updated.cost,
              pricing: updated.pricing,
              wholesalePrice: updated.pricing.wholesalePrice,
              clinicPrice: updated.pricing.clinicPrice,
            }
          : item
      )
    );
    toast.success(`Updated cost & tier cascade for ${row.name || row.id} ✓`);
  }, [group.id]);

  // Inline Stock Toggle (Admin only -> Firestore SSOT)
  const handleToggleStock = useCallback(async (row) => {
    try {
      const nextStock = !row.inStock;
      await updateScheduleProductStock(row, nextStock, group.id);
      setProducts((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, inStock: nextStock, status: nextStock ? 'published' : 'draft' }
            : item
        )
      );
      toast.success(`${row.name || row.id} marked as ${nextStock ? 'Active' : 'Draft'} ✓`);
    } catch (err) {
      toast.error(err?.message || 'Failed to update availability');
    }
  }, [group.id]);

  // Export CSV
  const handleExportCsv = useCallback(() => {
    try {
      const targetRows = selectedIds.length
        ? filtered.filter((p) => selectedIds.includes(p.id))
        : filtered;

      const showAdminCols = effectiveTier === 'admin';
      const headers = ['Code/SKU', 'Product Name', 'Brand', 'Presentation', 'Availability'];
      if (showAdminCols) {
        headers.push(`Cost (${group.currency})`, `Mediluxe +15%`, `Wholesale ×1.3225`, `Clinic +45%`);
      } else {
        headers.push(`Price (${group.currency})`);
      }

      const rows = targetRows.map((p) => {
        const resolved = priceFor(p);
        const cost = resolved.costPrice ?? (p.price ? +(p.price / 1.3225).toFixed(2) : 0);
        const mediluxe = resolved.mediluxePrice ?? +(cost * 1.15).toFixed(2);
        const wholesale = resolved.wholesalePrice ?? +(cost * 1.3225).toFixed(2);
        const clinic = resolved.clinicPrice ?? +(cost * 1.45).toFixed(2);

        const rowData = [
          `"${p.id || ''}"`,
          `"${(p.name || p.canonicalName || '').replace(/"/g, '""')}"`,
          `"${(p.brand || p.manufacturer || '').replace(/"/g, '""')}"`,
          `"${(p.packSize || p.dosage || 'Standard').replace(/"/g, '""')}"`,
          p.inStock ? 'Active' : 'Draft',
        ];
        if (showAdminCols) {
          rowData.push(cost, mediluxe, wholesale, clinic);
        } else {
          rowData.push(effectiveTier === 'clinic' ? clinic : wholesale);
        }
        return rowData.join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${group.id}_price_schedule_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Exported ${targetRows.length} SKUs to CSV ✓`);
    } catch {
      toast.error('Failed to export CSV');
    }
  }, [filtered, selectedIds, effectiveTier, group.currency, group.id, priceFor]);

  // Export PDF
  const handleExportPdf = useCallback((onlySelected = false) => {
    const targetRows = onlySelected && selectedIds.length
      ? filtered.filter((p) => selectedIds.includes(p.id))
      : filtered;

    exportPriceSchedulePdf({
      group,
      products: targetRows,
      tier: effectiveTier,
      priceFor,
      formatPrice,
      brandFilter: selectedBrand,
      isSelection: onlySelected && selectedIds.length > 0,
    });
    toast.success(`Downloaded PDF for ${targetRows.length} SKUs ✓`);
  }, [filtered, selectedIds, group, effectiveTier, priceFor, formatPrice, selectedBrand]);

  // Copy Quick Quote for WhatsApp / Email
  const handleCopyQuote = useCallback(() => {
    const targetRows = filtered.filter((p) => selectedIds.includes(p.id));
    if (!targetRows.length) return;

    const quoteTier = effectiveTier === 'clinic' ? 'clinic' : 'wholesale';
    let total = 0;
    const lines = targetRows.map((p) => {
      const r = priceFor(p);
      const unitPrice =
        quoteTier === 'clinic'
          ? (r.clinicPrice ?? p.pricing?.clinicPrice ?? r.price ?? 0)
          : (r.wholesalePrice ?? p.pricing?.wholesalePrice ?? r.price ?? 0);
      total += Number(unitPrice) || 0;
      const pres = p.packSize || p.dosage || '';
      return `• ${p.name || p.id}${pres ? ` (${pres})` : ''} — ${formatPrice(unitPrice, group.currency)}`;
    });

    const header = `*Atlas Health Services — ${group.label} Quote (${quoteTier.toUpperCase()} TIER)*`;
    const footer = `\n*Estimated Subtotal (1× each): ${formatPrice(total, group.currency)}*`;
    navigator.clipboard.writeText(`${header}\n\n${lines.join('\n')}${footer}`);
    toast.success(`Copied ${targetRows.length}-SKU quote to clipboard ✓`);
  }, [filtered, selectedIds, effectiveTier, priceFor, formatPrice, group.currency, group.label]);

  const showAdminWaterfall = isAdmin && effectiveTier === 'admin';

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'id',
        label: 'Code / SKU',
        width: showAdminWaterfall ? '15%' : '18%',
        render: (val, row) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <CopyableId value={row.id} />
            {row.requiresColdChain && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  width: 'fit-content',
                  fontSize: 10,
                  fontWeight: 700,
                  color: '#0369a1',
                  background: '#e0f2fe',
                  border: '1px solid #bae6fd',
                  padding: '1px 6px',
                  borderRadius: 10,
                }}
                title="Cold Chain 2°C – 8°C Required"
              >
                <Snowflake size={10} />
                <span>2–8°C</span>
              </span>
            )}
          </div>
        ),
      },
      {
        key: 'name',
        label: 'Product & Presentation',
        width: showAdminWaterfall ? '27%' : '44%',
        render: (val, row) => (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', lineHeight: 1.3 }}>
              {row.name || row.canonicalName || row.id}
            </div>
            {(row.packSize || row.dosage) && (
              <div style={{ fontSize: 11, color: '#475569', marginTop: 2, fontWeight: 500 }}>
                {row.packSize || row.dosage}
              </div>
            )}
            {(row.brand || row.subcategory) && (
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>
                {[row.brand, row.subcategory].filter(Boolean).join(' · ')}
              </div>
            )}
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Availability',
        width: showAdminWaterfall ? '11%' : '16%',
        render: (val, row) =>
          showAdminWaterfall ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStock(row);
              }}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              title="Click to toggle availability in Firestore"
            >
              <StatusBadge status={row.inStock ? 'active' : 'draft'} />
            </button>
          ) : (
            <StatusBadge status={row.inStock ? 'active' : 'draft'} />
          ),
      },
    ];

    if (showAdminWaterfall) {
      cols.push(
        {
          key: 'adminCost',
          label: 'Cost / Mediluxe (+15%)',
          width: '17%',
          render: (val, row) => {
            const resolved = priceFor(row);
            const cost = resolved.costPrice ?? (row.price ? +(row.price / 1.3225).toFixed(2) : null);
            const mediluxe = resolved.mediluxePrice ?? (cost ? +(cost * 1.15).toFixed(2) : null);
            return (
              <div style={{ fontSize: 11 }} onClick={(e) => e.stopPropagation()}>
                <InlineEditableCell
                  value={cost ?? ''}
                  type="number"
                  format={(v) => (
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>
                      {formatPrice(Number(v), group.currency)}
                    </span>
                  )}
                  onSave={(newVal) => handleSaveCost(row, newVal)}
                />
                <div style={{ color: '#15803d', fontWeight: 600, marginTop: 2 }}>
                  Mediluxe: {formatPrice(mediluxe, group.currency)}
                </div>
              </div>
            );
          },
        },
        {
          key: 'wholesalePrice',
          label: 'Wholesale (×1.3225)',
          width: '15%',
          render: (val, row) => {
            const resolved = priceFor(row);
            const wholesale =
              resolved.wholesalePrice ??
              row.pricing?.wholesalePrice ??
              (resolved.costPrice ? +(resolved.costPrice * 1.3225).toFixed(2) : row.price);
            return (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0369a1' }}>
                  {formatPrice(wholesale, group.currency)}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Public / WS</div>
              </div>
            );
          },
        },
        {
          key: 'clinicPrice',
          label: 'Clinic (+45%)',
          width: '15%',
          render: (val, row) => {
            const resolved = priceFor(row);
            const clinic =
              resolved.clinicPrice ??
              row.pricing?.clinicPrice ??
              (resolved.costPrice ? +(resolved.costPrice * 1.45).toFixed(2) : null);
            return (
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0d9488' }}>
                  {formatPrice(clinic, group.currency)}
                </div>
                <div style={{ fontSize: 10, color: '#64748b' }}>Medical Practice</div>
              </div>
            );
          },
        }
      );
    } else {
      cols.push({
        key: 'price',
        label:
          effectiveTier === 'clinic'
            ? 'Clinic / Doctor Price (+45%)'
            : 'Wholesale Price (Cost × 1.3225)',
        width: '22%',
        render: (val, row) => {
          const resolved = priceFor(row);
          const amount =
            effectiveTier === 'clinic'
              ? (resolved.clinicPrice ?? row.pricing?.clinicPrice ?? resolved.price ?? row.price)
              : (resolved.wholesalePrice ?? row.pricing?.wholesalePrice ?? resolved.price ?? row.price);
          return (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                {formatPrice(amount, group.currency)}
              </div>
              <div style={{ fontSize: 10, color: '#0284c7', fontWeight: 600 }}>
                {effectiveTier === 'clinic' ? 'Clinic Tier' : 'Wholesale Tier'}
              </div>
            </div>
          );
        },
      });
    }

    return cols;
  }, [
    showAdminWaterfall,
    effectiveTier,
    group.currency,
    priceFor,
    formatPrice,
    handleSaveCost,
    handleToggleStock,
  ]);

  return (
    <div style={{ marginTop: 16 }}>
      {/* Header controls: Live SKU Count + Brand/Category Quick Filters + Exports */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 12,
        paddingBottom: 10,
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Live References ({filtered.length} SKUs)
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            · Currency: <strong>{group.currency}</strong>
          </span>
          <span style={{
            fontSize: 11,
            color: 'var(--color-primary, #003666)',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: '1px 8px',
            borderRadius: 12,
            fontWeight: 600,
          }}>
            Click any row for specs
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => loadProducts(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Force refresh from Firestore"
          >
            <RefreshCw size={13} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Export filtered references to CSV"
          >
            <FileDown size={13} color="#0284c7" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={() => handleExportPdf(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Download filtered PDF price schedule"
          >
            <FileText size={13} color="#d97706" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Brand Filters if multiple brands in group */}
      {availableBrands.length > 1 && onBrandChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginRight: 4 }}>Brand:</span>
          <button
            type="button"
            onClick={() => onBrandChange('all')}
            style={{
              padding: '3px 10px',
              borderRadius: 16,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedBrand === 'all' ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
              background: selectedBrand === 'all' ? 'var(--color-primary, #003666)' : '#fff',
              color: selectedBrand === 'all' ? '#fff' : '#475569',
            }}
          >
            All Brands
          </button>
          {availableBrands.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onBrandChange(b)}
              style={{
                padding: '3px 10px',
                borderRadius: 16,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedBrand === b ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
                background: selectedBrand === b ? 'var(--color-primary, #003666)' : '#fff',
                color: selectedBrand === b ? '#fff' : '#475569',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {/* Clinical Subcategory Filter (when available, e.g. aesthetic-injectables) */}
      {availableSubcategories.length > 1 && onSubcategoryChange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginRight: 4 }}>Indication:</span>
          <select
            value={selectedSubcategory}
            onChange={(e) => onSubcategoryChange(e.target.value)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 11,
              fontWeight: 600,
              color: '#334155',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Clinical Indications ({availableSubcategories.length})</option>
            {availableSubcategories.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <TabSkeleton lines={6} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={ExternalLink}
          title="Live catalog synced in dedicated workspace"
          subtitle="Real-time catalog synchronization for this specialized line is active in the dedicated workspace."
          action={{
            label: 'Open Dedicated Price List',
            onClick: () => window.open(group.route, '_blank', 'noopener,noreferrer'),
          }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No matching SKUs for active filters"
          subtitle="Try clearing the search query, brand, or clinical indication filters."
          action={onClearFilters ? { label: 'Clear Filters', onClick: onClearFilters } : undefined}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          initialRowsPerPage={15}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          renderBatchActions={(ids) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>
                {ids.length} SKUs selected
              </span>
              <button
                type="button"
                onClick={handleCopyQuote}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #bae6fd',
                  background: '#f0f9ff',
                  color: '#0369a1',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Copy size={12} />
                <span>Copy Quote ({effectiveTier === 'clinic' ? 'Clinic' : 'Wholesale'})</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportPdf(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <FileText size={12} color="#d97706" />
                <span>Export Selected PDF</span>
              </button>
            </div>
          )}
          expandableRender={(row) => (
            <ProductDetailInline
              row={row}
              group={group}
              effectiveTier={effectiveTier}
              priceFor={priceFor}
              formatPrice={formatPrice}
            />
          )}
        />
      )}
    </div>
  );
}
