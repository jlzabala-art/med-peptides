const fs = require('fs');
const path = require('path');

const PRODUCTS_FILE = path.join(__dirname, '../src/data/v2/products.v2.json');
const SUPPLEMENTS_FILE = path.join(__dirname, '../src/data/v2/supplements.v2.json');

const peptideUpdates = {
  "bpc-157": {
    scientificName: "Pentadecapeptide (GEPPPGKPADDAGLV)",
    mechanismSummary: "A synthetic pentadecapeptide derived from gastric juice that promotes tissue healing via upregulation of the nitric oxide system, VEGF expression, and FAK-paxillin pathway activation.",
    references: [{pmid: "30916660", citation: "Sikiric P et al. Brain-gut Axis and Pentadecapeptide BPC 157. Curr Pharm Des 2018."}]
  },
  "tb-500-thymosin-4": {
    scientificName: "Synthetic N-acetylated fragment of Thymosin β4 (Ac-LKKTETQ)",
    mechanismSummary: "A synthetic peptide that sequesters G-actin, reduces inflammation, promotes angiogenesis, and facilitates keratinocyte and endothelial cell migration.",
    references: [{pmid: "23171358", citation: "Goldstein AL et al. Thymosin β4: A multi-functional regenerative peptide. Ann N Y Acad Sci 2012."}]
  },
  "tirzepatide": {
    scientificName: "Dual GIP/GLP-1 receptor agonist",
    mechanismSummary: "A dual glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptor agonist that improves glycemic control and facilitates weight loss.",
    references: [{pmid: "35658024", citation: "Jastreboff AM et al. Tirzepatide Once Weekly for the Treatment of Obesity. NEJM 2022."}]
  },
  "semaglutide": {
    scientificName: "GLP-1 receptor agonist",
    mechanismSummary: "A long-acting GLP-1 receptor agonist that increases insulin secretion, suppresses glucagon release, and delays gastric emptying.",
    references: [{pmid: "34942372", citation: "Wilding JPH et al. Once-Weekly Semaglutide in Adults with Overweight or Obesity. NEJM 2021."}]
  },
  "retatrutide": {
    scientificName: "Triple GIP/GLP-1/glucagon receptor agonist",
    mechanismSummary: "A tri-agonist of the GIP, GLP-1, and glucagon receptors, showing significant efficacy in weight reduction and metabolic improvement.",
    references: [{pmid: "37366315", citation: "Jastreboff AM et al. Triple-Hormone-Receptor Agonist Retatrutide for Obesity. NEJM 2023."}]
  },
  "mots-c": {
    scientificName: "Mitochondrial-derived peptide (MRWQEMGYIFYPRKLR)",
    mechanismSummary: "An endogenous mitochondria-derived peptide that activates AMPK and the AICAR pathway, promoting metabolic homeostasis and insulin sensitivity.",
    references: [{pmid: "25738459", citation: "Lee C et al. The Mitochondrial-Derived Peptide MOTS-c Promotes Metabolic Homeostasis. Cell Metab 2015."}]
  },
  "ghk-cu": {
    scientificName: "Glycyl-L-histidyl-L-lysine copper(II) complex",
    mechanismSummary: "A naturally occurring copper complex that modulates gene expression, stimulates collagen and glycosaminoglycan synthesis, and supports tissue repair.",
    references: [{pmid: "22666519", citation: "Pickart L et al. The human tripeptide GHK-Cu in prevention of oxidative stress and degenerative conditions of aging. Oxid Med Cell Longev 2012."}]
  },
  "selank": {
    scientificName: "Synthetic tuftsin analog (Thr-Lys-Pro-Arg-Pro-Gly-Pro)",
    mechanismSummary: "A synthetic heptapeptide with anxiolytic and cognitive-enhancing effects, acting via GABAergic modulation and neurotrophin upregulation without sedation.",
    references: [{pmid: "20737030", citation: "Semenova TP et al. Selank anxiolytic effects. Bull Exp Biol Med 2010."}]
  },
  "semax": {
    scientificName: "Synthetic ACTH(4-10) analog (Met-Glu-His-Phe-Pro-Gly-Pro)",
    mechanismSummary: "A heptapeptide analogue of the ACTH(4-10) fragment that upregulates BDNF and NGF in the brain, enhancing dopaminergic and serotonergic neurotransmission.",
    references: [{pmid: "16805834", citation: "Dolotov OV et al. Semax stimulates BDNF expression in the mouse brain. J Neurochem 2006."}]
  },
  "epithalon": {
    scientificName: "Synthetic tetrapeptide (Ala-Glu-Asp-Gly)",
    mechanismSummary: "A synthetic tetrapeptide reported to modulate pineal gland function and potentially induce telomerase expression, researched in anti-aging contexts.",
    references: [{pmid: "14523363", citation: "Khavinson VKh. Peptides and ageing. Neuro Endocrinol Lett 2002."}]
  },
  "aod-9604": {
    scientificName: "Lipolytic fragment of Human Growth Hormone (hGH 177-191)",
    mechanismSummary: "A peptide fragment of human growth hormone that promotes lipolysis via β-adrenergic receptor pathways without inducing IGF-1 or insulin resistance.",
    references: [{pmid: "11713213", citation: "Ng FM et al. Metabolic studies of a synthetic lipolytic domain (AOD9604) of human growth hormone. Biochem Mol Biol Int 1997."}]
  },
  "5-amino-1mq": {
    scientificName: "5-Amino-1-methylquinolinium",
    mechanismSummary: "A small-molecule inhibitor of Nicotinamide N-methyltransferase (NNMT) that increases cellular NAD+ levels and promotes fat metabolism.",
    references: [{pmid: "29155147", citation: "Neelakantan H et al. Small molecule nicotinamide N-methyltransferase inhibitor activates senescent muscle stem cells. Biochem Pharmacol 2019."}]
  },
  "cjc-1295-without-dac-modified-grf-1-29": {
    scientificName: "Synthetic growth hormone-releasing hormone (GHRH) analog",
    mechanismSummary: "A synthetic GHRH analog that increases growth hormone and IGF-1 levels by binding to the GHRH receptor, with an extended half-life.",
    references: [{pmid: "17018654", citation: "Teichman SL et al. Prolonged stimulation of growth hormone (GH) and insulin-like growth factor I secretion by CJC-1295. J Clin Endocrinol Metab 2006."}]
  },
  "cjc-1295-with-dac": {
    scientificName: "Synthetic GHRH analog with Drug Affinity Complex",
    mechanismSummary: "A synthetic GHRH analog that binds covalently to serum albumin, providing a vastly extended half-life and sustained growth hormone elevation.",
    references: [{pmid: "17018654", citation: "Teichman SL et al. Prolonged stimulation of growth hormone (GH) and insulin-like growth factor I secretion by CJC-1295. J Clin Endocrinol Metab 2006."}]
  },
  "ipamorelin": {
    scientificName: "Synthetic growth hormone secretagogue (Aib-His-D-2Nal-D-Phe-Lys-NH2)",
    mechanismSummary: "A selective GH secretagogue receptor (GHSR) agonist that stimulates pulsatile growth hormone release with minimal effects on cortisol or prolactin.",
    references: [{pmid: "9625695", citation: "Raun K et al. Ipamorelin, the first selective growth hormone secretagogue. Eur J Endocrinol 1998."}]
  }
};

