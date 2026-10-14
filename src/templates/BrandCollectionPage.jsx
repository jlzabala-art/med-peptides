"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { usePageMeta } from '../hooks/usePageMeta';
import {
  Search, SlidersHorizontal, LayoutGrid, List, Sparkles, Shield, Activity,
  Zap, HeartPulse, Check, ArrowRight, ExternalLink, Dna,
  Droplets, Microscope, FileText, FlaskConical, Award, ShieldCheck, CheckCircle2, ChevronRight
} from '@/lib/icons';
import '../styles/collection_shared.css';

// Brand configurations with clinical metadata and 4 KPIs (Regla Golden #22)
const BRAND_CONFIGS = {
  colway: {
    name: 'Colway® International',
    title: 'Colway® Native Collagen & Follicular Trichology',
    badge: 'Clinical Dermocosmetics & Trichology Desk',
    badgeColor: '#0d9488',
    subtitle: 'Biologically active native tropocollagen, 5α-reductase follicular inhibition & medical cosmeceuticals formulated to preserve the cuticular extracellular matrix and support hair restoration protocols.',
    heroImage: '/images/products/colway/shampoo.png',
    accentColor: '#0d9488',
    kpis: [
      { label: 'Active Tropocollagen', value: 'Type I, II & XVII', sub: 'Native Triple Helix Conformation', icon: Sparkles, color: '#0d9488' },
      { label: 'Scalp DHT Blockade', value: '5α-Reductase', sub: 'Zinc PCA & Biotin Co-Enzyme Matrix', icon: Shield, color: '#0284c7' },
      { label: 'Anagen Phase Boost', value: 'Baicapil™ 2%', sub: 'Caffeine-Driven Microvascular IGF-1', icon: Zap, color: '#d97706' },
      { label: 'Regulatory Compliance', value: 'EU Cosmetics Reg.', sub: 'Dermatologically & Clinically Tested', icon: Award, color: '#16a34a' }
    ],
    categories: [
      { id: 'all', label: 'All Products' },
      { id: 'hair', label: 'Hair Strengthening System' },
      { id: 'collagen', label: 'Native Collagen' },
      { id: 'cosmeceutical', label: 'Clinical Cosmeceuticals' }
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
      { id: 'all', label: 'All Tests' },
      { id: 'bioenergetics', label: 'Cellular Bioenergetics' },
      { id: 'hormones', label: 'Endocrine & Cortisol' },
      { id: 'metabolic', label: 'Metabolic & Glycation' },
      { id: 'micronutrients', label: 'Lipids & Vitamins' }
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
  }
};

function resolveBrandProductImage(product, brandSlug) {
  if (product.image_url) return product.image_url;
  if (product.imageUrl) return product.imageUrl;
  if (product.image) return product.image;

  const id = (product.id || '').toLowerCase();
  const name = (product.name || product.title || '').toLowerCase();

  if (brandSlug === 'colway') {
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
  brandSlug = 'colway',
  products = [],
  onSelectProduct,
  updateCart,
  toggleCompare
}) {
  const router = useRouter();
  const config = BRAND_CONFIGS[brandSlug] || BRAND_CONFIGS.colway;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('featured');
  const [addedItem, setAddedItem] = useState(null);

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

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const text = `${p.id} ${p.name || ''} ${p.title || ''} ${p.description || ''} ${p.desc || ''} ${JSON.stringify(p.activeIngredients || [])}`.toLowerCase();
        return text.includes(q);
      });
    }

    // Category / tag filter
    if (selectedCategory !== 'all') {
      list = list.filter(p => {
        const str = `${p.id} ${p.name || ''} ${p.title || ''} ${p.category || ''} ${p.subcategory || ''} ${JSON.stringify(p.goalIds || [])}`.toLowerCase();
        return str.includes(selectedCategory);
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
      const variant = product.variants?.[0] || { id: `${product.id}-default`, presentation: product.presentation || 'Standard' };
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
    <div className="brand-collection-root" style={{ minHeight: '100vh', background: 'var(--col-surface, #F4F8FB)', paddingBottom: '5rem' }}>
      {/* ── Breadcrumb Bar ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '1rem 2rem 0' }}>
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* ── Collection Hero Header ── */}
      <header className="col-header" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', marginTop: '0.75rem', padding: '2.5rem 0' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '850px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', background: `${config.badgeColor}15`, border: `1px solid ${config.badgeColor}35`, color: config.badgeColor, padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              <Sparkles size={13} />
              <span>{config.badge}</span>
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 850, color: '#0f172a', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.15 }}>
              {config.title}
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, margin: 0, fontWeight: 450 }}>
              {config.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* ── 4 KPIs Grid (Golden Rule #22) ── */}
      <section style={{ maxWidth: '1440px', margin: '-1.25rem auto 2rem', padding: '0 2rem' }}>
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
                <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${kpi.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: kpi.color, flexShrink: 0 }}>
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

      {/* ── Main Controls & Filtering (Search, Categories, View Toggle) ── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: '480px' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder={`Search in ${config.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.5rem',
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

          {/* Category Filter Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {config.categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat.id ? config.accentColor : '#e2e8f0',
                  background: selectedCategory === cat.id ? `${config.accentColor}15` : '#ffffff',
                  color: selectedCategory === cat.id ? config.accentColor : '#475569',
                  fontSize: '0.8rem',
                  fontWeight: selectedCategory === cat.id ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Toolbar: View mode & Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', color: '#334155', background: '#fff' }}
            >
              <option value="featured">Featured</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
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
                onClick={() => setViewMode('list')}
                title="List View"
                style={{ padding: '6px 10px', background: viewMode === 'list' ? '#f1f5f9' : '#ffffff', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? '#0f172a' : '#94a3b8' }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Product Cards Grid / List ── */}
        {filteredProducts.length === 0 ? (
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '4rem 2rem', textAlign: 'center' }}>
            <FlaskConical size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem' }}>No products found</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 1.5rem' }}>Try clearing your search query or selecting a different category.</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              style={{ padding: '8px 18px', borderRadius: '8px', background: config.accentColor, color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
              gap: '1.5rem'
            }}
          >
            {filteredProducts.map(product => {
              const imageSrc = resolveBrandProductImage(product, brandSlug);
              const displayName = product.canonicalName || product.name || product.title || product.id;
              const sub = product.subtitle || product.role || product.therapeuticArea || product.categoryLabel || product.category || '';
              const desc = product.overview_summary || product.description || product.desc || '';
              const isAdded = addedItem === product.id;

              // Key highlight ingredients or badges
              const keyIngredients = Array.isArray(product.ingredients)
                ? product.ingredients.slice(0, 4).map(i => i.name)
                : Array.isArray(product.activeIngredients)
                ? product.activeIngredients.slice(0, 4).map(i => i.name)
                : [];

              const variantInfo = product.variants?.[0]?.presentation || product.presentation || product.dailyServing || product.sampleType || null;

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductClick(product)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: viewMode === 'grid' ? 'column' : 'row',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.09)';
                    e.currentTarget.style.borderColor = '#cbd5e1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }}
                >
                  {/* Product Visual Area */}
                  <div
                    style={{
                      width: viewMode === 'grid' ? '100%' : '260px',
                      height: viewMode === 'grid' ? '220px' : 'auto',
                      minHeight: viewMode === 'list' ? '200px' : 'auto',
                      background: 'radial-gradient(circle at center, #f8fafc 0%, #f1f5f9 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '1.5rem',
                      position: 'relative',
                      flexShrink: 0
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt={displayName}
                      style={{
                        maxHeight: '100%',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.12))'
                      }}
                      loading="lazy"
                    />
                    {variantInfo && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '12px',
                          background: 'rgba(15, 23, 42, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffffff',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '6px',
                          letterSpacing: '0.02em'
                        }}
                      >
                        {variantInfo}
                      </span>
                    )}
                  </div>

                  {/* Product Details Area */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: config.accentColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {config.name}
                        </span>
                        {product.sampleType && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                            {product.sampleType}
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                        {displayName}
                      </h3>

                      {sub && (
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', marginBottom: '8px' }}>
                          {sub}
                        </div>
                      )}

                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 1rem 0', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {desc}
                      </p>

                      {/* Active Ingredients / Bioactive Tags */}
                      {keyIngredients.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '1.25rem' }}>
                          {keyIngredients.map((ing, i) => (
                            <span
                              key={i}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#334155',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                padding: '2px 8px',
                                borderRadius: '6px'
                              }}
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0f172a',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        <span>Clinical Monograph</span>
                        <ChevronRight size={15} color={config.accentColor} />
                      </button>

                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        style={{
                          background: isAdded ? '#16a34a' : config.accentColor,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '7px 14px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} /> Added
                          </>
                        ) : (
                          <>
                            <span>Add / Order</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
