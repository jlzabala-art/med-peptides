import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
initializeApp({ credential: applicationDefault(), projectId: 'med-peptides-app' });
const db = getFirestore();
async function run() {
  const collections = await db.listCollections();
  console.log("Collections:", collections.map(c => c.id));
  
  const snapshot = await db.collection('prescriptions').limit(1).get();
  if (snapshot.empty) {
    console.log("No prescriptions found.");
  } else {
    snapshot.forEach(doc => console.log("Prescription doc:", JSON.stringify(doc.data(), null, 2)));
  }
}
run();
