import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

function normalizeName(str) {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

async function audit() {
  console.log('🔍 Starting comprehensive Firestore products & variants audit...\n');

  const productsSnap = await db.collection('products').get();
  console.log(`📦 Total products fetched: ${productsSnap.size}`);

  const productsByName = new Map();
  const productsBySlug = new Map();
  const productsWithDuplicateVariants = [];
  const allProducts = [];

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const id = doc.id;
    const name = data.canonicalName || data.name || data.displayName || id;
    const slug = data.slug || id;
    const normName = normalizeName(name);
    const variants = Array.isArray(data.variants) ? data.variants : [];

    allProducts.push({ id, name, slug, normName, data, variants });

    // Group by normalized name
    if (!productsByName.has(normName)) {
      productsByName.set(normName, []);
    }
    productsByName.get(normName).push({ id, name, slug, status: data.status, variantsCount: variants.length });

    // Group by slug
    if (slug) {
      if (!productsBySlug.has(slug)) {
        productsBySlug.set(slug, []);
      }
      productsBySlug.get(slug).push({ id, name, status: data.status, variantsCount: variants.length });
    }

    // Check for duplicate variants within the product
    if (variants.length > 1) {
      const seenVariantKeys = new Map();
      const duplicateVarIndices = [];

      variants.forEach((v, idx) => {
        // Unique signature for a variant: supplier + format + dosage + presentation
        const supp = (v.supplierId || v.supplierName || v.supplier || '').toLowerCase().trim();
        const fmt = (v.format || v.presentation || '').toLowerCase().trim();
        const dose = (v.dosage || v.dose || '').toLowerCase().trim();
        const price = v.unit_price || v.price || 0;
        const key = `${supp}:::${fmt}:::${dose}:::${price}`;

        if (seenVariantKeys.has(key)) {
          duplicateVarIndices.push({
            index: idx,
            originalIndex: seenVariantKeys.get(key),
            variant: v
          });
        } else {
          seenVariantKeys.set(key, idx);
        }
      });

      if (duplicateVarIndices.length > 0) {
        productsWithDuplicateVariants.push({
          productId: id,
          productName: name,
          totalVariants: variants.length,
          duplicateCount: duplicateVarIndices.length,
          duplicates: duplicateVarIndices
        });
      }
    }
  }

  // 1. Report duplicate products by name
  console.log('\n======================================================');
  console.log('1. POTENTIAL DUPLICATE PRODUCTS BY NORMALIZED NAME:');
  console.log('======================================================');
  let duplicateProductCount = 0;
  for (const [normName, prods] of productsByName.entries()) {
    if (prods.length > 1 && normName.length > 2) {
      duplicateProductCount++;
      console.log(`\n🔴 Normalized Name: "${normName}" (${prods.length} products found)`);
      prods.forEach(p => {
        console.log(`   - ID: ${p.id} | Name: "${p.name}" | Status: ${p.status} | Variants: ${p.variantsCount} | Slug: ${p.slug}`);
      });
    }
  }
  if (duplicateProductCount === 0) {
    console.log('✅ No duplicate products found by normalized name.');
  }

  // 2. Report duplicate products by exact slug
  console.log('\n======================================================');
  console.log('2. PRODUCTS SHARING THE EXACT SAME SLUG:');
  console.log('======================================================');
  let duplicateSlugCount = 0;
  for (const [slug, prods] of productsBySlug.entries()) {
    if (prods.length > 1) {
      duplicateSlugCount++;
      console.log(`\n🔴 Slug: "${slug}" (${prods.length} products found)`);
      prods.forEach(p => {
        console.log(`   - ID: ${p.id} | Name: "${p.name}" | Status: ${p.status} | Variants: ${p.variantsCount}`);
      });
    }
  }
  if (duplicateSlugCount === 0) {
    console.log('✅ No products sharing duplicate slugs.');
  }

  // 3. Report products with duplicate variants inside their variants array
  console.log('\n======================================================');
  console.log('3. PRODUCTS WITH DUPLICATE VARIANTS IN EMBEDDED ARRAY:');
  console.log('======================================================');
  if (productsWithDuplicateVariants.length === 0) {
    console.log('✅ No products with duplicate variants found.');
  } else {
    console.log(`Found ${productsWithDuplicateVariants.length} products with duplicate variants:`);
    productsWithDuplicateVariants.forEach(p => {
      console.log(`\n⚠️ Product: ${p.productId} ("${p.productName}")`);
      console.log(`   Total variants: ${p.totalVariants}, Duplicates found: ${p.duplicateCount}`);
      p.duplicates.forEach(d => {
        const v = d.variant;
        console.log(`   - Duplicate at [${d.index}] matches [${d.originalIndex}]: "${v.presentationName || v.presentation || v.format}" | Dose: ${v.dosage || v.dose} | Supplier: ${v.supplierName || v.supplierId} | Price: ${v.unit_price || v.price}`);
      });
    });
  }

  // 4. Check Magenta-specific products
  console.log('\n======================================================');
  console.log('4. MAGENTA SPECIFIC PRODUCTS AUDIT:');
  console.log('======================================================');
  const magentaProducts = allProducts.filter(p => {
    const isSupp = (p.data.supplierId || p.data.supplier || p.data.supplierName || '').toLowerCase().includes('magenta');
    const hasVar = p.variants.some(v => (v.supplierId || v.supplier || v.supplierName || '').toLowerCase().includes('magenta'));
    return isSupp || hasVar;
  });
  console.log(`Total products associated with Magenta: ${magentaProducts.length}`);
  magentaProducts.forEach(p => {
    const magVars = p.variants.filter(v => (v.supplierId || v.supplier || v.supplierName || '').toLowerCase().includes('magenta'));
    console.log(`- ID: ${p.id} | "${p.name}" | Total Vars: ${p.variants.length} (Magenta Vars: ${magVars.length})`);
    magVars.forEach((mv, i) => {
      console.log(`    [${i}] ${mv.presentationName || mv.presentation || mv.format} | ${mv.dosage || mv.dose} | ${mv.unit_price || mv.price} ${mv.currency || 'AED'}`);
    });
  });
}

audit().then(() => {
  console.log('\n✨ Audit finished.');
  process.exit(0);
}).catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
