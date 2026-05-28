/**
 * phase11_1_validateClinicalSchema.mjs
 * Validates the new Phase 11 ClinicalAI fields (contraindications, halfLife, dosageRange, synergies, evidenceLevel)
 * in the typeData block for peptides and supplements.
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

const ALLOWED_EVIDENCE_LEVELS = ["in-vitro", "animal-model", "human-clinical-trial", "anecdotal"];

async function run() {
  console.log("\n🔬 Phase 11.1 — Advanced Clinical Schema Validation");
  console.log("───────────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  console.log(`Active products: ${active.length}\n`);

  let totalValid = 0;
  let missingFields = 0;
  let typeErrors = 0;

  for (const p of active) {
    const type = p.productType;
    if (type !== "peptide" && type !== "supplement") {
      // Professional materials don't need clinical fields
      continue;
    }

    const t = p.typeData || {};
    let hasError = false;
    let missing = [];

    // Check contraindications
    if (!t.contraindications) {
      missing.push("contraindications");
    } else if (!Array.isArray(t.contraindications)) {
      console.log(`  ❌ ${p.name || p.id} - typeData.contraindications must be an array`);
      typeErrors++;
      hasError = true;
    }

    // Check halfLife
    if (!t.halfLife) {
      missing.push("halfLife");
    } else if (typeof t.halfLife !== "string") {
      console.log(`  ❌ ${p.name || p.id} - typeData.halfLife must be a string`);
      typeErrors++;
      hasError = true;
    }

    // Check dosageRange
    if (!t.dosageRange) {
      missing.push("dosageRange");
    } else if (typeof t.dosageRange !== "object" || Array.isArray(t.dosageRange)) {
      console.log(`  ❌ ${p.name || p.id} - typeData.dosageRange must be an object`);
      typeErrors++;
      hasError = true;
    } else {
      const d = t.dosageRange;
      if (typeof d.min !== "number" || typeof d.max !== "number" || typeof d.unit !== "string" || typeof d.frequency !== "string") {
         console.log(`  ❌ ${p.name || p.id} - typeData.dosageRange is missing required fields (min, max, unit, frequency)`);
         typeErrors++;
         hasError = true;
      }
    }

    // Check synergies
    if (!t.synergies) {
      missing.push("synergies");
    } else if (!Array.isArray(t.synergies)) {
      console.log(`  ❌ ${p.name || p.id} - typeData.synergies must be an array`);
      typeErrors++;
      hasError = true;
    }

    // Check evidenceLevel
    if (!t.evidenceLevel) {
      missing.push("evidenceLevel");
    } else if (!ALLOWED_EVIDENCE_LEVELS.includes(t.evidenceLevel)) {
      console.log(`  ❌ ${p.name || p.id} - typeData.evidenceLevel must be one of: ${ALLOWED_EVIDENCE_LEVELS.join(", ")}`);
      typeErrors++;
      hasError = true;
    }

    if (missing.length > 0) {
      // We log as warning because initially all of them will be missing until the enrichment script is run
      // console.log(`  ⚠️  ${(p.name || p.id).padEnd(44)} - Missing: ${missing.join(", ")}`);
      missingFields++;
      hasError = true;
    }

    if (!hasError) {
      totalValid++;
    }
  }

  console.log(`\n───────────────────────────────────────────────────`);
  console.log(`✅ Fully enriched & Valid : ${totalValid}`);
  console.log(`⚠️  Missing new fields     : ${missingFields}`);
  console.log(`❌ Type Errors            : ${typeErrors}`);
  
  if (typeErrors > 0) {
    console.error(`\n❌ Validation Failed: Please fix the type errors above.`);
    process.exit(1);
  }
  
  if (missingFields > 0) {
    console.log(`\n💡 Run phase11_2_autoEnrichClinicalFields.mjs to populate the missing fields.`);
  }

  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
