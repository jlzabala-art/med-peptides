/**
 * phase11_4d_propagate_duplicates.mjs
 * Phase 11 — Batch G: Propagate clinical data to duplicate SKUs
 *
 * These are products that exist in Firestore under the same name
 * (different vial sizes/concentrations) but were not enriched because
 * a previous script already enriched one sibling document and stopped.
 * This script copies the clinical fields from the enriched sibling to
 * all unenriched documents with the same name.
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

async function run() {
  console.log("\n🔁 Phase 11 — Batch G: Propagate Clinical Data to Duplicate SKUs");
  console.log("─────────────────────────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  // Group by name
  const byName = {};
  for (const p of active) {
    const name = (p.name || "").trim();
    if (!byName[name]) byName[name] = [];
    byName[name].push(p);
  }

  let patched = 0, skipped = 0;

  for (const [name, docs] of Object.entries(byName)) {
    if (docs.length <= 1) continue; // No duplicates

    const enriched = docs.find(d => d.typeData?.contraindications);
    const unenriched = docs.filter(d => !d.typeData?.contraindications);

    if (!enriched || unenriched.length === 0) continue;

    const t = enriched.typeData;
    const updates = {
      "typeData.contraindications": t.contraindications,
      "typeData.halfLife":          t.halfLife,
      "typeData.dosageRange":       t.dosageRange,
      "typeData.synergies":         t.synergies,
      "typeData.evidenceLevel":     t.evidenceLevel
    };

    for (const doc of unenriched) {
      await doc._ref.update(updates);
      patched++;
      console.log(`  ✅ "${name}" [${doc.id}] — propagated from sibling.`);
    }
  }

  if (patched === 0) {
    console.log("  ℹ️  No unenriched duplicates found. All siblings already enriched.");
  }

  console.log("\n─────────────────────────────────────────────────────────────────");
  console.log(`✅ Propagated : ${patched} documents`);
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
