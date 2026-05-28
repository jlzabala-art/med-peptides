const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../src/data/v2/supplements.v2.json');

const enrichments = {
  "a-lipoic-acid": {
    scientificName: "Alpha-Lipoic Acid (ALA) / Thioctic Acid",
    mechanismSummary: "A powerful organosulfur antioxidant that acts as a cofactor for mitochondrial dehydrogenase complexes (pyruvate dehydrogenase and α-ketoglutarate dehydrogenase). It also regenerates other antioxidants like Vitamin C, Vitamin E, and Glutathione, and activates the insulin-signaling pathway.",
    safetyNote: "Half-life: 30-60 minutes. Can lower blood sugar; use caution if combined with glucose-lowering peptides. High doses may lead to Biotin deficiency with chronic use.",
    mechanisms: ["Mitochondrial Dehydrogenase Cofactor", "Antioxidant Regeneration", "AMPK Activation", "Insulin Sensitivity Modulation"],
    references: [{ pmid: "19664690", citation: "Shay KP et al. Alpha-lipoic acid as a dietary supplement: Molecular mechanisms and therapeutic potential. Biochim Biophys Acta 2009." }]
  },
  "co-q10": {
    scientificName: "Coenzyme Q10 (Ubiquinone / Ubiquinol)",
    mechanismSummary: "An essential component of the mitochondrial electron transport chain (Complex I and II to III) that facilitates ATP production. It also acts as a lipid-soluble antioxidant protecting membranes and LDL from oxidation.",
    safetyNote: "Half-life: 33-36 hours. Fat-soluble; must be taken with a meal for absorption. Ubiquinol form has superior bioavailability in older populations.",
    mechanisms: ["Electron Transport Chain Facilitation", "Lipid-Soluble Antioxidant", "Mitochondrial Bioenergetics Support"],
    references: [{ pmid: "25126052", citation: "Garrido-Maraver J et al. Coenzyme Q10 therapy. Mol Syndromol 2014." }]
  },
  "glutathione": {
    scientificName: "Reduced L-Glutathione (GSH)",
    mechanismSummary: "The master endogenous antioxidant (tripeptide) that neutralizes reactive oxygen species (ROS) and facilitates Phase II detoxification in the liver by conjugating with electrophilic compounds and xenobiotics.",
    safetyNote: "Half-life: Very short in plasma (<2 mins). Oral bioavailability is low unless using liposomal or acetylated (s-acetyl) forms. Often administered via IV or precursors (NAC).",
    mechanisms: ["ROS Neutralization", "Phase II Liver Detoxification", "Thiol Redox Regulation"],
    references: [{ pmid: "24791752", citation: "Forman HJ et al. Glutathione: Overview of its protective roles, measurement, and biosynthesis. Mol Aspects Med 2009." }]
  },
  "nac": {
    scientificName: "N-Acetyl-L-Cysteine (NAC)",
    mechanismSummary: "A derivative of the amino acid L-cysteine that serves as the rate-limiting precursor to glutathione synthesis. It also acts as a mucolytic agent by breaking disulfide bonds in mucus and modulates glutamatergic signaling in the brain.",
    safetyNote: "Half-life: ~5.6 hours. Well tolerated. May cause mild GI upset. Used clinically to treat acetaminophen (paracetamol) overdose by restoring liver glutathione.",
    mechanisms: ["Glutathione Precursor", "Mucolytic Action", "Glutamate Modulation", "Redox Balancing"],
    references: [{ pmid: "24835770", citation: "Mokhtari V et al. A Review on Various Uses of N-Acetyl Cysteine. Cell J 2017." }]
  },
  "quercetin": {
    scientificName: "Quercetin (3,3',4',5,7-pentahydroxyflavone)",
    mechanismSummary: "A plant flavonol that acts as a natural senolytic (when paired with dasatinib), a zinc ionophore, and an inhibitor of several inflammatory enzymes (LOX, COX). It also stabilizes mast cells, reducing histamine release.",
    safetyNote: "Half-life: ~3.5 hours. Zinc ionophore; excellent for immune support when combined with zinc. May have low oral bioavailability unless using phytosome forms.",
    mechanisms: ["Zinc Ionophore", "Mast Cell Stabilization", "Senolytic Activity", "Inflammatory Enzyme Inhibition"],
    references: [{ pmid: "26938554", citation: "Li Y et al. Quercetin, Inflammation and Immunity. Nutrients 2016." }]
  },
  "ashwagandha": {
    scientificName: "Withania somnifera (Ashwagandha) / Winter Cherry",
    mechanismSummary: "An adaptogenic herb whose primary active constituents (withanolides) modulate the hypothalamic-pituitary-adrenal (HPA) axis, reducing cortisol production and exerting GABAergic-like effects on the nervous system.",
    safetyNote: "Half-life: ~Variable. Can stimulate thyroid function; use caution in hyperthyroidism. High doses may cause sedation. Avoid in pregnancy.",
    mechanisms: ["HPA Axis Modulation", "Cortisol Reduction", "GABAergic Signaling Modulation", "Anxiolytic Action"],
    references: [{ pmid: "23439798", citation: "Chandrasekhar K et al. A prospective, randomized double-blind, placebo-controlled study of Ashwagandha. Indian J Psychol Med 2012." }]
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
console.log(`Supplement Enrichment (Part A) complete: ${updated} items enriched.`);
