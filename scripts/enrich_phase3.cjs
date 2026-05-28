const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../src/data/v2/products.v2.json');

const enrichments = {
  "pinealon": {
    scientificName: "Pinealon — Glu-Asp-Arg (EDR Tripeptide)",
    mechanismSummary: "A synthetic pineal gland-derived tripeptide (EDR) that modulates gene expression involved in antioxidant defense (catalase, SOD), neuronal survival, and circadian rhythm regulation. Studied for neuroprotective and anti-aging properties in the brain.",
    safetyNote: "Half-life: Short. Developed in Russia; part of the peptide bioregulator series by Khavinson. No significant adverse effects documented at peptide doses.",
    mechanisms: ["Antioxidant Gene Expression Modulation", "Neuroprotection", "Circadian Rhythm Support"],
    references: [{ pmid: "12687748", citation: "Khavinson VKh et al. Peptide regulation of aging. Neuro Endocrinol Lett 2002." }]
  },
  "pe-22-28": {
    scientificName: "PE-22-28 — Spadin analog (TREK-1 antagonist)",
    mechanismSummary: "A synthetic peptide analog of spadin that antagonizes the TREK-1 (K2P3.1) potassium channel in the brain, increasing serotonergic and noradrenergic neurotransmission. Exhibits rapid antidepressant-like effects in animal models.",
    safetyNote: "Half-life: Short. Preclinical research stage. Potential advantage over traditional antidepressants: rapid onset without serotonin syndrome risk profile.",
    mechanisms: ["TREK-1 Channel Antagonism", "Serotonergic Neurotransmission Enhancement", "Rapid Antidepressant-Like Effect"],
    references: [{ pmid: "25956884", citation: "Mazella J et al. Spadin, a sortilin-derived peptide, targeting rodent TREK-1 channels. Curr Target CNS Drug Discov 2015." }]
  },
  "gw-501516": {
    scientificName: "GW501516 (Cardarine) — PPARδ agonist",
    mechanismSummary: "A PPARδ/β agonist that upregulates genes involved in fatty acid oxidation in skeletal muscle (ABCA1, CPT1), improving metabolic endurance. Increases VO2 max-related gene expression and shifts fuel utilization towards fat.",
    safetyNote: "⚠️ CRITICAL SAFETY NOTE: GW501516 was abandoned by GlaxoSmithKline during Phase II development due to rapid multi-organ carcinogenesis observed in rodent toxicology studies at various doses. The carcinogenic risk in humans has NOT been established but cannot be excluded. This compound is strictly for research purposes.",
    mechanisms: ["PPARδ Agonism", "Fatty Acid Oxidation Gene Upregulation", "Metabolic Endurance Enhancement"],
    references: [{ pmid: "12616617", citation: "Wang Y et al. Peroxisome proliferator-activated receptor delta activates fat metabolism. J Biol Chem 2003." }]
  }
};

let data = JSON.parse(fs.readFileSync(FILE, 'utf8'));
let updated = 0;

for (let item of data) {
  const e = enrichments[item.id];
  if (!e) continue;
  item.scientificName = e.scientificName;
  if (!item.science) item.science = {};
  item.science.mechanismSummary = e.mechanismSummary;
  item.science.safetyNote = e.safetyNote;
  item.science.mechanisms = e.mechanisms;
  if (!item.science.references) item.science.references = [];
  for (const ref of e.references) {
    if (!item.science.references.some(r => r.pmid === ref.pmid)) {
      item.science.references.push(ref);
    }
  }
  updated++;
}

fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
console.log(`Phase 3 complete: ${updated} peptides enriched.`);
