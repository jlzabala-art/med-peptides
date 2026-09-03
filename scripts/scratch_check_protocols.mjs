import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential;
credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

if (!initializeApp.apps?.length) {
  initializeApp({ credential });
}

const db = getFirestore();

async function run() {
  const protocolsSnap = await db.collection('protocols').limit(5).get();
  console.log("Protocols:");
  protocolsSnap.forEach(doc => {
    console.log(doc.id, JSON.stringify(doc.data().peptides), JSON.stringify(doc.data().phases));
  });

  const prescriptionsSnap = await db.collection('prescriptions').limit(5).get();
  console.log("\nPrescriptions:");
  prescriptionsSnap.forEach(doc => {
    console.log(doc.id, JSON.stringify(doc.data().items));
  });
}

run().catch(console.error);
