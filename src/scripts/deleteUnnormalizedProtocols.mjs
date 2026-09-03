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
  const snap = await db.collection('protocols').get();
  
  let deletedCount = 0;
  
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    
    // Unnormalized if it lacks a BOM
    const hasValidBom = data.bom && Array.isArray(data.bom) && data.bom.length > 0 && data.bom.every(i => i.productId);
    
    if (!hasValidBom) {
      console.log(`Deleting: ${docSnap.id} - ${data.name || data.title || 'Unnamed'}`);
      await docSnap.ref.delete();
      deletedCount++;
    }
  }

  console.log(`\n✅ Successfully deleted ${deletedCount} unnormalized protocols.`);
  process.exit(0);
}

run().catch(console.error);
