/**
 * ProtocolComputationEngine.js
 * Centralized pure-computation layer for protocol data.
 * No React, no side-effects — safe to use in useMemo, workers, or SSR.
 * Phase 5 of ProtocolHeaderCharts improvement plan.
 */

// ── Palette ──────────────────────────────────────────────────────────────────
const COMPOUND_PALETTE = [
  '#22d3ee', '#4ade80', '#fb923c', '#a78bfa',
  '#f87171', '#facc15', '#34d399', '#60a5fa',
];

export function getCompoundColor(index) {
  return COMPOUND_PALETTE[index % COMPOUND_PALETTE.length];
}

export function getPhaseShadeColor(phaseName = '') {
  const n = phaseName.toLowerCase();
  if (n.includes('initiat')) return '#38bdf8';
  if (n.includes('escal'))   return '#34d399';
  if (n.includes('stabili')) return '#34d399';
  if (n.includes('mainten')) return '#a78bfa';
  if (n.includes('taper'))   return '#fb923c';
  if (n.includes('peak'))    return '#22d3ee';
  return '#38bdf8';
}

export function normalizePhaseLabel(raw = '') {
  const s = raw.toLowerCase().replace(/[_-]/g, ' ').trim();
  if (s.includes('initiat'))  return 'Initiation';
  if (s.includes('escal'))    return 'Escalation';
  if (s.includes('stabili'))  return 'Stabilization';
  if (s.includes('mainten'))  return 'Maintenance';
  if (s.includes('taper'))    return 'Taper';
  if (s.includes('peak'))     return 'Peak';
  const m = s.match(/phase\s*(\d+)/);
  if (m) return 'Phase ' + m[1];
  return raw.replace(/\b\w/g, c => c.toUpperCase());
}

// ── Intensity string → numeric scale (1–5) ───────────────────────────────────
const INTENSITY_SCALE = {
  optional_low:     1,
  low:              1,
  minimal:          1,
  standard:         2,
  moderate:         2,
  standard_plus:    3,
  enhanced:         3,
  conditional:      3,
  high:             4,
  peak:             4,
  maintenance:      3,
  maximum:          5,
};

