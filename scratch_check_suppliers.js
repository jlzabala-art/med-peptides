import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./src/scripts/serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const querySnapshot = await db.collection('suppliers').get();
  querySnapshot.forEach(doc => {
    const data = doc.data();
    console.log('ID:', doc.id, 'name:', data.name, 'companyName:', data.companyName);
  });
}
check();
