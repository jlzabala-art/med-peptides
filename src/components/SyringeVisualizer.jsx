/**
 * SyringeVisualizer
 * -----------------
 * Renders a vertical insulin-syringe illustration whose liquid fill level
 * mirrors the current `units` value in real time.
 *
 * Props:
 *   units {string|number} — calculated units (0–100+). Values > 100 trigger a
 *                           red warning tint.
 */
export default function SyringeVisualizer({ units }) {
  const numeric = Math.max(0, parseFloat(units) || 0);
  const clamped = Math.min(numeric, 100);          // fill percentage (0–100)
  const isOver  = numeric > 100;

  // Ticks: 0, 10, 20 … 100  (11 values)
  const ticks = Array.from({ length: 11 }, (_, i) => i * 10);

  /* ── colours ─────────────────────────────────────────────────────────── */
  const liquidTop    = isOver ? 'rgba(255,100,100,0.7)' : 'rgba(255,255,255,0.55)';
  const liquidBottom = isOver ? 'rgba(220,40,40,1)'     : 'rgba(255,255,255,1)';
  const glowColor    = isOver ? 'rgba(220,40,40,0.45)'  : 'rgba(255,255,255,0.25)';

  return (
    <div style={s.wrapper} aria-label={`Syringe showing ${clamped} units`}>

      {/* ── Label above ─────────────────────────────────────────────── */}
      <div style={s.topLabel}>
        {isOver
          ? <span style={s.overWarn}>⚠ Exceeds 100 U</span>
          : <span style={s.topVal}>{numeric.toFixed(1)} U</span>}
      </div>

      {/* ── Plunger rod + cap ───────────────────────────────────────── */}
      <div style={s.plungerAssembly}>
        {/* Thumb cap */}
        <div style={s.thumbCap} />
        {/* Rod */}
        <div style={s.rod} />
        {/* Plunger disc — sits at the top of the fill */}
        <div
          style={{
            ...s.disc,
            marginTop: `${(1 - clamped / 100) * 100 * 1.72}px`, // tracks fill top
            transition: 'margin-top 0.5s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </div>

      {/* ── Barrel ──────────────────────────────────────────────────── */}
      <div style={s.barrel}>

        {/* Graduation ticks + labels */}
        {ticks.map((tick) => {
          const pct = tick; // 0 at bottom → tick 0 is at the bottom
          return (
            <div
              key={tick}
              style={{
                ...s.tickRow,
                bottom: `${pct}%`,
              }}
            >
              <span style={s.tickLabel}>{tick}</span>
              <div style={{
                ...s.tickLine,
                width: tick % 50 === 0 ? '14px' : tick % 10 === 0 ? '9px' : '6px',
              }} />
            </div>
          );
        })}

        {/* Liquid fill */}
        <div
          style={{
            ...s.fill,
            height: `${clamped}%`,
            background: `linear-gradient(to top, ${liquidBottom}, ${liquidTop})`,
            boxShadow: `0 0 18px 4px ${glowColor}`,
            transition: 'height 0.5s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease, box-shadow 0.3s ease',
          }}
        >
          {/* Highlight stripe */}
          <div style={s.highlight} />
        </div>

        {/* Needle tip at bottom */}
        <div style={s.needle} />
      </div>

      {/* ── Bottom label ────────────────────────────────────────────── */}
      <div style={s.bottomLabel}>0 U</div>
    </div>
  );
}

/* ─── styles ──────────────────────────────────────────────────────────────── */
const BARREL_W = 52;
const BARREL_H = 172;

const s = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    userSelect: 'none',
    gap: '4px',
  },

  /* Labels */
  topLabel: { fontSize: '0.8rem', fontWeight: 700, minHeight: '1.2em', textAlign: 'center' },
  topVal:   { color: 'rgba(255,255,255,0.9)' },
  overWarn: { color: '#ff6b6b', letterSpacing: '0.03em' },
  bottomLabel: { fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600 },

  /* Plunger assembly */
  plungerAssembly: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: `${BARREL_W}px`,
  },
  thumbCap: {
    width: `${BARREL_W + 16}px`,
    height: '14px',
    borderRadius: '4px 4px 0 0',
    backgroundColor: 'rgba(255,255,255,0.3)',
    border: '1px solid rgba(255,255,255,0.4)',
  },
  rod: {
    width: '10px',
    height: '18px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  disc: {
    width: `${BARREL_W - 6}px`,
    height: '8px',
    borderRadius: '2px',
    backgroundColor: 'rgba(255,255,255,0.35)',
    border: '1px solid rgba(255,255,255,0.5)',
    zIndex: 2,
  },

  /* Barrel */
  barrel: {
    position: 'relative',
    width: `${BARREL_W}px`,
    height: `${BARREL_H}px`,
    border: '2px solid rgba(255,255,255,0.45)',
    borderBottom: 'none',
    borderRadius: '4px 4px 0 0',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(4px)',
  },

  /* Fill liquid */
  fill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: '0 0 0 0',
    overflow: 'hidden',
  },

  /* Gloss highlight on the fill */
  highlight: {
    position: 'absolute',
    top: 0,
    left: '18%',
    width: '22%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)',
    borderRadius: '4px',
    pointerEvents: 'none',
  },

  /* Graduation ticks */
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
    fontSize: '9px',
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
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.5), rgba(255,255,255,0.1))',
    borderRadius: '0 0 3px 3px',
    zIndex: 4,
  },
};
