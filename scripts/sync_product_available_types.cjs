/**
 * sync_product_available_types.cjs
 * Phase 3: Dynamic availableTypes[] & primaryType derivation from variants
 *
 * Runs across all products in Firestore:
 * 1. Normalizes all subcollection variants to atomic types (finished_product, raw_material, clinical_supplies, diagnostic, service).
 * 2. Derives availableTypes[], primaryType, and isHybrid on each parent product document.
 * 3. Syncs type and productType aliases.
 */
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

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

function inferVariantType(v, parent) {
  const t = (v.type || v.productType || '').toLowerCase().trim();
  if (['raw_material', 'finished_product', 'clinical_supplies', 'diagnostic', 'service'].includes(t)) {
    return t;
  }

  const pres = (v.presentation || v.dosageForm || v.presentationType || '').toLowerCase();
  const name = (v.name || v.sku || parent.name || '').toLowerCase();
  const uom  = (v.unitOfMeasure || v.uom || '').toLowerCase();

  if (
    pres.includes('bulk') || pres.includes('powder') || pres.includes('api') ||
    uom === 'g' || uom === 'kg' || uom === 'gram' ||
    name.includes('bulk api') || name.includes('raw material')
  ) {
    return 'raw_material';
  }

  if (
    pres.includes('bac water') || pres.includes('bacteriostatic') || pres.includes('syringe') ||
    pres.includes('needle') || pres.includes('diluent') || pres.includes('filter') ||
    name.includes('bac water') || name.includes('bacteriostatic')
  ) {
    return 'clinical_supplies';
  }

  if (
    pres.includes('test') || pres.includes('dna') || pres.includes('saliva') ||
    pres.includes('blood') || pres.includes('diagnostic') || name.includes('diagnostic') ||
    name.includes('test kit')
  ) {
    return 'diagnostic';
  }

  if (pres.includes('consultation') || pres.includes('service') || pres.includes('session')) {
    return 'service';
  }

  return 'finished_product';
}

async function run() {
  console.log('🚀 Starting sync of availableTypes[] across all products...');

  const productsSnap = await db.collection('products').get();
  console.log(`📦 Found ${productsSnap.size} products to process.`);

  let updatedProducts = 0;
  let updatedVariants = 0;
  let hybridCount = 0;
  const typeCounts = {
    finished_product: 0,
    raw_material: 0,
    clinical_supplies: 0,
    diagnostic: 0,
    service: 0,
  };

  const BATCH_LIMIT = 400;
  let batch = db.batch();
  let opCount = 0;

  async function commitBatchIfNeeded() {
    if (opCount >= BATCH_LIMIT) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  for (const docSnap of productsSnap.docs) {
    const product = docSnap.data();
    const productId = docSnap.id;

    // Fetch variants subcollection
    const variantsSnap = await docSnap.ref.collection('variants').get();
    const variantTypes = [];

    if (!variantsSnap.empty) {
      variantsSnap.docs.forEach(vDoc => {
        const vData = vDoc.data();
        const vType = inferVariantType(vData, product);
        variantTypes.push(vType);

        if (vData.type !== vType) {
          batch.update(vDoc.ref, {
            type: vType,
            productType: vType,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          opCount++;
          updatedVariants++;
        }
      });
    }

    // Derive availableTypes
    const uniqueTypes = Array.from(new Set(variantTypes));
    let availableTypes = uniqueTypes.length > 0 ? uniqueTypes : [product.type || 'finished_product'];
    
    // Validate values against allowed set
    availableTypes = availableTypes.map(t => {
      if (['finished_product', 'raw_material', 'clinical_supplies', 'diagnostic', 'service'].includes(t)) {
        return t;
      }
      return 'finished_product';
    });
    availableTypes = Array.from(new Set(availableTypes));

    const priorityOrder = ['finished_product', 'raw_material', 'diagnostic', 'service', 'clinical_supplies'];
    const primaryType = priorityOrder.find(t => availableTypes.includes(t)) || availableTypes[0];
    const isHybrid = availableTypes.length > 1;

    availableTypes.forEach(t => {
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });
    if (isHybrid) hybridCount++;

    // Update parent product
    batch.update(docSnap.ref, {
      availableTypes,
      primaryType,
      isHybrid,
      type: primaryType,
      productType: primaryType,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    opCount++;
    updatedProducts++;

    await commitBatchIfNeeded();
  }

  if (opCount > 0) {
    await batch.commit();
  }

  console.log('\n📊 Migration Summary:');
  console.log(`✅ Products updated with availableTypes: ${updatedProducts}`);
  console.log(`✅ Variant documents normalized: ${updatedVariants}`);
  console.log(`🌟 Hybrid products (multiple availableTypes): ${hybridCount}`);
  console.log('📈 Products offering each type:');
  for (const [t, count] of Object.entries(typeCounts)) {
    console.log(`   - ${t}: ${count}`);
  }
}

run()
  .then(() => {
    console.log('\n🎉 availableTypes sync completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
