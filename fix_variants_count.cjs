const admin  = require('firebase-admin');
const dotenv = require('dotenv');
const path   = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}
const db = admin.firestore();

async function fixVariantsCount() {
  console.log('Fetching all products...');
  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} products.`);

  let updatedCount = 0;
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    
    // Fetch variants from subcollection
    const variantsSnap = await doc.ref.collection('variants').get();
    const actualVariantsCount = variantsSnap.size;
    
    let needsUpdate = false;
    const updateData = {};
    
    if (data.variantsCount !== actualVariantsCount) {
      updateData.variantsCount = actualVariantsCount;
      needsUpdate = true;
    }
    
    // Remove embedded variants array if it exists
    if (data.variants !== undefined) {
      updateData.variants = admin.firestore.FieldValue.delete();
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log(`Fixing product ${doc.id} (${data.canonicalName || data.name}): set variantsCount to ${actualVariantsCount}`);
      await doc.ref.update(updateData);
      updatedCount++;
    }
  }

  console.log(`Finished. Updated ${updatedCount} products.`);
}

fixVariantsCount().catch(console.error);
