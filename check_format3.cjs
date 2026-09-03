require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
const app = getApps().length === 0 ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) : getApps()[0];
const db = getFirestore(app);

async function check() {
  const snap = await db.collectionGroup('variants').get();
  snap.docs.filter(d => JSON.stringify(d.data()).toLowerCase().includes('vanilla') || JSON.stringify(d.data()).toLowerCase().includes('magenta')).forEach(d => console.log(d.id, d.data().name, "formatId:", d.data().formatId, "format:", d.data().format, "presentation:", d.data().presentation));
}
check().then(() => process.exit(0));