export function intensityToNumeric(str = '') {
  const key = str.toLowerCase().replace(/[^a-z_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  if (INTENSITY_SCALE[key] !== undefined) return INTENSITY_SCALE[key];
  // Fallback: check partial matches
  for (const [k, v] of Object.entries(INTENSITY_SCALE)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return 2; // default to "standard"
}

// ── Drug field resolver (protocol-schema-agnostic) ────────────────────────────
// Parse numeric mg from strings like "2.5mg", "10 mg", or plain numbers
function parseMg(val) {
  if (val === undefined || val === null) return undefined;
  const n = parseFloat(String(val).replace(/[^0-9.]/g, ''));
  return isNaN(n) ? undefined : n;
}

export function resolveDrug(d, phaseIdx) {
  const logic = d.dose_logic || {};
  const name  = d.product_title || d.name || d.compound || d.product_slug || ('Compound ' + (phaseIdx + 1));

  // Try numeric dose fields first (support both nested dose_logic and flat weekly_dose schema)
  const rawStart =
    parseMg(logic.starting_dose) ??
    parseMg(logic.starting_weekly_dose) ??
    parseMg(logic.default_weekly_dose) ??
    parseMg(logic.dose_per_administration) ??
    parseMg(d.weekly_dose) ??          // flat schema: e.g. "2.5mg"
    parseMg(d.selected_strength) ??
    0;

  const rawEnd =
    parseMg(logic.peak_dose) ??
    parseMg(logic.max_dose) ??
    parseMg(logic.max_weekly_dose) ??
    parseMg(logic.maintenance_dose) ??
    parseMg(logic.possible_next_step_dose) ??
    parseMg(logic.default_weekly_dose) ??
    rawStart;

  // Detect intensity-based schema (dose_unit === 'protocol_defined' or intensity string present)
  const intensityStr = logic.starting_intensity || logic.intensity || logic.intensity_level || '';
  const isIntensityBased = !!(intensityStr || logic.dose_unit === 'protocol_defined');

  let startDose, endDose;
  if (isIntensityBased && rawStart === 0) {
    // Map intensity strings to 1–5 scale
    const startInt = intensityStr ? intensityToNumeric(intensityStr) : 2;
    const endInt   = logic.target_intensity ? intensityToNumeric(logic.target_intensity) : startInt;
    startDose = startInt;
    endDose   = endInt;
  } else {
    startDose = rawStart;
    endDose   = rawEnd;
  }

  const frequency   = logic.frequency || logic.administration_frequency || d.dosing_frequency || '';
  const route       = logic.route || d.route || '';
  const doseUnit    = logic.dose_unit || d.dose_unit || 'mg';
  const vialSize    = parseMg(logic.vial_size || logic.vial_volume || d.vial_size) || 0;
  const costPerVial = parseMg(d.cost_per_vial || logic.cost_per_vial) || 0;
  return { name, startDose, endDose, frequency, route, doseUnit, vialSize, costPerVial, isIntensityBased };
}

// ── Build chart data ──────────────────────────────────────────────────────────
export function buildChartData(phase_blueprints = [], phases = []) {
  try {
    const source = phase_blueprints.length ? phase_blueprints : phases;
    if (!source.length) return null;

    const compoundMap = {};
    let weekCursor = 0;

    const phaseBlocks = source.map((ph, idx) => {
      // Support explicit duration OR derive from start_week / end_week
      const dur   = ph.default_duration_weeks || ph.duration_weeks ||
        ((ph.end_week && ph.start_week) ? (ph.end_week - ph.start_week + 1) : 4);
      const raw   = ph.drugs || ph.compounds || ph.medications || ph.drugs_used || [];
      const drugs = raw.map(d => resolveDrug(d, idx));

      drugs.forEach(drug => {
        if (!compoundMap[drug.name]) {
          compoundMap[drug.name] = { color: getCompoundColor(Object.keys(compoundMap).length), points: [] };
        }
        const pts = compoundMap[drug.name].points;
        // Avoid duplicate week entries: update existing point if same week already exists
        const existStart = pts.findIndex(p => p.week === weekCursor);
        if (existStart >= 0) {
          pts[existStart] = { week: weekCursor, dose: (pts[existStart].dose + drug.startDose) / 2 };
        } else {
          pts.push({ week: weekCursor, dose: drug.startDose });
        }
        const existEnd = pts.findIndex(p => p.week === weekCursor + dur);
        if (existEnd >= 0) {
          pts[existEnd] = { week: weekCursor + dur, dose: drug.endDose };
        } else {
          pts.push({ week: weekCursor + dur, dose: drug.endDose });
        }
      });

      const block = {
        name: ph.name || ph.phase_name || ph.phase_title || ('Phase ' + (idx + 1)),
        startWeek: weekCursor,
        durationWeeks: dur,
        drugs,
      };
      weekCursor += dur;
      return block;
    });

    const totalWeeks   = weekCursor;
    const compounds    = Object.entries(compoundMap).map(([name, d]) => ({ name, ...d }));
    const maxDose      = Math.max(...compounds.flatMap(c => c.points.map(p => p.dose)), 1);
    const allUnits     = source.flatMap(ph =>
      (ph.drugs || ph.compounds || ph.medications || []).map(d => d.dose_logic?.dose_unit || d.dose_unit || '').filter(Boolean)
    );
    const unitCounts   = allUnits.reduce((acc, u) => { acc[u] = (acc[u] || 0) + 1; return acc; }, {});
    const dominantUnit = Object.keys(unitCounts).sort((a, b) => unitCounts[b] - unitCounts[a])[0] || 'mg';

    // Detect if all drugs in all phases are intensity-based (no meaningful numeric doses)
    const allDrugs = phaseBlocks.flatMap(pb => pb.drugs);
    const isIntensityMode = allDrugs.length > 0 &&
      allDrugs.every(drug => drug.isIntensityBased) &&
      allDrugs.every(drug => drug.startDose <= 5 && drug.endDose <= 5);

    return { compounds, phaseBlocks, totalWeeks, maxDose, dominantUnit, isIntensityMode };
  } catch (err) {
    console.warn('[ProtocolComputationEngine] buildChartData error:', err);
    return null;
  }
}

// ── Aggregate totals ──────────────────────────────────────────────────────────
export function computeTotals(protocol, phaseBlocks, compounds) {
  try {
    const allDrugNames  = [...new Set(phaseBlocks.flatMap(ph => ph.drugs.map(d => d.name)).filter(Boolean))];
    const compoundCount = allDrugNames.length || compounds.length;

    let totalMg = 0;
    phaseBlocks.forEach(ph => {
      ph.drugs.forEach(drug => { totalMg += ((drug.startDose + drug.endDose) / 2) * ph.durationWeeks; });
    });

    const source     = protocol?.phase_blueprints || protocol?.phases || [];
    const firstPhase = source[0] || {};
    const firstDrug  = (firstPhase.drugs || firstPhase.compounds || firstPhase.medications || [])[0];
    const firstDrugR = firstDrug ? resolveDrug(firstDrug, 0) : null;

    const vialSize     = parseFloat(firstDrugR?.vialSize || protocol?.vial_size || 2) || 2;
    const totalVials   = totalMg > 0 ? Math.ceil(totalMg / vialSize) : 0;
    const pricePerVial = parseFloat(protocol?.cost_per_vial || protocol?.price_per_vial || firstDrugR?.costPerVial || 0) || 0;
    const totalCost    = pricePerVial > 0 ? totalVials * pricePerVial : 0;
    const dominantFreq = firstDrugR?.frequency || firstDrug?.dose_logic?.frequency || firstDrug?.dose_logic?.administration_frequency || 'Weekly';

    return { totalMg, totalVials, totalCost, compoundCount, dominantFreq };
  } catch (err) {
    console.warn('[ProtocolComputationEngine] computeTotals error:', err);
    return { totalMg: 0, totalVials: 0, totalCost: 0, compoundCount: 0, dominantFreq: 'Weekly' };
  }
}

// ── Phase lookup ──────────────────────────────────────────────────────────────
export function getPhaseAtWeek(phaseBlocks, week) {
  return phaseBlocks.find(ph => week >= ph.startWeek && week <= ph.startWeek + ph.durationWeeks)
    || phaseBlocks[phaseBlocks.length - 1]
    || null;
}

// ── Dose interpolation ────────────────────────────────────────────────────────
export function interpolateDose(points, week) {
  const sorted = [...points].sort((a, b) => a.week - b.week);
  if (!sorted.length) return 0;
  if (week <= sorted[0].week) return sorted[0].dose;
  if (week >= sorted[sorted.length - 1].week) return sorted[sorted.length - 1].dose;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (week >= sorted[i].week && week <= sorted[i + 1].week) {
      const t = (week - sorted[i].week) / (sorted[i + 1].week - sorted[i].week);
      return +(sorted[i].dose + t * (sorted[i + 1].dose - sorted[i].dose)).toFixed(2);
    }
  }
  return 0;
}

// ── Clinical event markers ────────────────────────────────────────────────────
export function buildClinicalEvents(phaseBlocks) {
  const events = [];
  phaseBlocks.forEach(ph => {
    const peakWeek = ph.startWeek + ph.durationWeeks;
    const n = ph.name.toLowerCase();
    if (n.includes('escal') || n.includes('peak')) {
      events.push({ week: peakWeek, label: 'Peak Dose', icon: '⬆', color: '#10b981' });
    } else if (n.includes('mainten')) {
      events.push({ week: ph.startWeek + Math.floor(ph.durationWeeks / 2), label: 'Assessment', icon: '🩺', color: '#60a5fa' });
    } else if (n.includes('taper')) {
      events.push({ week: peakWeek, label: 'Taper End', icon: '⬇', color: '#f59e0b' });
    }
    if (ph.startWeek > 0 && ph.startWeek % 8 === 0) {
      events.push({ week: ph.startWeek, label: 'Labs', icon: '🔬', color: '#a78bfa' });
    }
  });
  return events;
}

// ── Phase 8: Cost Breakdown ───────────────────────────────────────────────────
/**
 * Returns a structured cost breakdown for the Cost Panel.
 * { byCompound: [{name, mg, vials, cost}], byPhase: [{name, weeks, cost}], byWeek: [{week, cost}] }
 */
export function computeCostBreakdown(protocol, phaseBlocks) {
  try {
    const source      = protocol?.phase_blueprints || protocol?.phases || [];
    const firstPhase  = source[0] || {};
    const firstDrug   = (firstPhase.drugs || firstPhase.compounds || firstPhase.medications || [])[0];
    const vialSize    = parseFloat(firstDrug?.vial_size || protocol?.vial_size || 2) || 2;
    const pricePerVial = parseFloat(protocol?.cost_per_vial || protocol?.price_per_vial || firstDrug?.cost_per_vial || 0) || 0;

    // By compound
    const compoundMap = {};
    phaseBlocks.forEach(ph => {
      ph.drugs.forEach(drug => {
        const name = drug.name || 'Unknown';
        const mg   = ((drug.startDose + drug.endDose) / 2) * ph.durationWeeks;
        if (!compoundMap[name]) compoundMap[name] = 0;
        compoundMap[name] += mg;
      });
    });
    const byCompound = Object.entries(compoundMap).map(([name, mg]) => {
      const vials = pricePerVial > 0 ? Math.ceil(mg / vialSize) : 0;
      const cost  = vials * pricePerVial;
      return { name, mg: +mg.toFixed(1), vials, cost };
    });

    // By phase
    const byPhase = phaseBlocks.map(ph => {
      let phaseMg = 0;
      ph.drugs.forEach(drug => { phaseMg += ((drug.startDose + drug.endDose) / 2) * ph.durationWeeks; });
      const vials = pricePerVial > 0 ? Math.ceil(phaseMg / vialSize) : 0;
      const cost  = vials * pricePerVial;
      return { name: ph.name, weeks: ph.durationWeeks, mg: +phaseMg.toFixed(1), cost };
    });

    // By week (aggregate all compounds, one row per week)
    const totalWeeks = phaseBlocks.reduce((s, ph) => s + ph.durationWeeks, 0);
    const byWeek = [];
    for (let w = 1; w <= totalWeeks; w++) {
      let weekMg = 0;
      phaseBlocks.forEach(ph => {
        if (w > ph.startWeek && w <= ph.startWeek + ph.durationWeeks) {
          ph.drugs.forEach(drug => {
            const t   = ph.durationWeeks > 1 ? (w - ph.startWeek - 1) / (ph.durationWeeks - 1) : 0;
            weekMg += drug.startDose + t * (drug.endDose - drug.startDose);
          });
        }
      });
      const cost = pricePerVial > 0 ? (weekMg / vialSize) * pricePerVial : 0;
      byWeek.push({ week: w, mg: +weekMg.toFixed(1), cost: +cost.toFixed(2) });
    }

    return { byCompound, byPhase, byWeek, pricePerVial, vialSize };
  } catch (err) {
    console.warn('[ProtocolComputationEngine] computeCostBreakdown error:', err);
    return { byCompound: [], byPhase: [], byWeek: [], pricePerVial: 0, vialSize: 2 };
  }
}

// ── Phase 7: CSV export data ──────────────────────────────────────────────────
/** Returns a CSV string of the weekly dose schedule. */
export function buildWeeklyCsv(protocol, phaseBlocks, compounds) {
  try {
    const q = (s) => `"${String(s || '').replace(/"/g, '""')}"`;
    const lines = [];

    // ── Protocol Hero Header ───────────────────────────────────────────────
    const name     = protocol?.name || protocol?.title || 'Protocol';
    const id       = protocol?.protocol_id || protocol?.id || '';
    const category = protocol?.category || '';
    const duration = protocol?.duration_weeks
      ? `${protocol.duration_weeks} weeks`
      : phaseBlocks.reduce((s, ph) => s + ph.durationWeeks, 0) + ' weeks';
    const tags = Array.isArray(protocol?.tags) ? protocol.tags.join(', ') : (protocol?.tags || '');

    lines.push(`Protocol,${q(name)}`);
    if (id)       lines.push(`ID,${q(id)}`);
    if (category) lines.push(`Category,${q(category)}`);
    lines.push(`Duration,${q(duration)}`);
    lines.push(`Phases,${phaseBlocks.length}`);
    lines.push(`Compounds,${compounds.length}`);
    if (tags)     lines.push(`Tags,${q(tags)}`);

    // Clinical objectives
    const rawObj = protocol?.clinical_objectives || protocol?.goals || protocol?.objectives || [];
    const objList = Array.isArray(rawObj)
      ? rawObj
      : typeof rawObj === 'string' ? rawObj.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [];
    if (objList.length) {
      lines.push('');
      lines.push('Clinical Objectives,');
      objList.forEach((o, i) => {
        const txt = typeof o === 'string' ? o : o.objective || o.goal || o.description || '';
        lines.push(`${i + 1},${q(txt)}`);
      });
    }

    // Phase summary block
    lines.push('');
    lines.push('Phase Summary,,,,');
    lines.push('Phase,Start Week,Duration (wk),Compounds');
    phaseBlocks.forEach(ph => {
      lines.push([
        q(ph.name),
        ph.startWeek,
        ph.durationWeeks,
        q(ph.drugs?.map(d => d.name).join(', ') || ''),
      ].join(','));
    });

    // ── Weekly Dose Schedule ───────────────────────────────────────────────
    lines.push('');
    lines.push('Weekly Dose Schedule,,,,');
    const compoundNames = compounds.map(c => c.name);
    const totalWeeks = phaseBlocks.reduce((s, ph) => s + ph.durationWeeks, 0);
    lines.push(['Week', 'Phase', ...compoundNames, 'Total Dose (mg)'].join(','));

    for (let w = 1; w <= totalWeeks; w++) {
      const ph = phaseBlocks.find(p => w > p.startWeek && w <= p.startWeek + p.durationWeeks)
        || phaseBlocks[phaseBlocks.length - 1];
      const doses = compoundNames.map(name => {
        const comp = compounds.find(c => c.name === name);
        if (!comp) return 0;
        const pts = [...comp.points].sort((a, b) => a.week - b.week);
        if (!pts.length) return 0;
        if (w <= pts[0].week) return pts[0].dose;
        if (w >= pts[pts.length - 1].week) return pts[pts.length - 1].dose;
        for (let i = 0; i < pts.length - 1; i++) {
          if (w >= pts[i].week && w <= pts[i + 1].week) {
            const t = (w - pts[i].week) / (pts[i + 1].week - pts[i].week);
            return +(pts[i].dose + t * (pts[i + 1].dose - pts[i].dose)).toFixed(2);
          }
        }
        return 0;
      });
      const total = doses.reduce((s, d) => s + d, 0).toFixed(2);
      lines.push([w, q(ph?.name || ''), ...doses, total].join(','));
    }

    return lines.join('\n');
  } catch (err) {
    console.warn('[ProtocolComputationEngine] buildWeeklyCsv error:', err);
    return 'Week,Phase,Total\n';
  }
}
