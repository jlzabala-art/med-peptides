#!/usr/bin/env node
/**
 * enrich-supplements.js
 * Injects `protocols` and `commonly_combined_with` fields into supplements.js
 * Run: node scripts/enrich-supplements.js
 *
 * Enrichment data is keyed by supplement name (case-insensitive match).
 * Each entry in the data array will be updated; duplicates (same name,
 * different dosage) all receive the same enrichment.
 */

const fs = require('fs');
const path = require('path');

const SUPPLEMENTS_PATH = path.join(__dirname, '../src/data/supplements.js');

// ─── Enrichment map ────────────────────────────────────────────────────────────
// Key: supplement name exactly as written in the file (case-insensitive compare)
// Value: { protocols: string[], commonly_combined_with: string[] }
const ENRICHMENT = {

  // ── Adaptogens & Botanicals ──────────────────────────────────────────────────
  "Ashwagandha": {
    protocols: ["Stress & HPA Axis Reset", "Sleep Optimization Protocol", "Athletic Recovery Protocol"],
    commonly_combined_with: ["Rhodiola Rosea", "Magnolia", "L-Theanine", "Melatonin"]
  },
  "Rhodiola Rosea": {
    protocols: ["Stress & HPA Axis Reset", "Cognitive Performance Protocol", "Athletic Recovery Protocol"],
    commonly_combined_with: ["Ashwagandha", "L-Theanine", "Ginkgo Biloba", "B-Complex"]
  },
  "Ginkgo Biloba": {
    protocols: ["Cognitive Performance Protocol", "Neuroprotection Protocol"],
    commonly_combined_with: ["Rhodiola Rosea", "Lion's Mane Mushroom", "Phosphatidylserine", "Co-Q10"]
  },
  "Boswellia": {
    protocols: ["Anti-Inflammatory Protocol", "Joint & Mobility Protocol"],
    commonly_combined_with: ["Curcumin", "Bromelain", "Serrapeptase 300,000SPU", "Omega-3 Forte"]
  },
  "Lion's Mane Mushroom": {
    protocols: ["Cognitive Performance Protocol", "Neuroprotection Protocol", "Gut-Brain Axis Protocol"],
    commonly_combined_with: ["Ginkgo Biloba", "Phosphatidylserine", "B-Complex", "Ashwagandha"]
  },
  "Milk Thistle": {
    protocols: ["Liver Detox & Regeneration Protocol", "Metabolic Reset Protocol"],
    commonly_combined_with: ["NAC", "Glutathione", "A-Lipoic Acid", "Berberine"]
  },
  "Magnolia": {
    protocols: ["Stress & HPA Axis Reset", "Sleep Optimization Protocol"],
    commonly_combined_with: ["Ashwagandha", "L-Theanine", "5-HTP", "Melatonin"]
  },

  // ── Amino Acids ───────────────────────────────────────────────────────────────
  "Acetyl-Carnitine": {
    protocols: ["Cognitive Performance Protocol", "Mitochondrial Health Protocol", "Athletic Recovery Protocol"],
    commonly_combined_with: ["A-Lipoic Acid", "Co-Q10", "NMN", "Glutathione"]
  },
  "L-Arginine": {
    protocols: ["Cardiovascular & Nitric Oxide Protocol", "Athletic Performance Protocol"],
    commonly_combined_with: ["L-Citrulline", "Co-Q10", "Omega-3 Forte", "Zinc Citrate"]
  },
  "L-Citrulline": {
    protocols: ["Cardiovascular & Nitric Oxide Protocol", "Athletic Performance Protocol"],
    commonly_combined_with: ["L-Arginine", "Co-Q10", "Omega-3 Forte", "Zinc Citrate"]
  },
  "L-Tryptophan": {
    protocols: ["Sleep Optimization Protocol", "Stress & HPA Axis Reset"],
    commonly_combined_with: ["5-HTP", "Magnolia", "Melatonin", "B-Complex"]
  },
  "Glutamine": {
    protocols: ["Gut Health & Leaky Gut Protocol", "Athletic Recovery Protocol", "Immune Support Protocol"],
    commonly_combined_with: ["NAC", "Quercetin", "Berberine", "Omega-3 Forte"]
  },
  "Cystine": {
    protocols: ["Antioxidant Defense Protocol", "Liver Detox & Regeneration Protocol"],
    commonly_combined_with: ["NAC", "Glutathione", "A-Lipoic Acid", "Vit. D3"]
  },
  "5-HTP": {
    protocols: ["Sleep Optimization Protocol", "Stress & HPA Axis Reset", "Mood & Serotonin Protocol"],
    commonly_combined_with: ["L-Tryptophan", "Magnolia", "Melatonin", "B-Complex"]
  },

  // ── Antioxidants ─────────────────────────────────────────────────────────────
  "A-Lipoic Acid": {
    protocols: ["Antioxidant Defense Protocol", "Metabolic Reset Protocol", "Mitochondrial Health Protocol"],
    commonly_combined_with: ["Acetyl-Carnitine", "Co-Q10", "Glutathione", "NAC"]
  },
  "Co-Q10": {
    protocols: ["Mitochondrial Health Protocol", "Cardiovascular & Nitric Oxide Protocol", "Longevity Foundation Protocol"],
    commonly_combined_with: ["NMN", "Resveratrol", "A-Lipoic Acid", "Omega-3 Forte"]
  },
  "Glutathione": {
    protocols: ["Antioxidant Defense Protocol", "Liver Detox & Regeneration Protocol", "Immune Support Protocol"],
    commonly_combined_with: ["NAC", "A-Lipoic Acid", "Vit. D3", "Quercetin"]
  },
  "NAC": {
    protocols: ["Antioxidant Defense Protocol", "Liver Detox & Regeneration Protocol", "Respiratory Health Protocol"],
    commonly_combined_with: ["Glutathione", "A-Lipoic Acid", "Milk Thistle", "Quercetin"]
  },
  "Quercetin": {
    protocols: ["Anti-Inflammatory Protocol", "Immune Support Protocol", "Antioxidant Defense Protocol"],
    commonly_combined_with: ["NAC", "Glutathione", "Bromelain", "Vit. D3"]
  },
  "Pycnogenol": {
    protocols: ["Antioxidant Defense Protocol", "Cardiovascular & Nitric Oxide Protocol", "Skin & Collagen Protocol"],
    commonly_combined_with: ["Grape Seed Extract", "Quercetin", "Omega-3 Forte", "Vit. D3"]
  },
  "Grape Seed Extract": {
    protocols: ["Antioxidant Defense Protocol", "Cardiovascular & Nitric Oxide Protocol"],
    commonly_combined_with: ["Pycnogenol", "Quercetin", "Resveratrol", "Omega-3 Forte"]
  },

  // ── Longevity ─────────────────────────────────────────────────────────────────
  "NMN": {
    protocols: ["Longevity Foundation Protocol", "Mitochondrial Health Protocol", "NAD+ Restoration Protocol"],
    commonly_combined_with: ["Resveratrol", "Co-Q10", "Spermidine", "Berberine"]
  },
  "Resveratrol": {
    protocols: ["Longevity Foundation Protocol", "Cardiovascular & Nitric Oxide Protocol", "Anti-Inflammatory Protocol"],
    commonly_combined_with: ["NMN", "Quercetin", "Co-Q10", "Omega-3 Forte"]
  },
  "Spermidine": {
    protocols: ["Longevity Foundation Protocol", "Autophagy & Cellular Renewal Protocol"],
    commonly_combined_with: ["NMN", "Resveratrol", "Berberine", "Quercetin"]
  },
  "Urolithin": {
    protocols: ["Mitochondrial Health Protocol", "Autophagy & Cellular Renewal Protocol", "Athletic Recovery Protocol"],
    commonly_combined_with: ["NMN", "Co-Q10", "Spermidine", "Omega-3 Forte"]
  },
  "Rapamycin": {
    protocols: ["Longevity Foundation Protocol", "Autophagy & Cellular Renewal Protocol"],
    commonly_combined_with: ["Berberine", "Metformin", "NMN", "Quercetin"]
  },
  "Berberine": {
    protocols: ["Metabolic Reset Protocol", "Blood Sugar & Insulin Sensitivity Protocol", "Longevity Foundation Protocol"],
    commonly_combined_with: ["Metformin", "NMN", "A-Lipoic Acid", "Omega-3 Forte"]
  },

  // ── Metabolic & Blood Sugar ───────────────────────────────────────────────────
  "Metformin": {
    protocols: ["Metabolic Reset Protocol", "Blood Sugar & Insulin Sensitivity Protocol", "Longevity Foundation Protocol"],
    commonly_combined_with: ["Berberine", "NMN", "A-Lipoic Acid", "Omega-3 Forte"]
  },
  "Fenbendazole": {
    protocols: ["Metabolic Reset Protocol", "Cellular Health Protocol"],
    commonly_combined_with: ["Quercetin", "Berberine", "Vit. D3", "NMN"]
  },

  // ── Vitamins & Minerals ───────────────────────────────────────────────────────
  "Hyaluronic Acid": {
    protocols: ["Skin & Collagen Protocol", "Joint & Mobility Protocol"],
    commonly_combined_with: ["Bromelain", "Boswellia", "Curcumin", "Omega-3 Forte"]
  },
  "Bromelain": {
    protocols: ["Anti-Inflammatory Protocol", "Joint & Mobility Protocol", "Digestive Health Protocol"],
    commonly_combined_with: ["Quercetin", "Boswellia", "Curcumin", "Serrapeptase 300,000SPU"]
  },
  "Serrapeptase 300,000SPU": {
    protocols: ["Anti-Inflammatory Protocol", "Joint & Mobility Protocol", "Cardiovascular & Nitric Oxide Protocol"],
    commonly_combined_with: ["Bromelain", "Boswellia", "Curcumin", "Omega-3 Forte"]
  },
  "Curcumin": {
    protocols: ["Anti-Inflammatory Protocol", "Joint & Mobility Protocol", "Neuroprotection Protocol"],
    commonly_combined_with: ["Boswellia", "Bromelain", "Omega-3 Forte", "Piperine"]
  },
  "B-Complex": {
    protocols: ["Energy & Fatigue Protocol", "Cognitive Performance Protocol", "Stress & HPA Axis Reset"],
    commonly_combined_with: ["Magnesium Glycinate", "Vit. D3", "Omega-3 Forte", "Rhodiola Rosea"]
  },
  "Biotin": {
    protocols: ["Skin & Collagen Protocol", "Hair & Nail Protocol"],
    commonly_combined_with: ["B-Complex", "Zinc Citrate", "Vit. D3", "Omega-3 Forte"]
  },
  "Vit. D3": {
    protocols: ["Immune Support Protocol", "Bone & Hormonal Health Protocol", "Longevity Foundation Protocol"],
    commonly_combined_with: ["Vit. D3 10,000IU + K2", "Magnesium Glycinate", "Omega-3 Forte", "Zinc Citrate"]
  },
  "Vit. D3 10,000IU + K2": {
    protocols: ["Immune Support Protocol", "Bone & Hormonal Health Protocol", "Longevity Foundation Protocol"],
    commonly_combined_with: ["Magnesium Glycinate", "Omega-3 Forte", "Zinc Citrate", "Vit. D3"]
  },
  "Magnesium Citrate": {
    protocols: ["Sleep Optimization Protocol", "Stress & HPA Axis Reset", "Bone & Hormonal Health Protocol"],
    commonly_combined_with: ["Magnesium Glycinate", "Vit. D3", "B-Complex", "Melatonin"]
  },
  "Magnesium Glycinate": {
    protocols: ["Sleep Optimization Protocol", "Stress & HPA Axis Reset", "Bone & Hormonal Health Protocol"],
    commonly_combined_with: ["Vit. D3", "B-Complex", "L-Theanine", "Melatonin"]
  },
  "Magnesium Threonate": {
    protocols: ["Cognitive Performance Protocol", "Sleep Optimization Protocol", "Neuroprotection Protocol"],
    commonly_combined_with: ["Lion's Mane Mushroom", "Phosphatidylserine", "L-Theanine", "B-Complex"]
  },
  "Magnesium 5-Matrix": {
    protocols: ["Sleep Optimization Protocol", "Stress & HPA Axis Reset", "Bone & Hormonal Health Protocol"],
    commonly_combined_with: ["Vit. D3", "B-Complex", "L-Theanine", "Melatonin"]
  },
  "Omega-3 Forte": {
    protocols: ["Cardiovascular & Nitric Oxide Protocol", "Anti-Inflammatory Protocol", "Longevity Foundation Protocol"],
    commonly_combined_with: ["Vit. D3", "Co-Q10", "Berberine", "Quercetin"]
  },
  "Zinc Citrate": {
    protocols: ["Immune Support Protocol", "Hormonal Health Protocol", "Skin & Collagen Protocol"],
    commonly_combined_with: ["Vit. D3", "Magnesium Glycinate", "B-Complex", "Quercetin"]
  },
  "Zinc Gluconate": {
    protocols: ["Immune Support Protocol", "Hormonal Health Protocol"],
    commonly_combined_with: ["Vit. D3", "Magnesium Glycinate", "B-Complex", "Quercetin"]
  },
  "Boron": {
    protocols: ["Bone & Hormonal Health Protocol", "Hormonal Health Protocol"],
    commonly_combined_with: ["Vit. D3", "Magnesium Glycinate", "Zinc Citrate", "Omega-3 Forte"]
  },

  // ── Sleep & Mood ──────────────────────────────────────────────────────────────
  "Melatonin": {
    protocols: ["Sleep Optimization Protocol", "Circadian Rhythm Reset Protocol"],
    commonly_combined_with: ["Magnesium Glycinate", "L-Theanine", "5-HTP", "Magnolia"]
  },
  "Sleep Support": {
    protocols: ["Sleep Optimization Protocol", "Stress & HPA Axis Reset"],
    commonly_combined_with: ["Melatonin", "Magnesium Glycinate", "L-Theanine", "Magnolia"]
  },
  "L-Theanine": {
    protocols: ["Stress & HPA Axis Reset", "Cognitive Performance Protocol", "Sleep Optimization Protocol"],
    commonly_combined_with: ["Ashwagandha", "Rhodiola Rosea", "Magnesium Glycinate", "Melatonin"]
  },

  // ── Other ─────────────────────────────────────────────────────────────────────
  "LDN 0.5mg": {
    protocols: ["Low-Dose Naltrexone Immune Protocol", "Autoimmune & Inflammation Protocol"],
    commonly_combined_with: ["Vit. D3", "Omega-3 Forte", "NAC", "Glutathione"]
  },
  "LDN 1.5mg": {
    protocols: ["Low-Dose Naltrexone Immune Protocol", "Autoimmune & Inflammation Protocol"],
    commonly_combined_with: ["Vit. D3", "Omega-3 Forte", "NAC", "Glutathione"]
  },
  "LDN 2.5mg": {
    protocols: ["Low-Dose Naltrexone Immune Protocol", "Autoimmune & Inflammation Protocol"],
    commonly_combined_with: ["Vit. D3", "Omega-3 Forte", "NAC", "Glutathione"]
  },
  "LDN": {
    protocols: ["Low-Dose Naltrexone Immune Protocol", "Autoimmune & Inflammation Protocol"],
    commonly_combined_with: ["Vit. D3", "Omega-3 Forte", "NAC", "Glutathione"]
  },
  "LDN 4.5mg": {
    protocols: ["Low-Dose Naltrexone Immune Protocol", "Autoimmune & Inflammation Protocol"],
    commonly_combined_with: ["Vit. D3", "Omega-3 Forte", "NAC", "Glutathione"]
  },
  "Tadalafil": {
    protocols: ["Cardiovascular & Nitric Oxide Protocol", "Hormonal Health Protocol"],
    commonly_combined_with: ["L-Arginine", "L-Citrulline", "Co-Q10", "Zinc Citrate"]
  },
  "Phosphatidylserine": {
    protocols: ["Cognitive Performance Protocol", "Stress & HPA Axis Reset", "Neuroprotection Protocol"],
    commonly_combined_with: ["Ginkgo Biloba", "Lion's Mane Mushroom", "Magnesium Threonate", "Omega-3 Forte"]
  },
  "DIM": {
    protocols: ["Hormonal Health Protocol", "Estrogen Balance Protocol"],
    commonly_combined_with: ["Zinc Citrate", "Vit. D3", "Omega-3 Forte", "B-Complex"]
  },
  "Saw Palmetto": {
    protocols: ["Hormonal Health Protocol", "Prostate Health Protocol"],
    commonly_combined_with: ["Zinc Citrate", "Lycopene", "Vit. D3", "Omega-3 Forte"]
  },
  "Spironolactone": {
    protocols: ["Hormonal Health Protocol", "Androgen Regulation Protocol"],
    commonly_combined_with: ["Zinc Citrate", "Vit. D3", "Omega-3 Forte", "DIM"]
  },
  "Lycopene": {
    protocols: ["Antioxidant Defense Protocol", "Prostate Health Protocol", "Cardiovascular & Nitric Oxide Protocol"],
    commonly_combined_with: ["Saw Palmetto", "Zinc Citrate", "Vit. D3", "Omega-3 Forte"]
  },
};

