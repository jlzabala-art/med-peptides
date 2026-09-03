import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

let serviceAccount;
try {
  serviceAccount = JSON.parse(
    readFileSync(new URL('./serviceAccountKey.json', import.meta.url))
  );
} catch (err) {
  console.error("❌ Failed to load serviceAccountKey.json");
  console.error(err.message);
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const collections = await db.listCollections();
  for (const collection of collections) {
    console.log(`Collection: ${collection.id}`);
    
    // Sample a document to see its schema
    const snap = await collection.limit(1).get();
    if (!snap.empty) {
      console.log(`  Sample Document ID: ${snap.docs[0].id}`);
      console.log(`  Keys: ${Object.keys(snap.docs[0].data()).join(', ')}`);
    } else {
      console.log(`  (Empty collection)`);
    }
  }
}

run().catch(console.error);
