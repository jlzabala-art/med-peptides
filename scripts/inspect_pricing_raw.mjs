import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

// Check 1 product from each supplier - raw structure
const samples = [
  '5-amino-1mq-10mg-vial',       // nplabs
  '5-amino-1-50-mg',              // europeptides
  'bpc-157-tb-500-ghk-cu',       // vallida
  'bioniq_5_amino_1mq_single_use_pen_100_mg', // bioniq
  '5-amino-1mq',                  // lotusland
];

for (const id of samples) {
  const doc = await db.collection('products').doc(id).get();
  if (doc.exists) {
    const d = doc.data();
    // Show all top-level fields and pricing structure
    const allKeys = Object.keys(d).sort();
    console.log(`\n=== ${id} ===`);
    console.log('  ALL FIELDS:', allKeys.join(', '));
    console.log('  pricing:', JSON.stringify(d.pricing, null, 2));
    console.log('  currency:', d.currency);
    console.log('  price:', d.price, '| priceUSD:', d.priceUSD, '| priceEUR:', d.priceEUR);
    console.log('  wholesalePrice:', d.wholesalePrice, '| retailPrice:', d.retailPrice, '| costPrice:', d.costPrice);
  }
}
process.exit(0);
