 
/**
 * EmotionalTrust — Phase 7
 * ─────────────────────────────────────────────────────────────────────────────
 * Visual emotional reinforcement section.
 * Purpose: create trust and reduce fear/hesitation.
 *
 * Design:
 *  - Professional but calm visual language (no aggressive lab scenes).
 *  - Soft gradient overlay.
 *  - Quote / testimonial-style layout + value propositions.
 *  - Lightweight: CSS-only, no heavy images.
 *  - Simple CSS transitions (per Phase 10 performance rules).
 */

import React from 'react';

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden>
    <path fillRule="evenodd" clipRule="evenodd"
      d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" />
  </svg>
);

const VALUES = [
  {
    emoji: '🔬',
    title: 'Research-First',
    desc: 'Every product designed for systematic, reproducible research workflows.',
  },
  {
    emoji: '📋',
    title: 'Documented',
    desc: 'Full analytical documentation. Third-party testing. Nothing hidden.',
  },
  {
    emoji: '🌐',
    title: 'Global Ready',
    desc: 'Reliable international logistics with compliant labeling and packaging.',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function EmotionalTrust() {
  return (
    <section style={sectionStyle} aria-labelledby="et-heading">
      {/* Background decorative elements */}
      <div style={bgGlowLeftStyle}  aria-hidden />
      <div style={bgGlowRightStyle} aria-hidden />

      <div style={containerStyle}>
        {/* Top label */}
        <div style={eyebrowWrapStyle}>
          <span style={eyebrowStyle}>Trusted by researchers</span>
        </div>

        {/* Heading */}
        <h2 id="et-heading" style={headingStyle}>
          Science Deserves a&nbsp;
          <span style={accentStyle}>Reliable Partner</span>
        </h2>

        <p style={subtitleStyle}>
          Research moves fast. Sourcing shouldn't slow you down. We exist
          to make high-quality peptides and protocols consistently accessible —
          so you can focus on what matters.
        </p>

        {/* Quote card */}
        <div style={quoteCardStyle}>
          <div style={starsStyle} aria-label="5 star rating">
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{ color: '#fbbf24' }}><StarIcon /></span>
            ))}
          </div>
          <blockquote style={quoteStyle}>
            "The combination of verified CoAs, clear reconstitution guides, and
            structured protocols makes Med-Peptides the go-to supplier for our
            research team. The documentation quality is exceptional."
          </blockquote>
          <cite style={citeStyle}>— Independent Research Laboratory, EU</cite>
        </div>

        {/* Value cards */}
        <div style={valuesGridStyle}>
          {VALUES.map(({ emoji, title, desc }) => (
            <div key={title} style={valueCardStyle}>
              <span style={valueEmojiStyle} aria-hidden>{emoji}</span>
              <h3 style={valueTitleStyle}>{title}</h3>
              <p style={valueDescStyle}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sectionStyle = {
  position: 'relative',
  padding: '5rem 1rem',
  background:
    'linear-gradient(180deg, rgba(10,20,40,1) 0%, rgba(2,14,28,1) 100%)',
  overflow: 'hidden',
};

const bgGlowLeftStyle = {
  position: 'absolute',
  top: '10%',
  left: '-10%',
  width: 500,
  height: 500,
  borderRadius: '50%',
  background:
    'radial-gradient(ellipse, rgba(167,139,250,0.06) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const bgGlowRightStyle = {
  position: 'absolute',
  bottom: '5%',
  right: '-5%',
  width: 400,
  height: 400,
  borderRadius: '50%',
  background:
    'radial-gradient(ellipse, rgba(56,189,248,0.06) 0%, transparent 70%)',
  pointerEvents: 'none',
};

const containerStyle = {
  maxWidth: 860,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.5rem',
};

const eyebrowWrapStyle = {};

const eyebrowStyle = {
  display: 'inline-block',
  padding: '0.28rem 0.85rem',
  borderRadius: 999,
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  background: 'rgba(167, 139, 250, 0.1)',
  color: '#a78bfa',
  border: '1px solid rgba(167, 139, 250, 0.22)',
};

const headingStyle = {
  textAlign: 'center',
  fontSize: 'clamp(1.5rem, 4vw, 2.4rem)',
  fontWeight: 800,
  color: 'var(--color-bg-app)',
  margin: 0,
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
};

const accentStyle = {
  background: 'linear-gradient(90deg, #a78bfa, #38bdf8)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const subtitleStyle = {
  textAlign: 'center',
  color: 'var(--text-muted)',
  fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
  lineHeight: 1.7,
  margin: 0,
  maxWidth: 640,
};

const quoteCardStyle = {
  width: '100%',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: '2rem 2.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.85rem',
};

const starsStyle = {
  display: 'flex',
  gap: '0.2rem',
};

const quoteStyle = {
  margin: 0,
  fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
  color: 'var(--color-border)',
  lineHeight: 1.7,
  fontStyle: 'italic',
};

const citeStyle = {
  display: 'block',
  fontSize: '0.82rem',
  color: 'var(--text-muted)',
  fontStyle: 'normal',
  opacity: 0.75,
};

const valuesGridStyle = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1rem',
};

const valueCardStyle = {
  padding: '1.5rem',
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 14,
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
  transition: 'border-color 0.2s ease',
};

const valueEmojiStyle = {
  fontSize: '1.6rem',
  lineHeight: 1,
};

const valueTitleStyle = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: 'var(--color-bg-app)',
  margin: 0,
};

const valueDescStyle = {
  fontSize: '0.83rem',
  color: 'var(--text-muted)',
  lineHeight: 1.55,
  margin: 0,
};
