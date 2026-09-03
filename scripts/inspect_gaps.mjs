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

async function inspectDetails() {
  console.log('--- VALLIDA PRODUCTS ---');
  const vallidaSnap = await db.collection('products').where('supplierName', '==', 'vallida').get();
  const vallidaSnap2 = await db.collection('products').where('supplierId', '==', 'vallida').get();
  console.log(`Vallida by name: ${vallidaSnap.size}, by id: ${vallidaSnap2.size}`);
  vallidaSnap.docs.concat(vallidaSnap2.docs).slice(0, 3).forEach(d => {
    console.log(d.id, JSON.stringify(d.data(), null, 2));
  });

  console.log('\n--- BIONIQ PRODUCTS ---');
  const bioniqSnap = await db.collection('products').where('supplierId', '==', 'supplier-bioniq').get();
  console.log(`Bioniq products count: ${bioniqSnap.size}`);
  if (bioniqSnap.size > 0) {
    console.log('Sample Bioniq product status & structure:');
    const p = bioniqSnap.docs[0].data();
    console.log(`ID: ${bioniqSnap.docs[0].id}, status: "${p.status}", name: "${p.name}", supplierName: "${p.supplierName}"`);
    console.log('Full sample:', JSON.stringify(p, null, 2));
  }

  console.log('\n--- LOTUSLAND PRODUCTS ---');
  const lotusSnap = await db.collection('products').where('supplierName', '==', 'Lotusland Limited').get();
  console.log(`Lotusland by supplierName: ${lotusSnap.size}`);
  if (lotusSnap.size > 0) {
    const p = lotusSnap.docs[0].data();
    console.log(`ID: ${lotusSnap.docs[0].id}, status: "${p.status}", supplierId: "${p.supplierId}", supplierName: "${p.supplierName}"`);
  }

  process.exit(0);
}

inspectDetails().catch(console.error);
