import { adminDb } from './src/lib/firebaseAdmin.js';

const TARGET_SUPPLIER_ID = "OLlBbQjgrj6tY7GmM2Jo";

async function countTrueLotusland() {
  const pSnap = await adminDb.collection('products').get();
  let count = 0;

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
        count++;
      }
    }
  }

  console.log(`True Lotusland variants found: ${count}`);
  process.exit(0);
}

countTrueLotusland().catch(e => { console.error(e); process.exit(1); });
