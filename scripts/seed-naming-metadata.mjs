/**
 * ============================================================
 *  Antigravity · Seed Naming Metadata  (Admin SDK)
 *  Writes: metadata.scientificName · metadata.shortCode
 *          metadata.abbreviatedName · metadata.version
 *  Collection: protocol_templates   Project: Med-Peptides-app
 *
 *  Usage:
 *    node scripts/seed-naming-metadata.mjs            # dry-run
 *    DRY_RUN=false node scripts/seed-naming-metadata.mjs  # live
 * ============================================================
 */

import { readFileSync } from "fs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const sa = JSON.parse(readFileSync("./serviceAccountKey.json", "utf8"));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

const COLLECTION = "protocol_templates";
const DRY_RUN    = process.env.DRY_RUN !== "false";

// ─── NAMING METADATA MAP ─────────────────────────────────────
const NAMING_MAP = [
  // ── COGNITIVE
  { docId: "cog_001", shortCode: "COG-001", version: "1.0",
    scientificName: "Cognitive · Neuropeptide BDNF/NGF Upregulation via ACTH/MSH + GABAergic Anxiolysis · 8 Weeks",
    abbreviatedName: "Semax + Selank · Neurotrophic-Anxiolytic" },
  { docId: "cog_002", shortCode: "COG-002", version: "1.0",
    scientificName: "Cognitive · GABAergic Modulation + Neurotrophic Focus Restoration · 8 Weeks",
    abbreviatedName: "Selank + Semax · GABAergic Focus" },

  // ── ENERGY
  { docId: "energy_001", shortCode: "ENE-001", version: "1.0",
    scientificName: "Energy · Mitochondrial Bioenergetics Restoration via AMPK + OXPHOS · 8 Weeks",
    abbreviatedName: "MOTS-C + Elamipretide · AMPK-OXPHOS" },
  { docId: "energy_002", shortCode: "ENE-002", version: "1.0",
    scientificName: "Energy · Mitochondrial Membrane Repair + Resilience via SS-31 + MOTS-C · 8 Weeks",
    abbreviatedName: "Elamipretide + MOTS-C · Membrane Repair" },

  // ── HORMONAL
  { docId: "horm_001", shortCode: "HOR-001", version: "1.0",
    scientificName: "Hormonal · HPG Axis GnRH Pulse Restoration via KISS1R + GnRH Analogue · 12 Weeks",
    abbreviatedName: "Kisspeptin + Gonadorelin · HPG Axis" },
  { docId: "horm_002", shortCode: "HOR-002", version: "1.0",
    scientificName: "Hormonal · GH-Axis Pulsatile Secretion via Dual GHRH + Ghrelin Agonism · 12 Weeks",
    abbreviatedName: "Sermorelin + Ipamorelin · GH Pulsatile" },

  // ── IMMUNE
  { docId: "immune_001", shortCode: "IMM-001", version: "1.0",
    scientificName: "Immune · Thymic Peptide Dual Immunomodulation via TLR/DC + Actin Sequestration · 8 Weeks",
    abbreviatedName: "Tα1 + Tβ4 · Dual Immunomodulation" },
  { docId: "immune_002", shortCode: "IMM-002", version: "1.0",
    scientificName: "Immune · Innate Priming + Mucosal Cytoprotection via Tα1 + BPC-157 · 8 Weeks",
    abbreviatedName: "Tα1 + BPC-157 · Immune-Cytoprotection" },

  // ── LONGEVITY
  { docId: "lon_001", shortCode: "LON-001", version: "1.0",
    scientificName: "Longevity · Mitochondrial-Immune Axis Co-Activation via AMPK + Thymic Peptide · 12 Weeks",
    abbreviatedName: "MOTS-C + Tα1 · Longevity Axis" },
  { docId: "lon_002", shortCode: "LON-002", version: "1.0",
    scientificName: "Longevity · Telomere Maintenance + Circadian Rhythm Restoration via Epitalon + DSIP · 12 Weeks",
    abbreviatedName: "Epitalon + DSIP · Telomere-Circadian" },

  // ── METABOLIC
  { docId: "met_001", shortCode: "MET-001", version: "1.0",
    scientificName: "Metabolic · Incretin Dual Agonism + Mitochondrial AMPK Augmentation · 12 Weeks",
    abbreviatedName: "Tirzepatide + MOTS-C · Incretin-AMPK" },

  // ── SKIN & AESTHETICS
  { docId: "sa_001", shortCode: "SKN-001", version: "1.0",
    scientificName: "Skin · ECM Remodelling + Angiogenic Tissue Repair via GHK-Cu + BPC-157 · 8 Weeks",
    abbreviatedName: "GHK-Cu + BPC-157 · ECM Repair" },

  // ── WEIGHT MANAGEMENT
  { docId: "wm_001", shortCode: "WMT-001", version: "1.0",
    scientificName: "Weight · GLP-1/GIP Receptor Dual-Agonist Titration via Tirzepatide · 12 Weeks",
    abbreviatedName: "Tirzepatide · GLP-1/GIP Titration" },
  { docId: "wm_002", shortCode: "WMT-002", version: "1.0",
    scientificName: "Weight · GLP-1R + AMY1-3R Synergistic Satiety via Semaglutide + Cagrilintide · 12 Weeks",
    abbreviatedName: "Semaglutide + Cagrilintide · Synergistic" },
  { docId: "wm_003", shortCode: "WMT-003", version: "1.0",
    scientificName: "Weight · Triple-Hormone Agonism GLP-1R/GIPR/GCGR Intensive via Retatrutide · 16 Weeks",
    abbreviatedName: "Retatrutide · Triple Agonist Intensive" },
  { docId: "wm_004", shortCode: "WMT-004", version: "1.0",
    scientificName: "Weight · GIP/GLP-1 Receptor Agonism + AMPK Metabolic Adjuvants · 12 Weeks",
    abbreviatedName: "Tirzepatide + MOTS-C · GIP/GLP-1 + AMPK" },
];

// ─── PRINT PLAN ──────────────────────────────────────────────
const LINE = "═══════════════════════════════════════════════════════════";
console.log(`\n${LINE}`);
console.log("  ANTIGRAVITY · SEED NAMING METADATA (Admin SDK)           ");
console.log(LINE);
console.log(`  Collection : ${COLLECTION}  |  Records: ${NAMING_MAP.length}`);
console.log(`  Mode       : ${DRY_RUN ? "DRY_RUN (no writes)" : "⚠️  LIVE"}\n`);
for (const e of NAMING_MAP) {
  console.log(`  [${e.docId.padEnd(12)}] ${e.shortCode}  v${e.version}`);
}
console.log(`\n${LINE}\n`);

if (DRY_RUN) {
  console.log("  DRY_RUN=true — no writes. Run with DRY_RUN=false to apply.\n");
  process.exit(0);
}

// ─── EXECUTE ─────────────────────────────────────────────────
const batch = db.batch();
for (const e of NAMING_MAP) {
  batch.update(db.collection(COLLECTION).doc(e.docId), {
    "metadata.shortCode":       e.shortCode,
    "metadata.scientificName":  e.scientificName,
    "metadata.abbreviatedName": e.abbreviatedName,
    "metadata.version":         e.version,
    "metadata.updated_at":      FieldValue.serverTimestamp(),
  });
}

try {
  console.log(`  Committing batch of ${NAMING_MAP.length} documents …`);
  await batch.commit();
  console.log(`  ✅ Done — naming metadata written to all ${NAMING_MAP.length} protocols.\n`);
} catch (err) {
  console.error("  ❌ Batch failed:", err.message);
  process.exit(1);
}
