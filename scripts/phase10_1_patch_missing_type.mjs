/**
 * phase10_1_patch_missing_type.mjs
 * Patches the one product missing productType found in Phase 10.1.
 *
 * Thymosin Alpha-1 (slug: Thymosin_Alpha1-6mg-vial)
 *   Source: PubMed PMID 35878942 — "Thymosin alpha-1: a multitask endogenous
 *   immunomodulator" | DrugBank DB14009
 *   Classification: Peptide — 28 amino-acid chain, thymic origin.
 *   productType = "peptide"  ✅
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore }                  from "firebase-admin/firestore";
import { readFileSync }                  from "fs";
import { fileURLToPath }                 from "url";
import { dirname, resolve }              from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  console.log("\n🩹 Phase 10.1 — Patch missing productType");
  console.log("──────────────────────────────────────────\n");

  // Find by slug (safer than doc ID)
  const snap = await db.collection("products")
    .where("slug", "==", "Thymosin_Alpha1-6mg-vial")
    .limit(1)
    .get();

  if (snap.empty) {
    // Try by name fallback
    const snap2 = await db.collection("products")
      .where("name", "==", "Thymosin Alpha-1")
      .limit(1)
      .get();

    if (snap2.empty) {
      console.log("❌ Product not found by slug or name. Aborting.");
      process.exit(1);
    }
    const doc = snap2.docs[0];
    await doc.ref.update({ productType: "peptide", migrationVersion: 10 });
    console.log(`✅ Patched by name: ${doc.id}  →  productType = "peptide"`);
  } else {
    const doc = snap.docs[0];
    const before = doc.data().productType || "__missing__";
    await doc.ref.update({ productType: "peptide", migrationVersion: 10 });
    console.log(`✅ Patched: ${doc.id}`);
    console.log(`   Before : "${before}"`);
    console.log(`   After  : "peptide"`);
    console.log(`   Source : PubMed PMID 35878942 / DrugBank DB14009`);
  }

  console.log("\n─────────────────────────────────────────────");
  console.log("✅ Patch complete. Re-run 10.1 to confirm.\n");
  process.exit(0);
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
