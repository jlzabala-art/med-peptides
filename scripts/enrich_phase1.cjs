const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../src/data/v2/products.v2.json');

const enrichments = {
  "kpv": {
    scientificName: "Lys-Pro-Val (KPV)",
    mechanismSummary: "A C-terminal tripeptide of alpha-MSH that binds melanocortin receptor 1 (MC1R) on immune cells, directly inhibiting NF-κB signaling and reducing pro-inflammatory cytokine (IL-6, TNF-α) production. Particularly studied in inflammatory bowel disease models.",
    safetyNote: "Half-life: Short. Orally bioavailable when encapsulated. No significant systemic toxicity documented at research doses.",
    mechanisms: ["NF-κB Inhibition", "MC1R Agonism", "Anti-inflammatory Cytokine Modulation"],
    references: [{ pmid: "17190987", citation: "Kannengiesser K et al. Melanocortin-derived tripeptide KPV has anti-inflammatory potential in murine models. Regul Pept 2008." }]
  },
  "ara-290": {
    scientificName: "ARA 290 (Cibinetide) — Cyclic helix B surface peptide of erythropoietin",
    mechanismSummary: "A non-hematopoietic derivative of erythropoietin that selectively activates the tissue-protective innate repair receptor (IRR), promoting nerve fiber regeneration and reducing neuropathic pain and systemic inflammation.",
    safetyNote: "Half-life: ~8 hours. Does not stimulate erythropoiesis. Well tolerated in Phase II trials for sarcoidosis neuropathy.",
    mechanisms: ["Innate Repair Receptor (IRR) Activation", "Nerve Fiber Regeneration", "Anti-nociceptive Signaling"],
    references: [{ pmid: "24934537", citation: "Nieuwenhuis EES et al. ARA 290 for Small Fiber Neuropathy in Sarcoidosis. JAMA Neurol 2014." }]
  },
  "cagrilintide": {
    scientificName: "Long-acting amylin receptor agonist (cagrilintide)",
    mechanismSummary: "A long-acting amylin analogue that activates amylin receptors in the hypothalamic area postrema and nucleus tractus solitarius, promoting satiety and slowing gastric emptying. Synergistic with semaglutide (CagriSema) for superior weight loss.",
    safetyNote: "Half-life: ~7 days. Best studied in combination with GLP-1 agonists. Monitor for nausea during initiation.",
    mechanisms: ["Amylin Receptor Agonism", "Central Satiety Signaling", "Gastric Emptying Delay"],
    references: [{ pmid: "36322843", citation: "Lau DCW et al. Once-weekly cagrilintide with semaglutide 2.4 mg for obesity. Lancet 2023." }]
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
console.log(`Phase 1 complete: ${updated} peptides enriched.`);
