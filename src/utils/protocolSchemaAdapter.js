/* eslint-disable no-unused-vars */
import { SCIENTIFIC_STANDARDS } from '../services/protocol_finder_2_0_protocols_bundle/ScientificStandards';

/**
 * protocolSchemaAdapter.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Universal normalizer: converts ANY protocol schema variant into the
 * canonical "v3" format used by charts, PDF, and UI components.
 *
 * CANONICAL OUTPUT SHAPE
 * ──────────────────────
 * {
 *   protocol_id, protocol_name, duration_weeks,
 *   phases: [
 *     {
 *       phase_id, phase_name, start_week, end_week,
 *       compounds: [
 *         {
 *           peptide_id, name, route,
 *           schedule: [
 *             {
 *               weeks: [1,2,3,4],
 *               dose:      { amount: number, unit: string },
 *               frequency: { times: number, period: string, label: string },
 *               notes: string
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 *
 * SUPPORTED INPUT SCHEMAS
 * ───────────────────────
 * A) v3 (canonical) — already has phases[].compounds[].schedule[]
 * B) v2 (phase_blueprints) — Firestore phase_blueprints[].drugs[].dose_logic
 * C) v1 (legacy phases) — phases[].drugs[] with flat dose fields
 * D) flat — top-level dose/frequency fields, no phases
 */


function getHalfLifeForCompound(name, defaultHalfLife) {
  if (!name) return defaultHalfLife || 30;
  const cleanId = name.toLowerCase().replace('prd_', '').replace(/[^a-z0-9]/g, '');
  const standard = SCIENTIFIC_STANDARDS?.registry?.[cleanId];
  if (standard && standard.stability_weeks != null) {
    return standard.stability_weeks * 7;
  }
  return defaultHalfLife || 30;
}

// ── Clinical Monitoring Config ────────────────────────────────────────────────

const LAB_MONITORING = {
  'growth-hormone': {
    labs: ['IGF-1', 'CMP', 'HbA1c', 'Fasting Insulin', 'Thyroid Panel (TSH, fT3, fT4)'],
    rationale: 'Monitor growth axis response, glycemic control, and thyroid synergy.'
  },
  'glp-1': {
    labs: ['HbA1c', 'CMP (Kidney/Liver)', 'Lipid Panel', 'Fasting Insulin', 'Pancreatic Enzymes (Amylase/Lipase)'],
    rationale: 'Track metabolic improvements, safety (organ function), and inflammatory markers.'
  },
  'triple-agonist': {
    labs: ['HbA1c', 'CMP', 'Lipid Panel', 'Fasting Insulin', 'Calcitonin', 'Amylase/Lipase'],
    rationale: 'Retatrutide requires monitoring of pancreatic enzymes and thyroid markers (calcitonin).'
  },
  'tissue-repair': {
    labs: ['CMP', 'CBC', 'CRP (High Sensitivity)', 'ESR'],
    rationale: 'Monitor systemic inflammation, healing biomarkers, and hematopoietic health.'
  },
  'cognitive': {
    labs: ['CMP', 'Thyroid Panel', 'Vitamin B12/Folate', 'Homocysteine'],
    rationale: 'Baseline metabolic and nutritional check for neurological optimization.'
  },
  'androgenic': {
    labs: ['Total/Free Testosterone', 'Estradiol (Sensitive)', 'SHBG', 'PSA', 'CBC (Hematocrit)', 'CMP'],
    rationale: 'Monitor HPG axis suppression, cardiovascular risk (RBC), and prostate health.'
  },
  'mitochondrial': {
    labs: ['CMP', 'CBC', 'Lactate', 'CK (Creatine Kinase)'],
    rationale: 'Monitor mitochondrial efficiency and muscle turnover markers (MOTS-c).'
  },
  'anti-aging': {
    labs: ['NAD+', 'CRP', 'HbA1c', 'Telomere Length (Optional)', 'CMP'],
    rationale: 'Monitor cellular health, inflammation, and biological age markers.'
  }
};

/**
 * Returns lab requirements based on compound categories.
 */
