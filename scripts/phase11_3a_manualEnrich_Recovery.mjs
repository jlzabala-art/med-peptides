/**
 * phase11_3a_manualEnrich_Recovery.mjs
 * Phase 11 — Manual Batch A: Recovery & Anti-Aging (10 products)
 *
 * Products:
 * - BPC-157, TB-500, BPC-157 + TB-500 (blend)
 * - GHK-Cu, Epitalon
 * - Selank, Semax
 * - Thymosin Alpha-1
 * - CJC-1295 without DAC + Ipamorelin (blend)
 * - Sermorelin
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
  "BPC-157": {
    contraindications: ["oncological_history", "active_malignancy", "pregnancy", "lactation"],
    halfLife: "1.5-4 hours (sub-q), variable systemic effects up to 24h",
    dosageRange: { min: 200, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["TB-500", "GHK-Cu", "Sermorelin"],
    evidenceLevel: "animal-model"
  },
  "TB-500": {
    contraindications: ["oncological_history", "active_malignancy", "pregnancy"],
    halfLife: "Estimated 7-10 days (long-acting)",
    dosageRange: { min: 2000, max: 5000, unit: "mcg", frequency: "weekly" },
    synergies: ["BPC-157", "GHK-Cu"],
    evidenceLevel: "animal-model"
  },
  "BPC-157 + TB-500": {
    contraindications: ["oncological_history", "active_malignancy", "pregnancy", "lactation"],
    halfLife: "Combination; BPC-157: ~2-4h, TB-500: ~7-10 days",
    dosageRange: { min: 250, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["GHK-Cu", "Sermorelin"],
    evidenceLevel: "animal-model"
  },
  "GHK-Cu": {
    contraindications: ["copper_metabolism_disorders", "Wilson_disease", "pregnancy"],
    halfLife: "~15-30 minutes systemic, prolonged local tissue activity",
    dosageRange: { min: 200, max: 500, unit: "mcg", frequency: "daily" },
    synergies: ["BPC-157", "TB-500", "Epitalon"],
    evidenceLevel: "in-vitro"
  },
  "Epitalon": {
    contraindications: ["active_malignancy", "autoimmune_disorder"],
    halfLife: "Approximately 2 hours",
    dosageRange: { min: 5000, max: 10000, unit: "mcg", frequency: "daily_for_10_20_days" },
    synergies: ["Thymosin Alpha-1", "GHK-Cu"],
    evidenceLevel: "animal-model"
  },
  "Selank": {
    contraindications: ["severe_psychiatric_disorder_requiring_pharmacotherapy", "pregnancy", "lactation"],
    halfLife: "~2-3 minutes (nasal), prolonged anxiolytic effect ~24h",
    dosageRange: { min: 250, max: 750, unit: "mcg", frequency: "daily" },
    synergies: ["Semax", "Dihexa"],
    evidenceLevel: "human-clinical-trial"
  },
  "Semax": {
    contraindications: ["epilepsy", "pregnancy", "acute_psychosis"],
    halfLife: "Nasal: ~20 min, CNS effects persist 20-24h",
    dosageRange: { min: 300, max: 600, unit: "mcg", frequency: "daily" },
    synergies: ["Selank", "Noopept"],
    evidenceLevel: "human-clinical-trial"
  },
  "Thymosin Alpha-1": {
    contraindications: ["organ_transplant_recipients_on_immunosuppressants", "active_autoimmune_disorder"],
    halfLife: "Approximately 2 hours",
    dosageRange: { min: 900, max: 1800, unit: "mcg", frequency: "twice_weekly" },
    synergies: ["Epitalon", "BPC-157"],
    evidenceLevel: "human-clinical-trial"
  },
  "CJC-1295 without DAC + Ipamorelin": {
    contraindications: ["active_malignancy", "diabetic_retinopathy", "carpal_tunnel_syndrome", "pregnancy"],
    halfLife: "CJC-1295 w/o DAC: ~30 min. Ipamorelin: ~2 hours",
    dosageRange: { min: 100, max: 300, unit: "mcg", frequency: "daily_before_sleep" },
    synergies: ["Sermorelin", "GHRP-6"],
    evidenceLevel: "human-clinical-trial"
  },
  "Sermorelin": {
    contraindications: ["active_malignancy", "hypothyroidism_untreated", "pregnancy"],
    halfLife: "~10-20 minutes",
    dosageRange: { min: 200, max: 500, unit: "mcg", frequency: "daily_before_sleep" },
    synergies: ["CJC-1295 without DAC + Ipamorelin", "Ipamorelin"],
    evidenceLevel: "human-clinical-trial"
  }
};

async function run() {
  console.log("\n💉 Phase 11 — Batch A: Recovery & Anti-Aging Enrichment");
  console.log("──────────────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  let patched = 0, skipped = 0, notFound = 0;

  for (const [productName, clinicalData] of Object.entries(CLINICAL_DATA)) {
    const match = active.find(p =>
      (p.name || "").toLowerCase().trim() === productName.toLowerCase().trim()
    );

    if (!match) {
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

    await match._ref.update(updates);
    console.log(`  ✅ ${productName.padEnd(46)} — Enriched.`);
    patched++;
  }

  console.log("\n──────────────────────────────────────────────────────");
  console.log(`✅ Patched  : ${patched}`);
  console.log(`⏭️  Not Found: ${notFound}`);
  console.log(`⏭️  Skipped  : ${skipped}`);
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
