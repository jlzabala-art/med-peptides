/**
 * audit_ai_fields.mjs
 * Audits Firestore products & protocols for AI scoring field coverage.
 * Run: node scripts/audit_ai_fields.mjs
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

// ── Canonical goals taxonomy (7 goals — matches protocols.metadata.primary_goal) ──
const CANONICAL_GOALS = new Set([
  "cognitive_mood",
  "hormonal_optimization",
  "immune_support",
  "longevity_anti_aging",
  "metabolic_weight",
  "recovery_repair",
  "sleep_circadian",
  // Utility goal (products only, no protocol equivalent)
  "dosage",
]);

const REQUIRED_PRODUCT_FIELDS = ["goals", "semanticKeywords", "mechanisms", "secondaryFactors", "searchAliases"];
const REQUIRED_PROTOCOL_FIELDS = ["metadata.primary_goal", "eligibility_rules.indications", "expected_outcomes.qualitative", "overview_summary"];

function getNestedField(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function isEmptyField(val) {
  if (val === undefined || val === null || val === "") return true;
  if (Array.isArray(val) && val.length === 0) return true;
  return false;
}

function checkGoalVocabulary(goals = []) {
  const unknown = goals.filter(g => !CANONICAL_GOALS.has(g));
  return unknown;
}

// ─────────────────────────────────────────────────────────────────────────────

async function auditProducts() {
  console.log("\n══════════════════════════════════════════════");
  console.log("  PRODUCTS AUDIT");
  console.log("══════════════════════════════════════════════");

  const snap = await db.collection("products").where("isActive", "==", true).get();
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Total active products: ${docs.length}\n`);

  const issues = [];

  for (const doc of docs) {
    const missing = REQUIRED_PRODUCT_FIELDS.filter(f => isEmptyField(getNestedField(doc, f)));
    const unknownGoals = checkGoalVocabulary(doc.goals || []);
    const unknownSecondary = checkGoalVocabulary(doc.secondaryFactors || []);

    if (missing.length > 0 || unknownGoals.length > 0 || unknownSecondary.length > 0) {
      issues.push({ name: doc.name || doc.id, slug: doc.slug, missing, unknownGoals, unknownSecondary });
    }
  }

  if (issues.length === 0) {
    console.log("✅ All products have complete AI fields.");
    return;
  }

  // Sort by number of missing fields (worst first)
  issues.sort((a, b) => b.missing.length - a.missing.length);

  console.log(`⚠️  ${issues.length} products with issues:\n`);
  for (const p of issues) {
    console.log(`  📦 ${p.name} (${p.slug || "no-slug"})`);
    if (p.missing.length) console.log(`     ❌ Missing fields : ${p.missing.join(", ")}`);
    if (p.unknownGoals.length) console.log(`     ⚠️  Non-canonical goals: ${p.unknownGoals.join(", ")}`);
    if (p.unknownSecondary.length) console.log(`     ⚠️  Non-canonical secondaryFactors: ${p.unknownSecondary.join(", ")}`);
  }

  // Summary table
  console.log("\n── Field Coverage Summary ──────────────────────");
  for (const field of REQUIRED_PRODUCT_FIELDS) {
    const missing = docs.filter(d => isEmptyField(getNestedField(d, field))).length;
    const pct = Math.round(((docs.length - missing) / docs.length) * 100);
    const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
    console.log(`  ${field.padEnd(22)} [${bar}] ${pct}% (${docs.length - missing}/${docs.length})`);
  }
}

async function auditProtocols() {
  console.log("\n══════════════════════════════════════════════");
  console.log("  PROTOCOLS AUDIT");
  console.log("══════════════════════════════════════════════");

  const snap = await db.collection("protocols").where("active", "==", true).get();
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  console.log(`Total active protocols: ${docs.length}\n`);

  const issues = [];

  for (const doc of docs) {
    const missing = REQUIRED_PROTOCOL_FIELDS.filter(f => isEmptyField(getNestedField(doc, f)));
    if (missing.length > 0) {
      issues.push({ id: doc.id, summary: doc.overview_summary, missing });
    }
  }

  if (issues.length === 0) {
    console.log("✅ All protocols have complete AI fields.");
    return;
  }

  issues.sort((a, b) => b.missing.length - a.missing.length);

  console.log(`⚠️  ${issues.length} protocols with issues:\n`);
  for (const p of issues) {
    console.log(`  📋 ${p.summary || p.id}`);
    if (p.missing.length) console.log(`     ❌ Missing: ${p.missing.join(", ")}`);
  }

  console.log("\n── Field Coverage Summary ──────────────────────");
  for (const field of REQUIRED_PROTOCOL_FIELDS) {
    const missing = docs.filter(d => isEmptyField(getNestedField(d, field))).length;
    const pct = docs.length > 0 ? Math.round(((docs.length - missing) / docs.length) * 100) : 0;
    const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
    console.log(`  ${field.padEnd(36)} [${bar}] ${pct}% (${docs.length - missing}/${docs.length})`);
  }
}

async function auditGaps() {
  console.log("\n══════════════════════════════════════════════");
  console.log("  TOP UNANSWERED QUERIES (last 7 days)");
  console.log("══════════════════════════════════════════════");

  try {
    const snap = await db.collection("clinical_logs")
      .orderBy("timestamp", "desc")
      .limit(200)
      .get();

    const gaps = snap.docs
      .map(d => d.data())
      .filter(d => (!d.matchedPeptides || d.matchedPeptides.length === 0) && (!d.matchedProtocols || d.matchedProtocols.length === 0));

    if (gaps.length === 0) {
      console.log("✅ No unanswered queries found in recent logs.");
      return;
    }

    // Count frequency
    const freq = {};
    gaps.forEach(g => {
      const q = g.userQuery?.toLowerCase().trim();
      if (q) freq[q] = (freq[q] || 0) + 1;
    });

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);
    console.log(`\n  ${gaps.length} unanswered queries. Top recurring:\n`);
    sorted.forEach(([q, n]) => console.log(`  (${n}x) "${q}"`));
  } catch (e) {
    console.log("  ⚠️  Could not read clinical_logs:", e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔬 Med-Peptides AI Field Audit");
  console.log("─────────────────────────────────────────────\n");

  await auditProducts();
  await auditProtocols();
  await auditGaps();

  console.log("\n✅ Audit complete.\n");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
