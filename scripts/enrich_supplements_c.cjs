const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../src/data/v2/supplements.v2.json');

const enrichments = {
  "nmn": {
    scientificName: "Nicotinamide Mononucleotide (NMN)",
    mechanismSummary: "A direct precursor to Nicotinamide Adenine Dinucleotide (NAD+). It is converted into NAD+ via the salvage pathway, effectively increasing levels of this coenzyme which is critical for DNA repair (PARPs), sirtuin activation (SIRT1), and mitochondrial energy metabolism.",
    safetyNote: "Half-life: Very short in plasma (~minutes). Generally safe up to 1000mg/day. Synergistic with Resveratrol (Sirtuin activation). Higher bioavailability via sublingual administration.",
    mechanisms: ["NAD+ Precursor", "Sirtuin Activation", "Mitochondrial Bioenergetics"],
    references: [{ pmid: "33820919", citation: "Yoshino M et al. Nicotinamide mononucleotide increases muscle insulin sensitivity in prediabetic women. Science 2021." }]
  },
  "resveratrol": {
    scientificName: "Resveratrol (trans-3,5,4'-trihydroxystilbene)",
    mechanismSummary: "A polyphenolic phytoalexin that acts as a potent SIRT1 activator and AMPK agonist. It mimics the effects of caloric restriction, enhances mitochondrial biogenesis via PGC-1α, and exhibits anti-inflammatory and antioxidant properties.",
    safetyNote: "Half-life: ~9 hours. Low oral bioavailability; absorption is significantly enhanced when taken with fat (e.g., yogurt or olive oil). High doses may cause GI distress.",
    mechanisms: ["SIRT1 Activation", "AMPK Agonism", "Mitochondrial Biogenesis", "Caloric Restriction Mimetic"],
    references: [{ pmid: "21443424", citation: "Timmers S et al. Calorie restriction-like effects of 30 days of resveratrol supplementation in obese humans. Cell Metab 2011." }]
  },
  "spermidine": {
    scientificName: "Spermidine (Polyamine)",
    mechanismSummary: "A natural polyamine that is a potent inducer of autophagy—the cellular 'cleaning' process. It acts as an EP300 inhibitor, leading to the deacetylation of autophagy-related proteins and reducing systemic markers of aging.",
    safetyNote: "Half-life: ~Variable. Found naturally in wheat germ, aged cheese, and soy. Generally considered safe. Supports cardiovascular health and cognitive longevity.",
    mechanisms: ["Autophagy Induction", "EP300 Inhibition", "Deacetylation of ATG Proteins"],
    references: [{ pmid: "29332735", citation: "Madeo F et al. Spermidine in health and disease. Science 2018." }]
  },
  "urolithin": {
    scientificName: "Urolithin A",
    mechanismSummary: "A gut microbiome-derived metabolite of ellagitannins (found in pomegranates). It is the only known compound that significantly induces mitophagy—the selective recycling of damaged mitochondria—enhancing muscle function and endurance.",
    safetyNote: "Half-life: ~17-22 hours. Clinical trials show significant improvement in muscle strength at 500-1000mg. Only ~40% of people can produce it naturally from diet.",
    mechanisms: ["Mitophagy Induction", "Mitochondrial Quality Control", "Skeletal Muscle Support"],
    references: [{ pmid: "31209334", citation: "Andreux PA et al. The mitophagy activator urolithin A is safe and induces a molecular signature of improved mitochondrial and cellular health in humans. Nat Metab 2019." }]
  },
  "rapamycin": {
    scientificName: "Sirolimus (Rapamycin)",
    mechanismSummary: "A macrocyclic lactone that specifically inhibits the Mechanistic Target of Rapamycin Complex 1 (mTORC1). This inhibition induces autophagy, reduces protein synthesis, and is considered the most robust pharmacological intervention for lifespan extension in mammals.",
    safetyNote: "Half-life: ~62 hours. **CAUTION:** Immunosuppressant at high daily doses. In longevity, it is typically used in pulsed low doses (e.g., 5-6mg once weekly) to avoid side effects like mouth sores or lipid changes.",
    mechanisms: ["mTORC1 Inhibition", "Autophagy Induction", "Senescence Delay"],
    references: [{ pmid: "19587680", citation: "Harrison DE et al. Rapamycin fed late in life extends lifespan in genetically heterogeneous mice. Nature 2009." }]
  },
  "berberine": {
    scientificName: "Berberine (Isoquinoline Alkaloid)",
    mechanismSummary: "A plant alkaloid that acts as a potent activator of AMPK (Adenosine Monophosphate-activated Protein Kinase). It lowers blood glucose by increasing GLUT4 translocation and inhibits mitochondrial Complex I, similar to Metformin.",
    safetyNote: "Half-life: ~5 hours. Can cause GI upset (cramps, diarrhea). High affinity for CYP3A4; check interactions with other drugs. Often taken in divided doses (500mg 3x/day).",
    mechanisms: ["AMPK Activation", "GLUT4 Translocation", "Inhibition of Mitochondrial Complex I"],
    references: [{ pmid: "18397984", citation: "Yin J et al. Efficacy of berberine in patients with type 2 diabetes mellitus. Metabolism 2008." }]
  },
  "metformin": {
    scientificName: "Metformin (1,1-Dimethylbiguanide)",
    mechanismSummary: "An antidiabetic biguanide that inhibits mitochondrial Complex I, leading to a decrease in hepatic gluconeogenesis and activation of AMPK. It also exhibits anti-aging effects by reducing systemic inflammation and oxidative stress.",
    safetyNote: "Half-life: ~6.2 hours. Common side effect: GI distress. Long-term use can cause Vitamin B12 deficiency; supplementation is recommended. Standard longevity dose: 500-1000mg/day.",
    mechanisms: ["Hepatic Gluconeogenesis Inhibition", "AMPK Activation", "Mitochondrial Complex I Inhibition"],
    references: [{ pmid: "27333507", citation: "Barzilai N et al. Metformin as a Tool to Target Aging. Cell Metab 2016." }]
  },
  "fenbendazole": {
    scientificName: "Fenbendazole (Benzimidazole)",
    mechanismSummary: "An anthelmintic agent that binds to β-tubulin, inhibiting microtubule polymerization. In a clinical research context, it has shown potential in suppressing tumor growth by inducing cell cycle arrest and apoptosis via p53-dependent and independent pathways.",
    safetyNote: "Half-life: ~10 hours. **OFF-LABEL RESEARCH:** Primarily used in veterinary medicine. Emerging human research for oncology must be done under strict supervision. Low toxicity profile.",
    mechanisms: ["Microtubule Inhibition", "Glycolytic Enzyme Suppression", "Apoptosis Induction"],
    references: [{ pmid: "30094005", citation: "Dogra N et al. Fenbendazole acts as a moderate microtubule destabilizing agent and causes cancer cell death by modulating multiple cellular pathways. Sci Rep 2018." }]
  },
  "curcumin": {
    scientificName: "Curcumin (Diferuloylmethane)",
    mechanismSummary: "The primary curcuminoid from Turmeric. It inhibits NF-kB, COX-2, and LOX, reducing systemic inflammation. It also acts as a potent antioxidant and increases BDNF (Brain-Derived Neurotrophic Factor).",
    safetyNote: "Half-life: ~Short (highly unstable). Extremely low bioavailability unless taken with Piperine (Black Pepper) or in liposomal/phytosomal forms. Can have mild anti-platelet effects.",
    mechanisms: ["NF-kB Inhibition", "COX-2/LOX Inhibition", "BDNF Modulation"],
    references: [{ pmid: "26007179", citation: "Hewlings SJ et al. Curcumin: A Review of Its Effects on Human Health. Foods 2017." }]
  },
  "hyaluronic-acid": {
    scientificName: "Hyaluronan (Hyaluronic Acid)",
    mechanismSummary: "A high-molecular-weight glycosaminoglycan that is a major component of the extracellular matrix. It acts as a lubricant and shock absorber in joints and promotes skin hydration and wound healing via CD44 receptor signaling.",
    safetyNote: "Half-life: ~Variable. Oral supplementation (120-240mg) has been clinically shown to improve skin moisture and reduce joint pain in osteoarthritis.",
    mechanisms: ["Extracellular Matrix Integrity", "Joint Lubrication", "CD44 Signaling"],
    references: [{ pmid: "25014940", citation: "Kawada C et al. Ingested hyaluronan moisturizes dry skin. Nutr J 2014." }]
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
console.log(`Supplement Enrichment (Part C - Longevity & Metabolism) complete: ${updated} items enriched.`);
