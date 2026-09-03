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
const supplierParam = 'OLlBbQjgrj6tY7GmM2Jo';
async function run() {
    let kpiQuery = adminDb.collection('products').where('supplierId', '==', supplierParam);
    const kpiSnapshot = await kpiQuery.get();
    console.log(`kpiSnapshot size: ${kpiSnapshot.docs.length}`);
}

run().catch(console.error);
