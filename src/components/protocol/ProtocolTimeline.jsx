/* eslint-disable no-unused-vars */
import React, { useState, useMemo } from 'react';

/**
 * ProtocolTimeline — The Chronos Engine
 * Renders a clinical-grade week-by-week protocol visualization.
 * Desktop: horizontal scrollable track
 * Mobile: vertical stacked list
 *
 * Props:
 *   weeks        {number}   Total protocol weeks (8, 12 or 16)
 *   weeklyDoses  {Array}    [{week, dose, phase, note}] — sparse array OK
 *   unit         {string}   Display unit (mg, mcg, IU…)
 *   productName  {string}
 */
const PHASE_META = {
  priming:    { label: 'Priming',    color: '#a8d8ea', text: '#1a5f7a', desc: 'Sensitization phase. Low-dose introduction to assess individual response.' },
  titration:  { label: 'Titration', color: '#7ec8e3', text: '#145374', desc: 'Gradual dose escalation to reach therapeutic window.' },
  therapeutic:{ label: 'Therapeutic',color: '#4a9fc9', text: '#003366', desc: 'Maintenance at effective dose. Primary outcome window.' },
  peak:       { label: 'Peak',      color: '#2176ae', text: 'var(--color-bg-surface)', desc: 'Maximum protocol dose. Monitor closely for individual tolerance.' },
  taper:      { label: 'Taper',     color: '#6ea4ce', text: '#1d3557', desc: 'Controlled dose reduction to preserve gains and support recovery.' },
  washout:    { label: 'Washout',   color: '#b8cce4', text: '#3d5a80', desc: 'Off-cycle recovery. Allow system clearance before next cycle.' },
};

function buildDefaultWeeks(totalWeeks) {
  return Array.from({ length: totalWeeks }, (_, i) => {
    const w = i + 1;
    let phase = 'therapeutic';
    if (w <= 2) phase = 'priming';
    else if (w <= 4) phase = 'titration';
    else if (w >= totalWeeks - 1) phase = 'taper';
    return { week: w, dose: null, phase };
  });
}

function mergeWeekData(defaults, provided = []) {
  const map = {};
  provided.forEach(d => { if (d.week) map[d.week] = d; });
  return defaults.map(d => ({ ...d, ...(map[d.week] || {}) }));
}

