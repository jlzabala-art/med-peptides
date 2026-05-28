/**
 * ============================================================
 *  Antigravity · Universal Pharma-Grade Nomenclature Script
 *  Covers ALL 16 protocols across all therapeutic categories
 *  Firebase Project : Med-Peptides-app | Collection: protocols
 * ============================================================
 *
 * Naming convention (mechanism-first, INN-compliant):
 *   [Mechanism / Target] + [Protocol Type / Intensity]
 *
 * Banned terms: Structured · Personalized · Advanced ·
 *   Optimized · Foundation · Support · Management ·
 *   Brand names in slugs
 *
 * Usage:
 *   node scripts/pharma-nomenclature-all.mjs           # dry-run
 *   DRY_RUN=false node scripts/pharma-nomenclature-all.mjs  # live
 * ============================================================
 */

import { initializeApp, getApps, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const PROJECT_ID = "Med-Peptides-app";
const COLLECTION  = "protocol_templates";
const DRY_RUN     = process.env.DRY_RUN !== "false";

if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID });
}
const db = getFirestore();

// ─── COMPLETE NOMENCLATURE MAP — ALL 16 PROTOCOLS ──────────
//
//  Derivation per protocol:
//    cog_001 : Semax (ACTH/MSH analogue → BDNF/NGF ↑) + Selank (anxiolytic)
//              → neuropeptide-mediated neurotrophic upregulation + anxiolysis
//    cog_002 : Selank (GABAergic anxiolytic) + Semax (neurotrophic)
//              → focus restoration via GABAergic modulation + neurotrophic support
//    energy_001: MOTS-C (AMPK activator, mitochondrial-derived) + Elamipretide (SS-31)
//              → mitochondrial bioenergetics restoration + AMPK-driven fat oxidation
//    energy_002: Elamipretide (cardiolipin stabiliser → OXPHOS protection)
//              + MOTS-C → mitochondrial membrane repair + resilience
//    horm_001 : Kisspeptin (KISS1R agonist → GnRH pulse trigger)
//              + Gonadorelin (GnRH analogue → LH/FSH pulse)
//              → HPG axis reactivation via GnRH pulse restoration
//    horm_002 : Sermorelin (GHRH analogue → GH pulse)
//              + Ipamorelin (selective ghrelin/GHSR-1a agonist → GH pulse)
//              → GH-axis pulsatile secretion restoration (GHRH + ghrelin dual)
//    immune_001: Thymosin Alpha-1 (TLR/DC immunomodulator)
//              + Thymosin Beta-4 (actin sequestration → tissue repair)
//              → thymic peptide dual immunomodulation
//    immune_002: Thymosin Alpha-1 (innate immunity priming)
//              + BPC-157 (cytoprotective organoprotective pentadecapeptide)
//              → immune restoration + mucosal cytoprotection
//    lon_001  : MOTS-C (AMPK, metabolic longevity) + Thymosin Alpha-1 (immune ageing)
//              → mitochondrial-immune longevity axis co-activation
//    lon_002  : Epitalon (telomerase activator, pineal peptide)
//              + DSIP (delta-sleep inducing peptide, circadian regulator)
//              → telomere maintenance + circadian rhythm restoration
//    met_001  : Tirzepatide (GIP/GLP-1R dual agonist)
//              + MOTS-C (AMPK-mediated fat oxidation)
//              → incretin dual agonism with mitochondrial AMPK augmentation
//    sa_001   : GHK-Cu (copper tripeptide → collagen/elastin remodelling)
//              + BPC-157 (angiogenic, wound healing cytoprotective)
//              → extracellular matrix remodelling + angiogenic tissue repair
//    wm_001   : Tirzepatide → GLP-1R/GIPR dual agonism titration
//    wm_002   : Semaglutide (GLP-1R) + Cagrilintide (AMY1-3R) synergistic satiety
//    wm_003   : Retatrutide → GLP-1R/GIPR/GCGR triple agonism intensive
//    wm_004   : Tirzepatide + MOTS-C + AOD-9604 → GIP/GLP-1R agonism + metabolic adjuvants
//
const NOMENCLATURE_MAP = [
  // ── COGNITIVE ──────────────────────────────────────────────
  {
    firestoreDocId: "cog_001",
    old_title: "Cognitive Support Protocol",
    old_slug:  "cognitive-support-structured",
    new_title: "Neuropeptide Neurotrophic & Anxiolytic Upregulation",
    new_slug:  "semax-selank-neurotrophic-anxiolytic",
  },
  {
    firestoreDocId: "cog_002",
    old_title: "Focus & Resilience Protocol",
    old_slug:  "focus-resilience-structured",
    new_title: "GABAergic Modulation & Neurotrophic Focus Restoration",
    new_slug:  "selank-semax-gabaergic-neurotrophic-focus",
  },

  // ── ENERGY ─────────────────────────────────────────────────
  {
    firestoreDocId: "energy_001",
    old_title: "Mitochondrial Energy Protocol",
    old_slug:  "mitochondrial-energy-structured",
    new_title: "Mitochondrial Bioenergetics Restoration (AMPK + OXPHOS)",
    new_slug:  "motsc-elamipretide-ampk-oxphos-restoration",
  },
  {
    firestoreDocId: "energy_002",
    old_title: "Mitochondrial Resilience Protocol",
    old_slug:  "mitochondrial-resilience-structured",
    new_title: "Mitochondrial Membrane Repair & Resilience (SS-31 + MOTS-C)",
    new_slug:  "elamipretide-motsc-membrane-repair-resilience",
  },

  // ── HORMONAL ───────────────────────────────────────────────
  {
    firestoreDocId: "horm_001",
    old_title: "Hormonal Support Protocol",
    old_slug:  "hormonal-support-structured",
    new_title: "HPG Axis GnRH Pulse Restoration (Kisspeptin + Gonadorelin)",
    new_slug:  "kisspeptin-gonadorelin-hpg-axis-gnrh-restoration",
  },
  {
    firestoreDocId: "horm_002",
    old_title: "GH Axis Support Protocol",
    old_slug:  "gh-axis-support-structured",
    new_title: "GH-Axis Pulsatile Secretion (GHRH + Ghrelin Dual Agonism)",
    new_slug:  "sermorelin-ipamorelin-gh-pulsatile-dual-agonism",
  },

  // ── IMMUNE ─────────────────────────────────────────────────
  {
    firestoreDocId: "immune_001",
    old_title: "Immune Modulation Protocol",
    old_slug:  "immune-modulation-structured",
    new_title: "Thymic Peptide Dual Immunomodulation (Tα1 + Tβ4)",
    new_slug:  "thymosin-alpha1-beta4-dual-immunomodulation",
  },
  {
    firestoreDocId: "immune_002",
    old_title: "Immune Reset Protocol",
    old_slug:  "immune-reset-structured",
    new_title: "Immune Restoration & Mucosal Cytoprotection (Tα1 + BPC-157)",
    new_slug:  "thymosin-alpha1-bpc157-immune-cytoprotection",
  },

  // ── LONGEVITY ──────────────────────────────────────────────
  {
    firestoreDocId: "lon_001",
    old_title: "Longevity Foundation Protocol",
    old_slug:  "longevity-foundation-structured",
    new_title: "Mitochondrial-Immune Longevity Axis Co-Activation",
    new_slug:  "motsc-thymosin-alpha1-longevity-axis",
  },
  {
    firestoreDocId: "lon_002",
    old_title: "Longevity Circadian Protocol",
    old_slug:  "longevity-circadian-structured",
    new_title: "Telomere Maintenance & Circadian Rhythm Restoration",
    new_slug:  "epitalon-dsip-telomere-circadian-restoration",
  },

  // ── METABOLIC ──────────────────────────────────────────────
  {
    firestoreDocId: "met_001",
    old_title: "Metabolic Optimization Protocol",
    old_slug:  "metabolic-optimization-structured",
    new_title: "Incretin Dual Agonism with Mitochondrial AMPK Augmentation",
    new_slug:  "tirzepatide-motsc-incretin-ampk-augmentation",
  },

  // ── SKIN & AESTHETICS ──────────────────────────────────────
  {
    firestoreDocId: "sa_001",
    old_title: "Structured Skin & Aesthetics Protocol",
    old_slug:  "skin-aesthetics-ghkcu-structured",
    new_title: "ECM Remodelling & Angiogenic Tissue Repair (GHK-Cu + BPC-157)",
    new_slug:  "ghkcu-bpc157-ecm-remodelling-angiogenic-repair",
  },

  // ── WEIGHT MANAGEMENT ──────────────────────────────────────
  {
    firestoreDocId: "wm_001",
    old_title: "GLP-1/GIP Dual-Agonist Metabolic Titration Protocol",
    old_slug:  "glp1-gip-titration-12w",
    new_title: "GLP-1/GIP Receptor Dual-Agonist Titration",
    new_slug:  "glp1-gip-dual-agonist-titration",
  },
  {
    firestoreDocId: "wm_002",
    old_title: "Semaglutide-Cagrilintide (GCA) Investigational Pathway",
    old_slug:  "semaglutide-cagrilintide-research-12w",
    new_title: "Semaglutide-Cagrilintide Synergistic Research Pathway",
    new_slug:  "semaglutide-cagrilintide-synergistic-research",
  },
  {
    firestoreDocId: "wm_003",
    old_title: "Triple-Hormone Agonist (GLP-1/GIP/GCGR) Research Protocol",
    old_slug:  "triple-agonist-retatrutide-16w",
    new_title: "Triple-Hormone Agonist (GLP-1/GIP/GCGR) Intensive",
    new_slug:  "glp1-gip-gcgr-triple-agonist-intensive",
  },
  {
    firestoreDocId: "wm_004",
    old_title: "GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants",
    old_slug:  "tirzepatide-metabolic-adjunct-12w",
    new_title: "GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants",
    new_slug:  "gip-glp1-receptor-agonism-metabolic-adjuvants",
  },
];

