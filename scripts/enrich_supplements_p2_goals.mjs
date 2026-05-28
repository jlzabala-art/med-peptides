#!/usr/bin/env node
/**
 * enrich_supplements_p2_goals.mjs  —  Phase 2
 *
 * Reads every document in Firestore `supplements/`, translates its legacy
 * `goals[]` array to the 7 canonical goals, and writes back `canonicalGoals[]`.
 *
 * - Keeps the original `goals` field untouched (audit trail).
 * - Idempotent — safe to re-run.
 * - Unknown legacy goals are logged and skipped (not silently dropped).
 *
 * Usage:
 *   node scripts/enrich_supplements_p2_goals.mjs --dry-run   # preview
 *   node scripts/enrich_supplements_p2_goals.mjs              # write
 *
 * Run AFTER Phase 1 (enrich_supplements_p1_seed.mjs).
 */

import { db } from './lib/firebase-admin.mjs';

const DRY_RUN = process.argv.includes('--dry-run');

// ── 7 Canonical Goals ─────────────────────────────────────────────────────────
const CANONICAL = new Set([
  'cognitive_mood',
  'hormonal_optimization',
  'immune_support',
  'longevity_anti_aging',
  'metabolic_weight',
  'recovery_repair',
  'sleep_circadian',
]);

// ── Legacy goal → canonical mapping (supplement-specific) ─────────────────────
// Covers all 26 legacy tags found in supplements.js + shared tags from products.
const GOAL_MAP = {
  // ── metabolic_weight ─────────────────────────────────────────
  blood_sugar:           'metabolic_weight',
  metabolic_blood_sugar: 'metabolic_weight',
  metabolism:            'metabolic_weight',
  weight_loss:           'metabolic_weight',
  energy:                'metabolic_weight',
  cardio_health:         'metabolic_weight',
  circulation:           'metabolic_weight',
  stamina:               'metabolic_weight',

  // ── recovery_repair ──────────────────────────────────────────
  recovery:              'recovery_repair',
  inflammation:          'recovery_repair',
  joint_health:          'recovery_repair',
  mobility:              'recovery_repair',
  amino_acids:           'recovery_repair',   // category used as goal tag

  // ── longevity_anti_aging ─────────────────────────────────────
  longevity:             'longevity_anti_aging',
  anti_aging:            'longevity_anti_aging',
  antioxidants:          'longevity_anti_aging',  // category used as goal tag
  vitamins_minerals:     'longevity_anti_aging',  // category used as goal tag

  // ── cognitive_mood ───────────────────────────────────────────
  brain_health:          'cognitive_mood',
  focus:                 'cognitive_mood',
  memory:                'cognitive_mood',
  neuroregeneration:     'cognitive_mood',
  sleep_mood:            'cognitive_mood',    // also sleep_circadian — added below

  // ── sleep_circadian ──────────────────────────────────────────
  sleep:                 'sleep_circadian',
  stress_reduction:      'sleep_circadian',

  // ── hormonal_optimization ────────────────────────────────────
  // (none specific yet in supplements.js — handled by shared map below)

  // ── shared / product map duplicates ──────────────────────────
  fat_loss:              'metabolic_weight',
  fat_burning:           'metabolic_weight',
  glucose_control:       'metabolic_weight',
  insulin_sensitivity:   'metabolic_weight',
  cardiovascular_health: 'metabolic_weight',
  healing:               'recovery_repair',
  muscle_recovery:       'recovery_repair',
  anti_inflammatory:     'recovery_repair',
  gut_health:            'recovery_repair',
  tissue_repair:         'recovery_repair',
  collagen_production:   'recovery_repair',
  bone_health:           'recovery_repair',
  skin_health:           'longevity_anti_aging',
  skin_elasticity:       'longevity_anti_aging',
  dna_repair:            'longevity_anti_aging',
  nad_precursor:         'longevity_anti_aging',
  mitochondrial_health:  'longevity_anti_aging',
  oxidative_stress:      'longevity_anti_aging',
  cellular_health:       'longevity_anti_aging',
  cognitive_enhancement: 'cognitive_mood',
  cognitive_function:    'cognitive_mood',
  neuroprotection:       'cognitive_mood',
  mental_clarity:        'cognitive_mood',
  anxiety_reduction:     'cognitive_mood',
  mood:                  'cognitive_mood',
  mood_enhancement:      'cognitive_mood',
  resilience:            'cognitive_mood',
  sleep_optimization:    'sleep_circadian',
  sleep_quality:         'sleep_circadian',
  deep_sleep:            'sleep_circadian',
  cortisol_regulation:   'sleep_circadian',
  immune_modulation:     'immune_support',
  immune_support:        'immune_support',
  immunity:              'immune_support',
  liver_health:          'immune_support',
  vascular_health:       'immune_support',
  muscle_growth:         'hormonal_optimization',
  muscle_mass:           'hormonal_optimization',
  testosterone_support:  'hormonal_optimization',
  libido:                'hormonal_optimization',
  sexual_health:         'hormonal_optimization',
  endurance:             'hormonal_optimization',
  strength:              'hormonal_optimization',
  anabolic:              'hormonal_optimization',
  performance:           'hormonal_optimization',
  bone_density:          'hormonal_optimization',
};

