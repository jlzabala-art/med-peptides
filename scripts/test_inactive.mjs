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
    const s = await adminDb.collection('products').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').get();
    let inactive = 0;
    s.docs.forEach(d => {
        const data = d.data();
        if ((data.status && ['inactive', 'archived', 'draft'].includes(data.status)) || data.isActive === false) {
            inactive++;
            console.log(data.canonicalName, data.status, data.isActive);
        }
    });
    console.log(`Inactive: ${inactive}`);
}

run().catch(console.error);
