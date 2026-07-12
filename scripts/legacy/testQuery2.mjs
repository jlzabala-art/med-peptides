import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const creds = JSON.parse(readFileSync('./src/scripts/serviceAccountKey.json'));
initializeApp({ credential: cert(creds), projectId: 'med-peptides-app' });
const db = getFirestore();

async function run() {
  const b = await db.collection('blueprints').get();
  console.log('blueprints count:', b.size);
  const p = await db.collection('protocols').get();
  console.log('protocols count:', p.size);
}
run();
