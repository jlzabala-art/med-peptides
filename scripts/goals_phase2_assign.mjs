/**
 * goals_phase2_assign.mjs
 *
 * Phase 2 of Goals Migration:
 *   Assigns goalIds[] to the ~516 products that have NO goals.
 *   Strategy:
 *     1. categoryId-based auto-assignment (genetic_test, biomarker_test, etc.)
 *     2. Name + ID based heuristic mapping for peptides and supplements
 *     3. Fallback to general_wellness
 *
 * Usage:
 *   node scripts/goals_phase2_assign.mjs --dry-run   (preview + CSV)
 *   node scripts/goals_phase2_assign.mjs              (write to Firestore)
 */

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, "serviceAccountKey.json"), "utf8")
);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const DRY_RUN = process.argv.includes("--dry-run");

// -- Category-based auto-mapping --
const CATEGORY_GOAL_MAP = {
  genetic_test:      ["genomics"],
  biomarker_test:    ["biomarkers"],
  excipient:         ["general_wellness"],
  medical_device:    ["general_wellness"],
  consumable:        ["general_wellness"],
  service:           ["general_wellness"],
};

// -- Name-based heuristic rules --
// Each rule: { pattern: RegExp, goals: string[] }
// First match wins (most specific patterns first).
const NAME_RULES = [
  // --- Weight Loss / GLP-1 ---
  { pattern: /semaglutide|tirzepatide|liraglutide|retatrutide|cagrilintide|survodutide|orforglipron/i, goals: ["weight_loss_glp1", "metabolic_health"] },
  { pattern: /aod[\s-]?9604|tesamorelin/i, goals: ["weight_loss_glp1", "performance_muscle"] },
  { pattern: /5[\s-]?amino[\s-]?1[\s-]?mq|mots[\s-]?c/i, goals: ["weight_loss_glp1", "metabolic_health"] },
  { pattern: /adipotide/i, goals: ["weight_loss_glp1"] },
  { pattern: /orlistat/i, goals: ["weight_loss_glp1", "metabolic_health"] },
  { pattern: /gw[\s-]?501516|cardarine/i, goals: ["weight_loss_glp1", "performance_muscle", "metabolic_health"] },
  { pattern: /aicar/i, goals: ["weight_loss_glp1", "metabolic_health", "performance_muscle"] },
  { pattern: /glp[\s-]?3/i, goals: ["weight_loss_glp1", "recovery_healing"] },

  // --- Recovery and Healing ---
  { pattern: /bpc[\s-]?157/i, goals: ["recovery_healing"] },
  { pattern: /\bbpc\b/i, goals: ["recovery_healing"] },
  { pattern: /tb[\s-]?500|thymosin[\s-]?b?4/i, goals: ["recovery_healing", "immune_support"] },
  { pattern: /pentadecapeptide/i, goals: ["recovery_healing"] },
  { pattern: /kpv/i, goals: ["recovery_healing", "immune_support"] },
  { pattern: /glow|klow|healing[\s-]?blend/i, goals: ["recovery_healing"] },
  { pattern: /collagen/i, goals: ["recovery_healing", "skin_hair_aesthetics"] },
  { pattern: /ara[\s-]?290/i, goals: ["recovery_healing", "immune_support"] },
  { pattern: /wolverine|repair[\s-]?bundle/i, goals: ["recovery_healing"] },
  { pattern: /tissue[\s-]?regeneration/i, goals: ["recovery_healing", "skin_hair_aesthetics"] },

  // --- Cognitive and Mood ---
  { pattern: /selank/i, goals: ["cognitive_mood", "immune_support"] },
  { pattern: /semax/i, goals: ["cognitive_mood"] },
  { pattern: /dihexa/i, goals: ["cognitive_mood"] },
  { pattern: /pe[\s-]?22/i, goals: ["cognitive_mood"] },
  { pattern: /lion[\s']?s[\s-]?mane/i, goals: ["cognitive_mood"] },
  { pattern: /nootropic|brain/i, goals: ["cognitive_mood"] },
  { pattern: /melatonin|sleep/i, goals: ["cognitive_mood"] },
  { pattern: /oxytocin/i, goals: ["cognitive_mood", "hormonal_optimization"] },
  { pattern: /cerebrolysin/i, goals: ["cognitive_mood"] },
  { pattern: /\bdsip\b/i, goals: ["cognitive_mood"] },
  { pattern: /pinetonin/i, goals: ["cognitive_mood"] },
  { pattern: /bupropion/i, goals: ["cognitive_mood"] },
  { pattern: /chloral[\s-]?hydrat|cloral[\s-]?hidrat/i, goals: ["cognitive_mood"] },

  // --- Hormonal Optimization ---
  { pattern: /cjc[\s-]?1295/i, goals: ["hormonal_optimization"] },
  { pattern: /\bcjc\b/i, goals: ["hormonal_optimization"] },
  { pattern: /ipamorelin/i, goals: ["hormonal_optimization"] },
  { pattern: /ghrp[\s-]?\d/i, goals: ["hormonal_optimization"] },
  { pattern: /ghrh/i, goals: ["hormonal_optimization"] },
  { pattern: /hexarelin/i, goals: ["hormonal_optimization"] },
  { pattern: /sermorelin/i, goals: ["hormonal_optimization"] },
  { pattern: /mk[\s-]?677|ibutamoren/i, goals: ["hormonal_optimization", "performance_muscle"] },
  { pattern: /hgh|growth[\s-]?hormone/i, goals: ["hormonal_optimization"] },
  { pattern: /hcg/i, goals: ["hormonal_optimization", "fertility"] },
  { pattern: /hmg/i, goals: ["hormonal_optimization", "fertility"] },
  { pattern: /clomiphene|clomid|enclomiphene/i, goals: ["hormonal_optimization", "fertility"] },
  { pattern: /gonadorelin|gnrh|triptorelin/i, goals: ["hormonal_optimization"] },
  { pattern: /anastrozole|letrozole|exemestane/i, goals: ["hormonal_optimization"] },
  { pattern: /testosterone/i, goals: ["hormonal_optimization"] },
  { pattern: /dhea|pregnenolone/i, goals: ["hormonal_optimization"] },
  { pattern: /tadalafil|sildenafil|cialis|viagra/i, goals: ["hormonal_optimization"] },
  { pattern: /pt[\s-]?141|bremelanotide/i, goals: ["hormonal_optimization", "fertility"] },
  { pattern: /kisspeptin/i, goals: ["hormonal_optimization", "fertility"] },
  { pattern: /gestrinone/i, goals: ["hormonal_optimization"] },
  { pattern: /spironolactone/i, goals: ["hormonal_optimization"] },
  { pattern: /saw[\s-]?palmetto/i, goals: ["hormonal_optimization"] },
  { pattern: /fst[\s-]?344|follistatin/i, goals: ["hormonal_optimization", "performance_muscle"] },
  { pattern: /estriol|estradiol/i, goals: ["hormonal_optimization"] },
  { pattern: /levothyroxine|thyroid/i, goals: ["hormonal_optimization", "metabolic_health"] },

  // --- Performance and Muscle ---
  { pattern: /igf[\s-]?1|igf[\s-]?lr3|mgf|mechano/i, goals: ["performance_muscle", "recovery_healing"] },
  { pattern: /yk[\s-]?11/i, goals: ["performance_muscle"] },
  { pattern: /rad[\s-]?140|ostarine|lgd[\s-]?4033|sr[\s-]?9009/i, goals: ["performance_muscle"] },
  { pattern: /creatine/i, goals: ["performance_muscle"] },
  { pattern: /l[\s-]?carnitine/i, goals: ["performance_muscle", "metabolic_health"] },
  { pattern: /\barginine\b/i, goals: ["performance_muscle", "general_wellness"] },
  { pattern: /l[\s-]?arginine|l[\s-]?citrulline/i, goals: ["performance_muscle", "general_wellness"] },
  { pattern: /rhodiola/i, goals: ["performance_muscle", "cognitive_mood", "general_wellness"] },
  { pattern: /ashwagandha/i, goals: ["performance_muscle", "cognitive_mood", "general_wellness"] },
  { pattern: /beta[\s-]?alanine/i, goals: ["performance_muscle"] },
  { pattern: /caffeine|cafeisome/i, goals: ["performance_muscle", "cognitive_mood"] },
  { pattern: /ginseng/i, goals: ["performance_muscle", "general_wellness"] },

  // --- Anti-Aging and Longevity ---
  { pattern: /epitalon|epithalon/i, goals: ["anti_aging_longevity"] },
  { pattern: /nad\+?|nmn|nicotinamide[\s-]?riboside|nr\b/i, goals: ["anti_aging_longevity"] },
  { pattern: /rapamycin|sirolimus/i, goals: ["anti_aging_longevity", "immune_support"] },
  { pattern: /metformin/i, goals: ["anti_aging_longevity", "metabolic_health"] },
  { pattern: /spermidine/i, goals: ["anti_aging_longevity"] },
  { pattern: /urolithin/i, goals: ["anti_aging_longevity"] },
  { pattern: /resveratrol/i, goals: ["anti_aging_longevity", "metabolic_health"] },
  { pattern: /co[\s-]?enzyme[\s-]?q[\s-]?10|coq10|ubiquinol/i, goals: ["anti_aging_longevity", "metabolic_health"] },
  { pattern: /berberine/i, goals: ["anti_aging_longevity", "metabolic_health"] },
  { pattern: /fisetin|quercetin/i, goals: ["anti_aging_longevity", "immune_support"] },
  { pattern: /pycnogenol/i, goals: ["anti_aging_longevity", "immune_support"] },
  { pattern: /lycopene/i, goals: ["anti_aging_longevity"] },
  { pattern: /pinealon/i, goals: ["anti_aging_longevity", "cognitive_mood"] },
  { pattern: /khavinson|bioregulator/i, goals: ["anti_aging_longevity"] },
  { pattern: /vilon|livagen|crystagen/i, goals: ["anti_aging_longevity", "immune_support"] },
  { pattern: /cartalax/i, goals: ["anti_aging_longevity", "recovery_healing"] },
  { pattern: /vesilute/i, goals: ["anti_aging_longevity"] },
  { pattern: /thymagen/i, goals: ["anti_aging_longevity", "immune_support"] },
  { pattern: /telomere|telotest/i, goals: ["anti_aging_longevity", "biomarkers"] },
  { pattern: /foxo?[\s-]?4|fox[\s-]?04/i, goals: ["anti_aging_longevity"] },
  { pattern: /humanin/i, goals: ["anti_aging_longevity", "metabolic_health"] },
  { pattern: /ss[\s-]?31|elamipretide/i, goals: ["anti_aging_longevity", "metabolic_health"] },
  { pattern: /cycloastragenol/i, goals: ["anti_aging_longevity"] },
  { pattern: /astaxanthin/i, goals: ["anti_aging_longevity", "immune_support"] },
  { pattern: /alpha[\s-]?tocopherol|vitamin[\s-]?e/i, goals: ["anti_aging_longevity", "general_wellness"] },
  { pattern: /anti[\s-]?aging|anti[\s-]?envejecimiento|longevity/i, goals: ["anti_aging_longevity"] },
  { pattern: /cellular[\s-]?repair|cellular[\s-]?energy/i, goals: ["anti_aging_longevity", "recovery_healing"] },
  { pattern: /health[\s-]?optimi/i, goals: ["anti_aging_longevity", "general_wellness"] },

  // --- Skin / Hair / Aesthetics ---
  { pattern: /ghk[\s-]?cu|copper[\s-]?peptide/i, goals: ["skin_hair_aesthetics", "anti_aging_longevity"] },
  { pattern: /melanotan|mt[\s-]?2|mt[\s-]?ii/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /\bmt[\s-]?1\b/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /hyaluronic/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /retinol|tretinoin|vitamin[\s-]?a/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /minoxidil|finasteride|dutasteride/i, goals: ["skin_hair_aesthetics", "hormonal_optimization"] },
  { pattern: /botox|botulinum/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /hydroquinone/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /clobetasol|fluocinolone/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /latanoprost/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /d[\s-]?panthenol|panthenol/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /centella[\s-]?asiatica/i, goals: ["skin_hair_aesthetics", "recovery_healing"] },
  { pattern: /igrantine/i, goals: ["skin_hair_aesthetics"] },
  { pattern: /siliciumax|silicium/i, goals: ["skin_hair_aesthetics", "general_wellness"] },
  { pattern: /pomage/i, goals: ["skin_hair_aesthetics", "anti_aging_longevity"] },
  { pattern: /cystine|cysteine/i, goals: ["skin_hair_aesthetics", "general_wellness"] },
  { pattern: /skin[\s&-]+tissue/i, goals: ["skin_hair_aesthetics", "recovery_healing"] },
  { pattern: /clotrimazole|ketoconazole|nystatin|nistatina|amphotericin/i, goals: ["skin_hair_aesthetics"] },

  // --- Immune Support ---
  { pattern: /thymosin[\s-]?alpha|ta[\s-]?1/i, goals: ["immune_support"] },
  { pattern: /thymalin/i, goals: ["immune_support", "anti_aging_longevity"] },
  { pattern: /ll[\s-]?37/i, goals: ["immune_support"] },
  { pattern: /ldn|naltrexone/i, goals: ["immune_support"] },
  { pattern: /glutathione/i, goals: ["immune_support", "anti_aging_longevity"] },
  { pattern: /nac\b|n[\s-]?acetyl[\s-]?l?[\s-]?cysteine|acetilcystein|acetylcystein/i, goals: ["immune_support", "anti_aging_longevity"] },
  { pattern: /zinc/i, goals: ["immune_support", "general_wellness"] },
  { pattern: /vitamin[\s-]?c/i, goals: ["immune_support", "general_wellness"] },
  { pattern: /ivermectin/i, goals: ["immune_support"] },
  { pattern: /dexamethasone/i, goals: ["immune_support"] },
  { pattern: /cyclosporine/i, goals: ["immune_support"] },
  { pattern: /amlexanox/i, goals: ["immune_support", "metabolic_health"] },

  // --- Metabolic Health ---
  { pattern: /pp[\s-]?332/i, goals: ["metabolic_health", "performance_muscle"] },
  { pattern: /serrapeptase/i, goals: ["metabolic_health"] },

  // --- Biomarkers ---
  { pattern: /bloodo|blood[\s-]?test|blood[\s-]?vision|panel/i, goals: ["biomarkers"] },

  // --- Genomics ---
  { pattern: /24genetics|dna[\s-]?test|genetic[\s-]?test|progen/i, goals: ["genomics"] },

  // --- General Wellness (supplements and vitamins) ---
  { pattern: /vitamin[\s-]?d|vit[.\s]?d|colecalciferol/i, goals: ["general_wellness", "immune_support"] },
  { pattern: /vitamin[\s-]?b|b[\s-]?complex|calcium[\s-]?pantothenate/i, goals: ["general_wellness"] },
  { pattern: /magnesium/i, goals: ["general_wellness", "cognitive_mood"] },
  { pattern: /omega[\s-]?3|fish[\s-]?oil/i, goals: ["general_wellness", "metabolic_health"] },
  { pattern: /probiotic|prebiotic/i, goals: ["general_wellness", "recovery_healing"] },
  { pattern: /curcumin|turmeric/i, goals: ["general_wellness", "recovery_healing"] },
  { pattern: /iron|selenium|iodine|chromium/i, goals: ["general_wellness"] },
  { pattern: /milk[\s-]?thistle|silymarin/i, goals: ["general_wellness", "immune_support"] },
  { pattern: /magnolia|valerian|passionflower/i, goals: ["general_wellness", "cognitive_mood"] },
  { pattern: /ginkgo/i, goals: ["cognitive_mood", "metabolic_health"] },
  { pattern: /l[\s-]?theanine/i, goals: ["cognitive_mood", "general_wellness"] },
  { pattern: /l[\s-]?tryptophan|5[\s-]?htp/i, goals: ["cognitive_mood", "general_wellness"] },
  { pattern: /glutamine/i, goals: ["recovery_healing", "general_wellness"] },
  { pattern: /phosphatidylserine/i, goals: ["cognitive_mood"] },
  { pattern: /methionine/i, goals: ["general_wellness", "anti_aging_longevity"] },
  { pattern: /cascara[\s-]?sagrada/i, goals: ["general_wellness"] },
  { pattern: /\bedta\b/i, goals: ["general_wellness"] },
  { pattern: /atropine/i, goals: ["general_wellness"] },
  { pattern: /cetirizine/i, goals: ["general_wellness"] },
  { pattern: /furosemide/i, goals: ["general_wellness"] },
  { pattern: /lidocaine/i, goals: ["general_wellness"] },
  { pattern: /papaverine/i, goals: ["general_wellness"] },
  { pattern: /miodesin/i, goals: ["general_wellness"] },
  { pattern: /syringe|needle|vial|bac[\s-]?water|bacteriostatic/i, goals: ["general_wellness"] },
];

// -- Assign goals to a product --
function assignGoals(product) {
  const name = product.name || "";
  const id = product.id || "";
  const category = product.categoryId || "";
  const searchText = name + " " + id;

  // 1. Try category-based mapping first
  if (CATEGORY_GOAL_MAP[category]) {
    return { goalIds: CATEGORY_GOAL_MAP[category], source: "category" };
  }

  // 2. Try name+id based heuristic
  for (const rule of NAME_RULES) {
    if (rule.pattern.test(searchText)) {
      return { goalIds: rule.goals, source: "name" };
    }
  }

  // 3. Fallback based on general category hints
  if (category === "peptide" || category === "api_peptide" || category === "lyophilized_peptide") {
    return { goalIds: ["general_wellness"], source: "fallback-peptide" };
  }
  if (category === "nutricosmetics" || category === "supplement" || category === "api_supplement") {
    return { goalIds: ["general_wellness"], source: "fallback-supplement" };
  }

  // 4. Ultimate fallback
  return { goalIds: ["general_wellness"], source: "fallback" };
}

// -- Main --
async function main() {
  console.log("\nGoals Phase 2 - Assign Goals to Products Without Goals");
  console.log("  Mode: " + (DRY_RUN ? "DRY RUN (preview + CSV)" : "LIVE WRITE"));
  console.log("------------------------------------------------\n");

  const snap = await db.collection("products").get();
  const docs = snap.docs.map(d => ({ ref: d.ref, id: d.id, ...d.data() }));
  const noGoals = docs.filter(d => !d.goalIds || d.goalIds.length === 0);

  console.log("Total products: " + docs.length);
  console.log("Products without goals: " + noGoals.length + "\n");

  const csvRows = [["Product ID", "Product Name", "Category", "Assigned Goals", "Source"]];
  const sourceCounts = {};
  let assigned = 0;

  const batches = [];
  let currentBatch = db.batch();
  let batchCount = 0;

  for (const doc of noGoals) {
    const { goalIds, source } = assignGoals(doc);
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    assigned++;

    csvRows.push([
      doc.id,
      '"' + (doc.name || "").replace(/"/g, '""') + '"',
      doc.categoryId || "",
      goalIds.join("; "),
      source,
    ]);

    if (!DRY_RUN) {
      currentBatch.update(doc.ref, { goalIds });
      batchCount++;

      if (batchCount >= 450) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    batches.push(currentBatch);
  }

  // Print summary
  console.log("===============================================");
  console.log("  Assignment Sources:");
  for (const [src, cnt] of Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])) {
    console.log("    " + src + ": " + cnt);
  }
  console.log("  Total assigned: " + assigned);
  console.log("===============================================");

  // Write CSV for review
  const csvPath = resolve(__dirname, "data/goals_phase2_assignments.csv");
  writeFileSync(csvPath, csvRows.map(r => r.join(",")).join("\n"), "utf8");
  console.log("\nCSV written to: " + csvPath);

  // Print some examples
  console.log("\nSample assignments (first 20):");
  for (const row of csvRows.slice(1, 21)) {
    console.log("  " + row[1] + " -> [" + row[3] + "] (" + row[4] + ")");
  }

  if (!DRY_RUN && batches.length > 0) {
    console.log("\nCommitting " + batches.length + " batch(es)...");
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
      console.log("   Batch " + (i + 1) + "/" + batches.length + " committed");
    }
    console.log("\nPhase 2 complete - " + assigned + " products now have goals.");
  } else if (DRY_RUN) {
    console.log("\nDRY RUN complete - " + assigned + " products would be assigned goals.");
    console.log("   Review the CSV above, then run without --dry-run to write.");
  }
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
