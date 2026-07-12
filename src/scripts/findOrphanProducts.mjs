import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const wholesaleData = JSON.parse(fs.readFileSync('../data/wholesale_parsed.json', 'utf8'));
  const lotuslandProducts = Object.keys(wholesaleData);
  
  const snapshot = await db.collection('protocols').get();
  const allDrugs = new Set();
  
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.phase_blueprints) {
      data.phase_blueprints.forEach(phase => {
        if (phase.drugs) {
          phase.drugs.forEach(d => {
            const name = d.compound_name || d.name || d.compound || '';
            allDrugs.add(name.toLowerCase());
          });
        }
      });
    }
  });

  const orphans = [];
  const used = [];

  for (const product of lotuslandProducts) {
    const productLower = product.toLowerCase();
    
    // Check if any drug in any protocol contains the product name or vice versa
    let isUsed = false;
    for (const drug of allDrugs) {
      if (drug.includes(productLower) || productLower.includes(drug)) {
        isUsed = true;
        break;
      }
    }
    
    // Manual overrides for known aliases
    if (productLower === 'thymosin b4 (tb-500)' && Array.from(allDrugs).some(d => d.includes('tb-500'))) isUsed = true;
    if (productLower === 'ghk-cu (copper peptide)' && Array.from(allDrugs).some(d => d.includes('ghk'))) isUsed = true;
    
    if (isUsed) {
      used.push(product);
    } else {
      orphans.push(product);
    }
  }

  console.log("=== ORPHANED PRODUCTS ===");
  orphans.forEach(p => console.log(`- ${p}`));
  
  console.log("\n=== USED PRODUCTS ===");
  used.forEach(p => console.log(`- ${p}`));
}

run().catch(console.error).finally(() => process.exit(0));
