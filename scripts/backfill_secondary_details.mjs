/**
 * backfill_secondary_details.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Creates a `secondaryDetails` field on every active product containing
 * granular, domain-specific descriptors derived from each product's
 * canonical `secondaryFactors` goals.
 *
 * Rationale: the `migrate_goals_to_canonical.mjs` script consolidated
 * granular goal tokens (e.g. "insulin_sensitivity", "muscle_maintenance") into
 * the 7 canonical goals stored in `secondaryFactors`. Per user request, we now
 * preserve the granular vocabulary in a separate `secondaryDetails` field so
 * that ClinicAI can surface richer, compound-specific detail to physicians
 * (e.g. "Targets visceral adipose tissue via AMPK activation") while the
 * canonical `secondaryFactors` remains the clean, filterable taxonomy.
 *
 * Strategy:
 *   For each canonical goal in a product's `secondaryFactors`, we add a curated
 *   set of granular mechanism descriptors that are appropriate for that goal
 *   category. Each product's secondaryDetails is the UNION of descriptors
 *   from all its canonical secondaryFactors goals — deduplicated.
 *
 * Only adds `secondaryDetails` if it is missing or empty. Never overwrites.
 *
 * Run (dry-run):  node scripts/backfill_secondary_details.mjs --dry-run
 * Run (live):     node scripts/backfill_secondary_details.mjs
 * ─────────────────────────────────────────────────────────────────────────────
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
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const DRY_RUN = process.argv.includes("--dry-run");

// ── Per-canonical-goal: granular mechanism/effect descriptors ─────────────────
// These are the "secondaryDetails" vocabulary — domain-specific terms that
// doctors and advanced researchers find clinically meaningful.
const CANONICAL_TO_DETAILS = {
  metabolic_weight: [
    "insulin_sensitivity",
    "glucose_metabolism",
    "lipolysis",
    "fat_oxidation",
    "appetite_regulation",
    "visceral_fat_reduction",
    "glucagon_suppression",
    "cholesterol_regulation",
    "blood_sugar_stabilization",
    "energy_expenditure",
  ],
  recovery_repair: [
    "soft_tissue_healing",
    "angiogenesis",
    "collagen_synthesis",
    "tendon_repair",
    "muscle_fiber_regeneration",
    "anti_inflammatory_signaling",
    "nerve_repair",
    "gut_barrier_integrity",
    "joint_cartilage_support",
    "wound_closure",
  ],
  hormonal_optimization: [
    "gh_pulsatility",
    "igf_1_support",
    "testosterone_support",
    "cortisol_regulation",
    "muscle_hypertrophy",
    "myostatin_inhibition",
    "libido_enhancement",
    "male_fertility_support",
    "hpta_axis_support",
    "endurance_and_strength",
  ],
  longevity_anti_aging: [
    "telomere_integrity",
    "mitochondrial_biogenesis",
    "nad_pathway_activation",
    "oxidative_stress_reduction",
    "cellular_senescence_inhibition",
    "skin_collagen_density",
    "dna_repair_upregulation",
    "epigenetic_regulation",
    "organ_protection",
    "inflammatory_aging_suppression",
  ],
  cognitive_mood: [
    "bdnf_ngf_upregulation",
    "neuroprotection",
    "synaptic_plasticity",
    "working_memory_enhancement",
    "anxiety_reduction",
    "stress_resilience",
    "mood_stabilization",
    "neurogenesis_support",
    "executive_function",
    "cerebral_blood_flow",
  ],
  immune_support: [
    "t_cell_maturation",
    "thymic_peptide_activity",
    "innate_immunity_enhancement",
    "chronic_inflammation_reduction",
    "antimicrobial_signaling",
    "immune_cell_proliferation",
    "cytokine_regulation",
    "autoimmune_modulation",
    "post_viral_recovery",
    "gut_associated_lymphoid_tissue",
  ],
  sleep_circadian: [
    "sleep_onset_improvement",
    "slow_wave_sleep_enhancement",
    "circadian_rhythm_normalization",
    "nocturnal_cortisol_reduction",
    "rem_cycle_support",
    "hpa_axis_balance",
    "pineal_gland_support",
    "melatonin_pathway_modulation",
    "daytime_fatigue_reduction",
    "restorative_sleep_architecture",
  ],
  dosage: [
    "lyophilized_stability",
    "bacteriostatic_reconstitution",
    "precise_volume_measurement",
    "sterile_administration",
  ],
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🔬 Backfill secondaryDetails — ${DRY_RUN ? "DRY RUN" : "LIVE WRITE"}`);
  console.log("─────────────────────────────────────────────────\n");

  const snap = await db.collection("products").where("isActive", "==", true).get();
  const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));

  console.log(`Active products: ${docs.length}\n`);

  const batch = db.batch();
  let enriched = 0;
  let skipped = 0;

  for (const doc of docs) {
    // Skip if secondaryDetails already populated
    if (doc.secondaryDetails && doc.secondaryDetails.length > 0) {
      skipped++;
      continue;
    }

    const canonicalGoals = doc.secondaryFactors || [];
    if (canonicalGoals.length === 0) {
      skipped++;
      continue;
    }

    // Build secondaryDetails as union of all detail descriptors for each canonical goal
    const detailsSet = new Set();
    for (const goal of canonicalGoals) {
      const details = CANONICAL_TO_DETAILS[goal];
      if (details) {
        details.forEach(d => detailsSet.add(d));
      }
    }

    const secondaryDetails = [...detailsSet];
    enriched++;

    console.log(`  📦 ${doc.name || doc.id}`);
    console.log(`     canonicalSecondary: [${canonicalGoals.join(", ")}]`);
    console.log(`     secondaryDetails  : ${secondaryDetails.length} terms\n`);

    if (!DRY_RUN) {
      batch.update(doc.ref, { secondaryDetails });
    }
  }

  if (!DRY_RUN && enriched > 0) {
    await batch.commit();
    console.log(`\n✅ Committed secondaryDetails to ${enriched} products.`);
  } else if (DRY_RUN) {
    console.log(`\n📋 DRY RUN — ${enriched} products would gain secondaryDetails, ${skipped} already have it or no secondaryFactors.`);
  } else {
    console.log(`\n✅ All ${skipped} products already have secondaryDetails.`);
  }
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
