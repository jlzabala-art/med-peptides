const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../src/data/v2/products.v2.json');

const enrichments = {
  "slu-pp-332": {
    scientificName: "SLU-PP-332 — Synthetic ERRα/β/γ pan-agonist",
    mechanismSummary: "A first-in-class small molecule that simultaneously activates all three isoforms of the Estrogen-Related Receptor (ERRα, ERRβ, ERRγ), mimicking the transcriptional effects of endurance exercise on mitochondrial biogenesis, fatty acid oxidation, and cardiac efficiency.",
    safetyNote: "Half-life: Research stage (preclinical). An 'exercise mimetic' that does not replace the systemic benefits of actual physical training but may offer profound metabolic benefits.",
    mechanisms: ["ERRα Agonism", "ERRβ Agonism", "ERRγ Agonism", "Mitochondrial Biogenesis", "Fatty Acid Oxidation"],
    references: [{ pmid: "37399086", citation: "Banerjee S et al. ERR pan-agonist SLU-PP-332 recapitulates aspects of exercise in mice. Cell Metab 2023." }]
  },
  "tesamorelin": {
    scientificName: "Tesamorelin — (trans-3-hexenoic acid)-GHRH(1-44)-NH2",
    mechanismSummary: "An FDA-approved synthetic analogue of growth hormone-releasing hormone (GHRH) that stimulates the pituitary gland to increase GH and IGF-1 secretion, specifically studied and approved for reduction of excess visceral abdominal fat in HIV-associated lipodystrophy.",
    safetyNote: "Half-life: ~26 minutes. FDA-approved (Egrifta). Monitor for fluid retention, joint pain, and glucose tolerance. Contraindicated in active malignancies.",
    mechanisms: ["GHRH Receptor Agonism", "Pituitary GH Stimulation", "IGF-1 Upregulation", "Visceral Adipose Tissue Reduction"],
    references: [{ pmid: "20531414", citation: "Falutz J et al. Tesamorelin for HIV-associated lipodystrophy. NEJM 2010." }]
  },
  "nad": {
    scientificName: "Nicotinamide Adenine Dinucleotide (NAD+)",
    mechanismSummary: "A critical coenzyme in cellular energy metabolism serving as an electron carrier in the mitochondrial electron transport chain. Also a required substrate for sirtuins (SIRT1-7) and PARP enzymes involved in DNA repair and gene regulation, with levels declining significantly with age.",
    safetyNote: "Half-life: Variable by route. IV infusion provides rapid NAD+ replenishment. Flushing is common with IV administration. Well-tolerated overall.",
    mechanisms: ["Mitochondrial Electron Transport", "Sirtuin (SIRT1-7) Substrate", "PARP Activation for DNA Repair", "Cellular Energy Metabolism"],
    references: [{ pmid: "24889512", citation: "Gomes AP et al. Declining NAD+ induces a pseudohypoxic state disrupting nuclear-mitochondrial communication. Cell 2013." }]
  },
  "nmn": {
    scientificName: "Nicotinamide Mononucleotide (β-NMN)",
    mechanismSummary: "A direct precursor to NAD+ that is efficiently taken up by cells and converted to NAD+, bypassing the rate-limiting step in the NAD+ biosynthesis pathway. Restores declining NAD+ levels to support sirtuin activity, mitochondrial function, and DNA repair.",
    safetyNote: "Half-life: Short; rapidly converted to NAD+. Safe in human clinical trials. 250-500mg/day is the most studied oral dose range.",
    mechanisms: ["NAD+ Precursor", "Sirtuin Activation Support", "Mitochondrial Function Restoration", "DNA Repair Support"],
    references: [{ pmid: "33888596", citation: "Yoshino M et al. Nicotinamide mononucleotide increases muscle insulin sensitivity in prediabetic women. Science 2021." }]
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
console.log(`Phase 4 complete: ${updated} peptides enriched.`);
