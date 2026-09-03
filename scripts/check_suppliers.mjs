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

async function check() {
  const llSnap = await db.collection('products').where('supplierName', '==', 'Lotusland Limited').limit(2).get();
  llSnap.forEach(d => console.log('Lotusland:', JSON.stringify(d.data(), null, 2)));

  // Try NP Labs variations
  const npSnap = await db.collection('products').where('supplierName', '==', 'NPLABS').limit(2).get();
  npSnap.forEach(d => console.log('NPLABS:', JSON.stringify(d.data(), null, 2)));
  
  const npSnap2 = await db.collection('products').where('supplierName', '==', 'NP Labs').limit(2).get();
  npSnap2.forEach(d => console.log('NP Labs:', JSON.stringify(d.data(), null, 2)));
  
  console.log("Done checking.");
}

check().catch(console.error);
