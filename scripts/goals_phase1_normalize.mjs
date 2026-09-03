/**
 * goals_phase1_normalize.mjs
 *
 * Phase 1 of Goals Migration:
 *   1. Read all products that have goals[] or goalIds[]
 *   2. Map non-canonical values → 13 canonical goals (from catalogFilters.js)
 *   3. Consolidate into unified goalIds[] field
 *   4. Remove legacy goals[] field
 *
 * Usage:
 *   node scripts/goals_phase1_normalize.mjs --dry-run   (preview only)
 *   node scripts/goals_phase1_normalize.mjs              (write to Firestore)
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "serviceAccountKey.json"), "utf8")
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const DRY_RUN = process.argv.includes("--dry-run");

// ── 13 Canonical Goals (from catalogFilters.js) ─────────────────────────────
const CANONICAL_GOALS = new Set([
  "weight_loss_glp1",
  "metabolic_health",
  "anti_aging_longevity",
  "recovery_healing",
  "cognitive_mood",
  "hormonal_optimization",
  "fertility",
  "immune_support",
  "skin_hair_aesthetics",
  "performance_muscle",
  "biomarkers",
  "genomics",
  "general_wellness",
]);

// ── Mapping: old/non-canonical values → canonical goal IDs ──────────────────
// This comprehensive map covers all 30+ non-canonical values found in the audit
// plus the old 7-goal system IDs.
const GOAL_MAP = {
  // ─── Old 7-goal system IDs → new 13-goal IDs ───
  "metabolic_weight":       "metabolic_health",
  "metabolic & weight":     "metabolic_health",
  "longevity_anti_aging":   "anti_aging_longevity",
  "longevity & anti-aging": "anti_aging_longevity",
  "recovery_repair":        "recovery_healing",
  "recovery & repair":      "recovery_healing",
  "sleep_circadian":        "cognitive_mood",          // sleep merged into cognitive_mood
  "performance & muscle":   "performance_muscle",
  "skin & hair":            "skin_hair_aesthetics",

  // ─── weight_loss_glp1 ───
  weight_loss:              "weight_loss_glp1",
  fat_loss:                 "weight_loss_glp1",
  fat_burning:              "weight_loss_glp1",
  lipolysis:                "weight_loss_glp1",
  glp1:                     "weight_loss_glp1",
  "glp-1":                  "weight_loss_glp1",
  appetite_suppression:     "weight_loss_glp1",
  appetite_control:         "weight_loss_glp1",
  targeted_fat_loss:        "weight_loss_glp1",
  body_composition:         "weight_loss_glp1",
  obesity:                  "weight_loss_glp1",
  early_satiety:            "weight_loss_glp1",
  glucagon_suppression:     "weight_loss_glp1",

  // ─── metabolic_health ───
  metabolism:               "metabolic_health",
  metabolic_health:         "metabolic_health",
  glucose_control:          "metabolic_health",
  insulin_sensitivity:      "metabolic_health",
  blood_sugar:              "metabolic_health",
  blood_sugar_regulation:   "metabolic_health",
  glycemic_control:         "metabolic_health",
  cholesterol_management:   "metabolic_health",
  cardiovascular_health:    "metabolic_health",
  cardiovascular_protection:"metabolic_health",
  cardiac_resilience:       "metabolic_health",
  blood_flow:               "metabolic_health",
  vascular_health:          "metabolic_health",
  circulation:              "metabolic_health",
  cardio_health:            "metabolic_health",
  metabolic_mimetic:        "metabolic_health",
  metabolic_blood_sugar:    "metabolic_health",
  no_insulin_impact:        "metabolic_health",
  cellular_energy:          "metabolic_health",
  metabolism_boost:         "metabolic_health",
  nutrient_partitioning:    "metabolic_health",

  // ─── anti_aging_longevity ───
  longevity:                "anti_aging_longevity",
  anti_aging:               "anti_aging_longevity",
  aging:                    "anti_aging_longevity",
  epigenetic_regulation:    "anti_aging_longevity",
  telomere_lengthening:     "anti_aging_longevity",
  senescence:               "anti_aging_longevity",
  mitochondrial_health:     "anti_aging_longevity",
  mitochondrial_biogenesis: "anti_aging_longevity",
  mitochondrial_repair:     "anti_aging_longevity",
  dna_repair:               "anti_aging_longevity",
  nad_precursor:            "anti_aging_longevity",
  cellular_health:          "anti_aging_longevity",
  cellular_regeneration:    "anti_aging_longevity",
  oxidative_stress:         "anti_aging_longevity",
  organ_health:             "anti_aging_longevity",
  organ_protection:         "anti_aging_longevity",
  well_being:               "anti_aging_longevity",
  vitality:                 "anti_aging_longevity",
  rejuvenation:             "anti_aging_longevity",
  cancer_research:          "anti_aging_longevity",
  tumor_necrosis:           "anti_aging_longevity",
  antitumor:                "anti_aging_longevity",
  selective_cytotoxicity:   "anti_aging_longevity",

  // ─── recovery_healing ───
  recovery:                 "recovery_healing",
  healing:                  "recovery_healing",
  long_acting_recovery:     "recovery_healing",
  muscle_recovery:          "recovery_healing",
  muscle_repair:            "recovery_healing",
  tissue_repair:            "recovery_healing",
  tissue_regeneration:      "recovery_healing",
  injury_repair:            "recovery_healing",
  inflammation:             "recovery_healing",
  anti_inflammation:        "recovery_healing",
  anti_inflammatory:        "recovery_healing",
  inflammation_control:     "recovery_healing",
  inflammation_reduction:   "recovery_healing",
  repair:                   "recovery_healing",
  angiogenesis:             "recovery_healing",
  nerve_repair:             "recovery_healing",
  pain_management:          "recovery_healing",
  pain_reduction:           "recovery_healing",
  gut_health:               "recovery_healing",
  gut_healing:              "recovery_healing",
  digestive_health:         "recovery_healing",
  joint_support:            "recovery_healing",
  joint_health:             "recovery_healing",
  joint_integrity:          "recovery_healing",
  mobility:                 "recovery_healing",
  tendon_repair:            "recovery_healing",
  bone_health:              "recovery_healing",
  cartilage_repair:         "recovery_healing",
  musculoskeletal:          "recovery_healing",
  collagen_production:      "recovery_healing",
  cellular_protection:      "recovery_healing",
  aging_joints:             "recovery_healing",
  heavy_repair:             "recovery_healing",
  deep_tissue_repair:       "recovery_healing",
  stem_cell_proliferation:  "recovery_healing",
  localized_growth:         "recovery_healing",
  soreness_reduction:       "recovery_healing",
  wound_healing:            "recovery_healing",

  // ─── cognitive_mood ───
  cognitive:                "cognitive_mood",
  cognitive_enhancement:    "cognitive_mood",
  cognitive_function:       "cognitive_mood",
  cognitive_support:        "cognitive_mood",
  cognitive_stability:      "cognitive_mood",
  focus:                    "cognitive_mood",
  memory:                   "cognitive_mood",
  memory_retention:         "cognitive_mood",
  mental_clarity:           "cognitive_mood",
  brain_health:             "cognitive_mood",
  neuroregeneration:        "cognitive_mood",
  neuroprotection:          "cognitive_mood",
  neuropathy:               "cognitive_mood",
  nerve_regeneration:       "cognitive_mood",
  neuroplasticity:          "cognitive_mood",
  nootropic:                "cognitive_mood",
  anxiety_reduction:        "cognitive_mood",
  anxiety_relief:           "cognitive_mood",
  anxiety_management:       "cognitive_mood",
  stress_resilience:        "cognitive_mood",
  stress_management:        "cognitive_mood",
  stress_reduction:         "cognitive_mood",
  mood_stabilization:       "cognitive_mood",
  mood_enhancement:         "cognitive_mood",
  mood:                     "cognitive_mood",
  social_bonding:           "cognitive_mood",
  emotional_regulation:     "cognitive_mood",
  emotional_health:         "cognitive_mood",
  resilience:               "cognitive_mood",
  antidepressant_research:  "cognitive_mood",
  neuroendocrine_balance:   "cognitive_mood",
  trust:                    "cognitive_mood",
  sleep:                    "cognitive_mood",
  sleep_optimization:       "cognitive_mood",
  sleep_improvement:        "cognitive_mood",
  sleep_quality:            "cognitive_mood",
  sleep_mood:               "cognitive_mood",
  deep_sleep:               "cognitive_mood",
  cortisol_regulation:      "cognitive_mood",
  circadian:                "cognitive_mood",
  circadian_rhythm:         "cognitive_mood",

  // ─── hormonal_optimization ───
  hormonal:                 "hormonal_optimization",
  hormonal_balance:         "hormonal_optimization",
  hormonal_health:          "hormonal_optimization",
  gh_optimization:          "hormonal_optimization",
  growth_hormone_elevation: "hormonal_optimization",
  growth_hormone_secretion: "hormonal_optimization",
  growth_hormone_release:   "hormonal_optimization",
  natural_gh_support:       "hormonal_optimization",
  maximal_gh_pulse:         "hormonal_optimization",
  testosterone_support:     "hormonal_optimization",
  testosterone_stimulation: "hormonal_optimization",
  hpta_reset:               "hormonal_optimization",
  hpta_restart:             "hormonal_optimization",

  // ─── fertility ───
  fertility:                "fertility",
  fertility_enhancement:    "fertility",
  male_fertility:           "fertility",
  spermatogenesis:          "fertility",
  follicular_growth:        "fertility",
  reproductive_research:    "fertility",

  // ─── immune_support ───
  immune:                   "immune_support",
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
  antimicrobial:            "immune_support",
  kidney_support:           "immune_support",
  liver_health:             "immune_support",

  // ─── skin_hair_aesthetics ───
  skin_health:              "skin_hair_aesthetics",
  skin_elasticity:          "skin_hair_aesthetics",
  skin_rejuvenation:        "skin_hair_aesthetics",
  skin_texture:             "skin_hair_aesthetics",
  skin_pigmentation:        "skin_hair_aesthetics",
  skin_repair:              "skin_hair_aesthetics",
  skin:                     "skin_hair_aesthetics",
  tanning:                  "skin_hair_aesthetics",
  sun_protection:           "skin_hair_aesthetics",
  facial_tension:           "skin_hair_aesthetics",
  smoothness:               "skin_hair_aesthetics",
  dermal_repair:            "skin_hair_aesthetics",
  anti_wrinkle:             "skin_hair_aesthetics",
  fine_lines:               "skin_hair_aesthetics",
  acne_reduction:           "skin_hair_aesthetics",
  hair:                     "skin_hair_aesthetics",
  hair_growth:              "skin_hair_aesthetics",
  scalp_health:             "skin_hair_aesthetics",
  aesthetics:               "skin_hair_aesthetics",
  beauty:                   "skin_hair_aesthetics",

  // ─── performance_muscle ───
  performance:              "performance_muscle",
  performance_enhancement:  "performance_muscle",
  muscle_growth:            "performance_muscle",
  muscle_hypertrophy:       "performance_muscle",
  muscle_hyperplasia:       "performance_muscle",
  muscle_mass:              "performance_muscle",
  muscle_mass_retention:    "performance_muscle",
  muscle_density:           "performance_muscle",
  muscle_maintenance:       "performance_muscle",
  muscle_fullness:          "performance_muscle",
  muscle_stamina:           "performance_muscle",
  myostatin_inhibition:     "performance_muscle",
  strength_gain:            "performance_muscle",
  strength:                 "performance_muscle",
  anabolic:                 "performance_muscle",
  stamina:                  "performance_muscle",
  energy:                   "performance_muscle",
  low_energy:               "performance_muscle",
  energy_expenditure:       "performance_muscle",
  endurance:                "performance_muscle",
  growth:                   "performance_muscle",
  bone_density:             "performance_muscle",
  bone_strength:            "performance_muscle",
  flexibility:              "performance_muscle",
  cardiovascular_performance:"performance_muscle",
  cardiovascular_repair:    "performance_muscle",
  heart_health:             "performance_muscle",
  appetite_increase:        "performance_muscle",
  appetite_stimulation:     "performance_muscle",
  fat_oxidation:            "performance_muscle",

  // ─── sexual health → hormonal_optimization (not fertility) ───
  libido:                   "hormonal_optimization",
  libido_increase:          "hormonal_optimization",
  libido_enhancement:       "hormonal_optimization",
  arousal:                  "hormonal_optimization",
  sexual_health:            "hormonal_optimization",
  confidence:               "hormonal_optimization",
  male_health:              "hormonal_optimization",
  testicular_health:        "hormonal_optimization",
  prostate_health:          "hormonal_optimization",
  urinary_function:         "hormonal_optimization",

  // ─── biomarkers ───
  biomarkers:               "biomarkers",
  testing:                  "biomarkers",

  // ─── genomics ───
  genomics:                 "genomics",
  dna:                      "genomics",

  // ─── general_wellness ───
  general_wellness:         "general_wellness",
  wellness:                 "general_wellness",
  vitamins_minerals:        "general_wellness",
  amino_acids:              "general_wellness",
  antioxidants:             "general_wellness",
  adaptogens_botanicals:    "general_wellness",
  "health optimization":    "general_wellness",

  // ─── dosage/utility → remove (not a real goal) ───
  dosage:                   null,
  reconstitution:           null,
  stability:                null,
  sterility:                null,
  administration:           null,
  precise_dosing:           null,
};

// ── Helper: translate an array of goals → canonical goalIds ──────────────────
function translateGoals(goals = []) {
  const result = new Set();
  const unknowns = [];

  for (const g of goals) {
    const normalized = g.trim().toLowerCase().replace(/[\s-]+/g, "_");

    if (CANONICAL_GOALS.has(normalized)) {
      result.add(normalized);
    } else if (CANONICAL_GOALS.has(g)) {
      result.add(g);
    } else if (GOAL_MAP[normalized] !== undefined) {
      if (GOAL_MAP[normalized] !== null) {
        result.add(GOAL_MAP[normalized]);
      }
      // null means "remove this goal" (utility/dosage)
    } else if (GOAL_MAP[g] !== undefined) {
      if (GOAL_MAP[g] !== null) {
        result.add(GOAL_MAP[g]);
      }
    } else {
      unknowns.push(g);
    }
  }

  return { goalIds: [...result].sort(), unknowns };
}

// ── Main migration ──────────────────────────────────────────────────────────
async function migrate() {
  console.log(`\n🔄 Goals Phase 1 — Normalize to 13 Canonical Goals`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "🔴 LIVE WRITE"}`);
  console.log("────────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));

  console.log(`Total products in Firestore: ${docs.length}\n`);

  let changed = 0;
  let unchanged = 0;
  let alreadyCanonical = 0;
  let noGoals = 0;
  const allUnknowns = new Set();
  const batches = [];
  let currentBatch = db.batch();
  let batchCount = 0;

  for (const doc of docs) {
    const oldGoals = doc.goals || [];
    const oldGoalIds = doc.goalIds || [];

    // Merge both fields
    const mergedInput = [...new Set([...oldGoals, ...oldGoalIds])];

    if (mergedInput.length === 0) {
      noGoals++;
      continue;
    }

    const { goalIds: newGoalIds, unknowns } = translateGoals(mergedInput);
    unknowns.forEach(u => allUnknowns.add(u));

    // Check if already normalized
    const oldSorted = [...(doc.goalIds || [])].sort().join(",");
    const newSorted = newGoalIds.sort().join(",");
    const hasLegacyField = doc.goals !== undefined;

    if (oldSorted === newSorted && !hasLegacyField) {
      alreadyCanonical++;
      continue;
    }

    changed++;
    console.log(`  📦 ${doc.name || doc.id}`);
    if (oldGoals.length > 0) {
      console.log(`     goals[] (legacy):  [${oldGoals.join(", ")}]`);
    }
    if (oldGoalIds.length > 0) {
      console.log(`     goalIds[] (old):   [${oldGoalIds.join(", ")}]`);
    }
    console.log(`     goalIds[] (NEW):   [${newGoalIds.join(", ")}]`);
    if (unknowns.length > 0) {
      console.log(`     ⚠️  Unknowns:      [${unknowns.join(", ")}]`);
    }

    if (!DRY_RUN) {
      const update = {
        goalIds: newGoalIds,
        goals: FieldValue.delete(),  // remove legacy field
      };
      currentBatch.update(doc.ref, update);
      batchCount++;

      // Firestore batches limited to 500 operations
      if (batchCount >= 450) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        batchCount = 0;
      }
    }
  }

  // Commit remaining batch
  if (batchCount > 0) {
    batches.push(currentBatch);
  }

  console.log("\n════════════════════════════════════════════════");
  console.log(`  Total products:        ${docs.length}`);
  console.log(`  Without any goals:     ${noGoals}`);
  console.log(`  Already canonical:     ${alreadyCanonical}`);
  console.log(`  Changed/normalized:    ${changed}`);
  console.log("════════════════════════════════════════════════");

  if (allUnknowns.size > 0) {
    console.log(`\n⚠️  Unknown goals not mapped (${allUnknowns.size}):`);
    [...allUnknowns].sort().forEach(u => console.log(`    - "${u}"`));
  }

  if (!DRY_RUN && batches.length > 0) {
    console.log(`\n🔥 Committing ${batches.length} batch(es)...`);
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log(`   ✅ Batch ${i + 1}/${batches.length} committed`);
    }
    console.log(`\n✅ Phase 1 complete — ${changed} products normalized.`);
  } else if (DRY_RUN) {
    console.log(`\n📋 DRY RUN complete — ${changed} products would be updated.`);
  } else {
    console.log(`\n✅ Nothing to update — all products already canonical.`);
  }
}

migrate().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
