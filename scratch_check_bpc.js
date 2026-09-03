import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./src/scripts/serviceAccountKey.json');
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function check() {
  const querySnapshot = await db.collection('products').where('canonicalId', '==', 'bpc-157').get();
  querySnapshot.forEach(doc => {
    const data = doc.data();
    console.log('ID:', doc.id);
    console.log('storage_conditions:', data.storage_conditions);
    console.log('typeData:', data.typeData);
  });
  
  if (querySnapshot.empty) {
     const doc2 = await db.collection('products').doc('bpc-157').get();
     if (doc2.exists) {
        console.log('ID:', doc2.id);
        console.log('storage_conditions:', doc2.data().storage_conditions);
     }
  }
}
check();
