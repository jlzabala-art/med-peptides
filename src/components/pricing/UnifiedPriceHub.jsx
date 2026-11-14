'use client';

/**
 * components/pricing/UnifiedPriceHub.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Price Hub — Single consolidated entry point for ALL product group price schedules.
 *
 * Golden Rules compliance:
 *  #2  – Firestore-first via /api/catalog/public
 *  #3  – All tabular data via DataTable (DataTable.jsx)
 *  #7  – GlobalSearchBar always first
 *  #8  – StatusBadge for availability
 *  #11 – CopyableId for product codes / SKUs
 *  #22 – 4 KPIs + Scope Switcher
 *  #23 – Mobile-first (responsive columns)
 *  #30 – No horizontal scroll; explicit column widths
 *
 * Price Tier Rules:
 *  - Guest/anonymous → cost × 1.3225 (wholesaler public price = cost × 1.15 × 1.15)
 *  - Registered user → their tier from usePriceTier hook
 *  - Mediluxe staff  → sees cost, wholesale, clinic, and margin columns
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FlaskConical, Dna, Scissors, Package, Layers, TestTube,
  Activity, Microscope, ShieldCheck, Lock, Eye, ChevronRight,
  Tag, DollarSign, List, ExternalLink, ArrowRight, Building2,
  CheckCircle2, Sparkles, Filter, X
} from 'lucide-react';
import Link from 'next/link';

import PageHeader          from '@/components/ui/PageHeader';
import GlobalSearchBar     from '@/components/ui/GlobalSearchBar';
import MetricCard          from '@/components/ui/MetricCard';
import KpiScopeBar         from '@/components/ui/KpiScopeBar';
import DataTable           from '@/components/ui/DataTable';
import StatusBadge         from '@/components/ui/StatusBadge';
import CopyableId          from '@/components/ui/CopyableId';
import EmptyState          from '@/components/ui/EmptyState';
import ResponsiveTabs      from '@/components/ui/ResponsiveTabs';
import TabSkeleton         from '@/components/ui/TabSkeleton';
import GcpUserBadge        from '@/components/shared/GcpUserBadge';

import { usePriceTier, TIER_COLORS, TIER_LABELS } from '@/hooks/pricing/usePriceTier';

// ─── 12 Aggregated Price Groups Registry ──────────────────────────────────────

export const PRICE_GROUPS = [
  {
    id: 'peptides',
    label: 'Peptides',
    icon: FlaskConical,
    badge: '127 SKUs',
    supplier: 'NP Labs',
    description: 'Lyophilized bioactive peptides · HPLC ≥99% · Sterile analytical vials',
    pricingNote: 'Cost + 15% Mediluxe + 15% Wholesaler',
    route: '/pricing/peptides',
    skuCount: 127,
    currency: 'USD',
    fetchGroup: 'peptides',
    status: 'active',
  },
  {
    id: '24genetics',
    label: '24Genetics',
    icon: Dna,
    badge: '12 Kits',
    supplier: '24Genetics S.L.',
    description: 'CE-IVD saliva genomic panels + AI Connect subscriptions',
    pricingNote: 'Role-based: Retail / Clinic / Wholesale',
    route: '/pricing/24genetics',
    skuCount: 12,
    currency: 'EUR',
    fetchGroup: 'genomics',
    status: 'active',
  },
  {
    id: 'colway',
    label: 'Colway',
    icon: Package,
    badge: '8 Products',
    supplier: 'Colway International',
    description: 'Biologically active native collagen — complete dermatology portfolio',
    pricingNote: 'Cost + 20% Wholesale / 30% Clinic',
    route: '/pricing/colway',
    skuCount: 8,
    currency: 'EUR',
    fetchGroup: 'colway',
    status: 'active',
  },
  {
    id: 'colway-hair',
    label: 'Colway Hair',
    icon: Scissors,
    badge: 'Trichology',
    supplier: 'Colway International',
    description: 'Baicapil™ 2% shampoo + conditioner — anti-hair-loss follicular protocol',
    pricingNote: 'Cost + 20% Wholesale / 30% Clinic',
    route: '/pricing/colway-hair',
    skuCount: 2,
    currency: 'EUR',
    fetchGroup: 'colway-hair',
    status: 'active',
  },
  {
    id: 'colway-qatar',
    label: 'Colway Qatar',
    icon: Building2,
    badge: 'AED / QAR',
    supplier: 'Colway International',
    description: 'Qatar & GCC distributor pricing (AED/QAR)',
    pricingNote: 'Exclusive landed-cost schedule (112 QAR / unit)',
    route: '/pricing/colway-qatar',
    skuCount: 2,
    currency: 'AED',
    fetchGroup: 'colway-qatar',
    status: 'active',
  },
  {
    id: '24genomics-qatar',
    label: 'Genomics Qatar',
    icon: Dna,
    badge: 'GCC / AED',
    supplier: '24Genetics S.L.',
    description: 'Qatar & GCC genomics distributor pricing (Nutrigen + All-in-One)',
    pricingNote: 'Distributor-tier with GCC landing',
    route: '/pricing/24genomics-qatar',
    skuCount: 3,
    currency: 'AED',
    fetchGroup: '24genomics-qatar',
    status: 'active',
  },
  {
    id: 'bloodo',
    label: 'Bloodo DBS',
    icon: TestTube,
    badge: 'Diagnostics',
    supplier: 'Bloodo Lab',
    description: 'Dried Blood Spot diagnostic kits — capillary remote sampling',
    pricingNote: 'Fixed lab price + Mediluxe margin',
    route: '/collection/bloodo',
    skuCount: 6,
    currency: 'EUR',
    fetchGroup: 'bloodo',
    status: 'active',
  },
  {
    id: 'ultraperson',
    label: 'UltraPerson',
    icon: Sparkles,
    badge: 'Supplements',
    supplier: 'UltraPerson / NP Labs',
    description: 'Precision nutraceutical supplements — clinical-grade',
    pricingNote: 'Cost + 15% Mediluxe + 15% Wholesaler',
    route: '/collection/ultraperson',
    skuCount: 5,
    currency: 'EUR',
    fetchGroup: 'ultraperson',
    status: 'active',
  },
  {
    id: 'weight-management',
    label: 'Weight Mgmt',
    icon: Activity,
    badge: 'Incretins + GLP',
    supplier: 'NP Labs / Compounding',
    description: 'GLP-1 analogues, incretins, and metabolic weight optimization compounds',
    pricingNote: 'Cost + 15% Mediluxe + 15% Wholesaler',
    route: '/collection/weight-management',
    skuCount: 9,
    currency: 'EUR',
    fetchGroup: 'weight-management',
    status: 'active',
  },
  {
    id: 'hair-treatments',
    label: 'Hair Protocol',
    icon: Scissors,
    badge: 'Trichology Bundle',
    supplier: 'NP Labs + Colway',
    description: 'GHK-Cu, tricho compounds, and Colway hair protocol synergy',
    pricingNote: 'Mixed: peptide rate + Colway rate',
    route: '/collection/hair-treatments',
    skuCount: 7,
    currency: 'EUR',
    fetchGroup: 'hair-treatments',
    status: 'active',
  },
  {
    id: 'teletest',
    label: 'TeleTest',
    icon: Microscope,
    badge: 'HLA + HTMA',
    supplier: 'TeleTest Diagnostics',
    description: 'HLA celiac immunogenetics and Hair Tissue Mineral Analysis kits',
    pricingNote: 'Fixed laboratory rate',
    route: '/collection/teletest',
    skuCount: 2,
    currency: 'EUR',
    fetchGroup: 'teletest',
    status: 'active',
  },
  {
    id: 'eterna',
    label: 'ETERNA',
    icon: Layers,
    badge: 'Multi-Omics',
    supplier: 'ETERNA Genomics',
    description: 'Multi-omics longevity panels — epigenetics + proteomics',
    pricingNote: 'Fixed rate — lab-direct pricing',
    route: '/collection/eterna',
    skuCount: 3,
    currency: 'EUR',
    fetchGroup: 'eterna',
    status: 'active',
  },
  {
    id: 'aesthetic-injectables',
    label: 'Injectables',
    icon: Sparkles,
    badge: '40 SKUs · Dubai',
    supplier: 'Dubai Aesthetics Direct (Allergan · Teoxane · Galderma · Merz · Neauvia · Croma)',
    description: 'Dermal fillers, skin quality injectables, PLLA & CaHA biostimulators, polynucleotides & Aqualyx',
    pricingNote: 'Cost + 15% Mediluxe + 15% Wholesaler (×1.3225)',
    route: '/collection/aesthetic-injectables',
    skuCount: 40,
    currency: 'EUR',
    fetchGroup: 'dermal-fillers',
    status: 'active',
  },
];

const TOTAL_SKUS = PRICE_GROUPS.reduce((s, g) => s + g.skuCount, 0);

// ─── Tier Badge ───────────────────────────────────────────────────────────────

function TierBadge({ tier, tierLabel }) {
  const c = TIER_COLORS[tier] ?? TIER_COLORS.guest;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      color: c.text, background: c.bg, border: `1px solid ${c.border}`,
      letterSpacing: '0.03em', whiteSpace: 'nowrap',
    }}>
      {tier === 'guest' ? <Lock size={10} /> : <ShieldCheck size={10} />}
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
        <strong>Viewing public wholesale prices</strong> — standard distributor rates (cost + 15% Mediluxe + 15% Wholesaler = cost × 1.3225).{' '}
        <Link href="/auth/login" style={{ color: '#d97706', fontWeight: 700, textDecoration: 'underline' }}>
          Log in
        </Link>{' '}
        to unlock your clinic or contract-specific pricing tier.
      </span>
    </div>
  );
}

// ─── Live SKU DataTable for Active Group ──────────────────────────────────────

function GroupSkuTable({ group, tier, priceFor, formatPrice, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setSelectedBrand('all');

    if (group.id === 'aesthetic-injectables') {
      import('@/data/aestheticInjectablesRegistry')
        .then(mod => {
          if (!isMounted) return;
          setProducts(mod.getAestheticInjectablesCatalog() || []);
          setLoading(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setLoading(false);
        });
      return () => { isMounted = false; };
    }

    fetch(`/api/catalog/public?category=${encodeURIComponent(group.fetchGroup)}&limit=100`)
      .then(res => (res.ok ? res.json() : { products: [] }))
      .then(data => {
        if (!isMounted) return;
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setProducts([]);
        setLoading(false);
      });

    return () => { isMounted = false; };
  }, [group.id, group.fetchGroup]);

  // Brand categories available in the group
  const availableBrands = useMemo(() => {
    const set = new Set();
    products.forEach(p => {
      if (p.brand) set.add(p.brand);
      else if (p.manufacturer) set.add(p.manufacturer.split(' ')[0]);
    });
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (selectedBrand && selectedBrand !== 'all') {
      list = list.filter(p => p.brand === selectedBrand || p.manufacturer?.toLowerCase().includes(selectedBrand.toLowerCase()));
    }
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.canonicalName || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q) ||
      (p.indication || '').toLowerCase().includes(q) ||
      (p.technology || '').toLowerCase().includes(q) ||
      (p.subcategory || '').toLowerCase().includes(q) ||
      (p.dosage || '').toLowerCase().includes(q)
    );
  }, [products, search, selectedBrand]);

  const columns = useMemo(() => {
    const cols = [
      {
        key: 'id',
        label: 'Code / SKU',
        width: '18%',
        render: (val, row) => <CopyableId value={row.id} />
      },
      {
        key: 'name',
        label: 'Product / Formulation',
        width: isAdmin ? '32%' : '44%',
        render: (val, row) => (
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>
              {row.name || row.canonicalName || row.id}
            </div>
            {row.dosage && (
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                {row.dosage}
              </div>
            )}
          </div>
        )
      },
      {
        key: 'status',
        label: 'Availability',
        width: '16%',
        render: (val, row) => (
          <StatusBadge status={row.inStock ? 'active' : 'draft'} />
        )
      },
      {
        key: 'price',
        label: tier === 'guest' ? 'Wholesale (Cost × 1.3225)' : 'Your Tier Price',
        width: isAdmin ? '18%' : '22%',
        render: (val, row) => {
          const resolved = priceFor(row);
          const amount = resolved.price ?? row.price;
          return (
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                {formatPrice(amount, group.currency)}
              </div>
              <div style={{ fontSize: 10, color: '#0284c7', fontWeight: 600 }}>
                {resolved.label || 'Wholesale'}
              </div>
            </div>
          );
        }
      }
    ];

    if (isAdmin) {
      cols.push({
        key: 'adminCost',
        label: 'Cost & Margin',
        width: '16%',
        render: (val, row) => {
          const resolved = priceFor(row);
          const cost = resolved.costPrice ?? (row.price ? +(row.price / 1.3225).toFixed(2) : null);
          return (
            <div style={{ fontSize: 11 }}>
              <div style={{ color: '#475569' }}>
                Cost: <strong>{formatPrice(cost, group.currency)}</strong>
              </div>
              <div style={{ color: '#15803d', fontWeight: 600 }}>
                +15% Mediluxe +15% WS
              </div>
            </div>
          );
        }
      });
    }

    return cols;
  }, [group.currency, priceFor, formatPrice, tier, isAdmin]);

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 12,
        paddingBottom: 8, borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Live References ({filtered.length} SKUs)
          </span>
          <span style={{ fontSize: 11, color: '#64748b' }}>
            · Currency: <strong>{group.currency}</strong>
          </span>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${group.label} SKUs...`}
          style={{
            padding: '5px 10px', fontSize: 12, borderRadius: 6,
            border: '1px solid #cbd5e1', width: 220, background: '#fff'
          }}
        />
      </div>

      {/* Brand Filters if multiple brands in group */}
      {availableBrands.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginRight: 4 }}>Brand:</span>
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            style={{
              padding: '3px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              border: selectedBrand === 'all' ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
              background: selectedBrand === 'all' ? 'var(--color-primary, #003666)' : '#fff',
              color: selectedBrand === 'all' ? '#fff' : '#475569'
            }}
          >
            All Brands
          </button>
          {availableBrands.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              style={{
                padding: '3px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                border: selectedBrand === b ? '1px solid var(--color-primary, #003666)' : '1px solid #cbd5e1',
                background: selectedBrand === b ? 'var(--color-primary, #003666)' : '#fff',
                color: selectedBrand === b ? '#fff' : '#475569'
              }}
            >
              {b}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <TabSkeleton lines={6} />
      ) : products.length === 0 ? (
        <div style={{
          padding: '32px 20px', textAlign: 'center', background: '#f8fafc',
          borderRadius: 10, border: '1px dashed #cbd5e1', margin: '12px 0'
        }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px 0' }}>
            Real-time catalog synchronization for this specialized line is active in the dedicated workspace.
          </p>
          <Link href={group.route} style={{ textDecoration: 'none' }}>
            <button style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 18px', borderRadius: 6, fontSize: 12, fontWeight: 700,
              color: '#fff', background: 'var(--color-primary, #003666)', border: 'none', cursor: 'pointer'
            }}>
              <span>Open Dedicated Price List</span>
              <ExternalLink size={13} />
            </button>
          </Link>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          pagination={true}
          pageSize={10}
          globalSearch={false}
        />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UnifiedPriceHub({
  embedded = false,
  defaultGroup = null,
}) {
  const { tier, tierLabel, tierColor, isAuthenticated, isAdmin, priceFor, formatPrice } = usePriceTier();

  const [activeGroupId, setActiveGroupId] = useState(defaultGroup || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeMode, setScopeMode] = useState('filtered');

  // URL sync for initial tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const tab = url.searchParams.get('tab') || url.searchParams.get('group');
      if (tab && (tab === 'all' || PRICE_GROUPS.some(g => g.id === tab))) {
        setActiveGroupId(tab);
      }
    }
  }, []);

  const handleSelectGroup = useCallback((groupId) => {
    setActiveGroupId(groupId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (groupId && groupId !== 'all') {
        url.searchParams.set('tab', groupId);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  const selectedGroup = useMemo(() => {
    if (activeGroupId === 'all') return null;
    return PRICE_GROUPS.find(g => g.id === activeGroupId) || null;
  }, [activeGroupId]);

  // Filtered groups by global search
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return PRICE_GROUPS;
    return PRICE_GROUPS.filter(g =>
      g.label.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.supplier.toLowerCase().includes(q) ||
      g.badge.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Tab definitions
  const tabs = useMemo(() => [
    { id: 'all', label: `All Price Lists (${PRICE_GROUPS.length})`, icon: Layers },
    ...PRICE_GROUPS.map(g => ({
      id: g.id,
      label: g.label,
      icon: g.icon
    }))
  ], []);

  // KPIs
  const kpis = useMemo(() => {
    const activeLists = PRICE_GROUPS.filter(g => g.status === 'active').length;
    return [
      { title: 'Total SKUs', value: TOTAL_SKUS, subtitle: 'across 12 catalogs', icon: Package, color: '#0284c7' },
      { title: 'Price Lists', value: PRICE_GROUPS.length, subtitle: `${activeLists} active schedules`, icon: List, color: '#0d9488' },
      { title: 'Your Tier', value: tierLabel.split(' ')[0], subtitle: tierLabel, icon: ShieldCheck, color: tierColor.text },
      { title: 'Formula Base', value: 'Cost + 15% + 15%', subtitle: 'Wholesale = Cost × 1.3225', icon: Tag, color: '#7c3aed' },
    ];
  }, [tierLabel, tierColor]);

  const scopeCounts = {
    filtered: filteredGroups.length,
    total: PRICE_GROUPS.length,
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      {!embedded && (
        <PageHeader
          title="Unified B2B Price Hub"
          subtitle="Single authoritative entry point for all 12 product groups with authenticated tier pricing."
          actions={<GcpUserBadge />}
        />
      )}

      {/* ── Auth Banner ── */}
      <AuthBanner tier={tier} isAuthenticated={isAuthenticated} />

      {/* ── KPI Strip ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: 12, marginBottom: 16,
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
        entityLabel="price lists"
        style={{ marginBottom: 16 }}
      />

      {/* ── Search Bar ── */}
      <GlobalSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search product lines, formulations, suppliers or categories…"
        size="lg"
        resultCount={filteredGroups.length}
        style={{ marginBottom: 16 }}
      />

      {/* ── Horizontal Navigation Tabs (Responsive) ── */}
      <div style={{ marginBottom: 20 }}>
        <ResponsiveTabs
          tabs={tabs}
          activeTab={activeGroupId}
          onTabChange={handleSelectGroup}
        />
      </div>

      {/* ── VIEW MODE 1: Active Group Detail + Live SKU Table ── */}
      {selectedGroup ? (
        <div style={{
          background: 'var(--surface, #fff)',
          border: '1px solid var(--border, #e2e8f0)',
          borderRadius: 12,
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        }}>
          {/* Header of Active Group */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16, paddingBottom: 16,
            borderBottom: '1px solid var(--border, #e2e8f0)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <selectedGroup.icon size={22} color="#1d4ed8" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <TierBadge tier={tier} tierLabel={tierLabel} />
              <Link
                href={selectedGroup.route}
                target="_blank"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '6px 14px', borderRadius: 6, fontSize: 12, fontWeight: 700,
                  color: '#ffffff', background: 'var(--color-primary, #003666)',
                  textDecoration: 'none'
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
            background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12
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
          <GroupSkuTable
            group={selectedGroup}
            tier={tier}
            priceFor={priceFor}
            formatPrice={formatPrice}
            isAdmin={isAdmin}
          />
        </div>
      ) : (
        /* ── VIEW MODE 2: Overview Grid of all 12 Lists ── */
        <div>
          {filteredGroups.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No price schedules found"
              subtitle="Try adjusting your search criteria."
              action={{ label: 'Clear Search', onClick: () => setSearchQuery('') }}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {filteredGroups.map(group => {
                const Icon = group.icon;
                return (
                  <div
                    key={group.id}
                    onClick={() => handleSelectGroup(group.id)}
                    style={{
                      background: 'var(--surface, #fff)',
                      border: '1px solid var(--border, #e2e8f0)',
                      borderRadius: 12,
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-primary, #003666)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border, #e2e8f0)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8,
                          background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          <Icon size={20} color="#0f172a" />
                        </div>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: '#0369a1',
                          background: '#f0f9ff', border: '1px solid #bae6fd',
                          padding: '2px 8px', borderRadius: 12
                        }}>
                          {group.badge}
                        </span>
                      </div>

                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
                        {group.label}
                      </h3>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                        {group.description}
                      </p>
                    </div>

                    <div>
                      <div style={{
                        fontSize: 11, color: '#475569', padding: '6px 10px',
                        background: '#f8fafc', borderRadius: 6, marginBottom: 12
                      }}>
                        Formula: <strong>{group.pricingNote}</strong>
                      </div>

                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        fontSize: 12, fontWeight: 700, color: '#0284c7'
                      }}>
                        <span>Explore SKUs ({group.skuCount})</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Tier Rules Footnote ── */}
      <div style={{
        marginTop: 32, padding: '16px 20px',
        background: '#f8fafc', borderRadius: 12,
        border: '1px solid #e2e8f0', fontSize: 12,
      }}>
        <div style={{ fontWeight: 700, color: '#475569', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
          Authenticated Pricing Governance
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 8 }}>
          {Object.entries(TIER_LABELS).map(([t, label]) => {
            const c = TIER_COLORS[t];
            const isCurrent = t === tier;
            return (
              <div key={t} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20,
                background: c.bg, border: `1px solid ${c.border}`,
                color: c.text, fontWeight: isCurrent ? 700 : 500, fontSize: 11
              }}>
                {isCurrent && '✓ '}
                {label}
              </div>
            );
          })}
        </div>
        <div style={{ color: '#94a3b8', lineHeight: 1.5 }}>
          <strong>Unregistered visitors:</strong> Wholesale price (Cost × 1.15 Mediluxe × 1.15 Wholesaler = Cost × 1.3225).
          Raw laboratory supplier costs and margins remain strictly restricted.
        </div>
      </div>
    </div>
  );
}
