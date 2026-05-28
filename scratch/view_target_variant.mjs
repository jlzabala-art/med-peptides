import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function inspect() {
  const productsSnap = await db.collection('products').where('isActive', '==', true).limit(2).get();
  for (const doc of productsSnap.docs) {
    console.log(`Product: ${doc.id}`);
    console.log(JSON.stringify(doc.data(), null, 2));
    
    const variantsSnap = await doc.ref.collection('variants').limit(2).get();
    for (const vDoc of variantsSnap.docs) {
      console.log(`Variant: ${vDoc.id} under Product ${doc.id}`);
      console.log(JSON.stringify(vDoc.data(), null, 2));
    }
    console.log('----------------------------------------------------');
  }
}

inspect().catch(console.error);
