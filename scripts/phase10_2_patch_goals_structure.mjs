/**
 * phase10_2_patch_goals_structure.mjs
 * Migrates products from granular goals → canonical goals + secondaryFactors.
 *
 * BEFORE:  goals = ["weight_loss", "metabolism", "obesity"]
 * AFTER:   goals = ["metabolic_weight"]
 *          secondaryFactors = ["weight_loss", "metabolism", "obesity", ...existing]
 *
 * Rules:
 *  - goals gets only canonical 7 values (inferred from current granular goals)
 *  - secondaryFactors keeps existing values + absorbs old granular goals (deduped)
 *  - Never overwrites if goals is ALREADY canonical (idempotent)
 *
 * Run (dry): DRY=1 node scripts/phase10_2_patch_goals_structure.mjs
 * Run (live): node scripts/phase10_2_patch_goals_structure.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";
import { readFileSync }                  from "fs";
import { fileURLToPath }                 from "url";
import { dirname, resolve }              from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const DRY = process.env.DRY === "1";

// ── Canonical 7 ──────────────────────────────────────────────────────────────
const CANONICAL_7 = new Set([
  "cognitive_mood",
  "hormonal_optimization",
  "immune_support",
  "longevity_anti_aging",
  "metabolic_weight",
  "recovery_repair",
  "sleep_circadian",
]);

// ── Granular goal → canonical mapping ────────────────────────────────────────
// Used ONLY during this one-time migration to infer canonical goals.
// After migration, no runtime mapping is needed.
const GRANULAR_TO_CANONICAL = {
  // metabolic_weight
  weight_loss              : "metabolic_weight",
  fat_loss                 : "metabolic_weight",
  obesity                  : "metabolic_weight",
  lipolysis                : "metabolic_weight",
  metabolism               : "metabolic_weight",
  metabolic_health         : "metabolic_weight",
  metabolic_mimetic        : "metabolic_weight",
  fat_oxidation            : "metabolic_weight",
  insulin_sensitivity      : "metabolic_weight",
  visceral_fat_loss        : "metabolic_weight",
  appetite_suppression     : "metabolic_weight",
  appetite_stimulation     : "metabolic_weight",
  appetite_increase        : "metabolic_weight",
  endurance                : "metabolic_weight",
  cardiovascular_performance: "metabolic_weight",
  cardiovascular_protection: "metabolic_weight",
  heart_health             : "metabolic_weight",
  performance              : "metabolic_weight",
  strength                 : "metabolic_weight",
  strength_gain            : "metabolic_weight",
  // recovery_repair
  healing                  : "recovery_repair",
  recovery                 : "recovery_repair",
  injury_repair            : "recovery_repair",
  tissue_repair            : "recovery_repair",
  muscle_recovery          : "recovery_repair",
  muscle_growth            : "recovery_repair",
  localized_growth         : "recovery_repair",
  growth_hormone_secretion : "recovery_repair",
  natural_gh_support       : "recovery_repair",
  pain_management          : "recovery_repair",
  bone_health              : "recovery_repair",
  joint_integrity          : "recovery_repair",
  myostatin_inhibition     : "recovery_repair",
  collagen_production      : "recovery_repair",
  // cognitive_mood
  cognitive_enhancement    : "cognitive_mood",
  focus                    : "cognitive_mood",
  mood_enhancement         : "cognitive_mood",
  antidepressant_research  : "cognitive_mood",
  neuroplasticity          : "cognitive_mood",
  neuroprotection          : "cognitive_mood",
  nootropic                : "cognitive_mood",
  anxiety_relief           : "cognitive_mood",
  stress_management        : "cognitive_mood",
  stress_reduction         : "cognitive_mood",
  social_bonding           : "cognitive_mood",
  emotional_regulation     : "cognitive_mood",
  // sleep_circadian
  sleep_improvement        : "sleep_circadian",
  circadian_rhythm         : "sleep_circadian",
  hypoxia_resistance       : "sleep_circadian",
  // hormonal_optimization
  hormonal_balance         : "hormonal_optimization",
  testosterone_stimulation : "hormonal_optimization",
  fertility                : "hormonal_optimization",
  hpta_restart             : "hormonal_optimization",
  sexual_health            : "hormonal_optimization",
  libido_increase          : "hormonal_optimization",
  libido_enhancement       : "hormonal_optimization",
  arousal                  : "hormonal_optimization",
  tanning                  : "hormonal_optimization",
  skin_pigmentation        : "hormonal_optimization",
  acne_reduction           : "hormonal_optimization",
  prostate_health          : "hormonal_optimization",
  male_health              : "hormonal_optimization",
  spermatogenesis          : "hormonal_optimization",
  testicular_health        : "hormonal_optimization",
  anti_wrinkle             : "hormonal_optimization",
  skin_texture             : "hormonal_optimization",
  // longevity_anti_aging
  longevity                : "longevity_anti_aging",
  anti_aging               : "longevity_anti_aging",
  energy                   : "longevity_anti_aging",
  cellular_health          : "longevity_anti_aging",
  telomere_lengthening     : "longevity_anti_aging",
  mitochondrial_repair     : "longevity_anti_aging",
  cellular_energy          : "longevity_anti_aging",
  organ_health             : "longevity_anti_aging",
  cancer_research          : "longevity_anti_aging",
  tumor_necrosis           : "longevity_anti_aging",
  gut_health               : "longevity_anti_aging",
  // immune_support
  immune_enhancement       : "immune_support",
  immune_restoration       : "immune_support",
  antiviral_research       : "immune_support",
  t_cell_activation        : "immune_support",
  t_cell_balance           : "immune_support",
  t_cell_maturation        : "immune_support",
  inflammation_control     : "immune_support",
  immunity                 : "immune_support",
  // dosage (utility)
  precise_dosing           : "dosage",
  administration           : "dosage",
  reconstitution           : "dosage",
  stability                : "dosage",
};

function inferCanonical(granularGoals) {
  const canonical = new Set();
  for (const g of granularGoals) {
    const c = GRANULAR_TO_CANONICAL[g];
    if (c) canonical.add(c);
    else if (CANONICAL_7.has(g)) canonical.add(g); // already canonical
  }
  return [...canonical];
}

// ────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n🔄 Phase 10.2 — Patch goals structure (${DRY ? "DRY RUN" : "LIVE"})`);
  console.log("──────────────────────────────────────────────────────\n");

  const snap   = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ id: d.id, ref: d.ref, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  console.log(`Active products: ${active.length}\n`);

  let patched  = 0;
  let skipped  = 0;
  let warnings = 0;

  for (const p of active) {
    const currentGoals = p.goals || [];

    // Already canonical? Skip.
    const alreadyCanonical = currentGoals.every(g => CANONICAL_7.has(g));
    if (alreadyCanonical && currentGoals.length > 0) {
      skipped++;
      continue;
    }

    // Infer canonical goals from granular values
    const newGoals = inferCanonical(currentGoals);

    // Granular values → secondaryFactors (merge with existing, dedupe)
    const existingSecondary = p.secondaryFactors || [];
    const granularOnly = currentGoals.filter(g => !CANONICAL_7.has(g));
    const newSecondary = [...new Set([...existingSecondary, ...granularOnly])];

    if (newGoals.length === 0) {
      console.log(`   ⚠️  ${(p.name || p.id).padEnd(44)} — could not infer any canonical goal from: [${currentGoals.join(", ")}]`);
      warnings++;
      continue;
    }

    console.log(`   ${DRY ? "🔍" : "✅"} ${(p.name || p.id).padEnd(44)}`);
    console.log(`      goals:          [${currentGoals.join(", ")}]`);
    console.log(`      → goals:        [${newGoals.join(", ")}]`);
    console.log(`      → secondary:    [${newSecondary.join(", ")}]`);

    if (!DRY) {
      await p.ref.update({
        goals          : newGoals,
        secondaryFactors: newSecondary,
        migrationVersion: 10,
        migratedAt     : new Date().toISOString(),
      });
    }
    patched++;
  }

  console.log("\n──────────────────────────────────────────────────────");
  console.log(`   Patched : ${patched}`);
  console.log(`   Skipped : ${skipped} (already canonical)`);
  console.log(`   Warnings: ${warnings} (unmappable goals — review manually)`);
  if (DRY) {
    console.log("\n⚠️  DRY RUN — no writes made. Remove DRY=1 to apply.");
  } else {
    console.log("\n✅  Patch complete. Re-run phase10_2_validateCanonicalFields.mjs to confirm.");
  }
  process.exit(warnings > 0 ? 1 : 0);
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
