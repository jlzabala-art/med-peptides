/**
 * scripts/homogenizeAllProtocolsSSOT.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Homogenization Script for Clinical Protocols (SSOT)
 *
 * Enforces a SINGLE UNIFIED SCHEMA across all protocols:
 * 1. Clinical Evidence Audit:
 *    - Incretins (Tirzepatide, Semaglutide, Retatrutide, Cagrilintide): strictly ONCE WEEKLY
 *      with gradual titration to avoid GI distress/pancreatitis.
 *    - GH Secretagogues (CJC-1295, Ipamorelin, Tesamorelin): strictly PRE-BEDTIME FASTED,
 *      5-on/2-off cycling to prevent pituitary somatotrope receptor desensitization.
 *    - Mitochondrial (MOTS-c): strictly MORNING FASTED pre-exercise (never night).
 *    - Neurotropic (Semax, Selank): INTRANASAL / SUBCUTANEOUS, morning/daytime.
 *    - Sleep (DSIP): 30-60 min pre-bed, intermittent 3-5x/wk.
 *    - Healing (BPC-157, TB-500): BPC-157 250-500 mcg BID; TB-500 2.0-2.5 mg 2x/wk.
 *    - Epithalon: 10-20 day bioregulator cycles.
 *    - Hair/Alopecia compounds (Minoxidil, Dutasteride, TrichoSol): TOPICAL SCALP daily.
 *    - Transdermal hormones (Testosterone Pentravan): TOPICAL TRANSDERMAL daily.
 *
 * 2. Single Homogeneous Schema:
 *    - Protocol top-level: id, name, slug, shortCode, category, status, durationWeeks,
 *      primaryGoal, goals, description, clinicalRationale, evidenceLevel, evidenceGrade,
 *      evidenceGradeNote, requiredLabs, monitoringPlan, contraindications, relativeCautions,
 *      expectedOutcomes, recommendedSupplements, phases.
 *    - Unified Phase schema: phaseNumber, phaseName, durationWeeks, startWeek, endWeek,
 *      objective, instructions, compounds, drugs (identical).
 *    - Unified Compound schema: id, name, dosage, dose, doseAmount, doseUnit, frequency,
 *      frequencyTimesPerWeek, weeklyDose, weeklyDoseAmount, weeklyDoseUnit, route,
 *      dosageForm, timing, storage, reconstitution, clinicalNotes.
 */

