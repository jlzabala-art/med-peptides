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

async function check() {
  // 1. Check supplier doc
  const suppSnap = await db.collection('suppliers').where('name', '==', 'Europeptides').get();
  console.log('\n=== EUROPEPTIDES SUPPLIER ===');
  if (suppSnap.empty) {
    console.log('❌ Supplier NOT FOUND in Firestore');
  } else {
    suppSnap.forEach(d => console.log(d.id, JSON.stringify(d.data(), null, 2)));
  }

  // 2. Check products with supplierId = supplier-europeptides
  const byId = await db.collection('products').where('supplierId', '==', 'supplier-europeptides').get();
  console.log(`\n=== PRODUCTS (supplierId=supplier-europeptides): ${byId.size} docs ===`);

  // 3. Check products with supplierName containing europeptides (case insensitive variants)
  const byName = await db.collection('products').where('supplierName', '==', 'Europeptides').get();
  console.log(`=== PRODUCTS (supplierName=Europeptides): ${byName.size} docs ===`);

  // 4. Show samples if any exist
  const combined = [...byId.docs, ...byName.docs];
  if (combined.length > 0) {
    console.log('\nSample product:');
    console.log(JSON.stringify(combined[0].data(), null, 2));
  } else {
    console.log('\n⚠️  No Europeptides products found in Firestore.');
  }
}

check().catch(console.error);
