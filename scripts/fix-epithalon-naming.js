/**
 * fix-epithalon-naming.js
 *
 * Problem: product "epithalon-10-mg-anti-aging" has dosage (10 mg) and goal (anti aging)
 * embedded in its name. The clean canonical product already exists as "epithalon".
 *
 * Actions:
 * 1. Merge the dirty product into the clean "epithalon" product:
 *    - Move the variant (europeptides-epithalon-10-mg-anti-aging-pre-filled-pen-45-default)
 *      to products/epithalon/variants/
 *    - Update variant: canonicalId → "epithalon", canonicalName → "Epithalon"
 *    - Set dosage fields: dosage_amount=10, dosage_unit="mg" on the variant
 *    - goalIds already correct: ["anti_aging_longevity"]
 * 2. Delete the dirty product doc "epithalon-10-mg-anti-aging" (and its variants subcollection)
 *
 * Run: node scripts/fix-epithalon-naming.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const sa = require('./serviceAccountKey.json');

const app = initializeApp({ credential: cert(sa) }, 'fix-epithalon');
const db  = getFirestore(app);

const DIRTY_PRODUCT_ID = 'epithalon-10-mg-anti-aging';
const CLEAN_PRODUCT_ID = 'epithalon';
const VARIANT_ID       = 'europeptides-epithalon-10-mg-anti-aging-pre-filled-pen-45-default';

async function run() {
  console.log('=== Fix: Epithalon naming ===\n');

  // 1. Read the dirty variant
  const dirtyRef = db.collection('products')
    .doc(DIRTY_PRODUCT_ID)
    .collection('variants')
    .doc(VARIANT_ID);

  const dirtySnap = await dirtyRef.get();
  if (!dirtySnap.exists) {
    console.error('Dirty variant not found at expected path. Aborting.');
    process.exit(1);
  }

  const dirtyData = dirtySnap.data();
  console.log('Found dirty variant:', VARIANT_ID);
  console.log('Current data:', JSON.stringify(dirtyData, null, 2));

  // 2. Build the corrected variant data
  const correctedData = {
    ...dirtyData,
    // Fix canonical references
    canonicalId:   CLEAN_PRODUCT_ID,
    canonicalName: 'Epithalon',
    name:          dirtyData.name || 'Epithalon', // display name on variant
    // Extract dosage from name → structured fields
    dosage_amount:  10,
    dosage_unit:    'mg',
    dosage:         '10 mg',                       // human-readable combined field
    // goalIds already correct
    goalIds:        ['anti_aging_longevity'],
    // Timestamp
    updatedAt: new Date(),
  };

  // 3. Write to clean product's variants subcollection
  // New variant ID: strip the dosage/goal noise from the key
  const cleanVariantId = 'europeptides-epithalon-pen-10mg';
  const cleanRef = db.collection('products')
    .doc(CLEAN_PRODUCT_ID)
    .collection('variants')
    .doc(cleanVariantId);

  const batch = db.batch();

  // Write corrected variant under clean product
  batch.set(cleanRef, correctedData);

  // Delete old variant doc
  batch.delete(dirtyRef);

  await batch.commit();
  console.log('\n✅ Variant moved and corrected:');
  console.log(`  products/${DIRTY_PRODUCT_ID}/variants/${VARIANT_ID}`);
  console.log(`  → products/${CLEAN_PRODUCT_ID}/variants/${cleanVariantId}`);
  console.log('  Fields set: canonicalId, canonicalName, dosage_amount, dosage_unit, dosage');

  // 4. Delete the dirty product doc itself
  await db.collection('products').doc(DIRTY_PRODUCT_ID).delete();
  console.log(`\n✅ Deleted dirty product doc: products/${DIRTY_PRODUCT_ID}`);

  // 5. Verify clean product has correct fields
  const cleanProduct = await db.collection('products').doc(CLEAN_PRODUCT_ID).get();
  console.log('\nClean product after migration:', JSON.stringify(cleanProduct.data(), null, 2));

  console.log('\n=== Done ===');
  process.exit(0);
}

run().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