import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { db } from './lib/firebase-admin.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// ── 1. Canonical Clinical Compound Registry (Best Practices SSOT) ────────────
export const CLINICAL_COMPOUND_REGISTRY = {
  tirzepatide: {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Once weekly',
    timesPerWeek: 1,
    timing: 'Evening • Same day each week',
    storage: 'Refrigerate at 2°C – 8°C (Do Not Freeze). Aqueous stability: 28 days post-reconstitution.',
    reconstitution: {
      vialStrengthMg: 10,
      diluentMl: 2.0,
      unitsPerDose: 50,
      finalConcentration: '5 mg/mL'
    },
    clinicalNotes: 'Dual GIP/GLP-1 receptor agonist. Titrate slowly: start 2.5 mg x 4 weeks, then 5.0 mg, then 7.5-10 mg.'
  },
  semaglutide: {
    id: 'semaglutide',
    name: 'Semaglutide',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Once weekly',
    timesPerWeek: 1,
    timing: 'Morning or Evening • Same day weekly',
    storage: 'Refrigerate at 2°C – 8°C. Protect from light. In-use stability: 56 days.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 10,
      finalConcentration: '2.5 mg/mL'
    },
    clinicalNotes: 'Selective GLP-1 receptor agonist. Initiation dose: 0.25 mg weekly x 4 weeks to avoid nausea.'
  },
  retatrutide: {
    id: 'retatrutide',
    name: 'Retatrutide',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Once weekly',
    timesPerWeek: 1,
    timing: 'Morning or Evening • Fasted or Fed',
    storage: 'Refrigerate at 2°C – 8°C. Protect from UV. In-use stability: 28 days.',
    reconstitution: {
      vialStrengthMg: 10,
      diluentMl: 2.0,
      unitsPerDose: 40,
      finalConcentration: '5 mg/mL'
    },
    clinicalNotes: 'Triple GIP/GLP-1/Glucagon tri-agonist. Initial dose 2.0 mg weekly x 4w, escalate to 4.0 mg, maintenance 6-9 mg.'
  },
  cagrilintide: {
    id: 'cagrilintide',
    name: 'Cagrilintide',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Once weekly',
    timesPerWeek: 1,
    timing: 'Same day as GLP-1 co-agonist',
    storage: 'Refrigerate at 2°C – 8°C. Aqueous stability: 28 days.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 12,
      finalConcentration: '2.5 mg/mL'
    },
    clinicalNotes: 'Long-acting amylin analogue for synergistic incretin satiety. Initial 0.3 mg, titrate to 0.6 mg - 1.2 mg.'
  },
  bpc157: {
    id: 'bpc-157',
    name: 'BPC-157',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: 'Daily (morning & evening)',
    timesPerWeek: 7,
    timing: 'Morning fasted and/or pre-sleep on empty stomach',
    storage: 'Refrigerate at 2°C – 8°C. Stable in BAC solution for 30 days.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 10,
      finalConcentration: '2.5 mg/mL (250 mcg / 10 UI)'
    },
    clinicalNotes: 'Stable gastric pentadecapeptide. Promotes VEGFR2 upregulation, focal collagen deposition, and mucosal integrity.'
  },
  tb500: {
    id: 'tb-500',
    name: 'TB-500',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: '2x weekly (Mon/Thu)',
    timesPerWeek: 2,
    timing: 'Morning or post-workout',
    storage: 'Refrigerate at 2°C – 8°C. Handle gently, do not shake vigorously.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 80,
      finalConcentration: '2.5 mg/mL'
    },
    clinicalNotes: 'Thymosin Beta-4 bio-active fragment. G-actin sequestering peptide driving cellular migration and angiogenesis.'
  },
  motsc: {
    id: 'mots-c',
    name: 'MOTS-c',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: '3x weekly (Mon/Wed/Fri)',
    timesPerWeek: 3,
    timing: 'Morning • Fasted • 30–60 min prior to exercise',
    storage: 'Refrigerate at 2°C – 8°C. Highly heat sensitive. Protect from thermal spikes.',
    reconstitution: {
      vialStrengthMg: 10,
      diluentMl: 2.0,
      unitsPerDose: 100,
      finalConcentration: '5 mg/mL'
    },
    clinicalNotes: 'Mitochondrial-derived peptide stimulating AMPK phosphorylation. Administer strictly before exercise in the morning; avoid evening use.'
  },
  ss31: {
    id: 'ss-31',
    name: 'SS-31 (Elamipretide)',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Daily (morning)',
    timesPerWeek: 7,
    timing: 'Morning upon waking',
    storage: 'Refrigerate at 2°C – 8°C. Light-sensitive vial.',
    reconstitution: {
      vialStrengthMg: 50,
      diluentMl: 5.0,
      unitsPerDose: 40,
      finalConcentration: '10 mg/mL'
    },
    clinicalNotes: 'Cardiolipin-targeted peptide restoring electron transport chain efficiency and quenching mitochondrial ROS.'
  },
  aod9604: {
    id: 'aod-9604',
    name: 'AOD-9604',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: 'Daily (morning fasted)',
    timesPerWeek: 7,
    timing: 'Strictly fasted upon waking • Delay caloric intake 30 min',
    storage: 'Refrigerate at 2°C – 8°C. Aqueous stability: 28 days.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 12,
      finalConcentration: '2.5 mg/mL (250 mcg per 10 UI)'
    },
    clinicalNotes: 'C-terminal GH fragment (177-191). Stimulates adipose lipolysis without elevating insulin or IGF-1.'
  },
  ghkcu: {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Daily (morning)',
    timesPerWeek: 7,
    timing: 'Morning subcutaneous or topical BID',
    storage: 'Refrigerate at 2°C – 8°C. Protect from direct sunlight.',
    reconstitution: {
      vialStrengthMg: 50,
      diluentMl: 3.0,
      unitsPerDose: 12,
      finalConcentration: '16.6 mg/mL (2 mg per 12 UI)'
    },
    clinicalNotes: 'Copper tripeptide. Upregulates collagen synthesis and tissue remodeling. Rotate injection sites to minimize local sting.'
  },
  ipamorelin: {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: '5 days on, 2 days off (bedtime)',
    timesPerWeek: 5,
    timing: 'Pre-bedtime • Strictly fasted min 2 hours post-dinner',
    storage: 'Refrigerate at 2°C – 8°C. Protect from temperature fluctuations.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 8,
      finalConcentration: '2.5 mg/mL (200 mcg per 8 UI)'
    },
    clinicalNotes: 'Selective GH secretagogue (ghrelin receptor agonist). Fasting is mandatory to prevent somatostatin blunting of GH pulse.'
  },
  cjc1295: {
    id: 'cjc-1295',
    name: 'CJC-1295 (No DAC)',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: '5 days on, 2 days off (bedtime)',
    timesPerWeek: 5,
    timing: 'Pre-bedtime • Strictly fasted min 2 hours post-dinner',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 2,
      diluentMl: 2.0,
      unitsPerDose: 10,
      finalConcentration: '1.0 mg/mL (100 mcg per 10 UI)'
    },
    clinicalNotes: 'Synthetic GHRH analogue. Synergizes with Ipamorelin for physiologic pulsatile GH release.'
  },
  tesamorelin: {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: '5 days on, 2 days off (bedtime)',
    timesPerWeek: 5,
    timing: 'Pre-bedtime • Strictly fasted',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 10,
      diluentMl: 2.0,
      unitsPerDose: 20,
      finalConcentration: '5.0 mg/mL (1 mg per 20 UI)'
    },
    clinicalNotes: 'Potent GHRH analogue specifically reducing visceral adipose tissue (VAT) and enhancing deep slow-wave sleep.'
  },
  epithalon: {
    id: 'epithalon',
    name: 'Epithalon',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Daily for 10–20 days',
    timesPerWeek: 7,
    timing: 'Morning or pre-sleep',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 10,
      diluentMl: 2.0,
      unitsPerDose: 100,
      finalConcentration: '5.0 mg/mL (5 mg per 100 UI)'
    },
    clinicalNotes: 'Pineal bioregulator peptide. Administer as a cyclical 10-20 day protocol, 1-2 times per year.'
  },
  pinealon: {
    id: 'pinealon',
    name: 'Pinealon',
    route: 'Subcutaneous or Oral',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: 'Daily for 20 days',
    timesPerWeek: 7,
    timing: 'Morning upon waking',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 10,
      diluentMl: 2.0,
      unitsPerDose: 4,
      finalConcentration: '5.0 mg/mL (200 mcg per 4 UI)'
    },
    clinicalNotes: 'Neuroprotective tripeptide (Glu-Asp-Arg). 20-day cycles for cognitive optimization and brain circadian resilience.'
  },
  semax: {
    id: 'semax',
    name: 'Semax',
    route: 'Intranasal',
    dosageForm: 'nasal spray',
    defaultUnit: 'mcg',
    defaultFrequency: 'Daily (morning)',
    timesPerWeek: 7,
    timing: 'Morning upon waking • Prior to 14:00',
    storage: 'Refrigerate at 2°C – 8°C. Aqueous stability 30 days post-reconstitution.',
    reconstitution: {
      vialStrengthMg: 30,
      diluentMl: 3.0,
      unitsPerDose: 1, // 1 spray = 300 mcg
      finalConcentration: '10 mg/mL'
    },
    clinicalNotes: 'Synthetic ACTH(4-10) analogue. Stimulates BDNF and TrkB signaling. Intranasal route delivers direct trans-cribriform CNS uptake.'
  },
  selank: {
    id: 'selank',
    name: 'Selank',
    route: 'Intranasal',
    dosageForm: 'nasal spray',
    defaultUnit: 'mcg',
    defaultFrequency: 'Daily (morning & midday)',
    timesPerWeek: 7,
    timing: 'Morning and/or prior to acute cognitive or emotional stress',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 30,
      diluentMl: 3.0,
      unitsPerDose: 1, // 1 spray = 250-300 mcg
      finalConcentration: '10 mg/mL'
    },
    clinicalNotes: 'Tuftsin analogue modulating GABAergic transmission and dopamine/serotonin balance. Potent anxiolytic without sedation.'
  },
  dsip: {
    id: 'dsip',
    name: 'DSIP',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: '3–5 nights weekly (bedtime)',
    timesPerWeek: 4,
    timing: '30–60 minutes prior to anticipated sleep',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 2,
      diluentMl: 2.0,
      unitsPerDose: 10,
      finalConcentration: '1.0 mg/mL (100 mcg per 10 UI)'
    },
    clinicalNotes: 'Delta Sleep-Inducing Peptide. Induces physiological delta slow-wave sleep. Intermittent use preserves receptor sensitivity.'
  },
  thymosinalpha1: {
    id: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Twice weekly (Mon/Thu)',
    timesPerWeek: 2,
    timing: 'Morning • Fasted',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 64,
      finalConcentration: '2.5 mg/mL (1.6 mg per 64 UI)'
    },
    clinicalNotes: 'Thymic peptide TLR-9 agonist. Augments T-cell maturation and innate antiviral/immune surveillance.'
  },
  kpv: {
    id: 'kpv',
    name: 'KPV',
    route: 'Subcutaneous or Oral',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: 'Twice daily',
    timesPerWeek: 7,
    timing: 'Morning and evening on empty stomach',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 10,
      finalConcentration: '2.5 mg/mL (250 mcg per 10 UI)'
    },
    clinicalNotes: 'Alpha-MSH C-terminal tripeptide. Inhibits NF-κB inflammatory signaling and restores mucosal gut/epithelial integrity.'
  },
  ara290: {
    id: 'ara-290',
    name: 'ARA-290 (Cibinetide)',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'Daily for 28 days',
    timesPerWeek: 7,
    timing: 'Morning subcutaneous',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 16,
      diluentMl: 2.0,
      unitsPerDose: 50,
      finalConcentration: '8.0 mg/mL (4 mg per 50 UI)'
    },
    clinicalNotes: 'Innate repair receptor (IRR) agonist promoting peripheral nerve regeneration and small fiber neuropathy recovery.'
  },
  nad: {
    id: 'nad-plus',
    name: 'NAD+',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: '2–3 times weekly',
    timesPerWeek: 3,
    timing: 'Morning or early afternoon • Avoid evening',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 500,
      diluentMl: 5.0,
      unitsPerDose: 50,
      finalConcentration: '100 mg/mL (50 mg per 50 UI)'
    },
    clinicalNotes: 'Essential metabolic coenzyme activating sirtuins (SIRT1-3) and PARP-mediated DNA repair.'
  },
  pt141: {
    id: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mg',
    defaultFrequency: 'On-demand (45 min prior)',
    timesPerWeek: 2,
    timing: '45–60 minutes prior to anticipated activity (max 1 dose in 24h)',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 10,
      diluentMl: 2.0,
      unitsPerDose: 25,
      finalConcentration: '5.0 mg/mL (1.25 mg per 25 UI)'
    },
    clinicalNotes: 'Central melanocortin MC3R/MC4R agonist stimulating libido pathways via CNS receptors.'
  },
  kisspeptin: {
    id: 'kisspeptin-10',
    name: 'Kisspeptin-10',
    route: 'Subcutaneous',
    dosageForm: 'vial',
    defaultUnit: 'mcg',
    defaultFrequency: '2–3 times weekly',
    timesPerWeek: 3,
    timing: 'Morning or pre-workout',
    storage: 'Refrigerate at 2°C – 8°C.',
    reconstitution: {
      vialStrengthMg: 5,
      diluentMl: 2.0,
      unitsPerDose: 4,
      finalConcentration: '2.5 mg/mL (100 mcg per 4 UI)'
    },
    clinicalNotes: 'Upstream regulator of GnRH stimulating endogenous LH and FSH secretion and pulsatile testosterone.'
  },
  minoxidil_dutasteride: {
    id: 'minoxidil-dutasteride-topical',
    name: 'Minoxidil + Dutasteride Scalp Solution',
    route: 'Topical (Scalp)',
    dosageForm: 'topical solution',
    defaultUnit: 'mL',
    defaultFrequency: 'Once daily (bedtime)',
    timesPerWeek: 7,
    timing: 'Nightly applied directly to scalp',
    storage: 'Store at controlled room temperature (15°C–25°C).',
    reconstitution: {
      finalConcentration: 'Minoxidil 4% / Dutasteride 0.25% in TrichoSol vehicle'
    },
    clinicalNotes: 'Dual action potassium channel opener and 5-alpha reductase inhibitor in trichological vehicle.'
  },
  testosterone_pentravan: {
    id: 'testosterone-micronized-transdermal',
    name: 'Testosterone Micronized USP (Pentravan)',
    route: 'Topical / Transdermal',
    dosageForm: 'transdermal cream',
    defaultUnit: 'mg',
    defaultFrequency: 'Once daily (morning)',
    timesPerWeek: 7,
    timing: 'Morning applied to clean, dry skin (shoulders/inner arms)',
    storage: 'Store at controlled room temperature (15°C–25°C).',
    reconstitution: {
      finalConcentration: 'Testosterone in Pentravan transdermal delivery base'
    },
    clinicalNotes: 'Bio-identical transdermal hormone replacement therapy with micellar penetration technology.'
  }
};