export function getRequiredLabs(compounds = []) {
  const requirements = new Set();
  const rationales = new Set();

  compounds.forEach(c => {
    const slug = (c.peptide_id || c.name || '').toLowerCase();
    let category = null;

    if (slug.includes('ipam') || slug.includes('ghrp') || slug.includes('sermorelin') || slug.includes('cjc') || slug.includes('tesa')) {
      category = 'growth-hormone';
    } else if (slug.includes('retatrutide')) {
      category = 'triple-agonist';
    } else if (slug.includes('tirze') || slug.includes('sema') || slug.includes('glp')) {
      category = 'glp-1';
    } else if (slug.includes('bpc') || slug.includes('tb') || slug.includes('thymosin')) {
      category = 'tissue-repair';
    } else if (slug.includes('selank') || slug.includes('semax') || slug.includes('cerebro')) {
      category = 'cognitive';
    } else if (slug.includes('testo') || slug.includes('enan') || slug.includes('cypio') || slug.includes('hgc')) {
      category = 'androgenic';
    } else if (slug.includes('nad') || slug.includes('epi') || slug.includes('foxo')) {
      category = 'anti-aging';
    } else if (slug.includes('mots')) {
      category = 'mitochondrial';
    }

    if (category && LAB_MONITORING[category]) {
      LAB_MONITORING[category].labs.forEach(l => requirements.add(l));
      rationales.add(LAB_MONITORING[category].rationale);
    }
  });

  return {
    labs: Array.from(requirements),
    rationales: Array.from(rationales)
  };
}

/**
 * Performs a clinical audit of compound dosages.
 * Flags discrepancies against standard clinical literature.
 */
export function auditDoseConsistency(compounds = []) {
  const flags = [];
  
  compounds.forEach(c => {
    const name = String(c.name).toLowerCase();
    c.schedule.forEach(entry => {
      const { amount, unit } = entry.dose;
      
      // Clinical Safety Ranges
      if (name.includes('retatrutide')) {
        if (unit === 'mg' && amount > 12) flags.push(`[CRITICAL] Retatrutide dose (${amount}mg) exceeds maximum studied dose (12mg).`);
        if (unit === 'mg' && amount < 1) flags.push(`[WARNING] Retatrutide dose (${amount}mg) is below standard starting dose (2mg).`);
      }
      if (name.includes('tirzepatide')) {
        if (unit === 'mg' && amount > 15) flags.push(`[CRITICAL] Tirzepatide dose (${amount}mg) exceeds max FDA limit (15mg).`);
        if (unit === 'mcg' && amount < 250) flags.push(`[WARNING] Tirzepatide dose (${amount}mcg) may be sub-therapeutic.`);
      }
      if (name.includes('semaglutide')) {
        if (unit === 'mg' && amount > 2.4) flags.push(`[CRITICAL] Semaglutide dose (${amount}mg) exceeds max FDA limit (2.4mg).`);
      }
      if (name.includes('bpc-157')) {
        if (unit === 'mg' && amount > 1.0) flags.push(`[WARNING] BPC-157 dose (${amount}mg) is high; typical range is 250-500mcg.`);
      }
      if (name.includes('aod-9604')) {
        if (unit === 'mcg' && (amount < 200 || amount > 1000)) flags.push(`[WARNING] AOD-9604 dose (${amount}mcg) is outside common clinical ranges (250-500mcg).`);
      }
      if (name.includes('selank') || name.includes('semax')) {
        if (unit === 'mcg' && amount > 2000) flags.push(`[WARNING] ${c.name} dose (${amount}mcg) is high for a single administration.`);
      }
      if (name.includes('ghk-cu')) {
        if (unit === 'mg' && amount > 10) flags.push(`[WARNING] GHK-Cu dose (${amount}mg) is unusually high for systemic SC use.`);
      }
      if (name.includes('mots-c')) {
        if (unit === 'mg' && amount > 10) flags.push(`[WARNING] MOTS-c dose (${amount}mg) exceeds typical research protocols (5mg).`);
      }
    });
  });
  
  return flags;
}

/**
 * Implementation of Semantic Versioning for protocols.
 * Returns a Major.Minor.Patch string based on protocol changes.
 */