const supplementUpdates = {
  "ashwagandha": {
    scientificName: "Withania somnifera",
    mechanismSummary: "An Ayurvedic adaptogen that modulates the HPA axis, lowers cortisol, and interacts with GABAergic signaling to promote stress resilience.",
    references: [{pmid: "31517876", citation: "Lopresti AL et al. An investigation into the stress-relieving and pharmacological actions of an ashwagandha (Withania somnifera) extract. Medicine (Baltimore) 2019."}],
    faqItems: [{q: "What is the primary mechanism of Ashwagandha?", a: "Ashwagandha acts primarily by modulating the HPA axis, which helps reduce elevated cortisol levels, and by supporting GABAergic signaling to promote relaxation."}]
  },
  "rhodiola-rosea": {
    scientificName: "Rhodiola rosea L. (syn. Sedum roseum)",
    mechanismSummary: "An adaptogenic herb that influences monoamine levels (serotonin, dopamine, norepinephrine) and beta-endorphins, enhancing cognitive function and physical stamina.",
    references: [{pmid: "22228617", citation: "Hung SK et al. The effectiveness and efficacy of Rhodiola rosea L.: a systematic review of randomized clinical trials. Phytomedicine 2011."}],
    faqItems: [{q: "How does Rhodiola reduce fatigue?", a: "Rhodiola Rosea modulates neurotransmitters like dopamine and serotonin and supports beta-endorphin levels, which helps mitigate stress-induced fatigue and improves cognitive focus."}]
  },
  "berberine": {
    scientificName: "Berberis spp. alkaloid",
    mechanismSummary: "An isoquinoline alkaloid that activates AMPK, improving insulin sensitivity, reducing hepatic glucose production, and favorably altering lipid metabolism.",
    references: [{pmid: "18442638", citation: "Yin J et al. Efficacy of berberine in patients with type 2 diabetes mellitus. Metabolism 2008."}],
    faqItems: [{q: "How does Berberine affect blood sugar?", a: "Berberine activates the AMPK enzyme, often referred to as the metabolic master switch, which helps the body respond better to insulin and reduces glucose production in the liver."}]
  },
  "resveratrol": {
    scientificName: "3,5,4'-trihydroxy-trans-stilbene",
    mechanismSummary: "A polyphenolic compound that activates SIRT1, mimicking the effects of caloric restriction and providing antioxidant and anti-inflammatory benefits.",
    references: [{pmid: "21680702", citation: "Timmers S et al. Calorie restriction-like effects of 30 days of resveratrol supplementation on energy metabolism. Cell Metab 2011."}],
    faqItems: [{q: "Why is Resveratrol considered an anti-aging supplement?", a: "Resveratrol activates SIRT1, a sirtuin protein associated with longevity, and mimics some of the cellular benefits of caloric restriction, including improved mitochondrial function."}]
  },
  "nac": {
    scientificName: "N-Acetylcysteine",
    mechanismSummary: "A derivative of L-cysteine that serves as a precursor to glutathione, providing potent antioxidant, mucolytic, and immunomodulatory effects.",
    references: [{pmid: "33380301", citation: "Tenório M et al. N-Acetylcysteine (NAC): Impacts on Human Health. Antioxidants (Basel) 2021."}],
    faqItems: [{q: "What is the relationship between NAC and Glutathione?", a: "NAC provides the amino acid cysteine, which is the rate-limiting building block for the body to produce glutathione, its most powerful endogenous antioxidant."}]
  },
  "quercetin": {
    scientificName: "3,3',4',5,7-pentahydroxyflavone",
    mechanismSummary: "A dietary flavonoid with potent antioxidant and anti-inflammatory properties that inhibits the production of inflammatory cytokines and histamine.",
    references: [{pmid: "27187333", citation: "Li Y et al. Quercetin, Inflammation and Immunity. Nutrients 2016."}],
    faqItems: [{q: "How does Quercetin support the immune system?", a: "Quercetin acts as a zinc ionophore (helping zinc enter cells) and modulates inflammatory pathways, including the suppression of pro-inflammatory cytokines."}]
  },
  "rapamycin": {
    scientificName: "Sirolimus (Streptomyces hygroscopicus macrolide)",
    mechanismSummary: "A macrolide compound that directly inhibits mTOR (mechanistic target of rapamycin), a key regulator of cell growth, proliferation, and survival, researched for life-extension properties.",
    references: [{pmid: "25849885", citation: "Johnson SC et al. mTOR is a key modulator of ageing and age-related disease. Nature 2013."}],
    faqItems: [{q: "What is the mTOR pathway?", a: "mTOR is a cellular signaling pathway that regulates cell growth and metabolism. Inhibiting mTOR, as Rapamycin does, has been shown in studies to promote cellular maintenance processes like autophagy."}]
  },
  "metformin": {
    scientificName: "Dimethylbiguanide",
    mechanismSummary: "A biguanide antihyperglycemic agent that suppresses hepatic gluconeogenesis and increases peripheral insulin sensitivity, primarily by activating AMPK.",
    references: [{pmid: "28771695", citation: "Rena G et al. The mechanisms of action of metformin. Diabetologia 2017."}],
    faqItems: [{q: "Why is Metformin studied for longevity?", a: "Beyond its blood sugar benefits, Metformin activates AMPK and may reduce oxidative stress and inflammation, pathways closely linked to the aging process."}]
  }
};

