/**
 * clinicalDosingEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Single Source of Truth (SSOT) for Clinical Peptide Dosages, Phased Titrations,
 * Reconstitution Parameters, and Administration Schedules across Atlas Health.
 *
 * Guarantees 100% mathematical and clinical consistency between:
 * 1. Product Datasheet Summary Reconstitution Console (/p/[slug])
 * 2. Public Protocol Blueprint Detail Pages (/proto/[slug])
 * 3. Clinical Interactive Gantt Diagrams
 * 4. Doctor Prescription & Order Generators
 */

// ── 1. Canonical Clinical Titration Benchmarks (FDA Trials & Clinical Consensus) ───
export const CLINICAL_BENCHMARKS = Object.freeze({
  tirzepatide: {
    canonicalName: 'Tirzepatide',
    steps: [2.5, 5.0, 7.5, 10.0, 12.5, 15.0],
    unit: 'mg',
    defaultVialMg: 10,
    cadence: 'Once weekly',
    shortCadence: '1x/wk',
    timesPerWeek: 1,
    route: 'Subcutaneous',
    timing: 'Evening • Same day each week',
    storage: 'Refrigerate at 2°C – 8°C (Do Not Freeze). Aqueous stability: 28 days post-reconstitution.',
    diluentMl: 2.0,
    indications: 'Dual GIP/GLP-1 Receptor Agonism • Weight Management & Metabolic Reset'
  },
  semaglutide: {
    canonicalName: 'Semaglutide',
    steps: [0.25, 0.50, 1.0, 1.7, 2.4],
    unit: 'mg',
    defaultVialMg: 5,
    cadence: 'Once weekly',
    shortCadence: '1x/wk',
    timesPerWeek: 1,
    route: 'Subcutaneous',
    timing: 'Morning or Evening • Same day weekly',
    storage: 'Refrigerate at 2°C – 8°C. Do not freeze. Protect from light. In-use stability: 56 days.',
    diluentMl: 2.0,
    indications: 'Selective GLP-1 Receptor Agonism • Glycemic Optimization'
  },
  cagrilintide: {
    canonicalName: 'Cagrilintide',
    steps: [0.3, 0.6, 1.2, 2.4],
    unit: 'mg',
    defaultVialMg: 5,
    cadence: 'Once weekly',
    shortCadence: '1x/wk',
    timesPerWeek: 1,
    route: 'Subcutaneous',
    timing: 'Same day as GLP-1 agonist',
    storage: 'Refrigerate at 2°C – 8°C. Aqueous stability: 28 days.',
    diluentMl: 2.0,
    indications: 'Long-acting Amylin Analogue • Synergistic Incretin Satiety'
  },
  retatrutide: {
    canonicalName: 'Retatrutide',
    steps: [2.0, 4.0, 6.0, 9.0, 12.0],
    unit: 'mg',
    defaultVialMg: 10,
    cadence: 'Once weekly',
    shortCadence: '1x/wk',
    timesPerWeek: 1,
    route: 'Subcutaneous',
    timing: 'Morning or Evening • Fasted or Fed',
    storage: 'Refrigerate at 2°C – 8°C. Protect from ultraviolet radiation. In-use stability: 28 days.',
    diluentMl: 2.0,
    indications: 'Triple GIP/GLP-1/Glucagon Tri-Agonism • Intensive Metabolic Recomposition'
  },
  bpc: {
    canonicalName: 'BPC-157',
    steps: [250, 500, 750],
    unit: 'mcg',
    defaultVialMg: 5,
    cadence: 'Daily (morning or BID)',
    shortCadence: 'Daily',
    timesPerWeek: 7,
    route: 'Subcutaneous or Intramuscular (near injury site)',
    timing: 'Morning & Evening on empty stomach',
    storage: 'Refrigerate at 2°C – 8°C. Highly stable pentadecapeptide; 30 days in BAC solution.',
    diluentMl: 2.0,
    indications: 'Gastric Pentadecapeptide • Angiogenesis & Soft Tissue Repair'
  },
  tb: {
    canonicalName: 'TB-500',
    steps: [1.0, 2.0, 2.5],
    unit: 'mg',
    defaultVialMg: 5,
    cadence: '2x weekly (Mon/Thu)',
    shortCadence: '2x/wk',
    timesPerWeek: 2,
    route: 'Subcutaneous',
    timing: 'Post-workout or morning',
    storage: 'Refrigerate at 2°C – 8°C. Handle gently; swirl figure-eight, do not shake.',
    diluentMl: 2.0,
    indications: 'Thymosin Beta-4 Bioactive Fragment • Actin Upregulation & Systemic Recovery'
  },
  mots: {
    canonicalName: 'MOTS-c',
    steps: [5.0, 10.0],
    unit: 'mg',
    defaultVialMg: 10,
    cadence: '3x weekly (Mon/Wed/Fri)',
    shortCadence: '3x/wk',
    timesPerWeek: 3,
    route: 'Subcutaneous',
    timing: 'Morning • Fasted • 30–60 min prior to exercise',
    storage: 'Refrigerate at 2°C – 8°C. Highly heat sensitive. Protect rigorously from thermal spikes.',
    diluentMl: 2.0,
    indications: 'Mitochondrial-Derived Peptide • AMPK Activation & Metabolic Homeostasis'
  },
  ss31: {
    canonicalName: 'SS-31 (Elamipretide)',
    steps: [2.0, 4.0],
    unit: 'mg',
    defaultVialMg: 10,
    cadence: 'Daily morning',
    shortCadence: 'Daily',
    timesPerWeek: 7,
    route: 'Subcutaneous',
    timing: 'Morning upon waking',
    storage: 'Refrigerate at 2°C – 8°C. Light-sensitive vial.',
    diluentMl: 2.0,
    indications: 'Cardiolipin-Targeted Mitochondrial Restorative'
  },
  aod: {
    canonicalName: 'AOD-9604',
    steps: [300, 500],
    unit: 'mcg',
    defaultVialMg: 5,
    cadence: 'Daily morning fasted',
    shortCadence: 'Daily',
    timesPerWeek: 7,
    route: 'Subcutaneous',
    timing: 'Strictly fasted upon waking • Delay caloric intake 30 min',
    storage: 'Refrigerate at 2°C – 8°C. Aqueous stability: 28 days.',
    diluentMl: 2.0,
    indications: 'C-Terminal GH Fragment • Lipolytic White Adipose Mobilization'
  },
  ghk: {
    canonicalName: 'GHK-Cu',
    steps: [1.0, 2.0, 3.0],
    unit: 'mg',
    defaultVialMg: 50,
    cadence: 'Daily morning or BID',
    shortCadence: 'Daily',
    timesPerWeek: 7,
    route: 'Subcutaneous',
    timing: 'Morning SubQ or topical BID',
    storage: 'Refrigerate at 2°C – 8°C. Copper-peptide complex; keep protected from direct sunlight.',
    diluentMl: 3.0,
    indications: 'Copper Tripeptide • Collagen Synthesis & Epigenetic Remodeling'
  },
  nad: {
    canonicalName: 'NAD+',
    steps: [25, 50, 100],
    unit: 'mg',
    defaultVialMg: 500,
    cadence: '2–3x weekly',
    shortCadence: '2-3x/wk',
    timesPerWeek: 3,
    route: 'Subcutaneous (Slow injection)',
    timing: 'Morning or early afternoon • Avoid pre-sleep',
    storage: 'Refrigerate at 2°C – 8°C. High concentration acidic solution; slow draw recommended.',
    diluentMl: 5.0,
    indications: 'Coenzyme Nicotinamide Adenine Dinucleotide • Sirtuin & PARP Activation'
  },
  pt141: {
    canonicalName: 'PT-141 (Bremelanotide)',
    steps: [1.0, 1.5, 1.75],
    unit: 'mg',
    defaultVialMg: 10,
    cadence: 'On-demand (45 min prior)',
    shortCadence: 'On-Demand',
    timesPerWeek: 2,
    route: 'Subcutaneous (Abdomen)',
    timing: '45–60 minutes prior to anticipated activity (Max 1 dose/24h)',
    storage: 'Refrigerate at 2°C – 8°C. Aqueous stability: 30 days.',
    diluentMl: 2.0,
    indications: 'MC3R/MC4R Melanocortin Agonist • Central Neurological Libido Pathways'
  },
  epithalon: {
    canonicalName: 'Epithalon',
    steps: [5.0, 10.0],
    unit: 'mg',
    defaultVialMg: 10,
    cadence: 'Daily for 10–20 days (Bi-annual cycle)',
    shortCadence: 'Daily',
    timesPerWeek: 7,
    route: 'Subcutaneous',
    timing: 'Morning or Evening pre-sleep',
    storage: 'Refrigerate at 2°C – 8°C.',
    diluentMl: 2.0,
    indications: 'Pineal Tetrapeptide • Telomerase Activation & Circadian Reset'
  },
  cjc: {
    canonicalName: 'CJC-1295 / Ipamorelin',
    steps: [100, 250, 300],
    unit: 'mcg',
    defaultVialMg: 5,
    cadence: '5 days on / 2 days off (Weekdays)',
    shortCadence: '5d/wk',
    timesPerWeek: 5,
    route: 'Subcutaneous',
    timing: 'Pre-sleep • Strictly fasted at least 2 hours post-meal',
    storage: 'Refrigerate at 2°C – 8°C. Delicate peptide bond; avoid rapid temperature fluctuations.',
    diluentMl: 2.0,
    indications: 'Pulsatile GHRH + GHRP Synergistic Secretagogue'
  },
  ta1: {
    canonicalName: 'Thymosin Alpha-1',
    steps: [1.5, 1.6],
    unit: 'mg',
    defaultVialMg: 5,
    cadence: '2x weekly (Mon/Thu)',
    shortCadence: '2x/wk',
    timesPerWeek: 2,
    route: 'Subcutaneous',
    timing: 'Morning • Fasted',
    storage: 'Refrigerate at 2°C – 8°C. Light-protected aqueous stability: 30 days.',
    diluentMl: 2.0,
    indications: 'Thymic Peptide • TLR-9 Activation & Adaptive T-Cell Modulation'
  },
  kpv: {
    canonicalName: 'KPV',
    steps: [250, 500],
    unit: 'mcg',
    defaultVialMg: 5,
    cadence: 'Daily (morning or BID)',
    shortCadence: 'Daily',
    timesPerWeek: 7,
    route: 'Subcutaneous or Oral',
    timing: 'Morning or Evening',
    storage: 'Refrigerate at 2°C – 8°C.',
    diluentMl: 2.0,
    indications: 'Tripeptide Alpha-MSH Analogue • Mucosal & Systemic Anti-Inflammation'
  }
});

