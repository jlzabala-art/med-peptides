/**
 * audit_nplabs_variants.mjs
 * Diagnoses why NP Labs variants are not appearing in the catalog filter.
 * 
 * Checks:
 * 1. How many variants have supplierId = 'supplier-nplabs'
 * 2. How many variants have supplier = 'NP Labs' (string) but NO supplierId
 * 3. What field values exist for NP Labs variants across the DB
 * 4. Status distribution
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
  console.log('🔍 Fetching all variants via collectionGroup...\n');
  const allVariants = await db.collectionGroup('variants').get();
  console.log(`Total variants in DB: ${allVariants.size}\n`);

  const bySupplierIdNP = [];
  const bySupplierNameNP = [];
  const bySupplierIdBadString = []; // supplierId is a name string not an ID
  const statusCounts = {};
  const supplierIdValues = new Set();

  for (const doc of allVariants.docs) {
    const d = doc.data();
    const productId = doc.ref.parent.parent?.id;
    const supplierId = d.supplierId || null;
    const supplierName = d.supplier || d.supplierName || null;

    // Track all supplierId values
    if (supplierId) supplierIdValues.add(supplierId);

    // Check if this is an NP Labs variant
    const idMatchesNP = supplierId === NP_ID;
    const nameMatchesNP = NP_NAMES.some(n => 
      (supplierName || '').toLowerCase() === n.toLowerCase()
    );
    const idIsAName = supplierId && NP_NAMES.some(n => 
      supplierId.toLowerCase() === n.toLowerCase()
    );

    if (idMatchesNP) {
      bySupplierIdNP.push({ productId, variantId: doc.id, supplierId, supplierName, status: d.status || d.isActive, isActive: d.isActive });
    }
    if (nameMatchesNP && !idMatchesNP) {
      bySupplierNameNP.push({ productId, variantId: doc.id, supplierId, supplierName, status: d.status || d.isActive, isActive: d.isActive });
    }
    if (idIsAName) {
      bySupplierIdBadString.push({ productId, variantId: doc.id, supplierId, supplierName });
    }

    // Status distribution for NP Labs
    if (idMatchesNP || nameMatchesNP) {
      const s = d.status || (d.isActive === false ? 'inactive' : 'active');
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    }
  }

  console.log(`✅ Variants with supplierId = '${NP_ID}': ${bySupplierIdNP.length}`);
  console.log(`⚠️  Variants with supplier name = NP Labs but NO canonical supplierId: ${bySupplierNameNP.length}`);
  console.log(`❌ Variants where supplierId is a NAME string (not an ID): ${bySupplierIdBadString.length}\n`);

  if (bySupplierNameNP.length > 0) {
    console.log('--- Variants with name match but missing supplierId (first 10) ---');
    bySupplierNameNP.slice(0, 10).forEach(v => {
      console.log(`  productId: ${v.productId} | variantId: ${v.variantId} | supplierId: ${JSON.stringify(v.supplierId)} | supplierName: ${v.supplierName} | status: ${v.status}`);
    });
    console.log();
  }

  if (bySupplierIdBadString.length > 0) {
    console.log('--- Variants with supplierId as a name string ---');
    bySupplierIdBadString.forEach(v => {
      console.log(`  productId: ${v.productId} | variantId: ${v.variantId} | supplierId: "${v.supplierId}"`);
    });
    console.log();
  }

  console.log('--- Status distribution for NP Labs variants ---');
  console.log(statusCounts);
  console.log();

  // Summary of all distinct supplierIds in DB
  const npRelated = [...supplierIdValues].filter(v => 
    v.toLowerCase().includes('np') || v.toLowerCase().includes('nplabs')
  );
  console.log('--- All supplierId values related to NP Labs in DB ---');
  console.log(npRelated);

  // Products affected
  const affectedProducts = new Set(bySupplierNameNP.map(v => v.productId));
  console.log(`\n📦 Distinct products affected (variants need supplierId fix): ${affectedProducts.size}`);
  
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
