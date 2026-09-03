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
    const snap = await adminDb.collection('products').limit(100).get();
    const suppliers = {};
    snap.docs.forEach(doc => {
        const data = doc.data();
        if (data.supplier && !suppliers[data.supplier]) {
            suppliers[data.supplier] = { 
                hasPriceEur: data.price_eur !== undefined,
                hasPrice: data.price !== undefined,
                sampleDocId: doc.id
            };
        }
    });
    console.log(suppliers);
}

run().catch(console.error);
