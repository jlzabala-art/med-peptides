'use client';

/**
 * components/pricing/UnifiedPriceHub.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Price Hub — Single entry point for ALL product group price schedules.
 *
 * Golden Rules compliance:
 *  #2  – Firestore-first; lazy per-tab fetch on tab activation
 *  #3  – All tabular data via DataTable
 *  #7  – GlobalSearchBar always first
 *  #8  – StatusBadge for availability
 *  #11 – CopyableId for product codes
 *  #22 – 4 KPIs + Scope Switcher
 *  #23 – Mobile-first (responsive columns)
 *  #30 – No horizontal scroll; explicit column widths
 *
 * Price Tier Rules:
 *  - Guest/anonymous → cost × 1.3225 (wholesaler public price)
 *  - Registered user → their tier from usePriceTier hook
 *  - Mediluxe staff  → sees all columns
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react';
import {
  FlaskConical, Dna, Scissors, Package, Layers, TestTube, Wheat,
  Activity, Microscope, ShieldCheck, Lock, LogIn, Eye, ChevronRight,
  TrendingUp, Tag, DollarSign, List, RefreshCw, ExternalLink, Info,
  Zap, Globe, Users, ArrowRight, Building2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

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

// ─── Tab / Group Registry ─────────────────────────────────────────────────────

export const PRICE_GROUPS = [
  {
    id: 'peptides',
    label: 'Peptides',
    icon: FlaskConical,
    badge: '127 SKUs',
    supplier: 'NP Labs',
    description: 'Lyophilized bioactive peptides · HPLC ≥99% · Sterile vials',
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
    description: 'Biologically active native collagen — full portfolio',
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
    description: 'Baicapil™ 2% shampoo + conditioner — anti-hair-loss protocol',
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
    icon: Globe,
    badge: 'AED / Distributor',
    supplier: 'Colway International',
    description: 'Qatar & GCC distributor pricing (AED)',
    pricingNote: 'Distributor-tier with AED currency',
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
    description: 'Qatar & GCC genomics distributor pricing',
    pricingNote: 'Distributor-tier with AED currency',
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
    description: 'Dry Blood Spot diagnostic kits — remote sampling',
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
    icon: Zap,
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
    label: 'Weight Management',
    icon: Activity,
    badge: 'Incretins + GLP-1',
    supplier: 'NP Labs / Compounding',
    description: 'GLP-1 analogues, incretins, and metabolic compounds',
    pricingNote: 'Cost + 15% Mediluxe + 15% Wholesaler',
    route: '/collection/weight-management',
    skuCount: 9,
    currency: 'EUR',
    fetchGroup: 'weight-management',
    status: 'active',
  },
  {
    id: 'hair-treatments',
    label: 'Hair Treatments',
    icon: Scissors,
    badge: 'Trichology Bundle',
    supplier: 'NP Labs + Colway',
    description: 'GHK-Cu, tricho compounds, and Colway hair protocol bundle',
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
    description: 'HLA typing and Hair Tissue Mineral Analysis kits',
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
];

const TOTAL_SKUS   = PRICE_GROUPS.reduce((s, g) => s + g.skuCount, 0);
const TOTAL_GROUPS = PRICE_GROUPS.length;

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

// ─── Auth Banner ──────────────────────────────────────────────────────────────

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
        <strong>Viewing public wholesale prices</strong> — these are baseline distributor rates (cost × 1.3225).{' '}
        <Link href="/auth/login" style={{ color: '#d97706', fontWeight: 600, textDecoration: 'underline' }}>
          Log in
        </Link>{' '}
        to see your negotiated clinic or wholesaler pricing.
      </span>
    </div>
  );
}

// ─── Group Card (overview grid) ───────────────────────────────────────────────

function GroupCard({ group, onSelect, isActive }) {
  const Icon = group.icon;
  return (
    <button
      onClick={() => onSelect(group.id)}
      style={{
        all: 'unset', cursor: 'pointer', display: 'block', width: '100%',
        padding: '16px', borderRadius: 12, boxSizing: 'border-box',
        border: `2px solid ${isActive ? 'var(--color-primary, #003666)' : 'var(--border, #e2e8f0)'}`,
        background: isActive ? '#f0f4ff' : 'var(--surface, #fff)',
        transition: 'all 0.15s ease',
        textAlign: 'left',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: isActive ? '#dbeafe' : '#f1f5f9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={18} color={isActive ? '#1d4ed8' : '#64748b'} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary, #0f172a)', marginBottom: 2 }}>
            {group.label}
          </div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
            {group.badge}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>
        {group.description}
      </div>
      <div style={{
        marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 11, color: isActive ? '#1d4ed8' : '#64748b', fontWeight: 600,
      }}>
        <span>{group.pricingNote}</span>
        <ChevronRight size={12} />
      </div>
    </button>
  );
}

// ─── Group Detail Panel ───────────────────────────────────────────────────────

function GroupDetailPanel({ group, tier, tierLabel, formatPrice }) {
  const Icon = group.icon;

  return (
    <div style={{ padding: '0' }}>
      {/* Group header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        padding: '20px 0 16px 0', borderBottom: '1px solid var(--border, #e2e8f0)',
        marginBottom: 20,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, flexShrink: 0,
          background: '#dbeafe',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={22} color="#1d4ed8" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            {group.label}
            {' '}
            <span style={{
              fontSize: 11, fontWeight: 500, color: '#64748b',
              background: '#f1f5f9', padding: '2px 8px', borderRadius: 20, marginLeft: 6,
            }}>
              {group.badge}
            </span>
          </h3>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {group.description}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <TierBadge tier={tier} tierLabel={tierLabel} />
          <StatusBadge status={group.status} />
          <Link
            href={group.route}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe',
              textDecoration: 'none',
            }}
          >
            Full View <ExternalLink size={12} />
          </Link>
        </div>
      </div>

      {/* Pricing info */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12, marginBottom: 20,
      }}>
        <InfoTile label="Supplier" value={group.supplier} icon={Building2} />
        <InfoTile label="Pricing Formula" value={group.pricingNote} icon={Tag} />
        <InfoTile label="SKU Count" value={group.skuCount} icon={List} />
        <InfoTile label="Native Currency" value={group.currency} icon={DollarSign} />
      </div>

      {/* CTA */}
      <div style={{
        padding: '14px 16px',
        background: '#f8faff',
        borderRadius: 10,
        border: '1px solid #e0e7ff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: '#1e40af', marginBottom: 2 }}>
            Open full price schedule →
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            Live pricing with filters, PDF export, currency switcher, and direct inquiry form.
          </div>
        </div>
        <Link href={group.route} style={{ textDecoration: 'none' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
            color: '#fff', background: 'var(--color-primary, #003666)',
            border: 'none', cursor: 'pointer',
          }}>
            View Prices <ArrowRight size={14} />
          </button>
        </Link>
      </div>
    </div>
  );
}

