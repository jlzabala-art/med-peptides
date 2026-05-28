 
/**
 * HowItWorks — Phase 6
 * ─────────────────────────────────────────────────────────────────────────────
 * "How Med-Peptides Works" — 4-step visual timeline.
 *
 * Steps:
 *  1. Learn the Basics
 *  2. Choose Your Category
 *  3. Use the Calculator
 *  4. Follow a Protocol
 *
 * Design:
 *  - Horizontal on desktop with connector line.
 *  - Vertical on mobile.
 *  - Uses existing CSS tokens. SVG icons, simple CSS transitions.
 *  - No heavy libraries.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={26} height={26} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const GridIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={26} height={26} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
  </svg>
);

const CalculatorIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={26} height={26} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm2.498-2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-4.5h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-4.5h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} width={26} height={26} aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
  </svg>
);

// ─── Steps data ───────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    Icon: BookIcon,
    title: 'Learn the Basics',
    desc: 'Start with our beginner-friendly guides to understand what peptides are and how they work.',
    href: '/what-are-peptides',
    color: '#38bdf8',
  },
  {
    number: '02',
    Icon: GridIcon,
    title: 'Choose Your Category',
    desc: 'Browse by research goal — recovery, metabolic, cognitive, or hormonal pathways.',
    href: '/catalog',
    color: '#a78bfa',
  },
  {
    number: '03',
    Icon: CalculatorIcon,
    title: 'Use the Calculator',
    desc: 'Our reconstitution calculator helps you prepare precise concentrations for your research.',
    href: '/reconstitution-guide',
    color: '#34d399',
  },
  {
    number: '04',
    Icon: MapIcon,
    title: 'Follow a Protocol',
    desc: 'Access structured research protocols with dosing schedules, timing, and compound guidance.',
    href: '/protocols',
    color: '#fbbf24',
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      {/* Heading */}
      <div className="section-header">
        <span className="section-eyebrow" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.25)', background: 'rgba(56, 189, 248, 0.1)' }}>
          Getting started
        </span>
        <h2 id="hiw-heading" className="section-title">
          How Med-Peptides Works
        </h2>
        <p className="section-subtitle">
          From first question to structured protocol — four clear steps.
        </p>
      </div>

      {/* Steps grid */}
      <div style={stepsWrapStyle}>
        {STEPS.map((step, idx) => (
          <div key={step.number} style={stepStyle} className="card card--hover">
            {/* Connector line (not after last) */}
            {idx < STEPS.length - 1 && (
              <div style={{ ...connectorStyle, background: `linear-gradient(90deg, ${step.color}40, ${STEPS[idx + 1].color}40)` }} aria-hidden />
            )}

            {/* Icon circle */}
            <div style={{ ...iconCircleStyle, color: step.color, border: `1.5px solid ${step.color}40`, background: `${step.color}12` }}>
              <step.Icon />
            </div>

            {/* Step number */}
            <span style={{ ...stepNumStyle, color: step.color }}>{step.number}</span>

            {/* Title + desc */}
            <h3 style={stepTitleStyle}>{step.title}</h3>
            <p style={stepDescStyle}>{step.desc}</p>

            {/* Link */}
            <button
              style={{ ...stepLinkStyle, color: step.color }}
              onClick={() => navigate(step.href)}
            >
              Explore →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyle = {
  position: 'relative',
  zIndex: 1,
};

const stepsWrapStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: '1.5rem',
  position: 'relative',
};

const stepStyle = {
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: '0.5rem',
  padding: '1.5rem 1.75rem',
  background: 'var(--surface-raised)',
  border: '1px solid var(--border-light)',
  borderRadius: 'var(--radius-lg)',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
};

const connectorStyle = {
  display: 'none', // visible only on desktop via media query
};

const iconCircleStyle = {
  width: 52,
  height: 52,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.25rem',
};

const stepNumStyle = {
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  opacity: 0.8,
};

const stepTitleStyle = {
  fontSize: '1rem',
  fontWeight: 750,
  color: 'var(--text-main)',
  margin: '0.25rem 0 0',
};

const stepDescStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  opacity: 1,
  lineHeight: 1.55,
  margin: 0,
  flexGrow: 1,
};

const stepLinkStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.82rem',
  fontWeight: 700,
  padding: 0,
  marginTop: '0.5rem',
  transition: 'opacity 0.15s',
};