// ─── Injection logic ────────────────────────────────────────────────────────────
function normKey(name) {
  return name.trim().toLowerCase();
}

// Build lookup with normalized keys
const lookup = {};
for (const [key, val] of Object.entries(ENRICHMENT)) {
  lookup[normKey(key)] = val;
}

const raw = fs.readFileSync(SUPPLEMENTS_PATH, 'utf8');

// Parse by extracting the JS array content and eval'ing it
// We do a safe replace: read the exported array, enrich, write back
const match = raw.match(/^export const supplements = (\[[\s\S]*\]);?\s*$/m);
if (!match) {
  console.error('❌  Could not find `export const supplements = [...]` in file');
  process.exit(1);
}

let supplements;
 
eval(`supplements = ${match[1]}`);

let enriched = 0;
let skipped = 0;

supplements = supplements.map(s => {
  const key = normKey(s.name || '');
  const data = lookup[key];
  if (!data) {
    skipped++;
    return s;
  }
  // Only inject if not already present
  const out = { ...s };
  if (!out.protocols) out.protocols = data.protocols;
  if (!out.commonly_combined_with) out.commonly_combined_with = data.commonly_combined_with;
  enriched++;
  return out;
});

const newContent = `/**\n * supplements.js\n * Generated from NP_LABS_Supplements.pdf\n * Conversion Rate: 1 EUR = 1.08 USD\n */\n\nexport const supplements = ${JSON.stringify(supplements, null, 2)};\n`;

fs.writeFileSync(SUPPLEMENTS_PATH, newContent, 'utf8');

console.log(`✅  Done — enriched: ${enriched} entries, skipped (no match): ${skipped}`);
