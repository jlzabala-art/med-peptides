import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
let credential = cert({ projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') });
const app = initializeApp({ credential });
const db = getFirestore(app);
async function check() {
  const snap = await db.collection('products').where('name', '==', 'AOD-9604').get();
  if (snap.empty) {
    console.log("Not found");
    return;
  }
  console.log(JSON.stringify(snap.docs[0].data().variants, null, 2));
}
check();
