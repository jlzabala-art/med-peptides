/**
 * patchAllBlueprints.mjs
 *
 * Fills missing dose values (from clinical/research literature) and
 * metadata.intensity for all 16 blueprints in Firestore.
 *
 * Literature sources:
 *  - GLP-1s: SURMOUNT, STEP, OASIS, Phase-2 Retatrutide trials
 *  - Peptides: PubMed, clinicaltrials.gov, published research protocols
 *
 * Run: node scripts/patchAllBlueprints.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const sa = require('../serviceAccountKey.json');

const app = initializeApp({ credential: cert(sa) });
const db = getFirestore(app);

// ─────────────────────────────────────────────────────────────────────────────
// CLINICAL DOSE REFERENCE TABLE
// Format: compound name (lowercase) → { phase (1-based) → dose_logic patch }
// ─────────────────────────────────────────────────────────────────────────────
const DOSE_REF = {
  // ── GLP-1 / Metabolic ────────────────────────────────────────────────────
  tirzepatide: {
    1: { starting_weekly_dose: 2.5, dose_per_administration: 2.5, dose_unit: 'mg', administration_frequency: 'weekly' },
    2: { starting_weekly_dose: 5,   dose_per_administration: 5,   dose_unit: 'mg', administration_frequency: 'weekly' },
    3: { starting_weekly_dose: 7.5, dose_per_administration: 7.5, dose_unit: 'mg', administration_frequency: 'weekly', max_weekly_dose: 10 },
  },
  semaglutide: {
    1: { starting_weekly_dose: 0.25, dose_per_administration: 0.25, dose_unit: 'mg', administration_frequency: 'weekly' },
    2: { starting_weekly_dose: 0.5,  dose_per_administration: 0.5,  dose_unit: 'mg', administration_frequency: 'weekly' },
    3: { starting_weekly_dose: 1,    dose_per_administration: 1,    dose_unit: 'mg', administration_frequency: 'weekly', max_weekly_dose: 2 },
  },
  cagrilintide: {
    1: { starting_weekly_dose: 0.16, dose_per_administration: 0.16, dose_unit: 'mg', administration_frequency: 'weekly' },
    2: { starting_weekly_dose: 0.3,  dose_per_administration: 0.3,  dose_unit: 'mg', administration_frequency: 'weekly' },
    3: { starting_weekly_dose: 0.6,  dose_per_administration: 0.6,  dose_unit: 'mg', administration_frequency: 'weekly', max_weekly_dose: 0.6 },
  },
  retatrutide: {
    1: { starting_weekly_dose: 1,  dose_per_administration: 1,  dose_unit: 'mg', administration_frequency: 'weekly' },
    2: { starting_weekly_dose: 4,  dose_per_administration: 4,  dose_unit: 'mg', administration_frequency: 'weekly' },
    3: { starting_weekly_dose: 8,  dose_per_administration: 8,  dose_unit: 'mg', administration_frequency: 'weekly', max_weekly_dose: 12 },
  },

  // ── Mitochondrial / Energy ───────────────────────────────────────────────
  'mots-c': {
    1: { dose_per_administration: 5,  starting_weekly_dose: 10, dose_unit: 'mg', administration_frequency: '2x_week' },
    2: { dose_per_administration: 5,  starting_weekly_dose: 15, dose_unit: 'mg', administration_frequency: '3x_week' },
    3: { dose_per_administration: 5,  starting_weekly_dose: 10, dose_unit: 'mg', administration_frequency: '2x_week' },
  },
  elamipretide: {
    1: { dose_per_administration: 10, starting_weekly_dose: 70, dose_unit: 'mg', administration_frequency: 'daily' },
    2: { dose_per_administration: 10, starting_weekly_dose: 70, dose_unit: 'mg', administration_frequency: 'daily' },
    3: { dose_per_administration: 5,  starting_weekly_dose: 35, dose_unit: 'mg', administration_frequency: 'daily' },
  },

  // ── Immune ────────────────────────────────────────────────────────────────
  'thymosin alpha-1': {
    1: { dose_per_administration: 1.6, starting_weekly_dose: 3.2, dose_unit: 'mg', administration_frequency: '2x_week' },
    2: { dose_per_administration: 1.6, starting_weekly_dose: 3.2, dose_unit: 'mg', administration_frequency: '2x_week' },
    3: { dose_per_administration: 1.6, starting_weekly_dose: 1.6, dose_unit: 'mg', administration_frequency: 'weekly' },
  },
  'thymosin beta-4': {
    1: { dose_per_administration: 2,   starting_weekly_dose: 4,   dose_unit: 'mg', administration_frequency: '2x_week' },
    2: { dose_per_administration: 2.5, starting_weekly_dose: 5,   dose_unit: 'mg', administration_frequency: '2x_week' },
    3: { dose_per_administration: 2,   starting_weekly_dose: 2,   dose_unit: 'mg', administration_frequency: 'weekly' },
  },
  'bpc-157': {
    1: { dose_per_administration: 500, starting_weekly_dose: 3500, dose_unit: 'mcg', administration_frequency: 'daily' },
    2: { dose_per_administration: 500, starting_weekly_dose: 3500, dose_unit: 'mcg', administration_frequency: 'daily' },
    3: { dose_per_administration: 250, starting_weekly_dose: 1750, dose_unit: 'mcg', administration_frequency: 'daily' },
  },

  // ── Hormonal / Reproductive ───────────────────────────────────────────────
  kisspeptin: {
    1: { dose_per_administration: 1,   starting_weekly_dose: 14,  dose_unit: 'mcg/kg', administration_frequency: '2x_daily' },
    2: { dose_per_administration: 1,   starting_weekly_dose: 14,  dose_unit: 'mcg/kg', administration_frequency: '2x_daily' },
    3: { dose_per_administration: 1,   starting_weekly_dose: 7,   dose_unit: 'mcg/kg', administration_frequency: 'daily' },
  },
  gonadorelin: {
    1: { dose_per_administration: 100, starting_weekly_dose: 200, dose_unit: 'mcg', administration_frequency: '2x_week' },
    2: { dose_per_administration: 100, starting_weekly_dose: 300, dose_unit: 'mcg', administration_frequency: '3x_week' },
    3: { dose_per_administration: 100, starting_weekly_dose: 200, dose_unit: 'mcg', administration_frequency: '2x_week' },
  },

  // ── GH Axis ──────────────────────────────────────────────────────────────
  sermorelin: {
    1: { dose_per_administration: 200, starting_weekly_dose: 1400, dose_unit: 'mcg', administration_frequency: 'nightly' },
    2: { dose_per_administration: 300, starting_weekly_dose: 2100, dose_unit: 'mcg', administration_frequency: 'nightly' },
    3: { dose_per_administration: 200, starting_weekly_dose: 1400, dose_unit: 'mcg', administration_frequency: 'nightly' },
  },
  ipamorelin: {
    1: { dose_per_administration: 200, starting_weekly_dose: 1400, dose_unit: 'mcg', administration_frequency: 'nightly' },
    2: { dose_per_administration: 300, starting_weekly_dose: 2100, dose_unit: 'mcg', administration_frequency: 'nightly' },
    3: { dose_per_administration: 200, starting_weekly_dose: 1400, dose_unit: 'mcg', administration_frequency: 'nightly' },
  },

  // ── Skin / Aesthetics ────────────────────────────────────────────────────
  'ghk-cu': {
    1: { dose_per_administration: 2, starting_weekly_dose: 6,  dose_unit: 'mg', administration_frequency: '3x_week' },
    2: { dose_per_administration: 2, starting_weekly_dose: 6,  dose_unit: 'mg', administration_frequency: '3x_week' },
    3: { dose_per_administration: 1, starting_weekly_dose: 3,  dose_unit: 'mg', administration_frequency: '3x_week' },
  },

  // ── Cognitive ────────────────────────────────────────────────────────────
  semax: {
    1: { dose_per_administration: 600, starting_weekly_dose: 4200, dose_unit: 'mcg', administration_frequency: 'daily', route_detail: 'intranasal' },
    2: { dose_per_administration: 600, starting_weekly_dose: 4200, dose_unit: 'mcg', administration_frequency: 'daily', route_detail: 'intranasal' },
    3: { dose_per_administration: 400, starting_weekly_dose: 2800, dose_unit: 'mcg', administration_frequency: 'daily', route_detail: 'intranasal' },
  },
  selank: {
    1: { dose_per_administration: 750, starting_weekly_dose: 5250, dose_unit: 'mcg', administration_frequency: 'daily', route_detail: 'intranasal' },
    2: { dose_per_administration: 750, starting_weekly_dose: 5250, dose_unit: 'mcg', administration_frequency: 'daily', route_detail: 'intranasal' },
    3: { dose_per_administration: 500, starting_weekly_dose: 3500, dose_unit: 'mcg', administration_frequency: 'daily', route_detail: 'intranasal' },
  },

  // ── Longevity / Circadian ────────────────────────────────────────────────
  epitalon: {
    1: { dose_per_administration: 5, starting_weekly_dose: 35, dose_unit: 'mg', administration_frequency: 'daily', cycle_note: '10-day cycle, then off' },
    2: { dose_per_administration: 5, starting_weekly_dose: 35, dose_unit: 'mg', administration_frequency: 'daily', cycle_note: '10-day cycle, then off' },
    3: { dose_per_administration: 5, starting_weekly_dose: 35, dose_unit: 'mg', administration_frequency: 'daily', cycle_note: '10-day cycle maintenance' },
  },
  dsip: {
    1: { dose_per_administration: 0.5, starting_weekly_dose: 3.5, dose_unit: 'mg', administration_frequency: 'nightly' },
    2: { dose_per_administration: 0.5, starting_weekly_dose: 3.5, dose_unit: 'mg', administration_frequency: 'nightly' },
    3: { dose_per_administration: 0.25, starting_weekly_dose: 1.75, dose_unit: 'mg', administration_frequency: 'nightly' },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// METADATA PATCHES (intensity + expected_outcomes for sa_001)
// ─────────────────────────────────────────────────────────────────────────────
const META_PATCHES = {
  met_001:    { intensity: 'moderate' },
  wm_001:     { intensity: 'moderate' },
  wm_002:     { intensity: 'high' },
  wm_003:     { intensity: 'high' },
  wm_004:     { intensity: 'moderate' },
  lon_001:    { intensity: 'low' },
  lon_002:    { intensity: 'low' },
  energy_001: { intensity: 'moderate' },
  energy_002: { intensity: 'moderate' },
  horm_001:   { intensity: 'moderate' },
  horm_002:   { intensity: 'moderate' },
  immune_001: { intensity: 'moderate' },
  immune_002: { intensity: 'moderate' },
  cog_001:    { intensity: 'low' },
  cog_002:    { intensity: 'low' },
  sa_001:     { intensity: 'low' },
};

const SA001_OUTCOMES = [
  'Improved skin elasticity and collagen density',
  'Reduction in fine lines and wound healing support',
  'Enhanced dermal regeneration and tissue repair',
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — match compound name against DOSE_REF keys
// ─────────────────────────────────────────────────────────────────────────────
function matchDoseRef(drugName) {
  const lower = (drugName || '').toLowerCase().trim();
  for (const key of Object.keys(DOSE_REF)) {
    if (lower.includes(key)) return DOSE_REF[key];
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  const snap = await db.collection('blueprints').get();
  console.log(`\nPatching ${snap.size} blueprints...\n`);

  let totalDosingPatched = 0;
  let totalSkipped = 0;

  for (const docSnap of snap.docs) {
    const docId = docSnap.id;
    const data  = docSnap.data();
    const phases = data.phase_blueprints || data.phases || [];
    let modified = false;

    // ── 1. Patch dose_logic for each drug in each phase ───────────────────
    const patchedPhases = phases.map((ph, phaseIdx) => {
      const phaseNum = phaseIdx + 1;
      const drugs = (ph.drugs || []).map(drug => {
        const dname = drug.product_title || drug.name || drug.compound || '';
        const ref   = matchDoseRef(dname);
        if (!ref || !ref[phaseNum]) {
          totalSkipped++;
          return drug;
        }
        const patch   = ref[phaseNum];
        const current = drug.dose_logic || {};

        // Only patch missing fields — never overwrite existing numeric doses
        const hasNumericDose =
          (current.starting_weekly_dose && current.starting_weekly_dose !== 'protocol_defined') ||
          (current.dose_per_administration && current.dose_per_administration !== 'protocol_defined');

        if (hasNumericDose &&
            current.dose_unit && current.dose_unit !== 'protocol_defined' &&
            current.dose_unit !== undefined) {
          totalSkipped++;
          return drug; // already complete
        }

        totalDosingPatched++;
        modified = true;
        return {
          ...drug,
          dose_logic: { ...current, ...patch },
        };
      });
      return { ...ph, drugs };
    });

    // ── 2. Patch metadata.intensity ───────────────────────────────────────
    const metaPatch = META_PATCHES[docId];
    const currentMeta = data.metadata || {};
    let metadataUpdate = null;
    if (metaPatch && !currentMeta.intensity) {
      metadataUpdate = { ...currentMeta, ...metaPatch };
      modified = true;
    }

    // ── 3. expected_outcomes for sa_001 ──────────────────────────────────
    let outcomesUpdate = null;
    if (docId === 'sa_001' && !data.expected_outcomes) {
      outcomesUpdate = SA001_OUTCOMES;
      modified = true;
    }

    if (!modified) {
      console.log(`  ✓ ${docId} — no changes needed`);
      continue;
    }

    // ── Build update payload ──────────────────────────────────────────────
    const update = { phase_blueprints: patchedPhases };
    if (metadataUpdate)  update.metadata       = metadataUpdate;
    if (outcomesUpdate)  update.expected_outcomes = outcomesUpdate;

    await db.collection('blueprints').doc(docId).update(update);
    console.log(`  ✅ ${docId} — patched`);
  }

  console.log(`\nDone. Drug-phase doses patched: ${totalDosingPatched} | Skipped (already set): ${totalSkipped}`);
  process.exit(0);
}

run().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
