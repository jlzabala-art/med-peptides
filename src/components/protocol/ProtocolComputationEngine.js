/* eslint-disable no-unused-vars */
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
  const n = String(phaseName || '').toLowerCase();
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

import { parseDosageToMg, parseFrequencyToInjectionsPerWeek } from '../../utils/dosageUtils';
import { normalizeProtocol, frequencyToInjectionsPerWeek } from '../../utils/protocolSchemaAdapter';

// ── Drug field resolver (protocol-schema-agnostic) ────────────────────────────
// Parse numeric mg from strings like "2.5mg", "10 mg", or plain numbers
function parseMg(val) {
  return parseDosageToMg(val);
}

export function resolveDrug(d, phaseIdx) {
  // ── NEW FLAT SCHEMA (post-migration) ──────────────────────────────────────
  // After migration, dose fields live directly on the drug object.
  // We still support legacy dose_logic for any document not yet migrated.
  const legacy = d.dose_logic || null;
  const name   = d.product_title || d.name || d.compound || d.product_slug || ('Compound ' + (phaseIdx + 1));

  // ── Frequency ─────────────────────────────────────────────────────────────
  const frequency = d.frequency
    || legacy?.frequency
    || legacy?.administration_frequency
    || d.dosing_frequency
    || 'weekly';
  const injectionsPerWeek = d.injections_per_week
    ?? parseFrequencyToInjectionsPerWeek(frequency);

  // ── Administration days ───────────────────────────────────────────────────
  const rawDays = d.administration_days
    || legacy?.administration_days_default
    || legacy?.administration_days
    || [];
  const administrationDays = Array.isArray(rawDays) ? rawDays : [];

  // ── Dose resolution ───────────────────────────────────────────────────────
  // New flat schema: weekly_dose is pre-computed; dose_per_injection is per-shot.
  // Legacy fallback: use dose_logic fields via parseMg chain.
  let rawStartWeekly;
  let rawEndWeekly;

  if (d.weekly_dose_amount != null) {
    // ✅ New separated model — use numeric weekly dose amount directly
    const unit = d.weekly_dose_unit || 'mg';
    const isMcg = unit === 'mcg' || unit === 'µg' || unit === 'ug';
    rawStartWeekly = isMcg ? d.weekly_dose_amount / 1000 : d.weekly_dose_amount;
    
    // Resolve peak weekly dose
    let peakMg = null;
    if (d.peak_dose_per_injection_amount != null) {
      const peakUnit = d.peak_dose_per_injection_unit || unit;
      const isPeakMcg = peakUnit === 'mcg' || peakUnit === 'µg' || peakUnit === 'ug';
      peakMg = isPeakMcg ? d.peak_dose_per_injection_amount / 1000 : d.peak_dose_per_injection_amount;
    } else if (d.peak_dose_per_injection != null) {
      peakMg = parseMg(d.peak_dose_per_injection);
    }
    
    rawEndWeekly = peakMg != null
      ? peakMg * injectionsPerWeek
      : rawStartWeekly;
  } else if (d.weekly_dose != null) {
    // ✅ New flat schema string fallback — parse numeric value safely
    rawStartWeekly = parseMg(d.weekly_dose);
    rawEndWeekly   = d.peak_dose_per_injection != null
      ? parseMg(d.peak_dose_per_injection) * injectionsPerWeek
      : rawStartWeekly;
  } else if (legacy) {
    // 🔄 Legacy dose_logic fallback
    const perAdminDose = parseMg(legacy.dose_per_administration);
    const hasExplicitWeekly =
      parseMg(legacy.starting_weekly_dose) != null ||
      parseMg(legacy.default_weekly_dose)  != null ||
      parseMg(legacy.weekly_dose)          != null;

    rawStartWeekly =
      parseMg(legacy.starting_dose) ??
      parseMg(legacy.starting_weekly_dose) ??
      parseMg(legacy.default_weekly_dose) ??
      (perAdminDose != null && !hasExplicitWeekly
        ? perAdminDose * injectionsPerWeek
        : null) ??
      parseMg(legacy.weekly_dose) ??
      (parseMg(legacy.starting_daily_dose) != null
        ? parseMg(legacy.starting_daily_dose) * injectionsPerWeek
        : null) ??
      (parseMg(d.selected_strength) != null
        ? parseMg(d.selected_strength) * injectionsPerWeek
        : null) ??
      0;

    rawEndWeekly =
      parseMg(legacy.peak_dose) ??
      parseMg(legacy.max_dose) ??
      parseMg(legacy.max_weekly_dose) ??
      (parseMg(legacy.possible_daily_dose) != null
        ? parseMg(legacy.possible_daily_dose) * injectionsPerWeek
        : null) ??
      parseMg(legacy.maintenance_dose) ??
      parseMg(legacy.possible_next_step_dose) ??
      parseMg(legacy.default_weekly_dose) ??
      rawStartWeekly;
  } else {
    rawStartWeekly = 0;
    rawEndWeekly   = 0;
  }

  // ── Intensity-based schema ────────────────────────────────────────────────
  // New schema: intensity_level field. Legacy: starting_intensity / intensity.
  const intensityStr = d.intensity_level
    || legacy?.starting_intensity
    || legacy?.intensity
    || legacy?.intensity_level
    || '';
  const isIntensityBased = !!(intensityStr)
    || (legacy?.dose_unit === 'protocol_defined' && !d.weekly_dose);

  let startDose, endDose;
  if (isIntensityBased && (rawStartWeekly === 0 || rawStartWeekly == null)) {
    const startInt = intensityStr ? intensityToNumeric(intensityStr) : 2;
    const endInt   = legacy?.target_intensity ? intensityToNumeric(legacy.target_intensity) : startInt;
    startDose = startInt;
    endDose   = endInt;
  } else {
    startDose = rawStartWeekly || 0;
    endDose   = rawEndWeekly   || startDose;
  }

  const route       = d.route || legacy?.route || '';
  const doseUnit    = d.dose_unit || legacy?.dose_unit || 'mg';
  const vialSize    = parseMg(d.vial_size || legacy?.vial_size || legacy?.vial_volume) || 0;
  const costPerVial = parseMg(d.cost_per_vial || legacy?.cost_per_vial) || 0;

  return {
    name, startDose, endDose,
    frequency, injectionsPerWeek, administrationDays,
    route, doseUnit, vialSize, costPerVial, isIntensityBased,
  };
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
          compoundMap[drug.name] = { 
            color: getCompoundColor(Object.keys(compoundMap).length), 
            points: [],
            frequencies: [] 
          };
        }
        const pts = compoundMap[drug.name].points;
        const freqs = compoundMap[drug.name].frequencies;

        // Track frequency for this phase
        freqs.push({ week: weekCursor, duration: dur, injectionsPerWeek: drug.injectionsPerWeek });

        // Avoid duplicate week entries
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
      (ph.drugs || ph.compounds || ph.medications || [])
        .map(d => d.dose_unit || d.dose_logic?.dose_unit || '').filter(Boolean)
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

