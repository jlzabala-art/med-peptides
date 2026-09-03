#!/usr/bin/env node
/**
 * Final Normalization Audit
 * Checks the current state of products, suppliers, and categories collections
 * to identify any remaining issues.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// --- Init Firebase Admin ---
const raw = readFileSync(new URL('./serviceAccountKey.json', import.meta.url), 'utf8');
const sa = JSON.parse(raw);
initializeApp({ credential: cert(sa) });
const db = getFirestore();

async function run() {
  console.log('=== FINAL NORMALIZATION AUDIT ===\n');

  // ─── 1. Categories Collection ───
  console.log('── 1. Categories Collection ──');
  const catSnap = await db.collection('categories').get();
  const categories = {};
  catSnap.forEach(doc => {
    categories[doc.id] = doc.data();
  });
  console.log(`Total categories: ${Object.keys(categories).length}`);
  for (const [id, data] of Object.entries(categories)) {
    console.log(`  - ${id}: "${data.name || data.label || '(no name)'}" | icon: ${data.icon || '—'} | order: ${data.order ?? '—'}`);
  }

  // ─── 2. Suppliers Collection ───
  console.log('\n── 2. Suppliers Collection ──');
  const suppSnap = await db.collection('suppliers').get();
  const suppliers = {};
  suppSnap.forEach(doc => {
    suppliers[doc.id] = doc.data();
  });
  console.log(`Total suppliers: ${Object.keys(suppliers).length}`);
  for (const [id, data] of Object.entries(suppliers)) {
    console.log(`  - ${id}: "${data.name}" | categoryId: ${data.categoryId || '—'} | status: ${data.status || '—'}`);
  }

  // ─── 3. Products Collection — Full scan ───
  console.log('\n── 3. Products Collection — Scanning... ──');
  const prodSnap = await db.collection('products').get();
  const totalProducts = prodSnap.size;

  // Counters
  let missingCategoryId = 0;
  let hasBothCategoryAndCategoryId = 0;
  let hasLegacyCategoryOnly = 0;
  let missingSupplierIds = 0;
  let emptySupplierIds = 0;
  let invalidCategoryId = 0;
  let productsWithZeroVariants = 0;
  let totalVariants = 0;
  let variantsMissingSupplierId = 0;

  const categoryIdDistribution = {};
  const legacyCategoryValues = {};
  const orphanProducts = [];   // no supplierIds
  const badCategoryProducts = []; // categoryId not in categories collection

  for (const doc of prodSnap.docs) {
    const data = doc.data();
    const id = doc.id;

    // Category checks
    const hasCategoryId = !!data.categoryId;
    const hasLegacyCategory = !!data.category;

    if (!hasCategoryId) {
      missingCategoryId++;
      if (hasLegacyCategory) {
        hasLegacyCategoryOnly++;
        legacyCategoryValues[data.category] = (legacyCategoryValues[data.category] || 0) + 1;
      }
    }

    if (hasCategoryId && hasLegacyCategory) {
      hasBothCategoryAndCategoryId++;
    }

    if (hasCategoryId) {
      categoryIdDistribution[data.categoryId] = (categoryIdDistribution[data.categoryId] || 0) + 1;
      if (!categories[data.categoryId]) {
        invalidCategoryId++;
        badCategoryProducts.push({ id, categoryId: data.categoryId });
      }
    }

    // Supplier checks (product level)
    const sIds = data.supplierIds;
    if (!sIds) {
      missingSupplierIds++;
      orphanProducts.push(id);
    } else if (Array.isArray(sIds) && sIds.length === 0) {
      emptySupplierIds++;
      orphanProducts.push(id);
    }

    // Variants check
    const varSnap = await db.collection('products').doc(id).collection('variants').get();
    if (varSnap.empty) {
      productsWithZeroVariants++;
    }
    totalVariants += varSnap.size;

    for (const vDoc of varSnap.docs) {
      const vData = vDoc.data();
      if (!vData.supplierId) {
        variantsMissingSupplierId++;
      }
    }
  }

  // ─── Report ───
  console.log(`\nTotal products: ${totalProducts}`);
  console.log(`Total variants: ${totalVariants}`);
  console.log(`Products with 0 variants: ${productsWithZeroVariants}`);

  console.log('\n── Category Health ──');
  console.log(`Products WITH categoryId: ${totalProducts - missingCategoryId}`);
  console.log(`Products MISSING categoryId: ${missingCategoryId}`);
  console.log(`Products with BOTH category + categoryId (legacy not cleaned): ${hasBothCategoryAndCategoryId}`);
  console.log(`Products with ONLY legacy category (no categoryId): ${hasLegacyCategoryOnly}`);
  console.log(`Products with categoryId NOT in categories collection: ${invalidCategoryId}`);

  if (Object.keys(legacyCategoryValues).length > 0) {
    console.log('\nLegacy category values (no categoryId):');
    for (const [v, count] of Object.entries(legacyCategoryValues)) {
      console.log(`  "${v}": ${count}`);
    }
  }

  if (badCategoryProducts.length > 0) {
    console.log('\nProducts with INVALID categoryId:');
    badCategoryProducts.forEach(p => console.log(`  ${p.id} → "${p.categoryId}"`));
  }

  console.log('\n── Category Distribution (categoryId) ──');
  const sorted = Object.entries(categoryIdDistribution).sort((a, b) => b[1] - a[1]);
  for (const [cat, count] of sorted) {
    const valid = categories[cat] ? '✅' : '❌ NOT IN COLLECTION';
    console.log(`  ${cat}: ${count} products ${valid}`);
  }

  console.log('\n── Supplier Health ──');
  console.log(`Products without supplierIds field: ${missingSupplierIds}`);
  console.log(`Products with empty supplierIds[]: ${emptySupplierIds}`);
  console.log(`Variants missing supplierId: ${variantsMissingSupplierId}`);

  if (orphanProducts.length > 0 && orphanProducts.length <= 20) {
    console.log('\nOrphan products (no suppliers):');
    orphanProducts.forEach(id => console.log(`  - ${id}`));
  }

  // ─── 4. Cross-reference: Suppliers → categoryId validity ───
  console.log('\n── Supplier → Category Cross-Reference ──');
  for (const [id, data] of Object.entries(suppliers)) {
    const catId = data.categoryId;
    if (catId && !categories[catId]) {
      console.log(`  ⚠️  Supplier "${id}" has categoryId "${catId}" which is NOT in categories collection`);
    }
  }

  // ─── Summary ───
  console.log('\n══════════════════════════════════');
  console.log('SUMMARY');
  console.log('══════════════════════════════════');
  const issues = [];
  if (missingCategoryId > 0) issues.push(`${missingCategoryId} products missing categoryId`);
  if (hasBothCategoryAndCategoryId > 0) issues.push(`${hasBothCategoryAndCategoryId} products still have legacy 'category' field`);
  if (invalidCategoryId > 0) issues.push(`${invalidCategoryId} products have categoryId not in categories collection`);
  if (missingSupplierIds + emptySupplierIds > 0) issues.push(`${missingSupplierIds + emptySupplierIds} products without suppliers`);
  if (variantsMissingSupplierId > 0) issues.push(`${variantsMissingSupplierId} variants missing supplierId`);
  if (productsWithZeroVariants > 0) issues.push(`${productsWithZeroVariants} products with 0 variants`);

  if (issues.length === 0) {
    console.log('✅ ALL CHECKS PASSED — No normalization issues found!');
  } else {
    console.log(`⚠️  ${issues.length} ISSUES FOUND:`);
    issues.forEach(i => console.log(`  ❌ ${i}`));
  }

  console.log('\n── Pending Tasks ──');
  if (hasBothCategoryAndCategoryId > 0) {
    console.log(`  🔧 Phase 3: Remove legacy 'category' field from ${hasBothCategoryAndCategoryId} products`);
  }
  console.log('  🔧 Phase 2: Frontend migration (category strings → categoryId lookups) — code changes');
}

run().catch(console.error);
