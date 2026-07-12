import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const PRODUCT_DICTIONARY = {
  'bpc-157': {
    description: "BPC-157 (Body Protection Compound 157) is a synthetic pentadecapeptide discovered in human gastric juice. It is renowned for its profound cytoprotective and regenerative properties, accelerating the healing of tendons, ligaments, and mucosal linings.",
    indications: ["Tendon and ligament repair", "Gastrointestinal healing", "Systemic inflammation reduction"]
  },
  'tb-500': {
    description: "TB-500 is a synthetic fraction of Thymosin Beta-4, an actin-sequestering protein. It plays a critical role in cellular migration, angiogenesis, and tissue regeneration.",
    indications: ["Muscle tear recovery", "Joint inflammation", "Hair follicle stimulation"]
  },
  'semaglutide': {
    description: "Semaglutide is a highly effective GLP-1 receptor agonist that regulates appetite and caloric intake by delaying gastric emptying and acting on hypothalamic feeding centers.",
    indications: ["Obesity management", "Type 2 Diabetes", "Cardiovascular risk reduction"]
  },
  'tirzepatide': {
    description: "Tirzepatide is a first-in-class dual GIP and GLP-1 receptor agonist. It provides synergistic metabolic benefits, leading to unprecedented weight loss and improvements in insulin sensitivity.",
    indications: ["Severe obesity", "Metabolic syndrome", "Type 2 Diabetes"]
  },
  'retatrutide': {
    description: "Retatrutide is an investigational triple hormone receptor agonist (GLP-1, GIP, and Glucagon). It profoundly increases resting energy expenditure while suppressing appetite.",
    indications: ["Advanced weight loss", "Liver steatosis (NAFLD)"]
  },
  'cjc-1295': {
    description: "CJC-1295 (without DAC) is a tetrasubstituted 30-amino acid peptide hormone that functions as a Growth Hormone Releasing Hormone (GHRH) analog, increasing endogenous GH pulses.",
    indications: ["Anti-aging", "Lean muscle accretion", "Sleep optimization"]
  },
  'ipamorelin': {
    description: "Ipamorelin is a highly selective Growth Hormone Secretagogue (GHSR) that triggers the pituitary gland to release GH without elevating cortisol or prolactin levels.",
    indications: ["Anti-aging", "Body composition improvement", "Recovery"]
  },
  'ghk-cu': {
    description: "GHK-Cu (Copper Peptide) is a naturally occurring human tripeptide with high affinity for copper ions. It modulates thousands of genes, reversing age-related epigenetic changes.",
    indications: ["Skin rejuvenation", "Wound healing", "Hair growth stimulation"]
  },
  'nad+': {
    description: "Nicotinamide Adenine Dinucleotide (NAD+) is a vital cellular coenzyme involved in redox reactions and the activation of longevity pathways (Sirtuins and PARPs).",
    indications: ["Cellular energy restoration", "Neuroprotection", "Anti-aging"]
  },
  'ss-31': {
    description: "SS-31 (Elamipretide) is a mitochondria-targeted peptide that selectively binds to cardiolipin, stabilizing the inner mitochondrial membrane and optimizing electron transport.",
    indications: ["Mitochondrial dysfunction", "Chronic fatigue", "Neurodegeneration"]
  },
  'mots-c': {
    description: "MOTS-c is a 16-amino acid peptide encoded by the mitochondrial genome. It acts as an exercise mimetic, primarily targeting skeletal muscle to enhance insulin sensitivity and AMPK activation.",
    indications: ["Metabolic flexibility", "Exercise capacity enhancement", "Weight management"]
  },
  'thymosin alpha-1': {
    description: "Thymosin Alpha-1 is a highly conserved endogenous peptide that modulates the immune system. It restores T-cell function and enhances innate immunity against viral and bacterial pathogens.",
    indications: ["Immunodeficiency", "Chronic viral infections", "Autoimmune regulation"]
  },
  'dsip': {
    description: "DSIP (Delta Sleep-Inducing Peptide) is a neuromodulator that crosses the blood-brain barrier to promote deep, restorative slow-wave sleep and blunt systemic stress responses.",
    indications: ["Insomnia", "Circadian rhythm disruption", "Stress reduction"]
  },
  'epithalon': {
    description: "Epithalon is a synthetic tetrapeptide based on a pineal gland extract. It is theorized to activate telomerase, reset the circadian rhythm, and provide profound anti-aging benefits.",
    indications: ["Longevity / Telomere extension", "Circadian reset", "Pineal gland regulation"]
  },
  'ara-290': {
    description: "ARA-290 (Cibinetide) is a peptide that specifically targets the Innate Repair Receptor (IRR). It stops inflammatory cascades and promotes the regeneration of small nerve fibers.",
    indications: ["Small fiber neuropathy", "Chronic pain", "Systemic inflammation"]
  },
  '5-amino 1 mq': {
    description: "5-Amino-1MQ is a small molecule NNMT inhibitor. By blocking NNMT, it increases cellular NAD+ levels, dramatically increasing basal metabolic rate and fat burning.",
    indications: ["Stubborn fat loss", "Metabolic syndrome"]
  },
  'kisspeptin-10': {
    description: "Kisspeptin-10 is a neuromodulatory peptide that acts upstream of GnRH to stimulate the natural, pulsatile release of luteinizing hormone (LH) and follicle-stimulating hormone (FSH).",
    indications: ["HPTA axis restart", "Testosterone optimization", "Fertility"]
  },
  'pt-141': {
    description: "PT-141 (Bremelanotide) is a melanocortin receptor agonist that works directly on the central nervous system to induce sexual arousal and treat sexual dysfunction.",
    indications: ["Erectile dysfunction (ED)", "Hypoactive sexual desire disorder (HSDD)"]
  },
  'melanotan': {
    description: "Melanotan II (MT2) is an alpha-MSH analog that stimulates melanogenesis (skin darkening) and provides systemic photoprotection against UV damage.",
    indications: ["Photoprotection", "Tanning", "Libido enhancement"]
  }
};

