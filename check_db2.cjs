require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const app = getApps().length === 0 ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) : getApps()[0];
const db = getFirestore(app);
async function check() {
  const v = await db.collection('products').doc('T2WumrIFHNiJL5UndJRN-default').get();
  console.log(v.exists ? 'EXISTS IN PRODUCTS' : 'NOT IN PRODUCTS');
  const snap = await db.collectionGroup('variants').where('variantId', '==', 'T2WumrIFHNiJL5UndJRN-default').get();
  console.log('IN VARIANTS SUBCOLLECTION:', snap.docs.length);
}
check().then(() => process.exit(0));
