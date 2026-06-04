import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();
async function run() {
  const snapshot = await db.collection('protocols').orderBy('created_at', 'desc').limit(20).get();
  console.log(`Found ${snapshot.size} protocols with orderBy.`);
}
run().catch(console.error).finally(() => process.exit(0));
