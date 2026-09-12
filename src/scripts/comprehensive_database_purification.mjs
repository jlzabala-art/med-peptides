import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// Canonical mappings: duplicateId -> canonicalId
const DUPLICATE_PRODUCT_MERGE_MAP = {
  // GLOW duplicates
  'glow-triple-peptide': 'glow',
  'glow-bpc-157-tb-500-ghk': 'glow',
  'glow-ghk-cu-bpc-157-tb-500': 'glow',

  // TB-500 duplicates
  'tb-500-thymosin-4': 'tb-500',
  'tb-500-thymosin-b4-acetate-5mg': 'tb-500',
  'thymosin-4-tb-500': 'tb-500',
  'thymosin-beta-4': 'tb-500',
  'thymosin-beta-tb-500': 'tb-500',

  // BAC Water duplicates
  'bacteriostatic-water': 'bac-water',
  'bacteriostatic-water-09-benzyl-alcohol-10ml': 'bac-water',

  // CJC-1295 No DAC duplicates
  'cjc-1295-without-dac': 'cjc-1295-no-dac',
  'cjc-1295-without-dac-2mg': 'cjc-1295-no-dac',

  // CJC-1295 + Ipamorelin blend duplicates
  'cjc-1295-ipamorelin-blend': 'cjc-1295-ipamorelin',
  'cjc-1295-without-dac-ipamorelin': 'cjc-1295-ipamorelin',
  'cjc-1295-without-dac-5mg-ipa-5mg': 'cjc-1295-ipamorelin',

  // BPC-157 + TB-500 blend duplicates
  'bpc-157-tb-500-blend': 'bpc-157-tb-500',
  'bpc-10mg-tb-10mg': 'bpc-157-tb-500',
  'bpc-5-mgtb-5-mg': 'bpc-157-tb-500',

  // Epithalon duplicates
  'epitalon': 'epithalon',

  // GHK-Cu duplicates
  'ghk-cu-copper-peptide': 'ghk-cu',
  'ghk-cu-human-copper': 'ghk-cu',

  // PT-141 duplicates
  'pt-141-bremelanotide-10mg': 'pt-141',
  'pt': 'pt-141',

  // SS-31 duplicates
  'ss31': 'ss-31',

  // LL-37 duplicates
  'll37-5mg': 'll-37',

  // MT2 duplicates
  'mt2': 'mt2-melanotan-ii',

  // Follistatin duplicates
  'fst344': 'fst-344-follistatin',

  // Prostaquinon duplicates
  'prostaquinon': 'prostaquinon-tm',

  // Pycnogenol duplicates
  'pycnogenol': 'pycnogenol-pinus-pinaster',

  // Bloodo NAD duplicates
  'nad-level-test': 'bloodo-nad-level-test',

  // Ginseng
  'ginseng-extract': 'ginseng',

  // Thymosin Alpha / Beta
  'thymosin': 'thymosin-alpha'
};

function getVariantSignature(v) {
  const supp = (v.supplierId || v.supplierName || v.supplier || '').toLowerCase().trim();
  const fmt = (v.format || v.presentation || '').toLowerCase().trim();
  const dose = (v.dosage || v.dose || '').toLowerCase().trim();
  const price = Number(v.unit_price || v.price || 0).toFixed(2);
  return `${supp}:::${fmt}:::${dose}:::${price}`;
}

function deduplicateVariantList(variants) {
  const seen = new Map();
  const unique = [];

  for (const v of variants) {
    const sig = getVariantSignature(v);
    if (!seen.has(sig)) {
      seen.set(sig, v);
      unique.push(v);
    } else {
      // If the duplicate has richer data (e.g. presentationName, sku, etc.), merge it
      const existing = seen.get(sig);
      if (!existing.presentationName && v.presentationName) existing.presentationName = v.presentationName;
      if (!existing.sku && v.sku) existing.sku = v.sku;
      if (!existing.coaPdfUrl && v.coaPdfUrl) existing.coaPdfUrl = v.coaPdfUrl;
    }
  }

  return unique;
}

