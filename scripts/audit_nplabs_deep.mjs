/**
 * audit_nplabs_deep.mjs
 * Deep investigation of where NP Labs product data actually lives in Firestore.
 * Checks:
 * 1. Products with supplier/supplierId at root level referencing NP Labs
 * 2. Whether those products have variants subcollection
 * 3. Products where supplierId is at root level (the "bad" pattern)
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});
const db = getFirestore(app);

const NP_ID = 'supplier-nplabs';
const NP_NAMES = ['NP Labs', 'NP LABS', 'NPLAB', 'np labs', 'nplabs', 'NP-Labs'];

async function run() {
  console.log('🔍 Checking products root for NP Labs references...\n');
  const allProducts = await db.collection('products').get();
  console.log(`Total products: ${allProducts.size}\n`);

  const withRootSupplierId = [];
  const withRootSupplierName = [];
  const noVariantsCount = [];

  for (const doc of allProducts.docs) {
    const d = doc.data();
    const rootSupplierId = d.supplierId || d.supplier_id || null;
    const rootSupplierName = d.supplier || d.supplierName || null;

    const idMatchesNP = rootSupplierId === NP_ID;
    const nameMatchesNP = NP_NAMES.some(n => 
      (rootSupplierName || '').toLowerCase() === n.toLowerCase()
    );

    if (idMatchesNP) {
      // Check if it has variants
      const varSnap = await doc.ref.collection('variants').get();
      withRootSupplierId.push({ 
        id: doc.id, 
        name: d.name || d.canonicalName, 
        rootSupplierId, 
        rootSupplierName,
        status: d.status,
        variantCount: varSnap.size
      });
    }
    if (nameMatchesNP && !idMatchesNP) {
      const varSnap = await doc.ref.collection('variants').get();
      withRootSupplierName.push({
        id: doc.id,
        name: d.name || d.canonicalName,
        rootSupplierId,
        rootSupplierName,
        status: d.status,
        variantCount: varSnap.size
      });
    }
  }

  console.log(`Products with supplierId='${NP_ID}' at ROOT level: ${withRootSupplierId.length}`);
  withRootSupplierId.forEach(p => {
    console.log(`  [${p.status || 'no-status'}] ${p.id} — "${p.name}" — variants: ${p.variantCount}`);
  });

  console.log(`\nProducts with supplier name 'NP Labs' at ROOT level (bad pattern): ${withRootSupplierName.length}`);
  withRootSupplierName.forEach(p => {
    console.log(`  [${p.status || 'no-status'}] ${p.id} — "${p.name}" — supplierId: "${p.rootSupplierId}" — variants: ${p.variantCount}`);
  });

  // Also check how many products have NO variants subcollection at all
  console.log('\n🔍 Checking supplier analytics doc...');
  const supplierDoc = await db.collection('suppliers').doc(NP_ID).get();
  if (supplierDoc.exists) {
    const sd = supplierDoc.data();
    console.log('analytics:', JSON.stringify(sd.analytics, null, 2));
    console.log('productsSupplied:', sd.productsSupplied);
  }

  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