// ── Match compound string to clinical registry ───────────────────────────────
export function matchClinicalCompound(rawName = '', rawSlug = '') {
  const s = `${rawName} ${rawSlug}`.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (s.includes('tirzepatide')) return CLINICAL_COMPOUND_REGISTRY.tirzepatide;
  if (s.includes('semaglutide')) return CLINICAL_COMPOUND_REGISTRY.semaglutide;
  if (s.includes('retatrutide')) return CLINICAL_COMPOUND_REGISTRY.retatrutide;
  if (s.includes('cagrilintide')) return CLINICAL_COMPOUND_REGISTRY.cagrilintide;
  if (s.includes('bpc') || s.includes('157')) return CLINICAL_COMPOUND_REGISTRY.bpc157;
  if (s.includes('tb500') || s.includes('tb4') || s.includes('thymosinbeta')) return CLINICAL_COMPOUND_REGISTRY.tb500;
  if (s.includes('mots')) return CLINICAL_COMPOUND_REGISTRY.motsc;
  if (s.includes('ss31') || s.includes('elamipretide')) return CLINICAL_COMPOUND_REGISTRY.ss31;
  if (s.includes('aod') || s.includes('9604')) return CLINICAL_COMPOUND_REGISTRY.aod9604;
  if (s.includes('ghk')) return CLINICAL_COMPOUND_REGISTRY.ghkcu;
  if (s.includes('ipamorelin')) return CLINICAL_COMPOUND_REGISTRY.ipamorelin;
  if (s.includes('cjc') || s.includes('1295')) return CLINICAL_COMPOUND_REGISTRY.cjc1295;
  if (s.includes('tesamorelin')) return CLINICAL_COMPOUND_REGISTRY.tesamorelin;
  if (s.includes('epithalon') || s.includes('epitalon')) return CLINICAL_COMPOUND_REGISTRY.epithalon;
  if (s.includes('pinealon')) return CLINICAL_COMPOUND_REGISTRY.pinealon;
  if (s.includes('semax')) return CLINICAL_COMPOUND_REGISTRY.semax;
  if (s.includes('selank')) return CLINICAL_COMPOUND_REGISTRY.selank;
  if (s.includes('dsip')) return CLINICAL_COMPOUND_REGISTRY.dsip;
  if (s.includes('thymosinalpha') || s.includes('ta1') || s.includes('zadaxin')) return CLINICAL_COMPOUND_REGISTRY.thymosinalpha1;
  if (s.includes('kpv')) return CLINICAL_COMPOUND_REGISTRY.kpv;
  if (s.includes('ara290') || s.includes('cibinetide')) return CLINICAL_COMPOUND_REGISTRY.ara290;
  if (s.includes('nad')) return CLINICAL_COMPOUND_REGISTRY.nad;
  if (s.includes('pt141') || s.includes('bremelanotide')) return CLINICAL_COMPOUND_REGISTRY.pt141;
  if (s.includes('kisspeptin')) return CLINICAL_COMPOUND_REGISTRY.kisspeptin;
  if (s.includes('minoxidil') || s.includes('dutasteride') || s.includes('trichosol')) return CLINICAL_COMPOUND_REGISTRY.minoxidil_dutasteride;
  if (s.includes('testosterone') || s.includes('pentravan')) return CLINICAL_COMPOUND_REGISTRY.testosterone_pentravan;
  return null;
}

