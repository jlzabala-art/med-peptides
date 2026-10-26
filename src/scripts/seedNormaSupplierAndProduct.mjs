/**
 * src/scripts/seedNormaSupplierAndProduct.mjs
 * 
 * Seeds NORMA HELLAS S.A. as an authoritative pharmaceutical supplier in `suppliers` collection,
 * and Testosterone Enanthate/Norma® 250 mg/ml (1 ml ampoule) in `products` collection,
 * along with its `variants` subcollection and category entry `categories/hormone`.
 */

import { adminDb } from '../lib/firebaseAdmin.js';
import { NORMA_SUPPLIER_DOC, TESTOSTERONE_ENANTHATE_NORMA_PRODUCT } from '../data/normaHellasRegistry.js';

export const HORMONE_CATEGORY_DOC = {
  id: 'hormone',
  name: 'Hormone Therapy & TRT',
  label: 'Hormone Therapy & TRT',
  labelEs: 'Terapia Hormonal & TRT',
  slug: 'hormones',
  description: 'Prescription endocrine optimization, Testosterone Replacement Therapy (TRT), and Bioidentical Hormone Replacement Therapy (BHRT) under EU GMP standards.',
  sortOrder: 2,
  isActive: true,
  rxRequired: true,
  badgeColor: '#ea580c',
  updatedAt: new Date().toISOString()
};

export async function seedNormaSupplierAndProduct() {
  if (!adminDb) {
    console.warn('⚠️ adminDb not initialized. Cannot seed Firestore directly.');
    return;
  }

  console.log('🚀 1. Seeding category categories/hormone...');
  await adminDb.collection('categories').doc('hormone').set(HORMONE_CATEGORY_DOC, { merge: true });
  console.log('✅ Category hormone seeded.');

  console.log('🚀 2. Seeding supplier suppliers/supplier-norma-hellas...');
  await adminDb.collection('suppliers').doc(NORMA_SUPPLIER_DOC.id).set(NORMA_SUPPLIER_DOC, { merge: true });
  console.log('✅ Supplier supplier-norma-hellas seeded.');

  const { variants, ...baseProduct } = TESTOSTERONE_ENANTHATE_NORMA_PRODUCT;
  const productDocData = {
    ...baseProduct,
    variants,
    updatedAt: new Date().toISOString()
  };

  console.log(`🚀 3. Seeding product products/${TESTOSTERONE_ENANTHATE_NORMA_PRODUCT.id}...`);
  const productRef = adminDb.collection('products').doc(TESTOSTERONE_ENANTHATE_NORMA_PRODUCT.id);
  await productRef.set(productDocData, { merge: true });

  for (const v of variants) {
    console.log(`   └─ Seeding variant subcollection ${v.id}...`);
    await productRef.collection('variants').doc(v.id).set({
      ...v,
      supplierId: NORMA_SUPPLIER_DOC.id,
      supplierName: NORMA_SUPPLIER_DOC.name,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  console.log('✅ Testosterone Enanthate/Norma® 250 mg/ml & supplier seeded successfully!');
}

if (process.argv[1]?.endsWith('seedNormaSupplierAndProduct.mjs')) {
  seedNormaSupplierAndProduct()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Error seeding Norma Hellas:', err);
      process.exit(1);
    });
}
