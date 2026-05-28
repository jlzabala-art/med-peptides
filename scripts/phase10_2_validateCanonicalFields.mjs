/**
 * phase10_2_validateCanonicalFields.mjs  (v3 — clean model)
 * Phase 10 QA — Sub-phase 10.2: Validate canonical fields after goals restructure.
 *
 * Model (post-patch):
 *   goals[]           → ONLY the 7 canonical values
 *   secondaryFactors[] → granular/specific descriptors
 *   mechanisms[]       → required, ≥1 item
 *   semanticKeywords[] → required, ≥1 item
 *   safetyNote         → recommended string
 *   synonyms[]         → recommended array
 *
 * Run: node scripts/phase10_2_validateCanonicalFields.mjs
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

const CANONICAL_7 = new Set([
  "cognitive_mood",
  "hormonal_optimization",
  "immune_support",
  "longevity_anti_aging",
  "metabolic_weight",
  "recovery_repair",
  "sleep_circadian",
]);

const REQUIRED_FIELDS    = ["goals", "mechanisms", "semanticKeywords"];
const RECOMMENDED_FIELDS = ["safetyNote", "synonyms"];

function isEmpty(val) {
  if (val === undefined || val === null || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

function bar(pct, w = 20) {
  return "█".repeat(Math.round(pct / 100 * w)) + "░".repeat(w - Math.round(pct / 100 * w));
}

async function run() {
  console.log("\n🔬 Phase 10.2 — Canonical Fields Validation (v3)");
  console.log("─────────────────────────────────────────────────\n");

  const snap   = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  console.log(`Active products: ${active.length}\n`);

  // ── 1. Field coverage ─────────────────────────────────────────────────────
  console.log("1️⃣  Field coverage:\n");
  for (const f of [...REQUIRED_FIELDS, ...RECOMMENDED_FIELDS]) {
    const missing = active.filter(d => isEmpty(d[f])).length;
    const pct     = Math.round((active.length - missing) / active.length * 100);
    const tag     = REQUIRED_FIELDS.includes(f) ? "REQUIRED   " : "recommended";
    console.log(`   [${tag}] ${f.padEnd(18)} [${bar(pct)}] ${pct}% (${active.length - missing}/${active.length})`);
  }

  // ── 2. goals purity — must be ONLY canonical 7 ───────────────────────────
  console.log("\n2️⃣  goals[] purity — only canonical 7 allowed:");
  const dirtyGoals = [];
  for (const p of active) {
    const bad = (p.goals || []).filter(g => !CANONICAL_7.has(g));
    if (bad.length > 0) dirtyGoals.push({ name: p.name || p.id, bad });
  }
  if (dirtyGoals.length === 0) {
    console.log("   ✅ All products have only canonical goals.");
  } else {
    dirtyGoals.forEach(({ name, bad }) =>
      console.log(`   ❌ ${name.padEnd(44)} non-canonical: ${bad.join(", ")}`)
    );
  }

  // ── 3. Products with REQUIRED fields missing ──────────────────────────────
  const hardIssues = active.filter(p => REQUIRED_FIELDS.some(f => isEmpty(p[f])));
  console.log(`\n3️⃣  Products missing REQUIRED fields : ${hardIssues.length}`);
  if (hardIssues.length > 0) {
    hardIssues.forEach(p => {
      const missing = REQUIRED_FIELDS.filter(f => isEmpty(p[f]));
      console.log(`   ❌ ${(p.name || p.id).padEnd(44)} — ${missing.join(", ")}`);
    });
  } else {
    console.log("   ✅ All required fields present.");
  }

  // ── 4. Recommended fields ─────────────────────────────────────────────────
  const softIssues = active.filter(p => RECOMMENDED_FIELDS.some(f => isEmpty(p[f])));
  console.log(`\n4️⃣  Products missing RECOMMENDED fields : ${softIssues.length}`);
  if (softIssues.length > 0) {
    softIssues.forEach(p => {
      const missing = RECOMMENDED_FIELDS.filter(f => isEmpty(p[f]));
      console.log(`   ⚠️  ${(p.name || p.id).padEnd(44)} — ${missing.join(", ")}`);
    });
  } else {
    console.log("   ✅ All recommended fields present.");
  }

  // ── Verdict ───────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────");
  const failed = hardIssues.length > 0 || dirtyGoals.length > 0;
  if (!failed) {
    console.log("✅  Phase 10.2 PASSED.");
    if (softIssues.length > 0)
      console.log(`    ⚠️  ${softIssues.length} product(s) still missing recommended fields (synonyms).`);
  } else {
    console.log(`❌  Phase 10.2 FAILED — ${hardIssues.length + dirtyGoals.length} hard issue(s).`);
  }
  console.log("");
  process.exit(failed ? 1 : 0);
}

run().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
