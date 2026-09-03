import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./src/scripts/serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const querySnapshot = await db.collectionGroup('variants').get();
  let count = 0;
  querySnapshot.forEach(doc => {
    const data = doc.data();
    if (data.supplier === 'vallida' || data.supplierId === 'vallida' || data.supplierName === 'Vallida' || (data.supplier && data.supplier.toLowerCase().includes('vallida'))) {
      console.log('ID:', doc.id);
      console.log('supplier:', data.supplier);
      console.log('supplierId:', data.supplierId);
      console.log('supplierName:', data.supplierName);
      console.log('format:', data.format);
      console.log('presentation:', data.presentation);
      console.log('product_type:', data.product_type);
      console.log('---');
      count++;
    }
  });
  console.log(`Found ${count} variants.`);
}
check();
