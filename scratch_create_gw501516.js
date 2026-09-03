import { adminDb } from './src/lib/firebaseAdmin.js';

async function createGW501516() {
  const LOTUSLAND_ID = 'OLlBbQjgrj6tY7GmM2Jo';
  const batch = adminDb.batch();

  // Create base product
  const slug = 'gw501516';
  const productRef = adminDb.collection('products').doc(slug);
  
  batch.set(productRef, {
    canonicalName: 'GW501516',
    name: 'GW501516',
    id: slug,
    slug: slug,
    canonicalId: slug,
    _isCanonical: true,
    category: 'peptide',
    dosage_form: 'Bottle (Tablets/Capsules)',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  // Create variant
  const variantRef = productRef.collection('variants').doc();
  batch.set(variantRef, {
    name: 'GW501516 10 mg',
    dosage: '10 mg',
    doseMg: 10,
    totalMg: 10,
    vialStrengthMg: 10,
    format: 'bottle',
    formatId: 'bottle',
    supplierCost: 80,
    kitCost: 80,
    quantityPerKit: 1, // the JSON says 100 tabs / bottle, but the price is $80 for the kit/bottle
    retailPrice: 240, // 80 * 3
    supplierId: LOTUSLAND_ID,
    supplier: 'Lotusland Limited',
    status: 'active',
    isActive: true,
    totalStock: 50,
    inventoryStatus: 'in_stock',
    createdAt: new Date().toISOString()
  });

  await batch.commit();
  console.log('✅ Created GW501516 and its Lotusland variant!');
}

createGW501516().catch(console.error);
