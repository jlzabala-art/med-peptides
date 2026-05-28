const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/data/v2/supplements.v2.json');
const supplements = JSON.parse(fs.readFileSync(filePath, 'utf8'));

const enrichmentData = {
  // B-Vitamins
  "b-complex": {
    scientificName: "Vitamin B-Complex",
    science: {
      mechanismSummary: "Essential cofactors for enzymatic reactions involved in energy metabolism, DNA synthesis, and neurotransmitter production.",
      safetyNote: "Generally safe; high doses of B6 can cause neuropathy; B2 can cause harmless yellow urine.",
      mechanisms: ["Cofactor Enzymatic Support", "ATP Energy Production", "Neurotransmitter Synthesis", "Homocysteine Regulation"],
      references: [{ pmid: "26828517", citation: "Kennedy DO. B Vitamins and the Brain: Mechanisms, Dose and Efficacy--A Review. Nutrients. 2016." }]
    }
  },
  "biotin": {
    scientificName: "Biotin (Vitamin B7 / Vitamin H)",
    science: {
      mechanismSummary: "A key cofactor for carboxylase enzymes involved in fatty acid synthesis, gluconeogenesis, and amino acid metabolism.",
      safetyNote: "Can interfere with laboratory tests (e.g., thyroid tests). Discontinue 48-72h before blood work.",
      mechanisms: ["Carboxylase Enzyme Activation", "Keratin Synthesis Support", "Glucose Metabolism", "Fatty Acid Synthesis"],
      references: [{ pmid: "29057689", citation: "Patel DP et al. A Review of the Use of Biotin for Hair Loss. Skin Appendage Disord. 2017." }]
    }
  },

  // Vitamin D
  "vit-d3": {
    scientificName: "Cholecalciferol (Vitamin D3)",
    science: {
      mechanismSummary: "A fat-soluble pro-hormone that binds to the Vitamin D Receptor (VDR), regulating the expression of over 200 genes related to calcium absorption, immunity, and cell growth.",
      safetyNote: "Best taken with a fat-containing meal. Monitor blood levels (25-OH-D) to avoid toxicity (hypercalcemia).",
      mechanisms: ["VDR Receptor Activation", "Calcium Homeostasis", "Immune System Modulation", "Gene Expression Regulation"],
      references: [{ pmid: "27332080", citation: "Charoenngam N et al. Vitamin D for Skeletal and Extraskeletal Health: What We Should Know. Nutrients. 2019." }]
    }
  },
  "vit-d3-10-000iu-k2": {
    scientificName: "Cholecalciferol & Menaquinone-7 (D3 + K2)",
    science: {
      mechanismSummary: "Synergistic combination where D3 enhances calcium absorption and K2 (MK-7) activates osteocalcin and Matrix Gla Protein (MGP) to ensure calcium is deposited in bones rather than arteries.",
      safetyNote: "K2 can interfere with blood thinners like Warfarin. Consult a doctor if on anticoagulants.",
      mechanisms: ["Calcium Absorption Enhancement", "Bone Mineralization", "Vascular Calcification Inhibition", "MGP Activation"],
      references: [{ pmid: "29108909", citation: "Kuwabara A et al. Vitamin D and Vitamin K Team Up to Lower the Risk of CVD. Nutrients. 2017." }]
    }
  },

  // Magnesium
  "magnesium-citrate": {
    scientificName: "Magnesium Citrate",
    science: {
      mechanismSummary: "Highly bioavailable form of magnesium bound to citric acid, particularly effective for osmotic laxative effects and general mineral replenishment.",
      safetyNote: "High doses can cause loose stools. Monitor for electrolyte balance in renal impairment.",
      mechanisms: ["Enzymatic Cofactor Activity", "Osmotic Water Retention", "ATP Binding", "Muscle Relaxation"],
      references: [{ pmid: "28471742", citation: "Gröber U et al. Magnesium in Prevention and Therapy. Nutrients. 2015." }]
    }
  },
  "magnesium-glycinate": {
    scientificName: "Magnesium Bisglycinate",
    science: {
      mechanismSummary: "Magnesium bound to the amino acid glycine, providing high bioavailability and high GI tolerance; glycine also acts as an inhibitory neurotransmitter.",
      safetyNote: "Generally the best-tolerated magnesium form. Avoid taking with other minerals (calcium/iron) for maximum absorption.",
      mechanisms: ["Enzymatic Cofactor Activity", "NMDA Receptor Regulation", "Inhibitory Neurotransmission Support", "Muscle Relaxation"],
      references: [{ pmid: "28471742", citation: "Gröber U et al. Magnesium in Prevention and Therapy. Nutrients. 2015." }]
    }
  },
  "magnesium-threonate": {
    scientificName: "Magnesium L-Threonate",
    science: {
      mechanismSummary: "A specific form of magnesium shown in research to cross the blood-brain barrier effectively, increasing brain synapse density and supporting cognitive function.",
      safetyNote: "May cause minor headaches or drowsiness initially. Best taken in the evening for cognitive recovery.",
      mechanisms: ["BBB Penetration", "Synaptic Plasticity Support", "NMDA Receptor Regulation", "Neuroprotection"],
      references: [{ pmid: "20152177", citation: "Slutsky I et al. Enhancement of learning and memory by elevating brain magnesium. Neuron. 2010." }]
    }
  },
  "magnesium-5-matrix": {
    scientificName: "Magnesium Multi-Chelate Matrix",
    science: {
      mechanismSummary: "A comprehensive blend of magnesium chelates designed to provide both rapid and sustained release across multiple tissue types.",
      safetyNote: "Provides broad support; adjust dose based on gastrointestinal tolerance.",
      mechanisms: ["Multi-pathway Absorption", "Enzymatic Cofactor Activity", "Systemic Mineral Support", "Muscle & Nerve Function"],
      references: [{ pmid: "28471742", citation: "Gröber U et al. Magnesium in Prevention and Therapy. Nutrients. 2015." }]
    }
  },

  // Omega-3
  "omega-3-forte": {
    scientificName: "Eicosapentaenoic Acid (EPA) & Docosahexaenoic Acid (DHA)",
    science: {
      mechanismSummary: "Essential fatty acids that incorporate into cell membranes, modulating fluidity and signaling, and serving as precursors to anti-inflammatory resolvins.",
      safetyNote: "May have mild blood-thinning effects at very high doses (>3g/day). Discontinue before surgery.",
      mechanisms: ["Cell Membrane Fluidity", "Prostaglandin Inhibition", "Resolvin Production", "Triglyceride Reduction"],
      references: [{ pmid: "22332096", citation: "Calder PC. Omega-3 polyunsaturated fatty acids and inflammatory processes: nutrition or pharmacology? Br J Clin Pharmacol. 2013." }]
    }
  },

  // Zinc
  "zinc-citrate": {
    scientificName: "Zinc Citrate",
    science: {
      mechanismSummary: "Bioavailable form of zinc essential for immune function, protein synthesis, and enzymatic catalysis across hundreds of metabolic pathways.",
      safetyNote: "Take with food to avoid nausea. Chronic high dosing (>40mg) requires copper monitoring.",
      mechanisms: ["Transcription Factor Support", "Immune Cell Signaling", "Enzyme Catalysis", "Protein Structure Stability"],
      references: [{ pmid: "24470474", citation: "Prasad AS. Zinc: an antioxidant and anti-inflammatory agent: role of zinc in degenerative diseases of aging. J Trace Elem Med Biol. 2014." }]
    }
  },
  "zinc-gluconate": {
    scientificName: "Zinc Gluconate",
    science: {
      mechanismSummary: "Commonly used form of zinc in clinical studies for shortening the duration of respiratory symptoms and supporting innate immunity.",
      safetyNote: "Avoid taking on an empty stomach. May interfere with certain antibiotics (Quinolones/Tetracyclines).",
      mechanisms: ["Transcription Factor Support", "Innate Immune Response", "Enzyme Catalysis", "Antiviral Signaling Support"],
      references: [{ pmid: "24470474", citation: "Prasad AS. Zinc: an antioxidant and anti-inflammatory agent: role of zinc in degenerative diseases of aging. J Trace Elem Med Biol. 2014." }]
    }
  },

  // Trace & Sleep
  "boron": {
    scientificName: "Boron (Trace Mineral)",
    science: {
      mechanismSummary: "A trace element that influences the metabolism of calcium and magnesium and modulates the half-life of steroid hormones like testosterone and estrogen.",
      safetyNote: "Generally safe at nutritional levels. May increase free testosterone by lowering SHBG.",
      mechanisms: ["Steroid Hormone Modulation", "Mineral Metabolism Support", "Inflammatory Marker Reduction", "Bone Integrity"],
      references: [{ pmid: "26302884", citation: "Pizzorno L. Nothing Boring About Boron. Integr Med (Encinitas). 2015." }]
    }
  },
  "melatonin": {
    scientificName: "N-acetyl-5-methoxytryptamine",
    science: {
      mechanismSummary: "A pineal hormone that regulates the circadian rhythm by binding to MT1 and MT2 receptors; also acts as a potent mitochondrial antioxidant.",
      safetyNote: "May cause next-day drowsiness. Use lowest effective dose. Do not use before driving.",
      mechanisms: ["MT1/MT2 Receptor Agonism", "Circadian Rhythm Entrainment", "Mitochondrial Antioxidant", "Neuroprotection"],
      references: [{ pmid: "28466678", citation: "Masters A et al. Melatonin, the Hormone of Darkness: From Sleep Promotion to Whole Body Health. Brain Disord Ther. 2014." }]
    }
  },
  "sleep-support": {
    scientificName: "Sleep Optimization Complex",
    science: {
      mechanismSummary: "Synergistic blend of GABAergic modulators, mineral cofactors, and circadian regulators designed to reduce sleep latency and improve architecture.",
      safetyNote: "Do not combine with alcohol or sedatives. Avoid operating machinery after consumption.",
      mechanisms: ["GABAergic Support", "Cortisol Regulation", "Circadian Alignment", "Neuromuscular Relaxation"],
      references: [{ pmid: "21406339", citation: "Garrido M et al. The potential of a new nutraceutical as an antidepressant and anxiolytic. Nutrients. 2011." }]
    }
  },

  // LDN
  "ldn-0-5mg": { ldn: true },
  "ldn-1-5mg": { ldn: true },
  "ldn-2-5mg": { ldn: true },
  "ldn": { ldn: true },
  "ldn-4-5mg": { ldn: true },

  // Tadalafil
  "tadalafil": {
    scientificName: "Tadalafil (PDE5 Inhibitor)",
    science: {
      mechanismSummary: "A selective phosphodiesterase type 5 (PDE5) inhibitor that increases cyclic guanosine monophosphate (cGMP), leading to smooth muscle relaxation and increased blood flow.",
      safetyNote: "CONTRAINDICATED with nitrates (nitroglycerin) due to risk of fatal hypotension. Monitor blood pressure.",
      mechanisms: ["PDE5 Inhibition", "cGMP Elevation", "Nitric Oxide Pathway Support", "Smooth Muscle Relaxation"],
      references: [{ pmid: "15175902", citation: "Gacci M et al. Tadalafil 5 mg once daily in the treatment of lower urinary tract symptoms and erectile dysfunction. Ther Clin Risk Manag. 2007." }]
    }
  },

  // Specialized Support
  "dim": {
    scientificName: "3,3'-Diindolylmethane",
    science: {
      mechanismSummary: "A metabolite of indole-3-carbinol that modulates estrogen metabolism by favoring the production of protective 2-hydroxyestrone (2-OHE1).",
      safetyNote: "May change urine color (harmless orange). Can affect hormonal balance; consult with a specialist.",
      mechanisms: ["Estrogen Metabolite Modulation", "Aromatase Activity Regulation", "Antiproliferative Effects", "CYP1A1 Induction"],
      references: [{ pmid: "24490058", citation: "Thomson CA et al. A randomized, placebo-controlled trial of diindolylmethane for breast cancer biomarker modulation in patients taking tamoxifen. Breast Cancer Res Treat. 2017." }]
    }
  },
  "saw-palmetto": {
    scientificName: "Serenoa repens",
    science: {
      mechanismSummary: "A liposterolic extract that inhibits 5-alpha-reductase, the enzyme responsible for converting testosterone to dihydrotestosterone (DHT).",
      safetyNote: "Generally safe. Primarily used for BPH; monitor prostate symptoms with a physician.",
      mechanisms: ["5-Alpha-Reductase Inhibition", "DHT Binding Competition", "Anti-androgenic Effects", "Anti-inflammatory"],
      references: [{ pmid: "23249531", citation: "Suter A et al. Improving BPH symptoms and sexual dysfunctions with a saw palmetto preparation? Results from a pilot trial. Phytother Res. 2013." }]
    }
  },
  "spironolactone": {
    scientificName: "Spironolactone",
    science: {
      mechanismSummary: "A potassium-sparing diuretic that acts as an aldosterone receptor antagonist and a competitive inhibitor of the androgen receptor.",
      safetyNote: "Risk of hyperkalemia (high potassium). Monitor electrolytes. Avoid potassium supplements/salt substitutes.",
      mechanisms: ["Aldosterone Antagonism", "Androgen Receptor Blockade", "Potassium Retention", "Renal Tubule Modulation"],
      references: [{ pmid: "28392133", citation: "Layton AM et al. Spironolactone for adult female acne. Br J Dermatol. 2017." }]
    }
  },
  "lycopene": {
    scientificName: "Lycopene (Tetraterpene Carotenoid)",
    science: {
      mechanismSummary: "A potent antioxidant carotenoid that scavenges singlet oxygen and modulates gap-junctional communication and inflammatory signaling pathways.",
      safetyNote: "Best absorbed when cooked or taken with fats.",
      mechanisms: ["Singlet Oxygen Scavenging", "Gap-Junction Communication Support", "Lipid Peroxidation Inhibition", "Nrf2 Activation"],
      references: [{ pmid: "23046540", citation: "Caseiro RR et al. Lycopene: a review of its role in human health. Nutr Hosp. 2015." }]
    }
  },
  "bromelain": {
    scientificName: "Bromelain (Proteolytic Enzyme Complex)",
    science: {
      mechanismSummary: "A mixture of sulfur-containing proteolytic enzymes from pineapple that modulate cytokine expression and reduce edema and inflammation.",
      safetyNote: "May increase absorption of antibiotics. Avoid if allergic to pineapple. Can have mild anticoagulant effects.",
      mechanisms: ["Proteolysis of Inflammatory Mediators", "Bradykinin Inhibition", "Fibrinolysis Enhancement", "Cytokine Modulation"],
      references: [{ pmid: "23304525", citation: "Pavan R et al. Properties and therapeutic application of bromelain: a review. Biotechnol Res Int. 2012." }]
    }
  },
  "serrapeptase-300-000spu": {
    scientificName: "Serratiopeptidase (Proteolytic Enzyme)",
    science: {
      mechanismSummary: "A proteolytic enzyme produced by Serratia marcescens that thins mucus and breaks down non-living tissue (fibrin, biofilms, arterial plaque).",
      safetyNote: "Take on an empty stomach. May increase the effect of blood thinners.",
      mechanisms: ["Fibrinolysis", "Biofilm Disruption", "Mucolytic Activity", "Anti-edematous Action"],
      references: [{ pmid: "23381144", citation: "Bhagat S et al. Serratiopeptidase: a systematic review of its role in inflammation and pain management. Int J Surg. 2013." }]
    }
  }
};