import { SCIENTIFIC_STANDARDS, standardizeData } from '../../services/protocol_finder_2_0_protocols_bundle/ScientificStandards';

// ── Aggregate totals (STABILITY-AWARE) ────────────────────────────────────────
export function computeTotals(protocol, phaseBlocks, compounds) {
  try {
    const compoundResults = {};
    const totalWeeks = phaseBlocks.reduce((s, ph) => s + ph.durationWeeks, 0);

    phaseBlocks.forEach(ph => {
      if (!ph.drugs) return;
      ph.drugs.forEach(drug => {
        const name = drug.name || 'Unknown';
        const cleanId = name.toLowerCase().replace('prd_', '').replace(/[^a-z0-9]/g, '');
        const standard = SCIENTIFIC_STANDARDS.registry[cleanId] || {};
        
        if (!compoundResults[name]) {
          compoundResults[name] = {
            totalMg: 0,
            vials: 0,
            cost: 0,
            rationale: [],
            vialSize: drug.vialSize || standard.available_vial_sizes?.[0] || 5,
            availableSizes: standard.available_vial_sizes || [drug.vialSize || 5],
            stabilityWeeks: standard.stability_weeks || 4,
            costPerVial: drug.costPerVial || protocol?.cost_per_vial || 0,
            weeklyDoses: new Array(totalWeeks).fill(0)
          };
        }

        const isMcg = drug.doseUnit && (
          drug.doseUnit.toLowerCase() === 'mcg' ||
          drug.doseUnit.toLowerCase() === 'μg' ||
          drug.doseUnit.toLowerCase() === 'ug'
        );

        // Map weekly doses for this phase
        for (let w = 0; w < ph.durationWeeks; w++) {
          const absoluteWeek = ph.startWeek + w;
          if (absoluteWeek < totalWeeks) {
            const t = ph.durationWeeks > 1 ? w / (ph.durationWeeks - 1) : 0;
            const rawDose = drug.startDose + t * (drug.endDose - drug.startDose);
            const dose = isMcg ? rawDose / 1000 : rawDose;
            compoundResults[name].weeklyDoses[absoluteWeek] = dose;
            compoundResults[name].totalMg += dose;
          }
        }
      });
    });

    let totalVials = 0;
    let totalCost = 0;
    let totalMg = 0;

    Object.keys(compoundResults).forEach(name => {
      const res = compoundResults[name];
      const stability = res.stabilityWeeks;
      const weeklyDoses = res.weeklyDoses;
      const sizes = [...res.availableSizes].sort((a, b) => b - a); // Prefer larger sizes

      let vialsForCompound = 0;
      let costForCompound = 0;

      // Calculate vials per stability window
      for (let i = 0; i < totalWeeks; i += stability) {
        const windowWeeks = Math.min(stability, totalWeeks - i);
        let mgInWindow = 0;
        for (let j = 0; j < windowWeeks; j++) {
          mgInWindow += weeklyDoses[i + j];
        }

        if (mgInWindow > 0) {
          // Find optimal vial configuration for this window
          // Simple greedy approach: use largest vial that fits, or one larger if needed
          let remaining = mgInWindow;
          let windowVials = 0;
          
          // Optimization: If we need 15mg and sizes are [10, 20], prefer one 20mg over two 10mg.
          // For now, we'll pick the single best size that covers the window or multiple of that size.
          const bestSize = sizes.find(s => s >= mgInWindow) || sizes[0];
          const count = Math.ceil(mgInWindow / bestSize);
          
          windowVials = count;
          vialsForCompound += windowVials;
          
          // If we have price mapping for different sizes, we'd use it here.
          // Since we currently have costPerVial at drug level, we assume it's for the 'default' size.
          // Adjusting logic: if size matches drug.vialSize, use costPerVial.
          costForCompound += windowVials * (res.costPerVial || 0);
          
          if (i === 0 && stability < totalWeeks) {
            res.rationale.push(`Calculated in ${stability}-week stability windows.`);
          }
        }
      }

      res.vials = vialsForCompound;
      res.cost = costForCompound;
      
      totalMg += res.totalMg;
      totalVials += vialsForCompound;
      totalCost += costForCompound;
    });

    const compoundCount = Object.keys(compoundResults).length;
    const firstDrug = phaseBlocks[0]?.drugs?.[0];
    const dominantFreq = firstDrug?.frequency || 'Weekly';

    return { totalMg, totalVials, totalCost, compoundCount, dominantFreq, compoundResults };
  } catch (err) {
    console.warn('[ProtocolComputationEngine] computeTotals error:', err);
    return { totalMg: 0, totalVials: 0, totalCost: 0, compoundCount: 0, dominantFreq: 'Weekly', compoundResults: {} };
  }
}

