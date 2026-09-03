import { adminDb } from './src/lib/firebaseAdmin.js';
console.log("STARTING SCRIPT");

const TARGET_SUPPLIER_ID = "OLlBbQjgrj6tY7GmM2Jo";

async function countVariants() {
  const pSnap = await adminDb.collection('products').get();
  let lotuslandVariantsCount = 0;

  for (const doc of pSnap.docs) {
    const vSnap = await doc.ref.collection('variants').where('supplierId', '==', TARGET_SUPPLIER_ID).get();
    lotuslandVariantsCount += vSnap.size;
  }

  console.log(`Lotusland has ${lotuslandVariantsCount} variants.`);
  process.exit(0);
}

countVariants().catch(e => { console.error(e); process.exit(1); });
