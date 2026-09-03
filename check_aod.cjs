require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const app = getApps().length === 0 ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) : getApps()[0];
const db = getFirestore(app);
async function check() {
  const snap = await db.collection('products').where('canonicalName', '==', 'AOD-9604').get();
  if (snap.empty) {
     console.log('not found');
     return;
  }
  const id = snap.docs[0].id;
  const vsnap = await db.collection('products').doc(id).collection('variants').get();
  vsnap.forEach(d => console.log(d.id, JSON.stringify(d.data(), null, 2)));
}
check().then(() => process.exit(0));
