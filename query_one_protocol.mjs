import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

if (!initializeApp.apps?.length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols')
    .where('protocol_name', '==', 'BPC-157 & TB-500 Ultimate Tissue Recovery')
    .limit(1)
    .get();
  
  if (snapshot.empty) {
    console.log("No protocol found");
    return;
  }
  
  snapshot.forEach(doc => {
    console.log(JSON.stringify({ id: doc.id, ...doc.data() }, null, 2));
  });
}

run().catch(console.error);
