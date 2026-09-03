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
  const pens = snap.docs.filter(d => d.data().name?.toLowerCase().includes('vanilla') || d.data().name?.toLowerCase().includes('magenta'));
  pens.forEach(d => console.log(d.id, d.data().name, "FormatId:", d.data().formatId, "Format:", d.data().format, "Presentation:", d.data().presentation));
}
check().then(() => process.exit(0));