async function runComprehensivePurification() {
  console.log('🚀 STEP 1: Deduplicating internal variants inside ALL products...');

  const productsSnap = await db.collection('products').get();
  console.log(`Fetched ${productsSnap.size} products from Firestore.`);

  let totalInternalDuplicatesRemoved = 0;
  let productsDeduplicated = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const rawVariants = Array.isArray(data.variants) ? data.variants : [];
    if (rawVariants.length < 2) continue;

    const uniqueVariants = deduplicateVariantList(rawVariants);
    const diff = rawVariants.length - uniqueVariants.length;

    if (diff > 0) {
      productsDeduplicated++;
      totalInternalDuplicatesRemoved += diff;
      console.log(`🧹 Product "${doc.id}" (${data.name || data.canonicalName}): removed ${diff} duplicate variants (${rawVariants.length} -> ${uniqueVariants.length})`);

      // Update embedded array
      await doc.ref.update({
        variants: uniqueVariants,
        updatedAt: new Date().toISOString()
      });

      // Synchronize subcollection variants
      const subVarsSnap = await doc.ref.collection('variants').get();
      const seenSubSignatures = new Set();

      for (const subDoc of subVarsSnap.docs) {
        const subData = subDoc.data();
        const sig = getVariantSignature(subData);

        if (seenSubSignatures.has(sig)) {
          // Delete duplicate subcollection document
          await subDoc.ref.delete();
          console.log(`   Deleted duplicate subcollection variant: ${subDoc.id}`);
        } else {
          seenSubSignatures.add(sig);
        }
      }
    }
  }

  console.log(`\n✅ STEP 1 Complete: Deduplicated ${productsDeduplicated} products, removing ${totalInternalDuplicatesRemoved} duplicate variants.\n`);

  console.log('🚀 STEP 2: Merging duplicate product documents into canonical records...');

  let mergedProductCount = 0;

  for (const [duplicateId, canonicalId] of Object.entries(DUPLICATE_PRODUCT_MERGE_MAP)) {
    const dupRef = db.collection('products').doc(duplicateId);
    const canRef = db.collection('products').doc(canonicalId);

    const [dupDoc, canDoc] = await Promise.all([dupRef.get(), canRef.get()]);

    if (!dupDoc.exists) {
      console.log(`ℹ️ Duplicate product "${duplicateId}" already absent.`);
      continue;
    }

    if (!canDoc.exists) {
      console.warn(`⚠️ Canonical product "${canonicalId}" does not exist! Renaming "${duplicateId}" to canonical...`);
      const dupData = dupDoc.data();
      await canRef.set({ ...dupData, id: canonicalId });
      await dupRef.delete();
      continue;
    }

    console.log(`🔗 Merging duplicate "${duplicateId}" into canonical "${canonicalId}"...`);
    const dupData = dupDoc.data();
    const canData = canDoc.data();

    const canVariants = Array.isArray(canData.variants) ? canData.variants : [];
    const dupVariants = Array.isArray(dupData.variants) ? dupData.variants : [];

    // Combine and deduplicate variants
    const combinedVariants = deduplicateVariantList([...canVariants, ...dupVariants]);

    // Update canonical document with combined variants and preserve best metadata
    await canRef.update({
      variants: combinedVariants,
      description: canData.description || dupData.description || '',
      casNumber: canData.casNumber || dupData.casNumber || '',
      molecularFormula: canData.molecularFormula || dupData.molecularFormula || '',
      molecularWeight: canData.molecularWeight || dupData.molecularWeight || '',
      updatedAt: new Date().toISOString()
    });

    // Copy variants from duplicate subcollection into canonical subcollection
    const dupSubVars = await dupRef.collection('variants').get();
    for (const dSub of dupSubVars.docs) {
      const vData = dSub.data();
      const sig = getVariantSignature(vData);
      
      // Check if canonical already has this variant in subcollection
      const canSubVars = await canRef.collection('variants').get();
      const alreadyHas = canSubVars.docs.some(cs => getVariantSignature(cs.data()) === sig);

      if (!alreadyHas) {
        await canRef.collection('variants').doc(dSub.id).set(vData);
        console.log(`   Migrated subcollection variant ${dSub.id} -> ${canonicalId}`);
      }
      await dSub.ref.delete();
    }

    // Delete the duplicate product document
    await dupRef.delete();
    console.log(`🗑️ Deleted duplicate product document: ${duplicateId}`);
    mergedProductCount++;
  }

  console.log(`\n✅ STEP 2 Complete: Merged ${mergedProductCount} duplicate products into their canonical records.`);
  console.log('🎉 Full database purification completed successfully at root level!');
}

runComprehensivePurification().then(() => process.exit(0)).catch(err => {
  console.error('Error during purification:', err);
  process.exit(1);
});
