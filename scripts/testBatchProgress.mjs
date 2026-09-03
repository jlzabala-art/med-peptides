import { db } from './lib/firebase-admin.mjs';

const productsSnap = await db.collection('products').get();
console.log(`Total products: ${productsSnap.size}`);
let inspected = 0;
let fagron = 0;
for (const doc of productsSnap.docs) {
  inspected++;
  const vSnap = await db.collection('products').doc(doc.id).collection('variants').get();
  for (const vd of vSnap.docs) {
    const data = vd.data();
    if ((data.supplierName || '').includes('Fagron')) {
      fagron++;
    }
  }
  if (inspected % 50 === 0) {
    console.log(`Inspected ${inspected}/${productsSnap.size} products... Found ${fagron} Fagron variants so far.`);
  }
}
console.log(`Completed. Total Fagron variants: ${fagron}`);
