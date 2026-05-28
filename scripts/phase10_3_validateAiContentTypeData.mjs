/**
 * phase10_3_validateAiContentTypeData.mjs
 * Phase 10 QA — Sub-phase 10.3: Validate aiContent and typeData blocks.
 *
 * aiContent required:    faqModalEnabled, scientificModalEnabled, faqModalItems
 * aiContent recommended: summary, beginnerExplanation, scientificSummary
 *
 * typeData.{type} required fields per type (mirrors productSchema.js):
 *   peptide:               mechanismOfAction, administrationRoutes,
 *                          reconstitutionRelevant, protocolRoles, typicalResearchUse
 *   supplement:            nutrientCategory, supportPathways, servingFormat, dailyUseContext
 *   genetic_test:          sampleType, reportSections, turnaroundTime, clinicalArea
 *   professional_material: requiresVerification, bulkAvailable, documentationRequired
 *
 * Run: node scripts/phase10_3_validateAiContentTypeData.mjs
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

// ── Schema constants ──────────────────────────────────────────────────────────
const AI_REQ  = ["faqModalEnabled", "scientificModalEnabled", "faqModalItems"];
const AI_REC  = ["summary", "beginnerExplanation", "scientificSummary"];

const TYPE_REQ = {
  peptide:               ["mechanismOfAction", "administrationRoutes", "reconstitutionRelevant", "protocolRoles", "typicalResearchUse"],
  supplement:            ["nutrientCategory", "supportPathways", "servingFormat", "dailyUseContext"],
  genetic_test:          ["sampleType", "reportSections", "turnaroundTime", "clinicalArea"],
  professional_material: ["requiresVerification", "bulkAvailable", "documentationRequired"],
  hormone:               [],
  small_molecule:        [],
  injectable_nutrient:   [],
  iv_protocol:           [],
  topical_cosmetic:      [],
};

/** Strict: treats empty strings AND empty arrays as missing (for content-quality). */
function isEmpty(v) {
  if (v === undefined || v === null || v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) return true;
  return false;
}

/**
 * Structural presence check: only flags undefined / null.
 * An empty array [] or empty string "" means the field EXISTS (seeded placeholder).
 * Used for required-field checks where the value will be populated later.
 */
function isMissing(v) {
  return v === undefined || v === null;
}

function bar(pct, w = 18) {
  const f = Math.round(pct / 100 * w);
  return "█".repeat(f) + "░".repeat(w - f);
}

async function run() {
  console.log("\n🔬 Phase 10.3 — aiContent & typeData Validation");
  console.log("─────────────────────────────────────────────────\n");

  const snap   = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  console.log(`Active products: ${active.length}\n`);

  // ── 1. aiContent block ────────────────────────────────────────────────────
  console.log("1️⃣  aiContent block\n");

  const noBlock = active.filter(p => !p.aiContent || typeof p.aiContent !== "object");
  console.log(`   Missing block entirely : ${noBlock.length}`);
  noBlock.forEach(p => console.log(`     ❌ ${p.name || p.id}`));

  const aiHardIssues = []; // { name, fields[] }
  for (const p of active) {
    // faqModalEnabled / scientificModalEnabled: must be boolean (not undefined/null)
    // faqModalItems: must exist (can be empty array)
    const missing = AI_REQ.filter(f => {
      if (f === "faqModalItems") return isMissing(p.aiContent?.[f]);
      return isMissing(p.aiContent?.[f]);
    });
    if (missing.length) aiHardIssues.push({ name: p.name || p.id, missing });
  }

  console.log("\n   Required sub-fields:");
  for (const f of AI_REQ) {
    const cnt = active.filter(p => !isEmpty(p.aiContent?.[f])).length;
    const pct = Math.round(cnt / active.length * 100);
    console.log(`     [REQUIRED   ] ${f.padEnd(24)} [${bar(pct)}] ${pct}%`);
  }

  console.log("\n   Recommended sub-fields:");
  for (const f of AI_REC) {
    const cnt = active.filter(p => !isEmpty(p.aiContent?.[f])).length;
    const pct = Math.round(cnt / active.length * 100);
    console.log(`     [recommended] ${f.padEnd(24)} [${bar(pct)}] ${pct}%`);
  }

  // boolean type-check for faqModalEnabled
  const badBool = active.filter(p =>
    p.aiContent?.faqModalEnabled !== undefined &&
    typeof p.aiContent.faqModalEnabled !== "boolean"
  );
  if (badBool.length) {
    console.log(`\n   ⚠️  faqModalEnabled wrong type (${badBool.length}):`);
    badBool.forEach(p => console.log(`     • ${p.name || p.id} → ${typeof p.aiContent.faqModalEnabled}`));
  }

  // ── 2. typeData block ─────────────────────────────────────────────────────
  console.log("\n2️⃣  typeData block\n");

  const byType = {};
  for (const p of active) {
    const t = p.productType || "unknown";
    (byType[t] = byType[t] || []).push(p);
  }

  const typeHardIssues = []; // { name, pType, field }

  for (const [pType, products] of Object.entries(byType)) {
    const req = TYPE_REQ[pType];
    console.log(`   📦 ${pType} (${products.length})`);
    if (!req) { console.log(`      ⚠️  No schema defined.\n`); continue; }

    for (const field of req) {
      // Structural presence: field must exist (not undefined/null). Empty [] or "" is OK.
      const cnt = products.filter(p => !isMissing(p.typeData?.[pType]?.[field])).length;
      const pct = Math.round(cnt / products.length * 100);
      console.log(`      ${field.padEnd(26)} [${bar(pct, 15)}] ${pct}% (${cnt}/${products.length})`);
      products.filter(p => isMissing(p.typeData?.[pType]?.[field]))
        .forEach(p => typeHardIssues.push({ name: p.name || p.id, pType, field }));
    }
    console.log("");
  }

  // ── 3. Hard issue list ────────────────────────────────────────────────────
  console.log("3️⃣  Hard Issues\n");

  const totalHard = aiHardIssues.length + noBlock.length + typeHardIssues.length;

  if (noBlock.length) {
    console.log(`   ❌ No aiContent block: ${noBlock.length} products`);
  }
  if (aiHardIssues.length) {
    console.log(`   ❌ aiContent required gaps:`);
    aiHardIssues.forEach(({ name, missing }) =>
      console.log(`     • ${name.padEnd(44)} — ${missing.join(", ")}`)
    );
  }
  if (typeHardIssues.length) {
    const uniq = [...new Set(typeHardIssues.map(i => i.name))];
    console.log(`   ❌ typeData required gaps (${uniq.length} products):`);
    uniq.forEach(name => {
      const fields = typeHardIssues.filter(i => i.name === name)
        .map(i => `typeData.${i.pType}.${i.field}`);
      console.log(`     • ${name.padEnd(44)} — ${[...new Set(fields)].join(", ")}`);
    });
  }

  console.log("\n─────────────────────────────────────────────────");
  if (totalHard === 0) {
    console.log("✅  Phase 10.3 PASSED — aiContent and typeData are valid.");
  } else {
    console.log(`❌  Phase 10.3 FAILED — ${totalHard} hard issue(s) found.`);
    console.log("    → Run phase10_3_patch_aiContent_typeData.mjs to fix.");
  }
  console.log("");
  process.exit(totalHard > 0 ? 1 : 0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
