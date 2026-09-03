import { adminDb } from './src/lib/firebaseAdmin.js';

async function deleteFagronPens() {
  const pSnap = await adminDb.collection('products').get();
  let count = 0;
  let batch = adminDb.batch();
  
  for (const pDoc of pSnap.docs) {
    const vSnap = await pDoc.ref.collection('variants').get();
    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      const supplierName = (v.supplier || '').toLowerCase();
      if (supplierName.includes('fagron')) {
        const format = (v.formatId || v.format || v.presentation || '').toLowerCase();
        const vName = (v.name || '').toLowerCase();
        if (format.includes('pen') || vName.includes('pen')) {
          console.log(`Deleting Fagron Pen in product ${pDoc.id}: ${v.name}`);
          batch.delete(vDoc.ref);
          count++;
          
          if (count % 400 === 0) {
            await batch.commit();
            batch = adminDb.batch();
            console.log('Committed batch of 400.');
          }
        }
      }
    }
  }
  
  if (count % 400 !== 0) {
    await batch.commit();
  }
  
  console.log(`✅ Successfully deleted ${count} Fagron Pen variants.`);
}

deleteFagronPens().catch(console.error);
