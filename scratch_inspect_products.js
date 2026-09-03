import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function inspect() {
  const snapshot = await db.collection('products').get();
  console.log(`Found ${snapshot.size} products.`);
  
  const sample = [];
  let index = 0;
  for (const doc of snapshot.docs) {
    if (index >= 15) break;
    const data = doc.data();
    
    // Check for variants subcollection
    const variantsSnap = await doc.ref.collection('variants').get();
    const variants = variantsSnap.docs.map(v => ({ id: v.id, ...v.data() }));
    
    sample.push({
      id: doc.id,
      name: data.name,
      dosage: data.dosage || data.strength,
      variantsCount: variants.length,
      variants: variants
    });
    index++;
  }
  
  console.log(JSON.stringify(sample, null, 2));
}

inspect().catch(console.error);
