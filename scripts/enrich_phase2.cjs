const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../src/data/v2/products.v2.json');

const enrichments = {
  "ss-31": {
    scientificName: "SS-31 (Elamipretide) — D-Arg-2'6'-Dmt-Lys-Phe-NH2",
    mechanismSummary: "A mitochondria-targeting tetrapeptide that binds and stabilizes cardiolipin in the inner mitochondrial membrane, restoring cristae architecture, improving electron transport chain efficiency, and reducing mitochondrial ROS production.",
    safetyNote: "Half-life: ~2 hours (IV). Currently in Phase II/III trials for heart failure and Barth syndrome. Well-tolerated in human trials.",
    mechanisms: ["Cardiolipin Stabilization", "Mitochondrial Cristae Restoration", "Reactive Oxygen Species Reduction", "ATP Synthesis Enhancement"],
    references: [{ pmid: "28082401", citation: "Szeto HH. First-in-class cardiolipin-protective compound as a therapeutic agent targeting heart failure. Future Med Chem 2015." }]
  },
  "dsip": {
    scientificName: "Delta Sleep-Inducing Peptide (DSIP) — Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu",
    mechanismSummary: "A nonapeptide that modulates the hypothalamic-pituitary axis and opioid/serotonin pathways to reduce stress and promote delta-wave (slow-wave) sleep. Also shown to reduce ACTH and cortisol levels and exhibit antioxidant activity.",
    safetyNote: "Half-life: ~30 minutes. Short-acting; typically dosed before sleep. Extensively studied in Europe in the 1980s-90s. No major safety concerns at research doses.",
    mechanisms: ["Delta-Wave Sleep Promotion", "ACTH & Cortisol Reduction", "Serotonin Pathway Modulation", "Antioxidant Activity"],
    references: [{ pmid: "6316924", citation: "Graf MV, Kastin AJ. Delta-sleep-inducing peptide (DSIP): a review. Neurosci Biobehav Rev 1984." }]
  },
  "thymosin-alpha-1": {
    scientificName: "Thymosin Alpha-1 (Tα1) — N-Acetyl-Asp-Ala-Val-Phe-Thr-Asp-Ser-Tyr-...(28aa)",
    mechanismSummary: "A synthetic version of the naturally occurring thymic peptide that activates dendritic cell maturation via Toll-like receptors (TLR-2, TLR-9), enhances Th1 T-cell responses, and promotes NK cell activity for antiviral and antitumor immunity.",
    safetyNote: "Half-life: ~2 hours. FDA-approved (Zadaxin) for Hepatitis B/C in several countries. Avoid in active autoimmune diseases with hyperactive Th1 responses.",
    mechanisms: ["Toll-Like Receptor Activation (TLR-2, TLR-9)", "Dendritic Cell Maturation", "Th1 Immune Response Enhancement", "NK Cell Activation"],
    references: [{ pmid: "11390218", citation: "Garaci E et al. Thymosin alpha-1 is an endogenous regulator of antiviral immunity. Int Immunopharmacol 2001." }]
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
console.log(`Phase 2 complete: ${updated} peptides enriched.`);