// ── Phase lookup ──────────────────────────────────────────────────────────────
export function getPhaseAtWeek(phaseBlocks, week) {
  return phaseBlocks.find(ph => week >= ph.startWeek && week <= ph.startWeek + ph.durationWeeks)
    || phaseBlocks[phaseBlocks.length - 1]
    || null;
}

// ── Dose interpolation ────────────────────────────────────────────────────────
/**
 * Interpolates dose at a given week.
 * By default, uses 'step' mode to reflect fixed weekly dosages.
 */
export function interpolateDose(points, week, mode = 'step') {
  const sorted = [...points].sort((a, b) => a.week - b.week);
  if (!sorted.length) return 0;
  if (week <= sorted[0].week) return sorted[0].dose;
  if (week >= sorted[sorted.length - 1].week) return sorted[sorted.length - 1].dose;
  
  for (let i = 0; i < sorted.length - 1; i++) {
    const p1 = sorted[i];
    const p2 = sorted[i+1];
    if (week >= p1.week && week < p2.week) {
      if (mode === 'step') {
        // Clinical Step: The dose is fixed for the duration of each week.
        // If we are at week 4.5, we use the dose for week 4.
        const weekIndex = Math.floor(week - p1.week);
        const duration = p2.week - p1.week;
        if (duration <= 0) return p1.dose;
        const totalDelta = p2.dose - p1.dose;
        // Step interpolation: dose increments at the start of each week
        return +(p1.dose + (weekIndex * (totalDelta / duration))).toFixed(2);
      }
      // Linear fallback
      const t = (week - p1.week) / (p2.week - p1.week);
      return +(p1.dose + t * (p2.dose - p1.dose)).toFixed(2);
    }
  }
  return sorted[sorted.length - 1].dose;
}

