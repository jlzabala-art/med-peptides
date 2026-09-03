import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

async function checkLotuslandId() {
  const oldDocSnap = await db.collection('suppliers').doc('OLlBbQjgrj6tY7GmM2Jo').get();
  console.log('Old Lotusland doc exists:', oldDocSnap.exists);
  if (oldDocSnap.exists) {
    console.log('Data:', oldDocSnap.data());
  }

  const newDocSnap = await db.collection('suppliers').doc('supplier-lotusland').get();
  console.log('New supplier-lotusland doc exists:', newDocSnap.exists);

  const prodsOld = await db.collection('products').where('supplierId', '==', 'OLlBbQjgrj6tY7GmM2Jo').get();
  console.log(`Products with supplierId == 'OLlBbQjgrj6tY7GmM2Jo': ${prodsOld.size}`);

  const prodsName = await db.collection('products').where('supplierName', '==', 'Lotusland Limited').get();
  console.log(`Products with supplierName == 'Lotusland Limited': ${prodsName.size}`);

  process.exit(0);
}

checkLotuslandId().catch(console.error);
