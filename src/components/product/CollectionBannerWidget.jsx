"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, Droplets, Zap, Dna, ArrowRight, Layers, ArrowUpRight, ShieldCheck } from '@/lib/icons';

export function resolveBrandCollectionInfo(product) {
  if (!product) return null;
  const id = String(product.id || '').toLowerCase();
  const slug = String(product.slug || '').toLowerCase();
  const name = String(product.name || product.title || '').toLowerCase();
  const brand = String(product.brand || product.supplierName || product.supplier || '').toLowerCase();
  const cat = String(product.category || '').toLowerCase();

  // 1. Colway
  if (id.includes('colway') || slug.includes('colway') || brand.includes('colway') || name.includes('colway')) {
    const isColvita = id.includes('colvita') || slug.includes('colvita') || name.includes('colvita') || cat.includes('supplement') || product.is_supplement || product.isSupplement;
    const isFacial = id.includes('diamond') || id.includes('peeling') || id.includes('vege') || id.includes('wash') || id.includes('lip') || name.includes('diamond') || name.includes('facial');
    const isConditioner = id.includes('conditioner') || name.includes('conditioner');
    const isShampoo = id.includes('shampoo') || name.includes('shampoo');

    if (isColvita) {
      return {
        brandSlug: 'colway',
        brandName: 'Colway',
        collectionTitle: 'Colway® Bioactive Collagen & Cellular Nutriceuticals',
        collectionUrl: '/collection/colway',
        accentColor: '#16a34a',
        accentBg: '#f0fdf4',
        borderColor: '#bbf7d0',
        badgeLabel: 'Colway® Nutriceuticals',
        icon: Sparkles,
        systemName: 'Colway® Cellular Bio-Collagen System',
        systemSubtitle: 'Sublimation Freeze-Dried Active Fish Tropocollagen + Marine Bladderwrack Algae + Vitamin E',
        ctaLabel: 'Explore Colway® Collection',
        quickChips: ['Triple Helix Tropocollagen', 'Fucus Algae', 'Vitamin E', 'Joint & Connective Matrix', 'Skin Elasticity']
      };
    }

    if (isFacial) {
      const isPeeling = id.includes('peeling') || name.includes('peeling');
      const isCream = id.includes('cream') || id.includes('blue-diamond') || name.includes('cream');

      return {
        brandSlug: 'colway',
        brandName: 'Colway',
        collectionTitle: 'Colway® Diamond Cosmeceuticals & Neocollagenesis',
        collectionUrl: '/collection/colway',
        accentColor: '#2563eb',
        accentBg: '#eff6ff',
        borderColor: '#bfdbfe',
        badgeLabel: 'Colway® Diamond Skincare',
        icon: Sparkles,
        systemName: 'Colway® Blue Diamond Cellular Neo-Collagenesis',
        systemSubtitle: 'VEP-Peptides + Gemmological Diamond Dust + Biologically Active Tropocollagen',
        ctaLabel: 'Explore Colway® Dermocosmetics',
        steps: [
          { num: 'Paso 1', name: 'Blue Diamond Peeling', active: isPeeling, url: '/p/colway-blue-diamond-peeling' },
          { num: 'Paso 2', name: 'Blue Diamond Cream', active: isCream, url: '/p/colway-blue-diamond-cream' }
        ]
      };
    }

    return {
      brandSlug: 'colway',
      brandName: 'Colway',
      collectionTitle: 'Colway® Trichology & Scalp System',
      collectionUrl: '/collection/colway',
      accentColor: '#0d9488',
      accentBg: '#f0fdfa',
      borderColor: '#ccfbf1',
      badgeLabel: 'Colway® Hair Restoration',
      icon: Sparkles,
      systemName: 'Colway® Hair Strengthening System',
      systemSubtitle: '2-Step Synergistic Protocol (Native Tropocollagen + Baicapil 2% + Micronized Diosmin)',
      ctaLabel: 'View Full Colway® Collection',
      steps: [
        { num: 'Paso 1', name: 'Strengthening Shampoo', active: isShampoo, url: '/p/colway-strengthening-shampoo' },
        { num: 'Paso 2', name: 'Strengthening Conditioner', active: isConditioner, url: '/p/colway-strengthening-conditioner' }
      ]
    };
  }

  // 2. Bloodo Diagnostics
  if (id.includes('bloodo') || slug.includes('bloodo') || brand.includes('bloodo') || name.includes('bloodo') ||
      ((cat.includes('diagnostic') || id.includes('test')) && (product.sampleType?.includes('DBS') || name.includes('dbs')))) {
    return {
      brandSlug: 'bloodo',
      brandName: 'Bloodo™ Diagnostics',
      collectionTitle: 'Bloodo™ Capillary Blood Diagnostics',
      collectionUrl: '/collection/bloodo',
      accentColor: '#e11d48',
      accentBg: '#fff1f2',
      borderColor: '#ffe4e6',
      badgeLabel: 'Bloodo™ Diagnostic Suite',
      icon: Droplets,
      systemName: 'Bloodo™ CE-IVDR Capillary Diagnostics Suite',
      systemSubtitle: '6 Accredited Panels: NAD+, Testosterone, Cortisol, HbA1c, Omega-3/6, Vitamin D3',
      ctaLabel: 'View All 6 Bloodo™ Kits',
      quickChips: ['NAD+ Cellular', 'Testosterone+', 'Cortisol CAR', 'HbA1c 90-Day', 'Omega Ratio', 'Vitamin D3']
    };
  }

  // 3. UltraPerson Personalization
  if (id.includes('ultraperson') || slug.includes('ultraperson') || brand.includes('ultraperson') || name.includes('ultraperson') || brand.includes('pharmapolis')) {
    return {
      brandSlug: 'ultraperson',
      brandName: 'UltraPerson™ Protocols',
      collectionTitle: 'UltraPerson™ Clinical Supplements',
      collectionUrl: '/collection/ultraperson',
      accentColor: '#7c3aed',
      accentBg: '#faf5ff',
      borderColor: '#f3e8ff',
      badgeLabel: 'UltraPerson™ Protocols',
      icon: Zap,
      systemName: 'UltraPerson™ Targeted Personalization System',
      systemSubtitle: '6 Formulations in Acid-Resistant Vegan HPMC Capsules · 3-Month AAA Protocols',
      ctaLabel: 'Explore UltraPerson™ Collection',
      quickChips: ['Energy & Vitality', 'Cognitive Focus', 'Stress & Cortisol', 'Sleep Restoration', 'Immune Defense', 'Longevity Renewal']
    };
  }

  // 4. ETERNA DX Multi-Omics
  if (id.includes('eterna') || slug.includes('eterna') || brand.includes('eterna') || name.includes('eterna')) {
    return {
      brandSlug: 'eterna',
      brandName: 'ETERNA® Multi-Omics',
      collectionTitle: 'ETERNA® Longevity DX Diagnostics',
      collectionUrl: '/collection/eterna',
      accentColor: '#0284c7',
      accentBg: '#f0f9ff',
      borderColor: '#e0f2fe',
      badgeLabel: 'ETERNA® Multi-Omics Collection',
      icon: Dna,
      systemName: 'ETERNA® Clinical Longevity & Organ Proteomics Platform',
      systemSubtitle: 'High-Throughput Genomics (+700,000 SNPs) & Organ-Specific Biological Age Proteomics',
      ctaLabel: 'Explore ETERNA® Collection',
      quickChips: ['Saliva DNA (+700k SNPs)', 'Organ Proteomics', 'AgeScan Basic', 'AgeScan Advanced', 'Wearable Telemetry']
    };
  }

  return null;
}

