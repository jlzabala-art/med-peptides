import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// A robust clinical dictionary for the most common peptides and protocols
const CLINICAL_DICTIONARY = {
  'bpc-157': {
    mechanism_of_action: "Upregulates VEGFR2 expression and stimulates angiogenesis. Promotes the synthesis of type I collagen and modulates the nitric oxide system.",
    efficacy_summary: "Consistently demonstrates accelerated healing of tendons, ligaments, and gastrointestinal mucosa in clinical and preclinical models.",
    scientific_references: [
      { title: "BPC 157 and Standard Angiogenic Growth Factors", authors: "Sikiric et al.", journal: "Current Pharmaceutical Design", year: 2018 }
    ]
  },
  'tb-500': {
    mechanism_of_action: "An actin-sequestering protein that upregulates actin mobility, promoting cell migration, angiogenesis, and anti-inflammatory pathways.",
    efficacy_summary: "Accelerates tissue repair, reduces inflammation in joints, and promotes hair follicle growth.",
    scientific_references: [
      { title: "Thymosin beta4 and tissue repair", authors: "Goldstein et al.", journal: "Expert Opinion on Biological Therapy", year: 2015 }
    ]
  },
  'semaglutide': {
    mechanism_of_action: "A GLP-1 receptor agonist that increases glucose-dependent insulin secretion, decreases inappropriate glucagon secretion, and slows gastric emptying.",
    efficacy_summary: "FDA-approved. Achieves 10-15% total body weight loss on average in clinical trials (STEP trials).",
    scientific_references: [
      { title: "Once-Weekly Semaglutide in Adults with Overweight or Obesity", authors: "Wilding et al.", journal: "NEJM", year: 2021 }
    ]
  },
  'tirzepatide': {
    mechanism_of_action: "A dual GIP and GLP-1 receptor agonist. It synergistically improves insulin sensitivity, increases satiety, and significantly reduces fat mass.",
    efficacy_summary: "FDA-approved. Achieves >20% total body weight loss on average (SURMOUNT trials).",
    scientific_references: [
      { title: "Tirzepatide Once Weekly for the Treatment of Obesity", authors: "Jastreboff et al.", journal: "NEJM", year: 2022 }
    ]
  },
  'retatrutide': {
    mechanism_of_action: "A novel triple agonist activating GLP-1, GIP, and Glucagon (GCGR) receptors simultaneously, drastically increasing energy expenditure and lipolysis.",
    efficacy_summary: "Phase 2 trials demonstrate unprecedented weight loss exceeding 24% at 48 weeks, with resolution of liver steatosis.",
    scientific_references: [
      { title: "Retatrutide, a GIP, GLP-1 and glucagon receptor agonist, for obesity", authors: "Jastreboff et al.", journal: "NEJM", year: 2023 }
    ]
  },
  'cjc-1295': {
    mechanism_of_action: "A synthetic GHRH (Growth Hormone Releasing Hormone) analog that binds to pituitary receptors to stimulate pulsatile GH release without increasing prolactin or cortisol.",
    efficacy_summary: "Significantly increases basal and peak IGF-1 levels, promoting lean muscle accretion, fat loss, and improved sleep architecture.",
    scientific_references: [
      { title: "Prolonged stimulation of growth hormone (GH) and IGF-I secretion by CJC-1295", authors: "Teichman et al.", journal: "JCEM", year: 2006 }
    ]
  },
  'ipamorelin': {
    mechanism_of_action: "A highly selective Growth Hormone Secretagogue (GHSR agonist) that stimulates pituitary GH release while suppressing somatostatin.",
    efficacy_summary: "Considered the mildest and safest GHRP, providing sustained GH release without the hunger spikes associated with GHRP-6.",
    scientific_references: [
      { title: "Ipamorelin, the first selective growth hormone secretagogue", authors: "Raun et al.", journal: "European Journal of Endocrinology", year: 1998 }
    ]
  },
  'ghk-cu': {
    mechanism_of_action: "A copper-binding peptide that modulates over 4,000 human genes, upregulating collagen/elastin production and downregulating inflammatory cytokines.",
    efficacy_summary: "Demonstrates profound anti-aging effects on skin, accelerates wound healing, and stimulates hair follicle anagen phase.",
    scientific_references: [
      { title: "Regenerative and Protective Actions of the GHK-Cu Peptide", authors: "Pickart et al.", journal: "IJMS", year: 2018 }
    ]
  },
  'nad+': {
    mechanism_of_action: "A critical coenzyme for PARP and sirtuins, driving cellular ATP production, mitochondrial biogenesis, and DNA repair.",
    efficacy_summary: "Systemic administration rapidly restores intracellular NAD+ pools, mitigating neurodegeneration and metabolic decline.",
    scientific_references: [
      { title: "Therapeutic potential of boosting NAD+ in aging and diseases", authors: "Aman et al.", journal: "Cell Metabolism", year: 2018 }
    ]
  },
  'ss-31': {
    mechanism_of_action: "A mitochondria-targeted peptide (Elamipretide) that binds selectively to cardiolipin on the inner mitochondrial membrane, optimizing electron transport.",
    efficacy_summary: "Reduces mitochondrial reactive oxygen species (ROS), restores ATP synthesis, and prevents mitochondrial depolarization.",
    scientific_references: [
      { title: "Mitochondria-targeted peptide SS-31 protects against age-related macular degeneration", authors: "Zhao et al.", journal: "Aging Cell", year: 2020 }
    ]
  },
  'mots-c': {
    mechanism_of_action: "A mitochondrial-derived peptide that translocates to the nucleus to regulate metabolic gene expression, particularly the AMPK pathway.",
    efficacy_summary: "Promotes metabolic flexibility, prevents diet-induced obesity, and enhances exercise capacity.",
    scientific_references: [
      { title: "The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis", authors: "Lee et al.", journal: "Cell Metabolism", year: 2015 }
    ]
  },
  'thymosin alpha-1': {
    mechanism_of_action: "An endogenous peptide that modulates the immune system by augmenting T-cell function, stimulating dendritic cells, and increasing NK cell activity.",
    efficacy_summary: "FDA-approved (Zadaxin) for Hepatitis B/C; widely used to restore immune function in immunocompromised states.",
    scientific_references: [
      { title: "Thymosin alpha 1: A comprehensive review", authors: "Dominari et al.", journal: "World J Virology", year: 2020 }
    ]
  }
};