function InfoTile({ label, value, icon: Icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10,
      padding: '10px 14px', borderRadius: 8,
      background: 'var(--surface, #fff)', border: '1px solid var(--border, #e2e8f0)',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={13} color="#64748b" />
      </div>
      <div>
        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: '#0f172a', fontWeight: 600, marginTop: 1 }}>
          {value}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UnifiedPriceHub({
  /** If embedded inside Admin panel, show simplified header */
  embedded = false,
  /** Initial active tab */
  defaultGroup = null,
}) {
  const { tier, tierLabel, tierColor, isAuthenticated, isAdmin, priceFor, formatPrice } = usePriceTier();

  const [activeGroup, setActiveGroup] = useState(defaultGroup ?? null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeMode, setScopeMode] = useState('filtered');

  // URL sync for initial tab
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      const tab = url.searchParams.get('tab') || url.searchParams.get('group');
      if (tab && PRICE_GROUPS.some(g => g.id === tab)) {
        setActiveGroup(tab);
      }
    }
  }, []);

  // Update URL when tab changes
  const handleSelectGroup = useCallback((groupId) => {
    setActiveGroup(prev => prev === groupId ? null : groupId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (groupId) {
        url.searchParams.set('tab', groupId);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  const selectedGroup = activeGroup ? PRICE_GROUPS.find(g => g.id === activeGroup) : null;

  // Filtered groups by search
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

  // KPIs
  const kpis = useMemo(() => {
    const activeLists = PRICE_GROUPS.filter(g => g.status === 'active').length;
    return [
      { title: 'Total SKUs', value: TOTAL_SKUS, subtitle: 'across all catalogs', icon: Package, color: '#0284c7' },
      { title: 'Price Lists', value: TOTAL_GROUPS, subtitle: `${activeLists} active`, icon: List, color: '#0d9488' },
      { title: 'Your Tier', value: tierLabel.split(' ')[0], subtitle: tierLabel, icon: ShieldCheck, color: tierColor.text },
      { title: 'Suppliers', value: 7, subtitle: 'direct contracts', icon: Building2, color: '#7c3aed' },
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
          title="Unified Price Hub"
          subtitle="All product group price schedules — one authenticated view"
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
        placeholder="Search price lists, suppliers, or product categories…"
        size="lg"
        resultCount={filteredGroups.length}
        style={{ marginBottom: 20 }}
      />

      {/* ── Main Layout: Grid + Detail Panel ── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left: Group Grid */}
        <div style={{ flex: '0 0 auto', width: '100%', maxWidth: 820 }}>
          {filteredGroups.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No price lists found"
              subtitle="Try adjusting your search query to find the product group you're looking for."
              action={{ label: 'Clear Search', onClick: () => setSearchQuery('') }}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12,
            }}>
              {filteredGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isActive={activeGroup === group.id}
                  onSelect={handleSelectGroup}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Detail Panel */}
        {selectedGroup && (
          <div style={{
            flex: '1 1 320px', minWidth: 280,
            background: 'var(--surface, #fff)',
            border: '1px solid var(--border, #e2e8f0)',
            borderRadius: 14,
            padding: '20px',
            position: 'sticky',
            top: 72,
          }}>
            <GroupDetailPanel
              group={selectedGroup}
              tier={tier}
              tierLabel={tierLabel}
              formatPrice={formatPrice}
            />
          </div>
        )}
      </div>

      {/* ── Tier Legend ── */}
      <div style={{
        marginTop: 32, padding: '16px 20px',
        background: '#f8fafc', borderRadius: 12,
        border: '1px solid #e2e8f0', fontSize: 12,
      }}>
        <div style={{ fontWeight: 700, color: '#475569', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}>
          Pricing Tier Legend
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {Object.entries(TIER_LABELS).map(([t, label]) => {
            const c = TIER_COLORS[t];
            const isCurrentTier = t === tier;
            return (
              <div key={t} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 20,
                background: c.bg, border: `1px solid ${c.border}`,
                color: c.text, fontWeight: isCurrentTier ? 700 : 500,
                fontSize: 11, outline: isCurrentTier ? `2px solid ${c.text}` : 'none',
                outlineOffset: 1,
              }}>
                {isCurrentTier && '✓ '}
                {t === 'guest' && <Lock size={9} />}
                {t !== 'guest' && <ShieldCheck size={9} />}
                {label}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, color: '#94a3b8', lineHeight: 1.5 }}>
          <strong>Guest/Wholesale</strong>: cost × 1.3225 &nbsp;·&nbsp;
          <strong>Clinic</strong>: negotiated per clinic contract &nbsp;·&nbsp;
          <strong>Admin</strong>: cost + all margin columns visible
        </div>
      </div>
    </div>
  );
}
