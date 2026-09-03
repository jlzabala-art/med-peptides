/**
 * import_lotusland_agba_api.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Imports Acetyl Glycyl Beta-Alanine Bulk API product from Lotusland Limited into Firestore.
 * Conforms strictly to Mass/Weight API rules:
 * - quantity: 5, unit: 'g', weightGrams: 5
 * - pricePerGram: 600.00, grossPricePerGram: 800.00, discount: 25%
 * - totalBatchCost: 3000.00 USD
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

async function importLotuslandAgbaApi() {
  console.log(`\n======================================================`);
  console.log(`💼 IMPORT: Acetyl Glycyl Beta-Alanine (Bulk API) - Lotusland`);
  console.log(`======================================================\n`);

  const productId = 'acetyl-glycyl-beta-alanine';
  const variantId = 'acetyl-glycyl-beta-alanine-5g-api-lotusland';
  const now = new Date().toISOString();

  const variantData = {
    id: variantId,
    productId,
    name: 'Acetyl Glycyl Beta-Alanine 5g Bulk API Powder',
    sku: 'LOTUS-AGBA-5G-API',
    type: 'raw_material',
    productType: 'raw_material',
    format: 'bulk_api',
    presentation: '5g Bulk API Powder',
    
    // ⚖️ Mass & Weight Specifications (Strict API Rule)
    quantity: 5,
    unit: 'g',
    weightGrams: 5,
    packageWeight: '5g',
    dosage: '5g (Bulk API)',
    
    // 💰 Financial Breakdown (Price/g & Batch Total)
    pricePerGram: 600.00,
    grossPricePerGram: 800.00,
    discountPercent: 25,
    costPrice: 600.00,
    totalBatchCost: 3000.00,
    unit_price: 600.00,
    price: 600.00,
    supplierCost: 600.00,
    currency: 'USD',
    
    // 📈 Commercial Margin Tiers ($/g & Total 5g Package)
    clinicPrice: 950.00,
    wholesalePrice: 850.00,
    retailPrice: 1200.00,
    pricing: {
      master:    { pricePerGram: 600.00,  perUnit: 600.00,  packageTotal: 3000.00, currency: 'USD' },
      wholesale: { pricePerGram: 850.00,  perUnit: 850.00,  packageTotal: 4250.00, currency: 'USD' },
      clinic:    { pricePerGram: 950.00,  perUnit: 950.00,  packageTotal: 4750.00, currency: 'USD' },
      retail:    { pricePerGram: 1200.00, perUnit: 1200.00, packageTotal: 6000.00, currency: 'USD' }
    },
    
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    supplier: 'Lotusland Limited',
    stockType: 'on_demand',
    stock: 100,
    inStock: true,
    isDemand: true,
    leadTime: '5-10 business days',
    status: 'active',
    isActive: true,
    updatedAt: now,
    createdAt: now
  };

  const productData = {
    id: productId,
    name: 'Acetyl Glycyl Beta-Alanine (Bulk API)',
    title: 'Acetyl Glycyl Beta-Alanine (Bulk API)',
    slug: productId,
    type: 'raw_material',
    primaryType: 'raw_material',
    availableTypes: ['raw_material'],
    category: 'skin_anti_aging',
    therapeutic_category: 'Cosmetic & Skin Regeneration',
    categoryName: 'Skin & Cellular Regeneration',
    format: 'bulk_api',
    status: 'active',
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    warehouseOrigin: '🇨🇳 China / 🇪🇺 EU',
    storageConditions: 'Store at -20°C in airtight, moisture-proof container',
    purity: 98.5,
    casNumber: '38083-17-9',
    description: 'High-purity Acetyl Glycyl Beta-Alanine biomimetic peptide in bulk API powder form. Used for advanced compounding and cosmetic skin-brightening / melanin-modulating formulations.',
    synonyms: ['AGBA', 'Acetyl Glycyl Beta Alanine', 'Anti-Melanogenic Peptide API'],
    variants: [variantData],
    activeVariantCount: 1,
    createdAt: now,
    updatedAt: now
  };

  // 1. Write product to Firestore
  console.log(`Writing product "${productId}" to Firestore...`);
  await db.collection('products').doc(productId).set(productData, { merge: true });
  console.log(`✔ Product written successfully.`);

  // 2. Write Supplier Quotation document
  const quotationId = 'quote_lotusland_agba_5g';
  const quotationData = {
    id: quotationId,
    quotationNumber: 'QT-LOTUS-2026-0831-AGBA',
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    status: 'accepted',
    type: 'supplier_quotation',
    createdAt: now,
    currency: 'USD',
    items: [
      {
        peptideName: 'Acetyl Glycyl Beta-Alanine',
        productId,
        variantId,
        quantityGrams: 5,
        unit: 'g',
        listPricePerGramUSD: 800.00,
        discountPercent: 25,
        netPricePerGramUSD: 600.00,
        subtotalUSD: 4000.00,
        discountUSD: 1000.00,
        totalUSD: 3000.00
      }
    ],
    financialSummary: {
      subtotalUSD: 4000.00,
      discountUSD: 1000.00,
      totalUSD: 3000.00,
      discountPercentage: 25
    },
    notes: 'Quotation for 5g Bulk API Acetyl Glycyl Beta-Alanine at $600/g net (25% discount off $800/g list price).'
  };

  console.log(`Writing supplier quotation "${quotationId}"...`);
  await db.collection('supplier_quotations').doc(quotationId).set(quotationData, { merge: true });
  console.log(`✔ Supplier quotation registered successfully.`);

  // 3. Recalculate Catalog Facets
  console.log(`Updating _meta/catalog_facets...`);
  const productsSnap = await db.collection('products').get();
  const categories = {};
  const suppliers = {};
  const types = {};
  let totalProducts = 0;
  let totalVariants = 0;

  productsSnap.forEach(doc => {
    const p = doc.data();
    if (p.status === 'archived') return;
    totalProducts++;
    const cat = p.category || 'other';
    categories[cat] = (categories[cat] || 0) + 1;
    const supp = p.supplierName || p.supplierId || 'other';
    suppliers[supp] = (suppliers[supp] || 0) + 1;
    const t = p.type || p.primaryType || 'finished_product';
    types[t] = (types[t] || 0) + 1;
    if (Array.isArray(p.variants)) {
      totalVariants += p.variants.length;
    }
  });

  await db.collection('_meta').doc('catalog_facets').set({
    totalProducts,
    totalVariants,
    categories,
    suppliers,
    types,
    lastUpdated: now
  }, { merge: true });

  console.log(`✔ _meta/catalog_facets updated: ${totalProducts} products, ${totalVariants} variants.`);
  console.log(`\n🎉 IMPORT COMPLETED SUCCESSFULLY!`);
}

importLotuslandAgbaApi().catch(err => {
  console.error('❌ Import failed:', err);
  process.exit(1);
});
