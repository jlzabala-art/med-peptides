/* eslint-disable no-unused-vars */
/**
 * InjectionDoseChart
 * ──────────────────
 * Reads the same phase_blueprints array used by ProtocolTimeline and
 * renders a per-week syringe dose visualisation showing:
 *   - How many insulin-syringe units (0–100 U scale) correspond to each injection
 *   - Grouping by protocol phase with matching color theming
 *   - Mini SyringeVisualizer for each week / injection event
 *   - Concentration selector so the user can recalculate on the fly
 *
 * Unit maths:
 *   A standard insulin syringe (U-100) holds 1 mL = 100 units.
 *   Volume (mL) = dose_mg / concentration_mg_per_mL
 *   Units        = volume_mL × 100
 *
 * Props:
 *   phase_blueprints  {Array}  — protocol.phase_blueprints
 *   defaultConc       {number} — mg/mL reconstitution concentration (default 2)
 *   compact           {bool}   — shows only 1 syringe per phase (summary mode)
 */

import React, { useState, useMemo, useEffect, useRef, memo } from 'react';
import { normalizeProtocol, frequencyToInjectionsPerWeek, doseToObject } from '../../utils/protocolSchemaAdapter';


// Phase colour tokens — mirrors ProtocolTimeline's PHASE_META
const PHASE_COLORS = {
  priming:     { bg: '#dbeafe', border: '#93c5fd', text: '#1e40af', label: 'Priming' },
  loading:     { bg: '#ede9fe', border: '#c4b5fd', text: '#5b21b6', label: 'Loading' },
  therapeutic: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46', label: 'Therapeutic' },
  maintenance: { bg: 'var(--color-success-bg)', border: '#86efac', text: '#166534', label: 'Maintenance' },
  tapering:    { bg: '#fef3c7', border: '#fcd34d', text: '#92400e', label: 'Taper' },
  washout:     { bg: '#fee2e2', border: '#fca5a5', text: '#991b1b', label: 'Washout' },
  default:     { bg: '#f1f5f9', border: 'var(--color-border)', text: 'var(--color-text-secondary)', label: 'Phase' },
};

function normalizePhaseKey(phaseTitle = '') {
  const t = phaseTitle.toLowerCase();
  if (t.includes('prim'))  return 'priming';
  if (t.includes('load'))  return 'loading';
  if (t.includes('ther') || t.includes('active')) return 'therapeutic';
  if (t.includes('maint')) return 'maintenance';
  if (t.includes('taper')) return 'tapering';
  if (t.includes('wash'))  return 'washout';
  return 'default';
}

// ── Sub-component: single syringe card ──────────────────────────────────────
const SyringeCard = memo(function SyringeCard({ week, units, dose, unit, note, phaseColor, cardIndex }) {
  const cardRef   = useRef(null);
  const [liveUnits, setLiveUnits] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const staggerMs = Math.min(cardIndex * 55, 600); // max 600 ms total stagger
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const t = setTimeout(() => setLiveUnits(units), staggerMs);
          observer.disconnect();
          return () => clearTimeout(t);
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [units, cardIndex]);

  // If units prop changes (concentration selector) — animate from current fill
  const prevUnits = useRef(units);
  useEffect(() => {
    if (prevUnits.current !== units && liveUnits > 0) {
      setLiveUnits(units);
      prevUnits.current = units;
    }
  }, [units, liveUnits]);

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.85rem 0.5rem 0.6rem',
        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '12px',
        border: `1px solid ${phaseColor.border}66`,
        minWidth: '78px',
        maxWidth: '90px',
        flex: '0 0 auto',
        boxShadow: isHovered ? '0 12px 24px -8px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        position: 'relative',
        overflow: 'visible',
        animation: 'idc-card-in 0.45s ease both',
        animationDelay: `${Math.min(cardIndex * 55, 600)}ms`,
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        cursor: 'default'
      }}>
      
      {/* ── Hover Tooltip ── */}
      {isHovered && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '10px',
          background: '#0f172a',
          color: 'var(--color-bg-app)',
          padding: '0.6rem 0.8rem',
          borderRadius: '8px',
          fontSize: '0.7rem',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
          animation: 'idc-card-in 0.2s ease-out forwards'
        }}>
          <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.8rem', fontFamily: "'JetBrains Mono', monospace" }}>
            {liveUnits.toFixed(1)} Units
          </div>
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: '0.65rem' }}>on U-100 Syringe</div>
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #0f172a'
          }} />
        </div>
      )}

      {/* Phase accent strip at top */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '4px',
        background: phaseColor.border,
        borderRadius: '12px 12px 0 0',
      }} />

      {/* Week label */}
      <span style={{
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: '0.65rem',
        fontWeight: 800,
        color: 'var(--color-text-secondary)',
        letterSpacing: '0.06em',
        marginTop: '0.2rem',
      }}>
        W{String(week).padStart(2, '0')}
      </span>

      {/* The vial indicator */}
      <div style={{
        width: '42px',
        height: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: phaseColor.bg,
        borderRadius: '8px',
        border: `1px solid ${phaseColor.border}`,
        margin: '0.3rem 0',
      }}>
        <div style={{
          fontSize: '0.9rem',
          fontWeight: 900,
          color: phaseColor.text,
          lineHeight: 1,
        }}>
          V{String(Math.floor(week / 4) + 1)}
        </div>
        <div style={{
          fontSize: '0.55rem',
          fontWeight: 800,
          color: phaseColor.text,
          opacity: 0.7,
          marginTop: '0.15rem',
          textTransform: 'uppercase',
        }}>
          Vial
        </div>
      </div>

      {/* Dose label below */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 900,
          color: '#0f172a',
          fontFamily: "'JetBrains Mono', monospace",
          lineHeight: 1.1,
        }}>
          {dose}{unit}
        </div>
        <div style={{
          fontSize: '0.6rem',
          color: 'var(--color-text-secondary)',
          marginTop: '0.15rem',
          lineHeight: 1.2,
          fontWeight: 600
        }}>
          Per Dose
        </div>
        {note && (
          <div style={{
            fontSize: '0.58rem',
            color: phaseColor.text,
            marginTop: '0.3rem',
            lineHeight: 1.3,
            maxWidth: '78px',
            wordBreak: 'break-word',
            fontWeight: 500
          }}>
            {note}
          </div>
        )}
      </div>
    </div>
  );
});

