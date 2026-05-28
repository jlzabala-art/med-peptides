 
/**
 * TrustHub.jsx — Phase 5-A
 *
 * Tabbed wrapper that consolidates the three trust-related sections:
 *   • TrustStrip    → "Certifications" tab
 *   • EmotionalTrust → "Testimonials" tab
 *   • GlobalLogistics → "Logistics" tab
 *
 * Design principle: pure composition. Each inner section renders unchanged.
 * The hub provides a single cohesive framing layer.
 */

import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, MessageCircle, Globe } from 'lucide-react';
import TrustStrip from './TrustStrip';
import EmotionalTrust from './EmotionalTrust';
import GlobalLogistics from './GlobalLogistics';

// ── Tab definitions ────────────────────────────────────────────────────────────

const TABS = [
  {
    id: 'certifications',
    label: 'Certifications',
    shortLabel: 'Certified',
    Icon: ShieldCheck,
    accent: '#14b8a6',
    glow: 'rgba(20,184,166,0.14)',
    gradient: 'linear-gradient(135deg,#0d9488 0%,#14b8a6 100%)',
  },
  {
    id: 'testimonials',
    label: 'Testimonials',
    shortLabel: 'Reviews',
    Icon: MessageCircle,
    accent: '#a78bfa',
    glow: 'rgba(167,139,250,0.14)',
    gradient: 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)',
  },
  {
    id: 'logistics',
    label: 'Global Logistics',
    shortLabel: 'Logistics',
    Icon: Globe,
    accent: '#38bdf8',
    glow: 'rgba(56,189,248,0.14)',
    gradient: 'linear-gradient(135deg,#0284c7 0%,#38bdf8 100%)',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function TrustHub() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const inkRef = useRef(null);
  const tabsRef = useRef({});

  const active = TABS.find(t => t.id === activeTab);

  // Animate the ink underline to follow the active tab button
  useEffect(() => {
    const el = tabsRef.current[activeTab];
    if (!el || !inkRef.current) return;
    const { offsetLeft, offsetWidth } = el;
    inkRef.current.style.transform = `translateX(${offsetLeft}px)`;
    inkRef.current.style.width = `${offsetWidth}px`;
  }, [activeTab]);

  return (
    <section className="th-hub">
      {/* ── Header ── */}
      <div className="th-header">
        <p className="th-eyebrow">Transparency &amp; Trust</p>
        <h2 className="th-heading">
          Built on Verification,{' '}
          <span className="th-accent" style={{ color: active.accent }}>
            Backed by Science
          </span>
        </h2>
        <p className="th-sub">
          Every claim is documented. Every shipment is tracked.
        </p>

        {/* ── Tab bar ── */}
        <div className="th-tabbar" role="tablist" aria-label="Trust sections">
          {/* Animated glow behind active tab */}
          <div
            className="th-tab-glow"
            style={{ background: active.glow }}
          />

          {TABS.map(tab => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                ref={el => (tabsRef.current[tab.id] = el)}
                role="tab"
                aria-selected={isActive}
                aria-controls={`th-panel-${tab.id}`}
                id={`th-tab-${tab.id}`}
                className={`th-tab ${isActive ? 'th-tab--active' : ''}`}
                style={isActive ? { color: tab.accent } : {}}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.Icon size={15} strokeWidth={2} />
                <span className="th-tab-full">{tab.label}</span>
                <span className="th-tab-short">{tab.shortLabel}</span>
              </button>
            );
          })}

          {/* Sliding ink underline */}
          <div
            ref={inkRef}
            className="th-ink"
            style={{ background: active.gradient }}
          />
        </div>
      </div>

      {/* ── Panel ── */}
      <div className="th-panel-wrap">
        {TABS.map(tab => (
          <div
            key={tab.id}
            id={`th-panel-${tab.id}`}
            role="tabpanel"
            aria-labelledby={`th-tab-${tab.id}`}
            hidden={tab.id !== activeTab}
          >
            {tab.id === activeTab && (
              <>
                {tab.id === 'certifications' && <TrustStrip />}
                {tab.id === 'testimonials'   && <EmotionalTrust />}
                {tab.id === 'logistics'      && <GlobalLogistics />}
              </>
            )}
          </div>
        ))}
      </div>

      {/* ── Styles ── */}
      <style>{`
        /* ── Hub shell ── */
        .th-hub {
          background: linear-gradient(180deg, rgba(5,14,26,1) 0%, rgba(8,20,36,1) 100%);
          border-top: 1px solid rgba(255,255,255,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 0;
          overflow: hidden;
        }

        /* ── Header ── */
        .th-header {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3.5rem 1.5rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6rem;
        }

        .th-eyebrow {
          display: inline-block;
          padding: 0.28rem 0.9rem;
          border-radius: 999px;
          background: rgba(20,184,166,0.1);
          border: 1px solid rgba(20,184,166,0.2);
          color: #14b8a6;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0;
        }

        .th-heading {
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          font-weight: 800;
          color: #f8fafc;
          text-align: center;
          letter-spacing: -0.025em;
          line-height: 1.15;
          margin: 0;
        }

        .th-accent {
          transition: color 0.35s ease;
        }

        .th-sub {
          color: #64748b;
          font-size: 0.95rem;
          text-align: center;
          margin: 0 0 1.25rem;
        }

        /* ── Tab bar ── */
        .th-tabbar {
          position: relative;
          display: flex;
          align-items: stretch;
          gap: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 4px;
          overflow: hidden;
          margin-bottom: 0;
        }

        .th-tab-glow {
          position: absolute;
          inset: 0;
          border-radius: 12px;
          pointer-events: none;
          transition: background 0.35s ease;
          z-index: 0;
        }

        .th-tab {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 1.4rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #64748b;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: color 0.25s ease, background 0.2s ease;
          white-space: nowrap;
          font-family: inherit;
        }

        .th-tab:hover:not(.th-tab--active) {
          color: #94a3b8;
          background: rgba(255,255,255,0.03);
        }

        .th-tab--active {
          background: rgba(255,255,255,0.05);
          font-weight: 700;
        }

        /* short labels hidden by default */
        .th-tab-short { display: none; }

        /* Ink underline */
        .th-ink {
          position: absolute;
          bottom: 3px;
          height: 2.5px;
          border-radius: 2px;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      width   0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      background 0.35s ease;
          z-index: 2;
          pointer-events: none;
        }

        /* ── Panel ── */
        .th-panel-wrap {
          animation: th-fade 0.3s ease;
        }

        @keyframes th-fade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .th-header {
            padding: 2.5rem 1rem 0;
          }
          .th-tabbar {
            width: 100%;
          }
          .th-tab {
            flex: 1;
            justify-content: center;
            padding: 0.6rem 0.5rem;
            font-size: 0.78rem;
            gap: 0.35rem;
          }
          .th-tab-full  { display: none; }
          .th-tab-short { display: inline; }
        }
      `}</style>
    </section>
  );
}
