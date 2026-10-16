"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import PublicUnifiedHeader from '../components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '../components/shared/PublicUnifiedFooter';
import DiagnosticReportVisualPreview from '../components/diagnostic/DiagnosticReportVisualPreview';
import BloodoCollectionSidebar from '../components/diagnostic/BloodoCollectionSidebar';
import EternaCollectionSidebar from '../components/diagnostic/EternaCollectionSidebar';
import UltraPersonCollectionSidebar from '../components/diagnostic/UltraPersonCollectionSidebar';
import ColwayCollectionSidebar from '../components/diagnostic/ColwayCollectionSidebar';
import PublicInstitutionalInquiryDrawer from '../components/shared/PublicInstitutionalInquiryDrawer';
import ColwayTrichologyStemCellShowcase from '../components/product/ColwayTrichologyStemCellShowcase';
import CopyableId from '../components/ui/CopyableId';
import StatusBadge from '../components/ui/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  Search, SlidersHorizontal, LayoutGrid, List, Sparkles, Shield, Activity,
  Zap, HeartPulse, Check, ArrowRight, ExternalLink, Dna,
  Droplets, Microscope, FileText, FlaskConical, Award, ShieldCheck, CheckCircle2, ChevronRight,
  ChevronDown, Layers, Eye, Lock, LogIn, User
} from '@/lib/icons';
import '../styles/collection_shared.css';