async function auditAndEnrichProtocols() {
  const snapshot = await db.collection('protocols').get();
  console.log(`Auditing ${snapshot.docs.length} protocols...`);
  
  let updatedCount = 0;
  const batchSize = 100;
  let batch = db.batch();
  let opCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let needsUpdate = false;
    let newData = { ...data };
    const pNameLower = (data.protocol_name || '').toLowerCase();
    
    // 1. Fix Legacy Undefined Drugs in Phase Blueprints
    if (newData.phase_blueprints && Array.isArray(newData.phase_blueprints)) {
      newData.phase_blueprints.forEach((phase, phaseIdx) => {
        if (phase.drugs && Array.isArray(phase.drugs)) {
          phase.drugs.forEach((drug, drugIdx) => {
            // If it's missing compound_name but has product_slug or name, fix it
            if (!drug.compound_name) {
              if (drug.product_slug) {
                drug.compound_name = drug.product_slug.replace(/-/g, ' ').toUpperCase();
                needsUpdate = true;
              } else if (drug.name) {
                drug.compound_name = drug.name;
                needsUpdate = true;
              } else if (drug.compound) {
                drug.compound_name = drug.compound;
                needsUpdate = true;
              }
            }
            
            // Fix missing dose logic structure
            if (!drug.dose_logic && drug.amount) {
              drug.dose_logic = {
                starting_weekly_dose: drug.amount,
                dose_unit: drug.unit || "mg",
                administration_frequency: drug.frequency || "Daily",
                route_of_administration: "Subcutaneous"
              };
              needsUpdate = true;
            }
          });
        }
      });
    }

    // 2. Inject Missing Clinical Evidence
    if (!newData.clinical_evidence || !newData.clinical_evidence.mechanism_of_action) {
      // Try to find a matching dictionary entry based on the protocol name
      let matchKey = null;
      for (const key of Object.keys(CLINICAL_DICTIONARY)) {
        if (pNameLower.includes(key)) {
          matchKey = key;
          break;
        }
      }
      
      if (matchKey) {
        newData.clinical_evidence = CLINICAL_DICTIONARY[matchKey];
        if (!newData.description) {
          newData.description = `Advanced clinical protocol centering around ${matchKey.toUpperCase()}, designed to maximize therapeutic outcomes through precise dosing and synergism.`;
        }
        needsUpdate = true;
      }
    }
    
    // Default fixes for entirely empty descriptions
    if (!newData.description || newData.description.length < 5) {
      newData.description = `Advanced clinical protocol designed to optimize ${newData.primary_goal || 'health and recovery'} through structured therapeutic interventions.`;
      needsUpdate = true;
    }

    if (needsUpdate) {
      batch.set(doc.ref, newData, { merge: true });
      opCount++;
      updatedCount++;
      console.log(`[FIXED] Protocol: ${data.protocol_name || doc.id}`);
      
      if (opCount === batchSize) {
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }
    }
  }
  
  if (opCount > 0) {
    await batch.commit();
  }
  
  console.log(`Audit complete. Enriched and repaired ${updatedCount} legacy protocols.`);
}

auditAndEnrichProtocols().catch(console.error).finally(() => process.exit(0));