// Handle LDN generic data
const ldnCommon = {
  scientificName: "Low Dose Naltrexone (LDN)",
  science: {
    mechanismSummary: "Acts as a transient opioid receptor antagonist, causing a rebound increase in endogenous endorphins and modulating Toll-like receptor 4 (TLR4) on microglia.",
    safetyNote: "Avoid if taking opioid painkillers. May cause vivid dreams initially. Consult with a provider for optimal dosing titration.",
    mechanisms: ["Opioid Receptor Rebound", "Microglial Activation Inhibition", "Endorphin Up-regulation", "Anti-inflammatory Signaling"],
    references: [{ pmid: "24526250", citation: "Younger J et al. The use of low-dose naltrexone (LDN) as a novel anti-inflammatory treatment for chronic pain. Clin Rheumatol. 2014." }]
  }
};

let updatedCount = 0;

supplements.forEach(supp => {
  let data = enrichmentData[supp.id];
  if (!data) return;

  if (data.ldn) {
    data = ldnCommon;
  }

  supp.scientificName = data.scientificName;
  supp.science = {
    ...supp.science,
    ...data.science
  };
  
  // Merge mechanisms to avoid duplicates
  const existingMechs = new Set(supp.science.mechanisms || []);
  (data.science.mechanisms || []).forEach(m => existingMechs.add(m));
  supp.science.mechanisms = Array.from(existingMechs);

  // Merge references by PMID
  const existingPmids = new Set((supp.science.references || []).map(r => r.pmid));
  (data.science.references || []).forEach(ref => {
    if (!existingPmids.has(ref.pmid)) {
      if (!supp.science.references) supp.science.references = [];
      supp.science.references.push(ref);
    }
  });

  updatedCount++;
});

fs.writeFileSync(filePath, JSON.stringify(supplements, null, 2));
console.log(`Successfully enriched ${updatedCount} supplements in Phase D.`);
