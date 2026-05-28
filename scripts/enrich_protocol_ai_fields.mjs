/**
 * enrich_protocol_ai_fields.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Enriches Firestore protocols with two missing AI fields required by ClinicAI:
 *
 *   1. expected_outcomes.qualitative  — 0% coverage (0/26 protocols)
 *   2. eligibility_rules.indications  — 38% coverage (10/26 protocols)
 *
 * Strategy: deterministic mapping from existing fields:
 *   - metadata.primary_goal     (canonical, 100% present)
 *   - therapeutic_category      (100% present)
 *   - overview_summary          (100% present)
 *
 * Only adds fields that are missing — never overwrites existing data.
 *
 * Run (dry-run):  node scripts/enrich_protocol_ai_fields.mjs --dry-run
 * Run (live):     node scripts/enrich_protocol_ai_fields.mjs
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

// ── 1. Canonical goal → expected_outcomes.qualitative mapping ─────────────────
// Each array is a set of clinically meaningful qualitative outcome descriptors.
const GOAL_OUTCOMES = {
  recovery_repair: [
    "Accelerated soft-tissue healing and structural repair",
    "Reduction in post-injury inflammation and pain",
    "Improved musculoskeletal function and range of motion",
    "Enhanced angiogenesis and microvascular support at injury sites",
    "Return to baseline physical performance metrics"
  ],
  metabolic_weight: [
    "Progressive and sustained reduction in body weight and adipose mass",
    "Improved metabolic flexibility and insulin sensitivity",
    "Reduction in visceral fat as assessed by waist circumference or imaging",
    "Stabilization of fasting glucose and lipid markers",
    "Improved energy balance and reduced appetite-driven caloric intake"
  ],
  hormonal_optimization: [
    "Optimization of endogenous growth hormone pulsatility",
    "Improved body composition (lean mass preservation, fat reduction)",
    "Enhanced exercise performance and recovery between sessions",
    "Improved sleep quality and overnight regenerative processes",
    "Support for natural hormonal axis regulation without suppression"
  ],
  longevity_anti_aging: [
    "Cellular rejuvenation and reduction of biological aging biomarkers",
    "Improved mitochondrial efficiency and oxidative stress resilience",
    "Enhanced skin elasticity, hydration, and collagen density",
    "Support for telomere integrity and reduced epigenetic age",
    "Improved systemic energy and functional healthspan"
  ],
  cognitive_mood: [
    "Improved working memory, attention, and executive function",
    "Reduction in cognitive fog and subjective fatigue",
    "Enhanced neuroprotective signaling and BDNF/NGF expression",
    "Improved stress resilience and emotional regulation",
    "Sustained mental clarity during high cognitive-demand activities"
  ],
  immune_support: [
    "Enhanced innate and adaptive immune system responsiveness",
    "Improved T-cell activity and immune cell maturation",
    "Reduction in chronic low-grade inflammation markers (CRP, IL-6)",
    "Greater resilience to environmental and pathogen challenges",
    "Improved recovery time after immune-stressing events"
  ],
  sleep_circadian: [
    "Improved sleep onset latency and total sleep duration",
    "Enhancement of deep (slow-wave) sleep phases",
    "Reduction in nocturnal cortisol and improved HPA axis balance",
    "Normalized circadian rhythm and consistent sleep architecture",
    "Reduced daytime fatigue and improved morning cognitive readiness"
  ],
};

// ── 2. Canonical goal → eligibility_rules.indications mapping ─────────────────
const GOAL_INDICATIONS = {
  recovery_repair: [
    "Active soft-tissue injury (tendon, ligament, or muscle)",
    "Post-surgical recovery requiring accelerated tissue healing",
    "Chronic musculoskeletal pain or inflammatory joint conditions",
    "Athletes with repetitive strain or overuse injuries",
    "Neuropathic pain or peripheral nerve damage"
  ],
  metabolic_weight: [
    "Overweight or obese individuals (BMI ≥ 27) with metabolic risk factors",
    "Insulin resistance or pre-diabetic metabolic profile",
    "Individuals with elevated fasting glucose or dyslipidemia",
    "Patients seeking physician-supervised weight management research",
    "Individuals with metabolic syndrome component criteria"
  ],
  hormonal_optimization: [
    "Adults with documented or suspected GH deficiency or low IGF-1",
    "Individuals experiencing age-related hormonal decline",
    "Athletes seeking recovery support without anabolic steroid use",
    "Individuals with sleep disturbances related to endocrine imbalance",
    "Adults seeking optimization of body composition through GH axis support"
  ],
  longevity_anti_aging: [
    "Adults aged 35+ seeking evidence-based healthspan optimization",
    "Individuals with elevated oxidative stress or mitochondrial dysfunction markers",
    "Patients with premature cellular aging indicators",
    "Individuals with compromised skin integrity, fine lines, or reduced collagen",
    "Patients seeking anti-aging support as part of integrative medicine protocols"
  ],
  cognitive_mood: [
    "Individuals experiencing cognitive decline, brain fog, or memory concerns",
    "Adults under chronic psychological stress with cognitive performance impact",
    "Patients with attention deficits or executive function impairment",
    "Individuals in high-demand professional environments requiring mental clarity",
    "Patients with mild depression or anxiety affecting daily cognitive function"
  ],
  immune_support: [
    "Individuals with recurring infections or immune vulnerability",
    "Patients with autoimmune conditions seeking immune modulation support",
    "Adults with elevated chronic inflammation biomarkers (CRP, TNF-α)",
    "Immunocompromised individuals under physician supervision",
    "Post-viral recovery requiring immune system rebalancing"
  ],
  sleep_circadian: [
    "Adults with insomnia, difficulty falling asleep, or poor sleep quality",
    "Individuals with circadian rhythm disorders (shift work, jet lag)",
    "Patients with high cortisol or chronic stress impacting sleep architecture",
    "Adults experiencing non-restorative sleep with daytime fatigue",
    "Individuals with HPA axis dysregulation affecting nocturnal recovery"
  ],
};

// ── Display label → canonical goal normalizer ────────────────────────────────
// Protocols store primary_goal in display-label format (e.g. "Hormonal Support")
// rather than the snake_case canonical format. This map normalizes both.
const LABEL_TO_CANONICAL = {
  // hormonal_optimization
  "hormonal support":                       "hormonal_optimization",
  "hormonal optimization":                  "hormonal_optimization",
  "hormonal":                               "hormonal_optimization",
  // recovery_repair
  "recovery / injury":                      "recovery_repair",
  "recovery":                               "recovery_repair",
  "injury":                                 "recovery_repair",
  "tissue repair":                          "recovery_repair",
  // metabolic_weight
  "metabolic health":                       "metabolic_weight",
  "weight management / obesity":            "metabolic_weight",
  "weight management / metabolic longevity":"metabolic_weight",
  "weight management":                      "metabolic_weight",
  "metabolic":                              "metabolic_weight",
  // longevity_anti_aging
  "longevity":                              "longevity_anti_aging",
  "anti-aging":                             "longevity_anti_aging",
  "skin / anti-aging":                      "longevity_anti_aging",
  "skin":                                   "longevity_anti_aging",
  // cognitive_mood
  "cognitive support":                      "cognitive_mood",
  "cognitive performance":                  "cognitive_mood",
  "cognitive":                              "cognitive_mood",
  // immune_support
  "immune / inflammation":                  "immune_support",
  "immune support":                         "immune_support",
  "immune":                                 "immune_support",
  // sleep_circadian
  "sleep support":                          "sleep_circadian",
  "sleep":                                  "sleep_circadian",
  // energy/mitochondrial → longevity_anti_aging (nearest canonical)
  "energy / mitochondrial":                 "longevity_anti_aging",
  "mitochondrial":                          "longevity_anti_aging",
  "energy":                                 "longevity_anti_aging",
};

// ── Helper: get the primary_goal from a protocol doc ─────────────────────────
function normalizeGoal(raw) {
  if (!raw) return null;
  // Already canonical?
  if (GOAL_OUTCOMES[raw]) return raw;
  // Try display label normalizer (case-insensitive)
  const key = raw.trim().toLowerCase();
  return LABEL_TO_CANONICAL[key] || null;
}

function getPrimaryGoal(doc) {
  const raw = doc?.metadata?.primary_goal || doc?.primary_goal || null;
  return normalizeGoal(raw);
}

function isEmpty(val) {
  if (val === undefined || val === null || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function run() {
  console.log(`\n🧬 Protocol AI Fields Enrichment — ${DRY_RUN ? "DRY RUN" : "LIVE WRITE"}`);
  console.log("─────────────────────────────────────────────────\n");

  const snap = await db.collection("protocols").where("active", "==", true).get();
  const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));

  console.log(`Active protocols: ${docs.length}\n`);

  const batch = db.batch();
  let enriched = 0;
  let skipped = 0;
  let unknownGoal = 0;

  for (const doc of docs) {
    const primaryGoal = getPrimaryGoal(doc);
    const title = doc.overview_summary?.slice(0, 80) || doc.id;

    if (!primaryGoal || !GOAL_OUTCOMES[primaryGoal]) {
      console.log(`  ⚠️  Unknown goal "${primaryGoal}" for: ${title}`);
      unknownGoal++;
      continue;
    }

    const needsOutcomes = isEmpty(doc?.expected_outcomes?.qualitative);
    const needsIndications = isEmpty(doc?.eligibility_rules?.indications);

    if (!needsOutcomes && !needsIndications) {
      skipped++;
      continue;
    }

    enriched++;
    const update = {};

    if (needsOutcomes) {
      update["expected_outcomes"] = {
        ...(doc.expected_outcomes || {}),
        qualitative: GOAL_OUTCOMES[primaryGoal],
      };
      console.log(`  ✅ [outcomes] ${title.slice(0, 70)}...`);
      console.log(`     goal: ${primaryGoal}`);
    }

    if (needsIndications) {
      update["eligibility_rules"] = {
        ...(doc.eligibility_rules || {}),
        indications: GOAL_INDICATIONS[primaryGoal],
      };
      console.log(`  ✅ [indications] ${title.slice(0, 67)}...`);
    }

    if (!DRY_RUN) {
      batch.update(doc.ref, update);
    }
  }

  if (!DRY_RUN && enriched > 0) {
    await batch.commit();
    console.log(`\n✅ Committed enrichment for ${enriched} protocols.`);
  } else if (DRY_RUN) {
    console.log(`\n📋 DRY RUN — ${enriched} protocols would be enriched, ${skipped} already complete, ${unknownGoal} with unknown goal.`);
  } else {
    console.log(`\n✅ All ${skipped} protocols already have complete AI fields.`);
  }

  // Summary
  console.log("\n── Post-enrichment coverage (projected) ──────────────");
  const total = docs.length;
  console.log(`  eligibility_rules.indications : ${docs.filter(d => !isEmpty(d?.eligibility_rules?.indications)).length + (DRY_RUN ? 0 : docs.filter(d => isEmpty(d?.eligibility_rules?.indications) && getPrimaryGoal(d) && GOAL_INDICATIONS[getPrimaryGoal(d)]).length)}/${total} → will be ${total}/${total} after run`);
  console.log(`  expected_outcomes.qualitative : ${docs.filter(d => !isEmpty(d?.expected_outcomes?.qualitative)).length}/${total} → will be ${docs.filter(d => getPrimaryGoal(d) && GOAL_OUTCOMES[getPrimaryGoal(d)]).length}/${total} after run`);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
