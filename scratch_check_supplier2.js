import { adminDb } from './src/lib/firebaseAdmin.js';

async function checkVariantsSubcollections() {
  const snapshot = await adminDb.collectionGroup('variants').get();
  let lotusCount = 0;
  let totalCount = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    totalCount++;
    if (data.supplierId === 'OLlBbQjgrj6tY7GmM2Jo' || data.supplier?.toLowerCase().includes('lotus')) {
      lotusCount++;
    }
  });
  console.log(`Total variants in subcollections: ${totalCount}`);
  console.log(`Total Lotusland variants in subcollections: ${lotusCount}`);
}

checkVariantsSubcollections();