/**
 * Normalizes compound name to find matching clinical benchmark profile
 */
export function matchClinicalBenchmark(nameOrId = '') {
  const s = String(nameOrId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s.includes('tirzepatide') || s.includes('mounjaro') || s.includes('zepbound')) return CLINICAL_BENCHMARKS.tirzepatide;
  if (s.includes('semaglutide') || s.includes('ozempic') || s.includes('wegovy')) return CLINICAL_BENCHMARKS.semaglutide;
  if (s.includes('cagrilintide') || s.includes('cagri')) return CLINICAL_BENCHMARKS.cagrilintide;
  if (s.includes('retatrutide') || s.includes('reta')) return CLINICAL_BENCHMARKS.retatrutide;
  if (s.includes('bpc') || s.includes('pl14736')) return CLINICAL_BENCHMARKS.bpc;
  if (s.includes('tb500') || s.includes('tb4') || s.includes('thymosinbeta')) return CLINICAL_BENCHMARKS.tb;
  if (s.includes('motsc') || s.includes('mots')) return CLINICAL_BENCHMARKS.mots;
  if (s.includes('ss31') || s.includes('elamipretide')) return CLINICAL_BENCHMARKS.ss31;
  if (s.includes('aod') || s.includes('9604')) return CLINICAL_BENCHMARKS.aod;
  if (s.includes('ghk') || s.includes('copper')) return CLINICAL_BENCHMARKS.ghk;
  if (s.includes('nad')) return CLINICAL_BENCHMARKS.nad;
  if (s.includes('pt141') || s.includes('bremelanotide')) return CLINICAL_BENCHMARKS.pt141;
  if (s.includes('epithalon') || s.includes('epitalon')) return CLINICAL_BENCHMARKS.epithalon;
  if (s.includes('cjc') || s.includes('ipamorelin') || s.includes('sermorelin')) return CLINICAL_BENCHMARKS.cjc;
  if (s.includes('ta1') || s.includes('thymosinalpha') || s.includes('thymosin1') || s.includes('zadaxin')) return CLINICAL_BENCHMARKS.ta1;
  if (s.includes('kpv')) return CLINICAL_BENCHMARKS.kpv;
  return null;
}

