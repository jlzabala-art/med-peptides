'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Printer,
  Share2,
  Copy,
  Check,
  Download,
  Building2,
  ShieldCheck,
  Sparkles,
  FlaskConical,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Layers,
  Search,
  Filter,
  Package,
  Calendar,
  AlertCircle,
  FileText,
  BadgeCheck,
  MessageCircle,
  ArrowRight,
  Sliders,
  DollarSign,
  Coins
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import CopyableId from '@/components/ui/CopyableId';

export default function ColwayPriceListClient({ initialProducts = [] }) {
  const [markupPct, setMarkupPct] = useState(15); // Default 15% requested by user
  const [currency, setCurrency] = useState('AED'); // AED, USD, EUR
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [scopeMode, setScopeMode] = useState('global'); // 'global' | 'filtered' (Rule #22 Scope Switcher)
  const [copied, setCopied] = useState(false);

  // Automatically default to card view on mobile screens (Golden Rule #23)
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewMode('cards');
    }
  }, []);

  // FX peg rates for UAE: 1 USD = 3.6725 AED, 1 EUR ~ 3.98 AED
  const fxRate = useMemo(() => {
    if (currency === 'USD') return 1 / 3.6725;
    if (currency === 'EUR') return 1 / 3.98;
    return 1;
  }, [currency]);

  const currencySymbol = useMemo(() => {
    if (currency === 'USD') return '$';
    if (currency === 'EUR') return '€';
    return 'AED ';
  }, [currency]);

  const formatPrice = useCallback((aedAmount) => {
    if (aedAmount == null || isNaN(aedAmount)) return '—';
    const converted = aedAmount * fxRate;
    return `${currencySymbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }, [currencySymbol, fxRate]);

  // Filtered and calculated products based on dynamic markup
  const processedProducts = useMemo(() => {
    return initialProducts.map((p, index) => {
      const landed = p.landedCostAed || 0;
      // Dynamic wholesale calculation: Landed Cost * (1 + markup / 100)
      const wholesale = Number((landed * (1 + markupPct / 100)).toFixed(2));
      const marginAed = Number((wholesale - landed).toFixed(2));
      const marginPctVal = wholesale > 0 ? Number(((marginAed / wholesale) * 100).toFixed(1)) : 0;

      return {
        ...p,
        itemNumber: index + 1,
        calculatedLanded: landed,
        calculatedWholesale: wholesale,
        calculatedMarginAed: marginAed,
        calculatedMarginPct: marginPctVal
      };
    });
  }, [initialProducts, markupPct]);

  const filteredProducts = useMemo(() => {
    return processedProducts.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.keyActives && p.keyActives.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat =
        selectedCategory === 'all' ||
        (p.category && p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

      return matchesSearch && matchesCat;
    });
  }, [processedProducts, searchQuery, selectedCategory]);

  const hasActiveFilters = Boolean(searchQuery || selectedCategory !== 'all');
  const kpiSourceProducts = (scopeMode === 'filtered' && hasActiveFilters) ? filteredProducts : processedProducts;

  // Aggregate Totals (respecting Scope Switcher per Rule #22)
  const totals = useMemo(() => {
    const totalLanded = kpiSourceProducts.reduce((sum, p) => sum + p.calculatedLanded, 0);
    const totalWholesale = kpiSourceProducts.reduce((sum, p) => sum + p.calculatedWholesale, 0);
    const totalMargin = Number((totalWholesale - totalLanded).toFixed(2));
    const avgMarginPct = totalWholesale > 0 ? Number(((totalMargin / totalWholesale) * 100).toFixed(1)) : 0;
    return { totalLanded, totalWholesale, totalMargin, avgMarginPct, count: kpiSourceProducts.length };
  }, [kpiSourceProducts]);

  const categories = useMemo(() => {
    const cats = new Set(initialProducts.map((p) => p.category).filter(Boolean));
    return ['all', ...Array.from(cats)];
  }, [initialProducts]);

  // DataTable column definitions (Rules #3, #11, #30: explicit percentage widths, zero horizontal scroll)
  const colwayColumns = useMemo(() => [
    {
      key: 'itemNumber',
      label: '#',
      width: '5%',
      sortable: true,
      render: (val) => <span className="font-mono text-xs text-slate-500">{val}</span>
    },
    {
      key: 'sku',
      label: 'SKU Code',
      width: '14%',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <CopyableId value={val} />
          <span className="product-category-tag">{row.category}</span>
        </div>
      )
    },
    {
      key: 'name',
      label: 'Product & Clinical Indication',
      width: '31%',
      sortable: true,
      render: (_, row) => (
        <div className="product-identity-cell">
          {row.image && (
            <img
              src={row.image}
              alt={row.name}
              className="product-thumb"
              loading="lazy"
            />
          )}
          <div>
            <div className="product-name font-bold">{row.name}</div>
            <div className="product-subtitle text-xs text-slate-500">{row.subtitle}</div>
            {row.keyActives && (
              <div className="product-actives text-xs text-sky-700 mt-0.5">
                <span className="font-semibold">Actives:</span> {row.keyActives}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'volume',
      label: 'Presentation',
      width: '11%',
      sortable: true,
      render: (val, row) => (
        <div>
          <span className="volume-badge">{val}</span>
          <div className="text-xs text-slate-400 mt-0.5">{row.presentation}</div>
        </div>
      )
    },
    {
      key: 'calculatedLanded',
      label: 'Landed Cost',
      width: '10%',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-semibold text-slate-700">{formatPrice(val)}</span>
      )
    },
    {
      key: 'calculatedWholesale',
      label: `Wholesale (+${markupPct}%)`,
      width: '11%',
      sortable: true,
      render: (val) => (
        <span className="font-mono font-bold text-sky-700">{formatPrice(val)}</span>
      )
    },
    {
      key: 'calculatedMarginAed',
      label: 'Margin',
      width: '9%',
      sortable: true,
      render: (val, row) => (
        <div className="font-mono text-emerald-600">
          <div>+{formatPrice(val)}</div>
          <div className="text-xs text-emerald-500 font-sans">({row.calculatedMarginPct}%)</div>
        </div>
      )
    },
    {
      key: 'retailPriceAed',
      label: 'MSRP / Clinic',
      width: '9%',
      sortable: true,
      render: (val, row) => (
        <div className="font-mono text-xs">
          <div className="font-bold text-slate-800" title="Recommended Retail Price">{formatPrice(val)}</div>
          <div className="text-slate-500" title="Recommended Clinic Price">Clinic: {formatPrice(row.clinicPriceAed)}</div>
        </div>
      )
    }
  ], [formatPrice, markupPct]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Colway Price Sheet link copied to clipboard ✓');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `*COLWAY MEDICAL & CELLULAR COSMECEUTICALS — UAE PRICE SCHEDULE*\n` +
      `Official Landed Costs & 15% Wholesaler Pricing Schedule (Dubai CIF):\n\n` +
      processedProducts.map(p => `• ${p.name} (${p.volume}): AED ${p.calculatedWholesale.toFixed(2)} [Landed: AED ${p.calculatedLanded}]`).join('\n') +
      `\n\nFull official datasheet & print-ready schedule:\n${typeof window !== 'undefined' ? window.location.href : 'https://www.atlashealth-services.com/pricing/colway'}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="colway-price-root">
      {/* ── Screen-Only Interactive Navigation Bar ── */}
      <nav className="screen-nav-bar no-print">
        <div className="nav-container">
          <div className="nav-left">
            <Link href="/" className="nav-brand">
              <FlaskConical size={18} className="text-cyan-400" />
              <span>ATLAS BIOPHARMA</span>
            </Link>
            <span className="nav-divider">/</span>
            <span className="nav-section">B2B Wholesale</span>
            <span className="nav-divider">/</span>
            <span className="nav-current">Colway UAE Price Schedule</span>
          </div>

          <div className="nav-actions">
            <div className="currency-selector">
              <span className="control-label">Currency:</span>
              <div className="pill-group">
                {['AED', 'USD', 'EUR'].map((cur) => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    className={`pill-btn ${currency === cur ? 'pill-active' : ''}`}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCopyLink} className="action-btn action-ghost" title="Copy shareable link">
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy Link'}</span>
            </button>

            <button onClick={handleWhatsAppShare} className="action-btn action-whatsapp" title="Share via WhatsApp">
              <MessageCircle size={16} />
              <span>Share</span>
            </button>

            <button onClick={handlePrint} className="action-btn action-primary" title="Print this Price Sheet">
              <Printer size={16} />
              <span>Print Price Sheet</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="price-sheet-container">
        {/* ── Document Official Header ── */}
        <header className="document-header">
          <div className="header-meta-row">
            <div className="institutional-identity">
              <div className="brand-pairing">
                <div className="brand-pill-atlas">ATLAS HEALTH</div>
                <span className="partner-cross">×</span>
                <div className="brand-pill-colway">COLWAY CLINICAL DERMA</div>
              </div>
              <h1 className="document-title">
                COLWAY CLINICAL CELLULAR & TRICHOLOGY PORTFOLIO
              </h1>
              <p className="document-subtitle">
                Official UAE Landed Cost & Wholesaler Price Schedule · Biologically Active Collagen & Peptides
              </p>
            </div>

            <div className="document-stamp-box">
              <div className="stamp-item">
                <span className="stamp-label">DOCUMENT REF:</span>
                <span className="stamp-value font-mono">DOC-UAE-COL-2026-V1</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">TERRITORY:</span>
                <span className="stamp-value">United Arab Emirates (Dubai / GCC)</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">PRICING BASIS:</span>
                <span className="stamp-value">Landed Cost CIF Dubai (excl. 5% VAT)</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">CONFIGURED MARKUP:</span>
                <span className="stamp-value text-emerald-600 font-bold">+{markupPct}% Wholesaler Tier</span>
              </div>
              <div className="stamp-item">
                <span className="stamp-label">EFFECTIVE DATE:</span>
                <span className="stamp-value">October 2026 · Active & Verified</span>
              </div>
            </div>
          </div>

          <div className="regulatory-banner">
            <div className="regulatory-item">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span><strong>Native Tropocollagen:</strong> Intact triple-helix conformation preserved &lt;26°C</span>
            </div>
            <div className="regulatory-item">
              <BadgeCheck size={14} className="text-sky-500" />
              <span><strong>Origin:</strong> European Union (Poland) · ISO 22716 / cGMP Certified</span>
            </div>
            <div className="regulatory-item">
              <FileText size={14} className="text-amber-500" />
              <span><strong>Tax Compliance:</strong> Prices net of 5% UAE VAT (FTA Compliant)</span>
            </div>
          </div>
        </header>

        {/* ── Scope Indicator & Switcher (Golden Rule #22) ── */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '3px 10px', borderRadius: '999px', border: '1px solid #e2e8f0' }}>
            {scopeMode === 'filtered' && hasActiveFilters
              ? `Matching Active Filters (${filteredProducts.length} items)`
              : `Entire Database (Unfiltered · ${processedProducts.length} items)`}
          </span>
          {hasActiveFilters && (
            <div style={{ display: 'inline-flex', gap: '4px', background: '#f1f5f9', padding: '2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setScopeMode('filtered')}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: scopeMode === 'filtered' ? '#0284c7' : 'transparent',
                  color: scopeMode === 'filtered' ? '#fff' : '#475569'
                }}
              >
                Applied Filters View
              </button>
              <button
                type="button"
                onClick={() => setScopeMode('global')}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  background: scopeMode === 'global' ? '#0284c7' : 'transparent',
                  color: scopeMode === 'global' ? '#fff' : '#475569'
                }}
              >
                Global Database View
              </button>
            </div>
          )}
        </div>

        {/* ── KPI Summary Cards (GCP Style — Rule #22) ── */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-blue-500/10 text-blue-500">
              <Package size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Active Formulations</div>
              <div className="kpi-value">{totals.count} Clinical SKUs</div>
              <div className="kpi-sub">Trichology, Anti-Aging & Barrier Care</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Wholesaler Markup</div>
              <div className="kpi-value text-emerald-600">+{markupPct}.0%</div>
              <div className="kpi-sub">Average Margin: {totals.avgMarginPct}% on gross revenue</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-indigo-500/10 text-indigo-500">
              <Coins size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Portfolio Landed Value</div>
              <div className="kpi-value">{formatPrice(totals.totalLanded)}</div>
              <div className="kpi-sub">Total CIF Dubai landed acquisition cost</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon-wrap bg-sky-500/10 text-sky-500">
              <Percent size={20} />
            </div>
            <div className="kpi-info">
              <div className="kpi-label">Portfolio Wholesale Value</div>
              <div className="kpi-value text-sky-600">{formatPrice(totals.totalWholesale)}</div>
              <div className="kpi-sub">Net Profit / Unit Basket: {formatPrice(totals.totalMargin)}</div>
            </div>
          </div>
        </section>

        {/* ── Unified GlobalSearchBar + Category Chips & Controls (Rules #7 & #24) ── */}
        <div className="no-print" style={{ marginBottom: '1rem' }}>
          <GlobalSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search Colway formulations by product name, SKU, or active ingredient..."
            resultCount={filteredProducts.length}
            totalCount={processedProducts.length}
            size="lg"
            storageNamespace="colway_uae_pricing"
            filters={categories.filter(c => c !== 'all').map(cat => ({
              key: cat,
              label: cat,
              active: selectedCategory === cat,
              onToggle: () => setSelectedCategory(prev => prev === cat ? 'all' : cat)
            }))}
          />
        </div>

        <div className="controls-strip no-print">
          <div className="controls-left">
            <div className="category-chips">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat === 'all' ? 'All Formulations' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="controls-right">
            {/* Markup Slider / Presets */}
            <div className="markup-simulator">
              <span className="slider-label">Wholesale Markup:</span>
              <div className="markup-presets">
                {[10, 15, 20, 25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setMarkupPct(rate)}
                    className={`preset-btn ${markupPct === rate ? 'active' : ''}`}
                  >
                    +{rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* View Switcher */}
            <div className="view-switcher">
              <button
                onClick={() => setViewMode('table')}
                className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                title="Table View (Ideal for print and order placement)"
              >
                <FileText size={15} />
                <span>Table</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                title="Card View (Visual catalog overview)"
              >
                <Layers size={15} />
                <span>Visual</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── 1A. Screen-Only Unified DataTable (Rules #3, #4, #11, #30) ── */}
        {viewMode === 'table' && (
          <div className="no-print" style={{ marginBottom: '1.5rem' }}>
            <DataTable
              columns={colwayColumns}
              data={filteredProducts}
              emptyMessage="No Colway formulations match the current filter criteria."
              expandableRender={(row) => (
                <div style={{ padding: '0.85rem 1.25rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Key Bioactive Compounds</div>
                    <div style={{ color: '#475569' }}>{row.keyActives || 'Native Tropocollagen & Clinical Actives'}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Clinical Role & Protocol</div>
                    <div style={{ color: '#475569' }}>{row.clinicalFocus || row.subtitle}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Commercial Tier Breakdown</div>
                    <div style={{ color: '#475569' }}>
                      Landed CIF: <strong>{formatPrice(row.calculatedLanded)}</strong> · Wholesale (+{markupPct}%): <strong>{formatPrice(row.calculatedWholesale)}</strong> · Clinic: <strong>{formatPrice(row.clinicPriceAed)}</strong> · MSRP: <strong>{formatPrice(row.retailPriceAed)}</strong>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* ── 1B. Print-Only Official Schedule Table (Preserved for A4 @media print) ── */}
        <div className="table-responsive-wrapper print-only-schedule">
          {/* eslint-disable-next-line no-restricted-syntax */}
          <table className="colway-price-table">
              <thead>
                <tr>
                  <th style={{ width: '4%' }} className="text-center">#</th>
                  <th style={{ width: '12%' }}>SKU Code</th>
                  <th style={{ width: '28%' }}>Product & Clinical Indication</th>
                  <th style={{ width: '10%' }}>Presentation</th>
                  <th style={{ width: '11%' }} className="text-right">
                    Landed Cost <span className="th-sub">(Excl. VAT)</span>
                  </th>
                  <th style={{ width: '12%' }} className="text-right th-highlight">
                    Wholesale (+{markupPct}%) <span className="th-sub">(B2B Net)</span>
                  </th>
                  <th style={{ width: '10%' }} className="text-right">
                    Margin <span className="th-sub">(AED / %)</span>
                  </th>
                  <th style={{ width: '11%' }} className="text-right">
                    Clinic Price <span className="th-sub">(Rec.)</span>
                  </th>
                  <th style={{ width: '12%' }} className="text-right">
                    MSRP / Retail <span className="th-sub">(Rec.)</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="product-row">
                    <td className="text-center text-muted font-mono">{p.itemNumber}</td>
                    
                    <td>
                      <div className="sku-badge">
                        <span className="font-mono text-xs">{p.sku}</span>
                      </div>
                      <div className="product-category-tag">{p.category}</div>
                    </td>

                    <td>
                      <div className="product-identity-cell">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="product-thumb"
                            loading="lazy"
                          />
                        )}
                        <div>
                          <div className="product-name font-bold">{p.name}</div>
                          <div className="product-subtitle text-xs text-slate-500">{p.subtitle}</div>
                          {p.keyActives && (
                            <div className="product-actives text-xs text-sky-700 dark:text-sky-400 mt-0.5">
                              <span className="font-semibold">Actives:</span> {p.keyActives}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="volume-badge">{p.volume}</span>
                      <div className="text-xs text-slate-400 mt-0.5">{p.presentation}</div>
                    </td>

                    {/* Landed Cost (Input from user) */}
                    <td className="text-right font-mono landed-cost-cell">
                      {formatPrice(p.calculatedLanded)}
                    </td>

                    {/* Wholesaler Price (+15%) */}
                    <td className="text-right font-mono font-bold wholesale-cell">
                      {formatPrice(p.calculatedWholesale)}
                    </td>

                    {/* Wholesaler Margin */}
                    <td className="text-right font-mono text-emerald-600">
                      <div>+{formatPrice(p.calculatedMarginAed)}</div>
                      <div className="text-xs text-emerald-500 font-sans">({p.calculatedMarginPct}%)</div>
                    </td>

                    {/* Clinic Price */}
                    <td className="text-right font-mono text-slate-600">
                      {formatPrice(p.clinicPriceAed)}
                    </td>

                    {/* Retail / MSRP */}
                    <td className="text-right font-mono font-semibold text-slate-800">
                      {formatPrice(p.retailPriceAed)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="totals-row">
                  <td colSpan="4" className="text-right font-bold uppercase tracking-wider text-xs">
                    Portfolio Aggregate Basket (1 Unit of Each SKU):
                  </td>
                  <td className="text-right font-mono font-bold">
                    {formatPrice(totals.totalLanded)}
                  </td>
                  <td className="text-right font-mono font-bold text-sky-600">
                    {formatPrice(totals.totalWholesale)}
                  </td>
                  <td className="text-right font-mono font-bold text-emerald-600">
                    <div>+{formatPrice(totals.totalMargin)}</div>
                    <div className="text-xs font-normal">({totals.avgMarginPct}% avg)</div>
                  </td>
                  <td colSpan="2" className="text-right text-xs text-slate-500">
                    UAE Mainland & Free Zone Distribution
                  </td>
                </tr>
              </tfoot>
            </table>
        </div>

        {/* ── 2. Visual Product Cards Grid (Optional Screen View) ── */}
        {viewMode === 'cards' && (
          <div className="product-cards-grid no-print">
            {filteredProducts.map((p) => (
              <div key={p.id} className="product-card">
                <div className="card-image-wrap">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="card-product-img" />
                  ) : (
                    <div className="card-placeholder-img">
                      <Package size={32} className="text-slate-400" />
                    </div>
                  )}
                  <span className="card-category-badge">{p.category}</span>
                </div>

                <div className="card-body">
                  <div className="card-sku font-mono">{p.sku}</div>
                  <h3 className="card-title">{p.name}</h3>
                  <p className="card-subtitle">{p.subtitle}</p>

                  <div className="card-actives">
                    <strong>Actives:</strong> {p.keyActives}
                  </div>

                  <div className="card-clinical-focus">
                    <strong>Clinical Role:</strong> {p.clinicalFocus}
                  </div>

                  <div className="card-pricing-strip">
                    <div className="price-item">
                      <span className="price-item-label">Landed CIF</span>
                      <span className="price-item-val font-mono">{formatPrice(p.calculatedLanded)}</span>
                    </div>
                    <div className="price-item highlight">
                      <span className="price-item-label">Wholesale (+{markupPct}%)</span>
                      <span className="price-item-val font-mono text-sky-600 font-bold">{formatPrice(p.calculatedWholesale)}</span>
                    </div>
                    <div className="price-item">
                      <span className="price-item-label">MSRP (Rec.)</span>
                      <span className="price-item-val font-mono">{formatPrice(p.retailPriceAed)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Commercial & Logistics Terms Block ── */}
        <section className="terms-block">
          <h2 className="terms-title">
            <Building2 size={16} className="text-slate-600" />
            <span>Commercial Terms, Logistics & Ordering Protocol (UAE)</span>
          </h2>
          
          <div className="terms-columns">
            <div className="terms-col">
              <h4 className="terms-subheading">1. Taxation & Customs (FTA Compliance)</h4>
              <p>
                All prices quoted in this schedule are <strong>exclusive of 5% United Arab Emirates Value Added Tax (VAT)</strong>. 
                VAT will be added to the final commercial tax invoice in accordance with UAE Federal Decree-Law No. (8) of 2017. 
                Landed costs incorporate international air freight, UAE customs clearance, and refrigerated customs inspection charges.
              </p>
            </div>

            <div className="terms-col">
              <h4 className="terms-subheading">2. Cold-Chain & Product Integrity</h4>
              <p>
                Colway’s patented native fish tropocollagen is biologically active and maintains its helical tertiary structure 
                at temperatures up to 26°C (78.8°F). Stock is stored in climate-controlled pharmaceutical warehousing in Dubai 
                and dispatched via temperature-monitored vehicles across the UAE.
              </p>
            </div>

            <div className="terms-col">
              <h4 className="terms-subheading">3. Fulfillment & Minimum Order Quantity (MOQ)</h4>
              <p>
                Orders placed before 12:00 PM GST qualify for same-day delivery within Dubai and Sharjah. Delivery to Abu Dhabi, 
                Al Ain, Ras Al Khaimah, and Fujairah is completed within 24–48 hours. Flexible clinical trial quantities 
                are available for verified medical institutions with no minimum order surcharge.
              </p>
            </div>

            <div className="terms-col">
              <h4 className="terms-subheading">4. Invoicing & Wholesale Orders</h4>
              <p>
                Authorized distributor: <strong>Atlas Biopharma Middle East FZ-LLC</strong>, Dubai Science Park / Meydan Free Zone. 
                Payment terms: Advance corporate wire transfer or corporate credit card in AED. 
                For customized commercial distribution or private clinic bulk orders, contact wholesale procurement directly.
              </p>
            </div>
          </div>

          <div className="print-footer-signature">
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-text">Authorized Officer · Atlas Biopharma Distribution</div>
            </div>
            <div className="sig-block">
              <div className="sig-line"></div>
              <div className="sig-text">Approved Receiving Physician / Pharmacy Director</div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Scoped Styling with High-End Screen Aesthetics & Print Isolation ── */}
      <style jsx>{`
        .colway-price-root {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: #f8fafc;
          color: #0f172a;
          min-height: 100vh;
        }

        /* ── Screen Navigation Bar ── */
        .screen-nav-bar {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          color: #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.75rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .nav-left {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
        }
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.05em;
          text-decoration: none;
        }
        .nav-divider {
          color: #475569;
        }
        .nav-section {
          color: #94a3b8;
        }
        .nav-current {
          color: #38bdf8;
          font-weight: 600;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .currency-selector {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: #94a3b8;
        }
        .pill-group {
          display: flex;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 2px;
        }
        .pill-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pill-btn.pill-active {
          background: #38bdf8;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
        }
        .action-ghost {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
        }
        .action-ghost:hover {
          background: rgba(255, 255, 255, 0.16);
        }
        .action-whatsapp {
          background: #059669;
          color: #ffffff;
        }
        .action-whatsapp:hover {
          background: #047857;
        }
        .action-primary {
          background: #0284c7;
          color: #ffffff;
          box-shadow: 0 2px 4px rgba(2, 132, 199, 0.3);
        }
        .action-primary:hover {
          background: #0369a1;
        }

        /* ── Main Sheet Container ── */
        .price-sheet-container {
          max-width: 1280px;
          margin: 1.5rem auto 3rem auto;
          padding: 0 1.5rem;
        }

        /* ── Institutional Header ── */
        .document-header {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.75rem 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }
        .header-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .brand-pairing {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.75rem;
        }
        .brand-pill-atlas {
          background: #0f172a;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.08em;
        }
        .partner-cross {
          color: #94a3b8;
          font-weight: 700;
          font-size: 0.85rem;
        }
        .brand-pill-colway {
          background: #0284c7;
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.08em;
        }
        .document-title {
          font-size: 1.5rem;
          font-weight: 850;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
          letter-spacing: -0.01em;
        }
        .document-subtitle {
          font-size: 0.88rem;
          color: #64748b;
          margin: 0;
        }

        .document-stamp-box {
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.9rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 290px;
        }
        .stamp-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          gap: 1rem;
        }
        .stamp-label {
          color: #64748b;
          font-weight: 600;
        }
        .stamp-value {
          color: #0f172a;
          font-weight: 600;
        }

        .regulatory-banner {
          margin-top: 1.25rem;
          padding-top: 1rem;
          border-top: 1px dashed #e2e8f0;
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .regulatory-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #475569;
        }

        /* ── KPI Grid ── */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .kpi-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .kpi-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .kpi-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }
        .kpi-value {
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
          margin: 2px 0;
        }
        .kpi-sub {
          font-size: 0.72rem;
          color: #94a3b8;
        }

        /* ── Controls Strip ── */
        .controls-strip {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .controls-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          flex: 1;
        }
        .search-box {
          position: relative;
          min-width: 260px;
        }
        :global(.search-icon) {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .search-input {
          width: 100%;
          padding: 6px 28px 6px 32px;
          font-size: 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          outline: none;
          transition: border-color 0.15s ease;
        }
        .search-input:focus {
          border-color: #0284c7;
        }
        .clear-btn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-size: 1rem;
        }
        .category-chips {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .category-chip {
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .category-chip:hover {
          background: #f1f5f9;
        }
        .category-chip.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        .controls-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .markup-simulator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
        }
        .slider-label {
          color: #64748b;
          font-weight: 600;
        }
        .markup-presets {
          display: flex;
          gap: 2px;
          background: #f1f5f9;
          padding: 2px;
          border-radius: 6px;
        }
        .preset-btn {
          border: none;
          background: transparent;
          font-size: 0.72rem;
          font-weight: 700;
          color: #64748b;
          padding: 3px 8px;
          border-radius: 4px;
          cursor: pointer;
        }
        .preset-btn.active {
          background: #16a34a;
          color: #ffffff;
        }

        .view-switcher {
          display: flex;
          background: #f1f5f9;
          padding: 2px;
          border-radius: 6px;
        }
        .view-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          padding: 4px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .view-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
        }

        /* ── Table Styling ── */
        .table-responsive-wrapper {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }
        .colway-price-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .colway-price-table thead tr {
          background: #0f172a;
          color: #f8fafc;
        }
        .colway-price-table th {
          padding: 12px 14px;
          font-size: 0.72rem;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #334155;
          vertical-align: middle;
        }
        .th-sub {
          display: block;
          font-size: 0.62rem;
          font-weight: normal;
          color: #94a3b8;
          text-transform: none;
        }
        .th-highlight {
          background: #0369a1;
          color: #ffffff;
        }
        .th-highlight .th-sub {
          color: #bae6fd;
        }

        .colway-price-table tbody tr {
          border-bottom: 1px solid #e2e8f0;
          transition: background 0.1s ease;
        }
        .colway-price-table tbody tr:hover {
          background: #f8fafc;
        }
        .colway-price-table td {
          padding: 12px 14px;
          font-size: 0.82rem;
          vertical-align: middle;
        }

        .sku-badge {
          display: inline-flex;
          align-items: center;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 600;
          color: #334155;
        }
        .product-category-tag {
          font-size: 0.68rem;
          color: #64748b;
          margin-top: 3px;
        }

        .product-identity-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .product-thumb {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border-radius: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 2px;
          flex-shrink: 0;
        }
        .product-name {
          color: #0f172a;
          line-height: 1.25;
        }
        .volume-badge {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 700;
          background: #e0f2fe;
          color: #0369a1;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .landed-cost-cell {
          color: #475569;
          font-weight: 600;
        }
        .wholesale-cell {
          background: #f0fdf4;
          color: #065f46;
          font-size: 0.9rem;
        }

        .totals-row {
          background: #f8fafc;
          border-top: 2px solid #cbd5e1;
        }
        .totals-row td {
          padding: 14px;
        }

        /* ── Cards Grid ── */
        .product-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .product-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
        }
        .card-image-wrap {
          height: 160px;
          background: #f1f5f9;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .card-product-img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .card-category-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(15, 23, 42, 0.85);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 4px;
        }
        .card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .card-sku {
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 4px;
        }
        .card-title {
          font-size: 1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px 0;
        }
        .card-subtitle {
          font-size: 0.78rem;
          color: #64748b;
          margin: 0 0 0.75rem 0;
        }
        .card-actives, .card-clinical-focus {
          font-size: 0.74rem;
          color: #475569;
          margin-bottom: 0.5rem;
          line-height: 1.35;
        }
        .card-pricing-strip {
          margin-top: auto;
          display: flex;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.75rem;
          justify-content: space-between;
        }
        .price-item {
          display: flex;
          flex-direction: column;
          font-size: 0.72rem;
        }
        .price-item-label {
          color: #64748b;
          font-size: 0.65rem;
        }
        .price-item-val {
          font-weight: 700;
          font-size: 0.85rem;
          color: #0f172a;
        }
        .price-item.highlight .price-item-val {
          font-size: 0.95rem;
        }

        /* ── Commercial Terms ── */
        .terms-block {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 1.5rem 1.75rem;
          margin-top: 1.5rem;
        }
        .terms-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .terms-columns {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.5rem;
        }
        .terms-col p {
          font-size: 0.75rem;
          line-height: 1.5;
          color: #475569;
          margin: 0;
        }
        .terms-subheading {
          font-size: 0.78rem;
          font-weight: 750;
          color: #0f172a;
          margin: 0 0 0.35rem 0;
        }

        .print-footer-signature {
          display: none;
        }

        /* ═══════════════════════════════════════════════════════════════
           RESPONSIVE ADAPTATIONS (Laptop & Mobile UX - Golden Rule #23)
           ═══════════════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .price-sheet-container {
            padding: 1rem 0.75rem 6rem;
          }
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .document-header {
            padding: 1.25rem;
          }
          .colway-price-table th,
          .colway-price-table td {
            padding: 0.65rem 0.6rem;
            font-size: 0.76rem;
          }
        }

        @media (max-width: 768px) {
          .colway-topbar-inner {
            padding: 0.6rem 0.75rem;
          }
          .topbar-actions {
            width: 100%;
            justify-content: flex-end;
          }
          .header-meta-row {
            flex-direction: column;
            gap: 1rem;
          }
          .document-stamp-box {
            width: 100%;
            min-width: unset;
          }
          .kpi-grid {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }
          .kpi-card {
            padding: 0.85rem 1rem;
          }
          .kpi-value {
            font-size: 1.25rem;
          }
          .controls-row {
            flex-direction: column;
            align-items: stretch;
            gap: 0.85rem;
          }
          .controls-row-right {
            width: 100%;
            justify-content: space-between;
          }
          .search-input-wrapper {
            width: 100%;
            min-width: unset;
          }
          .category-pills-bar {
            overflow-x: auto;
            flex-wrap: nowrap;
            padding-bottom: 4px;
            -webkit-overflow-scrolling: touch;
          }
          .category-pill {
            white-space: nowrap;
          }
          .table-responsive-wrapper {
            border-radius: 8px;
            -webkit-overflow-scrolling: touch;
          }
          .floating-action-bar {
            padding: 0.6rem 0.75rem;
            flex-wrap: wrap;
            justify-content: center;
          }
          .floating-action-bar-inner {
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.5rem;
            width: 100%;
          }
          .cards-grid {
            grid-template-columns: 1fr;
          }
          .terms-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .kpi-grid {
            grid-template-columns: 1fr;
          }
          .document-title {
            font-size: 1.2rem;
          }
          .regulatory-banner {
            flex-direction: column;
            gap: 0.5rem;
          }
        }

        .print-only-schedule {
          display: none;
        }

        /* ═══════════════════════════════════════════════════════════════
           PRINT OPTIMIZATION ENGINE (@media print)
           ═══════════════════════════════════════════════════════════════ */
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm 10mm;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only-schedule {
            display: block !important;
          }
          .colway-price-root {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .price-sheet-container {
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .document-header {
            border: 1px solid #000000 !important;
            box-shadow: none !important;
            padding: 10px 14px !important;
            margin-bottom: 10px !important;
            border-radius: 4px !important;
          }
          .document-title {
            font-size: 1.25rem !important;
            color: #000000 !important;
          }
          .brand-pill-atlas {
            background: #000000 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .brand-pill-colway {
            background: #0284c7 !important;
            color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .document-stamp-box {
            border: 1px solid #94a3b8 !important;
            background: #f8fafc !important;
            padding: 6px 10px !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .kpi-grid {
            gap: 8px !important;
            margin-bottom: 10px !important;
          }
          .kpi-card {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 10px !important;
            box-shadow: none !important;
          }
          .kpi-value {
            font-size: 1.1rem !important;
          }
          .table-responsive-wrapper {
            border: 1px solid #000000 !important;
            box-shadow: none !important;
            border-radius: 4px !important;
            margin-bottom: 10px !important;
          }
          .colway-price-table th {
            background: #1e293b !important;
            color: #ffffff !important;
            font-size: 7.5pt !important;
            padding: 6px 8px !important;
            border-bottom: 1px solid #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .th-highlight {
            background: #0369a1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .colway-price-table td {
            font-size: 7.5pt !important;
            padding: 6px 8px !important;
            border-bottom: 1px solid #cbd5e1 !important;
            color: #000000 !important;
          }
          .product-thumb {
            width: 30px !important;
            height: 30px !important;
          }
          .wholesale-cell {
            background: #e2f2e6 !important;
            font-weight: bold !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .totals-row td {
            background: #f1f5f9 !important;
            font-size: 8pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .terms-block {
            border: 1px solid #94a3b8 !important;
            box-shadow: none !important;
            padding: 8px 12px !important;
            margin-top: 10px !important;
            page-break-inside: avoid !important;
          }
          .terms-columns {
            gap: 12px !important;
          }
          .terms-col p {
            font-size: 6.5pt !important;
            line-height: 1.3 !important;
          }
          .terms-subheading {
            font-size: 7pt !important;
          }
          .print-footer-signature {
            display: flex !important;
            justify-content: space-around !important;
            margin-top: 25px !important;
            padding-top: 10px !important;
          }
          .sig-block {
            width: 40% !important;
            text-align: center !important;
          }
          .sig-line {
            border-top: 1px solid #000000 !important;
            margin-bottom: 4px !important;
          }
          .sig-text {
            font-size: 7pt !important;
            color: #334155 !important;
          }
        }
      `}</style>
    </div>
  );
}