function updateDataFile(filePath, updates, isSupplement) {
  console.log(`Reading ${filePath}...`);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let updatedCount = 0;

  for (let item of data) {
    if (updates[item.id]) {
      const updateInfo = updates[item.id];
      
      item.scientificName = updateInfo.scientificName;
      
      if (!item.science) item.science = {};
      item.science.mechanismSummary = updateInfo.mechanismSummary;
      
      // Ensure references array exists
      if (!item.science.references) {
        item.science.references = [];
      }
      
      // Add references if not already present (prevent duplicates)
      for (const ref of updateInfo.references) {
        if (!item.science.references.some(r => r.pmid === ref.pmid)) {
          item.science.references.push(ref);
        }
      }

      if (isSupplement && updateInfo.faqItems) {
        if (!item.aiContent) item.aiContent = {};
        if (!item.aiContent.faqModalItems) item.aiContent.faqModalItems = [];
        
        item.aiContent.faqModalEnabled = true;
        
        // Add FAQ items if not already present
        for (const faq of updateInfo.faqItems) {
          if (!item.aiContent.faqModalItems.some(f => f.q === faq.q)) {
            item.aiContent.faqModalItems.push(faq);
          }
        }
      }
      
      updatedCount++;
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Updated ${updatedCount} items in ${filePath}.`);
}

try {
  updateDataFile(PRODUCTS_FILE, peptideUpdates, false);
  updateDataFile(SUPPLEMENTS_FILE, supplementUpdates, true);
  console.log("Database enrichment completed successfully.");
} catch (error) {
  console.error("Error updating database:", error);
}
