import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function run() {
  const snap = await db.collection('wholesellers').get();
  console.log(`Found ${snap.size} wholesellers in Firestore.`);
  snap.forEach(d => {
    console.log(`Doc ID: ${d.id}`);
    console.log(JSON.stringify(d.data(), null, 2));
    console.log('-------------------------------');
  });
}

run().catch(console.error);
