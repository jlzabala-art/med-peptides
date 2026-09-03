import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

const db = admin.firestore();

// Known true peptides or closely associated (e.g., MK-677, NAD+) that shouldn't go to Fagron Iberica
const knownPeptides = [
  "5-Amino-1MQ", // Often grouped in these clinics
  "AOD 9604", "AOD-9604",
  "ARA-290",
  "Argireline Acetate",
  "BPC-157", "BPC", "TB-500", "TB500",
  "CJC", "CJC-1295", 
  "Cagrilintide",
  "Cardiogen", "Cartalax",
  "DSIP",
  "Dihexa",
  "Epitahalon", "Epithalon",
  "FOX-04",
  "FST344",
  "GHK-Cu", "GHK",
  "GHRP",
  "GLOW",
  "GW501516", // Cardarine - usually grouped with SARMs/Peptides
  "Glutathione",
  "HGH",
  "Hexarelin",
  "Humamin",
  "IGF",
  "Ipamorelin",
  "KLOW",
  "Kisspeptin",
  "LL-37",
  "MGF", "PEG-MGF",
  "MK-677",
  "MOTS-C", "Mots C",
  "MT2", "Melanotan",
  "NAD+", "NMN",
  "Nonapeptide",
  "Oxytocin",
  "PE 22-28", "PE22-28",
  "PNC-27",
  "PT-141",
  "Palmitoyl Tripeptide",
  "Pinealon",
  "Prostamax",
  "Retatrutide", "Retrotrotide",
  "SLU",
  "SS-31",
  "Selank", "Semaglutide", "Semax", "Sermorelin",
  "Tesamorelin",
  "Testagen", // Bioregulator
  "Thymogen", "Thymosin", "Thymalin",
  "Tirzepatide",
  "hCG"
];

// Determine if a product is a true peptide based on our list
function isPeptide(name) {
  // Check if any known peptide is part of the name
  return knownPeptides.some(p => name.toLowerCase().includes(p.toLowerCase()));
}

async function run() {
  console.log('--- Starting Non-Peptide Reassignment ---');
  let movedToIberia = 0;
  let remainingPeptides = new Set();
  
  const FAGRON_IBERIA_NAME = 'Fagron Iberica, S.A.U';
  const FAGRON_IBERIA_ID = 'zoho_1183263000025439003';

  const productsSnap = await db.collection('products').get();
  
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const sup = data.supplier || '';
    const cat = (data.category || '').toLowerCase();
    
    // Only target those we skipped before
    if (cat.includes('peptide') && (sup === '' || sup === 'UNKNOWN' || sup === 'Unknown')) {
      const name = data.name;
      
      // If it is NOT a true peptide
      if (!isPeptide(name)) {
        batch.update(doc.ref, {
          supplier: FAGRON_IBERIA_NAME,
          supplierId: FAGRON_IBERIA_ID
        });
        batchCount++;
        movedToIberia++;
        console.log(`[NON-PEPTIDE] Assigned to Iberia: ${name}`);
      } else {
        remainingPeptides.add(name);
      }
      
      if (batchCount === 400) {
        await batch.commit();
        batchCount = 0;
        batch = db.batch(); // Re-init
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('\n--- Summary ---');
  console.log(`Non-peptides moved to Fagron Iberica, S.A.U: ${movedToIberia}`);
  console.log(`Remaining true peptides: ${remainingPeptides.size}`);
  console.log('\n--- True Peptides (Still Unassigned) ---');
  [...remainingPeptides].sort().forEach(p => console.log(`- ${p}`));
  process.exit(0);
}

run().catch(console.error);
