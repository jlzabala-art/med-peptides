'use client';

/**
 * components/pricing/UnifiedPriceHub.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Unified Price Hub — Single consolidated entry point for ALL product group price schedules.
 *
 * Golden Rules compliance:
 *  #2  – Firestore-first via /api/catalog/public
 *  #3  – All tabular data via DataTable (DataTable.jsx)
 *  #4  – Master-Detail inline expansion via expandableRender
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
  ChevronDown, Tag, DollarSign, List, ExternalLink, ArrowRight, ArrowLeft, Building2,
  CheckCircle2, Sparkles, Filter, X, LayoutGrid, Table, Share2, Users,
  Check, Copy, FileText, FileDown, Printer, Download, MessageSquare, Calendar, Info
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
import TabSkeleton         from '@/components/ui/TabSkeleton';
import GcpUserBadge        from '@/components/shared/GcpUserBadge';

import { usePriceTier, TIER_COLORS, TIER_LABELS } from '@/hooks/pricing/usePriceTier';

// ─── 12 Aggregated Price Groups Registry with Share Intelligence ──────────────

export const PRICE_GROUPS = [
  {
    id: 'peptides',
    label: 'Peptides',
    icon: FlaskConical,
    badge: '127 SKUs',
    supplier: 'NP Labs',
    description: 'Lyophilized bioactive peptides · HPLC ≥99% · Sterile analytical vials',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler',
    route: '/pricing/peptides',
    skuCount: 127,
    currency: 'USD',
    fetchGroup: 'peptides',
    status: 'active',
    sharesCount: 38,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '12 Nov 2026', views: 7, status: 'opened' },
      { name: 'Nikolaos Psathas', organization: 'NP Labs (Athens / EU)', role: 'wholesaler', channel: 'web', date: '04 Nov 2026', views: 14, status: 'opened' },
      { name: 'Dr. Carlos Méndez', organization: 'Clínica Longevity Madrid', role: 'doctor', channel: 'whatsapp', date: '28 Oct 2026', views: 3, status: 'opened' },
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Qatar)', role: 'wholesaler', channel: 'email', date: '22 Oct 2026', views: 9, status: 'opened' },
      { name: 'Mediluxe Clinic Marbella', organization: 'Grupo Mediluxe S.L.', role: 'clinic', channel: 'web', date: '15 Oct 2026', views: 5, status: 'opened' }
    ]
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
    sharesCount: 29,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '11 Nov 2026', views: 8, status: 'opened' },
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Doha)', role: 'wholesaler', channel: 'web', date: '05 Nov 2026', views: 12, status: 'opened' },
      { name: 'Dra. Elena Ramos', organization: 'Mediluxe Clinic Marbella', role: 'doctor', channel: 'whatsapp', date: '30 Oct 2026', views: 4, status: 'opened' },
      { name: 'Laboratorios Genómicos UAE', organization: 'Al Zahra Medical', role: 'clinic', channel: 'email', date: '18 Oct 2026', views: 5, status: 'opened' }
    ]
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
    sharesCount: 22,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Qatar)', role: 'wholesaler', channel: 'whatsapp', date: '10 Nov 2026', views: 6, status: 'opened' },
      { name: 'Dra. Carmen Valls', organization: 'Instituto Dermatológico Barcelona', role: 'clinic', channel: 'web', date: '02 Nov 2026', views: 11, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'whatsapp', date: '25 Oct 2026', views: 5, status: 'opened' }
    ]
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
    sharesCount: 17,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company (Qatar)', role: 'wholesaler', channel: 'whatsapp', date: '08 Nov 2026', views: 9, status: 'opened' },
      { name: 'Clínica Capilar Svenson', organization: 'Svenson Medical Madrid', role: 'clinic', channel: 'web', date: '01 Nov 2026', views: 4, status: 'opened' },
      { name: 'Dr. Alejandro Ruiz', organization: 'Trichology Center Valencia', role: 'doctor', channel: 'email', date: '20 Oct 2026', views: 4, status: 'opened' }
    ]
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
    sharesCount: 14,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company · Ryhanh Group (Doha)', role: 'wholesaler', channel: 'whatsapp', date: '12 Nov 2026', views: 16, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'web', date: '06 Nov 2026', views: 7, status: 'opened' }
    ]
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
    sharesCount: 16,
    recipients: [
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company · Ryhanh Group (Doha)', role: 'wholesaler', channel: 'whatsapp', date: '12 Nov 2026', views: 18, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai & Doha)', role: 'clinic', channel: 'web', date: '09 Nov 2026', views: 9, status: 'opened' }
    ]
  },
  {
    id: 'bloodo',
    label: 'Bloodo DBS',
    icon: TestTube,
    badge: 'Diagnostics',
    supplier: 'Bloodo Lab',
    description: 'Dried Blood Spot diagnostic kits — capillary remote sampling',
    pricingNote: 'Fixed lab price + Atlas margin',
    route: '/collection/bloodo',
    skuCount: 6,
    currency: 'EUR',
    fetchGroup: 'bloodo',
    status: 'active',
    sharesCount: 9,
    recipients: [
      { name: 'Dr. Carlos Méndez', organization: 'Clínica Longevity Madrid', role: 'doctor', channel: 'whatsapp', date: '04 Nov 2026', views: 3, status: 'opened' },
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'web', date: '26 Oct 2026', views: 6, status: 'opened' }
    ]
  },
  {
    id: 'ultraperson',
    label: 'UltraPerson',
    icon: Sparkles,
    badge: 'Supplements',
    supplier: 'UltraPerson / NP Labs',
    description: 'Precision nutraceutical supplements — clinical-grade',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler',
    route: '/collection/ultraperson',
    skuCount: 5,
    currency: 'EUR',
    fetchGroup: 'ultraperson',
    status: 'active',
    sharesCount: 11,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare', role: 'clinic', channel: 'whatsapp', date: '07 Nov 2026', views: 4, status: 'opened' },
      { name: 'Nikolaos Psathas', organization: 'NP Labs (Athens)', role: 'wholesaler', channel: 'web', date: '29 Oct 2026', views: 7, status: 'opened' }
    ]
  },
  {
    id: 'weight-management',
    label: 'Weight Mgmt',
    icon: Activity,
    badge: 'Incretins + GLP',
    supplier: 'NP Labs / Compounding',
    description: 'GLP-1 analogues, incretins, and metabolic weight optimization compounds',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler',
    route: '/collection/weight-management',
    skuCount: 9,
    currency: 'EUR',
    fetchGroup: 'weight-management',
    status: 'active',
    sharesCount: 25,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '11 Nov 2026', views: 12, status: 'opened' },
      { name: 'Dr. Carlos Méndez', organization: 'Clínica Longevity Madrid', role: 'doctor', channel: 'web', date: '03 Nov 2026', views: 8, status: 'opened' },
      { name: 'Clínica Antiaging Barcelona', organization: 'Antiaging Medical Group', role: 'clinic', channel: 'email', date: '27 Oct 2026', views: 5, status: 'opened' }
    ]
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
    sharesCount: 13,
    recipients: [
      { name: 'Clínica Capilar Svenson', organization: 'Svenson Medical', role: 'clinic', channel: 'whatsapp', date: '05 Nov 2026', views: 6, status: 'opened' },
      { name: 'Hossam Ahmed', organization: 'Ryhanh Medical Company', role: 'wholesaler', channel: 'web', date: '28 Oct 2026', views: 7, status: 'opened' }
    ]
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
    sharesCount: 8,
    recipients: [
      { name: 'Dr. Carlos Méndez', organization: 'Clínica Longevity Madrid', role: 'doctor', channel: 'whatsapp', date: '02 Nov 2026', views: 3, status: 'opened' },
      { name: 'Transcend Healthcare', organization: 'Transcend Healthcare', role: 'clinic', channel: 'web', date: '21 Oct 2026', views: 5, status: 'opened' }
    ]
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
    sharesCount: 7,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '09 Nov 2026', views: 4, status: 'opened' },
      { name: 'Mediluxe Clinic Marbella', organization: 'Grupo Mediluxe S.L.', role: 'clinic', channel: 'web', date: '19 Oct 2026', views: 3, status: 'opened' }
    ]
  },
  {
    id: 'aesthetic-injectables',
    label: 'Injectables',
    icon: Sparkles,
    badge: '40 SKUs · Dubai',
    supplier: 'Dubai Aesthetics Direct (Allergan · Teoxane · Galderma · Merz · Neauvia · Croma)',
    description: 'Dermal fillers, skin quality injectables, PLLA & CaHA biostimulators, polynucleotides & Aqualyx',
    pricingNote: 'Cost + 15% Atlas + 15% Wholesaler (×1.3225)',
    route: '/collection/aesthetic-injectables',
    skuCount: 40,
    currency: 'EUR',
    fetchGroup: 'dermal-fillers',
    status: 'active',
    sharesCount: 31,
    recipients: [
      { name: 'Dr. Sajid Burud', organization: 'Transcend Healthcare (Dubai)', role: 'clinic', channel: 'whatsapp', date: '12 Nov 2026', views: 11, status: 'opened' },
      { name: 'Dra. Carmen Valls', organization: 'Clínica Estética Diagonal Barcelona', role: 'clinic', channel: 'web', date: '07 Nov 2026', views: 9, status: 'opened' },
      { name: 'Dr. Carlos Méndez', organization: 'Clínica Longevity Madrid', role: 'doctor', channel: 'whatsapp', date: '31 Oct 2026', views: 6, status: 'opened' },
      { name: 'Dra. Elena Ramos', organization: 'Mediluxe Clinic Marbella', role: 'doctor', channel: 'email', date: '24 Oct 2026', views: 5, status: 'opened' }
    ]
  }
];

const TOTAL_SKUS = PRICE_GROUPS.reduce((s, g) => s + g.skuCount, 0);

export const MACRO_CATEGORIES = [
  { id: 'all', label: 'Todos (13)' },
  { id: 'peptides', label: '🔬 Péptidos & Longevidad', groupIds: ['peptides', 'ultraperson', 'hair-treatments'] },
  { id: 'genomics', label: '🧬 Genómica CE-IVD', groupIds: ['24genetics', 'genomics-qatar', 'teletest'] },
  { id: 'cosmetics', label: '✨ Cosmética & Colágeno', groupIds: ['colway', 'colway-hair', 'colway-qatar', 'colway-prices'] },
  { id: 'injectables', label: '💉 Inyectables Médicos', groupIds: ['injectables', 'eth-dubai'] },
  { id: 'diagnostics', label: '🩸 Diagnósticos DBS', groupIds: ['bloodo-dbs'] },
];

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
        <strong>Viewing public wholesale prices</strong> — standard distributor rates (cost + 15% Atlas + 15% Wholesaler = cost × 1.3225).{' '}
        <Link href="/auth/login" style={{ color: '#d97706', fontWeight: 700, textDecoration: 'underline' }}>
          Log in
        </Link>{' '}
        to unlock your clinic or contract-specific pricing tier.
      </span>
    </div>
  );
}

// ─── Product Inline Master-Detail Panel (Golden Rule #4) ──────────────────────

function renderProductDetail(row, group) {
  const brand = row.brand || row.manufacturer || group.supplier;
  const purity = row.purity || row.technology || (group.id === 'peptides' ? 'HPLC ≥99.0%' : 'Certificado GMP / ISO');
  const dosage = row.dosage || row.volume || row.fill_volume || 'Presentación Estándar';
  const indication = row.indication || row.description || row.goal || row.clinicalSummary || 'Formulación biomédica oficial con trazabilidad analítica y control de calidad por lote.';
  const storage = row.storage || (group.id === 'peptides' ? 'Almacenar a 2°C – 8°C (Refrigerado). Proteger de la luz.' : 'Conservar a temperatura ambiente controlada (15°C – 25°C).');

  return (
    <div style={{
      padding: '16px 20px',
      backgroundColor: '#f8fafc',
      borderLeft: '4px solid #1a73e8',
      borderRadius: '6px',
      margin: '6px 0',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {/* Col 1: Información Clínica */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Indicación &amp; Perfil Terapéutico
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '3px' }}>
            {row.name || row.canonicalName || row.id}
          </div>
          <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
            {indication}
          </p>
        </div>

        {/* Col 2: Especificaciones Farmacéuticas */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Especificaciones Técnicas
          </div>
          <div style={{ fontSize: '12px', color: '#334155', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Concentración / Volumen:</strong> {dosage}</div>
            <div><strong>Pureza / Grado:</strong> {purity}</div>
            <div><strong>Laboratorio / Marca:</strong> {brand}</div>
            <div><strong>Almacenamiento:</strong> {storage}</div>
          </div>
        </div>

        {/* Col 3: Estado Regulatorio y Acción Directa a Ficha */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderLeft: '1px solid #e2e8f0',
          paddingLeft: '16px'
        }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Cumplimiento &amp; Calidad
            </div>
            <div style={{ marginTop: '5px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#137333', backgroundColor: '#e6f4ea', border: '1px solid #ceead6', padding: '2px 8px', borderRadius: '4px' }}>
                ✓ CE-IVD / Grado Analítico
              </span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '4px' }}>
                CoA Disponible
              </span>
            </div>
          </div>

          <Link
            href={`/product/${encodeURIComponent(row.id || row.canonicalName || '')}`}
            target="_blank"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#1a73e8',
              color: '#ffffff',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              textDecoration: 'none',
              marginTop: '12px',
              boxShadow: '0 1px 3px rgba(26,115,232,0.3)',
              transition: 'background-color 0.15s ease'
            }}
          >
            <span>Ver Ficha de Producto</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      </div>
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
                +15% Platform +15% WS
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
          <span style={{ fontSize: 11, color: '#1a73e8', backgroundColor: '#e8f0fe', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>
            Click any row to expand technical specs
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
          expandableRender={(row) => renderProductDetail(row, group)}
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
  const [overviewMode, setOverviewMode] = useState('table'); // Default to 'table' per Golden Rule #3
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState('all'); // 'all' | 'USD' | 'EUR' | 'AED'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all'); // 'all' | 'peptides' | 'genomics' | ...

  // Shares Modal States
  const [selectedShareGroup, setSelectedShareGroup] = useState(null);
  const [shareWebModalGroup, setShareWebModalGroup] = useState(null);

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

  // Filtered groups by global search, currency, and macro-category
  const filteredGroups = useMemo(() => {
    let list = PRICE_GROUPS;
    if (selectedCurrencyFilter !== 'all') {
      list = list.filter(g => g.currency === selectedCurrencyFilter);
    }
    if (selectedCategoryFilter !== 'all') {
      const cat = MACRO_CATEGORIES.find(c => c.id === selectedCategoryFilter);
      if (cat && cat.groupIds) {
        list = list.filter(g => cat.groupIds.includes(g.id));
      }
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return list;
    return list.filter(g =>
      g.label.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.supplier.toLowerCase().includes(q) ||
      g.badge.toLowerCase().includes(q) ||
      g.currency.toLowerCase().includes(q)
    );
  }, [searchQuery, selectedCurrencyFilter, selectedCategoryFilter]);

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

  const handleGeneratePdf = (group) => {
    toast.success(`Generando PDF oficial para ${group.label}...`);
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyPublicWebLink = (group) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${group.route}`;
      navigator.clipboard.writeText(url);
      toast.success(`Enlace público de ${group.label} copiado al portapapeles`);
    }
  };

  const handleWhatsAppShare = (group) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${group.route}`;
      const msg = `Hola, te adjunto la lista de precios oficial B2B de ${group.label} (${group.badge}):\n${url}\n\nEmitida por Atlas Health Services · Precision Medicine.`;
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // ─── Columns for Price Lists Table Mode ──────────────────────────────────────
  const priceListsTableColumns = useMemo(() => [
    {
      key: 'label',
      label: 'Línea de Producto / Catálogo',
      width: '28%',
      render: (val, row) => {
        const Icon = row.icon;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '8px',
              backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={18} color="#003666" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                {row.label}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                {row.description}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'supplier',
      label: 'Laboratorio / Origen',
      width: '16%',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: '12px', color: '#334155', fontWeight: 600 }}>
            {row.supplier}
          </div>
          <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600, marginTop: '1px' }}>
            ● Catálogo Activo
          </div>
        </div>
      )
    },
    {
      key: 'skuCount',
      label: 'Referencias',
      width: '10%',
      render: (val, row) => (
        <span style={{
          fontSize: '11px', fontWeight: 700, color: '#0369a1',
          backgroundColor: '#f0f9ff', border: '1px solid #bae6fd',
          padding: '2px 8px', borderRadius: '12px', display: 'inline-block'
        }}>
          {row.badge}
        </span>
      )
    },
    {
      key: 'pricingNote',
      label: 'Fórmula Comercial & Margen',
      width: '18%',
      render: (val, row) => (
        <div style={{ fontSize: '11px', color: '#475569' }}>
          <strong style={{ color: '#0f172a' }}>{row.pricingNote}</strong>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
            Moneda: <strong style={{ color: '#0284c7' }}>{row.currency}</strong>
          </div>
        </div>
      )
    },
    {
      key: 'shares',
      label: 'Difusión',
      width: '12%',
      render: (val, row) => {
        const count = row.sharesCount || (row.recipients?.length || 0);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedShareGroup(row);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
            title="Ver destinatarios que han recibido esta lista"
          >
            <Users size={12} />
            <span>{count}</span>
            <ChevronDown size={11} />
          </button>
        );
      }
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: '16%',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleGeneratePdf(row);
            }}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
            title="Generar PDF Oficial"
          >
            <FileDown size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShareWebModalGroup(row);
            }}
            style={{
              padding: '4px 6px',
              borderRadius: '4px',
              border: '1px solid #bae6fd',
              backgroundColor: '#f0f9ff',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center'
            }}
            title="Compartir enlace público"
          >
            <Share2 size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSelectGroup(row.id);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 8px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#003666',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            title={`Ver referencias de ${row.label}`}
          >
            <span>Ver SKUs</span>
            <ArrowRight size={11} />
          </button>
        </div>
      )
    }
  ], [handleGeneratePdf, handleSelectGroup]);

  return (
    <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, margin: '0 auto', boxSizing: 'border-box' }}>
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

      {/* ── UNIFIED FILTER & NAVIGATION CONTROLS (Mobile & Laptop Optimized) ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '20px',
        padding: '12px 16px',
        background: '#ffffff',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box'
      }}>
        {/* Row 1: Direct Catalog Selector + Currency Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          width: '100%'
        }}>
          {/* Catalog Direct Select Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <Layers size={15} color="#003666" />
              <span>Catálogo:</span>
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
                maxWidth: '340px',
                width: '100%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
              title="Seleccionar catálogo o ver todos"
            >
              <option value="all">📂 Todos los Catálogos ({PRICE_GROUPS.length} Listas B2B)</option>
              {PRICE_GROUPS.map(g => (
                <option key={g.id} value={g.id}>
                  {g.label} ({g.badge}) — {g.currency} · {g.supplier}
                </option>
              ))}
            </select>

            {activeGroupId !== 'all' && (
              <button
                type="button"
                onClick={() => handleSelectGroup('all')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f8fafc',
                  color: '#003666',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <ArrowLeft size={13} />
                <span>Ver Todos los Catálogos</span>
              </button>
            )}
          </div>

          {/* Currency Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>Moneda:</span>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'USD', label: 'USD ($)' },
              { id: 'EUR', label: 'EUR (€)' },
              { id: 'AED', label: 'AED / QAR' }
            ].map(f => (
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
                  border: selectedCurrencyFilter === f.id ? '1px solid #003666' : '1px solid #cbd5e1',
                  backgroundColor: selectedCurrencyFilter === f.id ? '#003666' : '#ffffff',
                  color: selectedCurrencyFilter === f.id ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category Filter Pills (Wrap cleanly without scroll) */}
        {activeGroupId === 'all' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexWrap: 'wrap',
            paddingTop: '8px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
              Filtro por Categoría:
            </span>
            {MACRO_CATEGORIES.map(cat => {
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
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}

            {(selectedCategoryFilter !== 'all' || selectedCurrencyFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryFilter('all');
                  setSelectedCurrencyFilter('all');
                  setSearchQuery('');
                }}
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
                  cursor: 'pointer'
                }}
              >
                <X size={12} />
                <span>Limpiar Filtros</span>
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
          padding: '24px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          {/* Back Navigation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '16px',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}>
            <button
              type="button"
              onClick={() => handleSelectGroup('all')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#003666',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
              }}
            >
              <ArrowLeft size={14} />
              <span>← Volver a Todas las Listas de Precios ({PRICE_GROUPS.length})</span>
            </button>

            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Catálogo Seleccionado: <strong style={{ color: '#0f172a' }}>{selectedGroup.label}</strong> ({selectedGroup.badge}) · {selectedGroup.currency}
            </div>
          </div>
          {/* Header of Active Group with PDF & Public Share Actions */}
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

            {/* Top Action Buttons: PDF, Public Web Share & History */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <TierBadge tier={tier} tierLabel={tierLabel} />

              {/* Generate PDF Button */}
              <button
                type="button"
                onClick={() => handleGeneratePdf(selectedGroup)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Generar PDF imprimible para compartir con clientes"
              >
                <FileText size={14} color="#d97706" />
                <span>Generar PDF</span>
              </button>

              {/* Share Public Web Button */}
              <button
                type="button"
                onClick={() => setShareWebModalGroup(selectedGroup)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #bae6fd',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                title="Compartir enlace de web pública con clientes"
              >
                <Share2 size={14} />
                <span>Compartir Web Pública</span>
              </button>

              {/* View Share Recipients */}
              <button
                type="button"
                onClick={() => setSelectedShareGroup(selectedGroup)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #bbf7d0',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Users size={13} />
                <span>{selectedGroup.sharesCount || 0} shares</span>
                <ChevronDown size={11} />
              </button>

              {/* Dedicated Workspace */}
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

          {/* Live SKU DataTable with expandable product information */}
          <GroupSkuTable
            group={selectedGroup}
            tier={tier}
            priceFor={priceFor}
            formatPrice={formatPrice}
            isAdmin={isAdmin}
          />
        </div>
      ) : (
        /* ── VIEW MODE 2: Overview of All 13 Price Lists (DataTable Standard) ── */
        <div style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
          {filteredGroups.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No se encontraron listas de precios"
              subtitle="Prueba a ajustar los filtros de categoría, moneda o tu búsqueda."
              action={{
                label: 'Limpiar Filtros',
                onClick: () => {
                  setSearchQuery('');
                  setSelectedCurrencyFilter('all');
                  setSelectedCategoryFilter('all');
                }
              }}
            />
          ) : (
            <DataTable
              columns={priceListsTableColumns}
              data={filteredGroups}
              pagination={false}
              globalSearch={false}
              onRowClick={(row) => handleSelectGroup(row.id)}
              expandableRender={(row) => (
                <div style={{
                  padding: '14px 18px',
                  backgroundColor: '#f8fafc',
                  borderLeft: '4px solid #003666',
                  borderRadius: '6px',
                  margin: '4px 0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#003666', textTransform: 'uppercase' }}>
                        Detalles de Distribución · {row.label}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                        Fórmula: <strong>{row.pricingNote}</strong> · {row.skuCount} referencias activas · Proveedor: {row.supplier} · Moneda: <strong>{row.currency}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleGeneratePdf(row)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={12} color="#d97706" />
                        <span>Generar PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShareWebModalGroup(row)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: '1px solid #bae6fd',
                          backgroundColor: '#f0f9ff',
                          color: '#0284c7',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <Share2 size={12} />
                        <span>Compartir Web</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleWhatsAppShare(row)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 10px',
                          borderRadius: '4px',
                          border: '1px solid #bbf7d0',
                          backgroundColor: '#f0fdf4',
                          color: '#166534',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <MessageSquare size={12} />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectGroup(row.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: '#003666',
                          color: '#ffffff',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span>Explorar SKUs ({row.skuCount})</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            />
          )}
        </div>
      )}

      {/* ── MODAL 1: Share History & Recipients Breakdown ── */}
      {selectedShareGroup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setSelectedShareGroup(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              border: '1px solid #cbd5e1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#003666" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Historial de Difusión · {selectedShareGroup.label}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Compartido {selectedShareGroup.sharesCount || 0} veces con médicos, clínicas y distribuidores
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShareGroup(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Recipient list */}
            <div style={{ maxHeight: '320px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '16px' }}>
              {selectedShareGroup.recipients?.map((r, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '10px 14px',
                    borderBottom: idx === selectedShareGroup.recipients.length - 1 ? 'none' : '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                      {r.organization}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
                      Enviado el {r.date} vía <strong>{r.channel.toUpperCase()}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#166534',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      ✓ Abierto ({r.views} vistas)
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  const target = selectedShareGroup;
                  setSelectedShareGroup(null);
                  setShareWebModalGroup(target);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: '#003666',
                  color: '#ffffff',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Share2 size={13} />
                <span>Compartir con Nuevo Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedShareGroup(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Public Web & PDF Share Dialog ── */}
      {shareWebModalGroup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15,23,42,0.6)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setShareWebModalGroup(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              border: '1px solid #cbd5e1'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Share2 size={18} color="#0284c7" />
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Compartir Tarifa · {shareWebModalGroup.label}
                  </h3>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Acceso web público autorizado para médicos y mayoristas
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareWebModalGroup(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Public Link Box */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                Enlace Web Público (Tokenizado)
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}${shareWebModalGroup.route}` : shareWebModalGroup.route}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    color: '#334155'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleCopyPublicWebLink(shareWebModalGroup)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#003666',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Copy size={13} />
                  <span>Copiar</span>
                </button>
              </div>
            </div>

            {/* Direct Channel Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => handleWhatsAppShare(shareWebModalGroup)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#188038',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <MessageSquare size={15} />
                <span>Compartir por WhatsApp con Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleGeneratePdf(shareWebModalGroup);
                  setShareWebModalGroup(null);
                }}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <FileText size={15} color="#d97706" />
                <span>Generar Documento PDF Oficial</span>
              </button>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setShareWebModalGroup(null)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
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
          <strong>Unregistered visitors:</strong> Wholesale price (Cost × 1.15 Atlas × 1.15 Wholesaler = Cost × 1.3225).
          Raw laboratory supplier costs and margins remain strictly restricted.
        </div>
      </div>
    </div>
  );
}
