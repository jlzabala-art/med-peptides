const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/v2/products.v2.json');
const SUPPLEMENTS_FILE = path.join(__dirname, '../src/data/v2/supplements.v2.json');
const PROTOCOLS_FILE = path.join(__dirname, '../src/data/protocolBlueprintsV2.json');

const productEnrichments = {
  "tirzepatide": {
    searchAliases: ["ly3298176", "mounjaro", "zepbound"],
    safetyNote: "Half-life: ~5 days. Contraindicated in patients with a personal or family history of Medullary Thyroid Carcinoma (MTC) or MEN 2.",
    mechanisms: ["GLP-1R Agonism", "GIPR Agonism", "Delayed Gastric Emptying", "Insulinotropic Action"]
  },
  "semaglutide": {
    searchAliases: ["nn9536", "ozempic", "wegovy", "rybelsus"],
    safetyNote: "Half-life: ~7 days. Contraindicated in patients with MTC or MEN 2. Monitor for pancreatitis.",
    mechanisms: ["GLP-1R Agonism", "Delayed Gastric Emptying", "Glucagon Suppression"]
  },
  "retatrutide": {
    searchAliases: ["ly3437943"],
    safetyNote: "Half-life: ~6 days. High potency tri-agonist; monitor for elevated resting heart rate and GI tolerance.",
    mechanisms: ["GLP-1R Agonism", "GIPR Agonism", "Glucagon Receptor Agonism"]
  },
  "mots-c": {
    searchAliases: ["mitochondrial open reading frame of the 12s rrna-c", "mitokine"],
    safetyNote: "Half-life: Short (<30 mins). Requires frequent dosing or specific exercise timing to maximize cellular uptake.",
    mechanisms: ["AMPK Activation", "Folate-Methionine Cycle Modulation", "AICAR Pathway Activation"]
  },
  "bpc-157": {
    searchAliases: ["bepecin", "pl 14736", "pl-10"],
    safetyNote: "Half-life: <4 hours. Systemic effects require frequent dosing. Monitor for excessive angiogenesis in individuals with pro-angiogenic risks.",
    mechanisms: ["FAK-Paxillin Pathway Activation", "VEGF Upregulation", "EGR-1 Induction", "Nitric Oxide System Modulation"]
  },
  "tb-500-thymosin-4": {
    searchAliases: ["thymosin beta 4 fragment", "tbeta4"],
    safetyNote: "Half-life: Variable. Generally well tolerated. Avoid in patients with active malignancies due to pro-migratory cellular effects.",
    mechanisms: ["Actin Sequestration", "Endothelial Cell Migration Facilitation", "Anti-inflammatory Cytokine Modulation"]
  },
  "aod-9604": {
    searchAliases: ["tyr-hgh277-191", "anti-obesity drug"],
    safetyNote: "Half-life: Short. Does not affect blood sugar or IGF-1 levels. Well tolerated with low side effect profile.",
    mechanisms: ["Beta-3 Adrenergic Receptor Activation", "Lipolysis Stimulation", "Lipogenesis Inhibition"]
  },
  "cjc-1295-without-dac-modified-grf-1-29": {
    searchAliases: ["mod grf 1-29", "tetrasubstituted grf"],
    safetyNote: "Half-life: ~30 minutes. Closely mimics physiological pulsatile GH release.",
    mechanisms: ["GHRH Receptor Agonism", "Pulsatile GH Secretion", "IGF-1 Elevation"]
  },
  "cjc-1295-with-dac": {
    searchAliases: ["drug affinity complex ghrh"],
    safetyNote: "Half-life: 5.8 to 8.1 days. Causes continuous GH bleed; monitor for insulin resistance with long-term use.",
    mechanisms: ["GHRH Receptor Agonism", "Albumin Binding", "Sustained GH Elevation"]
  },
  "ipamorelin": {
    searchAliases: ["aib-his-d-2nal-d-phe-lys-nh2", "gh secretagogue"],
    safetyNote: "Half-life: ~2 hours. Highly selective; does not significantly elevate cortisol or prolactin.",
    mechanisms: ["GHSR Agonism", "Somatostatin Inhibition", "Pulsatile GH Release"]
  },
  "ghk-cu": {
    searchAliases: ["glycyl-l-histidyl-l-lysine copper"],
    safetyNote: "Half-life: ~1 hour. Localized injection site pain is common; often mitigated by dilution or adding zinc.",
    mechanisms: ["Collagen Synthesis Stimulation", "Decorin Modulation", "Anti-inflammatory Modulation"]
  }
};