// Brand configurations with clinical metadata and 4 KPIs (Regla Golden #22)
const BRAND_CONFIGS = {
  colway: {
    name: 'Colway',
    title: 'Colway® Bioactive Native Collagen, Cosmeceuticals & Trichology',
    badge: 'Clinical Nutriceuticals, Dermocosmetics & Trichology Desk',
    badgeColor: '#0d9488',
    subtitle: 'Polish pioneer in biologically active native freshwater fish tropocollagen (triple-helix preserved), cellular oral nutriceuticals, advanced diamond cosmeceuticals, and medical follicular trichology.',
    heroImage: '/images/products/colway/colway-dermatology-clinic-hero-v2.jpg',
    accentColor: '#0d9488',
    kpis: [
      { label: 'Active Tropocollagen', value: 'Triple Helix', sub: 'Sublimation Freeze-Dried Active Form', icon: Sparkles, color: '#0d9488' },
      { label: 'Diamond Peptides', value: 'VEP-Carrier', sub: 'Cellular Neocollagenesis & Remodeling', icon: Award, color: '#2563eb' },
      { label: 'Scalp Trichology', value: 'Baicapil™ 2%', sub: 'Follicular Anchorage & Diosmin', icon: Zap, color: '#d97706' },
      { label: 'Regulatory Compliance', value: 'EU Reg. & GMP', sub: 'CPNP Registered & Dermatologically Tested', icon: ShieldCheck, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Formulations (8)' },
      { id: 'nutraceutical', label: 'Nutraceuticals & Systemic Collagen (Colvita)' },
      { id: 'facial', label: 'Facial Cosmeceuticals & Blue Diamond' },
      { id: 'trichology', label: 'Trichology & Hair Strengthening System' }
    ]
  },
  bloodo: {
    name: 'Bloodo™ Diagnostics',
    title: 'Bloodo™ Capillary Blood Diagnostics & CE-IVDR Test Kits',
    badge: 'CE-IVDR Certified Laboratory Diagnostics',
    badgeColor: '#dc2626',
    subtitle: 'Precision Dried Blood Spot (DBS) tests analyzing intracellular cellular bioenergetics, diurnal endocrine rhythms, and 90-day metabolic glycation with ISO 15189 European laboratory validation.',
    heroImage: '/images/products/bloodo/nad.jpg',
    accentColor: '#e11d48',
    kpis: [
      { label: 'Accredited Biomarkers', value: '6 CE-IVDR Panels', sub: 'NAD+, Testosterone, Cortisol, HbA1c', icon: Microscope, color: '#e11d48' },
      { label: 'Laboratory Quality', value: 'ISO 15189', sub: 'European Reference Diagnostic Lab', icon: Award, color: '#0284c7' },
      { label: 'Sample Technology', value: 'Capillary DBS', sub: '100% Painless Finger-Prick Collection', icon: Droplets, color: '#d97706' },
      { label: 'Result Turnaround', value: '48 – 72 Hours', sub: 'Direct Quantitative Portal Delivery', icon: HeartPulse, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Tests (6)' },
      { id: 'nad', label: 'Bioenergetics (NAD+)' },
      { id: 'cortisol', label: 'Endocrine & Cortisol CAR' },
      { id: 'testosterone', label: 'Androgens & Testosterone+' },
      { id: 'hba1c', label: 'Glycation & HbA1c' },
      { id: 'omega', label: 'Lipidomics & Omega-3' },
      { id: 'vitamin-d', label: 'Micronutrients & Vit D3' }
    ]
  },
  ultraperson: {
    name: 'UltraPerson™ Personalization',
    title: 'UltraPerson™ Personalization Protocols & Clinical Supplements',
    badge: 'PharmaPolis Targeted Clinical Formulations',
    badgeColor: '#7c3aed',
    subtitle: 'Medical-grade targeted nutritional cofactors engineered by PharmaPolis for synergy with precision peptide protocols, mitochondrial rejuvenation, and sustained daily physiological resilience.',
    heroImage: '/assets/vials/eterna-longevity.png',
    accentColor: '#7c3aed',
    kpis: [
      { label: 'Targeted Protocols', value: '6 Formulations', sub: 'Synergistic with Peptide Therapies', icon: FlaskConical, color: '#7c3aed' },
      { label: 'Capsule Technology', value: 'Vegan HPMC', sub: 'Acid-Resistant Delayed Release', icon: ShieldCheck, color: '#0284c7' },
      { label: 'Clean Standard', value: '0% Allergens', sub: 'Non-GMO, Gluten-Free, 100% Vegan', icon: Award, color: '#16a34a' },
      { label: 'AAA Protocol', value: '3-Month Formulations', sub: 'Standardized 500 mg Active Actives/Day', icon: Zap, color: '#ea580c' }
    ],
    categories: [
      { id: 'all', label: 'All Formulations' },
      { id: 'energy', label: 'Energy & Metabolic' },
      { id: 'cognitive', label: 'Cognitive & Clarity' },
      { id: 'stress', label: 'Stress & Cortisol' },
      { id: 'sleep', label: 'Sleep & Circadian' },
      { id: 'longevity', label: 'Longevity & Cellular' }
    ]
  },
  eterna: {
    name: 'ETERNA® Longevity DX',
    title: 'ETERNA® Multi-Omics Diagnostics & Organ Proteomics',
    badge: 'High-Throughput Multi-Omics Platform',
    badgeColor: '#0284c7',
    subtitle: 'Integrated longevity platform combining fixed genomic baseline (+700,000 SNPs), organ-specific biological age proteomics, and longitudinal blood telemetry processed by Eurofins.',
    heroImage: '/images/products/eterna/eterna-kit-box.png',
    accentColor: '#0284c7',
    kpis: [
      { label: 'Genetic Scope', value: '+700,000 SNPs', sub: 'High-Throughput Saliva DNA Array', icon: Dna, color: '#0284c7' },
      { label: 'Organ Proteomics', value: 'Blood Serum/Plasma', sub: 'Organ-Specific Biological Age Clocks', icon: Droplets, color: '#e11d48' },
      { label: 'Laboratory Partner', value: 'Eurofins Genomics', sub: 'ISO 17025 Clinical NGS Processing', icon: Award, color: '#16a34a' },
      { label: 'Wearable Sync', value: 'Continuous Telemetry', sub: 'Apple Health, Oura, Garmin Integration', icon: HeartPulse, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Tests & Services' },
      { id: 'genomics', label: 'Genomics & Saliva DNA' },
      { id: 'proteomics', label: 'Organ Proteomics & Blood' },
      { id: 'platform', label: 'Digital Platform & Pro' }
    ]
  },
  teletest: {
    name: 'TeleTest Analytika®',
    title: 'TeleTest Analytika® Clinical Genomics & Laboratory Diagnostics',
    badge: 'ISO 17025 European Reference Laboratory',
    badgeColor: '#0284c7',
    subtitle: 'European reference clinical laboratory authorized by Generalitat de Catalunya (E08750211) & ISO 17025 accredited. High-precision HLA immunogenetics, autoimmune celiac predisposition, and ICP-MS/MS hair tissue mineral & heavy metals toxicology.',
    heroImage: '/images/products/teletest/hla-autoinmunidad.svg',
    accentColor: '#0284c7',
    kpis: [
      { label: 'Laboratory Quality', value: 'ISO 17025', sub: 'Generalitat de Catalunya E08750211', icon: Award, color: '#16a34a' },
      { label: 'Analytical Method', value: 'ICP-MS/MS & qPCR', sub: 'High-Resolution Mass Spectrometry', icon: Microscope, color: '#0284c7' },
      { label: 'Diagnostic Scope', value: '33 Elements & HLA', sub: 'Hair Toxicology & Immunogenetics', icon: Dna, color: '#d97706' },
      { label: 'Digital Reports', value: 'FNMT Signed', sub: 'Digital Validation 5-7 Workdays', icon: ShieldCheck, color: '#7c3aed' }
    ],
    categories: [
      { id: 'all', label: 'All Diagnostic Panels (5)' },
      { id: 'genomics', label: 'Genomics & Autoimmunity (HLA)' },
      { id: 'toxicology', label: 'Hair Mineral Analysis (HTMA)' },
      { id: 'metabolic', label: 'Omega Fatty Acids & Inflammatory Balance' },
      { id: 'detox', label: 'Pharmacogenetics & Metabolizer Detox' }
    ]
  }
};

function resolveBrandProductImage(product, brandSlug) {
  if (product.image_url) return product.image_url;
  if (product.imageUrl) return product.imageUrl;
  if (product.image) return product.image;

  const id = (product.id || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  if (brandSlug === 'teletest') {
    if (id.includes('hla') || id.includes('gnt')) return '/images/products/teletest/hla-autoinmunidad.svg';
    if (id.includes('celiac') || id.includes('gluten')) return '/images/products/teletest/celiac-genetics.svg';
    if (id.includes('omega') || name.includes('omega')) return '/images/products/teletest/omega-test.svg';
    if (id.includes('detox') || id.includes('metabolizer') || name.includes('detox')) return '/images/products/teletest/metabolizer-detox.svg';
    if (id.includes('tox') || id.includes('pesados')) return '/images/products/teletest/heavy-metals.svg';
    return '/images/products/teletest/mineralograma-cabello.svg';
  }

  if (brandSlug === 'colway') {
    if (id.includes('colvita') || name.includes('colvita')) return '/images/products/colway/colvita.png';
    if (id.includes('trichology') || name.includes('trichology')) return '/images/products/colway/colway-trichology-banner.jpg';
    if (id.includes('vege') || name.includes('vege') || name.includes('vegan')) return '/images/products/colway/vege-collagen.png';
    if (id.includes('peeling') || name.includes('peeling')) return '/images/products/colway/blue-diamond-peeling.png';
    if (id.includes('blue-diamond') || id.includes('diamond') || name.includes('diamond') || name.includes('diament')) return '/images/products/colway/blue-diamond-cream.png';
    if (id.includes('lip') || name.includes('lip') || id.includes('balm') || name.includes('balm') || name.includes('pomadka')) return '/images/products/colway/lip-care.png';
    if (id.includes('wash') || name.includes('wash') || id.includes('gel') || name.includes('gel') || name.includes('zel')) return '/images/products/colway/washing-gel.png';
    if (id.includes('conditioner') || name.includes('conditioner')) return '/images/products/colway/conditioner.png';
    return '/images/products/colway/shampoo.png';
  }

  if (brandSlug === 'bloodo') {
    if (id.includes('nad') || name.includes('nad')) return '/images/products/bloodo/nad.jpg';
    if (id.includes('testosterone') || name.includes('testosterone')) return '/images/products/bloodo/testosterone.jpg';
    if (id.includes('cortisol') || name.includes('cortisol')) return '/images/products/bloodo/cortisol.jpg';
    if (id.includes('hba1c') || name.includes('hba1c') || name.includes('hemoglobin')) return '/images/products/bloodo/hba1c.jpg';
    if (id.includes('omega') || name.includes('omega')) return '/images/products/bloodo/omega.jpg';
    if (id.includes('vitamin-d') || name.includes('vitamin d')) return '/images/products/bloodo/vitamin-d.jpg';
    return '/images/products/bloodo/nad.jpg';
  }

  if (brandSlug === 'eterna') {
    return '/images/products/eterna/eterna-kit-box.png';
  }

  return '/images/longevity_supps.png';
}

export default function BrandCollectionPage({
  brandSlug = 'bloodo',
  products = [],
  onSelectProduct,
  updateCart,
  toggleCompare
}) {
  const router = useRouter();
  const config = BRAND_CONFIGS[brandSlug] || BRAND_CONFIGS.bloodo;
  const { user, isProfessional } = useAuth();

  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('atlas_portal_lang') || 'en';
    }
    return 'en';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortOption, setSortOption] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);
  const [expandedDetails, setExpandedDetails] = useState({});
  const [scopeMode, setScopeMode] = useState('filtered'); // 'filtered' | 'global'
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isInquiryDrawerOpen, setIsInquiryDrawerOpen] = useState(false);

  const isEs = lang === 'es';
  const canonicalUrl = `https://www.atlashealth-services.com/collection/${brandSlug}`;

  // SEO & structured data
  usePageMeta({
    title: `${config.title} | Atlas Collections`,
    description: config.subtitle,
    path: `/collection/${brandSlug}`,
  });

  const breadcrumbs = [
    { label: 'Home', path: '/' },
    { label: 'Collections', path: '/collection/peptides' },
    { label: config.name }
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Colway collection: bundle 'colway-trichology' is represented by individual shampoo and conditioner formulations
    if (brandSlug === 'colway') {
      list = list.filter(p => p.id !== 'colway-trichology' && p.slug !== 'colway-trichology');
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const text = `${p.id} ${p.name || ''} ${p.title || ''} ${p.description || ''} ${p.desc || ''} ${p.sampleType || ''} ${JSON.stringify(p.activeIngredients || [])}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Category filter
    if (selectedCategory !== 'all') {
      const cat = selectedCategory.toLowerCase();
      list = list.filter(p => {
        const str = `${p.id} ${p.name || ''} ${p.title || ''} ${p.category || ''} ${p.subcategory || ''}`.toLowerCase();
        if (brandSlug === 'colway') {
          if (cat === 'nutraceutical') return str.includes('colvita') || str.includes('supplement') || str.includes('capsule') || str.includes('suplement');
          if (cat === 'facial') return str.includes('diamond') || str.includes('diament') || str.includes('peeling') || str.includes('vege') || str.includes('wash') || str.includes('lip') || str.includes('cream');
          if (cat === 'trichology') return str.includes('hair') || str.includes('shampoo') || str.includes('conditioner') || str.includes('trichology') || str.includes('szampon') || str.includes('odzywka');
        }
        return str.includes(cat);
      });
    }

    // Sorting
    if (sortOption === 'name-asc') {
      list.sort((a, b) => (a.name || a.title || '').localeCompare(b.name || b.title || ''));
    } else if (sortOption === 'name-desc') {
      list.sort((a, b) => (b.name || b.title || '').localeCompare(a.name || a.title || ''));
    }

    return list;
  }, [products, searchQuery, selectedCategory, sortOption]);

  const toggleExpand = (productId, e) => {
    e?.stopPropagation();
    setExpandedDetails(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleProductClick = (product) => {
    if (onSelectProduct) {
      onSelectProduct(product.name || product.title);
    } else {
      const slug = product.slug || product.id;
      router.push(`/p/${slug}`);
    }
  };

  const handleQuickAdd = (product, e) => {
    e?.stopPropagation();
    if (updateCart) {
      const variant = product.variants?.[0] || { id: `${product.id}-default`, presentation: product.presentation || 'Standard Kit' };
      updateCart({
        id: product.id,
        name: product.name || product.title,
        price: product.price || 0,
        variant
      }, 1);
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 2200);
    } else {
      handleProductClick(product);
    }
  };

  return (
    <div className="brand-collection-root" style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>
      {/* ── 1. Unified Public Header (Sticky top) ── */}
      <PublicUnifiedHeader
        track="products"
        lang={lang}
        onLangChange={setLang}
        copyUrl={canonicalUrl}
        shortUrl={canonicalUrl}
        brandHref="/c/CAT-MU9L9GBN"
        brandTitle="Atlas Health Services Clinical & Healthcare Intelligence"
        hideTier2={true}
      />

      {/* ── 2. Breadcrumbs Bar ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 2rem 0' }}>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* ── 3. Google Cloud Hero Header ── */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', marginTop: '0.75rem', padding: '2.5rem 0 2rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '900px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              alignSelf: 'flex-start',
              background: `${config.badgeColor}15`,
              border: `1px solid ${config.badgeColor}35`,
              color: config.badgeColor,
              padding: '4px 12px',
              borderRadius: '16px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              <Sparkles size={13} />
              <span>{config.badge}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 3.6vw, 2.85rem)', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>
              {config.title}
            </h1>
            <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 450 }}>
              {config.subtitle}
            </p>
          </div>
          {brandSlug === 'colway' && (
            <div style={{ marginTop: '1.5rem', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 24px rgba(15, 23, 42, 0.08)', border: '1px solid #e2e8f0' }}>
              <img
                src="/images/products/colway/colway-dermatology-clinic-hero-v2.jpg"
                alt="Colway Complete Cellular Dermocosmetics & Nutricosmetics Collection"
                style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '440px', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </header>

      {/* ── 4. 4 KPIs Grid + Scope Switcher (Regla Golden #22) ── */}
      <section style={{ maxWidth: '1440px', margin: '-1.25rem auto 2.5rem', padding: '0 2rem' }}>
        {/* Scope Indicator Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '6px',
              background: scopeMode === 'filtered' ? '#e0f2fe' : '#f1f5f9',
              border: '1px solid',
              borderColor: scopeMode === 'filtered' ? '#bae6fd' : '#e2e8f0',
              color: scopeMode === 'filtered' ? '#0369a1' : '#64748b',
              fontSize: '0.74rem',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: scopeMode === 'filtered' ? '#0284c7' : '#94a3b8' }} />
              {scopeMode === 'filtered' 
                ? (isEs ? `Resultados Filtrados (${filteredProducts.length} pruebas)` : `Matching Active Filters (${filteredProducts.length} items)`)
                : (isEs ? `Colección Completa (${products.length} pruebas)` : `Entire Collection (${products.length} items)`)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setScopeMode('filtered')}
              style={{
                background: scopeMode === 'filtered' ? '#0284c7' : '#ffffff',
                color: scopeMode === 'filtered' ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: scopeMode === 'filtered' ? '#0284c7' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Filtros Activos' : 'Filtered View'}
            </button>
            <button
              onClick={() => { setScopeMode('global'); setSearchQuery(''); setSelectedCategory('all'); }}
              style={{
                background: scopeMode === 'global' ? '#0284c7' : '#ffffff',
                color: scopeMode === 'global' ? '#ffffff' : '#64748b',
                border: '1px solid',
                borderColor: scopeMode === 'global' ? '#0284c7' : '#cbd5e1',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isEs ? 'Ver Colección Global' : 'Entire Database'}
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {config.kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                }}
              >
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: `${kpi.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: kpi.color,
                  flexShrink: 0
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                    {kpi.label}
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    {kpi.value}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {kpi.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 5. GRAPHIC OVERVIEW: HOW RESULTS ARE OBTAINED & LAB REPORT MOCKUP ── */}
      {brandSlug === 'bloodo' && (
        <section style={{ maxWidth: '1440px', margin: '0 auto 2.5rem', padding: '0 2rem' }}>
          <DiagnosticReportVisualPreview lang={lang} activeTest="nad" />
        </section>
      )}


      {/* ── 6. MAIN WORKSPACE (70% Main Products Grid + 30% Sticky Sidebar) ── */}
      <section style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 2rem 5rem' }}>
        <div className="gcp-collection-workspace">
          {/* ── LEFT COLUMN: MAIN PRODUCTS & FILTERS ── */}
          <main style={{ minWidth: 0 }}>
            {/* Google Cloud Filter Bar */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              {/* Row 1: Search + View Toggle */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '480px' }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    id="catalog-search-input"
                    type="text"
                    placeholder={isEs ? `Buscar en ${config.name} (ej. NAD+, cortisol, DBS)... ⌘K` : `Search in ${config.name} (e.g. NAD+, cortisol)... ⌘K`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 2.2rem 0.65rem 2.5rem',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                    {filteredProducts.length} {filteredProducts.length === 1 ? 'test' : 'tests'}
                  </span>

                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#334155', background: '#fff' }}
                  >
                    <option value="featured">{isEs ? 'Destacados' : 'Featured'}</option>
                    <option value="name-asc">{isEs ? 'Nombre A-Z' : 'Name A-Z'}</option>
                    <option value="name-desc">{isEs ? 'Nombre Z-A' : 'Name Z-A'}</option>
                  </select>

                  <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <button
                      onClick={() => setViewMode('grid')}
                      title="Grid View"
                      style={{ padding: '6px 10px', background: viewMode === 'grid' ? '#f1f5f9' : '#ffffff', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? '#0f172a' : '#94a3b8' }}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      title="Master-Detail List"
                      style={{ padding: '6px 10px', background: viewMode === 'table' ? '#f1f5f9' : '#ffffff', border: 'none', cursor: 'pointer', color: viewMode === 'table' ? '#0f172a' : '#94a3b8' }}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Category Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', alignItems: 'center' }}>
                {config.categories.map(cat => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: isActive ? config.accentColor : '#e2e8f0',
                        background: isActive ? `${config.accentColor}15` : '#ffffff',
                        color: isActive ? config.accentColor : '#475569',
                        fontSize: '0.78rem',
                        fontWeight: isActive ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '4rem 2rem', textAlign: 'center' }}>
                <FlaskConical size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>
                  {isEs ? 'No se encontraron pruebas diagnósticas' : 'No diagnostic panels found'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>
                  {isEs ? 'Prueba limpiando los filtros o utilizando otros términos de búsqueda.' : 'Try adjusting your search criteria or resetting filters.'}
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                  style={{ padding: '8px 18px', borderRadius: '8px', background: config.accentColor, color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  {isEs ? 'Limpiar Filtros' : 'Clear Filters'}
                </button>
              </div>
            ) : (
              /* Diagnostic Products Grid / Master-Detail */
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(310px, 1fr))' : '1fr',
                gap: '1.25rem'
              }}>
                {filteredProducts.map(product => {
                  const imageSrc = resolveBrandProductImage(product, brandSlug);
                  const displayName = product.canonicalName || product.name || product.title || product.id;
                  const desc = product.overview_summary || product.description || product.desc || '';
                  const sampleType = brandSlug === 'bloodo'
                    ? (product.sampleType || 'Capillary Dried Blood Spot (DBS)')
                    : brandSlug === 'colway'
                    ? (product.volume || product.presentation || (product.is_supplement || product.id?.includes('colvita') ? '60 / 120 Capsules (Box)' : 'Dermocosmetic Formulation'))
                    : (product.sampleType || product.presentation || product.volume || 'Clinical Formulation');
                  const isExpanded = !!expandedDetails[product.id];
                  const isAdded = addedItem === product.id;

                  return (
                    <div
                      key={product.id}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#cbd5e1';
                        e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(0,0,0,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                      }}
                    >
                      {/* Card Visual Header */}
                      <div
                        onClick={() => handleProductClick(product)}
                        style={{
                          height: '180px',
                          background: 'radial-gradient(circle at center, #ffffff 0%, #f8fafc 100%)',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          cursor: 'pointer',
                          padding: '1rem'
                        }}
                      >
                        <img
                          src={imageSrc}
                          alt={displayName}
                          style={{
                            maxHeight: '140px',
                            maxWidth: '85%',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.08))'
                          }}
                        />

                        {/* Top Badges */}
                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'rgba(22, 163, 74, 0.12)',
                            color: '#15803d',
                            border: '1px solid rgba(22, 163, 74, 0.25)'
                          }}>
                            {brandSlug === 'eterna' ? 'CAP / CLIA' : brandSlug === 'ultraperson' ? 'EU GMP' : brandSlug === 'colway' ? 'EU 1223/2009' : 'CE-IVDR'}
                          </span>
                        </div>

                        {/* Professional Clinical Badge (No Prices on Public Pages) */}
                        <div style={{
                          position: 'absolute',
                          bottom: '10px',
                          right: '10px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          letterSpacing: '0.03em',
                          textTransform: 'uppercase'
                        }}>
                          Clinical Formulary
                        </div>
                      </div>

                      {/* Card Content Area */}
                      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            ID: <CopyableId value={product.id} maxLength={18} />
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> {brandSlug === 'eterna' ? 'Eurofins Genomics' : brandSlug === 'ultraperson' ? 'PharmaPolis Labs' : brandSlug === 'colway' ? 'Colway Dermocosmetics' : 'LifeLab1'}
                          </span>
                        </div>

                        <h3
                          onClick={() => handleProductClick(product)}
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            margin: '0 0 6px 0',
                            lineHeight: 1.3,
                            cursor: 'pointer'
                          }}
                        >
                          {displayName}
                        </h3>

                        <div style={{
                          fontSize: '0.75rem',
                          color: brandSlug === 'colway' ? '#0d9488' : '#0284c7',
                          fontWeight: 600,
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          {brandSlug === 'bloodo' ? <Droplets size={13} /> : <Sparkles size={13} />}
                          <span>{sampleType}</span>
                        </div>

                        <p style={{
                          fontSize: '0.82rem',
                          color: '#475569',
                          lineHeight: 1.5,
                          margin: '0 0 1rem 0',
                          display: '-webkit-box',
                          WebkitLineClamp: isExpanded ? 'unset' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {desc}
                        </p>

                        {/* Master-Detail Expandable Drawer (Regla #4) */}
                        {isExpanded && (
                          <div style={{
                            background: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            padding: '10px 12px',
                            fontSize: '0.76rem',
                            color: '#334155',
                            marginBottom: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div>
                              <strong style={{ color: '#0f172a' }}>{isEs ? 'Laboratorio de Referencia:' : 'Reference Lab:'}</strong> {
                                brandSlug === 'eterna' ? 'Eurofins Genomics (Munich/Ebersberg) · CAP / CLIA / ISO 17025' :
                                brandSlug === 'ultraperson' ? 'PharmaPolis Compounding Labs · EU GMP / cGMP' :
                                brandSlug === 'colway' ? 'Colway Biological Collagen & Dermocosmetics · EU Reg. 1223/2009' :
                                'LifeLab1 Central Lab (Vilnius) · ISO 15189'
                              }
                            </div>
                            <div>
                              <strong style={{ color: '#0f172a' }}>{isEs ? 'Tecnología / Metodología:' : 'Analytical Method:'}</strong> {
                                brandSlug === 'eterna' ? 'Illumina Infinium +700k SNPs & High-Density Proteomics' :
                                brandSlug === 'ultraperson' ? 'Vegan HPMC Delayed-Release Capsule Standardization' :
                                brandSlug === 'colway' ? 'Native Tropocollagen Triple Helix & Baicapil™ 2%' :
                                'LC-MS/MS & UHPLC Tandem MS'
                              }
                            </div>
                            <div>
                              <strong style={{ color: '#0f172a' }}>{isEs ? 'Tiempo de Respuesta / Logística:' : 'Turnaround / Logistics:'}</strong> {
                                brandSlug === 'eterna' ? '15 – 20 Business Days' :
                                brandSlug === 'ultraperson' ? '48 – 72h Compounding Dispatch' :
                                brandSlug === 'colway' ? '24 – 48h Direct Clinic Dispatch' :
                                '48 – 72h post-receipt'
                              }
                            </div>
                          </div>
                        )}

                        {/* Card Action Strip */}
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                          <button
                            type="button"
                            onClick={(e) => toggleExpand(product.id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748b',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 0'
                            }}
                          >
                            <span>{isExpanded ? (isEs ? 'Ocultar' : 'Hide Specs') : (isEs ? 'Master-Detail' : 'Specs & Lab')}</span>
                            <ChevronDown size={14} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
                          </button>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleProductClick(product)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0f172a',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Eye size={13} />
                              <span>{isEs ? 'Ficha' : 'View'}</span>
                            </button>

                            {!user ? (
                              /* Non-registered visitors cannot place clinical orders directly (Regla de Oro Usuario) */
                              <button
                                type="button"
                                onClick={() => setIsAuthModalOpen(true)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: `1px solid ${config.accentColor}`,
                                  background: 'rgba(255, 255, 255, 0.95)',
                                  color: config.accentColor,
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'all 0.15s ease'
                                }}
                                title={isEs ? 'Registro obligatorio para tramitar pedidos clínicos' : 'Registered professional account required to order'}
                              >
                                <Lock size={12} />
                                <span>{isEs ? 'Acceso Requerido' : 'Sign In to Order'}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleQuickAdd(product, e)}
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  border: 'none',
                                  background: isAdded ? '#16a34a' : config.accentColor,
                                  color: '#ffffff',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  transition: 'background 0.15s ease'
                                }}
                              >
                                {isAdded ? (
                                  <>
                                    <Check size={13} /> {isEs ? 'Añadido' : 'Added'}
                                  </>
                                ) : (
                                  <>
                                    <span>
                                      {isEs
                                        ? (brandSlug === 'bloodo' ? 'Pedir Kit' : 'Ver Formulación')
                                        : (brandSlug === 'bloodo' ? 'Order Kit' : 'View Formulation')}
                                    </span>
                                    <ArrowRight size={13} />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>

          {/* ── RIGHT COLUMN: STICKY DEDICATED SIDEBAR PER BRAND ── */}
          {brandSlug === 'bloodo' ? (
            <BloodoCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : brandSlug === 'eterna' ? (
            <EternaCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : brandSlug === 'ultraperson' ? (
            <UltraPersonCollectionSidebar lang={lang} onOpenInquiry={() => setIsInquiryDrawerOpen(true)} />
          ) : brandSlug === 'colway' ? (
            <ColwayCollectionSidebar
              lang={lang}
              onOpenInquiry={() => setIsInquiryDrawerOpen(true)}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                const el = document.getElementById('catalog-search-input');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              onSearchKeyword={(kw) => {
                setSearchQuery(kw);
                const el = document.getElementById('catalog-search-input');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            />
          ) : (
            <aside className="gcp-collection-sidebar" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', position: 'sticky', top: '90px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{config.name}</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0' }}>{config.subtitle}</p>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>{filteredProducts.length} items in catalog</div>
            </aside>
          )}
        </div>
      </section>

      {/* ── FLOATING ACTION DOCK / STICKED FOOT (Regla Golden: Centrado en pantalla principal sin tapar sidebar) ── */}
      <div className="collection-bottom-dock">
        {/* Brand Chip Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: config.accentColor
          }} />
          <span style={{ fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}>
            {config.name}
          </span>
          <span className="collection-dock-hide-mobile" style={{ fontSize: '0.74rem', color: '#64748b' }}>
            · {filteredProducts.length} {isEs ? 'ítems en catálogo' : 'items'}
          </span>
        </div>

        {/* Dock Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!user ? (
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '9999px',
                background: config.accentColor,
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            >
              <Lock size={13} />
              <span>{isEs ? 'Iniciar Sesión para Pedir' : 'Sign In to Order'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              style={{
                height: '36px',
                padding: '0 14px',
                borderRadius: '9999px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={13} />
              <span>{isEs ? 'Ver Carrito' : 'View Cart'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsInquiryDrawerOpen(true)}
            style={{
              height: '36px',
              padding: '0 12px',
              borderRadius: '9999px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              fontSize: '0.78rem',
              fontWeight: 650,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileText size={13} color="#0284c7" />
            <span className="collection-dock-hide-mobile">{isEs ? 'Consultar' : 'Inquire'}</span>
          </button>
        </div>
      </div>

      {/* ── Auth Notice Modal for Unregistered Visitors (Regla Golden Usuario) ── */}
      {isAuthModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1
              }}
            >
              ✕
            </button>

            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: `${config.accentColor}18`,
              color: config.accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                {isEs ? 'Acceso Profesional Requerido' : 'Professional Account Required'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {isEs
                  ? `Para solicitar formulaciones o kits clínicos de ${config.name}, es obligatorio disponer de una cuenta registrada como profesional sanitario, clínica o paciente autorizado.`
                  : `Ordering clinical test kits and formulations from ${config.name} requires an authorized registered professional, clinic, or verified patient account.`}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => router.push(`/auth/login?redirect=/collection/${brandSlug}`)}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: config.accentColor,
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <LogIn size={15} />
                <span>{isEs ? 'Iniciar Sesión / Acceso' : 'Sign In to My Account'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  setIsInquiryDrawerOpen(true);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  fontSize: '0.84rem',
                  fontWeight: 650,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FileText size={15} color="#0284c7" />
                <span>{isEs ? 'Solicitar Información / Consulta' : 'Request Clinical Consultation'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Context-Aware Clinical Inquiry Drawer ── */}
      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryDrawerOpen}
        onClose={() => setIsInquiryDrawerOpen(false)}
        contextType="brand_collection"
        brandType={brandSlug}
        initialEntity={{
          brandSlug,
          brandName: config.name,
          catalogCount: filteredProducts.length
        }}
      />

      {/* ── 7. Unified Public Institutional Footer (Bottom) ── */}
      <PublicUnifiedFooter lang={lang} />
    </div>
  );
}
