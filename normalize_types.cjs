/**
 * normalize_types.cjs
 * Phase 2: Unify `productType` vs `type` across all Firestore products & variants
 *
 * Strategy for PRODUCTS:
 *   - `type` becomes the single authoritative field (lowercase canonical value)
 *   - `productType` is aliased to the same value (kept for 60-day compat)
 *   - Values mapped to canonical VALID_TYPES:
 *     api_raw_material, dual → raw_material
 *     hormone, small_molecule, injectable_nutrient, iv_protocol,
 *     topical_cosmetic, professional_material, compounding_material → (kept as-is, they map via category)
 *     finished_product → finished_product
 *
 * Strategy for VARIANTS:
 *   - Only 3 allowed values: raw_material | finished_product | clinical_supplies
 *   - Infer from presentation/UOM if type is missing or wrong
 */
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Canonical product types for parent products
const PRODUCT_TYPE_MAP = {
  'api_raw_material':     'raw_material',
  'dual':                 'dual',
  'peptide':              'finished_product',
  'supplement':           'finished_product',
  'hormone':              'finished_product',
  'small_molecule':       'finished_product',
  'injectable_nutrient':  'finished_product',
  'iv_protocol':          'finished_product',
  'topical_cosmetic':     'finished_product',
  'professional_material':'finished_product',
  'compounding_material': 'finished_product',
  'clinical_supplies':    'clinical_supplies',
  'equipment':            'clinical_supplies',
  'consumable':           'clinical_supplies',
  'diagnostic':           'finished_product',
  'test_kit':             'finished_product',
  'bundle':               'finished_product',
  'subscription':         'finished_product',
  'genetic_test':         'finished_product',
  'raw_material':         'raw_material',
  'finished_product':     'finished_product',
};

// Canonical variant types (strict — only 3 values)
const VARIANT_TYPE_CANONICAL = new Set(['raw_material', 'finished_product', 'clinical_supplies']);

function inferVariantType(vData) {
  // Explicit and already valid
  if (VARIANT_TYPE_CANONICAL.has(vData.type)) return vData.type;

  // Infer from presentation
  const pStr = String(vData.presentation || vData.presentationName || vData.format || '').toLowerCase();
  const uom = String(vData.unitOfMeasure || vData.supplierPricing?.unitOfMeasure || '').toLowerCase();

  const isRaw = uom === 'g' || uom === 'kg' || 
                pStr.includes('bulk') || pStr.includes('api') || pStr.includes('powder') ||
                vData.type === 'raw_material' || vData.type === 'api_raw_material';
  
  const isClinical = pStr.includes('syringe') || pStr.includes('needle') || pStr.includes('bac water') ||
                     pStr.includes('bacteriostatic') || pStr.includes('filter') || pStr.includes('diluent');

  if (isRaw) return 'raw_material';
  if (isClinical) return 'clinical_supplies';
  return 'finished_product';
}

function resolveProductType(data) {
  const raw = String(data.type || data.productType || '').toLowerCase().trim();
  return PRODUCT_TYPE_MAP[raw] || 'finished_product';
}

async function run() {
  console.log('🔍 Phase 2: Normalizing productType vs type in Firestore...\n');

  const snap = await db.collection('products').get();
  console.log(`Found ${snap.size} products to check.\n`);

  let productUpdated = 0;
  let productSkipped = 0;
  let variantUpdated = 0;
  let variantSkipped = 0;

  let batchCount = 0;
  let BATCH_SIZE = 400;
  let batch = db.batch();

  for (const doc of snap.docs) {
    const data = doc.data();

    // ── Normalize parent product ──
    const canonicalType = resolveProductType(data);
    const needsProductUpdate = 
      data.type !== canonicalType || 
      data.productType !== canonicalType;

    if (needsProductUpdate) {
      batch.update(doc.ref, { type: canonicalType, productType: canonicalType });
      batchCount++;
      productUpdated++;
      console.log(`✅ [${doc.id}] type "${data.type || '(empty)'}"/productType "${data.productType || '(empty)'}" → "${canonicalType}"`);
    } else {
      productSkipped++;
    }

    // ── Normalize variants ──
    const varSnap = await doc.ref.collection('variants').get();
    for (const vDoc of varSnap.docs) {
      const vData = vDoc.data();
      const canonicalVType = inferVariantType(vData);

      if (vData.type === canonicalVType) {
        variantSkipped++;
        continue;
      }

      batch.update(vDoc.ref, { type: canonicalVType });
      batchCount++;
      variantUpdated++;

      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`\n📦 Committed batch of ${BATCH_SIZE}.\n`);
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`\n📦 Committed batch of ${BATCH_SIZE}.\n`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`\n📦 Final batch committed (${batchCount} writes).`);
  }

  console.log(`\n✅ Phase 2 complete.`);
  console.log(`   Products updated:  ${productUpdated}  |  skipped: ${productSkipped}`);
  console.log(`   Variants updated:  ${variantUpdated}  |  skipped: ${variantSkipped}`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
