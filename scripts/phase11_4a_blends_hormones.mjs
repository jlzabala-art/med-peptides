/**
 * phase11_4a_blends_hormones.mjs
 * Phase 11 — Batch D: Blends, GHK-Cu variants & Hormones
 *
 * Products:
 * - GHK-Cu (Copper Peptide), TB-500 (Thymosin β4)
 * - GLOW blend, KLOW blend
 * - HCG, HGH, HMG
 * - MK-677 (Ibutamoren)
 * - CJC-1295 without DAC (Modified GRF 1-29)
 * - Cagrilintide
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
  "GHK-Cu (Copper Peptide)": {
    contraindications: ["copper_metabolism_disorder", "Wilson_disease", "pregnancy", "known_copper_sensitivity"],
    halfLife: "~15-30 minutes systemic; prolonged local tissue activity (hours)",
    dosageRange: { min: 200, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["BPC-157", "TB-500", "Epithalon"],
    evidenceLevel: "in-vitro"
  },
  "TB-500 (Thymosin β4)": {
    contraindications: ["oncological_history", "active_malignancy", "pregnancy"],
    halfLife: "Estimated 7-10 days (long-acting fragment)",
    dosageRange: { min: 2000, max: 5000, unit: "mcg", frequency: "weekly" },
    synergies: ["BPC-157", "GHK-Cu (Copper Peptide)"],
    evidenceLevel: "animal-model"
  },
  "GLOW (BPC-157/TB-500/GHK-Cu)": {
    contraindications: ["oncological_history", "active_malignancy", "pregnancy", "lactation", "copper_metabolism_disorder"],
    halfLife: "Composite: BPC-157 ~2-4h / TB-500 ~7-10 days / GHK-Cu ~15-30 min",
    dosageRange: { min: 250, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["Sermorelin", "Thymosin Alpha-1"],
    evidenceLevel: "animal-model"
  },
  "KLOW (BPC-157/TB-500/GHK-Cu/KPV)": {
    contraindications: ["oncological_history", "active_malignancy", "pregnancy", "lactation", "copper_metabolism_disorder"],
    halfLife: "Composite: BPC-157 ~2-4h / TB-500 ~7-10 days / GHK-Cu ~15-30 min / KPV ~2-4h",
    dosageRange: { min: 250, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["Thymosin Alpha-1", "Selank"],
    evidenceLevel: "animal-model"
  },
  "HCG": {
    contraindications: ["hormone_sensitive_cancer", "precocious_puberty", "pregnancy", "ovarian_cysts_pcos", "active_thromboembolism"],
    halfLife: "~24-36 hours",
    dosageRange: { min: 250, max: 1000, unit: "IU", frequency: "2-3x_weekly" },
    synergies: ["Testosterone", "HMG"],
    evidenceLevel: "human-clinical-trial"
  },
  "HGH": {
    contraindications: ["active_malignancy", "diabetic_retinopathy", "carpal_tunnel_syndrome", "closed_epiphyses", "critical_illness", "pregnancy"],
    halfLife: "~15-30 minutes (subcutaneous peak at 3-5h, effects 12-18h)",
    dosageRange: { min: 1, max: 4, unit: "IU", frequency: "daily" },
    synergies: ["IGF-1 LR3", "Tesamorelin", "CJC-1295 with DAC"],
    evidenceLevel: "human-clinical-trial"
  },
  "HMG": {
    contraindications: ["hormone_sensitive_cancer", "primary_ovarian_failure", "ovarian_cysts", "thyroid_adrenal_disorders_untreated", "pregnancy"],
    halfLife: "FSH: ~24-36h, LH: ~20-30h",
    dosageRange: { min: 75, max: 225, unit: "IU", frequency: "daily_or_alternate_days" },
    synergies: ["HCG"],
    evidenceLevel: "human-clinical-trial"
  },
  "MK-677 (Ibutamoren)": {
    contraindications: ["active_malignancy", "diabetic_retinopathy", "carpal_tunnel_syndrome", "insulin_resistance", "congestive_heart_failure", "pregnancy"],
    halfLife: "~24 hours (oral)",
    dosageRange: { min: 10, max: 25, unit: "mg", frequency: "daily_oral" },
    synergies: ["CJC-1295 with DAC", "Ipamorelin", "HGH"],
    evidenceLevel: "human-clinical-trial"
  },
  "CJC-1295 without DAC (Modified GRF 1-29)": {
    contraindications: ["active_malignancy", "diabetic_retinopathy", "carpal_tunnel_syndrome", "pregnancy"],
    halfLife: "~30 minutes",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "daily_before_sleep" },
    synergies: ["Ipamorelin", "GHRP-2"],
    evidenceLevel: "human-clinical-trial"
  },
  "Cagrilintide": {
    contraindications: ["personal_or_family_history_medullary_thyroid_carcinoma", "MEN2_syndrome", "active_pancreatitis", "pregnancy"],
    halfLife: "~7-8 days",
    dosageRange: { min: 1, max: 4.5, unit: "mg", frequency: "weekly_subcutaneous" },
    synergies: ["Semaglutide"],
    evidenceLevel: "human-clinical-trial"
  }
};

async function run() {
  console.log("\n🧬 Phase 11 — Batch D: Blends, GHK-Cu & Hormones");
  console.log("─────────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  let patched = 0, skipped = 0, notFound = 0;

  for (const [productName, clinicalData] of Object.entries(CLINICAL_DATA)) {
    // Match ALL documents with this name (handles duplicates)
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

  console.log("\n─────────────────────────────────────────────────");
  console.log(`✅ Patched  : ${patched} documents`);
  console.log(`⚠️  Not Found: ${notFound} product names`);
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
