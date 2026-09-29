import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});
const app = initializeApp({ credential });
const db = getFirestore(app);

async function findMore() {
  const snap = await db.collection('products').get();
  console.log(`Total products in Firestore: ${snap.size}`);
  snap.docs.forEach(doc => {
    const data = doc.data();
    const id = doc.id.toLowerCase();
    const name = (data.name || '').toLowerCase();
    const slug = (data.slug || '').toLowerCase();
    if (id.includes('lira') || name.includes('lira') || slug.includes('lira')) {
      console.log(`Found lira match: docId=${doc.id}, name=${data.name}, slug=${data.slug}`);
    }
    if (id.includes('brem') || name.includes('brem') || slug.includes('brem')) {
      console.log(`Found brem match: docId=${doc.id}, name=${data.name}, slug=${data.slug}`);
    }
  });
}

findMore().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