// ── Phase group block ────────────────────────────────────────────────────────
const PhaseBlock = memo(function PhaseBlock({ phaseTitle, weeks, compact }) {
  const key    = normalizePhaseKey(phaseTitle);
  const colors = PHASE_COLORS[key];

  // In compact mode show only first + last week
  const displayWeeks = compact
    ? [weeks[0], weeks.length > 1 ? weeks[weeks.length - 1] : null].filter(Boolean)
    : weeks;

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Phase header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
        <div style={{
          width: '8px', height: '8px',
          borderRadius: '50%',
          background: colors.border,
          flexShrink: 0,
        }} />
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: colors.text,
          background: colors.bg,
          padding: '0.2rem 0.55rem',
          borderRadius: 20,
          border: `0.5px solid ${colors.border}`,
        }}>
          {phaseTitle}
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {weeks.length} week{weeks.length !== 1 ? 's' : ''}
        </span>
        {compact && weeks.length > 2 && (
          <span style={{ fontSize: '0.62rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
            · showing W{weeks[0].week} & W{weeks[weeks.length - 1].week}
          </span>
        )}
      </div>

      {/* Syringe row */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {displayWeeks.map((w, wi) => (
          <SyringeCard
            key={w.week}
            week={w.week}
            units={w.units}
            dose={w.dose}
            unit={w.unit}
            note={w.note}
            phaseColor={colors}
            cardIndex={wi}
          />
        ))}
        {compact && weeks.length > 2 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 0.75rem',
            color: 'var(--color-text-tertiary)',
            fontSize: '0.72rem',
            fontStyle: 'italic',
            flexShrink: 0,
          }}>
            +{weeks.length - 2} more weeks…
          </div>
        )}
      </div>
    </div>
  );
});