// ─── VALIDATION DIFF ───────────────────────────────────────
function printValidationDiff() {
  const LINE = "═══════════════════════════════════════════════════════════════════════";
  const SEP  = "───────────────────────────────────────────────────────────────────────";

  console.log(`\n${LINE}`);
  console.log("  ANTIGRAVITY · UNIVERSAL PHARMA NOMENCLATURE · VALIDATION DIFF    ");
  console.log(LINE);
  console.log(`  Project    : ${PROJECT_ID}`);
  console.log(`  Collection : ${COLLECTION}`);
  console.log(`  Protocols  : ${NOMENCLATURE_MAP.length} total`);
  console.log(`  Mode       : ${DRY_RUN ? "DRY_RUN — no writes" : "⚠️  LIVE EXECUTION"}`);
  console.log(`${SEP}\n`);

  let willUpdate = 0;
  for (const [i, e] of NOMENCLATURE_MAP.entries()) {
    const tc = e.old_title !== e.new_title;
    const sc = e.old_slug  !== e.new_slug;
    const changed = tc || sc;
    if (changed) willUpdate++;

    console.log(`  [${String(i + 1).padStart(2)}] ${e.firestoreDocId.padEnd(12)} ${changed ? "✏️  WILL UPDATE" : "✅ NO CHANGE"}`);
    if (tc) {
      console.log(`        TITLE OLD : "${e.old_title}"`);
      console.log(`              NEW : "${e.new_title}"`);
    } else {
      console.log(`        TITLE     : "${e.old_title}"  (unchanged)`);
    }
    if (sc) {
      console.log(`        SLUG  OLD : "${e.old_slug}"`);
      console.log(`              NEW : "${e.new_slug}"`);
    } else {
      console.log(`        SLUG      : "${e.old_slug}"  (unchanged)`);
    }
    console.log("");
  }

  console.log(SEP);
  console.log(`  Summary: ${willUpdate} of ${NOMENCLATURE_MAP.length} documents will be updated`);
  if (DRY_RUN) {
    console.log("\n  DRY_RUN=true — no Firestore writes executed.");
    console.log("  To apply: DRY_RUN=false node scripts/pharma-nomenclature-all.mjs");
  }
  console.log(`${LINE}\n`);
}

