/**
 * Activate all products that have Lotusland variants + clean ghost supplier docs
 * Usage: node scripts/activate_lotusland_products.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

console.log('=== STEP 1: Find all Lotusland parent products ===');
const varSnap = await db.collectionGroup('variants')
  .where('supplierId', '==', 'supplier-lotusland')
  .get();

const parentIds = [...new Set(varSnap.docs.map(d => d.ref.parent.parent.id))];
console.log(`Found ${parentIds.length} products with Lotusland variants`);

// Activate them all in batches of 500
let activated = 0;
let alreadyActive = 0;
const batches = [];
let batch = db.batch();
let count = 0;

for (const id of parentIds) {
  const ref = db.collection('products').doc(id);
  const doc = await ref.get();
  const data = doc.data();
  const isInactive = data?.isActive === false || ['inactive', 'archived', 'draft'].includes(data?.status);

  if (isInactive) {
    console.log(`  ✓ Activating: ${id} (${data?.canonicalName || data?.name}) [was: ${data?.status}]`);
    batch.update(ref, {
      status:    'active',
      isActive:  true,
      updatedAt: new Date().toISOString(),
    });
    count++;
    activated++;
    if (count >= 499) {
      batches.push(batch);
      batch = db.batch();
      count = 0;
    }
  } else {
    alreadyActive++;
  }
}

if (count > 0) batches.push(batch);

// Commit all batches
for (const b of batches) await b.commit();
console.log(`\nActivated: ${activated} products`);
console.log(`Already active: ${alreadyActive} products`);

console.log('\n=== STEP 2: Clean ghost supplier docs ===');
// Delete docs with no name that are clearly auto-generated or test docs
const ghostIds = ['24GENETICS', 'OLlBbQjgrj6tY7GmM2Jo'];
for (const id of ghostIds) {
  const doc = await db.collection('suppliers').doc(id).get();
  if (doc.exists) {
    const data = doc.data();
    const name = data.companyName || data.name || data.displayName;
    if (!name && (data.variantsSupplied === 0 || data.productsSupplied === 0)) {
      await db.collection('suppliers').doc(id).delete();
      console.log(`  🗑️  Deleted ghost supplier: ${id}`);
    } else {
      console.log(`  ⚠️  Skipped (has data): ${id} -> name=${name}, variants=${data.variantsSupplied}`);
    }
  } else {
    console.log(`  - Not found: ${id}`);
  }
}

console.log('\n✅ Done.');
process.exit(0);
