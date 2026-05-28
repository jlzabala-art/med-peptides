/* eslint-disable no-unused-vars */
/**
 * ExpertAccessStrip.jsx — Phase 6-A
 * ─────────────────────────────────────────────────────────────────────────────
 * A compact, high-density strip of quick-access shortcuts for experienced
 * professional users who know exactly where they want to go.
 *
 * Actions (all pointing to real routes):
 *   1. Compare Compounds    → /compare
 *   2. Dose Calculator      → /calculator
 *   3. Protocol Finder      → /protocol-finder
 *   4. Full Catalog         → /search   (search view = catalog)
 *   5. Research Library     → /research/{first-article}  (generic)
 *
 * Design:
 *   - Dense horizontal layout, dark glass card.
 *   - Each shortcut has a colored icon bubble + label + arrow.
 *   - Hover: slide-up micro-animation on individual items.
 *   - Responsive: 2-col grid on mobile.
 *   - Category tag: "Expert Tools" eyebrow.
 */

import { Link } from 'react-router-dom';
import {
  GitCompare,
  FlaskConical,
  Search,
  BookOpen,
  ChevronRight,
  Beaker,
  Sparkles,
} from 'lucide-react';

// ── Shortcut definitions ───────────────────────────────────────────────────────

const SHORTCUTS = [
  {
    id: 'compare',
    label: 'Compare Compounds',
    desc: 'Side-by-side analysis',
    to: '/compare',
    Icon: GitCompare,
    accent: '#14b8a6',
    bg: 'rgba(20,184,166,0.10)',
    border: 'rgba(20,184,166,0.20)',
  },
  {
    id: 'calculator',
    label: 'Dose Calculator',
    desc: 'Precise reconstitution',
    to: '/calculator',
    Icon: Beaker,
    accent: '#a78bfa',
    bg: 'rgba(167,139,250,0.10)',
    border: 'rgba(167,139,250,0.20)',
  },
  {
    id: 'clinical-ai',
    label: 'ClinicalAI',
    desc: 'Guided exploration',
    to: '#',
    Icon: Sparkles,
    accent: '#38bdf8',
    bg: 'rgba(56,189,248,0.10)',
    border: 'rgba(56,189,248,0.20)',
    onClick: (e) => {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('nav:apiDashboard'));
    }
  },
  {
    id: 'catalog',
    label: 'Full Catalog',
    desc: 'All compounds & filters',
    to: '/search',
    Icon: Search,
    accent: '#fb923c',
    bg: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.20)',
  },
  {
    id: 'research',
    label: 'Research Library',
    desc: 'Studies & literature',
    to: '/faq',
    Icon: BookOpen,
    accent: '#34d399',
    bg: 'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.20)',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExpertAccessStrip() {
  return (
    <section className="eas-wrap" aria-label="Expert quick access">
      <div className="eas-inner">

        {/* Header row */}
        <div className="eas-header">
          <span className="eas-eyebrow">Expert Tools</span>
          <p className="eas-heading">Quick Access</p>
        </div>

        {/* Shortcut grid */}
        <div className="eas-grid">
          {SHORTCUTS.map(({ id, label, desc, to, Icon, accent, bg, border, onClick }) => (
            <Link
              key={id}
              to={to}
              onClick={onClick}
              className="eas-card"
              style={{ '--accent': accent, '--bg': bg, '--border': border }}
            >
              {/* Icon bubble */}
              <div className="eas-icon" style={{ background: bg, borderColor: border }}>
                <Icon size={18} strokeWidth={2} style={{ color: accent }} />
              </div>

              {/* Text */}
              <div className="eas-text">
                <span className="eas-label">{label}</span>
                <span className="eas-desc">{desc}</span>
              </div>

              {/* Arrow */}
              <ChevronRight size={15} className="eas-arrow" />
            </Link>
          ))}
        </div>
      </div>

      {/* Styles */}
      <style>{`
        /* ── Wrapper ── */
        .eas-wrap {
          background: linear-gradient(180deg,
            rgba(8,18,32,1) 0%,
            rgba(6,14,26,1) 100%
          );
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding: 2.25rem 1.5rem;
        }

        .eas-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        /* ── Header ── */
        .eas-header {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          min-width: 130px;
        }

        .eas-eyebrow {
          display: inline-block;
          padding: 0.22rem 0.7rem;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          background: rgba(56,189,248,0.1);
          border: 1px solid rgba(56,189,248,0.2);
          color: #38bdf8;
          width: fit-content;
        }

        .eas-heading {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.2;
        }

        /* ── Grid ── */
        .eas-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
        }

        /* ── Card ── */
        .eas-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 0.9rem;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg);
          text-decoration: none;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .eas-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.03) 0%,
            transparent 60%
          );
          border-radius: inherit;
          pointer-events: none;
        }

        .eas-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          border-color: var(--accent);
          background: rgba(255,255,255,0.04);
        }

        .eas-card:hover .eas-arrow {
          transform: translateX(3px);
          opacity: 1;
        }

        /* ── Icon ── */
        .eas-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          border: 1px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }

        .eas-card:hover .eas-icon {
          transform: scale(1.08);
        }

        /* ── Text ── */
        .eas-text {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
          flex: 1;
        }

        .eas-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #e2e8f0;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .eas-desc {
          font-size: 0.7rem;
          color: #475569;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Arrow ── */
        .eas-arrow {
          color: #475569;
          flex-shrink: 0;
          transition: transform 0.2s ease, opacity 0.2s ease;
          opacity: 0.6;
        }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .eas-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.25rem;
          }
          .eas-grid {
            width: 100%;
            grid-template-columns: repeat(3, 1fr);
          }
          .eas-header {
            flex-direction: row;
            align-items: center;
            gap: 0.75rem;
          }
        }

        @media (max-width: 640px) {
          .eas-wrap {
            padding: 1.75rem 1rem;
          }
          .eas-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .eas-card {
            padding: 0.75rem;
            gap: 0.6rem;
          }
          .eas-label { font-size: 0.75rem; }
          .eas-desc  { display: none; }
          .eas-arrow { display: none; }
        }
      `}</style>
    </section>
  );
}
