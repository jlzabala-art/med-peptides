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
    const snap = await adminDb.collection('products').where('supplier', 'in', ['NP LABS', 'NPLAB']).limit(5).get();
    snap.docs.forEach(doc => {
        const data = doc.data();
        console.log({
            id: doc.id,
            price: data.price,
            price_eur: data.price_eur,
            price_per_kit_10: data.price_per_kit_10,
            kit_price_eur: data.kit_price_eur,
            // anything else related to EUR
            all_keys: Object.keys(data).filter(k => k.includes('eur') || k.includes('price'))
        });
    });
}

run().catch(console.error);
