require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const app = getApps().length === 0 ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) : getApps()[0];
const db = getFirestore(app);
async function check() {
  const vsnap = await db.collectionGroup('variants').get();
  vsnap.docs.filter(d => d.data().name?.includes('AOD') || d.id.includes('aod')).forEach(d => console.log(d.id, JSON.stringify(d.data(), null, 2)));
}
check().then(() => process.exit(0));
