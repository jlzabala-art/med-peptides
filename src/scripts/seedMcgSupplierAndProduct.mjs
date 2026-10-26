/**
 * src/scripts/seedMcgSupplierAndProduct.mjs
 * 
 * Seeds MCG Cosmetics as an authoritative supplier in `suppliers` collection,
 * and the MCG Kapigen 5% Procapil Anti-Hair Loss Spray (2-Pack) in `products` collection.
 */

import { adminDb } from '../lib/firebaseAdmin.js';
import { getMcgProductBySlug } from '../data/mcgInciRegistry.js';

export const MCG_SUPPLIER_DOC = {
  id: 'supplier-mcg',
  companyName: 'MCG Cosmetics',
  name: 'MCG Cosmetics',
  displayName: 'MCG Cosmetics',
  legalName: 'McG Medical Cosmeceutical Group',
  brand: 'MCG Cosmetics',
  website: 'https://mcgcosmetics.com',
  country: 'Turkey',
  originCountry: 'Turkey',
  fulfillmentRegion: 'United States & Global',
  currency: 'USD',
  statusB2B: 'active',
  status: 'active',
  categoryIds: ['cosmetics', 'trichology_hair_care'],
  categories: ['cosmetics', 'trichology_hair_care'],
  leadTimeDays: 3,
  badge: 'ISO 22716 & Procapil® Certified',
  description: 'Specialized medical cosmeceuticals and trichology treatments featuring patented 5% Procapil® peptide complexes, botanical DHT inhibitors, and hair follicle revitalizers.',
  contactEmail: 'contact@mcgcosmetics.com',
  rating: 4.96,
  productsSupplied: 1,
  variantsSupplied: 2,
  isCertified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export async function seedMcgSupplierAndProduct() {
  if (!adminDb) {
    console.warn('⚠️ adminDb not initialized. Cannot seed.');
    return;
  }

  console.log('🚀 Seeding supplier-mcg...');
  await adminDb.collection('suppliers').doc('supplier-mcg').set(MCG_SUPPLIER_DOC, { merge: true });
  console.log('✅ Supplier supplier-mcg seeded successfully.');

  const productData = getMcgProductBySlug('mcg-kapigen-5-procapil-anti-hair-loss-spray-2-pack');
  if (!productData) {
    throw new Error('Could not resolve MCG product data');
  }

  const { variants, ...baseProduct } = productData;
  const productDocData = {
    ...baseProduct,
    variants,
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  console.log(`🚀 Seeding product ${productData.id}...`);
  const productRef = adminDb.collection('products').doc(productData.id);
  await productRef.set(productDocData, { merge: true });

  // Also seed variants subcollection for subcollection readers
  for (const v of variants) {
    console.log(`   └─ Seeding variant subcollection ${v.id}...`);
    await productRef.collection('variants').doc(v.id).set({
      ...v,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }

  console.log('✅ MCG Kapigen product & variants seeded successfully!');
}

// Allow direct CLI execution if credentials exist
if (process.argv[1]?.endsWith('seedMcgSupplierAndProduct.mjs')) {
  seedMcgSupplierAndProduct()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