/**
 * ── 1. Interactive Collection Badge Pill (for Hero Badges row) ──
 */
export function CollectionBadgePill({ product, style = {} }) {
  const info = resolveBrandCollectionInfo(product);
  if (!info) return null;

  const Icon = info.icon;

  return (
    <Link
      href={info.collectionUrl}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '999px',
        background: info.accentBg,
        border: `1px solid ${info.borderColor}`,
        color: info.accentColor,
        fontSize: '0.72rem',
        fontWeight: 700,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        letterSpacing: '0.02em',
        ...style
      }}
      title={`Explore all ${info.brandName} in the Collection`}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.borderColor = info.accentColor;
        e.currentTarget.style.boxShadow = `0 3px 8px ${info.accentColor}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = info.borderColor;
        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
      }}
    >
      <Icon size={12} />
      <span>{info.badgeLabel}</span>
      <ArrowUpRight size={11} style={{ opacity: 0.8 }} />
    </Link>
  );
}

/**
 * ── 2. Companion System & Collection Banner (Full-width card in overview) ──
 */
export function CollectionCompanionBanner({ product, style = {} }) {
  const info = resolveBrandCollectionInfo(product);
  if (!info) return null;

  const Icon = info.icon;

  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${info.accentBg} 0%, #ffffff 100%)`,
        border: `1px solid ${info.borderColor}`,
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
        ...style
      }}
    >
      {/* Left side: System Icon & Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '280px', flex: '1 1 340px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: info.accentColor,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 3px 8px ${info.accentColor}30`
          }}
        >
          <Icon size={18} />
        </div>
        <div>
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: info.accentColor, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>
            Part of the Clinical Collection
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.25 }}>
            {info.systemName}
          </div>
          <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
            {info.systemSubtitle}
          </div>

          {/* If 2-step routine (like Colway) */}
          {info.steps && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {info.steps.map((st, i) => (
                <Link
                  key={i}
                  href={st.url}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    background: st.active ? info.accentColor : '#ffffff',
                    color: st.active ? '#ffffff' : '#334155',
                    border: `1px solid ${st.active ? info.accentColor : '#cbd5e1'}`
                  }}
                >
                  <span style={{ opacity: st.active ? 0.9 : 0.6 }}>{st.num}:</span>
                  <span>{st.name}</span>
                  {st.active && <span style={{ fontSize: '0.65rem' }}>✓ (Active)</span>}
                </Link>
              ))}
            </div>
          )}

          {/* Quick chips if Bloodo / UltraPerson / Eterna */}
          {info.quickChips && (
            <div style={{ display: 'flex', gap: '5px', marginTop: '8px', flexWrap: 'wrap' }}>
              {info.quickChips.map((chip, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    color: '#475569',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    padding: '2px 7px',
                    borderRadius: '4px'
                  }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Button to Collection */}
      <Link
        href={info.collectionUrl}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '8px',
          background: info.accentColor,
          color: '#ffffff',
          fontSize: '0.8rem',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: `0 2px 6px ${info.accentColor}35`,
          transition: 'all 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = `0 4px 12px ${info.accentColor}50`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = `0 2px 6px ${info.accentColor}35`;
        }}
      >
        <span>{info.ctaLabel}</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