// Special multi-goal tags (one legacy tag → multiple canonical goals)
const MULTI_GOAL_MAP = {
  sleep_mood:            ['sleep_circadian', 'cognitive_mood'],
  stress_reduction:      ['sleep_circadian', 'cognitive_mood'],
  adaptogens_botanicals: ['sleep_circadian', 'recovery_repair', 'cognitive_mood'],
};

// ── Per-name overrides (for supplements with only goal:'other') ───────────────
// Keys are Firestore document IDs (slugs). Canonical goals are set directly.
const NAME_OVERRIDES = {
  // LDN (Low-Dose Naltrexone) — immune modulator, mood & pain
  'ldn':       ['immune_support', 'cognitive_mood', 'recovery_repair'],
  'ldn-0-5mg': ['immune_support', 'cognitive_mood', 'recovery_repair'],
  'ldn-1-5mg': ['immune_support', 'cognitive_mood', 'recovery_repair'],
  'ldn-2-5mg': ['immune_support', 'cognitive_mood', 'recovery_repair'],
  'ldn-4-5mg': ['immune_support', 'cognitive_mood', 'recovery_repair'],
  // DIM (Diindolylmethane) — estrogen metabolism, hormonal balance
  'dim':                    ['hormonal_optimization', 'longevity_anti_aging'],
  // Lycopene — antioxidant, prostate & cardiovascular
  'lycopene':               ['longevity_anti_aging', 'immune_support'],
  // Phosphatidylserine — cognitive support, cortisol regulation
  'phosphatidylserine':     ['cognitive_mood', 'sleep_circadian'],
  // Saw Palmetto — DHT blocker, prostate & male hormonal health
  'saw-palmetto':           ['hormonal_optimization'],
  // Spironolactone — androgen blocker, hormonal & cardiovascular
  'spironolactone':         ['hormonal_optimization', 'metabolic_weight'],
  // Tadalafil — PDE5 inhibitor, sexual health, cardiovascular
  'tadalafil':              ['hormonal_optimization', 'metabolic_weight'],
};

/** Translate an array of legacy goals to canonical goals */
function translateGoals(goals = []) {
  const result = new Set();
  const unknown = [];

  for (const g of goals) {
    if (CANONICAL.has(g)) {
      result.add(g);                            // already canonical
    } else if (MULTI_GOAL_MAP[g]) {
      for (const c of MULTI_GOAL_MAP[g]) result.add(c);
    } else if (GOAL_MAP[g]) {
      result.add(GOAL_MAP[g]);
    } else if (g === 'other' || g === 'none') {
      // intentionally ignored — no meaningful canonical target
    } else {
      unknown.push(g);
    }
  }
  return { canonical: [...result], unknown };
}

// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🔄  Supplement Goals — Phase 2`);
  console.log(`    Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE WRITE'}`);
  console.log('─────────────────────────────────────────────────\n');

  const snap = await db.collection('supplements').get();
  if (snap.empty) {
    console.error('❌  supplements/ collection is empty — run Phase 1 first.');
    process.exit(1);
  }

  console.log(`📋  Found ${snap.size} supplement documents.\n`);

  const allUnknown = new Set();
  let changed   = 0;
  let unchanged = 0;
  const batch   = db.batch();

  for (const doc of snap.docs) {
    const data = doc.data();
    const legacyGoals = Array.isArray(data.goals) ? data.goals : [];
    const existing    = Array.isArray(data.canonicalGoals) ? data.canonicalGoals : [];

    // Check name-based override first (for category:Other supplements)
    let canonical, unknown;
    if (NAME_OVERRIDES[doc.id]) {
      canonical = NAME_OVERRIDES[doc.id];
      unknown   = [];
    } else {
      ({ canonical, unknown } = translateGoals(legacyGoals));
    }
    unknown.forEach(u => allUnknown.add(u));

    const sameGoals =
      canonical.length === existing.length &&
      canonical.every(g => existing.includes(g));

    if (sameGoals) {
      unchanged++;
      continue;
    }

    changed++;
    console.log(`  📦  ${data.name || doc.id}`);
    console.log(`       legacy :  [${legacyGoals.join(', ')}]`);
    console.log(`       →      :  [${canonical.join(', ')}]`);
    if (unknown.length) {
      console.log(`       ⚠️  unmapped: ${unknown.join(', ')}`);
    }

    if (!DRY_RUN) {
      batch.update(doc.ref, {
        canonicalGoals: canonical,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  if (!DRY_RUN && changed > 0) {
    await batch.commit();
    console.log(`\n✅  Committed ${changed} supplement updates to Firestore.`);
  } else if (DRY_RUN) {
    console.log(`\n📋  DRY RUN — ${changed} would be updated, ${unchanged} already canonical.`);
  } else {
    console.log(`\n✅  All ${unchanged} supplements already have canonical goals.`);
  }

  if (allUnknown.size) {
    console.log(`\n⚠️  Unmapped legacy goals (add to GOAL_MAP if needed):`);
    for (const u of allUnknown) console.log(`    - ${u}`);
  } else {
    console.log('\n🎯  All legacy goals mapped successfully.');
  }

  console.log('\n🏁  Phase 2 complete — run Phase 3 (audit) to verify coverage.');
}

run().catch(err => { console.error('❌  Fatal:', err); process.exit(1); });
