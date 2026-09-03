import { adminDb } from './src/lib/firebaseAdmin.js';

async function checkVariants() {
  const snapshot = await adminDb.collection('products').get();
  let count = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.variants) {
      data.variants.forEach(v => {
        if (v.supplierId === 'lotusland' || v.supplier === 'Lotusland Limited' || v.supplier?.toLowerCase().includes('lotus')) {
          console.log(`Found variant in ${doc.id}:`, { supplier: v.supplier, supplierId: v.supplierId });
          count++;
        }
      });
    }
  });
  console.log(`Total variants found: ${count}`);
}

checkVariants();