/**
 * Resolves clean clinical dose, unit, and cadence for a specific compound within a protocol phase.
 * Guarantees zero discrepancy between summary view and Gantt/detail view.
 */
export function resolveClinicalCompoundDose(compound, phase, phaseIndex = 0, totalPhases = 3, targetCompoundName = '', fallbackVialMg = 10) {
  const nameToMatch = targetCompoundName || compound?.name || compound?.product_name || compound?.productId || '';
  const benchmark = matchClinicalBenchmark(nameToMatch);

  // 1. Check direct raw dose string in compound or phase
  const rawDose = compound?.dosage || compound?.dose || phase?.dose || phase?.dosage || '';
  const rawFreq = compound?.frequency || phase?.frequency || '';

  let doseVal = null;
  let doseUnit = 'mg';
  let shortCadence = benchmark?.shortCadence || '1x/wk';
  let timesPerWeek = benchmark?.timesPerWeek || 1;

  // Cadence parsing: check specific cadence frequencies before generic 'daily'
  if (/2x|2 times|twice|dos veces|bi-weekly|biweekly/i.test(rawFreq)) {
    shortCadence = '2x/wk';
    timesPerWeek = 2;
  } else if (/3x|3 times|3 veces|mon\/wed\/fri/i.test(rawFreq)) {
    shortCadence = '3x/wk';
    timesPerWeek = 3;
  } else if (/5 days on|5d|5 días/i.test(rawFreq)) {
    shortCadence = '5d/wk';
    timesPerWeek = 5;
  } else if (/on-demand|prior to|a demanda/i.test(rawFreq)) {
    shortCadence = 'On-Demand';
    timesPerWeek = 2;
  } else if (/once weekly|1x\/wk|1x weekly|semanal/i.test(rawFreq)) {
    shortCadence = '1x/wk';
    timesPerWeek = 1;
  } else if (/daily|nightly|fasted morning|cada día|diario/i.test(rawFreq)) {
    shortCadence = 'Daily';
    timesPerWeek = 7;
  }

  // Dose value parsing
  if (typeof rawDose === 'number') {
    doseVal = rawDose;
    doseUnit = 'mg';
  } else if (typeof rawDose === 'string' && rawDose.trim()) {
    const trimmed = rawDose.trim();
    // Direct e.g. "2.5 mg" or "250 mcg"
    const directMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(mg|mcg|µg|UI|IU|g)$/i);
    if (directMatch) {
      doseVal = parseFloat(directMatch[1]);
      doseUnit = directMatch[2].toLowerCase() === 'mcg' ? 'mcg' : 'mg';
    } else if (/escalating|titrating/i.test(trimmed)) {
      // Escalating pattern: e.g. "2.5 mg subcutaneous weekly for 4 weeks, titrating to 5 mg weekly thereafter"
      const matches = [...trimmed.matchAll(/(\d+(?:\.\d+)?)\s*(mg|mcg|µg|UI|IU)/gi)];
      if (matches.length > 0) {
        if (phaseIndex === 0) {
          doseVal = parseFloat(matches[0][1]);
          doseUnit = matches[0][2].toLowerCase() === 'mcg' ? 'mcg' : 'mg';
        } else if (phaseIndex < matches.length) {
          doseVal = parseFloat(matches[phaseIndex][1]);
          doseUnit = matches[phaseIndex][2].toLowerCase() === 'mcg' ? 'mcg' : 'mg';
        } else {
          // If protocol has more phases than parsed step numbers (e.g. 5 phases), fall back to benchmark step
          if (benchmark && benchmark.steps) {
            const stepIdx = Math.min(phaseIndex, benchmark.steps.length - 1);
            doseVal = benchmark.steps[stepIdx];
            doseUnit = benchmark.unit;
          } else {
            doseVal = parseFloat(matches[matches.length - 1][1]);
            doseUnit = matches[matches.length - 1][2].toLowerCase() === 'mcg' ? 'mcg' : 'mg';
          }
        }
      }
    } else {
      // Range: e.g. "250 mcg to 500 mcg" or "2.5 - 5.0 mg"
      const rangeMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|µg|UI|IU)?\s*(?:to|-)\s*(\d+(?:\.\d+)?)\s*(mg|mcg|µg|UI|IU)/i);
      if (rangeMatch) {
        const u = (rangeMatch[4] || rangeMatch[2] || 'mg').toLowerCase() === 'mcg' ? 'mcg' : 'mg';
        doseUnit = u;
        doseVal = phaseIndex === 0 ? parseFloat(rangeMatch[1]) : parseFloat(rangeMatch[3]);
      } else {
        const single = trimmed.match(/(\d+(?:\.\d+)?)\s*(mg|mcg|µg|UI|IU|g)/i);
        if (single) {
          doseVal = parseFloat(single[1]);
          doseUnit = single[2].toLowerCase() === 'mcg' ? 'mcg' : 'mg';
        }
      }
    }
  }

  // 2. Authoritative Clinical Benchmark Calibration
  // If no dose was found, or if Phase > 0 repeats Phase 0 initiation dose verbatim on an escalating peptide
  const isGenericRepeatedInitDose = (phaseIndex > 0 && benchmark && benchmark.steps.length > 1 && doseVal === benchmark.steps[0]);
  if (doseVal === null || isNaN(doseVal) || doseVal <= 0 || isGenericRepeatedInitDose) {
    if (benchmark && benchmark.steps) {
      const stepIdx = Math.min(phaseIndex, benchmark.steps.length - 1);
      doseVal = benchmark.steps[stepIdx];
      doseUnit = benchmark.unit;
    } else {
      const v = Number(fallbackVialMg) || 10;
      doseVal = +(Math.max(0.25, Math.min(2.5, v * 0.1 * (phaseIndex + 1))).toFixed(2));
      doseUnit = 'mg';
    }
  }

  const unitDose = `${doseVal} ${doseUnit}`;

  // Calculate cumulative weekly payload
  let weeklyTotal = '';
  const totalVal = Math.round((doseVal * timesPerWeek) * 100) / 100;
  if (doseUnit === 'mcg' && totalVal >= 1000) {
    const mgVal = Math.round((totalVal / 1000) * 10) / 10;
    weeklyTotal = `${mgVal} mg/wk (${totalVal.toLocaleString()} mcg)`;
  } else {
    weeklyTotal = `${totalVal} ${doseUnit}/wk`;
  }

  const isStepUp = phaseIndex > 0;

  return {
    doseVal,
    doseUnit,
    unitDose,
    shortCadence,
    timesPerWeek,
    weeklyTotal,
    isStepUp,
    benchmark
  };
}

