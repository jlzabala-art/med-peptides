import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function inspect() {
  const uSnap = await db.collection('users').limit(20).get();
  for (const doc of uSnap.docs) {
    const data = doc.data();
    if (data.cart && data.cart.length > 0) {
      console.log('User Cart:', JSON.stringify(data.cart, null, 2));
      break;
    }
  }
}
inspect().catch(console.error);
