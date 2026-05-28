/**
 * phase11_3c_manualEnrich_Neuro_Immune_Sexual.mjs
 * Phase 11 — Manual Batch C: Neurology, Immunity & Sexual Health
 *
 * Products:
 * - Dihexa, Noopept, Pinealon
 * - SS-31 (Elamipretide)
 * - PT-141 (Bremelanotide), Kisspeptin-10
 * - LL-37, Thymulin
 * - Hexarelin, IGF-1 LR3
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
  "Dihexa": {
    contraindications: ["active_malignancy", "severe_liver_impairment", "pregnancy", "children"],
    halfLife: "~2-4 hours, CNS effects may persist longer",
    dosageRange: { min: 5, max: 20, unit: "mg", frequency: "daily" },
    synergies: ["Semax", "Selank", "Noopept"],
    evidenceLevel: "animal-model"
  },
  "Noopept": {
    contraindications: ["severe_liver_or_kidney_impairment", "pregnancy", "lactation", "children_under_18"],
    halfLife: "~30-60 minutes (short half-life, effects may last longer)",
    dosageRange: { min: 10, max: 30, unit: "mg", frequency: "daily" },
    synergies: ["Semax", "Selank", "Dihexa"],
    evidenceLevel: "human-clinical-trial"
  },
  "Pinealon": {
    contraindications: ["active_malignancy", "pregnancy"],
    halfLife: "~2-4 hours (estimated)",
    dosageRange: { min: 5, max: 10, unit: "mg", frequency: "daily_for_10_days" },
    synergies: ["Epitalon", "Semax", "Selank"],
    evidenceLevel: "animal-model"
  },
  "SS-31": {
    contraindications: ["no_established_absolute_contraindications", "use_with_caution_in_severe_renal_impairment"],
    halfLife: "~1-2 hours",
    dosageRange: { min: 0.5, max: 4, unit: "mg", frequency: "daily" },
    synergies: ["NAD+", "MOTS-c", "BPC-157"],
    evidenceLevel: "animal-model"
  },
  "PT-141": {
    contraindications: ["uncontrolled_hypertension", "severe_cardiovascular_disease", "pregnancy", "do_not_combine_with_PDE5_inhibitors"],
    halfLife: "~2-3 hours",
    dosageRange: { min: 0.5, max: 2, unit: "mg", frequency: "as_needed_45_min_before" },
    synergies: ["Kisspeptin-10"],
    evidenceLevel: "human-clinical-trial"
  },
  "Kisspeptin-10": {
    contraindications: ["hormone-sensitive_cancers", "PCOS_in_IVF_hyperstimulation_risk", "pregnancy"],
    halfLife: "~28 minutes",
    dosageRange: { min: 1, max: 10, unit: "nmol/kg", frequency: "pulsatile_or_as_directed" },
    synergies: ["PT-141"],
    evidenceLevel: "human-clinical-trial"
  },
  "LL-37": {
    contraindications: ["autoimmune_disorders_with_risk_of_cytokine_storm", "active_malignancy_until_further_research", "pregnancy"],
    halfLife: "~3-5 hours (estimated)",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "daily" },
    synergies: ["Thymosin Alpha-1", "Thymulin"],
    evidenceLevel: "in-vitro"
  },
  "Thymulin": {
    contraindications: ["active_autoimmune_condition_requiring_immunosuppression", "pregnancy"],
    halfLife: "~2-4 hours",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "daily" },
    synergies: ["Thymosin Alpha-1", "LL-37", "Epitalon"],
    evidenceLevel: "animal-model"
  },
  "Hexarelin": {
    contraindications: ["active_malignancy", "cardiomyopathy_until_further_study", "pregnancy", "hyperprolactinemia"],
    halfLife: "~70 minutes",
    dosageRange: { min: 100, max: 200, unit: "mcg", frequency: "three_times_daily" },
    synergies: ["CJC-1295 without DAC + Ipamorelin", "Sermorelin"],
    evidenceLevel: "human-clinical-trial"
  },
  "IGF-1 LR3": {
    contraindications: ["active_malignancy", "diabetic_retinopathy", "hypoglycemia_susceptibility", "acromegaly", "pregnancy"],
    halfLife: "~20-30 hours (LR3 modification extends significantly)",
    dosageRange: { min: 20, max: 100, unit: "mcg", frequency: "daily" },
    synergies: ["CJC-1295 with DAC", "BPC-157"],
    evidenceLevel: "animal-model"
  }
};

async function run() {
  console.log("\n🧠 Phase 11 — Batch C: Neuro, Immune & Sexual Health Enrichment");
  console.log("──────────────────────────────────────────────────────────────────\n");

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

  console.log("\n──────────────────────────────────────────────────────────────────");
  console.log(`✅ Patched  : ${patched}`);
  console.log(`⚠️  Not Found: ${notFound}`);
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
