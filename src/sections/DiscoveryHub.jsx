import Clock from "lucide-react/dist/esm/icons/clock";
import Dna from "lucide-react/dist/esm/icons/dna";
import FlaskConical from "lucide-react/dist/esm/icons/flask-conical";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Star from "lucide-react/dist/esm/icons/star";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
/* eslint-disable no-unused-vars */
/**
 * DiscoveryHub.jsx — Phase 4-B
 *
 * A unified tabbed wrapper that consolidates:
 *   • Trending Peptides
 *   • Trending Protocols
 *   • Featured Peptides  ← live in Phase 4-B
 *   • New Acquisitions
 *
 * Design principle: pure composition. Each tab renders the existing
 * standalone section component unchanged. No data logic lives here.
 *
 * The inner sections render with their own headers; we suppress the
 * outer section padding so the hub provides a single cohesive frame.
 */

import { useState, useRef, useEffect, Suspense, lazy, useMemo } from 'react';






import TrendingPeptides from './TrendingPeptides';
import TrendingProtocols from './TrendingProtocols';
import NovelAcquisitions from './NovelAcquisitions';
import RecentlyExplored from './RecentlyExplored';
import { useCategoryBestItems } from '../hooks/useCategoryBestItems';
import { getRecentViews } from '../utils/recentViews';

// Lazy-load FeaturedPeptides to keep the hub's initial bundle lightweight
import FeaturedPeptides from './FeaturedPeptides';

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  {
    id: 'peptides',
    label: 'Trending Peptides',
    shortLabel: 'Peptides',
    Icon: Dna,
    accent: '#0071bd',
    glow: 'rgba(0,113,189,0.15)',
    gradient: 'linear-gradient(135deg,#003666 0%,#0071bd 100%)',
  },
  {
    id: 'protocols',
    label: 'Trending Protocols',
    shortLabel: 'Protocols',
    Icon: FlaskConical,
    accent: '#6366f1',
    glow: 'rgba(99,102,241,0.15)',
    gradient: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%)',
  },
  {
    id: 'featured',
    label: 'Featured',
    shortLabel: 'Featured',
    Icon: Star,
    accent: '#f59e0b',
    glow: 'rgba(245,158,11,0.15)',
    gradient: 'linear-gradient(135deg,#d97706 0%,#f59e0b 100%)',
    // comingSoon removed — Phase 4-B complete
  },
  {
    id: 'new',
    label: 'New Arrivals',
    shortLabel: 'New',
    Icon: Sparkles,
    accent: 'var(--color-success)',
    glow: 'rgba(16,185,129,0.15)',
    gradient: 'linear-gradient(135deg,#059669 0%,#10b981 100%)',
  },
  {
    id: 'recent',
    label: 'Recently Explored',
    shortLabel: 'Recent',
    Icon: Clock,
    accent: 'var(--color-text-secondary)',
    glow: 'rgba(100,116,139,0.12)',
    gradient: 'linear-gradient(135deg,#475569 0%,#64748b 100%)',
  },
];

// ── Animated ink underline helper ─────────────────────────────────────────────

function TabBar({ active, onChange }) {
  const containerRef = useRef(null);
  const tabRefs = useRef({});
  const [inkStyle, setInkStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[active];
    const container = containerRef.current;
    if (!el || !container) return;
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    setInkStyle({
      left: elRect.left - containerRect.left,
      width: elRect.width,
    });
  }, [active]);

  const activeTab = TABS.find((t) => t.id === active);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        display: 'flex',
        gap: '0.25rem',
        borderBottom: '1.5px solid rgba(0,0,0,0.07)',
        marginBottom: '0.5rem',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '0',
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const { Icon } = tab;
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[tab.id] = el)}
            onClick={() => onChange(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.7rem 1rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: isActive ? 800 : 600,
              color: isActive ? tab.accent : 'var(--text-muted)',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s ease, font-weight 0.15s ease',
              flexShrink: 0,
              position: 'relative',
              letterSpacing: isActive ? '-0.01em' : '0',
            }}
          >
            <Icon
              size={14}
              strokeWidth={isActive ? 2.5 : 1.8}
              style={{ transition: 'all 0.2s ease', flexShrink: 0 }}
            />
            {/* Short label on narrow screens, full label on wider */}
            <span className="tab-label-short" style={{ display: 'none' }}>
              {tab.shortLabel}
            </span>
            <span className="tab-label-full">{tab.label}</span>
          </button>
        );
      })}

      {/* Animated ink underline */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: inkStyle.left,
          width: inkStyle.width,
          height: '2.5px',
          borderRadius: '2px 2px 0 0',
          background: activeTab?.gradient || 'var(--primary)',
          transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1), width 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ── Placeholder for tabs not yet populated ─────────────────────────────────────

