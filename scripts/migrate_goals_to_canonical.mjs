/**
 * migrate_goals_to_canonical.mjs
 *
 * Migrates all active products in Firestore:
 *   - goals[]          → mapped to 7 canonical goals
 *   - secondaryFactors[] → mapped to 7 canonical goals
 *
 * Run (dry-run first):
 *   node scripts/migrate_goals_to_canonical.mjs --dry-run
 *
 * Run (write to Firestore):
 *   node scripts/migrate_goals_to_canonical.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

const DRY_RUN = process.argv.includes("--dry-run");

// ── 7 Canonical Goals ────────────────────────────────────────────────────────
const CANONICAL = new Set([
  "cognitive_mood",
  "hormonal_optimization",
  "immune_support",
  "longevity_anti_aging",
  "metabolic_weight",
  "recovery_repair",
  "sleep_circadian",
  "dosage", // utility, products only
]);

// ── Old goal → canonical mapping ────────────────────────────────────────────
// Each old token maps to exactly one canonical goal.
const GOAL_MAP = {
  // metabolic_weight
  fat_loss:              "metabolic_weight",
  fat_burning:           "metabolic_weight",
  lipolysis:             "metabolic_weight",
  weight_loss:           "metabolic_weight",
  metabolic_health:      "metabolic_weight",
  metabolism:            "metabolic_weight",
  glucose_control:       "metabolic_weight",
  insulin_sensitivity:   "metabolic_weight",
  cellular_energy:          "metabolic_weight",
  energy:                   "metabolic_weight",
  appetite_suppression:     "metabolic_weight",
  appetite_control:         "metabolic_weight",
  appetite_stimulation:     "metabolic_weight",
  targeted_fat_loss:        "metabolic_weight",
  body_composition:         "metabolic_weight",
  no_insulin_impact:        "metabolic_weight",
  obesity:                  "metabolic_weight",
  glycemic_control:         "metabolic_weight",
  blood_sugar:              "metabolic_weight",
  blood_sugar_regulation:   "metabolic_weight",
  cardiovascular_health:    "metabolic_weight",
  cardiovascular_protection:"metabolic_weight",
  low_energy:               "metabolic_weight",
  weight_control:           "metabolic_weight",
  metabolic_mimetic:        "metabolic_weight",
  muscle_stamina:           "metabolic_weight",
  energy_expenditure:       "metabolic_weight",

  // recovery_repair
  healing:               "recovery_repair",
  recovery:              "recovery_repair",
  long_acting_recovery:  "recovery_repair",
  muscle_recovery:       "recovery_repair",
  muscle_repair:         "recovery_repair",
  localized_growth:      "recovery_repair",
  stem_cell_proliferation: "recovery_repair",
  soreness_reduction:    "recovery_repair",
  tissue_repair:         "recovery_repair",
  injury_repair:         "recovery_repair",
  inflammation:          "recovery_repair",
  repair:                "recovery_repair",
  anti_inflammation:     "recovery_repair",
  anti_inflammatory:     "recovery_repair",
  angiogenesis:          "recovery_repair",
  nerve_repair:          "recovery_repair",
  pain_management:       "recovery_repair",
  gut_health:            "recovery_repair",
  joint_support:         "recovery_repair",
  tendon_repair:         "recovery_repair",
  wound_healing:         "recovery_repair",
  cellular_protection:   "recovery_repair",
  bone_health:           "recovery_repair",
  cartilage_repair:      "recovery_repair",
  joint_integrity:       "recovery_repair",
  musculoskeletal:       "recovery_repair",
  collagen_production:   "recovery_repair",

  // longevity_anti_aging
  longevity:                "longevity_anti_aging",
  anti_aging:               "longevity_anti_aging",
  epigenetic_regulation:    "longevity_anti_aging",
  telomere_lengthening:     "longevity_anti_aging",
  senescence:               "longevity_anti_aging",
  skin_health:              "longevity_anti_aging",
  skin_elasticity:          "longevity_anti_aging",
  skin_rejuvenation:        "longevity_anti_aging",
  skin_texture:             "longevity_anti_aging",
  skin_pigmentation:        "longevity_anti_aging",
  tanning:                  "longevity_anti_aging",
  sun_protection:           "longevity_anti_aging",
  facial_tension:           "longevity_anti_aging",
  smoothness:               "longevity_anti_aging",
  dermal_repair:            "longevity_anti_aging",
  anti_wrinkle:             "longevity_anti_aging",
  mitochondrial_health:     "longevity_anti_aging",
  mitochondrial_biogenesis: "longevity_anti_aging",
  mitochondrial_repair:     "longevity_anti_aging",
  dna_repair:               "longevity_anti_aging",
  nad_precursor:            "longevity_anti_aging",
  cellular_health:          "longevity_anti_aging",
  oxidative_stress:         "longevity_anti_aging",
  organ_health:             "longevity_anti_aging",
  organ_protection:         "longevity_anti_aging",
  well_being:               "longevity_anti_aging",
  vitality:                 "longevity_anti_aging",

  // cognitive_mood
  cognitive_enhancement:    "cognitive_mood",
  cognitive_function:       "cognitive_mood",
  cognitive_support:        "cognitive_mood",
  cognitive_stability:      "cognitive_mood",
  neuroprotection:          "cognitive_mood",
  neuropathy:               "cognitive_mood",
  nerve_regeneration:       "cognitive_mood",
  neuroplasticity:          "cognitive_mood",
  nootropic:                "cognitive_mood",
  focus:                    "cognitive_mood",
  memory:                   "cognitive_mood",
  memory_retention:         "cognitive_mood",
  mental_clarity:           "cognitive_mood",
  anxiety_reduction:        "cognitive_mood",
  anxiety_relief:           "cognitive_mood",
  anxiety_management:       "cognitive_mood",
  stress_resilience:        "cognitive_mood",
  stress_management:        "cognitive_mood",
  mood_stabilization:       "cognitive_mood",
  mood_enhancement:         "cognitive_mood",
  mood:                     "cognitive_mood",
  social_bonding:           "cognitive_mood",
  emotional_regulation:     "cognitive_mood",
  resilience:               "cognitive_mood",
  antidepressant_research:  "cognitive_mood",
  neuroendocrine_balance:   "cognitive_mood",

  // sleep_circadian
  sleep:                 "sleep_circadian",
  sleep_optimization:    "sleep_circadian",
  sleep_improvement:     "sleep_circadian",
  sleep_quality:         "sleep_circadian",
  stress_reduction:      "sleep_circadian",
  circadian:             "sleep_circadian",

  // immune_support
  immune_modulation:        "immune_support",
  immunity:                 "immune_support",
  antiviral:                "immune_support",
  antiviral_research:       "immune_support",
  immune_recovery:          "immune_support",
  immune_restoration:       "immune_support",
  immune_enhancement:       "immune_support",
  t_cell_balance:           "immune_support",
  t_cell_activation:        "immune_support",
  t_cell_maturation:        "immune_support",
  inflammation_control:     "immune_support",
  inflammation_reduction:   "immune_support",
  antimicrobial:            "immune_support",
  immune_support:           "immune_support",
  kidney_support:           "immune_support",
  liver_health:             "immune_support",
  vascular_health:          "immune_support",

  // hormonal_optimization
  gh_optimization:            "hormonal_optimization",
  hormonal_balance:           "hormonal_optimization",
  muscle_maintenance:         "hormonal_optimization",
  muscle_fullness:            "hormonal_optimization",
  anabolic:                   "hormonal_optimization",
  performance:                "hormonal_optimization",
  muscle_growth:              "hormonal_optimization",
  muscle_hypertrophy:         "hormonal_optimization",
  myostatin_inhibition:       "hormonal_optimization",
  strength_gain:              "hormonal_optimization",
  growth_hormone_elevation:   "hormonal_optimization",
  growth_hormone_secretion:   "hormonal_optimization",
  natural_gh_support:         "hormonal_optimization",
  appetite_increase:          "hormonal_optimization",
  fat_oxidation:              "hormonal_optimization",
  endurance:                  "hormonal_optimization",
  flexibility:                "hormonal_optimization",
  cardiovascular_performance: "hormonal_optimization",
  heart_health:               "hormonal_optimization",
  cardiovascular_repair:      "hormonal_optimization",
  // sexual & male health → hormonal_optimization
  libido:                     "hormonal_optimization",
  libido_increase:            "hormonal_optimization",
  libido_enhancement:         "hormonal_optimization",
  arousal:                    "hormonal_optimization",
  sexual_health:              "hormonal_optimization",
  confidence:                 "hormonal_optimization",
  male_health:                "hormonal_optimization",
  male_fertility:             "hormonal_optimization",
  testicular_health:          "hormonal_optimization",
  spermatogenesis:            "hormonal_optimization",
  prostate_health:            "hormonal_optimization",
  urinary_function:           "hormonal_optimization",
  bone_density:               "hormonal_optimization",

  // dosage / utility (keep as-is, products-only)
  dosage:                "dosage",
  reconstitution:        "dosage",
  stability:             "dosage",
  sterility:             "dosage",
  administration:        "dosage",
  precise_dosing:        "dosage",
  // cancer research — map to longevity as nearest concept
  cancer_research:       "longevity_anti_aging",
  tumor_necrosis:        "longevity_anti_aging",
  antitumor:             "longevity_anti_aging",
  selective_cytotoxicity:"longevity_anti_aging",
  // pain → recovery
  pain_reduction:        "recovery_repair",
  // final batch — all remaining vocabulary found in Firestore
  glucagon_suppression:        "metabolic_weight",
  early_satiety:               "metabolic_weight",
  cholesterol_management:      "metabolic_weight",
  metabolism_boost:            "metabolic_weight",
  blood_flow:                  "metabolic_weight",
  cardiac_resilience:          "metabolic_weight",
  stamina:                     "hormonal_optimization",
  muscle_mass:                 "hormonal_optimization",
  muscle_mass_retention:       "hormonal_optimization",
  muscle_density:              "hormonal_optimization",
  muscle_hyperplasia:          "hormonal_optimization",
  performance_enhancement:     "hormonal_optimization",
  strength:                    "hormonal_optimization",
  growth:                      "hormonal_optimization",
  bone_strength:               "hormonal_optimization",
  testosterone_support:        "hormonal_optimization",
  testosterone_stimulation:    "hormonal_optimization",
  fertility:                   "hormonal_optimization",
  fertility_enhancement:       "hormonal_optimization",
  follicular_growth:           "hormonal_optimization",
  hormonal_health:             "hormonal_optimization",
  reproductive_research:       "hormonal_optimization",
  hpta_reset:                  "hormonal_optimization",
  hpta_restart:                "hormonal_optimization",
  maximal_gh_pulse:            "hormonal_optimization",
  growth_hormone_release:      "hormonal_optimization",
  nutrient_partitioning:       "hormonal_optimization",
  deep_sleep:                  "sleep_circadian",
  cortisol_regulation:         "sleep_circadian",
  circadian_rhythm:            "sleep_circadian",
  hair_growth:                 "longevity_anti_aging",
  scalp_health:                "longevity_anti_aging",
  fine_lines:                  "longevity_anti_aging",
  rejuvenation:                "longevity_anti_aging",
  acne_reduction:              "longevity_anti_aging",
  skin_repair:                 "longevity_anti_aging",
  cellular_regeneration:       "longevity_anti_aging",
  aging_joints:                "recovery_repair",
  heavy_repair:                "recovery_repair",
  deep_tissue_repair:          "recovery_repair",
  gut_healing:                 "recovery_repair",
  digestive_health:            "recovery_repair",
  tissue_regeneration:         "recovery_repair",
  emotional_health:            "cognitive_mood",
  trust:                       "cognitive_mood",
};

// ── Helper: translate an array of goals ──────────────────────────────────────
function translateGoals(goals = []) {
  const result = new Set();
  for (const g of goals) {
    if (CANONICAL.has(g)) {
      result.add(g); // already canonical
    } else if (GOAL_MAP[g]) {
      result.add(GOAL_MAP[g]);
    } else {
      // Unknown — log it, skip it
      console.warn(`  ⚠️  Unknown goal "${g}" — no mapping found, skipping`);
    }
  }
  return [...result];
}

// ─────────────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log(`\n🔄 Goal Migration — ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE WRITE"}`);
  console.log("────────────────────────────────────────────────\n");

  const snap = await db.collection("products").where("isActive", "==", true).get();
  const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));

  console.log(`Total active products: ${docs.length}\n`);

  let changed = 0;
  let unchanged = 0;
  const batch = db.batch();

  for (const doc of docs) {
    const oldGoals = doc.goals || [];
    const oldSecondary = doc.secondaryFactors || [];

    const newGoals = translateGoals(oldGoals);
    const newSecondary = translateGoals(oldSecondary);

    const goalsChanged = JSON.stringify(oldGoals.sort()) !== JSON.stringify(newGoals.sort());
    const secondaryChanged = JSON.stringify(oldSecondary.sort()) !== JSON.stringify(newSecondary.sort());

    if (!goalsChanged && !secondaryChanged) {
      unchanged++;
      continue;
    }

    changed++;
    console.log(`  📦 ${doc.name || doc.id}`);
    if (goalsChanged) {
      console.log(`     goals:           [${oldGoals.join(", ")}]`);
      console.log(`                  →  [${newGoals.join(", ")}]`);
    }
    if (secondaryChanged) {
      console.log(`     secondaryFactors:[${oldSecondary.join(", ")}]`);
      console.log(`                  →  [${newSecondary.join(", ")}]`);
    }

    if (!DRY_RUN) {
      const update = {};
      if (goalsChanged) update.goals = newGoals;
      if (secondaryChanged) update.secondaryFactors = newSecondary;
      batch.update(doc.ref, update);
    }
  }

  if (!DRY_RUN && changed > 0) {
    await batch.commit();
    console.log(`\n✅ Committed ${changed} product updates to Firestore.`);
  } else if (DRY_RUN) {
    console.log(`\n📋 DRY RUN complete — ${changed} products would be updated, ${unchanged} already canonical.`);
  } else {
    console.log(`\n✅ Nothing to update — all ${unchanged} products already use canonical goals.`);
  }
}

migrate().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
