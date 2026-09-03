import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));
try {
  initializeApp({ credential: cert(serviceAccount) });
} catch (e) {}
const adminDb = getFirestore();

async function run() {
  const productsSnap = await adminDb.collection('products').where('category', '==', 'Peptides').get();
  
  let inactiveWithLotus = 0;
  let lotusVariantsHidden = 0;
  
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const isInactive = (data.status && ['inactive', 'archived', 'draft'].includes(data.status)) || data.isActive === false;
    
    if (isInactive) {
      const variantsSnap = await doc.ref.collection('variants').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').get();
      if (!variantsSnap.empty) {
        inactiveWithLotus++;
        lotusVariantsHidden += variantsSnap.size;
        console.log(`Product ${doc.id} (${data.canonicalName}) is inactive but has ${variantsSnap.size} Lotus variants! (isActive: ${data.isActive}, status: ${data.status})`);
        
        // Let's FIX it immediately
        await doc.ref.update({ isActive: true, status: 'active' });
      }
    }
  }
  
  console.log(`Fixed ${inactiveWithLotus} inactive canonicals hiding ${lotusVariantsHidden} Lotusland variants.`);
}
run();