const ProtocolTimeline = React.memo(function ProtocolTimeline({
  weeks = 12,
  weeklyDoses = [],
  unit = 'mg',
  productName = '',
}) {
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const timeline = useMemo(() => {
    const defaults = buildDefaultWeeks(weeks);
    return mergeWeekData(defaults, weeklyDoses);
  }, [weeks, weeklyDoses]);

  const maxDose = useMemo(() => {
    const numeric = timeline.map(w => parseFloat(w.dose) || 0);
    return Math.max(...numeric, 1);
  }, [timeline]);

  const hovered = hoveredWeek != null ? timeline.find(w => w.week === hoveredWeek) : null;
  const phaseMeta = hovered ? (PHASE_META[hovered.phase] || PHASE_META.therapeutic) : null;

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .pt-root {
          font-family: 'Inter', system-ui, sans-serif;
          width: 100%;
        }

        /* ── Desktop: horizontal scrollable track ── */
        .pt-track-desktop {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          padding-bottom: 0.5rem;
          position: relative;
        }
        .pt-track-desktop::-webkit-scrollbar { display: none; }

        /* Connector line */
        .pt-track-desktop::before {
          content: '';
          position: absolute;
          top: 40px;
          left: 0;
          right: 0;
          height: 0.5px;
          background: linear-gradient(90deg, transparent, rgba(0,54,102,0.15), transparent);
          pointer-events: none;
        }

        .pt-week-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;
          min-width: 64px;
          flex: 1;
          cursor: pointer;
          padding: 0.5rem 0.25rem;
          border-radius: 10px;
          transition: background 0.2s ease, transform 0.2s ease;
          position: relative;
        }
        .pt-week-cell:hover {
          background: rgba(0,54,102,0.04);
          transform: translateY(-2px);
        }

        .pt-week-num {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--text-muted, #64748b);
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .pt-dot-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
        }

        .pt-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid rgba(255,255,255,0.8);
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          z-index: 1;
        }
        .pt-week-cell:hover .pt-dot {
          transform: scale(1.15);
          box-shadow: 0 4px 14px rgba(0,54,102,0.2);
        }

        .pt-dose-label {
          font-family: 'JetBrains Mono', 'Courier New', monospace;
          font-size: 0.6rem;
          font-weight: 700;
          color: var(--text-muted, #64748b);
          text-align: center;
          white-space: nowrap;
          letter-spacing: -0.02em;
        }

        /* Phase legend strip */
        .pt-phase-label {
          font-size: 0.55rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.18rem 0.4rem;
          border-radius: 4px;
          white-space: nowrap;
          margin-top: 0.15rem;
        }

        /* Tooltip card */
        .pt-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: white;
          border: 1px solid rgba(0,54,102,0.12);
          border-radius: 10px;
          padding: 0.6rem 0.8rem;
          min-width: 180px;
          max-width: 220px;
          box-shadow: 0 8px 24px rgba(0,54,102,0.14);
          z-index: 100;
          pointer-events: none;
          animation: fadeUp 0.15s ease-out;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(6px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* ── Mobile: vertical list ── */
        .pt-track-mobile {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
        }
        .pt-track-mobile::before {
          content: '';
          position: absolute;
          left: 20px;
          top: 0;
          bottom: 0;
          width: 0.5px;
          background: linear-gradient(180deg, transparent, rgba(0,54,102,0.15), transparent);
        }

        .pt-mobile-row {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem 0.5rem 0.5rem 0;
          cursor: pointer;
          border-radius: 8px;
          transition: background 0.18s ease;
          position: relative;
        }
        .pt-mobile-row:hover { background: rgba(0,54,102,0.03); }

        .pt-mobile-dot {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 2px;
          border: 1.5px solid rgba(255,255,255,0.7);
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .pt-mobile-info { display: flex; flex-direction: column; gap: 0.15rem; }
        .pt-mobile-week-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted, #64748b);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .pt-mobile-dose-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main, #0f172a);
        }
        .pt-mobile-phase-badge {
          font-size: 0.55rem;
          font-weight: 800;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          display: inline-block;
        }
        .pt-mobile-note {
          font-size: 0.75rem;
          color: var(--text-muted, #64748b);
          line-height: 1.4;
          margin-top: 0.1rem;
        }
      `}</style>

      <div className="pt-root">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary, #003666)' }}>
              Protocol Timeline
            </h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.72rem', color: 'var(--text-muted, #64748b)', fontWeight: 500 }}>
              {weeks}-Week Standard Protocol · {productName}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {Object.entries(PHASE_META).slice(0, 4).map(([key, meta]) => (
              <span key={key} style={{ fontSize: '0.55rem', fontWeight: 800, padding: '0.18rem 0.5rem', borderRadius: 4, background: meta.color, color: meta.text, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {meta.label}
              </span>
            ))}
          </div>
        </div>

        {/* Track */}
        {isMobile ? (
          /* ── MOBILE VERTICAL ── */
          <div className="pt-track-mobile">
            {timeline.map(w => {
              const meta = PHASE_META[w.phase] || PHASE_META.therapeutic;
              const intensity = w.dose ? Math.min(parseFloat(w.dose) / maxDose, 1) : 0.4;
              const bgColor = meta.color;
              return (
                <div key={w.week} className="pt-mobile-row">
                  <div className="pt-mobile-dot" style={{ background: bgColor, opacity: 0.3 + intensity * 0.7 }} />
                  <div className="pt-mobile-info">
                    <span className="pt-mobile-week-label">W{String(w.week).padStart(2, '0')}</span>
                    <span className="pt-mobile-dose-label">
                      {w.dose ? `${w.dose} ${unit}` : '— TBD'}
                    </span>
                    <span className="pt-mobile-phase-badge" style={{ background: meta.color, color: meta.text }}>
                      {meta.label}
                    </span>
                    {w.note && <span className="pt-mobile-note">{w.note}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── DESKTOP HORIZONTAL ── */
          <div className="pt-track-desktop">
            {timeline.map(w => {
              const meta = PHASE_META[w.phase] || PHASE_META.therapeutic;
              const intensity = w.dose ? Math.min(parseFloat(w.dose) / maxDose, 1) : 0.4;
              const alpha = 0.3 + intensity * 0.7;
              const isHovered = hoveredWeek === w.week;

              return (
                <div
                  key={w.week}
                  className="pt-week-cell"
                  onMouseEnter={() => setHoveredWeek(w.week)}
                  onMouseLeave={() => setHoveredWeek(null)}
                >
                  <span className="pt-week-num">W{String(w.week).padStart(2, '0')}</span>

                  <div className="pt-dot-wrap">
                    <div
                      className="pt-dot"
                      style={{
                        background: meta.color,
                        opacity: alpha,
                        boxShadow: isHovered
                          ? `0 4px 16px ${meta.color}88`
                          : `0 2px 8px ${meta.color}44`,
                      }}
                    />
                  </div>

                  <span className="pt-dose-label">
                    {w.dose ? `${w.dose}${unit}` : '—'}
                  </span>

                  <span
                    className="pt-phase-label"
                    style={{ background: `${meta.color}55`, color: meta.text }}
                  >
                    {meta.label.substring(0, 4)}
                  </span>

                  {/* Tooltip */}
                  {isHovered && (
                    <div className="pt-tooltip">
                      <div style={{ fontFamily: 'monospace', fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.3rem', letterSpacing: '0.03em' }}>
                        WEEK {w.week} — {meta.label.toUpperCase()}
                      </div>
                      {w.dose && (
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                          {w.dose} {unit}
                        </div>
                      )}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                        {w.note || meta.desc}
                      </div>
                      {w.objective && (
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: meta.text, background: `${meta.color}44`, padding: '0.2rem 0.4rem', borderRadius: 5, marginTop: '0.4rem' }}>
                          🎯 {w.objective}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* RUO disclaimer */}
        <p style={{
          margin: '0.75rem 0 0',
          fontSize: '0.62rem',
          color: 'var(--text-muted, #94a3b8)',
          fontWeight: 500,
          letterSpacing: '0.02em',
          borderTop: '0.5px solid var(--border, #e2e8f0)',
          paddingTop: '0.5rem',
        }}>
          Protocol parameters based on current research data. For Research Use Only (RUO). Individual responses may vary.
        </p>
      </div>
    </div>
  );
});

export default ProtocolTimeline;
