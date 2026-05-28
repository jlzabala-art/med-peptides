/* eslint-disable no-unused-vars */
import React, { lazy, Suspense, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Microscope, FlaskConical, Grid3X3, ArrowRight, Leaf } from 'lucide-react';
import { usePageMeta } from '../hooks/usePageMeta';
// import FeaturedProtocols from '../sections/FeaturedProtocols'; // TODO: re-enable when optimized

const FeaturedPeptides = lazy(() => import('../sections/FeaturedPeptides'));

// ── Browse tile data ──────────────────────────────────────────────────────────
const BROWSE_TILES = [
  {
    id: 'protocols',
    label: 'Protocols',
    description: 'Evidence-based clinical protocols built for real outcomes.',
    icon: Microscope,
    path: '/collection/protocols',
    accent: '#00D1FF',
    bg: 'rgba(0,209,255,0.06)',
    border: 'rgba(0,209,255,0.18)',
  },
  {
    id: 'peptides',
    label: 'Peptides',
    description: 'Research-grade compounds with full purity documentation.',
    icon: FlaskConical,
    path: '/collection/peptides',
    accent: '#7C3AED',
    bg: 'rgba(124,58,237,0.06)',
    border: 'rgba(124,58,237,0.18)',
  },
  {
    id: 'supplements',
    label: 'Supplements',
    description: 'Precision nutraceuticals and research-backed formulations.',
    icon: Leaf,
    path: '/collection/supplements',
    accent: 'var(--color-success)',
    bg: 'rgba(5,150,105,0.06)',
    border: 'rgba(5,150,105,0.18)',
  },
  {
    id: 'categories',
    label: 'Categories',
    description: 'Browse by clinical objective — metabolic, recovery, longevity and more.',
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
  usePageMeta({
    title: 'Clinical Catalog | Protocols & Peptides',
    description: 'Discover evidence-based protocols and research-grade peptides — your unified clinical discovery surface.',
    path: '/catalog',
  });

  const navigate = useNavigate();

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
          Clinical Discovery
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
          Protocols &amp; Peptides.<br />
          <span style={{ color: 'rgba(0,209,255,0.85)' }}>One Catalog.</span>
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
          Evidence-based protocols and research-grade peptides in a single unified surface.
        </p>

        {/* Search trigger */}
        <div className="catalog-search-bar" onClick={handleSearchClick}>
          <Search size={18} className="catalog-search-icon" />
          <input
            className="catalog-search-input"
            placeholder="Search protocols, peptides, objectives…"
            readOnly
            onKeyDown={handleSearchKey}
            aria-label="Open global search"
          />
        </div>
      </div>

      {/* ── Browse Tiles ─────────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: 0 }}>
        <div className="catalog-browse-grid">
          {BROWSE_TILES.map(tile => {
            const Icon = tile.icon;
            return (
              <Link
                key={tile.id}
                to={tile.path}
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
                  {tile.label}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.55,
                  flexGrow: 1,
                }}>
                  {tile.description}
                </div>
                <div className="browse-tile-arrow" style={{ color: tile.accent }}>
                  Browse <ArrowRight size={14} />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Featured Protocols — temporarily hidden until optimized */}
        {/* <div className="catalog-divider">
          <div className="catalog-divider-line" />
          <span className="catalog-divider-label">Featured Protocols</span>
          <div className="catalog-divider-line" />
        </div>

        <FeaturedProtocols />

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link
            to="/protocols"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            View all protocols <ArrowRight size={15} />
          </Link>
        </div> */}

        {/* ── Featured Peptides ────────────────────────────────────────────── */}
        <div className="catalog-divider">
          <div className="catalog-divider-line" />
          <span className="catalog-divider-label">Featured Peptides</span>
          <div className="catalog-divider-line" />
        </div>

        <Suspense fallback={<PeptidesSectionSkeleton />}>
          <FeaturedPeptides />
        </Suspense>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingBottom: '4rem' }}>
          <Link
            to="/collection/peptides"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: '#7C3AED', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none',
            }}
          >
            View all peptides <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default CatalogPage;
