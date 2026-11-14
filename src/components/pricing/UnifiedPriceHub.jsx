'use client';

/**
 * components/pricing/UnifiedPriceHub.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Price Hub — Single consolidated entry point for ALL B2B price schedules.
 *
 * Golden Rules Compliance:
 *  #2  – Firestore-first via 4-layer cache (usePriceSchedulesData)
 *  #3  – All tabular data via DataTable (DataTable.jsx)
 *  #4  – Master-Detail inline expansion (ProductDetailInline.jsx)
 *  #6  – GlobalSearchBar with ⌘K keyboard shortcut
 *  #7  – Search-First positioning (Single unified GlobalSearchBar)
 *  #8  – StatusBadge for availability
 *  #9  – Fixed PageHeader with primary actions
 *  #11 – CopyableId for product codes / SKUs
 *  #17 – Breadcrumb navigation in detail view
 *  #22 – 4 Contextual KPIs + Scope Switcher
 *  #23 – Mobile-first responsive layout
 *  #24/#29 – Active filters synced with URL params
 *  #30 – Zero horizontal scrolling; proportional column widths
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  Package, List, ShieldCheck, Tag, ExternalLink,
  Share2, Users, FileText, ChevronDown, Layers, X, Lock, Calculator,
  Snowflake, Eye, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader          from '@/components/ui/PageHeader';
import GlobalSearchBar     from '@/components/ui/GlobalSearchBar';
import MetricCard          from '@/components/ui/MetricCard';
import KpiScopeBar         from '@/components/ui/KpiScopeBar';
import Breadcrumb          from '@/components/ui/Breadcrumb';
import GcpUserBadge        from '@/components/shared/GcpUserBadge';

import { usePriceTier, TIER_COLORS, TIER_LABELS } from '@/hooks/pricing/usePriceTier';
import {
  usePriceSchedulesData,
  MACRO_CATEGORIES,
  TOTAL_SKUS,
  fetchGroupProductsWithCache
} from '@/hooks/pricing/usePriceSchedulesData';
import { exportPriceSchedulePdf } from '@/utils/exportPriceSchedulePdf';

import PriceSchedulesOverviewTable from './unified/PriceSchedulesOverviewTable';
import PriceScheduleSkuTable      from './unified/PriceScheduleSkuTable';
import ShareTrackingModal         from './unified/ShareTrackingModal';
import PublicLinkShareModal       from './unified/PublicLinkShareModal';
import MarginSimulatorDrawer      from './unified/MarginSimulatorDrawer';

// ─── Tier Badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier, tierLabel }) {
  const colors = TIER_COLORS[tier] || TIER_COLORS.guest;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 20,
      background: colors.bg, border: `1px solid ${colors.border}`,
      color: colors.text, fontWeight: 700, fontSize: 11,
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot || colors.text }} />
      {tierLabel}
    </span>
  );
}

// ─── Auth Notice Banner ───────────────────────────────────────────────────────

function AuthBanner({ tier, isAuthenticated }) {
  if (isAuthenticated && tier !== 'guest') return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      padding: '10px 16px', borderRadius: 10, margin: '0 0 16px 0',
      background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e',
      fontSize: 13, lineHeight: 1.4,
    }}>
      <Lock size={16} style={{ flexShrink: 0 }} />
      <span>
        <strong>Viewing public wholesale prices</strong> — standard distributor rates (cost + 15% Atlas + 15% Wholesaler = cost × 1.3225).{' '}
        <Link href="/auth/login" style={{ color: '#d97706', fontWeight: 700, textDecoration: 'underline' }}>
          Log in
        </Link>{' '}
        to unlock your clinic or contract-specific pricing tier.
      </span>
    </div>
  );
}

// ─── Main Unified Price Hub Component ─────────────────────────────────────────

export default function UnifiedPriceHub({
  embedded = false,
  defaultGroup = null,
}) {
  const { tier, tierLabel, tierColor, isAuthenticated, isAdmin, priceFor, formatPrice } = usePriceTier();
  const { schedules } = usePriceSchedulesData();

  const [activeGroupId, setActiveGroupId] = useState(defaultGroup || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeMode, setScopeMode] = useState('filtered');
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // SKU-level filters (when inside a specific catalog tab)
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [coldChainOnly, setColdChainOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewAsTier, setViewAsTier] = useState(null); // null = use real user tier
  const [skuStats, setSkuStats] = useState(null);

  // Modals & Drawers
  const [selectedShareGroup, setSelectedShareGroup] = useState(null);
  const [shareWebModalGroup, setShareWebModalGroup] = useState(null);
  const [simulatorGroup, setSimulatorGroup] = useState(null);

  const effectiveTier = isAdmin && viewAsTier ? viewAsTier : tier;
  const effectiveTierLabel = TIER_LABELS[effectiveTier] || tierLabel;

  // Helper to sync query params cleanly
  const syncUrlParams = useCallback((updates = {}) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || v === 'all' || v === false) {
        url.searchParams.delete(k);
      } else {
        url.searchParams.set(k, String(v));
      }
    });
    window.history.replaceState(null, '', url.toString());
  }, []);

  // Hydrate initial state from URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const tab = url.searchParams.get('tab') || url.searchParams.get('group');
    if (tab && (tab === 'all' || schedules.some((g) => g.id === tab))) {
      setActiveGroupId(tab);
    }
    const q = url.searchParams.get('q');
    if (q) setSearchQuery(q);
    const brand = url.searchParams.get('brand');
    if (brand) setSelectedBrand(brand);
    const sub = url.searchParams.get('sub');
    if (sub) setSelectedSubcategory(sub);
    if (url.searchParams.get('cold') === '1') setColdChainOnly(true);
    if (url.searchParams.get('stock') === '1') setInStockOnly(true);
    const t = url.searchParams.get('tier');
    if (t && ['admin', 'wholesaler', 'clinic', 'guest'].includes(t)) setViewAsTier(t);
  }, [schedules]);

  const handleSelectGroup = useCallback((groupId) => {
    setActiveGroupId(groupId);
    setSelectedBrand('all');
    setSelectedSubcategory('all');
    setColdChainOnly(false);
    setInStockOnly(false);
    setSkuStats(null);
    syncUrlParams({
      tab: groupId === 'all' ? null : groupId,
      brand: null,
      sub: null,
      cold: null,
      stock: null,
    });
  }, [syncUrlParams]);

  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    syncUrlParams({ q: val || null });
  }, [syncUrlParams]);

  const handleBrandChange = useCallback((brand) => {
    setSelectedBrand(brand);
    syncUrlParams({ brand: brand === 'all' ? null : brand });
  }, [syncUrlParams]);

  const handleSubcategoryChange = useCallback((sub) => {
    setSelectedSubcategory(sub);
    syncUrlParams({ sub: sub === 'all' ? null : sub });
  }, [syncUrlParams]);

  const handleClearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCurrencyFilter('all');
    setSelectedCategoryFilter('all');
    setSelectedBrand('all');
    setSelectedSubcategory('all');
    setColdChainOnly(false);
    setInStockOnly(false);
    syncUrlParams({ q: null, brand: null, sub: null, cold: null, stock: null });
  }, [syncUrlParams]);

  const selectedGroup = useMemo(() => {
    if (activeGroupId === 'all') return null;
    return schedules.find((g) => g.id === activeGroupId) || null;
  }, [activeGroupId, schedules]);

  // Filtered schedules (when viewing all catalogs)
  const filteredGroups = useMemo(() => {
    let list = schedules;
    if (selectedCurrencyFilter !== 'all') {
      list = list.filter((g) => g.currency === selectedCurrencyFilter);
    }
    if (selectedCategoryFilter !== 'all') {
      const cat = MACRO_CATEGORIES.find((c) => c.id === selectedCategoryFilter);
      if (cat && cat.groupIds) {
        list = list.filter((g) => cat.groupIds.includes(g.id));
      }
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter((g) =>
      g.label.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.supplier.toLowerCase().includes(q) ||
      g.badge.toLowerCase().includes(q) ||
      g.currency.toLowerCase().includes(q)
    );
  }, [schedules, searchQuery, selectedCurrencyFilter, selectedCategoryFilter]);

  // Contextual KPIs (Golden Rule #22)
  const kpis = useMemo(() => {
    if (selectedGroup) {
      const totalInCatalog = skuStats?.totalCount ?? selectedGroup.skuCount;
      const filteredInCatalog = skuStats?.filteredCount ?? totalInCatalog;
      const shownCount = scopeMode === 'filtered' ? filteredInCatalog : totalInCatalog;
      const rangeText =
        skuStats?.minPrice != null && skuStats?.maxPrice != null
          ? `${formatPrice(skuStats.minPrice, selectedGroup.currency)} – ${formatPrice(skuStats.maxPrice, selectedGroup.currency)}`
          : selectedGroup.currency;

      return [
        {
          title: 'Active SKUs',
          value: shownCount,
          subtitle: `${skuStats?.brandsCount || 1} manufacturers · ${selectedGroup.label}`,
          icon: Package,
          color: '#0284c7',
        },
        {
          title: 'Stock & Cold Chain',
          value: `${skuStats?.inStockCount ?? shownCount} / ${shownCount}`,
          subtitle: `${skuStats?.coldChainCount ?? 0} require 2°C–8°C cold chain`,
          icon: Snowflake,
          color: '#0d9488',
        },
        {
          title: 'Active Tier View',
          value: effectiveTierLabel.split(' ')[0],
          subtitle: viewAsTier ? `Previewing as ${effectiveTier}` : effectiveTierLabel,
          icon: ShieldCheck,
          color: (TIER_COLORS[effectiveTier] || tierColor).text,
        },
        {
          title: `Price Range (${selectedGroup.currency})`,
          value: rangeText,
          subtitle: effectiveTier === 'clinic' ? 'Clinic tier (+45%)' : 'Wholesale tier (×1.3225)',
          icon: DollarSign,
          color: '#7c3aed',
        },
      ];
    }

    const activeLists = schedules.filter((g) => g.status === 'active').length;
    const displayLists = scopeMode === 'filtered' ? filteredGroups.length : schedules.length;
    const displaySkus = scopeMode === 'filtered'
      ? filteredGroups.reduce((sum, g) => sum + (g.skuCount || 0), 0)
      : TOTAL_SKUS;

    return [
      { title: 'Total SKUs', value: displaySkus, subtitle: `across ${displayLists} catalogs`, icon: Package, color: '#0284c7' },
      { title: 'Price Lists', value: displayLists, subtitle: `${activeLists} active schedules`, icon: List, color: '#0d9488' },
      { title: 'Your Tier', value: tierLabel.split(' ')[0], subtitle: tierLabel, icon: ShieldCheck, color: tierColor.text },
      { title: 'Formula Base', value: 'Cost + 15% + 15%', subtitle: 'Wholesale = Cost × 1.3225', icon: Tag, color: '#7c3aed' },
    ];
  }, [
    selectedGroup,
    skuStats,
    scopeMode,
    effectiveTier,
    effectiveTierLabel,
    viewAsTier,
    tierColor,
    formatPrice,
    schedules,
    filteredGroups,
    tierLabel,
  ]);

  const scopeCounts = selectedGroup
    ? { filtered: skuStats?.filteredCount ?? selectedGroup.skuCount, total: skuStats?.totalCount ?? selectedGroup.skuCount }
    : { filtered: filteredGroups.length, total: schedules.length };

  // Active Filter Chips for GlobalSearchBar (Golden Rule #7 & #24)
  const activeSearchFilters = useMemo(() => {
    const chips = [];
    if (selectedGroup) {
      if (selectedBrand !== 'all') {
        chips.push({ key: 'brand', label: 'Brand', value: selectedBrand, onRemove: () => handleBrandChange('all') });
      }
      if (selectedSubcategory !== 'all') {
        chips.push({ key: 'sub', label: 'Indication', value: selectedSubcategory, onRemove: () => handleSubcategoryChange('all') });
      }
      if (coldChainOnly) {
        chips.push({
          key: 'cold',
          label: 'Storage',
          value: 'Cold Chain 2–8°C',
          onRemove: () => { setColdChainOnly(false); syncUrlParams({ cold: null }); },
        });
      }
      if (inStockOnly) {
        chips.push({
          key: 'stock',
          label: 'Availability',
          value: 'In Stock Only',
          onRemove: () => { setInStockOnly(false); syncUrlParams({ stock: null }); },
        });
      }
    } else {
      if (selectedCurrencyFilter !== 'all') {
        chips.push({ key: 'currency', label: 'Currency', value: selectedCurrencyFilter, onRemove: () => setSelectedCurrencyFilter('all') });
      }
      if (selectedCategoryFilter !== 'all') {
        const cat = MACRO_CATEGORIES.find((c) => c.id === selectedCategoryFilter);
        chips.push({ key: 'category', label: 'Category', value: cat?.label || selectedCategoryFilter, onRemove: () => setSelectedCategoryFilter('all') });
      }
    }
    return chips;
  }, [
    selectedGroup,
    selectedBrand,
    selectedSubcategory,
    coldChainOnly,
    inStockOnly,
    selectedCurrencyFilter,
    selectedCategoryFilter,
    handleBrandChange,
    handleSubcategoryChange,
    syncUrlParams,
  ]);

  // Real PDF export handler
  const handleGeneratePdf = useCallback(async (group) => {
    const toastId = toast.loading(`Building official PDF for ${group.label}...`);
    try {
      const items = await fetchGroupProductsWithCache(group.id, group.fetchGroup, { isAdmin });
      exportPriceSchedulePdf({
        group,
        products: items,
        tier: effectiveTier,
        priceFor,
        formatPrice,
      });
      toast.success(`PDF downloaded for ${group.label} ✓`, { id: toastId });
    } catch {
      toast.error('Failed to generate PDF', { id: toastId });
    }
  }, [isAdmin, effectiveTier, priceFor, formatPrice]);

  const handleCopyPublicWebLink = useCallback((group) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${group.route}`;
      navigator.clipboard.writeText(url);
      toast.success(`Public link for ${group.label} copied to clipboard ✓`);
    }
  }, []);

  const handleWhatsAppShare = useCallback((group) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${group.route}`;
      const msg = `Hello, please find the official B2B price schedule for ${group.label} (${group.badge}):\n${url}\n\nIssued by Atlas Health Services · Precision Medicine.`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* ── Page Header (Golden Rule #9, #16) ── */}
      {!embedded && (
        <PageHeader
          title="Unified B2B Price Hub"
          subtitle={`Single authoritative entry point for all ${schedules.length} product groups with authenticated tier pricing.`}
          actions={<GcpUserBadge />}
        />
      )}

      {/* ── Auth Banner ── */}
      <AuthBanner tier={tier} isAuthenticated={isAuthenticated} />

      {/* ── KPI Strip (Golden Rule #22) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 12, marginBottom: 14,
      }}>
        {kpis.map((k) => (
          <MetricCard
            key={k.title}
            title={k.title}
            value={k.value}
            subtitle={k.subtitle}
            icon={k.icon}
            color={k.color}
          />
        ))}
      </div>

      {/* ── Scope Switcher ── */}
      <KpiScopeBar
        scopeMode={scopeMode}
        onScopeModeChange={setScopeMode}
        filteredCount={scopeCounts.filtered}
        totalCount={scopeCounts.total}
        entityLabel={selectedGroup ? 'SKUs' : 'price lists'}
        style={{ marginBottom: 14 }}
      />

      {/* ── Single Unified Global Search Bar (Golden Rule #6, #7) ── */}
      <GlobalSearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder={
          selectedGroup
            ? `Search ${selectedGroup.label} SKUs, brands, indications or technologies…`
            : 'Search product lines, formulations, suppliers or categories…'
        }
        namespace={selectedGroup ? `price-schedule-${selectedGroup.id}` : 'price-schedules-hub'}
        size="lg"
        resultCount={selectedGroup ? scopeCounts.filtered : filteredGroups.length}
        filters={activeSearchFilters}
        style={{ marginBottom: 14 }}
      />

      {/* ── UNIFIED FILTER & NAVIGATION CONTROLS ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '18px',
        padding: '12px 16px',
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%',
        }}>
          {/* Catalog Direct Select Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Layers size={15} color="var(--color-primary, #003666)" />
              <span>Catalog:</span>
            </div>
            <select
              value={activeGroupId}
              onChange={(e) => handleSelectGroup(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                color: '#0f172a',
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '360px',
                width: '100%',
              }}
              title="Select specific catalog or view all"
            >
              <option value="all">All Catalogs ({schedules.length} B2B Schedules)</option>
              {schedules.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label} ({g.badge}) — {g.currency} · {g.supplier}
                </option>
              ))}
            </select>
          </div>

          {/* Right Controls: View-As-Tier (Admin) or Currency Switcher (Overview) */}
          {selectedGroup ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  const next = !coldChainOnly;
                  setColdChainOnly(next);
                  syncUrlParams({ cold: next ? '1' : null });
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: coldChainOnly ? '1px solid #0284c7' : '1px solid #cbd5e1',
                  background: coldChainOnly ? '#e0f2fe' : '#ffffff',
                  color: coldChainOnly ? '#0369a1' : '#475569',
                }}
              >
                <Snowflake size={12} />
                <span>Cold Chain</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const next = !inStockOnly;
                  setInStockOnly(next);
                  syncUrlParams({ stock: next ? '1' : null });
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: inStockOnly ? '1px solid #16a34a' : '1px solid #cbd5e1',
                  background: inStockOnly ? '#f0fdf4' : '#ffffff',
                  color: inStockOnly ? '#15803d' : '#475569',
                }}
              >
                <span>In Stock Only</span>
              </button>

              {isAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Eye size={13} color="#64748b" />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>View as:</span>
                  <select
                    value={viewAsTier || 'admin'}
                    onChange={(e) => {
                      const val = e.target.value === 'admin' ? null : e.target.value;
                      setViewAsTier(val);
                      syncUrlParams({ tier: val });
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                    title="Preview table as a specific commercial tier (hides internal costs)"
                  >
                    <option value="admin">Admin (Full Waterfall)</option>
                    <option value="wholesaler">Wholesaler (×1.3225)</option>
                    <option value="clinic">Clinic / Doctor (+45%)</option>
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Currency:</span>
              {[
                { id: 'all', label: 'All' },
                { id: 'USD', label: 'USD ($)' },
                { id: 'EUR', label: 'EUR (€)' },
                { id: 'AED', label: 'AED / QAR' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedCurrencyFilter(f.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: selectedCurrencyFilter === f.id ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
                    backgroundColor: selectedCurrencyFilter === f.id ? 'var(--color-primary, #003666)' : '#ffffff',
                    color: selectedCurrencyFilter === f.id ? '#ffffff' : '#475569',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Category Filter Pills (Overview Mode) */}
        {activeGroupId === 'all' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
              Filter by Category:
            </span>
            {MACRO_CATEGORIES.map((cat) => {
              const isActive = selectedCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    border: isActive ? '1px solid #0284c7' : '1px solid #e2e8f0',
                    backgroundColor: isActive ? '#f0f9ff' : '#ffffff',
                    color: isActive ? '#0369a1' : '#475569',
                  }}
                >
                  {cat.label}
                </button>
              );
            })}

            {(selectedCategoryFilter !== 'all' || selectedCurrencyFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#dc2626',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <X size={12} />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── VIEW MODE 1: Active Group Detail + Live SKU Table ── */}
      {selectedGroup ? (
        <div style={{
          background: 'var(--surface, #fff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 12,
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
        }}>
          {/* Standard Breadcrumb (Golden Rule #17) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <Breadcrumb
              items={[
                { label: 'Price Schedules', href: embedded ? '/admin/price-schedules' : '/pricing' },
                { label: `${selectedGroup.label} (${selectedGroup.badge})` },
              ]}
            />
            <button
              type="button"
              onClick={() => handleSelectGroup('all')}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: 'var(--color-primary, #003666)',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '1.25rem',
              }}
            >
              View All {schedules.length} Schedules
            </button>
          </div>

          {/* Header of Active Group with Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16, paddingBottom: 16,
            borderBottom: '1px solid var(--border, #e2e8f0)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <selectedGroup.icon size={22} color="#1d4ed8" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                    {selectedGroup.label}
                  </h2>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0284c7', background: '#f0f9ff', padding: '2px 8px', borderRadius: 12, border: '1px solid #bae6fd' }}>
                    {selectedGroup.badge}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>
                  {selectedGroup.description} · Supplier: <strong>{selectedGroup.supplier}</strong>
                </div>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <TierBadge tier={effectiveTier} tierLabel={effectiveTierLabel} />

              <button
                type="button"
                onClick={() => setSimulatorGroup(selectedGroup)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff', color: '#0284c7', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Calculator size={14} />
                <span>Simulate Margins</span>
              </button>

              <button
                type="button"
                onClick={() => handleGeneratePdf(selectedGroup)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff', color: '#334155', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <FileText size={14} color="#d97706" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setShareWebModalGroup(selectedGroup)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid #bae6fd',
                  backgroundColor: '#f0f9ff', color: '#0284c7', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Share2 size={14} />
                <span>Share Link</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedShareGroup(selectedGroup)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  padding: '6px 10px', borderRadius: '6px', border: '1px solid #bbf7d0',
                  backgroundColor: '#f0fdf4', color: '#166534', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Users size={13} />
                <span>{selectedGroup.sharesCount || 0} shares</span>
                <ChevronDown size={11} />
              </button>

              <Link
                href={selectedGroup.route}
                target="_blank"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  color: '#ffffff', background: 'var(--color-primary, #003666)', textDecoration: 'none',
                }}
              >
                <span>Full Workspace</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>

          {/* Pricing Formula Callout */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12, margin: '14px 0', padding: '10px 14px',
            background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
              <Tag size={14} className="text-sky-600" />
              <span>Commercial Formula: <strong>{selectedGroup.pricingNote}</strong></span>
            </div>
            <div style={{ color: '#64748b' }}>
              Native Currency: <strong>{selectedGroup.currency}</strong>
            </div>
          </div>

          {/* Live SKU DataTable */}
          <PriceScheduleSkuTable
            group={selectedGroup}
            tier={tier}
            effectiveTier={effectiveTier}
            priceFor={priceFor}
            formatPrice={formatPrice}
            isAdmin={isAdmin}
            searchQuery={searchQuery}
            selectedBrand={selectedBrand}
            onBrandChange={handleBrandChange}
            selectedSubcategory={selectedSubcategory}
            onSubcategoryChange={handleSubcategoryChange}
            coldChainOnly={coldChainOnly}
            inStockOnly={inStockOnly}
            onClearFilters={handleClearAllFilters}
            onStatsChange={setSkuStats}
          />
        </div>
      ) : (
        <PriceSchedulesOverviewTable
          schedules={filteredGroups}
          onSelectGroup={handleSelectGroup}
          onOpenShareModal={(group) => setShareWebModalGroup(group)}
          onOpenRecipientsModal={(group) => setSelectedShareGroup(group)}
          onOpenSimulator={(group) => setSimulatorGroup(group)}
          onGeneratePdf={handleGeneratePdf}
          onWhatsAppShare={handleWhatsAppShare}
          onClearFilters={handleClearAllFilters}
        />
      )}

      {/* ── MODALS & DRAWERS ── */}
      <ShareTrackingModal
        selectedShareGroup={selectedShareGroup}
        onClose={() => setSelectedShareGroup(null)}
        onOpenShareModal={(target) => setShareWebModalGroup(target)}
      />

      <PublicLinkShareModal
        group={shareWebModalGroup}
        onClose={() => setShareWebModalGroup(null)}
        onGeneratePdf={handleGeneratePdf}
        onCopyLink={handleCopyPublicWebLink}
        onWhatsAppShare={handleWhatsAppShare}
      />

      <MarginSimulatorDrawer
        group={simulatorGroup}
        onClose={() => setSimulatorGroup(null)}
      />

      {/* ── Tier Rules Footnote ── */}
      <div style={{
        marginTop: 28, padding: '16px 20px',
        background: '#f8fafc', borderRadius: 12,
        border: '1px solid #e2e8f0', fontSize: 12,
      }}>
        <div style={{ fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 10 }}>
          Authenticated Pricing Governance
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          {Object.entries(TIER_LABELS).map(([t, label]) => {
            const c = TIER_COLORS[t];
            const isCurrent = t === effectiveTier;
            return (
              <div key={t} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20,
                background: c.bg, border: `1px solid ${c.border}`,
                color: c.text, fontWeight: isCurrent ? 700 : 500, fontSize: 11,
              }}>
                {isCurrent && '✓ '}
                {label}
              </div>
            );
          })}
        </div>
        <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
          <strong>Unregistered visitors:</strong> Wholesale price (Cost × 1.15 Atlas × 1.15 Wholesaler = Cost × 1.3225).
          Raw laboratory supplier costs and margins remain strictly restricted.
        </div>
      </div>
    </div>
  );
}
