/**
 * phase11_4c_supplements_research.mjs
 * Phase 11 — Batch F: Supplements, Research & Miscellaneous
 *
 * Products:
 * - NAD+, NMN, 5-AMINO 1 MQ, SLU PP-332, GW-501516
 * - PE-22 28, PNC-27, FST-344 (Follistatin), PEG MGF
 * - Thymosin Alpha 1 (alternate name without hyphen)
 *
 * NOTE: Updates ALL documents with matching name (handles duplicates).
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";
import { readFileSync }                  from "fs";
import { fileURLToPath }                 from "url";
import { dirname, resolve }              from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svcAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(svcAccount) });
const db = getFirestore();

const CLINICAL_DATA = {
  "NAD+": {
    contraindications: ["active_malignancy", "hypotension", "pregnancy_unless_indicated"],
    halfLife: "~1-2 hours IV/subcutaneous; oral bioavailability highly variable",
    dosageRange: { min: 250, max: 1000, unit: "mg", frequency: "daily_infusion_or_subcutaneous" },
    synergies: ["NMN", "MOTS-C", "5-AMINO 1 MQ"],
    evidenceLevel: "human-clinical-trial"
  },
  "NMN": {
    contraindications: ["active_malignancy", "pregnancy"],
    halfLife: "~2.5 hours; converted to NAD+ in tissues",
    dosageRange: { min: 250, max: 1000, unit: "mg", frequency: "daily_oral" },
    synergies: ["NAD+", "MOTS-C", "Resveratrol"],
    evidenceLevel: "human-clinical-trial"
  },
  "5-AMINO 1 MQ": {
    contraindications: ["severe_renal_impairment", "pregnancy", "active_malignancy"],
    halfLife: "~4-6 hours; oral",
    dosageRange: { min: 50, max: 150, unit: "mg", frequency: "daily_oral" },
    synergies: ["NAD+", "NMN", "MOTS-C", "AOD-9604"],
    evidenceLevel: "animal-model"
  },
  "SLU PP-332": {
    contraindications: ["cardiac_arrhythmia", "pregnancy"],
    halfLife: "~4-8 hours; ERRα/γ agonist",
    dosageRange: { min: 50, max: 200, unit: "mg", frequency: "daily_oral" },
    synergies: ["GW-501516", "MOTS-C"],
    evidenceLevel: "animal-model"
  },
  "GW-501516": {
    contraindications: ["personal_or_family_history_cancer", "liver_disease", "pregnancy", "pediatric_use"],
    halfLife: "~16-24 hours",
    dosageRange: { min: 10, max: 20, unit: "mg", frequency: "daily_oral" },
    synergies: ["MOTS-C", "AOD-9604"],
    evidenceLevel: "animal-model"
  },
  "PE-22 28": {
    contraindications: ["severe_psychiatric_disorder_requiring_pharmacotherapy", "active_suicidal_ideation", "pregnancy"],
    halfLife: "~2-4 hours; spadin analogue",
    dosageRange: { min: 100, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["Selank", "Semax", "DSIP"],
    evidenceLevel: "animal-model"
  },
  "PNC-27": {
    contraindications: ["active_malignancy_treatment_with_overlapping_mechanisms", "pregnancy"],
    halfLife: "~2-4 hours; research peptide",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "daily" },
    synergies: ["Thymosin Alpha-1"],
    evidenceLevel: "in-vitro"
  },
  "FST-344 (Follistatin)": {
    contraindications: ["polycystic_ovary_syndrome_active", "oncological_history", "pregnancy"],
    halfLife: "~24-36 hours",
    dosageRange: { min: 50, max: 100, unit: "mcg", frequency: "daily_for_10_days_per_course" },
    synergies: ["PEG MGF", "IGF-1 LR3", "BPC-157"],
    evidenceLevel: "animal-model"
  },
  "PEG MGF": {
    contraindications: ["active_malignancy", "insulin_resistance_severe", "pregnancy"],
    halfLife: "~3-4 days (PEGylated); superior to non-PEG MGF",
    dosageRange: { min: 200, max: 400, unit: "mcg", frequency: "twice_weekly_post_exercise" },
    synergies: ["IGF-1 LR3", "FST-344 (Follistatin)", "BPC-157"],
    evidenceLevel: "animal-model"
  },
  "Thymosin Alpha 1": {
    contraindications: ["organ_transplant_recipients_on_immunosuppressants", "active_autoimmune_disorder"],
    halfLife: "Approximately 2 hours",
    dosageRange: { min: 900, max: 1800, unit: "mcg", frequency: "twice_weekly" },
    synergies: ["Epithalon", "BPC-157", "Thymagen"],
    evidenceLevel: "human-clinical-trial"
  }
};

async function run() {
  console.log("\n💊 Phase 11 — Batch F: Supplements, Research & Miscellaneous");
  console.log("──────────────────────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  let patched = 0, notFound = 0;

  for (const [productName, clinicalData] of Object.entries(CLINICAL_DATA)) {
    const matches = active.filter(p =>
      (p.name || "").toLowerCase().trim() === productName.toLowerCase().trim()
    );

    if (matches.length === 0) {
      console.log(`  ⚠️  ${productName.padEnd(46)} — NOT FOUND in DB.`);
      notFound++;
      continue;
    }

    const updates = {
      "typeData.contraindications": clinicalData.contraindications,
      "typeData.halfLife":          clinicalData.halfLife,
      "typeData.dosageRange":       clinicalData.dosageRange,
      "typeData.synergies":         clinicalData.synergies,
      "typeData.evidenceLevel":     clinicalData.evidenceLevel
    };

    for (const match of matches) {
      await match._ref.update(updates);
      patched++;
    }
    console.log(`  ✅ ${productName.padEnd(46)} — Enriched (${matches.length} doc${matches.length > 1 ? "s" : ""}).`);
  }

  console.log("\n──────────────────────────────────────────────────────────────");
  console.log(`✅ Patched  : ${patched} documents`);
  console.log(`⚠️  Not Found: ${notFound} product names`);
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
