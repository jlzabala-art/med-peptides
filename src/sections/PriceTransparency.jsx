/* eslint-disable no-unused-vars */
/**
 * PriceTransparency — Phase 5
 * ─────────────────────────────────────────────────────────────────────────────
 * "Why Prices May Differ" section explaining guest vs. professional pricing.
 *
 * Rules from the spec:
 *  - Keep tone neutral.
 *  - Do NOT mention discounts.
 *  - Show to guest users (hide for professionals — they already know).
 *
 * Design: two-column layout on desktop, stacked on mobile.
 * Uses existing CSS tokens only. No heavy assets.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Inline icons ─────────────────────────────────────────────────────────────

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);
const FileTextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);
const CubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="m21 7.5-9-5.25L3 7.5m18 0v9l-9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);
const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={20} height={20} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 3 4 7v5c0 5 4 8 8 9 4-1 8-4 8-9V7l-8-4Z" />
  </svg>
);

const PRO_FEATURES = [
  { Icon: LayersIcon, text: 'Volume-based pricing tiers' },
  { Icon: CubeIcon,  text: 'Protocol bundle pricing' },
  { Icon: FileTextIcon, text: 'Extended documentation access' },
  { Icon: ShieldIcon, text: 'Professional-only research materials' },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function PriceTransparency() {
  const navigate  = useNavigate();
  const { isProfessional } = useAuth?.() ?? {};

  // Professional users already have this context — don't clutter their view
  if (isProfessional) return null;

  return (
    <section style={sectionStyle} aria-labelledby="pt-heading">
      <div style={containerStyle}>
        {/* Left: text */}
        <div style={leftStyle}>
          <span style={eyebrowStyle}>Pricing explained</span>
          <h2 id="pt-heading" style={headingStyle}>
            Why Prices May Differ
          </h2>
          <p style={bodyStyle}>
            Our catalog shows standard research pricing for all visitors.
            Professional users receive access to an expanded tier of services,
            documentation, and support structures built specifically for
            clinical and research environments.
          </p>
          <p style={bodyStyle}>
            Pricing differences reflect the additional infrastructure,
            documentation, and dedicated support included with professional access.
          </p>
          <button
            id="pt-apply-btn"
            style={ctaStyle}
            onClick={() => navigate('/login?role=professional&type=register')}
          >
            Apply for Professional Access →
          </button>
        </div>

        {/* Right: feature list */}
        <div style={rightStyle}>
          <p style={rightLabelStyle}>Professional users receive access to:</p>
          <ul style={featureListStyle} role="list">
            {PRO_FEATURES.map(({ Icon, text }) => (
              <li key={text} style={featureItemStyle}>
                <span style={featureIconStyle}><Icon /></span>
                <span style={featureTextStyle}>{text}</span>
              </li>
            ))}
          </ul>
          <p style={neutralNoteStyle}>
            Free registration · No payment required to apply
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sectionStyle = {
  padding: '4rem 1rem',
  background:
    'linear-gradient(135deg, rgba(2,14,28,1) 0%, rgba(10,20,40,1) 100%)',
  borderTop:    '1px solid rgba(255,255,255,0.05)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
};

const containerStyle = {
  maxWidth: 960,
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '3rem',
  alignItems: 'start',
};

const leftStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const eyebrowStyle = {
  display: 'inline-block',
  padding: '0.25rem 0.75rem',
  borderRadius: 999,
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  background: 'rgba(251, 191, 36, 0.1)',
  color: '#fbbf24',
  border: '1px solid rgba(251, 191, 36, 0.2)',
  alignSelf: 'flex-start',
};

const headingStyle = {
  fontSize: 'clamp(1.3rem, 3vw, 2rem)',
  fontWeight: 800,
  color: 'var(--color-bg-app)',
  margin: 0,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
};

const bodyStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
  lineHeight: 1.7,
  margin: 0,
};

const ctaStyle = {
  alignSelf: 'flex-start',
  padding: '0.7rem 1.4rem',
  borderRadius: 10,
  border: '1px solid rgba(56, 189, 248, 0.35)',
  background: 'rgba(56, 189, 248, 0.08)',
  color: '#38bdf8',
  fontSize: '0.88rem',
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'background 0.2s ease',
  marginTop: '0.5rem',
};

const rightStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
  padding: '1.75rem',
};

const rightLabelStyle = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  margin: '0 0 1rem',
};

const featureListStyle = {
  listStyle: 'none',
  margin: '0 0 1.5rem',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const featureItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const featureIconStyle = {
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: 9,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(56, 189, 248, 0.1)',
  color: '#38bdf8',
};

const featureTextStyle = {
  fontSize: '0.9rem',
  color: 'var(--color-bg-app)',
  fontWeight: 500,
};

const neutralNoteStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  margin: 0,
  opacity: 0.65,
};