/**
 * Dynamically constructs the Reconstitution & U-100 Syringe Graduation dataset
 * for ALL active compounds in a protocol, replacing any static or hardcoded datasets.
 */
export function generateDynamicReconData(protocol) {
  if (!protocol) return [];

  // Extract all distinct compounds from protocol BOM, items, or phases
  const compoundMap = new Map();

  const allItems = [
    ...(Array.isArray(protocol.items) ? protocol.items : []),
    ...(Array.isArray(protocol.bom) ? protocol.bom : []),
    ...(Array.isArray(protocol.products) ? protocol.products : []),
    ...(Array.isArray(protocol.compounds) ? protocol.compounds : []),
    ...(Array.isArray(protocol.peptides) ? protocol.peptides : []),
    ...(Array.isArray(protocol.phases) ? protocol.phases.flatMap(ph => [...(ph.compounds || []), ...(ph.items || []), ...(ph.drugs_used || [])]) : [])
  ];

  allItems.forEach(it => {
    const rawName = it.product_name || it.name || it.title || it.product_slug || it.productId || '';
    if (!rawName) return;
    // Canonical clean base name: strip parenthesized text (e.g. "(LY-3437943)", "(Mitochondrial-Derived Peptide)")
    const baseName = rawName.replace(/\(.*?\)/g, '').replace(/sterile vial|lyophilized|cartridge|pen|-vial/gi, '').trim();
    const cleanKey = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanKey) return;

    const bm = matchClinicalBenchmark(baseName);
    const resolvedName = bm?.canonicalName || (baseName.charAt(0).toUpperCase() + baseName.slice(1));

    if (!compoundMap.has(cleanKey)) {
      compoundMap.set(cleanKey, {
        raw: it,
        name: resolvedName,
        id: it.product_slug || it.productId || it.id || cleanKey
      });
    } else {
      // If an existing entry has a longer name with parentheses, prefer the cleaner resolvedName
      const existing = compoundMap.get(cleanKey);
      if (resolvedName.length < existing.name.length && resolvedName.length >= 3) {
        existing.name = resolvedName;
      }
    }
  });

  const phases = Array.isArray(protocol.phases) && protocol.phases.length > 0 ? protocol.phases : [
    { name: 'Phase 1 (Initiation)', durationWeeks: 4 },
    { name: 'Phase 2 (Titration)', durationWeeks: 4 },
    { name: 'Phase 3 (Optimization)', durationWeeks: 4 }
  ];

  const reconList = [];

  compoundMap.forEach(({ raw, name, id }) => {
    const bm = matchClinicalBenchmark(name);
    let parsedVialMg = null;
    if (raw.productId) {
      const match = String(raw.productId).match(/(\d+(?:\.\d+)?)\s*mg/i);
      if (match) parsedVialMg = parseFloat(match[1]);
    }
    const vialMg = raw.vial_size_mg || raw.strength_mg || parsedVialMg || bm?.defaultVialMg || 10;
    const bacMl = bm?.diluentMl || 2.0;
    const concMgMl = vialMg / bacMl;
    const isMicro = bm?.unit === 'mcg' || vialMg <= 2;

    const concentrationStr = isMicro
      ? `${(concMgMl * 1000).toFixed(0)} mcg/mL (${((concMgMl * 1000) / 100).toFixed(1)} mcg per Unit)`
      : `${concMgMl.toFixed(2)} mg/mL (${(concMgMl / 100).toFixed(3)} mg per Unit)`;

    // Calculate dynamic U-100 syringe draw units for each phase
    const dosingScale = phases.map((ph, pIdx) => {
      const rawPhWeeks = Number(ph.durationWeeks) ||
        (ph.end_week && ph.start_week ? (Number(ph.end_week) - Number(ph.start_week) + 1) : null) || 4;
      const startW = phases.slice(0, pIdx).reduce((acc, p) => {
        const w = Number(p.durationWeeks) || (p.end_week && p.start_week ? (Number(p.end_week) - Number(p.start_week) + 1) : null) || 4;
        return acc + w;
      }, 0) + 1;
      const endW = startW + rawPhWeeks - 1;
      const pLabel = `Phase ${pIdx + 1} (W${startW}–W${endW})`;

      // Find matching compound in this phase with alphanumeric normalization (ignoring hyphens, spaces)
      const phCompounds = [...(ph.compounds || []), ...(ph.items || []), ...(ph.drugs_used || [])];
      const normTarget = String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const matched = phCompounds.find(c => {
        const cClean = String(c.name || c.product_name || c.title || c.product_slug || c.productId || c.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        return cClean.includes(normTarget) || normTarget.includes(cClean);
      });

      const res = resolveClinicalCompoundDose(matched || raw, ph, pIdx, phases.length, name, vialMg);

      // Volume needed in mL = dose in mg / conc in mg/mL
      const doseMg = res.doseUnit === 'mcg' ? res.doseVal / 1000 : res.doseVal;
      const volMl = concMgMl > 0 ? doseMg / concMgMl : 0;
      const units = Math.round(volMl * 100);

      return {
        phase: pLabel,
        phaseName: ph.name || ph.phase_title || `Phase ${pIdx + 1}`,
        dose: `${res.unitDose} ${res.shortCadence}`,
        units: `${units} Units (${volMl.toFixed(2)} mL)`,
        syringe: units <= 30 ? '0.3 mL U-100 Syringe' : units <= 50 ? '0.5 mL U-100 Syringe' : '1.0 mL U-100 Syringe'
      };
    });

    reconList.push({
      name,
      id,
      strength: `${vialMg} mg Vial`,
      solvent: `${bacMl.toFixed(1)} mL BAC Water`,
      concentration: concentrationStr,
      storage: bm?.storage || 'Refrigerate at 2°C – 8°C (Do Not Freeze). Protect from light. Aqueous stability: 28 days.',
      steps: [
        'Disinfect vial rubber septum using a sterile 70% isopropyl alcohol wipe.',
        `Draw exactly ${bacMl.toFixed(1)} mL of USP Bacteriostatic 0.9% Benzyl Alcohol Water using a 3mL mixing syringe.`,
        'Aim the needle toward the inner glass wall of the vial; inject slowly to prevent foaming and peptide degradation.',
        'Swirl smoothly in a gentle figure-eight motion until the lyophilized cake is fully dissolved. Do not shake vigorously.'
      ],
      dosingScale,
      cadence: bm?.shortCadence || '1x/wk',
      shortCadence: bm?.shortCadence || '1x/wk',
      timesPerWeek: bm?.timesPerWeek || 1
    });
  });

  return reconList;
}

