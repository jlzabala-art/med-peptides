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
    const allVariants = [];
    const variantsSnap = await db.collectionGroup('variants').get();
    variantsSnap.forEach(d => {
       allVariants.push({id: d.id, ...d.data()});
    });
    
    let suppliers = {};
    allVariants.forEach(v => {
       const sup = v.supplier || 'Unassigned';
       suppliers[sup] = (suppliers[sup] || 0) + 1;
    });
    console.log('Suppliers in subcollection variants:', suppliers);
}

run().catch(console.error);
