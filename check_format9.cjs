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
  const formatIds = new Set();
  const formats = new Set();
  const presentations = new Set();
  snap.docs.forEach(d => {
    if (d.data().formatId) formatIds.add(d.data().formatId);
    if (d.data().format) formats.add(d.data().format);
    if (d.data().presentation) presentations.add(d.data().presentation);
  });
  console.log("formatIds:", Array.from(formatIds));
  console.log("formats:", Array.from(formats));
  console.log("presentations:", Array.from(presentations));
}
check().then(() => process.exit(0));
