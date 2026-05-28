/**
 * phase11_4b_bioregulators_sexual.mjs
 * Phase 11 — Batch E: Peptide Bioregulators & Sexual Health
 *
 * Products:
 * - Cardiogen, Cartalax, Prostamax, Testagen, Thymagen
 * - DSIP, Epithalon (Epitalon variant)
 * - KPV, ARA-290
 * - PT-141 (Bremelanotide), MT2 (Melanotan II)
 * - Oxytocin Acetate, Snap-8
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
  "Cardiogen": {
    contraindications: ["severe_cardiac_arrhythmia_requiring_pharmacotherapy", "post_MI_acute_phase"],
    halfLife: "~2-4 hours; tetrapeptide bioregulator",
    dosageRange: { min: 200, max: 400, unit: "mcg", frequency: "daily_for_10_20_days" },
    synergies: ["Epitalon", "Thymosin Alpha-1", "BPC-157"],
    evidenceLevel: "animal-model"
  },
  "Cartalax": {
    contraindications: ["active_joint_infection", "pregnancy"],
    halfLife: "~2-4 hours; tripeptide bioregulator",
    dosageRange: { min: 200, max: 400, unit: "mcg", frequency: "daily_for_10_20_days" },
    synergies: ["BPC-157", "TB-500", "GHK-Cu (Copper Peptide)"],
    evidenceLevel: "animal-model"
  },
  "Prostamax": {
    contraindications: ["active_prostate_cancer", "pregnancy"],
    halfLife: "~2-4 hours; tetrapeptide bioregulator",
    dosageRange: { min: 200, max: 400, unit: "mcg", frequency: "daily_for_10_20_days" },
    synergies: ["Testagen", "Thymulin"],
    evidenceLevel: "animal-model"
  },
  "Testagen": {
    contraindications: ["active_malignancy", "pregnancy"],
    halfLife: "~2-4 hours; tetrapeptide bioregulator",
    dosageRange: { min: 200, max: 400, unit: "mcg", frequency: "daily_for_10_20_days" },
    synergies: ["Epitalon", "Thymagen", "Sermorelin"],
    evidenceLevel: "animal-model"
  },
  "Thymagen": {
    contraindications: ["organ_transplant_on_immunosuppressants", "autoimmune_disorders_requiring_active_treatment"],
    halfLife: "~2-4 hours; tetrapeptide bioregulator",
    dosageRange: { min: 200, max: 400, unit: "mcg", frequency: "daily_for_10_20_days" },
    synergies: ["Thymosin Alpha-1", "Epitalon", "Selank"],
    evidenceLevel: "animal-model"
  },
  "DSIP": {
    contraindications: ["pregnancy", "severe_sleep_apnea_requiring_CPAP", "CNS_depressant_use"],
    halfLife: "~30 minutes IV; depot effects up to 24h",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "daily_before_sleep" },
    synergies: ["Selank", "Semax", "Pinealon"],
    evidenceLevel: "animal-model"
  },
  "Epithalon": {
    contraindications: ["active_malignancy", "autoimmune_disorder"],
    halfLife: "Approximately 2 hours; tetrapeptide bioregulator",
    dosageRange: { min: 5000, max: 10000, unit: "mcg", frequency: "daily_for_10_20_days_per_course" },
    synergies: ["Thymosin Alpha-1", "GHK-Cu (Copper Peptide)", "Pinealon"],
    evidenceLevel: "animal-model"
  },
  "KPV": {
    contraindications: ["pregnancy", "active_systemic_infection_requiring_antibiotics"],
    halfLife: "~1-2 hours; tripeptide",
    dosageRange: { min: 100, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["BPC-157", "Thymosin Alpha-1", "ARA-290"],
    evidenceLevel: "animal-model"
  },
  "ARA-290": {
    contraindications: ["polycythemia", "thrombophilia_history", "pregnancy"],
    halfLife: "~4-8 hours",
    dosageRange: { min: 2000, max: 4000, unit: "mcg", frequency: "daily_for_28_days" },
    synergies: ["BPC-157", "KPV", "Thymosin Alpha-1"],
    evidenceLevel: "human-clinical-trial"
  },
  "PT-141 (Bremelanotide)": {
    contraindications: ["uncontrolled_hypertension", "cardiovascular_disease_history", "pregnancy", "use_with_antihypertensives"],
    halfLife: "~12-17 hours",
    dosageRange: { min: 500, max: 2000, unit: "mcg", frequency: "as_needed_subcutaneous" },
    synergies: ["Kisspeptin-10"],
    evidenceLevel: "human-clinical-trial"
  },
  "MT2 (Melanotan II)": {
    contraindications: ["personal_family_history_melanoma", "history_of_atypical_moles", "pregnancy", "autoimmune_skin_disorders"],
    halfLife: "~33 minutes IV; subcutaneous effects extend 8-12h",
    dosageRange: { min: 250, max: 1000, unit: "mcg", frequency: "daily_loading_then_maintenance" },
    synergies: ["PT-141 (Bremelanotide)"],
    evidenceLevel: "animal-model"
  },
  "Oxytocin Acetate": {
    contraindications: ["hypersensitivity_to_oxytocin", "pre_existing_uterine_scarring", "active_cardiovascular_disease", "pregnancy_unless_medically_supervised"],
    halfLife: "~1-6 minutes IV; 1-3 hours intranasal",
    dosageRange: { min: 10, max: 40, unit: "IU", frequency: "intranasal_as_needed" },
    synergies: ["PT-141 (Bremelanotide)", "Kisspeptin-10"],
    evidenceLevel: "human-clinical-trial"
  },
  "Snap-8": {
    contraindications: ["known_hypersensitivity_to_acetyl_octapeptide"],
    halfLife: "Topical peptide; local dermal activity",
    dosageRange: { min: 50, max: 100, unit: "mg", frequency: "topical_twice_daily" },
    synergies: ["GHK-Cu (Copper Peptide)"],
    evidenceLevel: "in-vitro"
  }
};

async function run() {
  console.log("\n🧬 Phase 11 — Batch E: Bioregulators & Sexual Health");
  console.log("──────────────────────────────────────────────────────\n");

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

  console.log("\n──────────────────────────────────────────────────────");
  console.log(`✅ Patched  : ${patched} documents`);
  console.log(`⚠️  Not Found: ${notFound} product names`);
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
