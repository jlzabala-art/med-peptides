/**
 * phase10_1_validateProductType.mjs
 * Phase 10 QA — Sub-phase 10.1: Validate productType correctness.
 *
 * Checks:
 *  1. Every active product has a non-empty productType.
 *  2. productType is one of the canonical values.
 *  3. No product is classified as both "peptide" and "supplement".
 *  4. Breakdown by type.
 *
 * Run: node scripts/phase10_1_validateProductType.mjs
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

// ── Canonical types ──────────────────────────────────────────────────────────
const CANONICAL_TYPES = new Set([
  "peptide",
  "supplement",
  "genetic_test",
  "professional_material",
  "stack",
  "hormone",
  "small_molecule",
  "injectable_nutrient",
  "iv_protocol",
  "topical_cosmetic",
]);

// Legacy type names that should have been migrated
const LEGACY_TYPE_ALIASES = {
  "compound"  : "peptide",
  "compounds" : "peptide",
  "drug"      : "peptide",
  "vitamin"   : "supplement",
  "mineral"   : "supplement",
  "nutraceutical": "supplement",
};

// ────────────────────────────────────────────────────────────────────────────

async function run() {
  console.log("\n🔬 Phase 10.1 — productType Validation");
  console.log("─────────────────────────────────────────────\n");

  const snap = await db.collection("products").get();
  const all  = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const active = all.filter(d => d.isActive !== false && d.status !== "draft");

  console.log(`Total products (all)   : ${all.length}`);
  console.log(`Active/published       : ${active.length}\n`);

  // ── 1. Missing productType ─────────────────────────────────────────────────
  const missingType = active.filter(d => !d.productType || d.productType.trim() === "");
  console.log(`1️⃣  Missing productType : ${missingType.length}`);
  if (missingType.length > 0) {
    missingType.forEach(d =>
      console.log(`   ❌ ${(d.name || d.id).padEnd(40)} slug: ${d.slug || "—"}`)
    );
  } else {
    console.log("   ✅ All active products have a productType.");
  }

  // ── 2. Non-canonical productType ─────────────────────────────────────────
  const nonCanonical = active.filter(
    d => d.productType && !CANONICAL_TYPES.has(d.productType)
  );
  console.log(`\n2️⃣  Non-canonical productType : ${nonCanonical.length}`);
  if (nonCanonical.length > 0) {
    nonCanonical.forEach(d => {
      const suggested = LEGACY_TYPE_ALIASES[d.productType] || "unknown";
      console.log(`   ⚠️  ${(d.name || d.id).padEnd(40)} type: "${d.productType}"  →  suggested: "${suggested}"`);
    });
  } else {
    console.log("   ✅ All productTypes are canonical.");
  }

  // ── 3. Type breakdown ────────────────────────────────────────────────────
  console.log("\n3️⃣  Breakdown by productType:");
  const byType = {};
  for (const d of active) {
    const t = d.productType || "__missing__";
    byType[t] = (byType[t] || 0) + 1;
  }
  const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  sorted.forEach(([type, count]) => {
    const bar = "█".repeat(Math.round(count / active.length * 30));
    const flag = CANONICAL_TYPES.has(type) ? "✅" : "❌";
    console.log(`   ${flag} ${type.padEnd(24)} ${String(count).padStart(4)}  ${bar}`);
  });

  // ── 4. Supplement ≠ Peptide cross-check ──────────────────────────────────
  // Look for supplements that have peptide-only fields (mechanismOfAction, reconstitutionRelevant)
  const mislabeledSupplement = active.filter(d =>
    d.productType === "supplement" &&
    (d.typeData?.peptide || d.mechanismOfAction || d.reconstitutionRelevant)
  );
  console.log(`\n4️⃣  Supplements with peptide-only fields : ${mislabeledSupplement.length}`);
  if (mislabeledSupplement.length > 0) {
    mislabeledSupplement.forEach(d =>
      console.log(`   ⚠️  ${d.name || d.id} — has typeData.peptide or legacy peptide fields`)
    );
  } else {
    console.log("   ✅ No supplements carrying peptide-only fields.");
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const passed = missingType.length === 0 && nonCanonical.length === 0 && mislabeledSupplement.length === 0;
  console.log("\n─────────────────────────────────────────────");
  if (passed) {
    console.log("✅  Phase 10.1 PASSED — productType is clean and canonical.");
  } else {
    const issues = missingType.length + nonCanonical.length + mislabeledSupplement.length;
    console.log(`❌  Phase 10.1 FAILED — ${issues} issue(s) found. Fix before Phase 10.2.`);
  }
  console.log("");
  process.exit(passed ? 0 : 1);
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