/**
 * Dynamically computes supply dispensing requirements across full cycle duration
 */
export function generateDynamicSupplySummary(protocol) {
  const durWeeks = Number(protocol?.durationWeeks) ||
    Number(protocol?.protocol_duration_weeks) ||
    (protocol?.phases ? protocol.phases.reduce((acc, p) => acc + (Number(p.durationWeeks) || (p.end_week && p.start_week ? Number(p.end_week) - Number(p.start_week) + 1 : 0)), 0) : 8) || 8;

  const phases = Array.isArray(protocol?.phases) && protocol.phases.length > 0 ? protocol.phases : [
    { name: 'Full Cycle', durationWeeks: durWeeks }
  ];

  const reconData = generateDynamicReconData(protocol);

  const compounds = reconData.map(c => {
    const bm = matchClinicalBenchmark(c.name);
    const timesPerWeek = bm?.timesPerWeek || 1;
    let totalInjections = timesPerWeek * durWeeks;
    
    // Estimate vials based on average weekly dose across phases
    const vialMgMatch = c.strength.match(/(\d+(?:\.\d+)?)/);
    const vialMg = vialMgMatch ? parseFloat(vialMgMatch[1]) : 10;
    
    let totalMgNeeded = 0;
    const totalPhaseWeeks = phases.reduce((sum, p) => sum + (Number(p.durationWeeks) || (p.end_week && p.start_week ? Number(p.end_week) - Number(p.start_week) + 1 : 0) || 0), 0) || durWeeks;
    phases.forEach((ph, pIdx) => {
      // If sum of phases exceeds protocol duration, scale proportionally
      const rawPhWeeks = Number(ph.durationWeeks) || 
        (ph.end_week && ph.start_week ? (Number(ph.end_week) - Number(ph.start_week) + 1) : null) || 
        Math.ceil(durWeeks / phases.length) || 4;
      const phWeeks = totalPhaseWeeks > durWeeks ? (rawPhWeeks / totalPhaseWeeks) * durWeeks : rawPhWeeks;
      const scale = c.dosingScale[pIdx] || c.dosingScale[0];
      const doseMgMatch = scale?.dose?.match(/(\d+(?:\.\d+)?)\s*(mg|mcg)/i);
      if (doseMgMatch) {
        const val = parseFloat(doseMgMatch[1]);
        const mg = doseMgMatch[2].toLowerCase() === 'mcg' ? val / 1000 : val;
        totalMgNeeded += (mg * timesPerWeek * phWeeks);
      } else {
        totalMgNeeded += (2.5 * timesPerWeek * phWeeks);
      }
    });

    // Clinical safety check for finite-cycle peptide protocols (e.g. Epithalon 10-20 day bi-annual cycles)
    if (/10-20 days|10–20 days|10 to 20 days|10-day|20-day/i.test(bm?.cadence || c.cadence || '')) {
      const maxCycleDoses = 20;
      totalInjections = Math.min(totalInjections, maxCycleDoses);
      totalMgNeeded = Math.min(totalMgNeeded, 100); // 100mg standard clinical cycle
    }

    const vials = Math.max(1, Math.ceil(totalMgNeeded / vialMg));

    return {
      id: c.id,
      name: c.name,
      slug: c.id,
      vials,
      vialStrength: c.strength,
      reconstitutionBac: c.solvent,
      cadence: bm?.cadence || 'Once Weekly SubQ',
      injectionsPerWeek: timesPerWeek,
      totalInjections,
      weeklyDose: `${c.dosingScale[0]?.dose || 'Active'} (Titrated)`
    };
  });

  const totalVials = compounds.reduce((sum, it) => sum + it.vials, 0);
  const totalInjections = compounds.reduce((sum, it) => sum + it.totalInjections, 0);
  const bacVials = Math.max(1, Math.ceil((totalVials * 2.0) / 10)); // 10mL BAC vials

  return {
    durWeeks,
    totalVials,
    totalInjections,
    bacVials,
    syringes: totalInjections,
    alcoholSwabs: totalInjections,
    compounds
  };
}