// ── Clean and parse dosage strings ───────────────────────────────────────────
function parseDosageNumeric(doseStr) {
  if (typeof doseStr === 'number') return { amount: doseStr, unit: 'mg' };
  if (!doseStr || typeof doseStr !== 'string') return { amount: 1, unit: 'mg' };
  const cleaned = doseStr.replace(/,/g, '').trim();
  const m = cleaned.match(/([0-9.]+)\s*([a-zA-Z%]+)?/);
  if (!m) return { amount: 1, unit: 'mg' };
  return {
    amount: parseFloat(m[1]),
    unit: m[2] ? m[2].toLowerCase() : 'mg'
  };
}

// ── Normalize Frequency ───────────────────────────────────────────────────────
function normalizeFrequencyString(freqStr, compoundRef) {
  if (!freqStr || freqStr === 'daily') {
    if (compoundRef?.id === 'tirzepatide' || compoundRef?.id === 'semaglutide' || compoundRef?.id === 'retatrutide' || compoundRef?.id === 'cagrilintide') {
      return { label: 'Once weekly', timesPerWeek: 1 };
    }
  }
  const f = (freqStr || '').toLowerCase();
  if (f.includes('once_weekly') || f.includes('once weekly') || f.includes('1x/wk') || f.includes('weekly')) {
    return { label: 'Once weekly', timesPerWeek: 1 };
  }
  if (f.includes('2x_weekly') || f.includes('twice weekly') || f.includes('2x/wk') || f.includes('twice_weekly')) {
    return { label: '2x weekly (e.g. Mon/Thu)', timesPerWeek: 2 };
  }
  if (f.includes('3x_weekly') || f.includes('3x weekly') || f.includes('3x/wk')) {
    return { label: '3x weekly (Mon/Wed/Fri)', timesPerWeek: 3 };
  }
  if (f.includes('5_days') || f.includes('5x_week') || f.includes('5 days on')) {
    return { label: '5 days on, 2 days off (bedtime)', timesPerWeek: 5 };
  }
  if (f.includes('twice daily') || f.includes('twice_daily') || f.includes('bid')) {
    return { label: 'Twice daily (morning & evening)', timesPerWeek: 14 };
  }
  if (f.includes('on-demand') || f.includes('on_demand')) {
    return { label: 'On-demand (45 min prior)', timesPerWeek: 2 };
  }
  if (f.includes('10-20') || f.includes('10–20')) {
    return { label: 'Daily for 10–20 days', timesPerWeek: 7 };
  }
  if (f.includes('daily')) {
    return { label: 'Daily (morning)', timesPerWeek: 7 };
  }
  return {
    label: compoundRef?.defaultFrequency || 'Daily',
    timesPerWeek: compoundRef?.timesPerWeek || 7
  };
}

