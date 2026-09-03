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
    const products = productsSnap.docs.map(d => ({id: d.id, ...d.data()}));
    
    let lotusPeptides = [];

    for (const p of products) {
        if (p.category !== 'Peptides') continue;
        
        let isLotus = false;
        if ((p.supplier || '').toLowerCase().includes('lotusland')) isLotus = true;
        if ((p.supplierId || '').toLowerCase().includes('lotus')) isLotus = true;
        
        if (isLotus) {
            lotusPeptides.push(p);
        }
    }
    
    const supplierIds = {};
    for (const p of lotusPeptides) {
        const sid = p.supplierId || 'missing';
        if (!supplierIds[sid]) supplierIds[sid] = 0;
        supplierIds[sid]++;
    }
    
    console.log(supplierIds);
}

run().catch(console.error);
