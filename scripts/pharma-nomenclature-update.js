/**
 * ============================================================
 *  Antigravity — Pharma-Grade Protocol Re-Nomenclature Script
 *  Clinical Data Architect · Batch Update · Safe Mode Enabled
 * ============================================================
 *
 * Firebase Project  : Med-Peptides-app
 * Target Collection : protocols
 * Schema Standard   : antigravity_v2
 * Timestamp         : 2026-04-21
 *
 * SAFE MODE (default): Prints OLD → NEW comparison and halts.
 * Set DRY_RUN = false to execute the Firestore atomic batch.
 *
 * Usage:
 *   node scripts/pharma-nomenclature-update.js           # dry-run
 *   DRY_RUN=false node scripts/pharma-nomenclature-update.js  # live
 * ============================================================
 */

"use strict";

const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

// ─── CONFIG ────────────────────────────────────────────────
const PROJECT_ID = "Med-Peptides-app";
const COLLECTION  = "protocols";
const DRY_RUN     = process.env.DRY_RUN !== "false"; // safe by default

// ─── INITIALIZE ADMIN SDK ──────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId:  PROJECT_ID,
  });
}
const db = admin.firestore();

// ─── NOMENCLATURE MAPPING ──────────────────────────────────
//
//  Format per entry:
//    firestoreDocId : document ID as stored in Firestore
//    protocol_id    : canonical local ID (wm_XXX)
//    old_title      : current title (for validation diff)
//    old_slug       : current slug  (for validation diff)
//    new_title      : pharma-grade title (derived from pharmacodynamics)
//    new_slug       : kebab-case slug derived from new_title
//
//  Naming logic:
//    [Therapeutic Target] + [Mechanism of Action] + [Protocol Type]
//    → No marketing terms (Structured, Personalized, Advanced, Weight Management)
// ──────────────────────────────────────────────────────────
const NOMENCLATURE_MAP = [
  {
    // Compound: Tirzepatide (GLP-1/GIP dual agonist, t½ 5 d)
    // Mechanism: simultaneous agonism at GLP-1R and GIPR → insulin secretion
    //            + glucagon suppression + gastric emptying delay
    // Protocol type: titration (dose escalation from 2.5 → 10 mg)
    firestoreDocId: "wm_001",
    protocol_id:    "wm_001",
    old_title:      "GLP-1/GIP Dual-Agonist Metabolic Titration Protocol",
    old_slug:       "glp1-gip-titration-12w",
    new_title:      "GLP-1/GIP Receptor Dual-Agonist Titration",
    new_slug:       "glp1-gip-dual-agonist-titration",
  },
  {
    // Compounds: Semaglutide (GLP-1R agonist, t½ 7 d)
    //          + Cagrilintide (long-acting amylin/AMY1-3R agonist, t½ 7 d)
    // Mechanism: complementary satiety pathways → GLP-1 mediated insulin
    //            secretion + amylin-mediated gastric motility & satiety
    // Protocol type: investigational combination research pathway (CagriSema)
    firestoreDocId: "wm_002",
    protocol_id:    "wm_002",
    old_title:      "Semaglutide-Cagrilintide (GCA) Investigational Pathway",
    old_slug:       "semaglutide-cagrilintide-research-12w",
    new_title:      "Semaglutide-Cagrilintide Synergistic Research Pathway",
    new_slug:       "semaglutide-cagrilintide-synergistic-research",
  },
  {
    // Compound: Retatrutide (GLP-1R/GIPR/GCGR triple agonist, t½ 6 d)
    // Mechanism: triple receptor agonism → additive insulin secretion (GLP-1R),
    //            incretin amplification (GIPR), lipolysis & EE elevation (GCGR)
    // Protocol type: intensive investigational (16-week, extended monitoring)
    firestoreDocId: "wm_003",
    protocol_id:    "wm_003",
    old_title:      "Triple-Hormone Agonist (GLP-1/GIP/GCGR) Research Protocol",
    old_slug:       "triple-agonist-retatrutide-16w",
    new_title:      "Triple-Hormone Agonist (GLP-1/GIP/GCGR) Intensive",
    new_slug:       "glp1-gip-gcgr-triple-agonist-intensive",
  },
  {
    // Compound: Tirzepatide (GLP-1/GIP dual agonist) + metabolic adjuvants
    //           (MOTS-C mitochondrial peptide, AOD-9604 lipolytic fragment)
    // Mechanism: GIP/GLP-1R co-agonism layered with AMPK activation (MOTS-C)
    //            and adipose-specific GH-fragment lipolysis (AOD-9604)
    // Protocol type: combination receptor agonism with adjuvant augmentation
    firestoreDocId: "wm_004",
    protocol_id:    "wm_004",
    old_title:      "GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants",
    old_slug:       "tirzepatide-metabolic-adjunct-12w",
    new_title:      "GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants",
    new_slug:       "gip-glp1-receptor-agonism-metabolic-adjuvants",
  },
];

