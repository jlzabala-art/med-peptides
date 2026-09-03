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
    let query = db.collection('products');
    const snapshot = await query.limit(500).get();
    
    let lotusCount = 0;
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.category !== 'Peptides') return;
        let isLotus = false;
        if ((data.supplier || '').toLowerCase().includes('lotusland')) isLotus = true;
        if ((data.supplierId || '').toLowerCase().includes('lotus')) isLotus = true;
        if (isLotus) lotusCount++;
    });
    
    console.log(`Lotusland peptides in first 500 products: ${lotusCount}`);
}

run().catch(console.error);
