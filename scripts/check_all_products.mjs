import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
let credential = cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') });
const app = initializeApp({ credential });
const db = getFirestore(app);
async function check() {
  const snap = await db.collection('products').get();
  for (let doc of snap.docs) {
    const data = doc.data();
    if (data.pricing || (data.variants && data.variants.some(v => v.pricing))) {
      console.log(`Product ${doc.id} has pricing object!`);
      if (data.variants) {
         console.log('Variant pricing:', JSON.stringify(data.variants.find(v => v.pricing)?.pricing, null, 2));
      } else {
         console.log('Root pricing:', JSON.stringify(data.pricing, null, 2));
      }
      break;
    }
  }
}
check();
