/**
 * phase10_3_patch_aiContent_typeData.mjs
 * Phase 10 QA — Sub-phase 10.3 PATCH
 *
 * Fixes the hard issues detected by phase10_3_validateAiContentTypeData.mjs:
 *
 * 1. aiContent missing block entirely       → seeds minimal canonical block
 * 2. aiContent missing faqModalEnabled/scientificModalEnabled → sets to false
 * 3. aiContent missing faqModalItems        → sets to []
 * 4. typeData.peptide.protocolRoles missing → sets to []
 * 5. typeData.peptide.mechanismOfAction/administrationRoutes/
 *    reconstitutionRelevant/typicalResearchUse missing (specific products)
 * 6. typeData.professional_material fields  → seeds with safe defaults
 * 7. typeData.supplement fields (NMN)       → seeds with safe defaults
 *
 * SAFE defaults: all values are either empty arrays, false booleans, or empty
 * strings — never overwrite an existing populated value.
 *
 * Run (dry-run):  node scripts/phase10_3_patch_aiContent_typeData.mjs
 * Run (live):     node scripts/phase10_3_patch_aiContent_typeData.mjs --live
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue }      from "firebase-admin/firestore";
import { readFileSync }                  from "fs";
import { fileURLToPath }                 from "url";
import { dirname, resolve }              from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svcAccount = JSON.parse(
  readFileSync(resolve(__dirname, "../serviceAccountKey.json"), "utf8")
);
if (!getApps().length) initializeApp({ credential: cert(svcAccount) });
const db = getFirestore();

const LIVE = process.argv.includes("--live");
console.log(`\n🔧 Phase 10.3 — aiContent & typeData PATCH (${LIVE ? "LIVE" : "DRY-RUN"})`);
console.log("─────────────────────────────────────────────────────────\n");

// ── Helpers ──────────────────────────────────────────────────────────────────

function isEmpty(v) {
  if (v === undefined || v === null || v === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  if (typeof v === "object" && !Array.isArray(v) && Object.keys(v).length === 0) return true;
  return false;
}

/** Dot-path getter: get(obj, "a.b.c") */
function get(obj, path) {
  return path.split(".").reduce((acc, k) => acc?.[k], obj);
}

let patchCount = 0;
let skipCount  = 0;

