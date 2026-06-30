import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({ credential: applicationDefault(), projectId: 'med-peptides-app' });
const db = getFirestore();
async function run() {
  const snapshot = await db.collection('protocols').limit(1).get();
  snapshot.forEach(doc => console.log(JSON.stringify(doc.data(), null, 2)));
}
run();
