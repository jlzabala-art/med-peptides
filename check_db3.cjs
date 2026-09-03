require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const app = getApps().length === 0 ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) : getApps()[0];
const db = getFirestore(app);
async function check() {
  const snap = await db.collectionGroup('variants').limit(1).get();
  if (!snap.empty) {
     const doc = snap.docs[0];
     console.log('Variant path:', doc.ref.path);
     console.log('Variant id:', doc.id);
     
     const inProducts = await db.collection('products').doc(doc.id).get();
     console.log('Exists in products collection at root?', inProducts.exists);
  }
}
check().then(() => process.exit(0));
