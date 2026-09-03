import { adminDb } from './src/lib/firebaseAdmin.js';

async function checkFagronPens() {
  const pSnap = await adminDb.collection('products').get();
  let count = 0;
  for (const pDoc of pSnap.docs) {
    const vSnap = await pDoc.ref.collection('variants').get();
    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      const supplierName = (v.supplier || '').toLowerCase();
      if (supplierName.includes('fagron')) {
        const format = (v.formatId || v.format || v.presentation || '').toLowerCase();
        const vName = (v.name || '').toLowerCase();
        if (format.includes('pen') || vName.includes('pen')) {
          console.log(`Fagron Pen found in product ${pDoc.id}: ${v.name}`);
          count++;
        }
      }
    }
  }
  console.log(`Total Fagron Pens found: ${count}`);
}

checkFagronPens().catch(console.error);