// ── Transform single Protocol into Canonical Unified Shape ───────────────────
export function homogenizeProtocol(rawDoc, docId = null) {
  const id = docId || rawDoc.id || rawDoc.protocol_id || 'protocol';
  const name = (rawDoc.name || rawDoc.title || rawDoc.protocol_title || 'Institutional Protocol').trim();
  const slug = rawDoc.slug || rawDoc.protocol_slug || id.toLowerCase().replace(/_/g, '-');
  const shortCode = (rawDoc.shortCode || rawDoc.short_code || rawDoc.code || id.toUpperCase()).replace(/_/g, '-');
  
  // Category resolution
  let category = rawDoc.category || rawDoc.therapeutic_category || rawDoc.categoryId || 'Regenerative';
  if (category === 'Weight Management' || category.toLowerCase().includes('weight') || category.toLowerCase().includes('metabolic')) {
    category = 'Weight Management';
  } else if (category.toLowerCase().includes('cognit') || category.toLowerCase().includes('neuro')) {
    category = 'Cognitive Support';
  } else if (category.toLowerCase().includes('energy') || category.toLowerCase().includes('mitochond')) {
    category = 'Energy & Metabolism';
  } else if (category.toLowerCase().includes('hormon')) {
    category = 'Hormonal Support';
  } else if (category.toLowerCase().includes('immune')) {
    category = 'Immune & Inflammation';
  } else if (category.toLowerCase().includes('long')) {
    category = 'Longevity';
  } else if (category.toLowerCase().includes('recovery') || category.toLowerCase().includes('tissue')) {
    category = 'Recovery & Tissue Repair';
  } else if (category.toLowerCase().includes('skin') || category.toLowerCase().includes('aesthet')) {
    category = 'Skin & Aesthetics';
  } else if (category.toLowerCase().includes('sleep')) {
    category = 'Sleep & Recovery';
  }

  // Raw phases array extraction (unified source)
  const rawPhases = Array.isArray(rawDoc.phases) && rawDoc.phases.length > 0
    ? rawDoc.phases
    : (Array.isArray(rawDoc.phase_blueprints) && rawDoc.phase_blueprints.length > 0 ? rawDoc.phase_blueprints : []);

  let cursorWeek = 1;
  const unifiedPhases = rawPhases.map((ph, pIdx) => {
    const phaseNumber = ph.phaseNumber || ph.phase_number || (pIdx + 1);
    const durationWeeks = Number(ph.durationWeeks || ph.duration_weeks || ph.default_duration_weeks || 4);
    const startWeek = ph.startWeek || ph.start_week || ph.default_start_week || cursorWeek;
    const endWeek = ph.endWeek || ph.end_week || (startWeek + durationWeeks - 1);
    cursorWeek = endWeek + 1;

    const phaseName = ph.phaseName || ph.phase_title || ph.name || `Phase ${phaseNumber}`;
    const objective = ph.objective || (Array.isArray(ph.clinical_purpose) ? ph.clinical_purpose.join(' · ') : '') || 'Therapeutic optimization and metabolic stabilization.';
    const instructions = ph.instructions || ph.transitionCriteria || 'Administer according to verified clinical schedule and maintain hydration.';

    // Extract raw compounds from any legacy key
    const rawCompounds = ph.compounds || ph.drugs || ph.drugs_used || ph.medications || [];

    const unifiedCompounds = rawCompounds.map((c, cIdx) => {
      const rawCName = c.name || c.product_name || c.product_title || c.compound || c.product_slug || c.id || '';
      const cRef = matchClinicalCompound(rawCName, c.product_slug || c.productId);

      // Determine clean clinical dosage
      let rawDoseVal = c.dosage || c.dose || c.weekly_dose || c.dose_logic?.starting_weekly_dose || c.dose_logic?.dose_per_administration;
      if (typeof rawDoseVal === 'string' && (rawDoseVal.includes('Consult') || rawDoseVal.trim() === '')) {
        rawDoseVal = null;
      }

      // If dose is missing, use phase-specific titration from reference
      let doseAmount = 1;
      let doseUnit = cRef?.defaultUnit || 'mg';

      if (rawDoseVal) {
        const parsed = parseDosageNumeric(rawDoseVal);
        doseAmount = parsed.amount;
        if (parsed.unit && ['mg', 'mcg', 'iu', 'ml', '%'].includes(parsed.unit)) {
          doseUnit = parsed.unit;
        }
      } else if (cRef) {
        // Clinical titration defaults by phase
        if (cRef.id === 'tirzepatide') {
          doseAmount = pIdx === 0 ? 2.5 : (pIdx === 1 ? 5.0 : 7.5);
        } else if (cRef.id === 'semaglutide') {
          doseAmount = pIdx === 0 ? 0.25 : (pIdx === 1 ? 0.5 : 1.0);
        } else if (cRef.id === 'retatrutide') {
          doseAmount = pIdx === 0 ? 2.0 : (pIdx === 1 ? 4.0 : 6.0);
        } else if (cRef.id === 'bpc-157') {
          doseAmount = 250;
          doseUnit = 'mcg';
        } else if (cRef.id === 'tb-500') {
          doseAmount = 2.0;
        } else if (cRef.id === 'mots-c') {
          doseAmount = pIdx === 0 ? 5.0 : 10.0;
        } else if (cRef.id === 'ss-31') {
          doseAmount = 2.0;
        } else if (cRef.id === 'dsip') {
          doseAmount = 100;
          doseUnit = 'mcg';
        } else if (cRef.id === 'ghk-cu') {
          doseAmount = 2.0;
        } else if (cRef.id === 'semax') {
          doseAmount = 300;
          doseUnit = 'mcg';
        } else if (cRef.id === 'selank') {
          doseAmount = 250;
          doseUnit = 'mcg';
        }
      }

      // Frequency resolution
      const rawFreq = c.frequency || c.dosing_frequency || c.dose_logic?.administration_frequency || cRef?.defaultFrequency;
      // Force compound-specific clinical frequencies where clinical consensus is absolute
      let freqObj = normalizeFrequencyString(rawFreq, cRef);
      if (cRef?.id === 'mots-c') {
        freqObj = { label: '3x weekly (Mon/Wed/Fri)', timesPerWeek: 3 };
      } else if (cRef?.id === 'tb-500') {
        freqObj = { label: '2x weekly (Mon/Thu)', timesPerWeek: 2 };
      } else if (cRef?.id === 'thymosin-alpha-1') {
        freqObj = { label: 'Twice weekly (Mon/Thu)', timesPerWeek: 2 };
      } else if (cRef?.id === 'tirzepatide' || cRef?.id === 'semaglutide' || cRef?.id === 'retatrutide' || cRef?.id === 'cagrilintide') {
        freqObj = { label: 'Once weekly', timesPerWeek: 1 };
      } else if (cRef?.id === 'cjc-1295' || cRef?.id === 'ipamorelin' || cRef?.id === 'tesamorelin') {
        freqObj = { label: '5 days on, 2 days off (bedtime)', timesPerWeek: 5 };
      }

      // Route resolution
      let route = c.route || c.dose_logic?.route_of_administration || cRef?.route || 'Subcutaneous';
      if (route.toLowerCase() === 'sc' || route.toLowerCase().includes('sub')) route = 'Subcutaneous';
      if (route.toLowerCase().includes('nasal')) route = 'Intranasal';
      if (route.toLowerCase().includes('oral')) route = 'Oral';
      if (route.toLowerCase().includes('top')) route = 'Topical';

      // Weekly dose calculation
      const weeklyAmount = Number((doseAmount * (freqObj.timesPerWeek >= 14 ? 14 : freqObj.timesPerWeek)).toFixed(2));
      const weeklyDoseStr = `${weeklyAmount} ${doseUnit}/wk`;

      const finalName = cRef?.name || (rawCName.trim() || 'Therapeutic Peptide');
      const finalId = cRef?.id || rawCName.toLowerCase().replace(/[^a-z0-9]/g, '-');

      return {
        id: finalId,
        product_id: finalId,
        product_slug: finalId,
        name: finalName,
        product_name: finalName,
        product_title: finalName,
        compound: finalName,
        dosage: `${doseAmount} ${doseUnit}`,
        dose: `${doseAmount} ${doseUnit} (${freqObj.label})`,
        doseAmount,
        dose_amount: doseAmount,
        doseUnit,
        dose_unit: doseUnit,
        frequency: freqObj.label,
        dosing_frequency: freqObj.label,
        frequencyTimesPerWeek: freqObj.timesPerWeek,
        weeklyDose: weeklyDoseStr,
        weekly_dose: weeklyDoseStr,
        weeklyDoseAmount: weeklyAmount,
        weekly_dose_amount: weeklyAmount,
        weeklyDoseUnit: doseUnit,
        weekly_dose_unit: doseUnit,
        route,
        dosageForm: cRef?.dosageForm || 'vial',
        timing: c.timing || cRef?.timing || 'Morning on empty stomach',
        storage: c.storage || cRef?.storage || 'Store at 2°C–8°C. Protect from light.',
        reconstitution: c.reconstitution || cRef?.reconstitution || {
          vialStrengthMg: cRef?.reconstitution?.vialStrengthMg || 5,
          diluentMl: 2.0,
          unitsPerDose: 10,
          finalConcentration: 'Standard'
        },
        clinicalNotes: c.clinicalNotes || cRef?.clinicalNotes || 'Verify reconstitution sterility and rotate injection sites.'
      };
    });

    return {
      id: `phase_${phaseNumber}`,
      name: phaseName,
      phaseName,
      phase_name: phaseName,
      phase_title: phaseName,
      phaseNumber,
      phase_number: phaseNumber,
      durationWeeks,
      duration_weeks: durationWeeks,
      default_duration_weeks: durationWeeks,
      startWeek,
      start_week: startWeek,
      endWeek,
      end_week: endWeek,
      objective,
      clinical_goal: objective,
      instructions,
      compounds: unifiedCompounds,
      drugs: unifiedCompounds // alias for 100% zero-breakage
    };
  });

  const totalDurationWeeks = unifiedPhases.reduce((acc, ph) => acc + (ph.durationWeeks || 0), 0) || rawDoc.durationWeeks || rawDoc.duration_weeks || 12;

  // Build unified BOM (Bill of Materials)
  const unifiedBom = [];
  unifiedPhases.forEach(ph => {
    ph.compounds.forEach(c => {
      const match = unifiedBom.find(b => b.productId === c.id);
      if (!match) {
        unifiedBom.push({
          productId: c.id,
          product_name: c.name,
          route: c.route,
          format: c.dosageForm,
          quantity: Math.ceil(totalDurationWeeks / 4)
        });
      }
    });
  });

  return {
    id,
    protocol_id: id,
    name,
    title: name,
    protocol_title: name,
    slug,
    protocol_slug: slug,
    shortCode,
    short_code: shortCode,
    category,
    therapeutic_category: category,
    categoryId: category,
    status: rawDoc.status || 'active',
    durationWeeks: totalDurationWeeks,
    duration_weeks: totalDurationWeeks,
    duration: `${totalDurationWeeks} Weeks`,
    primaryGoal: rawDoc.primaryGoal || rawDoc.primary_goal || rawDoc.goal || 'Therapeutic Cellular Optimization',
    primary_goal: rawDoc.primaryGoal || rawDoc.primary_goal || rawDoc.goal || 'Therapeutic Cellular Optimization',
    goals: Array.isArray(rawDoc.goals) && rawDoc.goals.length ? rawDoc.goals : [category.toLowerCase()],
    description: rawDoc.description || 'Clinical peptide protocol designed for cellular regeneration and systemic optimization.',
    clinicalRationale: rawDoc.clinicalRationale || rawDoc.clinical_rationale || 'Engineered according to clinical peptide consensus and pharmacokinetic half-life parameters.',
    clinical_rationale: rawDoc.clinicalRationale || rawDoc.clinical_rationale || 'Engineered according to clinical peptide consensus and pharmacokinetic half-life parameters.',
    evidenceLevel: rawDoc.evidenceLevel || rawDoc.evidence_level || 'Tier 2 - Clinical Trial / Cohort',
    evidence_level: rawDoc.evidenceLevel || rawDoc.evidence_level || 'Tier 2 - Clinical Trial / Cohort',
    evidenceGrade: rawDoc.evidenceGrade || rawDoc.evidence_grade || 'Tier 2',
    evidence_grade: rawDoc.evidenceGrade || rawDoc.evidence_grade || 'Tier 2',
    evidenceGradeNote: rawDoc.evidenceGradeNote || rawDoc.evidence_grade_note || 'Supported by peer-reviewed published clinical and preclinical literature.',
    evidence_grade_note: rawDoc.evidenceGradeNote || rawDoc.evidence_grade_note || 'Supported by peer-reviewed published clinical and preclinical literature.',
    requiredLabs: Array.isArray(rawDoc.requiredLabs || rawDoc.required_labs) ? (rawDoc.requiredLabs || rawDoc.required_labs) : ['Comprehensive Metabolic Panel (CMP)', 'CBC', 'Lipid Panel'],
    required_labs: Array.isArray(rawDoc.requiredLabs || rawDoc.required_labs) ? (rawDoc.requiredLabs || rawDoc.required_labs) : ['Comprehensive Metabolic Panel (CMP)', 'CBC', 'Lipid Panel'],
    monitoringPlan: Array.isArray(rawDoc.monitoringPlan || rawDoc.monitoring_plan) ? (rawDoc.monitoringPlan || rawDoc.monitoring_plan) : [
      { week: 0, title: 'Baseline Comprehensive Panel' },
      { week: Math.round(totalDurationWeeks / 2), title: 'Mid-Cycle Checkpoint & Tolerance' },
      { week: totalDurationWeeks, title: 'End-of-Cycle Outcome Review' }
    ],
    contraindications: Array.isArray(rawDoc.contraindications) && rawDoc.contraindications.length ? rawDoc.contraindications : [
      'Active malignancy or uninvestigated neoplastic lesions',
      'Pregnancy, planned conception, or lactation',
      'Severe hepatic impairment (Child-Pugh Class C) or end-stage renal disease'
    ],
    relativeCautions: Array.isArray(rawDoc.relativeCautions || rawDoc.relative_cautions) ? (rawDoc.relativeCautions || rawDoc.relative_cautions) : [
      'History of cardiac arrhythmia or severe hypertension',
      'Concurrent administration of insulin secretagogues without dose adjustment'
    ],
    expectedOutcomes: Array.isArray(rawDoc.expectedOutcomes || rawDoc.expected_outcomes) && (rawDoc.expectedOutcomes || rawDoc.expected_outcomes).length ? (rawDoc.expectedOutcomes || rawDoc.expected_outcomes) : [
      'Restoration of target cellular and metabolic signaling pathways',
      'Documented improvement in clinical biomarkers and subjective vigor',
      'Sustained systemic resilience and tissue regeneration'
    ],
    expected_outcomes: Array.isArray(rawDoc.expectedOutcomes || rawDoc.expected_outcomes) && (rawDoc.expectedOutcomes || rawDoc.expected_outcomes).length ? (rawDoc.expectedOutcomes || rawDoc.expected_outcomes) : [
      'Restoration of target cellular and metabolic signaling pathways',
      'Documented improvement in clinical biomarkers and subjective vigor',
      'Sustained systemic resilience and tissue regeneration'
    ],
    recommendedSupplements: rawDoc.recommendedSupplements || rawDoc.recommended_supplements || [
      { name: 'Electrolyte Hydration Complex', dose: '1 serving daily', rationale: 'Maintain intracellular osmolarity during peptide therapy' },
      { name: 'CoQ10 (Ubiquinol)', dose: '100 mg daily', rationale: 'Mitochondrial respiratory chain electron transport support' }
    ],
    recommended_supplements: rawDoc.recommendedSupplements || rawDoc.recommended_supplements || [
      { name: 'Electrolyte Hydration Complex', dose: '1 serving daily', rationale: 'Maintain intracellular osmolarity during peptide therapy' },
      { name: 'CoQ10 (Ubiquinol)', dose: '100 mg daily', rationale: 'Mitochondrial respiratory chain electron transport support' }
    ],
    bom: unifiedBom,
    phases: unifiedPhases,
    phasesCount: unifiedPhases.length,
    _schemaVersion: 2,
    _unifiedAt: new Date().toISOString()
  };
}
