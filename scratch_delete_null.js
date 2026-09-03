import { adminDb } from './src/lib/firebaseAdmin.js';

async function deleteNullSuppliers() {
  const pSnap = await adminDb.collection('products').get();
  let deletedCount = 0;
  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').get();
    for (const v of vSnap.docs) {
      const data = v.data();
      if (!data.supplierId || data.supplierId === 'null') {
        await v.ref.delete();
        deletedCount++;
        console.log(`Deleted null supplier variant: ${doc.id} -> ${v.id}`);
      }
    }
  }
  console.log(`Total variants without supplier deleted: ${deletedCount}`);
}

deleteNullSuppliers();
