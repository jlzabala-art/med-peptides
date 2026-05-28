import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('serviceAccount-target.json', 'utf8'));
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  }, 'target-app');

  const db = app.firestore();
  
  // Find a product that is not a supplement
  const snapshot = await db.collection('products').get();
  let foundDoc = null;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (!foundDoc && data.type !== 'supplement') {
      foundDoc = { id: doc.id, ...data };
    }
  });

  if (foundDoc) {
    console.log('--- SAMPLE TARGET PRODUCT DOCUMENT ---');
    console.log(JSON.stringify(foundDoc, null, 2));

    // Also get its variants
    const varSnapshot = await db.collection('products').doc(foundDoc.id).collection('variants').get();
    console.log('--- VARIANTS ---');
    varSnapshot.forEach(doc => {
      console.log(`Variant ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  } else {
    console.log('No non-supplement products found.');
  }
} catch (e) {
  console.error('❌ Error inspecting target product:', e);
}
process.exit(0);
