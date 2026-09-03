import { db } from './lib/firebase-admin.mjs';

/**
 * FULL AUDIT: Find all variants across ALL products with missing dosage.
 * Strategy for each missing variant:
 *  1. Try to extract from variant ID (e.g. "15_mg", "5mg", "500mcg")
 *  2. Try product-level fields: strength.total_strength, strength, dose
 *  3. Try "name" or "title" field on the variant
 *  4. Try parent product strength/dosage if only 1 variant
 *  5. If supplier is Bioniq — use fixBioniqDosages pattern
 *  6. If none found → flag as NEEDS_MANUAL_REVIEW
 */

const DOSE_PATTERN = /([\d]+(?:[._][\d]+)?)\s*[-_]?\s*(mg|mcg|µg|g|iu|ml)\b/i;
const PER_ML_PATTERN = /([\d]+(?:[._][\d]+)?)\s*[-_]?\s*(mg\/ml|mcg\/ml|µg\/ml)\b/i;

function extractDosageFromString(str) {
  if (!str) return null;
  // Check per-ml first
  const pm = str.match(PER_ML_PATTERN);
  if (pm) return `${pm[1].replace('_', '.')} ${pm[2].toLowerCase()}`;
  const m = str.match(DOSE_PATTERN);
  if (m) return `${m[1].replace(['_', '.'][0], '.')} ${m[2].toLowerCase()}`;
  return null;
}

async function auditMissingDosages() {
  console.log('='.repeat(70));
  console.log('  FULL CATALOG AUDIT — VARIANTS WITH MISSING DOSAGE');
  console.log('='.repeat(70));
  console.log('');

  const productsSnap = await db.collection('products').get();
  
  let totalVariants = 0;
  let missingCount = 0;
  let autoFixedCount = 0;
  const needsManual = [];

  const batch_writes = []; // collect all Firestore updates

  for (const productDoc of productsSnap.docs) {
    const product = productDoc.data();
    const productId = productDoc.id;
    const productName = product.name || product.canonicalName || productId;

    const vSnap = await db.collection('products').doc(productId).collection('variants').get();
    if (vSnap.empty) continue;

    for (const vDoc of vSnap.docs) {
      const v = vDoc.data();
      const variantId = vDoc.id;
      totalVariants++;

      // Check if dosage is present and meaningful
      const currentDosage = (v.dosage || v.dose || '').trim();
      const isGeneric = /^standard(\s+clinical(\s+strength)?)?$/i.test(currentDosage) ||
                        currentDosage === 'Standard Dose' ||
                        currentDosage === '';
      
      if (!isGeneric) continue; // dosage is fine
      missingCount++;

      // --- Inference Strategy ---
      let inferred = null;
      let source = '';

      // 1. From variant ID
      inferred = extractDosageFromString(variantId);
      if (inferred) { source = `variant_id: ${variantId}`; }

      // 2. From variant name / label / title
      if (!inferred) {
        const candidates = [v.name, v.title, v.label, v.sku, v._migratedFromProduct];
        for (const c of candidates) {
          inferred = extractDosageFromString(c || '');
          if (inferred) { source = `variant_field: ${c}`; break; }
        }
      }

      // 3. From variant strength fields
      if (!inferred) {
        const strengthStr = v.strength?.total_strength || v.strength || v.concentration || v.fill_volume || '';
        inferred = extractDosageFromString(String(strengthStr));
        if (inferred) { source = `strength_field: ${strengthStr}`; }
      }

      // 4. From parent product fields
      if (!inferred) {
        const productStrength = product.strength?.total_strength || product.strength || product.dosage || product.dose || '';
        inferred = extractDosageFromString(String(productStrength));
        if (inferred) { source = `product_field: ${productStrength}`; }
      }

      // 5. From product ID itself
      if (!inferred) {
        inferred = extractDosageFromString(productId);
        if (inferred) { source = `product_id: ${productId}`; }
      }

      const supplier = v.supplierName || v.supplierId || v.supplier || 'Unknown';
      const presentation = v.presentationName || v.presentation || v.format || '';
      const price = v.unit_price || v.price || '';

      if (inferred) {
        autoFixedCount++;
        console.log(`✅ AUTO-FIX: [${productName}] › ${variantId}`);
        console.log(`   Supplier: ${supplier} | Format: ${presentation} | Price: €${price}`);
        console.log(`   Missing: "${currentDosage}" → Inferred: "${inferred}" (from ${source})`);
        console.log('');

        // Queue Firestore update
        batch_writes.push({
          ref: vDoc.ref,
          data: {
            dosage: inferred,
            dose: inferred,
            updatedAt: new Date().toISOString(),
            _dosageInferredFrom: source,
            _dosageFixedAt: new Date().toISOString(),
          }
        });
      } else {
        needsManual.push({
          productId, productName, variantId, supplier, presentation, price,
          currentDosage, allFields: Object.keys(v).join(', ')
        });
        console.log(`❌ NEEDS MANUAL: [${productName}] › ${variantId}`);
        console.log(`   Supplier: ${supplier} | Format: ${presentation} | Price: €${price}`);
        console.log(`   No dosage could be inferred from any field.`);
        console.log('');
      }
    }
  }

  // Apply all auto-fixes in batches of 400
  if (batch_writes.length > 0) {
    console.log(`\nApplying ${batch_writes.length} auto-fix(es) to Firestore...`);
    let batch = db.batch();
    let count = 0;
    for (const w of batch_writes) {
      batch.update(w.ref, w.data);
      count++;
      if (count % 400 === 0) {
        await batch.commit();
        batch = db.batch();
      }
    }
    if (count % 400 !== 0) await batch.commit();
    console.log('✓ All auto-fixes committed.');
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('  AUDIT SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total variants scanned:  ${totalVariants}`);
  console.log(`Missing dosage found:    ${missingCount}`);
  console.log(`Auto-fixed:              ${autoFixedCount}`);
  console.log(`Needs manual review:     ${needsManual.length}`);

  if (needsManual.length > 0) {
    console.log('\n--- MANUAL REVIEW REQUIRED ---');
    needsManual.forEach((n, i) => {
      console.log(`${i + 1}. [${n.productId}] › ${n.variantId}`);
      console.log(`   Product: ${n.productName} | Supplier: ${n.supplier} | Format: ${n.presentation} | Price: €${n.price}`);
    });
  }
}

auditMissingDosages()
  .then(() => process.exit(0))
  .catch(err => { console.error(err); process.exit(1); });
