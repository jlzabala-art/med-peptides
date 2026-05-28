/**
 * phase11_3b_manualEnrich_Metabolic.mjs
 * Phase 11 — Manual Batch B: Metabolic & Weight Management
 *
 * Products:
 * - Semaglutide, Tirzepatide, Retatrutide
 * - Tesamorelin, MOTS-c, AOD-9604
 * - CJC-1295 with DAC, Ipamorelin
 * - GHRP-2, GHRP-6
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
  "Semaglutide": {
    contraindications: ["personal_or_family_history_of_medullary_thyroid_carcinoma", "MEN2_syndrome", "pancreatitis_history", "pregnancy", "severe_renal_impairment"],
    halfLife: "~7 days (weekly dosing)",
    dosageRange: { min: 0.25, max: 2.4, unit: "mg", frequency: "weekly" },
    synergies: ["Tirzepatide", "AOD-9604", "MOTS-c"],
    evidenceLevel: "human-clinical-trial"
  },
  "Tirzepatide": {
    contraindications: ["personal_or_family_history_of_medullary_thyroid_carcinoma", "MEN2_syndrome", "pancreatitis_history", "pregnancy", "severe_renal_impairment"],
    halfLife: "~5 days (weekly dosing)",
    dosageRange: { min: 2.5, max: 15, unit: "mg", frequency: "weekly" },
    synergies: ["Semaglutide", "AOD-9604", "Tesamorelin"],
    evidenceLevel: "human-clinical-trial"
  },
  "Retatrutide": {
    contraindications: ["personal_or_family_history_of_medullary_thyroid_carcinoma", "MEN2_syndrome", "pancreatitis_history", "pregnancy"],
    halfLife: "~6 days (weekly dosing)",
    dosageRange: { min: 1, max: 12, unit: "mg", frequency: "weekly" },
    synergies: ["Semaglutide", "MOTS-c"],
    evidenceLevel: "human-clinical-trial"
  },
  "Tesamorelin": {
    contraindications: ["active_malignancy", "pregnancy", "pituitary_tumor_history", "Prader-Willi_syndrome"],
    halfLife: "~26-38 minutes",
    dosageRange: { min: 1000, max: 2000, unit: "mcg", frequency: "daily" },
    synergies: ["CJC-1295 without DAC + Ipamorelin", "MOTS-c"],
    evidenceLevel: "human-clinical-trial"
  },
  "MOTS-c": {
    contraindications: ["no_absolute_contraindications_established", "use_with_caution_in_active_malignancy"],
    halfLife: "Estimated 2-4 hours",
    dosageRange: { min: 5000, max: 15000, unit: "mcg", frequency: "weekly" },
    synergies: ["Tesamorelin", "AOD-9604", "Semaglutide"],
    evidenceLevel: "animal-model"
  },
  "AOD-9604": {
    contraindications: ["active_malignancy", "pregnancy", "hypoglycemia_susceptibility"],
    halfLife: "~30 minutes",
    dosageRange: { min: 250, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["CJC-1295 without DAC + Ipamorelin", "MOTS-c", "Tesamorelin"],
    evidenceLevel: "human-clinical-trial"
  },
  "Ipamorelin": {
    contraindications: ["active_malignancy", "diabetic_retinopathy", "pregnancy"],
    halfLife: "~2 hours",
    dosageRange: { min: 200, max: 300, unit: "mcg", frequency: "daily_before_sleep" },
    synergies: ["CJC-1295 without DAC + Ipamorelin", "Sermorelin", "GHRP-6"],
    evidenceLevel: "animal-model"
  },
  "GHRP-2": {
    contraindications: ["active_malignancy", "hypoglycemia", "severe_cardiovascular_disease", "pregnancy"],
    halfLife: "~15-60 minutes",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "three_times_daily" },
    synergies: ["CJC-1295 without DAC + Ipamorelin", "Sermorelin"],
    evidenceLevel: "animal-model"
  },
  "GHRP-6": {
    contraindications: ["active_malignancy", "hypoglycemia", "obesity_with_insulin_resistance", "pregnancy"],
    halfLife: "~15-60 minutes",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "three_times_daily" },
    synergies: ["CJC-1295 without DAC + Ipamorelin", "GHRP-2"],
    evidenceLevel: "animal-model"
  },
  "CJC-1295 with DAC": {
    contraindications: ["active_malignancy", "diabetic_retinopathy", "carpal_tunnel_syndrome", "pregnancy"],
    halfLife: "~6-8 days (DAC extends half-life dramatically)",
    dosageRange: { min: 1000, max: 2000, unit: "mcg", frequency: "weekly" },
    synergies: ["Ipamorelin", "GHRP-6"],
    evidenceLevel: "animal-model"
  }
};

async function run() {
  console.log("\n⚡ Phase 11 — Batch B: Metabolic & Weight Management Enrichment");
  console.log("─────────────────────────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  let patched = 0, notFound = 0;

  for (const [productName, clinicalData] of Object.entries(CLINICAL_DATA)) {
    const match = active.find(p =>
      (p.name || "").toLowerCase().trim() === productName.toLowerCase().trim()
    );

    if (!match) {
      console.log(`  ⚠️  ${productName.padEnd(48)} — NOT FOUND in DB.`);
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

    await match._ref.update(updates);
    console.log(`  ✅ ${productName.padEnd(48)} — Enriched.`);
    patched++;
  }

  console.log("\n─────────────────────────────────────────────────────────────────");
  console.log(`✅ Patched  : ${patched}`);
  console.log(`⚠️  Not Found: ${notFound}`);
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