/**
 * Dynamically computes 7-day administration schedule from protocol compounds
 */
export function generateDynamicWeeklySchedule(protocol, activePhaseIdx = 0) {
  const reconData = generateDynamicReconData(protocol);
  if (!reconData || reconData.length === 0) {
    return [
      { day: 'Monday', compound: 'Primary Protocol API', dose: 'Initiation Dose', time: 'Morning • Fasted', route: 'SubQ', badgeColor: '#0284c7', rest: false },
      { day: 'Tuesday', compound: 'Non-Administration Day', dose: 'Cellular Assimilation', time: 'All Day', route: 'Receptor Rest', badgeColor: '#64748b', rest: true },
      { day: 'Wednesday', compound: 'Non-Administration Day', dose: 'Cellular Assimilation', time: 'All Day', route: 'Receptor Rest', badgeColor: '#64748b', rest: true },
      { day: 'Thursday', compound: 'Non-Administration Day', dose: 'Cellular Assimilation', time: 'All Day', route: 'Receptor Rest', badgeColor: '#64748b', rest: true },
      { day: 'Friday', compound: 'Non-Administration Day', dose: 'Cellular Assimilation', time: 'All Day', route: 'Receptor Rest', badgeColor: '#64748b', rest: true },
      { day: 'Saturday', compound: 'Non-Administration Day', dose: 'Cellular Assimilation', time: 'All Day', route: 'Receptor Rest', badgeColor: '#64748b', rest: true },
      { day: 'Sunday', compound: 'Weekly Clinical Checkpoint', dose: 'Pre-Cycle Review', time: 'Evening', route: 'Clinical Evaluation', badgeColor: '#0d9488', rest: true }
    ];
  }

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Map each day to the list of administrations scheduled on that day
  const scheduleMap = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: []
  };

  const BADGE_COLORS = ['#0284c7', '#0d9488', '#ea580c', '#7c3aed', '#2563eb'];

  reconData.forEach((comp, idx) => {
    const bm = matchClinicalBenchmark(comp.name);
    const color = BADGE_COLORS[idx % BADGE_COLORS.length];
    
    // Resolve dose for the requested activePhaseIdx
    const scaleEntry = (comp.dosingScale && comp.dosingScale[activePhaseIdx])
      ? comp.dosingScale[activePhaseIdx]
      : (comp.dosingScale && comp.dosingScale[0] ? comp.dosingScale[0] : null);
    const targetDose = scaleEntry ? scaleEntry.dose : (comp.dosage || 'Standard Dose');
    const timing = bm?.timing || 'Morning • Fasted';
    const route = bm?.route?.split(' ')[0] || comp.route || 'SubQ';

    // Parse clean cadence & timesPerWeek
    const cleanDoseStr = String(targetDose || '').toLowerCase();
    const rawFreqStr = String(comp.frequency || comp.raw?.frequency || '').toLowerCase();
    let times = comp.timesPerWeek || bm?.timesPerWeek;

    if (!times) {
      if (/daily|nightly|cada día/i.test(cleanDoseStr) || /daily/i.test(rawFreqStr)) times = 7;
      else if (/3x|3 times|mon\/wed\/fri/i.test(cleanDoseStr) || /3x/i.test(rawFreqStr)) times = 3;
      else if (/2x|twice|mon\/thu/i.test(cleanDoseStr) || /twice|2x/i.test(rawFreqStr)) times = 2;
      else if (/5d|5 days/i.test(cleanDoseStr) || /5 days/i.test(rawFreqStr)) times = 5;
      else times = 1;
    }

    let targetDays = [];
    if (times === 7) {
      targetDays = DAYS;
    } else if (times === 5) {
      targetDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    } else if (times === 3) {
      targetDays = ['Monday', 'Wednesday', 'Friday'];
    } else if (times === 2) {
      targetDays = ['Monday', 'Thursday'];
    } else {
      // 1x/wk (e.g. GLP-1 agonists, Tirzepatide, Semaglutide)
      targetDays = ['Monday'];
    }

    targetDays.forEach(d => {
      scheduleMap[d].push({
        compound: comp.name,
        dose: targetDose,
        time: timing,
        route,
        badgeColor: color
      });
    });
  });

  // Construct 7-day roadmap array with unified clinical standards
  return DAYS.map(day => {
    const admins = scheduleMap[day];
    if (admins.length > 0) {
      if (admins.length === 1) {
        return {
          day,
          compound: admins[0].compound,
          dose: admins[0].dose,
          time: admins[0].time,
          route: admins[0].route,
          badgeColor: admins[0].badgeColor,
          rest: false
        };
      } else {
        // Multi-compound synergistic administration (e.g. TA1 + TB-500)
        const compoundNames = admins.map(a => a.compound).join(' + ');
        const doses = admins.map(a => `${a.compound.replace(/\(.*?\)/g, '').trim()}: ${a.dose}`).join(' • ');
        return {
          day,
          compound: compoundNames,
          dose: doses,
          time: admins[0].time,
          route: admins[0].route,
          badgeColor: '#0284c7',
          rest: false
        };
      }
    } else {
      // Non-administration recovery day
      return {
        day,
        compound: day === 'Sunday' ? 'Weekly Clinical Checkpoint' : 'Non-Administration Day',
        dose: day === 'Sunday' ? 'Progress & Tolerance Review' : 'Receptor Rest & Cellular Assimilation',
        time: day === 'Sunday' ? 'Evening' : 'All Day',
        route: day === 'Sunday' ? 'Self-Assessment' : 'Rest Phase',
        badgeColor: day === 'Sunday' ? '#0d9488' : '#64748b',
        rest: true
      };
    }
  });
}