const supplementEnrichments = {
  "rapamycin": {
    searchAliases: ["sirolimus", "ay-22989"],
    safetyNote: "Half-life: 58-63 hours. Immunosuppressive at continuous high doses. Often dosed cyclically for anti-aging to preserve immune function.",
    mechanisms: ["mTOR Inhibition", "Autophagy Induction", "Cellular Senescence Modulation"]
  },
  "metformin": {
    searchAliases: ["dimethylbiguanide", "glucophage"],
    safetyNote: "Half-life: ~6.2 hours. Can cause B12 deficiency over time. Contraindicated in severe renal impairment.",
    mechanisms: ["AMPK Activation", "Hepatic Gluconeogenesis Suppression", "Peripheral Insulin Sensitization"]
  },
  "berberine": {
    searchAliases: ["berberis extract", "natural metformin"],
    safetyNote: "Half-life: ~several hours. May interact with CYP450 enzymes. Avoid taking simultaneously with macrolide antibiotics.",
    mechanisms: ["AMPK Activation", "Gut Microbiome Modulation", "Lipid Metabolism Regulation"]
  }
};

const protocolMonitoringMocks = {
  "Weight Management / Obesity": [
    { week: 0, labs: ["HbA1c", "Fasting Glucose", "Lipid Panel", "CMP", "TFTs"] },
    { week: 4, labs: ["Fasting Glucose", "Blood Pressure"] },
    { week: 12, labs: ["HbA1c", "Lipid Panel", "CMP", "Fasting Insulin"] }
  ],
  "Metabolic Health": [
    { week: 0, labs: ["Fasting Insulin", "HbA1c", "Lipid Panel", "hs-CRP"] },
    { week: 6, labs: ["Fasting Glucose", "Triglycerides"] },
    { week: 12, labs: ["Fasting Insulin", "HbA1c", "Lipid Panel", "hs-CRP"] }
  ],
  "Hormonal Support": [
    { week: 0, labs: ["Testosterone (Free/Total)", "IGF-1", "Estradiol", "CBC", "PSA (Men)"] },
    { week: 8, labs: ["IGF-1", "CBC"] },
    { week: 16, labs: ["Testosterone (Free/Total)", "IGF-1", "Estradiol", "PSA (Men)"] }
  ],
  "default": [
    { week: 0, labs: ["CBC", "CMP", "Lipid Panel"] },
    { week: 12, labs: ["CBC", "CMP"] }
  ]
};

function enrichProducts(filePath, enrichmentsMap) {
  let items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updated = 0;

  for (let item of items) {
    const enrich = enrichmentsMap[item.id];
    if (enrich) {
      // 1. Search Aliases
      if (!item.identity) item.identity = {};
      if (!item.identity.searchAliases) item.identity.searchAliases = [];
      
      for (const alias of enrich.searchAliases) {
        if (!item.identity.searchAliases.includes(alias)) {
          item.identity.searchAliases.push(alias);
        }
      }

      // 2. Safety Note
      if (!item.science) item.science = {};
      item.science.safetyNote = enrich.safetyNote;

      // 3. Mechanisms
      item.science.mechanisms = enrich.mechanisms;

      updated++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Enriched ${updated} items in ${path.basename(filePath)}`);
}

function enrichProtocols(filePath) {
  let items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updated = 0;

  for (let item of items) {
    // 4. Monitoring Schedule
    if (!item.monitoringSchedule || item.monitoringSchedule.length === 0) {
      const goal = item.primary_goal;
      const labs = protocolMonitoringMocks[goal] || protocolMonitoringMocks["default"];
      item.monitoringSchedule = labs;
      updated++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`Enriched ${updated} monitoring schedules in ${path.basename(filePath)}`);
}

try {
  enrichProducts(PRODUCTS_FILE, productEnrichments);
  enrichProducts(SUPPLEMENTS_FILE, supplementEnrichments);
  enrichProtocols(PROTOCOLS_FILE);
  console.log("Deep structural data enrichment completed.");
} catch (e) {
  console.error("Error during enrichment:", e);
}
