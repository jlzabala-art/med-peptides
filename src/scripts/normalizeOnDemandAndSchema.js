import { adminDb } from '../lib/firebaseAdmin.js';

const SUPPLIER_NAMES = {
  'supplier-lotusland': 'Lotusland',
  'supplier-europeptides': 'Europeptides',
  'supplier-np-labs': 'NP Labs',
  'supplier-fagron': 'Fagron',
  'supplier-peptide-sciences': 'Peptide Sciences',
  'supplier-24genetics': '24Genetics',
  'supplier-biotech': 'Biotech Peptides',
  'supplier-sigma': 'Qingdao Sigma',
};

function inferVariantType(variant, parentProduct) {
  if (variant.type) {
    return variant.type === 'api_raw_material' ? 'raw_material' : variant.type;
  }
  if (variant.productType) {
    return variant.productType === 'api_raw_material' ? 'raw_material' : variant.productType;
  }

  const format = (variant.format || variant.presentation || '').toLowerCase();
  const cat = (parentProduct.category || '').toLowerCase();

  if (format.includes('powder') && !format.includes('vial') || format.includes('api') || cat.includes('api')) {
    return 'raw_material';
  }
  if (format.includes('dna') || format.includes('swab') || format.includes('blood') || cat.includes('diagnostic') || cat.includes('test')) {
    return 'diagnostic';
  }
  if (cat.includes('service') || format.includes('service')) {
    return 'service';
  }
  return parentProduct.primaryType || parentProduct.productType || 'finished_product';
}

function generateVariantSku(product, variant) {
  const pSlug = (product.id || product.slug || 'PRD').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const dose = (variant.dosage || variant.dose || variant.size || 'STD').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const format = (variant.format || variant.presentation || 'VIAL').toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 4);
  return `SKU-${pSlug}-${dose}-${format}`;
}

export async function runNormalization() {
  console.log('🚀 Starting Database Normalization: On-Demand Stock & Schema Depuration...');

  // 1. Fetch all products and cache in Map
  const productsSnap = await adminDb.collection('products').get();
  console.log(`📦 Found ${productsSnap.size} products to normalize.`);

  const productsMap = new Map();
  let updatedProducts = 0;
  const productBatch = adminDb.batch();
  let batchOpCount = 0;

  for (const docSnap of productsSnap.docs) {
    const data = docSnap.data();
    productsMap.set(docSnap.id, data);

    const updatePayload = {
      stockType: 'on_demand',
      isDemand: true,
      inStock: true,
      availability: 'on_demand',
      leadTime: '3-7 business days',
      status: data.status === 'inactive' ? 'inactive' : 'active',
      isActive: data.status === 'inactive' ? false : true,
      updatedAt: new Date().toISOString(),
    };

    productBatch.update(docSnap.ref, updatePayload);
    batchOpCount++;
    updatedProducts++;

    if (batchOpCount >= 400) {
      await productBatch.commit();
      batchOpCount = 0;
    }
  }

  if (batchOpCount > 0) {
    await productBatch.commit();
  }
  console.log(`✅ Normalized ${updatedProducts} products to Stock On-Demand.`);

  // 2. Fetch and normalize all variants instantly using productsMap
  const variantsSnap = await adminDb.collectionGroup('variants').get();
  console.log(`🧪 Found ${variantsSnap.size} variants across all products.`);

  let updatedVariants = 0;
  let varBatch = adminDb.batch();
  let varOpCount = 0;

  for (const vSnap of variantsSnap.docs) {
    const vData = vSnap.data();
    const parentId = vSnap.ref.parent.parent ? vSnap.ref.parent.parent.id : null;
    const parentData = parentId ? (productsMap.get(parentId) || {}) : {};

    const inferredType = inferVariantType(vData, parentData);
    const resolvedSupplierName = vData.supplierName || vData.supplier || SUPPLIER_NAMES[vData.supplierId] || (vData.supplierId ? vData.supplierId.replace('supplier-', '').toUpperCase() : 'Unassigned');
    const resolvedSku = vData.sku || generateVariantSku(parentData, vData);

    const variantPayload = {
      stockType: 'on_demand',
      isDemand: true,
      inStock: true,
      availability: 'on_demand',
      leadTime: '3-7 business days',
      type: inferredType,
      supplierName: resolvedSupplierName,
      sku: resolvedSku,
      status: vData.status === 'inactive' ? 'inactive' : 'active',
      updatedAt: new Date().toISOString(),
    };

    varBatch.update(vSnap.ref, variantPayload);
    varOpCount++;
    updatedVariants++;

    if (varOpCount >= 400) {
      await varBatch.commit();
      varBatch = adminDb.batch();
      varOpCount = 0;
      console.log(`... committed ${updatedVariants} variants`);
    }
  }

  if (varOpCount > 0) {
    await varBatch.commit();
  }
  console.log(`✅ Normalized ${updatedVariants} variants with clean schemas and Stock On-Demand.`);

  return { updatedProducts, updatedVariants };
}

// Direct runner
if (process.argv[1] && process.argv[1].endsWith('normalizeOnDemandAndSchema.js')) {
  runNormalization()
    .then(res => {
      console.log('🎉 Migration Completed Successfully:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('❌ Migration Error:', err);
      process.exit(1);
    });
}
