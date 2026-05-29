/* eslint-disable no-unused-vars */
/**
 * WhyChooseMedPeptides — Phase 3
 * ─────────────────────────────────────────────────────────────────────────────
 * "Why Choose Atlas Health" trust & transparency section.
 * Placed below the search/category section.
 *
 * Design constraints:
 *  - Icon-list layout with simple inline SVGs.
 *  - No large images.
 *  - Uses existing CSS design tokens only.
 *  - Shown to all users (guest + professional).
 */

import React from 'react';

// ─── Inline SVG icons (no external dependency) ────────────────────────────────

const CheckBadgeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const DocumentIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const ClipboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
  </svg>
);

const SupportIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={22} height={22} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
  </svg>
);

// ─── Trust items ───────────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    Icon: CheckBadgeIcon,
    title: 'Verified Specialized Suppliers',
    desc: 'Every compound is sourced from vetted manufacturers with documented quality control processes.',
    color: '#34d399',
  },
  {
    Icon: DocumentIcon,
    title: 'Certificate of Analysis Available',
    desc: 'Third-party CoA documents available per batch. Full transparency on purity and composition.',
    color: '#38bdf8',
  },
  {
    Icon: LayersIcon,
    title: 'Batch-Level Traceability',
    desc: 'Each product is traceable from synthesis to shipment. Lot numbers and test reports on record.',
    color: '#a78bfa',
  },
  {
    Icon: ClipboardIcon,
    title: 'Standardized Documentation',
    desc: 'Consistent reconstitution protocols, storage guidelines, and handling instructions across all products.',
    color: '#fbbf24',
  },
  {
    Icon: SupportIcon,
    title: 'Structured Protocol Guidance',
    desc: 'Access to curated research protocols reviewed by our scientific team — from dosing to monitoring.',
    color: '#f472b6',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function WhyChooseMedPeptides() {
  return (
    <div style={containerStyle}>
      {/* Ambient glow */}
      <div style={glowStyle} aria-hidden />

      {/* Header Block using global classes */}
      <div className="section-header">
        <span className="section-eyebrow" style={{ color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.25)', background: 'rgba(52, 211, 153, 0.1)' }}>
          Built on trust
        </span>
        <h2 id="wcmp-heading" className="section-title">
          Why Choose Atlas Health
        </h2>
        <p className="section-subtitle">
          Quality and traceability at every step — from synthesis to your research.
        </p>
      </div>

      {/* Icon list */}
      <ul style={listStyle} role="list">
        {TRUST_ITEMS.map(({ Icon, title, desc, color }) => (
          <li key={title} style={itemStyle} className="card card--hover">
            <div style={{ ...iconWrapStyle, color, background: `${color}18` }}>
              <Icon />
            </div>
            <div>
              <h3 style={itemTitleStyle}>{title}</h3>
              <p style={itemDescStyle}>{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const glowStyle = {
  position: 'absolute',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: 700,
  height: 300,
  borderRadius: '50%',
  background: 'radial-gradient(ellipse, rgba(52,211,153,0.05) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const containerStyle = {
  position: 'relative',
  zIndex: 1,
};

const listStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  gap: '1.75rem',
  padding: 0,
  margin: 0,
  listStyle: 'none',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1.25rem',
  padding: '1.5rem 1.75rem',
  background: 'var(--surface-raised)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-lg)',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
};

const iconWrapStyle = {
  flexShrink: 0,
  width: 48,
  height: 48,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const itemTitleStyle = {
  fontSize: '1.05rem',
  fontWeight: 800,
  color: 'var(--text-main)',
  margin: '0 0 0.4rem',
  letterSpacing: '-0.01em',
};

const itemDescStyle = {
  fontSize: '0.925rem',
  color: 'var(--text-muted)',
  opacity: 1,
  lineHeight: 1.6,
  margin: 0,
};

