import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Initialize Firebase Admin (assuming default credentials or providing a path)
const serviceAccount = JSON.parse(readFileSync('/Users/joseluiszabala/.gemini/antigravity-ide/serviceAccountKey.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function cleanDosageData() {
  console.log('Fetching products...');
  const productsSnapshot = await db.collection('products').get();
  
  let count = 0;
  
  for (const productDoc of productsSnapshot.docs) {
    const variantsRef = productDoc.ref.collection('variants');
    const variantsSnapshot = await variantsRef.get();
    
    for (const variantDoc of variantsSnapshot.docs) {
      const variantData = variantDoc.data();
      let needsUpdate = false;
      let updates = {};
      
      const doseFields = ['dosage', 'dose', 'strength'];
      
      for (const field of doseFields) {
        if (typeof variantData[field] === 'string' && variantData[field].includes('e.g.')) {
          console.log(`Found invalid ${field} in variant ${variantDoc.id} of product ${productDoc.id}: ${variantData[field]}`);
          // Remove it entirely or replace "e.g. 5mg" with ""
          updates[field] = '';
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        console.log(`Updating variant ${variantDoc.id}...`, updates);
        await variantDoc.ref.update(updates);
        count++;
      }
    }
  }
  
  console.log(`Finished. Updated ${count} variants.`);
}

cleanDosageData().catch(console.error);
