#!/usr/bin/env node
/**
 * scripts/comprehensive_catalog_audit.mjs
 * 
 * Deep audit of the Firestore products catalog and variants subcollection against the canonical schema.
 * Specifically audits Lotus Land (104 expected variants) and all other suppliers.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  VALID_STATUSES,
  VALID_TYPES,
  VALID_CATEGORIES,
  CURRENT_SCHEMA_VER
} from '../src/schemas/firestoreProductSchema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(resolve(__dirname, 'serviceAccountKey.json'), 'utf8'));
if (!getApps().length) initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function runAudit() {
  console.log('================================================================');
  console.log('🔬 REGENPEPT / MED-PEPTIDES CATALOG & SCHEMA AUDIT');
  console.log('================================================================\n');

  // 1. Fetch collections in parallel
  console.log('📥 Fetching categories, suppliers, products, and all variants...');
  const [categoriesSnap, suppliersSnap, productsSnap, allVariantsSnap] = await Promise.all([
    db.collection('categories').get(),
    db.collection('suppliers').get(),
    db.collection('products').get(),
    db.collectionGroup('variants').get()
  ]);

  const validCategoryIds = new Set([
    ...VALID_CATEGORIES,
    ...categoriesSnap.docs.map(d => d.id)
  ]);
  const existingSupplierIds = new Set(suppliersSnap.docs.map(d => d.id));

  console.log(`✓ Loaded ${categoriesSnap.size} categories in Firestore collection`);
  console.log(`✓ Loaded ${suppliersSnap.size} suppliers in Firestore collection`);
  console.log(`✓ Loaded ${productsSnap.size} products in Firestore collection`);
  console.log(`✓ Loaded ${allVariantsSnap.size} total variants across all products via collectionGroup\n`);

  // Map variants by parent productId
  const variantsByProductId = new Map();
  for (const vDoc of allVariantsSnap.docs) {
    const parentProductRef = vDoc.ref.parent.parent;
    if (!parentProductRef) continue;
    const pId = parentProductRef.id;
    if (!variantsByProductId.has(pId)) {
      variantsByProductId.set(pId, []);
    }
    variantsByProductId.get(pId).push({
      id: vDoc.id,
      ref: vDoc.ref.path,
      data: vDoc.data()
    });
  }

  // Metrics & Accumulators
  const audit = {
    totalProducts: productsSnap.size,
    totalVariants: allVariantsSnap.size,
    productsByStatus: {},
    productsByType: {},
    productsByCategoryId: {},
    schemaVersionCounts: {},
    productsWithLegacyFields: [],
    productsWithZeroVariants: [],
    productsWithSupplierMismatch: [],
    invalidProductStatus: [],
    invalidProductType: [],
    invalidProductCategory: [],
    
    // Variants stats
    variantsBySupplier: {},
    variantsMissingSupplierId: [],
    variantsInvalidSupplierId: [],
    variantsMissingPricing: [],
    variantsLegacyPricing: [],
    
    // Lotus Land specific
    lotusland: {
      totalVariants: 0,
      productsCount: 0,
      products: [],
      multiVariantProducts: [],
      singleVariantProducts: [],
      variantsList: [],
      statusBreakdown: {},
      typeBreakdown: {},
      pricingCompleteCount: 0,
      pricingIncompleteCount: 0,
      variantsByConcentration: {}
    },

    // Suppliers summary
    supplierSummary: {}
  };

  // Process products and variants
  console.log('🔍 Analyzing product normalization and contracts...');

  for (const pDoc of productsSnap.docs) {
    const pId = pDoc.id;
    const pData = pDoc.data();

    // 1. Check Product Schema Version
    const sVer = pData._schemaVersion ?? 'missing';
    audit.schemaVersionCounts[sVer] = (audit.schemaVersionCounts[sVer] || 0) + 1;

    // 2. Check Status
    const status = pData.status ?? 'missing';
    audit.productsByStatus[status] = (audit.productsByStatus[status] || 0) + 1;
    if (!VALID_STATUSES.includes(status)) {
      audit.invalidProductStatus.push({ id: pId, name: pData.name, status });
    }

    // 3. Check Type
    const type = pData.type ?? 'missing';
    audit.productsByType[type] = (audit.productsByType[type] || 0) + 1;
    if (!VALID_TYPES.includes(type)) {
      audit.invalidProductType.push({ id: pId, name: pData.name, type });
    }

    // 4. Check CategoryId
    const catId = pData.categoryId ?? 'missing';
    audit.productsByCategoryId[catId] = (audit.productsByCategoryId[catId] || 0) + 1;
    if (!validCategoryIds.has(catId)) {
      audit.invalidProductCategory.push({ id: pId, name: pData.name, categoryId: catId, legacyCategory: pData.category });
    }

    // 5. Check Legacy Root Fields
    const legacyFieldsFound = [];
    if (pData.price !== undefined) legacyFieldsFound.push('price (root)');
    if (pData.supplier !== undefined) legacyFieldsFound.push('supplier (root)');
    if (pData.supplierId !== undefined) legacyFieldsFound.push('supplierId (root scalar)');
    if (Array.isArray(pData.variants) && pData.variants.length > 0) legacyFieldsFound.push(`variants array (${pData.variants.length} items)`);
    if (legacyFieldsFound.length > 0) {
      audit.productsWithLegacyFields.push({ id: pId, name: pData.name, fields: legacyFieldsFound });
    }

    // 6. Inspect Variants
    const productVariants = variantsByProductId.get(pId) || [];
    const actualVariantsCount = productVariants.length;

    if (actualVariantsCount === 0) {
      audit.productsWithZeroVariants.push({ id: pId, name: pData.name, status, categoryId: catId });
    }

    const foundSupplierIdsInVariants = new Set();
    const productLotusVariants = [];

    for (const vItem of productVariants) {
      const vId = vItem.id;
      const vData = vItem.data;
      const sId = vData.supplierId;

      if (!sId) {
        audit.variantsMissingSupplierId.push({ productId: pId, variantId: vId, data: vData });
      } else {
        foundSupplierIdsInVariants.add(sId);
        audit.variantsBySupplier[sId] = (audit.variantsBySupplier[sId] || 0) + 1;

        if (!existingSupplierIds.has(sId)) {
          audit.variantsInvalidSupplierId.push({ productId: pId, variantId: vId, supplierId: sId });
        }
      }

      // Check pricing structure
      const pricing = vData.pricing;
      if (!pricing || typeof pricing !== 'object') {
        audit.variantsMissingPricing.push({ productId: pId, variantId: vId });
      } else {
        if (vData.price !== undefined || vData.costPrice !== undefined) {
          audit.variantsLegacyPricing.push({ productId: pId, variantId: vId });
        }
      }

      // Lotus Land Check
      const isLotus = sId === 'supplier-lotusland' || (sId && sId.toLowerCase().includes('lotus')) || (vData.supplier && vData.supplier.toLowerCase().includes('lotus'));
      if (isLotus) {
        audit.lotusland.totalVariants++;
        const hasFullPricing = pricing && pricing.master && (pricing.master.perUnit !== undefined || pricing.master.cost !== undefined);
        if (hasFullPricing) audit.lotusland.pricingCompleteCount++;
        else audit.lotusland.pricingIncompleteCount++;

        const concKey = `${vData.presentation || 'vial'} - ${vData.concentration || vData.dosage || 'default'}`;
        audit.lotusland.variantsByConcentration[concKey] = (audit.lotusland.variantsByConcentration[concKey] || 0) + 1;

        const vInfo = {
          variantId: vId,
          sku: vData.sku || '',
          presentation: vData.presentation || '',
          concentration: vData.concentration || '',
          route: vData.route || '',
          dosage: vData.dosage || '',
          unit: vData.unit || '',
          pricing: vData.pricing || null,
          stock: vData.stock || null
        };
        productLotusVariants.push(vInfo);
        audit.lotusland.variantsList.push({
          productId: pId,
          productName: pData.name,
          ...vInfo
        });
      }
    }

    // Compare product.supplierIds with found supplier IDs in variants
    const productSupplierIds = Array.isArray(pData.supplierIds) ? pData.supplierIds : [];
    const expectedSet = new Set(productSupplierIds);
    const hasMismatch = ![...foundSupplierIdsInVariants].every(id => expectedSet.has(id)) || ![...expectedSet].every(id => foundSupplierIdsInVariants.has(id));
    if (hasMismatch && (foundSupplierIdsInVariants.size > 0 || productSupplierIds.length > 0)) {
      audit.productsWithSupplierMismatch.push({
        id: pId,
        name: pData.name,
        onProductDoc: productSupplierIds,
        inVariants: Array.from(foundSupplierIdsInVariants)
      });
    }

    // If product has Lotus Land variants
    if (productLotusVariants.length > 0) {
      audit.lotusland.productsCount++;
      audit.lotusland.statusBreakdown[status] = (audit.lotusland.statusBreakdown[status] || 0) + 1;
      audit.lotusland.typeBreakdown[type] = (audit.lotusland.typeBreakdown[type] || 0) + 1;

      const pLotusEntry = {
        productId: pId,
        productName: pData.name,
        status,
        type,
        categoryId: catId,
        totalVariantsInProduct: actualVariantsCount,
        lotusVariantCount: productLotusVariants.length,
        variants: productLotusVariants
      };
      audit.lotusland.products.push(pLotusEntry);

      if (productLotusVariants.length > 1) {
        audit.lotusland.multiVariantProducts.push(pLotusEntry);
      } else {
        audit.lotusland.singleVariantProducts.push(pLotusEntry);
      }
    }
  }

  // 7. Consolidate supplier summary
  for (const sDoc of suppliersSnap.docs) {
    const sId = sDoc.id;
    const sData = sDoc.data();
    const vCount = audit.variantsBySupplier[sId] || 0;
    audit.supplierSummary[sId] = {
      name: sData.name,
      status: sData.status || 'unknown',
      categoryId: sData.categoryId || 'unknown',
      currency: sData.currency || 'USD',
      variantCount: vCount
    };
  }

  // Sort products
  audit.lotusland.products.sort((a, b) => a.productName.localeCompare(b.productName));

  // Output report
  console.log('────────────────────────────────────────────────────────────────');
  console.log('📊 1. AUDIT RESULTS SUMMARY — CATALOG NORMALIZATION');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`Total Products in Catalog:  ${audit.totalProducts}`);
  console.log(`Total Variants in Catalog:  ${audit.totalVariants}`);
  
  console.log(`\n• Schema Version Breakdown (_schemaVersion = 2 is standard):`);
  for (const [ver, count] of Object.entries(audit.schemaVersionCounts)) {
    console.log(`   _schemaVersion ${ver}: ${count} products (${Math.round(count/audit.totalProducts*100)}%)`);
  }

  console.log(`\n• Product Status Breakdown (Rule #28):`);
  for (const [st, count] of Object.entries(audit.productsByStatus)) {
    const valid = VALID_STATUSES.includes(st) ? '✅' : '❌ INVALID';
    console.log(`   ${st}: ${count} products ${valid}`);
  }

  console.log(`\n• Product Type Breakdown (finished_product, raw_material, etc.):`);
  for (const [tp, count] of Object.entries(audit.productsByType)) {
    const valid = VALID_TYPES.includes(tp) ? '✅' : '❌ INVALID';
    console.log(`   ${tp}: ${count} products ${valid}`);
  }

  console.log(`\n• Product Category Breakdown:`);
  for (const [cat, count] of Object.entries(audit.productsByCategoryId)) {
    const valid = validCategoryIds.has(cat) ? '✅' : '❌ INVALID';
    console.log(`   ${cat}: ${count} products ${valid}`);
  }

  console.log('────────────────────────────────────────────────────────────────');
  console.log('🪷 2. SPECIFIC AUDIT: LOTUS LAND VARIANTS');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`Total Lotus Land Variants in Firestore: ${audit.lotusland.totalVariants}`);
  console.log(`Target Expected:                       104`);
  const isMatch = audit.lotusland.totalVariants === 104;
  console.log(`Status:                                ${isMatch ? '✅ EXACT MATCH (104/104)' : `⚠️ DISCREPANCY: ${audit.lotusland.totalVariants - 104}`}`);
  console.log(`Products Containing Lotusland:         ${audit.lotusland.productsCount} products`);
  console.log(`  - Single-Variant Products:           ${audit.lotusland.singleVariantProducts.length}`);
  console.log(`  - Multi-Variant Products:            ${audit.lotusland.multiVariantProducts.length}`);
  console.log(`Pricing Completeness:                  ${audit.lotusland.pricingCompleteCount} / ${audit.lotusland.totalVariants} variants`);

  console.log(`\n• Lotus Land Status Distribution:`);
  for (const [st, cnt] of Object.entries(audit.lotusland.statusBreakdown)) {
    console.log(`   ${st}: ${cnt} products`);
  }

  console.log(`\n• Lotus Land Type Distribution:`);
  for (const [tp, cnt] of Object.entries(audit.lotusland.typeBreakdown)) {
    console.log(`   ${tp}: ${cnt} products`);
  }

  if (audit.lotusland.multiVariantProducts.length > 0) {
    console.log('\n• Multi-variant Products with Lotus Land:');
    for (const p of audit.lotusland.multiVariantProducts) {
      console.log(`    - [${p.productId}] "${p.productName}" → ${p.lotusVariantCount} Lotus variants (total ${p.totalVariantsInProduct})`);
      for (const v of p.variants) {
        console.log(`        • ${v.variantId} | SKU: ${v.sku || 'N/A'} | ${v.presentation} | ${v.concentration}`);
      }
    }
  }

  console.log('────────────────────────────────────────────────────────────────');
  console.log('🏭 3. ALL SUPPLIERS VARIANT COVERAGE');
  console.log('────────────────────────────────────────────────────────────────');
  const sortedSuppliers = Object.entries(audit.supplierSummary).sort((a, b) => b[1].variantCount - a[1].variantCount);
  for (const [sId, info] of sortedSuppliers) {
    const sName = String(info.name || sId);
    console.log(`   - ${sId.padEnd(28, ' ')} "${sName.padEnd(24, ' ')}": ${String(info.variantCount).padStart(4, ' ')} variants [${info.currency}, ${info.status}]`);
  }

  // Check unaccounted supplierIds
  for (const [sId, count] of Object.entries(audit.variantsBySupplier)) {
    if (!audit.supplierSummary[sId]) {
      console.log(`   ⚠️ UNREGISTERED SUPPLIER IN VARIANTS: ${sId} (${count} variants)`);
    }
  }

  console.log('────────────────────────────────────────────────────────────────');
  console.log('⚠️ 4. ANOMALIES & DATA QUALITY CHECKS');
  console.log('────────────────────────────────────────────────────────────────');
  console.log(`• Products with 0 variants:              ${audit.productsWithZeroVariants.length}`);
  if (audit.productsWithZeroVariants.length > 0) {
    audit.productsWithZeroVariants.slice(0, 10).forEach(p => console.log(`    - ${p.id} ("${p.name}") [status: ${p.status}, cat: ${p.categoryId}]`));
    if (audit.productsWithZeroVariants.length > 10) console.log(`    ... and ${audit.productsWithZeroVariants.length - 10} more`);
  }

  console.log(`• Products with legacy root fields:      ${audit.productsWithLegacyFields.length}`);
  if (audit.productsWithLegacyFields.length > 0) {
    audit.productsWithLegacyFields.slice(0, 10).forEach(p => console.log(`    - ${p.id} ("${p.name}") → ${p.fields.join(', ')}`));
    if (audit.productsWithLegacyFields.length > 10) console.log(`    ... and ${audit.productsWithLegacyFields.length - 10} more`);
  }

  console.log(`• Products with supplierIds mismatch:    ${audit.productsWithSupplierMismatch.length}`);
  if (audit.productsWithSupplierMismatch.length > 0) {
    audit.productsWithSupplierMismatch.slice(0, 5).forEach(p => console.log(`    - ${p.id} ("${p.name}") → Doc has [${p.onProductDoc.join(',')}], Variants have [${p.inVariants.join(',')}]`));
    if (audit.productsWithSupplierMismatch.length > 5) console.log(`    ... and ${audit.productsWithSupplierMismatch.length - 5} more`);
  }

  console.log(`• Variants missing supplierId:           ${audit.variantsMissingSupplierId.length}`);
  console.log(`• Variants with invalid supplierId:      ${audit.variantsInvalidSupplierId.length}`);
  console.log(`• Variants missing pricing object:       ${audit.variantsMissingPricing.length}`);
  console.log(`• Variants with legacy root pricing:     ${audit.variantsLegacyPricing.length}`);

  // Write full audit JSON for deep review
  const outputPath = resolve(__dirname, 'catalog_audit_results.json');
  writeFileSync(outputPath, JSON.stringify(audit, null, 2), 'utf8');
  console.log(`\n💾 Detailed JSON report written to: ${outputPath}\n`);

  return audit;
}

runAudit().catch(err => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});