export function calculateProtocolVersion(protocol, prevProtocol = null) {
  if (protocol.version && !prevProtocol) return protocol.version;
  
  if (!prevProtocol) {
    const phaseCount = (protocol.phases || []).length;
    const compoundCount = (protocol.phases || []).flatMap(p => p.compounds || []).length;
    return `${phaseCount}.${compoundCount}.0`;
  }

  let [major, minor, patch] = (prevProtocol.version || '1.0.0').split('.').map(Number);

  // 1. Major change: Compound list change or Phase count change
  const prevCompounds = (prevProtocol.phases || []).flatMap(p => (p.compounds || []).map(c => c.peptide_id));
  const currCompounds = (protocol.phases || []).flatMap(p => (p.compounds || []).map(c => c.peptide_id));
  
  if (prevProtocol.phases?.length !== protocol.phases?.length || 
      JSON.stringify(prevCompounds.sort()) !== JSON.stringify(currCompounds.sort())) {
    return `${major + 1}.0.0`;
  }

  // 2. Minor change: Dose or Frequency or Duration change
  const prevData = JSON.stringify((prevProtocol.phases || []).map(p => ({
    d: p.duration_weeks,
    s: p.compounds?.map(c => c.schedule)
  })));
  const currData = JSON.stringify((protocol.phases || []).map(p => ({
    d: p.duration_weeks,
    s: p.compounds?.map(c => c.schedule)
  })));

  if (prevData !== currData) {
    return `${major}.${minor + 1}.0`;
  }

  // 3. Patch: Anything else (notes, name, rationale)
  return `${major}.${minor}.${patch + 1}`;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Converts a frequency string like "daily", "2x_week", "weekly" into
 * the canonical { times, period, label } object.
 */
export function frequencyToObject(freq = '') {
  const f = String(freq).toLowerCase().replace(/[^a-z0-9]/g, '');

  if (f === 'daily' || f === '7xweek' || f === 'everyday') {
    return { times: 1, period: 'day', label: 'Daily' };
  }
  if (f === '6xweek') return { times: 6, period: 'week', label: '6x/week' };
  if (f === '5xweek') return { times: 5, period: 'week', label: '5x/week' };
  if (f === '4xweek') return { times: 4, period: 'week', label: '4x/week' };

  if (f.includes('alternateday') || f.includes('everyotherday') || f === 'eod') {
    return { times: 1, period: 'every_other_day', label: 'Every other day' };
  }
  if (f === '3x' || f === '3xweek' || f === '3xweekly' || f.includes('thrice')) {
    return { times: 3, period: 'week', label: '3x/week' };
  }
  if (f === '2x' || f === '2xweek' || f === '2xweekly' || f.includes('twice') || f.includes('biweekly')) {
    return { times: 2, period: 'week', label: '2x/week' };
  }
  if (f === 'weekly' || f === 'onceweekly' || f === '1xweek' || f === 'once') {
    return { times: 1, period: 'week', label: 'Weekly' };
  }
  if (f.includes('fortnightly') || f === 'every2weeks') {
    return { times: 1, period: 'fortnight', label: 'Every 2 weeks' };
  }
  if (f.includes('monthly')) {
    return { times: 1, period: 'month', label: 'Monthly' };
  }

  // Fallback: parse "Nx" pattern
  const nxMatch = f.match(/^(\d+)x/);
  if (nxMatch) {
    const n = parseInt(nxMatch[1], 10);
    return { times: n, period: 'week', label: `${n}x/week` };
  }

  // Default: weekly
  return { times: 1, period: 'week', label: 'Weekly' };
}

/**
 * Returns the clinically appropriate term for a delivery route.
 * Strictly enforces:
 * - Subcutaneous -> Vial
 * - Oral -> Comprimido/Pastilla
 * - Nasal -> Spray
 */
export function getRouteSpecificTerm(route = '') {
  const r = String(route).toLowerCase().trim();
  
  if (r.includes('subcutaneous') || r.includes('sc') || r.includes('inject')) {
    return 'Vial';
  }
  if (r.includes('oral') || r.includes('pill') || r.includes('tablet') || r.includes('capsule')) {
    return 'Tablet/Pill';
  }
  if (r.includes('nasal') || r.includes('spray')) {
    return 'Spray';
  }
  
  return 'Product'; // Clinical fallback
}

/**
 * Converts a dose value + unit string into { amount, unit }.
 * Handles "250mcg", "2.5mg", numbers, etc.
 * Strictly preserves units to avoid clinical errors.
 */
export function doseToObject(value, unitHint = 'mg', compoundName = '') {
  if (value == null || value === '') return { amount: 0, unit: unitHint };

  let amount = 0;
  let unit = (unitHint || 'mg').toLowerCase().trim();

  if (typeof value === 'object' && value.amount != null) {
    amount = Number(value.amount);
    unit = (value.unit || unit).toLowerCase().trim();
  } else {
    const str = String(value).toLowerCase().replace(/,/g, '').trim();
    const match = str.match(/(\d+\.?\d*)\s*(mg|mcg|µg|ug|iu|unit|unidades)/i);

    if (match) {
      amount = parseFloat(match[1]);
      unit = match[2].toLowerCase();
    } else {
      amount = parseFloat(str.replace(/[^0-9.]/g, ''));
    }
  }

  // Normalize units
  unit = unit.replace('µg', 'mcg').replace('ug', 'mcg').replace('unidades', 'units');

  // ── CLINICAL SAFETY OVERRIDES ──
  // Check for common dosing errors (e.g., 2500mg instead of 2500mcg)
  const name = String(compoundName).toLowerCase();
  
  if (unit === 'mg' && amount >= 100) {
    if (name.includes('tirzepatide') || name.includes('semaglutide') || name.includes('mots-c') || name.includes('bpc-157') || name.includes('ipamorelin')) {
      console.warn(`[SAFETY] Drug ${compoundName}: Dose ${amount} is too high for mg. Auto-correcting to mcg.`);
      unit = 'mcg';
    }
  }

  return { amount: isNaN(amount) ? 0 : amount, unit };
}

/**
 * Calculates the number of vials required and the exact units to inject.
 * 
 * @param {object} compound - Canonical compound object
 * @param {number} durationWeeks - Phase duration
 * @returns {object} { vialCount, unitsToInject, stabilityWarning, etc }
 */
export function calculateRequiredVials(compound, durationWeeks) {
  const { 
    schedule = [], 
    vial_max_capacity_mg = 10, 
    post_reconstitution_half_life = 30,
    reconstitution_volume_ml = 2, // Standard dilution
    route = 'subcutaneous'
  } = compound;
  
  // 1. Calculate total mg needed
  let totalMg = 0;
  const scheduleWithUnits = schedule.map(entry => {
    const injectionsPerWeek = frequencyToInjectionsPerWeek(entry.frequency);
    const doseMg = entry.dose.unit === 'mcg' ? entry.dose.amount / 1000 : entry.dose.amount;
    const weeksCount = entry.weeks.length;
    totalMg += doseMg * injectionsPerWeek * weeksCount;

    // 2. Units to inject calculation
    // Concentration = vial_max_capacity_mg / reconstitution_volume_ml (mg/ml)
    // 1ml = 100 units on U-100 syringe
    // units_per_dose = (dose_mg / concentration) * 100
    const concentrationMgMl = vial_max_capacity_mg / reconstitution_volume_ml;
    const unitsPerDose = (doseMg / concentrationMgMl) * 100;

    return {
      ...entry,
      units_to_inject: Math.round(unitsPerDose * 10) / 10,
      mg_per_dose: doseMg
    };
  });

  // 3. Determine vial count based on capacity & 30-day stability
  const mgPerDay = totalMg / (durationWeeks * 7);
  const mgPerStabilityPeriod = mgPerDay * post_reconstitution_half_life;
  
  // Clinical selection: Largest possible that doesn't waste past stability
  const usableMgPerVial = Math.min(vial_max_capacity_mg, mgPerStabilityPeriod);
  const vialCount = Math.ceil(totalMg / usableMgPerVial);
  
  const totalUnits = reconstitution_volume_ml * 100;
  const unitsPerMg = totalUnits / vial_max_capacity_mg;

  return {
    vialCount: isNaN(vialCount) ? 0 : vialCount,
    totalMgNeeded: totalMg,
    unitsPerMg: isNaN(unitsPerMg) ? 0 : unitsPerMg,
    reconstitutionVolume: reconstitution_volume_ml,
    vialCapacity: vial_max_capacity_mg,
    stabilityWarning: (totalMg / mgPerDay) > post_reconstitution_half_life
  };
}


/**
 * Returns injections per week from a canonical frequency object.
 */
export function frequencyToInjectionsPerWeek(freqObj) {
  if (!freqObj) return 1;
  const { times = 1, period = 'week' } = freqObj;
  if (period === 'day') return times * 7;
  if (period === 'every_other_day') return 3.5;
  if (period === 'fortnight') return times / 2;
  if (period === 'month') return times / 4;
  return times; // per week
}

/**
 * Generates a week-number array [startWeek..endWeek].
 */
function weekRange(start, end) {
  const arr = [];
  for (let w = start; w <= end; w++) arr.push(w);
  return arr;
}

// ── Schema detection ──────────────────────────────────────────────────────────

function isV3(protocol) {
  return (
    Array.isArray(protocol?.phases) &&
    protocol.phases.length > 0 &&
    Array.isArray(protocol.phases[0]?.compounds) &&
    protocol.phases[0].compounds.length > 0 &&
    Array.isArray(protocol.phases[0].compounds[0]?.schedule)
  );
}

function hasPhaseBlueprints(protocol) {
  return Array.isArray(protocol?.phase_blueprints) && protocol.phase_blueprints.length > 0;
}

function hasLegacyPhases(protocol) {
  return (
    Array.isArray(protocol?.phases) &&
    protocol.phases.length > 0 &&
    !Array.isArray(protocol.phases[0]?.compounds)
  );
}

// ── Normalizers per schema type ───────────────────────────────────────────────

/**
 * v3 → canonical (already correct, just ensure required fields exist)
 */
function normalizeV3(protocol) {
  let weekCursor = 1;
  const phases = protocol.phases.map((ph, idx) => {
    const startWeek = ph.start_week ?? weekCursor;
    const endWeek   = ph.end_week ?? (startWeek + (ph.duration_weeks ?? 4) - 1);
    weekCursor = endWeek + 1;

    return {
      phase_id:   ph.phase_id   || `phase_${idx + 1}`,
      phase_name: ph.phase_name || ph.name || `Phase ${idx + 1}`,
      start_week: startWeek,
      end_week:   endWeek,
      compounds:  (ph.compounds || []).map((c, ci) => ({
        peptide_id: c.peptide_id || c.id || `compound_${ci + 1}`,
        name:       c.name || c.product_title || `Compound ${ci + 1}`,
        route:      c.route || 'subcutaneous',
        route_term: getRouteSpecificTerm(c.route || 'subcutaneous'),
        vial_max_capacity_mg: c.vial_max_capacity_mg || 10,
        post_reconstitution_half_life: getHalfLifeForCompound(c.name || c.product_title, c.post_reconstitution_half_life || 30),
        rationale: c.rationale || '',
        schedule:   (c.schedule || []).map(s => ({
          weeks:     Array.isArray(s.weeks) ? s.weeks : weekRange(startWeek, endWeek),
          dose:      doseToObject(s.dose, 'mg', c.name || c.product_title),
          frequency: typeof s.frequency === 'object' ? s.frequency : frequencyToObject(s.frequency),
          notes:     s.notes || '',
        })),
      })),
    };
  });

  return buildOutput(protocol, phases);
}

/**
 * v2 (phase_blueprints) → canonical
 */
function normalizePhaseBlueprints(protocol) {
  let weekCursor = 1;
  const phases = protocol.phase_blueprints.map((ph, idx) => {
    const dur       = ph.default_duration_weeks || ph.duration_weeks || 4;
    const startWeek = weekCursor;
    const endWeek   = startWeek + dur - 1;
    weekCursor = endWeek + 1;

    const rawDrugs = ph.drugs || ph.compounds || ph.medications || [];
    const compounds = rawDrugs.map((d, di) => {
      const logic   = d.dose_logic || {};
      const freqStr = logic.administration_frequency || logic.frequency || d.frequency || d.dosing_frequency || 'weekly';
      const freqObj = frequencyToObject(freqStr);
      const unitStr = logic.dose_unit || d.dose_unit || d.unit || 'mg';
      const injectionsPerWeek = frequencyToInjectionsPerWeek(freqObj);

      // Resolve start dose (must be dose per administration!)
      let startVal = 0;
      if (logic.dose_per_administration != null) {
        startVal = logic.dose_per_administration;
      } else if (logic.starting_weekly_dose != null) {
        startVal = Number(logic.starting_weekly_dose) / injectionsPerWeek;
      } else if (logic.starting_dose != null) {
        startVal = logic.starting_dose;
      } else if (d.dose_per_administration != null) {
        startVal = d.dose_per_administration;
      } else if (d.weekly_dose != null) {
        const parsed = doseToObject(d.weekly_dose, unitStr);
        startVal = parsed.amount / injectionsPerWeek;
      } else {
        startVal = d.selected_strength || 0;
      }

      // Resolve end/peak dose (must be dose per administration!)
      let endVal = 0;
      if (logic.peak_dose != null) {
        endVal = logic.peak_dose;
      } else if (logic.max_weekly_dose != null) {
        endVal = Number(logic.max_weekly_dose) / injectionsPerWeek;
      } else if (logic.maintenance_dose != null) {
        endVal = logic.maintenance_dose;
      } else {
        endVal = startVal;
      }

      const startDose = doseToObject(startVal, unitStr);
      const endDose   = doseToObject(endVal,   unitStr);

      // Build schedule entries — one per week for ramp, or two-point if same
      const scheduleEntries = [];
      if (startDose.amount === endDose.amount || dur <= 1) {
        scheduleEntries.push({
          weeks:     weekRange(startWeek, endWeek),
          dose:      startDose,
          frequency: freqObj,
          notes:     '',
        });
      } else {
        // Ramp: two entries (start → end)
        scheduleEntries.push({
          weeks:     [startWeek],
          dose:      startDose,
          frequency: freqObj,
          notes:     'Starting dose',
        });
        scheduleEntries.push({
          weeks:     [endWeek],
          dose:      endDose,
          frequency: freqObj,
          notes:     'Peak dose',
        });
      }

      return {
        peptide_id: d.product_slug || d.peptide_id || d.id || `compound_${di + 1}`,
        name:       d.product_title || d.name || d.compound || `Compound ${di + 1}`,
        route:      logic.route_of_administration || d.route || 'subcutaneous',
        route_term: getRouteSpecificTerm(logic.route_of_administration || d.route || 'subcutaneous'),
        schedule:   scheduleEntries,
        vial_max_capacity_mg: d.vial_max_capacity_mg || 10,
        post_reconstitution_half_life: getHalfLifeForCompound(d.product_title || d.name || d.compound, d.post_reconstitution_half_life || 30),
        rationale: d.rationale || '',
      };
    });

    return {
      phase_id:   ph.phase_id   || `phase_${idx + 1}`,
      phase_name: ph.phase_title || ph.phase_name || ph.name || `Phase ${idx + 1}`,
      start_week: startWeek,
      end_week:   endWeek,
      compounds,
    };
  });

  return buildOutput(protocol, phases);
}

/**
 * v1 (legacy phases with flat dose fields) → canonical
 */
function normalizeLegacyPhases(protocol) {
  let weekCursor = 1;
  const phases = protocol.phases.map((ph, idx) => {
    const dur       = ph.duration_weeks || ph.default_duration_weeks || 4;
    const startWeek = ph.start_week ?? weekCursor;
    const endWeek   = ph.end_week   ?? (startWeek + dur - 1);
    weekCursor = endWeek + 1;

    const rawDrugs = ph.drugs || ph.compounds || ph.medications || [];
    const compounds = rawDrugs.map((d, di) => {
      const freqStr = d.frequency || d.dosing_frequency || d.administration_frequency || 'weekly';
      const freqObj = frequencyToObject(freqStr);
      const unitStr = d.dose_unit || d.unit || 'mg';
      const injectionsPerWeek = frequencyToInjectionsPerWeek(freqObj);

      let amount = 0;
      if (d.dose_per_administration != null) {
        amount = d.dose_per_administration;
      } else if (d.weekly_dose != null) {
        const parsed = doseToObject(d.weekly_dose, unitStr);
        amount = parsed.amount / injectionsPerWeek;
      } else if (d.dose != null) {
        amount = d.dose;
      } else if (d.selected_strength != null) {
        amount = d.selected_strength;
      } else {
        amount = 0;
      }

      const doseObject = doseToObject(amount, unitStr);

      return {
        peptide_id: d.peptide_id || d.id || `compound_${di + 1}`,
        name:       d.name || d.product_name || d.compound || `Compound ${di + 1}`,
        route:      d.route || 'subcutaneous',
        route_term: getRouteSpecificTerm(d.route || 'subcutaneous'),
        vial_max_capacity_mg: d.vial_max_capacity_mg || 10,
        post_reconstitution_half_life: getHalfLifeForCompound(d.name || d.product_name || d.compound, d.post_reconstitution_half_life || 30),
        rationale: d.rationale || '',
        schedule: [{
          weeks:     weekRange(startWeek, endWeek),
          dose:      doseObject,
          frequency: freqObj,
          notes:     d.notes || '',
        }],
      };
    });

    return {
      phase_id:   ph.phase_id   || `phase_${idx + 1}`,
      phase_name: ph.name || ph.phase_name || ph.phase_title || `Phase ${idx + 1}`,
      start_week: startWeek,
      end_week:   endWeek,
      compounds,
    };
  });

  return buildOutput(protocol, phases);
}

/**
 * flat (no phases) → canonical (single phase wrapping top-level fields)
 */
function normalizeFlatProtocol(protocol) {
  const freqStr = protocol.frequency || protocol.dosing_frequency || 'weekly';
  const freqObj = frequencyToObject(freqStr);
  const unitStr = protocol.dose_unit || 'mg';
  const amount  = protocol.weekly_dose || protocol.dose || 0;
  const dur     = protocol.duration_weeks || 4;

  const phases = [{
    phase_id:   'phase_1',
    phase_name: 'Protocol',
    start_week: 1,
    end_week:   dur,
    compounds: [{
      peptide_id: protocol.protocol_id || 'compound_1',
      name:       protocol.protocol_name || protocol.name || 'Compound',
      route:      protocol.route || 'subcutaneous',
      route_term: getRouteSpecificTerm(protocol.route || 'subcutaneous'),
      vial_max_capacity_mg: protocol.vial_max_capacity_mg || 10,
      post_reconstitution_half_life: getHalfLifeForCompound(protocol.protocol_name || protocol.name || 'Compound', protocol.post_reconstitution_half_life || 30),
      rationale: protocol.rationale || '',
      schedule: [{
        weeks:     weekRange(1, dur),
        dose:      doseToObject(amount, unitStr),
        frequency: freqObj,
        notes:     '',
      }],
    }],
  }];

  return buildOutput(protocol, phases);
}

// ── Output builder ────────────────────────────────────────────────────────────

function buildOutput(protocol, phases) {
  const totalWeeks = phases.length > 0
    ? Math.max(...phases.map(p => p.end_week))
    : protocol.duration_weeks || 0;

  const compounds = phases.flatMap(p => p.compounds);
  const duration = protocol.duration_weeks || totalWeeks;

  // Enrich compounds with procurement math
  phases.forEach(p => {
    p.compounds.forEach(c => {
      c.procurement = calculateRequiredVials(c, p.end_week - p.start_week + 1);
    });
  });

  return {
    ...protocol,
    protocol_id:    protocol.protocol_id || protocol.id || '',
    protocol_name:  protocol.protocol_title || protocol.protocol_name || protocol.name || '',
    duration_weeks: duration,
    version:        calculateProtocolVersion(protocol),
    monitoring:     getRequiredLabs(compounds),
    audit_flags:    auditDoseConsistency(compounds),
    phases,
    generation_date: new Date().toISOString()
  };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * normalizeProtocol(protocol)
 * ─────────────────────────────────────────────────────────────────────────────
 * Accepts any protocol document from Firestore and returns the canonical
 * v3 schema. Safe to call on already-normalized data (idempotent).
 *
 * @param   {object} protocol  Raw Firestore protocol document
 * @returns {object}           Canonical { protocol_id, protocol_name, duration_weeks, phases[] }
 */
export function normalizeProtocol(protocol) {
  if (!protocol || typeof protocol !== 'object') {
    return { protocol_id: '', protocol_name: '', duration_weeks: 0, phases: [] };
  }

  try {
    if (isV3(protocol))              return normalizeV3(protocol);
    if (hasPhaseBlueprints(protocol)) return normalizePhaseBlueprints(protocol);
    if (hasLegacyPhases(protocol))   return normalizeLegacyPhases(protocol);
    return normalizeFlatProtocol(protocol);
  } catch (err) {
    console.error('[protocolSchemaAdapter] normalizeProtocol error:', err);
    return { protocol_id: '', protocol_name: '', duration_weeks: 0, phases: [] };
  }
}
