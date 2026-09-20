"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Search from "lucide-react/dist/esm/icons/search";
import Microscope from "lucide-react/dist/esm/icons/microscope";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Grid3X3 from "lucide-react/dist/esm/icons/grid-3-x-3";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import Leaf from "lucide-react/dist/esm/icons/leaf";
import React, { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import PublicUnifiedHeader from '../components/shared/PublicUnifiedHeader';

import { usePageMeta } from '../hooks/usePageMeta';
import dynamic from 'next/dynamic';

const FeaturedPeptides = dynamic(() => import('../sections/FeaturedPeptides'));

// ── Internationalization Dictionary ─────────────────────────────────────────
const CATALOG_I18N = {
  en: {
    metaTitle: 'Clinical Catalog | Protocols & Peptides',
    metaDesc: 'Discover evidence-based protocols and research-grade peptides — your unified clinical discovery surface.',
    breadcrumbCompendium: 'Clinical Compendium',
    breadcrumbCatalog: 'General Catalog',
    anchorCategories: 'Categories',
    anchorPeptides: 'Featured Peptides',
    calloutMessage: 'Medical Clinics: Access wholesale pricing & digital orders',
    calloutCta: 'Wholesale Access →',
    heroEyebrow: 'Clinical Discovery',
    heroTitleLine1: 'Protocols & Peptides.',
    heroTitleLine2: 'One Catalog.',
    heroSubtitle: 'Evidence-based protocols and research-grade peptides in a single unified surface.',
    searchPlaceholder: 'Search protocols, peptides, objectives…',
    browseArrow: 'Browse',
    featuredPeptides: 'Featured Peptides',
    viewAllPeptides: 'View all peptides',
    tiles: {
      protocols: {
        label: 'Protocols',
        description: 'Evidence-based clinical protocols built for real outcomes.',
      },
      peptides: {
        label: 'Peptides',
        description: 'Research-grade compounds with full purity documentation.',
      },
      supplements: {
        label: 'Supplements',
        description: 'Precision nutraceuticals and research-backed formulations.',
      },
      categories: {
        label: 'Categories',
        description: 'Browse by clinical objective — metabolic, recovery, longevity and more.',
      },
    },
  },
  es: {
    metaTitle: 'Catálogo Clínico | Protocolos y Péptidos',
    metaDesc: 'Descubra protocolos basados en evidencia y péptidos de grado de investigación en una sola superficie clínica.',
    breadcrumbCompendium: 'Compendio Clínico',
    breadcrumbCatalog: 'Catálogo General',
    anchorCategories: 'Categorías',
    anchorPeptides: 'Péptidos Destacados',
    calloutMessage: 'Clínicas Médicas: Acceso a precios mayoristas y prescripciones digitales',
    calloutCta: 'Alta Mayorista →',
    heroEyebrow: 'Descubrimiento Clínico',
    heroTitleLine1: 'Protocolos y Péptidos.',
    heroTitleLine2: 'Un Solo Catálogo.',
    heroSubtitle: 'Protocolos basados en evidencia y péptidos de grado de investigación en una única superficie unificada.',
    searchPlaceholder: 'Buscar protocolos, péptidos, objetivos terapéuticos…',
    browseArrow: 'Explorar',
    featuredPeptides: 'Péptidos Destacados',
    viewAllPeptides: 'Ver todos los péptidos',
    tiles: {
      protocols: {
        label: 'Protocolos',
        description: 'Protocolos clínicos basados en evidencia formulados para resultados reales.',
      },
      peptides: {
        label: 'Péptidos',
        description: 'Compuestos de grado de investigación con documentación analítica completa de pureza.',
      },
      supplements: {
        label: 'Suplementos',
        description: 'Nutracéuticos de precisión y formulaciones respaldadas por investigación clínica.',
      },
      categories: {
        label: 'Categorías',
        description: 'Explorar por objetivo clínico: metabólico, recuperación, longevidad y más.',
      },
    },
  },
};

// ── Browse tile definitions ──────────────────────────────────────────────────
const BROWSE_TILES = [
  {
    id: 'protocols',
    icon: Microscope,
    path: '/proto',
    accent: '#00D1FF',
    bg: 'rgba(0,209,255,0.06)',
    border: 'rgba(0,209,255,0.18)',
  },
  {
    id: 'peptides',
    icon: FlaskConical,
    path: '/collection/peptides',
    accent: '#7C3AED',
    bg: 'rgba(124,58,237,0.06)',
    border: 'rgba(124,58,237,0.18)',
  },
  {
    id: 'supplements',
    icon: Leaf,
    path: '/collection/supplements',
    accent: 'var(--color-success)',
    bg: 'rgba(5,150,105,0.06)',
    border: 'rgba(5,150,105,0.18)',
  },
  {
    id: 'categories',
    icon: Grid3X3,
    path: '/collection/all',
    accent: '#EA580C',
    bg: 'rgba(234,88,12,0.06)',
    border: 'rgba(234,88,12,0.18)',
  },
];

// ── Skeleton for FeaturedPeptides lazy load ───────────────────────────────────
function PeptidesSectionSkeleton() {
  return (
    <section style={{ padding: '3rem 0' }}>
      <div className="container">
        <div style={{
          width: 180, height: 20, borderRadius: 8,
          background: 'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)',
          backgroundSize: '600px 100%',
          animation: 'catalog-shimmer 1.4s infinite linear',
          marginBottom: '1.5rem',
        }} />
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'hidden' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              minWidth: 200, height: 120, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(90deg,#f0f4f8 25%,#e2e8f0 50%,#f0f4f8 75%)',
              backgroundSize: '600px 100%',
              animation: 'catalog-shimmer 1.4s infinite linear',
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function CatalogPage({ onOpenSearch }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && (urlLang === 'es' || urlLang === 'en')) return urlLang;
      const stored = localStorage.getItem('atlas_portal_lang') || localStorage.getItem('atlas_catalog_lang');
      if (stored && (stored === 'es' || stored === 'en')) return stored;
    }
    return 'en';
  });

  const t = CATALOG_I18N[lang] || CATALOG_I18N.en;

  usePageMeta({
    title: t.metaTitle,
    description: t.metaDesc,
    path: '/catalog',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleGlobalLang = (e) => {
        if (e.detail && (e.detail === 'es' || e.detail === 'en')) {
          setLang(e.detail);
        }
      };
      window.addEventListener('atlas_lang_change', handleGlobalLang);
      return () => window.removeEventListener('atlas_lang_change', handleGlobalLang);
    }
  }, []);

  const handleLangChange = (nextLang) => {
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('atlas_portal_lang', nextLang);
        localStorage.setItem('atlas_catalog_lang', nextLang);
        window.dispatchEvent(new CustomEvent('atlas_lang_change', { detail: nextLang }));
      } catch {}
      const url = new URL(window.location.href);
      url.searchParams.set('lang', nextLang);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const router = useRouter();

  const handleSearchClick = useCallback(() => {
    if (onOpenSearch) onOpenSearch('');
  }, [onOpenSearch]);

  const handleSearchKey = useCallback((e) => {
    if (e.key === 'Enter' || e.key.length === 1) {
      e.preventDefault();
      if (onOpenSearch) onOpenSearch(e.key.length === 1 ? e.key : '');
    }
  }, [onOpenSearch]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* ── Fixed 2-Tier Sticky Executive Navigation ── */}
      <PublicUnifiedHeader
        track="compounds"
        lang={lang}
        onLangChange={handleLangChange}
        inquiryContextType="catalog"
        loginRedirect="/catalog"
        breadcrumb={[
          { label: t.breadcrumbCompendium, href: '/catalog' },
          { label: t.breadcrumbCatalog }
        ]}
        anchorTabs={[
          { id: 'browse-categories', label: t.anchorCategories, href: '#browse-categories' },
          { id: 'featured-peptides', label: t.anchorPeptides, href: '#featured-peptides' },
        ]}
        callout={{
          message: t.calloutMessage,
          ctaLabel: t.calloutCta,
          ctaHref: '/login?tab=register&role=doctor&redirect=/catalog'
        }}
      />

      {/* ── Keyframe injection ── */}
      <style>{`
        @keyframes catalog-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .catalog-hero {
          background: linear-gradient(160deg, #050A0F 0%, #0A141E 55%, #102030 100%);
          padding: clamp(4rem, 8vw, 7rem) 1.5rem clamp(3rem, 6vw, 5rem);
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .catalog-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,209,255,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .catalog-search-bar {
          position: relative;
          max-width: 640px;
          margin: 0 auto;
          cursor: text;
        }
        .catalog-search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3.25rem;
          border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.15);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 1rem;
          outline: none;
          backdrop-filter: blur(10px);
          transition: border-color 0.2s, background 0.2s;
          cursor: text;
          font-family: inherit;
          box-sizing: border-box;
        }
        .catalog-search-input::placeholder { color: rgba(255,255,255,0.45); }
        .catalog-search-input:focus {
          border-color: rgba(0,209,255,0.6);
          background: rgba(255,255,255,0.12);
        }
        .catalog-search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.5);
          pointer-events: none;
        }
        .catalog-browse-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-top: -2.5rem;
          position: relative;
          z-index: 10;
        }
        @media (max-width: 600px) {
          .catalog-browse-grid {
            grid-template-columns: 1fr;
            margin-top: 0;
            padding-top: 1.5rem;
          }
        }
        @media (min-width: 601px) and (max-width: 1024px) {
          .catalog-browse-grid {
            grid-template-columns: repeat(2, 1fr);
            margin-top: 0;
            padding-top: 1.5rem;
          }
        }
        .browse-tile {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          border-radius: 16px;
          background: white;
          border: 1.5px solid var(--border);
          text-decoration: none;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          cursor: pointer;
        }
        .browse-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.10);
        }
        .browse-tile-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          transition: transform 0.2s;
        }
        .browse-tile:hover .browse-tile-icon { transform: scale(1.08); }
        .browse-tile-arrow {
          margin-top: auto;
          padding-top: 1rem;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          opacity: 0.7;
          transition: opacity 0.2s, gap 0.2s;
        }
        .browse-tile:hover .browse-tile-arrow {
          opacity: 1;
          gap: 0.6rem;
        }
        .catalog-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 3.5rem 0 2rem;
        }
        .catalog-divider-line {
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        .catalog-divider-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--text-muted);
          white-space: nowrap;
        }
      `}</style>

      {/* ── Hero Search ─────────────────────────────────────────────────────── */}
      <div className="catalog-hero">
        <p style={{
          color: 'rgba(0,209,255,0.9)',
          fontSize: '0.75rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          marginBottom: '0.75rem',
        }}>
          {t.heroEyebrow}
        </p>
        <h1 style={{
          color: 'white',
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          lineHeight: 1.15,
          marginBottom: '1rem',
          letterSpacing: '-0.02em',
        }}>
          {t.heroTitleLine1}<br />
          <span style={{ color: 'rgba(0,209,255,0.85)' }}>{t.heroTitleLine2}</span>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
          marginBottom: '2rem',
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: 1.6,
        }}>
          {t.heroSubtitle}
        </p>

        {/* Search trigger */}
        <div className="catalog-search-bar" onClick={handleSearchClick}>
          <Search size={18} className="catalog-search-icon" />
          <input
            className="catalog-search-input"
            placeholder={t.searchPlaceholder}
            readOnly
            onKeyDown={handleSearchKey}
            aria-label="Open global search"
          />
        </div>
      </div>

      {/* ── Browse Tiles ─────────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 0 }}>
        <div className="catalog-browse-grid" id="browse-categories">
          {BROWSE_TILES.map(tile => {
            const Icon = tile.icon;
            const tileData = t.tiles[tile.id] || tile;
            return (
              <Link
                key={tile.id}
                href={tile.path}
                className="browse-tile"
                style={{ '--tile-accent': tile.accent, borderColor: tile.border }}
              >
                <div
                  className="browse-tile-icon"
                  style={{ background: tile.bg, color: tile.accent }}
                >
                  <Icon size={22} />
                </div>
                <div style={{
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-heading)',
                  marginBottom: '0.4rem',
                }}>
                  {tileData.label}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                  flexGrow: 1,
                }}>
                  {tileData.description}
                </div>
                <div className="browse-tile-arrow" style={{ color: tile.accent }}>
                  {t.browseArrow} <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* ── Featured Peptides ────────────────────────────────────────────── */}
        <div className="catalog-divider" id="featured-peptides">
          <div className="catalog-divider-line" />
          <span className="catalog-divider-label">{t.featuredPeptides}</span>
          <div className="catalog-divider-line" />
        </div>

        <Suspense fallback={<PeptidesSectionSkeleton />}>
          <FeaturedPeptides />
        </Suspense>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingBottom: '4rem' }}>
          <Link
            href="/collection/peptides"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: '#7C3AED', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            {t.viewAllPeptides} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CatalogPage;