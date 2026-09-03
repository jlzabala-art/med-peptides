import { adminDb } from './src/lib/firebaseAdmin.js';

async function check() {
  const vSnap = await adminDb.collection('products').doc('aod-9604').collection('variants').get();
  console.log(`Found ${vSnap.size} variants for AOD-9604`);
  vSnap.forEach(d => {
    const v = d.data();
    if ((v.supplier || '').toLowerCase().includes('fagron') || (v.supplierId || '').toLowerCase().includes('fagron')) {
       console.log(JSON.stringify(v, null, 2));
    }
  });
}

check().catch(console.error);