async function applyPatch(docRef, docName, updates) {
  const keys = Object.keys(updates);
  if (keys.length === 0) { skipCount++; return; }

  console.log(`  📝 ${docName}`);
  keys.forEach(k => console.log(`       + ${k} = ${JSON.stringify(updates[k])}`));

  if (LIVE) {
    await docRef.update(updates);
    console.log(`       ✅ written`);
  } else {
    console.log(`       (dry-run — skipped write)`);
  }
  patchCount++;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const snap   = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  console.log(`Active products: ${active.length}\n`);

  // ── Pass 1: aiContent fixes ────────────────────────────────────────────────
  console.log("1️⃣  Patching aiContent block…\n");

  for (const p of active) {
    const updates = {};
    const name    = p.name || p.id;

    // Case A: entire block missing
    if (!p.aiContent || typeof p.aiContent !== "object") {
      updates["aiContent.faqModalEnabled"]      = false;
      updates["aiContent.scientificModalEnabled"] = false;
      updates["aiContent.faqModalItems"]         = [];
      await applyPatch(p._ref, name + " [missing block]", updates);
      continue;
    }

    // Case B: faqModalEnabled missing or wrong type
    if (typeof p.aiContent.faqModalEnabled !== "boolean") {
      updates["aiContent.faqModalEnabled"] =
        p.aiContent.faqModalEnabled === "true" || p.aiContent.faqModalEnabled === 1
          ? true
          : false;
    }

    // Case C: scientificModalEnabled missing or wrong type
    if (typeof p.aiContent.scientificModalEnabled !== "boolean") {
      updates["aiContent.scientificModalEnabled"] =
        p.aiContent.scientificModalEnabled === "true" || p.aiContent.scientificModalEnabled === 1
          ? true
          : false;
    }

    // Case D: faqModalItems missing / null / empty-string
    if (isEmpty(p.aiContent.faqModalItems)) {
      updates["aiContent.faqModalItems"] = [];
    }

    if (Object.keys(updates).length) {
      await applyPatch(p._ref, name, updates);
    }
  }

  // ── Pass 2: typeData.peptide fixes ─────────────────────────────────────────
  console.log("\n2️⃣  Patching typeData.peptide…\n");

  const peptides = active.filter(p => p.productType === "peptide");
  for (const p of peptides) {
    const updates = {};
    const name    = p.name || p.id;
    const base    = `typeData.peptide`;

    // protocolRoles — missing on ALL 80 products, patch to []
    if (isEmpty(get(p, "typeData.peptide.protocolRoles"))) {
      updates[`${base}.protocolRoles`] = [];
    }

    // mechanismOfAction — missing on 3 products
    if (isEmpty(get(p, "typeData.peptide.mechanismOfAction"))) {
      updates[`${base}.mechanismOfAction`] = "";
    }

    // administrationRoutes — missing on Thymosin Alpha-1
    if (isEmpty(get(p, "typeData.peptide.administrationRoutes"))) {
      updates[`${base}.administrationRoutes`] = [];
    }

    // reconstitutionRelevant — missing on Thymosin Alpha-1
    if (get(p, "typeData.peptide.reconstitutionRelevant") === undefined ||
        get(p, "typeData.peptide.reconstitutionRelevant") === null) {
      updates[`${base}.reconstitutionRelevant`] = false;
    }

    // typicalResearchUse — missing on Thymosin Alpha-1
    if (isEmpty(get(p, "typeData.peptide.typicalResearchUse"))) {
      updates[`${base}.typicalResearchUse`] = "";
    }

    if (Object.keys(updates).length) {
      await applyPatch(p._ref, name, updates);
    }
  }

  // ── Pass 3: typeData.professional_material fixes ───────────────────────────
  console.log("\n3️⃣  Patching typeData.professional_material…\n");

  const proMats = active.filter(p => p.productType === "professional_material");
  for (const p of proMats) {
    const updates = {};
    const name    = p.name || p.id;
    const base    = `typeData.professional_material`;

    if (get(p, "typeData.professional_material.requiresVerification") === undefined) {
      updates[`${base}.requiresVerification`] = false;
    }
    if (get(p, "typeData.professional_material.bulkAvailable") === undefined) {
      updates[`${base}.bulkAvailable`] = false;
    }
    if (isEmpty(get(p, "typeData.professional_material.documentationRequired"))) {
      updates[`${base}.documentationRequired`] = [];
    }

    if (Object.keys(updates).length) {
      await applyPatch(p._ref, name, updates);
    }
  }

  // ── Pass 4: typeData.supplement fixes (NMN + any other supplements) ────────
  console.log("\n4️⃣  Patching typeData.supplement…\n");

  const supplements = active.filter(p => p.productType === "supplement");
  for (const p of supplements) {
    const updates = {};
    const name    = p.name || p.id;
    const base    = `typeData.supplement`;

    if (isEmpty(get(p, "typeData.supplement.nutrientCategory"))) {
      updates[`${base}.nutrientCategory`] = "";
    }
    if (isEmpty(get(p, "typeData.supplement.supportPathways"))) {
      updates[`${base}.supportPathways`] = [];
    }
    if (isEmpty(get(p, "typeData.supplement.servingFormat"))) {
      updates[`${base}.servingFormat`] = "";
    }
    if (isEmpty(get(p, "typeData.supplement.dailyUseContext"))) {
      updates[`${base}.dailyUseContext`] = "";
    }

    if (Object.keys(updates).length) {
      await applyPatch(p._ref, name, updates);
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n─────────────────────────────────────────────────────────");
  if (LIVE) {
    console.log(`✅  Patch complete — ${patchCount} document(s) updated, ${skipCount} already clean.`);
  } else {
    console.log(`🔍  Dry-run complete — ${patchCount} document(s) WOULD be updated.`);
    console.log("    Re-run with --live to apply.");
  }
  console.log("");
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