// ── Main component ───────────────────────────────────────────────────────────
const InjectionDoseChart = memo(function InjectionDoseChart({
  phase_blueprints = [],
  protocol         = null,   // alternative: pass a full raw protocol object
  defaultConc      = 2,      // mg/mL default reconstitution
  compact          = false,
}) {
  const [conc, setConc] = useState(defaultConc); // mg per mL

  // Build per-week injection data per phase using the canonical adapter.
  // Accepts either a full `protocol` object or the legacy `phase_blueprints` array.
  const phases = useMemo(() => {
    // Construct the raw input for the adapter
    const rawInput = protocol
      ? protocol
      : { phase_blueprints };

    // Normalize into the canonical v3 schema
    const normalized = normalizeProtocol(rawInput);
    if (!normalized.phases || normalized.phases.length === 0) return [];

    return normalized.phases.map((ph) => {
      const startWeek = ph.start_week || 1;
      const endWeek   = ph.end_week   || startWeek;
      const dur       = endWeek - startWeek + 1;

      // Use the primary compound from the canonical shape
      const compound = (ph.compounds || [])[0];
      if (!compound) return null;

      // Resolve representative schedule entry (first one)
      const schedule0 = (compound.schedule || [])[0];
      if (!schedule0) return null;

      const freqObj           = schedule0.frequency || { times: 1, period: 'week' };
      const injectionsPerWeek = frequencyToInjectionsPerWeek(freqObj);

      // Adapter always produces mg doses; convert mcg back for display if original unit was mcg
      const unitLabel = schedule0.dose?.unit || 'mg';
      const isMcg     = unitLabel === 'mcg';
      // For volume maths, work in mg (1 mcg = 0.001 mg)
      const unitFactor = isMcg ? 0.001 : 1;

      // Find start/end dose across all schedule entries (support ramps)
      const allEntries   = compound.schedule || [];
      const firstEntry   = allEntries[0]  || schedule0;
      const lastEntry    = allEntries[allEntries.length - 1] || schedule0;
      const rawStart     = (firstEntry.dose?.amount || 0);
      const rawEnd       = (lastEntry.dose?.amount  || rawStart);

      const startDoseMg  = rawStart * unitFactor;
      const endDoseMg    = rawEnd   * unitFactor;

      const weeks = [];
      for (let w = 0; w < dur; w++) {
        // Linear ramp from start → end across the phase duration
        const rampFraction = dur > 1 ? w / (dur - 1) : 0;
        const weeklyDoseMg = startDoseMg + (endDoseMg - startDoseMg) * rampFraction;

        // Per-injection dose (mg)
        const injectionDoseMg = weeklyDoseMg / Math.max(1, injectionsPerWeek);

        // Volume mL → U-100 insulin syringe units
        const volumeMl = conc > 0 ? injectionDoseMg / conc : 0;
        const units    = volumeMl * 100; // insulin units

        // Label in original units (mcg stays as mcg for display)
        const rawWeeklyDose    = rawStart + (rawEnd - rawStart) * rampFraction;
        const rawInjectionDose = rawWeeklyDose / Math.max(1, injectionsPerWeek);
        const doseLabel = rawInjectionDose % 1 === 0
          ? String(rawInjectionDose)
          : rawInjectionDose.toFixed(rawInjectionDose < 1 ? 2 : 1);

        weeks.push({
          week:  startWeek + w,
          dose:  doseLabel,
          unit:  unitLabel,
          units: Math.min(units, 120), // cap at 120 U (over-range renders red)
          note:  schedule0.notes || '',
          freq:  injectionsPerWeek,
        });
      }

      return { phaseTitle: ph.phase_name || 'Phase', weeks };
    }).filter(Boolean);
  }, [protocol, phase_blueprints, conc]);

  if (!phases.length) return null;

  const concOptions = [1, 2, 5, 10];

  return (
    <>
      <style>{`
        .idc-root {
          font-family: 'Inter', system-ui, sans-serif;
        }
        /* Hide webkit scrollbar in syringe rows */
        .idc-root ::-webkit-scrollbar { display: none; }

        /* ── Card entry animation ── */
        @keyframes idc-card-in {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .idc-conc-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }
        .idc-conc-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .idc-conc-btn {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: 'JetBrains Mono', monospace;
        }
        .idc-conc-btn:hover { border-color: #94a3b8; background: #f1f5f9; }
        .idc-conc-btn--active {
          background: #003666;
          border-color: #003666;
          color: #fff;
        }

        .idc-legend {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.62rem;
          color: #94a3b8;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }
        .idc-legend strong { color: #64748b; }

        .idc-disclaimer {
          margin-top: 0.75rem;
          padding-top: 0.6rem;
          border-top: 0.5px solid #f1f5f9;
          font-size: 0.6rem;
          color: #94a3b8;
          line-height: 1.4;
        }
      `}</style>

      <div className="idc-root">
        {/* Concentration selector */}
        <div className="idc-conc-selector">
          <span className="idc-conc-label">Reconstitution:</span>
          {concOptions.map((c) => (
            <button
              key={c}
              className={`idc-conc-btn${conc === c ? ' idc-conc-btn--active' : ''}`}
              onClick={() => setConc(c)}
            >
              {c} mg/mL
            </button>
          ))}
          {/* Custom input */}
          <input
            type="number"
            min="0.1"
            max="50"
            step="0.1"
            value={concOptions.includes(conc) ? '' : conc}
            placeholder="custom"
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v > 0) setConc(v);
            }}
            style={{
              width: '70px',
              fontSize: '0.72rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--color-text-primary)',
              outline: 'none',
            }}
          />
        </div>

        {/* Legend */}
        <div className="idc-legend">
          <span>📏 U-100 insulin syringe (1 mL = 100 units)</span>
          <span>·</span>
          <span>Dose ÷ {conc} mg/mL → volume → units</span>
        </div>

        {/* Phase blocks */}
        {phases.map((ph) => (
          <PhaseBlock
            key={ph.phaseTitle}
            phaseTitle={ph.phaseTitle}
            weeks={ph.weeks}
            compact={compact}
          />
        ))}

        {/* Disclaimer */}
        <p className="idc-disclaimer">
          Injection volumes are estimates based on {conc} mg/mL reconstitution.
          Actual volumes depend on your preparation. Always verify with a qualified researcher.
          For Research Use Only (RUO).
        </p>
      </div>
    </>
  );
});

export default InjectionDoseChart;