function ComingSoonPanel({ tab }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        background: `${tab.glow}`,
        borderRadius: '16px',
        border: `1.5px dashed ${tab.accent}44`,
        margin: '1.5rem 0',
      }}
    >
      <tab.Icon
        size={40}
        color={tab.accent}
        style={{ opacity: 0.5, marginBottom: '1rem' }}
      />
      <p
        style={{
          fontSize: '0.9rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
          margin: 0,
        }}
      >
        Coming soon in the next phase.
      </p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DiscoveryHub({ onSelectProduct }) {
  // Auto-activate "Recently Explored" tab on mount if the user has history
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return getRecentViews().length > 0 ? 'recent' : 'peptides';
    } catch {
      return 'peptides';
    }
  });

  // Phase 4-C: fetch trending peptide slugs so Featured tab can exclude them
  const { allItems: trendingPeptideItems } = useCategoryBestItems('peptides', 'peptide_id');
  const trendingSlugs = useMemo(() => {
    const s = new Set();
    trendingPeptideItems.forEach(({ item }) => {
      if (item?.slug)  s.add(item.slug);
      if (item?.name)  s.add(item.name.toLowerCase().replace(/\s+/g, '-'));
    });
    return s;
  }, [trendingPeptideItems]);

  const activeTabMeta = TABS.find((t) => t.id === activeTab);

  return (
    <section
      style={{
        padding: '3rem 0',
        background: 'linear-gradient(180deg,rgba(0,54,102,0.03) 0%,rgba(255,255,255,0) 100%)',
      }}
    >
      <div className="container">

        {/* ── Section header ── */}
        <div style={{ marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--primary)',
              background: 'rgba(0,113,189,0.08)',
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              marginBottom: '0.75rem',
            }}
          >
            <TrendingUp size={13} strokeWidth={2.5} /> Discovery Hub
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: 'clamp(1.4rem,3.5vw,1.85rem)',
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
            }}
          >
            Explore the Research Catalog
          </h2>
          <p
            style={{
              margin: '0.5rem 0 0',
              fontSize: '0.88rem',
              color: 'var(--text-muted)',
              maxWidth: '520px',
            }}
          >
            Trending peptides, top protocols, curated collections — all in one place.
          </p>
        </div>

        {/* ── Tab navigation ── */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* ── Tab panels — rendered lazily via display:none so state is preserved ── */}
        <div>
          {/* Peptides tab */}
          <div style={{ display: activeTab === 'peptides' ? 'block' : 'none' }}>
            {/*
              TrendingPeptides already has its own section wrapper + header.
              We override its section padding via a scoped class so it sits
              flush inside the hub frame. The section's own CTA footer is kept.
            */}
            <div className="discovery-hub__inner-section">
              <TrendingPeptides onSelectProduct={onSelectProduct} />
            </div>
          </div>

          {/* Protocols tab */}
          <div style={{ display: activeTab === 'protocols' ? 'block' : 'none' }}>
            <div className="discovery-hub__inner-section">
              <TrendingProtocols onSelectProduct={onSelectProduct} />
            </div>
          </div>

          {/* Featured tab — Phase 4-B+4-C: FeaturedPeptides with dedup */}
          <div style={{ display: activeTab === 'featured' ? 'block' : 'none' }}>
            <div className="discovery-hub__inner-section">
              <Suspense
                fallback={
                  <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Loading featured peptides…
                  </div>
                }
              >
                <FeaturedPeptides excludeSlugs={trendingSlugs} />
              </Suspense>
            </div>
          </div>

          {/* New Arrivals tab */}
          <div style={{ display: activeTab === 'new' ? 'block' : 'none' }}>
            <div className="discovery-hub__inner-section">
              <NovelAcquisitions onSelectProduct={onSelectProduct} />
            </div>
          </div>

          {/* Recently Explored tab — Phase 4-D */}
          <div style={{ display: activeTab === 'recent' ? 'block' : 'none' }}>
            <div className="discovery-hub__inner-section">
              <RecentlyExplored />
            </div>
          </div>
        </div>

      </div>

      {/* ── Responsive + inner-section scoping styles ── */}
      <style>{`
        /* Strip outer padding from inner sections so they sit flush in the hub */
        .discovery-hub__inner-section > section {
          padding-top: 1rem;
          padding-bottom: 0;
          background: transparent;
        }
        /* Hide inner section title — hub header already provides context */
        .discovery-hub__inner-section .peptide-section__label {
          display: none;
        }

        /* Short vs full tab labels */
        @media (max-width: 480px) {
          .tab-label-full  { display: none !important; }
          .tab-label-short { display: inline !important; }
        }
      `}</style>
    </section>
  );
}