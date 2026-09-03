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
const db = getFirestore(app);

async function run() {
    const productsSnap = await db.collection('products').get();
    let nplabs = [];

    for (const d of productsSnap.docs) {
        const p = d.data();
        let isNp = false;
        if ((p.supplier || '').toLowerCase().includes('np lab')) isNp = true;
        if ((p.supplierId || '').toLowerCase().includes('np lab')) isNp = true;
        if (isNp) nplabs.push(p);
    }
    
    console.log(`Total NP Labs: ${nplabs.length}`);
}

run().catch(console.error);
