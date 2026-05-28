 
/**
 * SyringeVisualizer — High-Precision Edition
 * -------------------------------------------
 * Props:
 *   units {string|number} — calculated units (0–100+). Values > 100 trigger
 *                           a red warning tint with a rhythmic pulse.
 *
 * Aesthetic goals (Antigravity standard):
 *   - Glass barrel with curved-glass gradient simulation
 *   - scaleY-based liquid fill with concave meniscus at the top
 *   - Intensity-reactive glow; >100 units → rhythmic red pulse
 *   - Dynamic horizontal guide line that tracks liquid level (laptop)
 *   - Larger tick labels on mobile; touch-action: none on container
 *   - Memoized tick array; ARIA value attributes
 */
import { useMemo, memo } from 'react';
import '../styles/syringe.css';

const BARREL_W  = 52;
const BARREL_H  = 172;
const MAX_UNITS = 100;

/* keyframes now in syringe.css */

function SyringeVisualizer({ units }) {
  const numeric = Math.max(0, parseFloat(units) || 0);
  const clamped  = Math.min(numeric, MAX_UNITS);
  const fillPct  = clamped / MAX_UNITS;          // 0 → 1
  const isOver   = numeric > MAX_UNITS;

  /* ── colours ─────────────────────────────────────────────────────────────── */
  const glowIntensity = 4 + fillPct * 14;        // grows with fill level
  const liquidTop     = isOver ? 'rgba(255,80,80,0.65)'  : 'rgba(255,255,255,0.5)';
  const liquidBottom  = isOver ? 'rgba(210,30,30,1)'     : 'rgba(255,255,255,1)';
  const glowColor     = isOver
    ? `rgba(220,40,40,${0.3 + fillPct * 0.3})`
    : `rgba(255,255,255,${0.1 + fillPct * 0.2})`;

  /* ── memoized ticks (only recalc if scale changes) ───────────────────────── */
  const ticks = useMemo(
    () => Array.from({ length: 11 }, (_, i) => i * 10),
    [] // MAX_UNITS is a constant — no dep needed
  );

  /* ── guide line Y position (pixels from top of barrel) ──────────────────── */
  const guideY = BARREL_H * (1 - fillPct);  // 0 = top when full

  return (
    <div
      className="syringe-visualizer"
      style={s.wrapper}
      aria-label={`Syringe fill: ${clamped} units`}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={MAX_UNITS}
      role="meter"
    >
      {/* ── Top label ──────────────────────────────────────────────────────── */}
      <div className="syringe-top-label" style={s.topLabel}>
        {isOver
          ? <span style={s.overWarn}>⚠ Exceeds 100 U</span>
          : <span style={s.topVal}>{numeric.toFixed(1)} U</span>
        }
      </div>

      {/* ── Plunger assembly ───────────────────────────────────────────────── */}
      <div style={s.plungerAssembly}>
        <div style={s.thumbCap} />
        <div style={s.rod} />
        <div
          style={{
            ...s.disc,
            marginTop: `${(1 - fillPct) * BARREL_H}px`,
            transition: 'margin-top 0.55s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>

      {/* ── Barrel ─────────────────────────────────────────────────────────── */}
      <div className="syringe-barrel" style={s.barrel}>

        {/* Glass curvature gradient overlay */}
        <div style={s.glassOverlay} aria-hidden="true" />

        {/* Graduation ticks */}
        {ticks.map((tick) => (
          <div key={tick} style={{ ...s.tickRow, bottom: `${tick}%` }}>
            <span className="syringe-tick-label" style={s.tickLabel}>{tick}</span>
            <div style={{
              ...s.tickLine,
              width: tick % 50 === 0 ? '14px' : tick % 10 === 0 ? '9px' : '6px',
              opacity: tick % 50 === 0 ? 0.75 : 0.5,
            }} />
          </div>
        ))}

        {/* Liquid fill — uses scaleY from bottom for smooth GPU animation */}
        <div
          style={{
            ...s.fillOuter,
            transform: `scaleY(${fillPct})`,
            animation: isOver ? 'sv-pulse 1.1s ease-in-out infinite' : 'none',
            boxShadow: isOver
              ? `0 0 22px 8px ${glowColor}`
              : `0 0 ${glowIntensity}px 3px ${glowColor}`,
            background: `linear-gradient(to top, ${liquidBottom}, ${liquidTop})`,
            transition: 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease',
          }}
        >
          {/* Concave meniscus at the top of the liquid */}
          <div style={s.meniscus} aria-hidden="true" />
          {/* Gloss highlight stripe */}
          <div style={s.highlight} aria-hidden="true" />
        </div>

        {/* Dynamic guide line — desktop only (hidden via CSS on mobile) */}
        <div
          className="syringe-guide-line"
          style={{
            ...s.guideLine,
            top: `${guideY}px`,
            opacity: fillPct > 0.02 ? 0.7 : 0,
          }}
          aria-hidden="true"
        />

        {/* Needle tip */}
        <div style={s.needle} aria-hidden="true" />
      </div>

      {/* ── Bottom label ───────────────────────────────────────────────────── */}
      <div style={s.bottomLabel}>0 U</div>
    </div>
  );
}

export default memo(SyringeVisualizer);

/* ─── Static styles ──────────────────────────────────────────────────────────
   All objects defined outside render — zero re-allocation per paint.        */
const s = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    userSelect: 'none',
    /* touchAction + gap now in .syringe-visualizer CSS class */
    gap: '4px',
  },

  /* Labels */
  topLabel:    { fontSize: '0.8rem', fontWeight: 700, minHeight: '1.2em', textAlign: 'center' },
  topVal:      { color: 'rgba(255,255,255,0.9)' },
  overWarn:    { color: '#ff6b6b', letterSpacing: '0.03em', animation: 'sv-warn-text 0.9s ease-in-out infinite' },
  bottomLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 },

  /* Plunger */
  plungerAssembly: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: `${BARREL_W}px` },
  thumbCap: {
    width: `${BARREL_W + 16}px`,
    height: '14px',
    borderRadius: '4px 4px 0 0',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.38), rgba(255,255,255,0.18))',
    border: '1px solid rgba(255,255,255,0.4)',
  },
  rod: {
    width: '10px',
    height: '18px',
    background: 'linear-gradient(to right, rgba(255,255,255,0.28), rgba(255,255,255,0.12))',
    border: '1px solid rgba(255,255,255,0.25)',
  },
  disc: {
    width: `${BARREL_W - 6}px`,
    height: '8px',
    borderRadius: '2px',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.45), rgba(255,255,255,0.2))',
    border: '1px solid rgba(255,255,255,0.5)',
    zIndex: 2,
  },

  /* Barrel — glass effect via gradient overlay */
  barrel: {
    position: 'relative',
    width: `${BARREL_W}px`,
    height: `${BARREL_H}px`,
    border: '1.5px solid rgba(255,255,255,0.4)',
    borderBottom: 'none',
    borderRadius: '4px 4px 0 0',
    overflow: 'visible',           // allow needle to protrude
    backgroundColor: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(6px)',
  },

  /* Simulates curved glass — two-stop gradient from left edge */
  glassOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '4px 4px 0 0',
    background: `
      linear-gradient(
        105deg,
        rgba(255,255,255,0.18) 0%,
        rgba(255,255,255,0.04) 38%,
        transparent 55%,
        rgba(255,255,255,0.06) 100%
      )
    `,
    pointerEvents: 'none',
    zIndex: 5,
    overflow: 'hidden',
  },

  /* Liquid fill — anchored at bottom, scales up via scaleY */
  fillOuter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: `${BARREL_H}px`,     // always full height; transform controls fill
    transformOrigin: 'bottom',
    overflow: 'hidden',
    zIndex: 1,
  },

  /* Concave meniscus — elliptical cutout at the top of the fill */
  meniscus: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '110%',
    height: '10px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.18)',   // dark shadow creates concave illusion
    pointerEvents: 'none',
  },

  /* Gloss stripe */
  highlight: {
    position: 'absolute',
    top: 0,
    left: '16%',
    width: '20%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.38), transparent)',
    borderRadius: '4px',
    pointerEvents: 'none',
  },

  /* Dynamic horizontal guide line */
  guideLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.75)',
    transition: 'top 0.55s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
    zIndex: 4,
    pointerEvents: 'none',
    // hidden on mobile via media query not possible inline; kept subtle
    boxShadow: '0 0 4px rgba(255,255,255,0.5)',
  },

  /* Tick rows */
  tickRow: {
    position: 'absolute',
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    transform: 'translateY(50%)',
    zIndex: 3,
    pointerEvents: 'none',
  },
  tickLabel: {
    /* fontSize + opacity now controlled by .syringe-tick-label CSS class */
    color: 'rgba(255,255,255,0.65)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
    minWidth: '18px',
    textAlign: 'right',
  },
  tickLine: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },

  /* Needle */
  needle: {
    position: 'absolute',
    bottom: '-18px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '6px',
    height: '18px',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.08))',
    borderRadius: '0 0 3px 3px',
    zIndex: 4,
  },
};
