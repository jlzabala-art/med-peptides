import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const pSnap = await db.collection('products').get();
  let lotusCanonical = 0;
  let lotusVariants = 0;
  
  for (const doc of pSnap.docs) {
    const data = doc.data();
    let hasLotus = false;
    
    // Some products have supplier on canonical level
    if (data.supplier === 'Lotusland Limited' || data.supplier === 'lotusland') {
      hasLotus = true;
    }
    
    const vSnap = await doc.ref.collection('variants').get();
    let varCount = 0;
    
    for (const vDoc of vSnap.docs) {
      const vData = vDoc.data();
      if (vData.supplier === 'Lotusland Limited' || vData.supplier === 'lotusland') {
        varCount++;
        hasLotus = true;
      }
    }
    
    if (hasLotus) {
      lotusCanonical++;
      lotusVariants += varCount;
      //console.log(`Product ${data.name} has ${varCount} Lotusland variants`);
    }
  }
  
  console.log(`Total Canonical with Lotusland: ${lotusCanonical}`);
  console.log(`Total Variants with Lotusland: ${lotusVariants}`);
}
check().catch(console.error);
