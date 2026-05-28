/**
 * phase10_4_enrichAiContent.mjs
 * Phase 10 QA — Sub-phase 10.4: Enrich aiContent from local JSON.
 *
 * This script reads src/data/v2/products.v2.json and src/data/v2/supplements.v2.json,
 * extracts 'summary' and 'beginnerExplanation', and writes them into
 * the aiContent map of the corresponding product in Firestore.
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

// Load local V2 data
const productsV2 = JSON.parse(readFileSync(resolve(__dirname, "../src/data/v2/products.v2.json"), "utf8"));
const supplementsV2 = JSON.parse(readFileSync(resolve(__dirname, "../src/data/v2/supplements.v2.json"), "utf8"));

const allLocalData = [...productsV2, ...supplementsV2];

async function run() {
  console.log("\n🔬 Phase 10.4 — Enrich aiContent from V2 JSON");
  console.log("─────────────────────────────────────────────────\n");

  const snap   = await db.collection("products").get();
  const active = snap.docs
    .map(d => ({ _ref: d.ref, id: d.id, ...d.data() }))
    .filter(d => d.isActive !== false && d.status !== "draft");

  console.log(`Active products in DB: ${active.length}\n`);

  let patched = 0;
  let missingLocal = 0;

  const manualNameMap = {
    "TB-500": "TB-500 (Thymosin β4)",
    "Thymosin Alpha-1": "Thymosin Alpha 1"
  };

  const fallbackAiContent = {
    "BPC-157 + TB-500": {
      summary: "A powerful combination of BPC-157 and TB-500 aimed at maximizing tissue repair, accelerating healing, and reducing systemic inflammation.",
      beginnerExplanation: "This blend combines BPC-157, known for healing tendons and the gut, with TB-500, which promotes muscle repair and cellular migration. Together, they offer a comprehensive approach to recovery from injuries.",
      scientificSummary: "The synergistic administration of BPC-157 and Thymosin Beta-4 (TB-500) targets multiple pathways of tissue regeneration. BPC-157 upregulates growth hormone receptors and promotes angiogenesis, while TB-500 acts as an actin-sequestering protein to facilitate cellular migration and tissue remodeling."
    },
    "CJC-1295 without DAC + Ipamorelin": {
      summary: "A synergistic blend of a GHRH analogue and a GHRP designed to naturally stimulate endogenous growth hormone release.",
      beginnerExplanation: "This combination uses CJC-1295 to signal the brain to release growth hormone, and Ipamorelin to amplify this signal. It provides a natural, pulsatile release of GH for improved recovery, anti-aging, and metabolic benefits.",
      scientificSummary: "CJC-1295 without DAC acts as a Growth Hormone Releasing Hormone (GHRH) analogue, stimulating the pituitary, while Ipamorelin, a selective Growth Hormone Secretagogue (GHS), binds to the ghrelin receptor. The co-administration produces a synergistic, pulsatile release of endogenous GH without significantly elevating cortisol or prolactin."
    }
  };

  for (const p of active) {
    const name = p.name || p.id;
    const searchName = manualNameMap[name] || name;
    
    // Find local match. We try to match by name (case insensitive) or id
    const localMatch = allLocalData.find(l => 
      (l.name && l.name.toLowerCase().trim() === searchName.toLowerCase().trim()) || 
      (l.id && l.id === p.id)
    );

    let contentToApply = null;

    if (localMatch && localMatch.aiContent) {
      contentToApply = localMatch.aiContent;
    } else if (fallbackAiContent[name]) {
      contentToApply = fallbackAiContent[name];
      console.log(`  💡  ${name.padEnd(44)} — Using manual fallback AI content.`);
    } else {
      console.log(`  ⚠️  ${name.padEnd(44)} — No local V2 match found.`);
      missingLocal++;
      continue;
    }

    const updates = {};
    if (contentToApply.summary && (!p.aiContent || p.aiContent.summary !== contentToApply.summary)) {
      updates["aiContent.summary"] = contentToApply.summary;
    }
    if (contentToApply.beginnerExplanation && (!p.aiContent || p.aiContent.beginnerExplanation !== contentToApply.beginnerExplanation)) {
      updates["aiContent.beginnerExplanation"] = contentToApply.beginnerExplanation;
    }
    if (contentToApply.scientificSummary && (!p.aiContent || p.aiContent.scientificSummary !== contentToApply.scientificSummary)) {
      updates["aiContent.scientificSummary"] = contentToApply.scientificSummary;
    }

    if (Object.keys(updates).length > 0) {
      await p._ref.update(updates);
      console.log(`  ✅ ${name.padEnd(44)} — Enriched (${Object.keys(updates).join(", ")})`);
      patched++;
    }
  }

  console.log("\n─────────────────────────────────────────────────");
  console.log(`✅  Patched       : ${patched}`);
  console.log(`⚠️   Missing Local : ${missingLocal}`);
  console.log("");
  process.exit(0);
}

run().catch(err => { console.error("Fatal:", err); process.exit(1); });
