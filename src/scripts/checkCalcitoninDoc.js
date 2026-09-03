import { adminDb } from '../lib/firebaseAdmin.js';

async function checkCalcitoninDoc() {
  const prodDoc = await adminDb.collection('products').doc('lotus-calcitonin-raw-api').get();
  console.log("=== PRODUCT DOC ===");
  console.log(JSON.stringify(prodDoc.data(), null, 2));

  console.log("\n=== VARIANTS SUBCOLLECTION ===");
  const variantsSnap = await adminDb.collection('products').doc('lotus-calcitonin-raw-api').collection('variants').get();
  variantsSnap.forEach(doc => {
    console.log(`Variant ID: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
  });
}

checkCalcitoninDoc()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
