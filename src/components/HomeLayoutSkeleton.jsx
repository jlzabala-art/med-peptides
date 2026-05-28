 
/**
 * HomeLayoutSkeleton
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 4 — shows section-shaped loading placeholders while useHomeLayout
 * fetches from Firestore (first visit only after Phase 3 cache is warm).
 *
 * Rules:
 *  - No new libraries.
 *  - Shimmer animation defined once via an injected <style> tag.
 *  - prefers-reduced-motion: animation is disabled, static grey shown.
 *  - Mobile + desktop both look clean.
 */

import { useEffect } from 'react';
import styles from './HomeLayoutSkeleton.module.css';

// ─── Shimmer CSS ──────────────────────────────────────────────────────────────

const SHIMMER_CSS = `
@keyframes rp-shimmer {
  0%   { background-position: -600px 0; }
  100% { background-position: 600px  0; }
}
.rp-skel {
  background: linear-gradient(
    90deg,
    #e8f0f7 25%,
    #f4f8fb 50%,
    #e8f0f7 75%
  );
  background-size: 1200px 100%;
  animation: rp-shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}
@media (prefers-reduced-motion: reduce) {
  .rp-skel { animation: none; background: #e8f0f7; }
}
`;

function useShimmerStyles() {
  useEffect(() => {
    const id = 'rp-shimmer-styles';
    if (document.getElementById(id)) return;
    const el = document.createElement('style');
    el.id = id;
    el.textContent = SHIMMER_CSS;
    document.head.appendChild(el);
    // intentionally not removed — stays for the session, no cost
  }, []);
}

// ─── Primitives ───────────────────────────────────────────────────────────────

function Skel({ w = '100%', h = 16, mb = 0, br = 8, style = {} }) {
  return (
    <div
      className="rp-skel"
      aria-hidden="true"
      style={{ width: w, height: h, marginBottom: mb, borderRadius: br, flexShrink: 0, ...style }}
    />
  );
}

// ─── Section-shaped skeletons ─────────────────────────────────────────────────

/** Full-width tall hero block with a faux search bar */
function HeroSkel() {
  return (
    <div style={{ width: '100%', padding: '0 0 2px', overflow: 'hidden' }}>
      <Skel h={380} br={0} style={{ marginBottom: 0 }} />
      <div style={{
        position: 'relative', marginTop: -64, padding: '0 2rem',
        maxWidth: 700, marginLeft: 'auto', marginRight: 'auto',
      }}>
        <Skel h={52} br={14} />
      </div>
    </div>
  );
}

/** Narrow full-width strip (trust strip / search strip) */
function StripSkel() {
  return (
    <div style={{
      width: '100%', padding: '1.25rem 2rem',
      display: 'flex', gap: '1.5rem', alignItems: 'center',
      justifyContent: 'center', overflow: 'hidden',
    }}>
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: '0 0 auto' }}>
          <Skel w={28} h={28} br={50} />
          <Skel w={80} h={14} />
        </div>
      ))}
    </div>
  );
}

/** Section heading + row of cards */
function CardsSkel({ count = 3 }) {
  return (
    <div style={{ padding: '3rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Heading */}
      <Skel w={220} h={28} mb={8} />
      <Skel w={340} h={16} mb={32} />
      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${count}, 1fr)`,
        gap: '1.25rem',
      }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{
            borderRadius: 16,
            border: '1.5px solid #d8e6f0',
            padding: '1.25rem',
            background: 'var(--color-bg-surface)',
          }}>
            <Skel h={140} mb={16} br={10} />
            <Skel w="70%" h={18} mb={10} />
            <Skel w="90%" h={13} mb={6} />
            <Skel w="60%" h={13} mb={0} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Centred CTA block */
function CTASkel() {
  return (
    <div style={{
      width: '100%', padding: '3rem 2rem',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '1rem',
    }}>
      <Skel w={180} h={22} />
      <Skel w={420} h={16} style={{ maxWidth: '90vw' }} />
      <Skel w={420} h={16} style={{ maxWidth: '80vw' }} />
      <Skel w={160} h={44} br={12} style={{ marginTop: '0.5rem' }} />
    </div>
  );
}

/** Large dashboard / feature block */
function DashboardSkel() {
  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 260px' }}>
          <Skel h={320} br={16} />
        </div>
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skel h={80} br={12} />
          <Skel h={80} br={12} />
          <Skel h={80} br={12} />
        </div>
      </div>
    </div>
  );
}

// ─── Section → skeleton type mapping ─────────────────────────────────────────

const SKELETON_MAP = {
  // Guest
  GuestHeroSearch:       'hero',
  TrustStrip:            'strip',
  QuickDiscovery:        'cards',
  FeaturedCategories:    'cards',
  StepByStepGuide:       'cards',
  KeyPeptides:           'cards',
  UserSegmentEntry:      'cta',
  ProfessionalUpgradeCTA:'cta',
  MobileQuickNav:        'strip',
  // Professional
  Hero:                  'hero',
  PowerSearch:           'strip',
  TrendingPeptides:      'cards',
  TrendingProtocols:     'cards',
  NovelAcquisitions:     'cards',
  PathwayNavigation:     'cards',
  ProtocolHighlight:     'cta',
  InstitutionalSolutions:'cta',
  ProfessionalDashboard: 'dashboard',
  GlobalLogistics:       'cards',
  PlatformCapabilitiesPro:'cards',
  ContactCTA:            'strip',
};

function SectionSkeleton({ id }) {
  const type = SKELETON_MAP[id] ?? 'cards';
  switch (type) {
    case 'hero':      return <HeroSkel />;
    case 'strip':     return <StripSkel />;
    case 'cta':       return <CTASkel />;
    case 'dashboard': return <DashboardSkel />;
    default:          return <CardsSkel count={3} />;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * @param {Object}   props
 * @param {Array}    props.sections  — enabled sections sorted by order (from DEFAULT_LAYOUT)
 */
export default function HomeLayoutSkeleton({ sections = [] }) {
  useShimmerStyles();
console.log('sections', sections, typeof sections, Array.isArray(sections));

  return (
    <div className={styles.wrapper} aria-label="Loading home page…">
      {Array.isArray(sections) ? sections.map((section, i) => (
  <div key={i} className={styles.sectionWrapper}>
    {(Array.isArray(section) ? section : []).map((s, idx) => (
      <Skel key={idx} h={s.h} w={s.w} br={s.br} mb={s.mb} style={s.style} />
    ))}
  </div>
)) : null}
    </div>
  );
}