// ── Clinical event markers ────────────────────────────────────────────────────
export function buildClinicalEvents(phaseBlocks) {
  const events = [];
  phaseBlocks.forEach(ph => {
    const peakWeek = ph.startWeek + ph.durationWeeks;
    const n = ph.name.toLowerCase();
    if (n.includes('escal') || n.includes('peak')) {
      events.push({ week: peakWeek, label: 'Peak Dose', icon: '⬆', color: 'var(--color-success)' });
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
        return interpolateDose(comp.points, w - 1, 'step'); // Use w-1 because csv is 1-indexed week
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

// ── V2: Schema-adapter-based chart builder ────────────────────────────────────
/**
 * buildChartDataV2(protocol)
 * ──────────────────────────────────────────────────────────────────────────────
 * Accepts ANY raw Firestore protocol document (v1/v2/v3/flat) and returns
 * the same { compounds, phaseBlocks, totalWeeks, maxDose, dominantUnit,
 * isIntensityMode } shape as buildChartData(), but reading from the canonical
 * normalized schema via normalizeProtocol().
 *
 * Use this in new chart components. Legacy buildChartData() is kept as-is.
 *
 * @param {object} protocol  Raw Firestore protocol document
 */
export function buildChartDataV2(protocol) {
  try {
    const normalized = normalizeProtocol(protocol);
    if (!normalized.phases.length) return null;

    const compoundMap = {};

    const phaseBlocks = normalized.phases.map((ph) => {
      const compounds = ph.compounds.map((c, ci) => {
        // Flatten schedule → single startDose / endDose for the phase
        const firstEntry  = c.schedule[0]  || {};
        const lastEntry   = c.schedule[c.schedule.length - 1] || firstEntry;

        const freqObj     = firstEntry.frequency || { times: 1, period: 'week' };
        const injPerWeek  = frequencyToInjectionsPerWeek(freqObj);
        const startDose   = (firstEntry.dose?.amount ?? 0) * injPerWeek;
        const endDose     = (lastEntry.dose?.amount  ?? startDose) * injPerWeek;
        const doseUnit    = firstEntry.dose?.unit || 'mg';

        // Register compound for the chart line
        if (!compoundMap[c.name]) {
          compoundMap[c.name] = {
            color:  getCompoundColor(Object.keys(compoundMap).length),
            points: [],
            unit:   doseUnit,
            frequencies: []
          };
        }
        const pts = compoundMap[c.name].points;
        const freqs = compoundMap[c.name].frequencies;

        freqs.push({ week: ph.start_week, duration: ph.end_week - ph.start_week + 1, injectionsPerWeek: injPerWeek });

        const addOrUpdate = (week, dose) => {
          const ex = pts.findIndex(p => p.week === week);
          if (ex >= 0) pts[ex] = { week, dose: (pts[ex].dose + dose) / 2 };
          else pts.push({ week, dose });
        };
        addOrUpdate(ph.start_week, startDose);
        addOrUpdate(ph.end_week,   endDose);

        return {
          name:           c.name,
          startDose,
          endDose,
          frequency:      freqObj.label || `${freqObj.times}x/${freqObj.period}`,
          injectionsPerWeek: injPerWeek,
          doseUnit,
          isIntensityBased: false,
          route:          c.route || 'subcutaneous',
        };
      });

      return {
        name:          ph.phase_name,
        startWeek:     ph.start_week,
        durationWeeks: ph.end_week - ph.start_week + 1,
        drugs:         compounds,
      };
    });

    const totalWeeks = normalized.phases.reduce(
      (max, ph) => Math.max(max, ph.end_week),
      0
    );
    const compounds  = Object.entries(compoundMap).map(([name, d]) => ({ name, ...d }));
    const maxDose    = Math.max(...compounds.flatMap(c => c.points.map(p => p.dose)), 1);

    // Dominant unit
    const unitCounts = {};
    compounds.forEach(c => { unitCounts[c.unit] = (unitCounts[c.unit] || 0) + 1; });
    const dominantUnit = Object.keys(unitCounts).sort((a, b) => unitCounts[b] - unitCounts[a])[0] || 'mg';

    const allDrugs       = phaseBlocks.flatMap(pb => pb.drugs);
    const isIntensityMode = allDrugs.length > 0 &&
      allDrugs.every(d => d.isIntensityBased) &&
      allDrugs.every(d => d.startDose <= 5 && d.endDose <= 5);

    return { compounds, phaseBlocks, totalWeeks, maxDose, dominantUnit, isIntensityMode };
  } catch (err) {
    console.warn('[ProtocolComputationEngine] buildChartDataV2 error:', err);
    return null;
  }
}