async function enrichProducts() {
  const snapshot = await db.collection('products').get();
  console.log(`Auditing ${snapshot.docs.length} products...`);
  
  let updatedCount = 0;
  const batchSize = 100;
  let batch = db.batch();
  let opCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const pNameLower = (data.name || data.title || data.displayName || '').toLowerCase();
    
    // Skip magistral/compounded raw APIs unless specifically matched
    if (data.category === 'API Magistral' && !data.name.includes('Magistral')) {
       // Maybe skip, but we'll use dictionary matching instead
    }

    let matchKey = null;
    for (const key of Object.keys(PRODUCT_DICTIONARY)) {
      if (pNameLower.includes(key) || (key === 'melanotan' && pNameLower.includes('mt2'))) {
        matchKey = key;
        break;
      }
    }
    
    if (matchKey) {
      let newData = { ...data };
      const enrichment = PRODUCT_DICTIONARY[matchKey];
      
      let needsUpdate = false;
      
      // Update description if it's generic, missing, or short
      if (!newData.description || newData.description.length < 50 || newData.description.includes('Custom compounded formulation') || newData.description.includes('powder') || newData.description.includes('wholesale')) {
        newData.description = enrichment.description;
        needsUpdate = true;
      }
      
      // Add indications if missing
      if (!newData.indications || newData.indications.length === 0) {
        newData.indications = enrichment.indications;
        needsUpdate = true;
      }
      
      // Set clinical flags for the frontend
      if (newData.isClinical !== true) {
        newData.isClinical = true;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        batch.set(doc.ref, newData, { merge: true });
        opCount++;
        updatedCount++;
        console.log(`[ENRICHED] Product: ${data.name || data.title}`);
        
        if (opCount === batchSize) {
          await batch.commit();
          batch = db.batch();
          opCount = 0;
        }
      }
    }
  }
  
  if (opCount > 0) {
    await batch.commit();
  }
  
  console.log(`Product enrichment complete. Updated ${updatedCount} key peptide product sheets.`);
}

enrichProducts().catch(console.error).finally(() => process.exit(0));
