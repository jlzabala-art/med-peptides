import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const credential = cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '{}'));
initializeApp({ credential, projectId: 'Med-Peptides-app' });
const db = getFirestore();

async function run() {
  const pSnap = await db.collection('protocols').get();
  console.log(`protocols collection: ${pSnap.size} docs`);
  
  const bSnap = await db.collection('blueprints').get();
  console.log(`blueprints collection: ${bSnap.size} docs`);
}
run().catch(console.error);
