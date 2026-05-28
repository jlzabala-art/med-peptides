 
import React, { memo } from 'react';

/**
 * BrochureDosingTable — Clinical PDF-grade Dosing Schedule
 * Renders a clinical dosing table grouped by protocol phase.
 * Each row shows: Compound | Dose | Unit | Frequency | Route | Duration
 * Footer shows total weeks and unique compound count.
 *
 * Props:
 *   phases  — array of normalized protocol phase objects
 */
const BrochureDosingTable = memo(function BrochureDosingTable({ phases }) {
  if (!phases || phases.length === 0) {
    return (
      <div className="brochure-dosing-wrap">
        <div className="brochure-dosing-empty">No dosing data available for this protocol.</div>
      </div>
    );
  }

  // ── Helper: normalize dose string ──────────────────────────────────────────
  const normalizeDose = (d) => {
    if (!d || d === '—') return null;
    const str = String(d).replace(/_/g, ' ').trim();
    // Capitalize first letter
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // ── Helper: route → CSS modifier ───────────────────────────────────────────
  const routeClass = (route) => {
    if (!route) return 'other';
    const r = route.toLowerCase();
    if (r.includes('sub') || r.includes('sc') || r.includes('injection')) return 'sc';
    if (r.includes('nasal') || r.includes('intranasal') || r.includes('in')) return 'in';
    if (r.includes('oral') || r.includes('mouth')) return 'oral';
    if (r.includes('intramusc') || r.includes('im')) return 'im';
    if (r.includes('topic') || r.includes('cream') || r.includes('gel')) return 'topical';
    return 'other';
  };

  // ── Helper: humanize field value ───────────────────────────────────────────
  const humanizeLocal = (val) => {
    if (!val || val === '—') return '—';
    return String(val)
      .replace(/_/g, ' ')
      .replace(/subcutaneous or/gi, 'SC /')
      .replace(/intranasal or/gi, 'Intranasal /')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  // ── Build phase group data ─────────────────────────────────────────────────
  const PHASE_COLORS = [
    '#1D4ED8', '#0369A1', '#047857', '#7C3AED',
    '#B45309', '#0F766E', '#9333EA', '#DC2626',
  ];

  let totalWeeks = 0;
  const uniqueCompounds = new Set();

  const phaseGroups = phases.map((ph, phIdx) => {
    const dur = ph.default_duration_weeks || ph.duration_weeks || 4;
    totalWeeks += dur;

    const color = PHASE_COLORS[phIdx % PHASE_COLORS.length];
    const drugs = ph.drugs || ph.compounds || ph.medications || [];

    const rows = drugs.map((d) => {
      const compoundName = d.product_title || d.name || '—';
      uniqueCompounds.add(compoundName);

      // Dose resolution — supports multiple schema variants
      const startDose = d.dose_logic?.starting_weekly_dose
        ?? d.dose_logic?.default_weekly_dose
        ?? d.dose_logic?.dose_per_administration
        ?? d.weekly_dose
        ?? d.per_administration_dose
        ?? d.selected_strength
        ?? null;
      const maxDose = d.dose_logic?.max_weekly_dose
        ?? d.dose_logic?.possible_next_step_dose
        ?? null;
      const doseUnit = d.dose_logic?.dose_unit || d.dose_unit || d.unit || '';
      const freq = d.dose_logic?.administration_frequency || d.frequency || d.admin_frequency || '';
      const route = d.dose_logic?.route_of_administration || d.route || d.administration_route || '';
      const adminPerWeek = d.dose_logic?.administrations_per_week ?? null;

      let doseStr;
      if (startDose && maxDose && startDose !== maxDose) {
        doseStr = `${startDose} → ${maxDose}`;
      } else {
        doseStr = normalizeDose(startDose) || d.dose_logic?.intensity || '—';
      }

      return {
        compound: compoundName,
        dose: doseStr,
        unit: humanizeLocal(doseUnit),
        freq: humanizeLocal(freq) || (adminPerWeek ? `${adminPerWeek}×/wk` : '—'),
        route: humanizeLocal(route),
        routeCls: routeClass(route),
        duration: `${dur}w`,
        color,
      };
    });

    return {
      phase: ph.phase_title || ph.name || ph.phase_name || `Phase ${phIdx + 1}`,
      phaseNum: phIdx + 1,
      dur,
      color,
      rows,
    };
  });

  return (
    <div className="brochure-dosing-wrap">

      {/* ── Column headers ── */}
      <div className="brochure-dosing-thead">
        <span>Compound</span>
        <span>Dose</span>
        <span>Unit</span>
        <span>Frequency</span>
        <span>Duration</span>
        <span>Route</span>
      </div>

      {/* ── Phase groups ── */}
      {phaseGroups.map((grp, gi) => (
        <div key={gi}>
          {/* Phase header separator */}
          <div
            className="brochure-dosing-phase-group"
            style={{ borderLeft: `3px solid ${grp.color}` }}
          >
            <div className="brochure-dosing-phase-label">
              <span className="phase-num" style={{ background: grp.color }}>{grp.phaseNum}</span>
              <span style={{ color: grp.color }}>{grp.phase.toUpperCase()}</span>
              <span className="phase-wks">{grp.dur} week{grp.dur !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Compound rows */}
          {grp.rows.length === 0 ? (
            <div className="brochure-dosing-row">
              <div className="brochure-dosing-compound">
                <span className="brochure-dosing-compound-dot" style={{ background: grp.color }} />
                <span className="brochure-dosing-compound-name" style={{ color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                  No compounds defined
                </span>
              </div>
              {['—', '—', '—', '—', '—'].map((v, i) => (
                <span key={i} className="brochure-dosing-cell">{v}</span>
              ))}
            </div>
          ) : grp.rows.map((row, ri) => (
            <div key={ri} className="brochure-dosing-row">
              {/* Compound */}
              <div className="brochure-dosing-compound">
                <span className="brochure-dosing-compound-dot" style={{ background: row.color }} />
                <span className="brochure-dosing-compound-name">{row.compound}</span>
              </div>
              {/* Dose */}
              <span className="brochure-dosing-cell brochure-dosing-cell--mono">{row.dose}</span>
              {/* Unit */}
              <span className="brochure-dosing-cell">{row.unit}</span>
              {/* Frequency */}
              <span className="brochure-dosing-cell">{row.freq}</span>
              {/* Duration */}
              <span className="brochure-dosing-cell">{row.duration}</span>
              {/* Route badge */}
              <span className={`brochure-dosing-route brochure-dosing-route--${row.routeCls}`}>
                {row.route}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* ── Totals footer ── */}
      <div className="brochure-dosing-totals">
        <span className="brochure-dosing-totals__label">Protocol Total</span>
        <span />
        <span />
        <span className="brochure-dosing-totals__val">{uniqueCompounds.size} compound{uniqueCompounds.size !== 1 ? 's' : ''}</span>
        <span className="brochure-dosing-totals__val">{totalWeeks}w</span>
        <span />
      </div>

    </div>
  );
});

export default BrochureDosingTable;