// ─── ATOMIC BATCH UPDATE ───────────────────────────────────
async function executeBatchUpdate() {
  const batch       = db.batch();
  const updatedAt   = FieldValue.serverTimestamp();
  const applied     = [];
  const skipped     = [];

  for (const e of NOMENCLATURE_MAP) {
    const tc = e.old_title !== e.new_title;
    const sc = e.old_slug  !== e.new_slug;
    if (!tc && !sc) { skipped.push(e.firestoreDocId); continue; }

    batch.update(db.collection(COLLECTION).doc(e.firestoreDocId), {
      protocol_title:        e.new_title,
      protocol_slug:         e.new_slug,
      "metadata.updated_at": updatedAt,
    });
    applied.push(e.firestoreDocId);
  }

  if (applied.length === 0) {
    console.log("  ✅ All protocols already carry the target nomenclature.\n");
    return;
  }

  console.log(`  Committing atomic batch (${applied.length} documents) …`);
  await batch.commit();

  console.log(`\n  ✅ Batch committed successfully.`);
  console.log(`  Updated (${applied.length}) : ${applied.join(", ")}`);
  if (skipped.length) console.log(`  Skipped (${skipped.length}) : ${skipped.join(", ")}`);
  console.log("  Fields written : protocol_title · protocol_slug · metadata.updated_at\n");
}

// ─── ENTRY POINT ───────────────────────────────────────────
printValidationDiff();

if (!DRY_RUN) {
  try {
    await executeBatchUpdate();
  } catch (err) {
    console.error("\n  ❌ Batch failed:", err.message);
    process.exit(1);
  }
}
