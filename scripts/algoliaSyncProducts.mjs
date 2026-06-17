import admin from 'firebase-admin';
import { readFileSync } from 'fs';

try {
  const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (e) {
  console.log("No serviceAccountKey.json found, falling back to default application credentials.");
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: 'med-peptides-app' });
  }
}

const db = admin.firestore();

async function run() {
  console.log("Triggering Algolia index for all active products...");
  const snapshot = await db.collection('products').where('active', '==', true).get();
  console.log(`Found ${snapshot.size} active products.`);

  let batch = db.batch();
  let count = 0;
  for (const doc of snapshot.docs) {
    batch.update(doc.ref, { _algoliaSyncTrigger: new Date().toISOString() });
    count++;
    
    // Firestore batches have a limit of 500
    if (count % 400 === 0) {
      await batch.commit();
      console.log(`Committed ${count} products...`);
      batch = db.batch(); // Create a new batch
    }
  }

  if (count % 400 !== 0) {
    await batch.commit();
  }
  
  console.log(`Successfully triggered Algolia sync for ${count} active products!`);
  process.exit(0);
}

run().catch(console.error);
