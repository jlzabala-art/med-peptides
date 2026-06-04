import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('products').get();
  
  let batch = db.batch();
  let count = 0;
  
  for (const doc of snapshot.docs) {
    const d = doc.data();
    let pType = 'Other';
    
    const nameLower = (d.name || '').toLowerCase();
    
    if (d.supplier === 'Lotusland') {
      pType = 'Peptides';
    } else if (d.supplier === 'NPLAB') {
      pType = 'API Supplements';
    } else {
      if (nameLower.includes('acetate') || nameLower.includes('peptide') || nameLower.includes('thymosin') || nameLower.includes('bremelanotide') || nameLower.includes('tirzepatide') || nameLower.includes('humanin') || nameLower.includes('alprostadil') || nameLower.includes('dihexa')) {
        pType = 'API Peptides';
      } else if (nameLower.includes('test') || nameLower.includes('pellet') || nameLower.includes('platform')) {
        pType = 'Other';
      } else {
        pType = 'API Peptides'; // fallback
      }
    }
    
    if (d.supplier !== 'Lotusland' && d.supplier !== 'NPLAB' && pType !== 'API Peptides') {
       pType = 'Other';
    }
    
    batch.update(doc.ref, { product_type: pType });
    count++;
    
    if (count % 50 === 0) {
      await batch.commit();
      batch = db.batch();
      console.log(`Committed ${count} updates`);
    }
  }
  
  if (count % 50 !== 0) {
    await batch.commit();
    console.log(`Committed final ${count % 50} updates`);
  }
  
  console.log(`Migration complete. Updated ${count} products.`);
}

run().catch(console.error);
