import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve('src/scripts/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  const jsonPath = path.resolve('AI Prompts/atlas_aesthetic_injectables_lorenzo_pharmamedic.json');
  const catalogData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  console.log(`Loaded ${catalogData.products.length} products from ${catalogData.catalog_name}`);

  // 1. Ensure supplier document
  const supplierId = 'supplier-pharmamedic';
  const supplierDoc = {
    id: supplierId,
    name: catalogData.supplier.name,
    companyName: catalogData.supplier.name,
    country: catalogData.supplier.country,
    city: 'Madrid',
    address: catalogData.supplier.address,
    contact: catalogData.supplier.contact.name,
    email: catalogData.supplier.contact.email,
    phone: catalogData.supplier.contact.phone,
    bigin_account_id: catalogData.supplier.bigin_account_id,
    bigin_contact_id: catalogData.supplier.contact.bigin_contact_id,
    type: 'distributor',
    specialties: ['Aesthetic Injectables', 'Dermal Fillers', 'Skin Boosters', 'Biostimulators', 'Polynucleotides'],
    status: 'active',
    updatedAt: new Date().toISOString()
  };

  await db.collection('suppliers').doc(supplierId).set(supplierDoc, { merge: true });
  console.log(`✓ Supplier ${supplierId} (${catalogData.supplier.name}) verified in Firestore.`);

  // 2. Insert or update products
  let count = 0;
  for (const p of catalogData.products) {
    const docId = p.id;
    const displayName = `${p.brand} - ${p.product_name}`;
    const searchTokens = Array.from(new Set([
      ...p.brand.toLowerCase().split(/\s+/),
      ...p.product_name.toLowerCase().split(/\s+/),
      ...(p.atlas?.search_tags || []).map(t => t.toLowerCase()),
      p.category.toLowerCase(),
      p.subcategory.toLowerCase(),
      'aesthetic',
      'injectable'
    ])).filter(Boolean);

    const productDoc = {
      id: docId,
      canonicalId: docId,
      canonicalKey: docId,
      canonicalName: displayName,
      name: displayName,
      displayName: displayName,
      brand: p.brand,
      product_name: p.product_name,
      source_product_name: p.source_product_name,
      atlas_product_code: p.atlas_product_code,
      category: 'Aesthetic Injectables',
      category_taxonomy: 'Aesthetic Injectables',
      subcategory: p.subcategory,
      productType: 'aesthetic_injectable',
      primaryType: 'aesthetic_injectable',
      format: p.classification?.is_dermal_filler ? 'prefilled_syringe' : 'vial',
      supplier: catalogData.supplier.name,
      supplierName: catalogData.supplier.name,
      supplierId: supplierId,
      supplierIds: [supplierId],
      vendor: catalogData.supplier.name,
      price: p.commercial.source_price,
      unit_price: p.commercial.source_price,
      costPrice: p.commercial.source_price,
      currency: 'AED',
      origCurrency: 'AED',
      currencyCode: 'AED',
      status: 'published',
      isActive: true,
      visibility: 'B2B',
      professionalUseOnly: true,
      classification: p.classification || {},
      clinical: p.clinical || {},
      regulatory: p.regulatory || {},
      packaging: p.packaging || {},
      commercial: p.commercial || {},
      description: `${p.brand} ${p.product_name} (${p.subcategory}) — ${p.clinical?.treatment_positioning?.join(', ') || 'Professional aesthetic injectable formulation.'}`,
      searchTokens: searchTokens,
      variants: [
        {
          id: `${docId}-std`,
          docId: `${docId}-std`,
          variantId: `${docId}-std`,
          name: p.product_name,
          label: p.product_name,
          price: p.commercial.source_price,
          unit_price: p.commercial.source_price,
          costPrice: p.commercial.source_price,
          currency: 'AED',
          origCurrency: 'AED',
          supplier: catalogData.supplier.name,
          supplierName: catalogData.supplier.name,
          supplierId: supplierId,
          format: p.classification?.is_dermal_filler ? 'prefilled_syringe' : 'vial',
          inStock: true,
          isActive: true,
          isDefault: true,
          status: 'active',
          pricing: {
            master: {
              perUnit: p.commercial.source_price,
              currency: 'AED'
            },
            wholesale: {
              perUnit: p.commercial.source_price,
              currency: 'AED'
            }
          },
          updatedAt: new Date().toISOString()
        }
      ],
      updatedAt: new Date().toISOString()
    };

    await db.collection('products').doc(docId).set(productDoc, { merge: true });
    count++;
    console.log(`[${count}/40] Seeded product: ${docId} (${displayName}) — ${p.commercial.source_price} AED`);
  }

  console.log(`\n🎉 Successfully ingested all ${count} Aesthetic Injectables products into Firestore!`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error seeding aesthetic injectables:', err);
  process.exit(1);
});
