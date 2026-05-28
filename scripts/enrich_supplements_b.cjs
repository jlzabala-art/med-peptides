const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '../src/data/v2/supplements.v2.json');

const enrichments = {
  "rhodiola-rosea": {
    scientificName: "Rhodiola rosea (Arctic Root / Golden Root)",
    mechanismSummary: "An adaptogen that inhibits monoamine oxidase (MAO-A and MAO-B) and catechol-O-methyltransferase (COMT), increasing levels of serotonin, dopamine, and norepinephrine in the cerebral cortex. It also stimulates the synthesis/re-synthesis of ATP in mitochondria.",
    safetyNote: "Half-life: Salidroside ~45 mins, Rosavin ~12-24h. Can be stimulatory; may cause jitteriness if taken late in the day. Potential interaction with SSRIs due to MAO inhibition.",
    mechanisms: ["MAO-A/B Inhibition", "COMT Inhibition", "HPA Axis Balancing", "Mitochondrial ATP Stimulation"],
    references: [{ pmid: "20374695", citation: "Panossian A et al. Rosenroot (Rhodiola rosea): traditional use, chemical composition, pharmacology and clinical efficacy. Phytomedicine 2010." }]
  },
  "ginkgo-biloba": {
    scientificName: "Ginkgo biloba (Maidenhair Tree)",
    mechanismSummary: "Acts primarily via ginkgolides and bilobalides which are potent antagonists of Platelet-Activating Factor (PAF) receptors, enhancing blood rheology and microcirculation. It also scavenges free radicals and modulates neurotransmitter systems (acetylcholine, norepinephrine).",
    safetyNote: "Half-life: ~4.5 hours. Potent anti-platelet effect; must be discontinued 1-2 weeks before surgery. Avoid if taking blood thinners (Warfarin, Aspirin).",
    mechanisms: ["PAF Receptor Antagonism", "Vasodilation (Nitric Oxide Dependent)", "Neuroprotection"],
    references: [{ pmid: "24548738", citation: "Nash KM et al. Ginkgo biloba extract (EGb 761) and its specific components: pharmacology and clinical uses. Fitoterapia 2014." }]
  },
  "boswellia": {
    scientificName: "Boswellia serrata (Indian Frankincense)",
    mechanismSummary: "Contains boswellic acids (notably AKBA) which are specific, non-redox inhibitors of 5-lipoxygenase (5-LOX), the key enzyme in pro-inflammatory leukotriene biosynthesis. Unlike NSAIDs, it does not inhibit COX enzymes, sparing the gastric lining.",
    safetyNote: "Half-life: ~6 hours. Generally safe. AKBA has the highest anti-inflammatory potency. Better absorbed with high-fat meals.",
    mechanisms: ["5-LOX Inhibition", "Leukotriene Synthesis Reduction", "MMP-3 Inhibition"],
    references: [{ pmid: "21276025", citation: "Siddiqui MZ. Boswellia serrata, a potential antiinflammatory agent: an overview. Indian J Pharm Sci 2011." }]
  },
  "lion-s-mane-mushroom": {
    scientificName: "Hericium erinaceus (Lion's Mane / Yamabushitake)",
    mechanismSummary: "Rich in hericenones and erinacines, which cross the blood-brain barrier and stimulate the production of Nerve Growth Factor (NGF) in the hippocampus and cortex, promoting neurite outgrowth and myelin sheath repair.",
    safetyNote: "Half-life: Not well-established. Long-term use is typically required to see cognitive benefits (neuronal repair). Avoid if allergic to mushrooms.",
    mechanisms: ["NGF Synthesis Stimulation", "BDNF Expression Increase", "Myelination Support"],
    references: [{ pmid: "24266378", citation: "Phan CW et al. Hericium erinaceus (Bull.: Fr.) Pers. cultivated under tropical conditions: isolation of hericenones and erinacines and their neurite outgrowth-promoting activity. Evid Based Complement Alternat Med 2014." }]
  },
  "magnolia": {
    scientificName: "Magnolia officinalis (Magnolia Bark)",
    mechanismSummary: "Contains honokiol and magnolol, which are potent positive allosteric modulators of GABA-A receptors (similar to benzodiazepines but with different binding sites). They also exhibit significant antioxidant and anti-inflammatory properties.",
    safetyNote: "Half-life: Honokiol ~40-60 mins (fast clearance). Can be sedating; do not drive after high doses. Synergistic with other GABAergics like L-Theanine.",
    mechanisms: ["GABA-A Receptor Modulation", "PPAR-gamma Activation", "NF-kB Inhibition"],
    references: [{ pmid: "22771443", citation: "Woodbury A et al. Honokiol: a novel profile for therapeutic intervention in chronic pain. CNS Neurosci Ther 2013." }]
  },
  "phosphatidylserine": {
    scientificName: "Phosphatidylserine (PS)",
    mechanismSummary: "An essential phospholipid found in high concentrations in the inner layer of neuronal membranes. It maintains membrane fluidity, facilitates signal transduction, and modulates the activity of neurotransmitters like acetylcholine and dopamine. It also blunts cortisol response to exercise.",
    safetyNote: "Half-life: ~Varies. Soy-derived PS is common; sunflower-derived is preferred for soy-sensitive individuals. Safe and well-tolerated at 300mg/day.",
    mechanisms: ["Neuronal Membrane Fluidity", "Acetylcholine Signal Transduction", "Cortisol Modulation"],
    references: [{ pmid: "21846313", citation: "Glade MJ et al. Phosphatidylserine and the human brain. Nutrition 2015." }]
  },
  "l-theanine": {
    scientificName: "L-gamma-glutamylethylamide (L-Theanine)",
    mechanismSummary: "An amino acid analogue of glutamate and glutamine that crosses the blood-brain barrier and increases alpha-wave brain activity. It increases GABA, serotonin, and dopamine levels while antagonizing glutamate receptors (NMDA/AMPA).",
    safetyNote: "Half-life: ~58-74 minutes. Non-sedating relaxation. Often stacked with caffeine (1:2 ratio) to neutralize 'jitters' and improve focus.",
    mechanisms: ["Alpha-Wave Generation", "NMDA Receptor Antagonism", "GABA Synthesis Stimulation"],
    references: [{ pmid: "18296328", citation: "Nobre AC et al. L-theanine, a natural constituent in tea, and its effect on mental state. Asia Pac J Clin Nutr 2008." }]
  },
  "5-htp": {
    scientificName: "5-Hydroxytryptophan (Oxitriptan)",
    mechanismSummary: "The immediate metabolic precursor to serotonin (5-HT), bypassed the rate-limiting step of tryptophan hydroxylase. It crosses the blood-brain barrier easily and increases central serotonin synthesis.",
    safetyNote: "Half-life: ~2-7 hours. WARNING: Risk of Serotonin Syndrome if combined with SSRIs, SNRIs, or MAOIs. Should be taken with green tea extract (EGCG) to prevent peripheral serotonin buildup (heart valve issues).",
    mechanisms: ["Serotonin Synthesis Precursor", "Melatonin Production Support"],
    references: [{ pmid: "16023222", citation: "Turner EH et al. Serotonin a la carte: supplementation with the serotonin precursor 5-hydroxytryptophan. Pharmacol Ther 2006." }]
  },
  "l-tryptophan": {
    scientificName: "L-Tryptophan",
    mechanismSummary: "An essential amino acid and primary precursor to serotonin and melatonin. Unlike 5-HTP, it is also used for protein synthesis and niacin (Vitamin B3) production via the kynurenine pathway.",
    safetyNote: "Half-life: ~1 hour. More subtle than 5-HTP. Competition with other Large Neutral Amino Acids (LNAAs) for transport; take on an empty stomach for better brain entry.",
    mechanisms: ["Serotonin Precursor", "Kynurenine Pathway Substrate", "Melatonin Synthesis"],
    references: [{ pmid: "26805875", citation: "Richard DM et al. L-Tryptophan: Basic Metabolic Functions, Behavioral Research and Therapeutic Indications. Int J Tryptophan Res 2009." }]
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
console.log(`Supplement Enrichment (Part B - Nootropics) complete: ${updated} items enriched.`);