// ─── SAFE MODE: VALIDATION DIFF ───────────────────────────
function printValidationDiff() {
  console.log("\n");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  ANTIGRAVITY · PHARMA NOMENCLATURE UPDATE · VALIDATION DIFF  ");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(`  Project    : ${PROJECT_ID}`);
  console.log(`  Collection : ${COLLECTION}`);
  console.log(`  Mode       : ${DRY_RUN ? "DRY_RUN (no writes)" : "⚠️  LIVE EXECUTION"}`);
  console.log("───────────────────────────────────────────────────────────────\n");

  NOMENCLATURE_MAP.forEach((entry, i) => {
    const changed = entry.old_title !== entry.new_title || entry.old_slug !== entry.new_slug;
    console.log(`  [${i + 1}] Document: ${entry.firestoreDocId}`);
    console.log(`       TITLE  OLD → ${entry.old_title}`);
    console.log(`              NEW → ${entry.new_title}`);
    console.log(`       SLUG   OLD → ${entry.old_slug}`);
    console.log(`              NEW → ${entry.new_slug}`);
    console.log(`       STATUS: ${changed ? "✏️  WILL UPDATE" : "✅ NO CHANGE"}`);
    console.log("");
  });

  if (DRY_RUN) {
    console.log("───────────────────────────────────────────────────────────────");
    console.log("  DRY_RUN=true · No writes executed.");
    console.log("  To apply: DRY_RUN=false node scripts/pharma-nomenclature-update.js");
    console.log("═══════════════════════════════════════════════════════════════\n");
  }
}

// ─── BATCH UPDATE ──────────────────────────────────────────
async function executeBatchUpdate() {
  const batch = db.batch();
  const updatedAt = FieldValue.serverTimestamp();
  const appliedEntries = [];

  for (const entry of NOMENCLATURE_MAP) {
    // Only write if something actually changes
    const titleChanged = entry.old_title !== entry.new_title;
    const slugChanged  = entry.old_slug  !== entry.new_slug;

    if (!titleChanged && !slugChanged) {
      console.log(`  [SKIP] ${entry.firestoreDocId} — no change detected.`);
      continue;
    }

    const docRef = db.collection(COLLECTION).doc(entry.firestoreDocId);

    batch.update(docRef, {
      protocol_title:        entry.new_title,
      protocol_slug:         entry.new_slug,
      "metadata.updated_at": updatedAt,
    });

    appliedEntries.push(entry.firestoreDocId);
  }

  if (appliedEntries.length === 0) {
    console.log("\n  ✅ All protocols are already up-to-date. Nothing to write.\n");
    return;
  }

  console.log(`\n  Committing atomic batch for: [${appliedEntries.join(", ")}] …`);

  await batch.commit();

  console.log("\n  ✅ Batch committed successfully.");
  console.log(`  Updated documents: ${appliedEntries.join(", ")}`);
  console.log("═══════════════════════════════════════════════════════════════\n");
}

// ─── ENTRY POINT ──────────────────────────────────────────
(async () => {
  printValidationDiff();

  if (DRY_RUN) {
    process.exit(0);
  }

  try {
    await executeBatchUpdate();
  } catch (err) {
    console.error("\n  ❌ Batch update failed:", err.message);
    process.exit(1);
  }
})();
