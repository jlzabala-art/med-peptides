const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

async function run() {
  const productsSnap = await db.collection('products').get();
  let rootCount = 0;
  let arrayVariantCount = 0;
  let subcollectionVariantCount = 0;

  for (const d of productsSnap.docs) {
    const data = d.data();
    if (data.supplierId) rootCount++;
    
    if (data.variants && Array.isArray(data.variants)) {
      if (data.variants.some(v => v.supplierId)) {
        arrayVariantCount++;
      }
    }
    
    const subSnap = await d.ref.collection('variants').get();
    if (!subSnap.empty) {
      if (subSnap.docs.some(v => v.data().supplierId)) {
        subcollectionVariantCount++;
      }
    }
  }

  console.log(`Products with root supplierId: ${rootCount}`);
  console.log(`Products with supplierId in variants array: ${arrayVariantCount}`);
  console.log(`Products with supplierId in variants subcollection: ${subcollectionVariantCount}`);
}

run().catch(console.error);
