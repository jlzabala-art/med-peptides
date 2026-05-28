/**
 * ============================================================
 *  Antigravity — Pharma-Grade Protocol Re-Nomenclatura Script
 *  Clinical Data Architect · Batch Update · Safe Mode Enabled
 * ============================================================
 *
 * Firebase Project  : Med-Peptides-app
 * Target Collection : protocols
 * Schema Standard   : antigravity_v2
 *
 * SAFE MODE (default): Prints OLD → NEW comparison and halts.
 * Set DRY_RUN=false env var to execute the atomic Firestore batch.
 *
 * Usage:
 *   node scripts/pharma-nomenclature-update.mjs           # dry-run
 *   DRY_RUN=false node scripts/pharma-nomenclature-update.mjs  # live
 * ============================================================
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createRequire } from "module";

// ─── CONFIG ────────────────────────────────────────────────
const PROJECT_ID  = "Med-Peptides-app";
const COLLECTION  = "protocols";
const DRY_RUN     = process.env.DRY_RUN !== "false"; // safe by default

// ─── INITIALIZE ADMIN SDK ──────────────────────────────────
if (!getApps().length) {
  initializeApp({
    credential: (await import("firebase-admin/app")).applicationDefault
      ? (await import("firebase-admin/app")).applicationDefault()
      : cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    projectId: PROJECT_ID,
  });
}
const db = getFirestore();

// ─── NOMENCLATURE MAPPING ──────────────────────────────────
//
//  Naming convention: [Therapeutic Target] + [Mechanism of Action] + [Protocol Type]
//  Banned terms: Structured · Personalized · Advanced · Weight Management
//  (unless clinically essential)
//
const NOMENCLATURE_MAP = [
  {
    // ── wm_001 ─────────────────────────────────────────────
    // Primary compound : Tirzepatide
    // Pharmacodynamics : GLP-1R + GIPR dual agonism
    //   · GLP-1R → glucose-dependent insulin secretion, gastric emptying delay
    //   · GIPR   → incretin potentiation, adipose insulin sensitization
    // Protocol type    : Titration (2.5 → 10 mg, 4-week step intervals)
    firestoreDocId: "wm_001",
    protocol_id:    "wm_001",
    old_title:      "GLP-1/GIP Dual-Agonist Metabolic Titration Protocol",
    old_slug:       "glp1-gip-titration-12w",
    new_title:      "GLP-1/GIP Receptor Dual-Agonist Titration",
    new_slug:       "glp1-gip-dual-agonist-titration",
  },
  {
    // ── wm_002 ─────────────────────────────────────────────
    // Primary compounds: Semaglutide (GLP-1R agonist, t½ 7 d)
    //                  + Cagrilintide (amylin/AMY1-3R long-acting analogue, t½ 7 d)
    // Pharmacodynamics : Synergistic dual-pathway satiety signalling
    //   · Semaglutide  → GLP-1R-mediated insulin secretion, glucagon suppression
    //   · Cagrilintide → AMY1-3R-mediated gastric motility modulation + satiety
    // Protocol type    : Investigational combination research pathway (CagriSema)
    firestoreDocId: "wm_002",
    protocol_id:    "wm_002",
    old_title:      "Semaglutide-Cagrilintide (GCA) Investigational Pathway",
    old_slug:       "semaglutide-cagrilintide-research-12w",
    new_title:      "Semaglutide-Cagrilintide Synergistic Research Pathway",
    new_slug:       "semaglutide-cagrilintide-synergistic-research",
  },
  {
    // ── wm_003 ─────────────────────────────────────────────
    // Primary compound : Retatrutide
    // Pharmacodynamics : GLP-1R + GIPR + GCGR triple agonism
    //   · GLP-1R → insulin secretion, appetite suppression
    //   · GIPR   → incretin amplification, adipose sensitization
    //   · GCGR   → hepatic glycogenolysis, lipolysis, energy expenditure ↑
    // Protocol type    : Intensive investigational (16-week, enhanced monitoring)
    firestoreDocId: "wm_003",
    protocol_id:    "wm_003",
    old_title:      "Triple-Hormone Agonist (GLP-1/GIP/GCGR) Research Protocol",
    old_slug:       "triple-agonist-retatrutide-16w",
    new_title:      "Triple-Hormone Agonist (GLP-1/GIP/GCGR) Intensive",
    new_slug:       "glp1-gip-gcgr-triple-agonist-intensive",
  },
  {
    // ── wm_004 ─────────────────────────────────────────────
    // Primary compound : Tirzepatide (GIP/GLP-1R dual agonist)
    // Metabolic adjuvants:
    //   · MOTS-C   → mitochondrial-derived peptide; AMPK activation, fat oxidation
    //   · AOD-9604 → GH-fragment (176-191); adipose-selective lipolytic activity
    // Protocol type    : Combination receptor agonism with metabolic adjuvant stack
    firestoreDocId: "wm_004",
    protocol_id:    "wm_004",
    old_title:      "GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants",
    old_slug:       "tirzepatide-metabolic-adjunct-12w",
    new_title:      "GIP/GLP-1 Receptor Agonism with Metabolic Adjuvants",
    new_slug:       "gip-glp1-receptor-agonism-metabolic-adjuvants",
  },
];

// ─── SAFE MODE: VALIDATION DIFF ────────────────────────────
function printValidationDiff() {
  const line = "═══════════════════════════════════════════════════════════════";
  const sep  = "───────────────────────────────────────────────────────────────";

  console.log(`\n${line}`);
  console.log("  ANTIGRAVITY · PHARMA NOMENCLATURE UPDATE · VALIDATION DIFF  ");
  console.log(line);
  console.log(`  Project    : ${PROJECT_ID}`);
  console.log(`  Collection : ${COLLECTION}`);
  console.log(`  Mode       : ${DRY_RUN ? "DRY_RUN (no writes)" : "⚠️  LIVE EXECUTION — writes will be committed"}`);
  console.log(`${sep}\n`);

  NOMENCLATURE_MAP.forEach((entry, i) => {
    const titleChanged = entry.old_title !== entry.new_title;
    const slugChanged  = entry.old_slug  !== entry.new_slug;
    const hasChange    = titleChanged || slugChanged;
    const status       = hasChange ? "✏️  WILL UPDATE" : "✅ NO CHANGE";

    console.log(`  [${i + 1}] Document ID : ${entry.firestoreDocId}`);
    if (titleChanged) {
      console.log(`       TITLE   OLD : "${entry.old_title}"`);
      console.log(`               NEW : "${entry.new_title}"`);
    } else {
      console.log(`       TITLE       : "${entry.old_title}"  (unchanged)`);
    }
    if (slugChanged) {
      console.log(`       SLUG    OLD : "${entry.old_slug}"`);
      console.log(`               NEW : "${entry.new_slug}"`);
    } else {
      console.log(`       SLUG        : "${entry.old_slug}"  (unchanged)`);
    }
    console.log(`       STATUS      : ${status}\n`);
  });

  if (DRY_RUN) {
    console.log(sep);
    console.log("  DRY_RUN=true — no Firestore writes executed.");
    console.log("  To apply changes run:");
    console.log("    DRY_RUN=false node scripts/pharma-nomenclature-update.mjs");
    console.log(`${line}\n`);
  }
}

// ─── BATCH UPDATE ───────────────────────────────────────────
async function executeBatchUpdate() {
  const batch        = db.batch();
  const updatedAt    = FieldValue.serverTimestamp();
  const appliedDocs  = [];
  const skippedDocs  = [];

  for (const entry of NOMENCLATURE_MAP) {
    const titleChanged = entry.old_title !== entry.new_title;
    const slugChanged  = entry.old_slug  !== entry.new_slug;

    if (!titleChanged && !slugChanged) {
      skippedDocs.push(entry.firestoreDocId);
      continue;
    }

    const docRef = db.collection(COLLECTION).doc(entry.firestoreDocId);

    batch.update(docRef, {
      protocol_title:        entry.new_title,
      protocol_slug:         entry.new_slug,
      "metadata.updated_at": updatedAt,
    });

    appliedDocs.push(entry.firestoreDocId);
  }

  if (appliedDocs.length === 0) {
    console.log("\n  ✅ All protocols already carry the target nomenclature. Nothing to write.\n");
    return;
  }

  console.log(`\n  Committing atomic batch update …`);
  console.log(`  Targets  : [${appliedDocs.join(", ")}]`);
  if (skippedDocs.length) {
    console.log(`  Skipped  : [${skippedDocs.join(", ")}] (no change)`);
  }

  await batch.commit();

  console.log("\n  ✅ Batch committed to Firestore.");
  console.log("  Updated fields per document:");
  console.log("    · protocol_title");
  console.log("    · protocol_slug");
  console.log("    · metadata.updated_at  (server timestamp)");
  console.log("═══════════════════════════════════════════════════════════════\n");
}

// ─── ENTRY POINT ────────────────────────────────────────────
printValidationDiff();

if (!DRY_RUN) {
  try {
    await executeBatchUpdate();
  } catch (err) {
    console.error("\n  ❌ Batch update failed:", err.message);
    process.exit(1);
  }
}
