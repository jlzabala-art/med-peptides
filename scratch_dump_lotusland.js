import { adminDb } from './src/lib/firebaseAdmin.js';

const TARGET_SUPPLIER_ID = "OLlBbQjgrj6tY7GmM2Jo";

async function dumpTrueLotusland() {
  const pSnap = await adminDb.collection('products').get();
  let list = [];

  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').get();
    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      const isLotusland = (
        v.id?.toLowerCase().includes('lotusland') ||
        vDoc.id.toLowerCase().includes('lotusland') ||
        v.supplierId === TARGET_SUPPLIER_ID ||
        v.supplier?.toLowerCase().includes('lotusland') ||
        v.supplierName?.toLowerCase().includes('lotusland')
      );
      if (isLotusland) {
        list.push({
          productId: doc.id,
          variantId: vDoc.id,
          name: v.name,
          createdAt: v.createdAt || 'old',
          supplier: v.supplier,
          supplierId: v.supplierId
        });
      }
    }
  }

  console.log(JSON.stringify(list, null, 2));
  process.exit(0);
}

dumpTrueLotusland().catch(e => { console.error(e); process.exit(1); });
