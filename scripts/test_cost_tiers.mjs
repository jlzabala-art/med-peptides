import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

const app = initializeApp({ credential });
const adminDb = getFirestore(app);

async function run() {
    const snap = await adminDb.collection('products').where('canonicalId', '==', '5-amino-1mq').get();
    const data = snap.docs[0].data();
    console.log("cost_tiers:", JSON.stringify(data.variants[0].cost_tiers, null, 2));
    console.log("pricing:", JSON.stringify(data.pricing, null, 2));
}

run().catch(console.error);
