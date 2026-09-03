/**
 * fix-dirty-product-names.js
 *
 * Bulk migration: strips dosage amounts and goal/indication words from product names,
 * storing them as structured fields instead.
 *
 * Strategy: IN-PLACE update (no doc moves) to preserve existing variant references.
 *   - products/{id}.name          → clean name
 *   - products/{id}.canonicalName → clean name
 *   - variants: dosage_amount, dosage_unit, dosage (if parseable from product name)
 *
 * Run: node scripts/fix-dirty-product-names.js [--dry-run]
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }        = require('firebase-admin/firestore');
const sa = require('./serviceAccountKey.json');

const app = initializeApp({ credential: cert(sa) }, 'fix-names');
const db  = getFirestore(app);

const DRY_RUN = process.argv.includes('--dry-run');
console.log(DRY_RUN ? '[DRY RUN — no writes]\n' : '[LIVE RUN — writing to Firestore]\n');

// ── Name cleanup rules ────────────────────────────────────────────────────────
// Maps dirty product ID → { cleanName, parsedDosage? }
// parsedDosage: { amount, unit, label } — extracted from name, to store on variants
const PRODUCT_MAP = {
  'epithalon-10-mg-anti-aging':         { cleanName: 'Epithalon',                   parsedDosage: { amount: 10,  unit: 'mg',  label: '10 mg'  } },
  'snap-8-10-mg-cosmetic':              { cleanName: 'Snap-8',                       parsedDosage: { amount: 10,  unit: 'mg',  label: '10 mg'  } },
  'tb-10-mg-bpc-10-mg-ghk-50-mg':       { cleanName: 'TB + BPC + GHK Stack',         parsedDosage: { amount: null, unit: null, label: 'TB 10mg + BPC 10mg + GHK 50mg' } },
  'aod-9604-5mg-vial':                  { cleanName: 'AOD-9604',                     parsedDosage: null },  // variants have own dosages
  'bpc-10mg-tb-10mg':                   { cleanName: 'BPC-157 + TB-500 Stack',       parsedDosage: { amount: null, unit: null, label: 'BPC 10mg + TB 10mg' } },
  'bpc-5-mgtb-5-mg':                    { cleanName: 'BPC-157 + TB-500 Stack (5mg)', parsedDosage: { amount: null, unit: null, label: 'BPC 5mg + TB 5mg'   } },
  'follistatin-344-1mg-vial':           { cleanName: 'Follistatin-344',              parsedDosage: null },  // variants have own dosages
  'ghrp-6-5mg-vial':                    { cleanName: 'GHRP-6',                       parsedDosage: null },
  'melanotan-i-10mg-vial':              { cleanName: 'Melanotan I',                  parsedDosage: null },
  'pt-141-10mg-vial':                   { cleanName: 'PT-141',                       parsedDosage: null },
  'thymalin-5mg-vial':                  { cleanName: 'Thymalin',                     parsedDosage: null },
  'thymogen-5mg-vial':                  { cleanName: 'Thymogen',                     parsedDosage: null },
  'vip-vasoactive-intestinal-peptide-10mg': { cleanName: 'VIP (Vasoactive Intestinal Peptide)', parsedDosage: null },
  'cjc-1295-no-dac-10mg-vial':          { cleanName: 'CJC-1295 (No DAC)',            parsedDosage: null },
  'cjc-1295-without-dac-5mg-ipa-5mg':  { cleanName: 'CJC-1295 + Ipamorelin Stack', parsedDosage: { amount: null, unit: null, label: 'CJC 5mg + IPA 5mg' } },
  'ss-31-elamipretide-5mg-vial':        { cleanName: 'SS-31 (Elamipretide)',         parsedDosage: null },
  'amlexanox-40mg-caps-x30':            { cleanName: 'Amlexanox',                   parsedDosage: null },
  'cerebrolysin-100mg-caps-x30':        { cleanName: 'Cerebrolysin',                parsedDosage: null },
  'slu-pp-332-100mg-caps-x30':          { cleanName: 'SLU-PP-332',                  parsedDosage: null },
};

async function fixProduct(productId, { cleanName, parsedDosage }) {
  const productRef  = db.collection('products').doc(productId);
  const variantsRef = productRef.collection('variants');

  const [productSnap, variantsSnap] = await Promise.all([
    productRef.get(),
    variantsRef.get(),
  ]);

  if (!productSnap.exists) {
    console.log(`  ⚠️  Product not found: ${productId}`);
    return { skipped: 1 };
  }

  const currentName = productSnap.data().name || productSnap.data().canonicalName;
  console.log(`\n📦 ${productId}`);
  console.log(`   name:  "${currentName}" → "${cleanName}"`);
  console.log(`   variants: ${variantsSnap.size}`);

  const writes = [];

  // Update product doc
  writes.push({
    ref: productRef,
    data: { name: cleanName, canonicalName: cleanName, updatedAt: new Date() }
  });

  // Update each variant
  for (const vDoc of variantsSnap.docs) {
    const vData = vDoc.data();
    const variantUpdate = {
      canonicalName: cleanName,
      updatedAt: new Date(),
    };

    // Only add dosage fields if not already set and we have parsed data
    if (parsedDosage) {
      if (!vData.dosage)         variantUpdate.dosage        = parsedDosage.label;
      if (!vData.dosage_amount && parsedDosage.amount != null) variantUpdate.dosage_amount = parsedDosage.amount;
      if (!vData.dosage_unit   && parsedDosage.unit   != null) variantUpdate.dosage_unit   = parsedDosage.unit;
    }

    console.log(`   variant ${vDoc.id.substring(0, 50)}:`);
    if (parsedDosage && !vData.dosage) console.log(`     + dosage: "${parsedDosage.label}"`);

    writes.push({ ref: vDoc.ref, data: variantUpdate });
  }

  if (!DRY_RUN) {
    // Firestore batches max 500 ops — these are small enough for one batch
    const batch = db.batch();
    writes.forEach(w => batch.update(w.ref, w.data));
    await batch.commit();
    console.log(`   ✅ Written ${writes.length} doc(s)`);
  } else {
    console.log(`   [dry-run] Would write ${writes.length} doc(s)`);
  }

  return { writes: writes.length };
}

async function main() {
  const productIds = Object.keys(PRODUCT_MAP);
  console.log(`Processing ${productIds.length} products...\n`);

  let totalWrites = 0;
  let skipped = 0;

  for (const id of productIds) {
    try {
      const result = await fixProduct(id, PRODUCT_MAP[id]);
      totalWrites += result.writes || 0;
      skipped     += result.skipped || 0;
    } catch (e) {
      console.error(`  ❌ Error on ${id}:`, e.message);
    }
  }

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`✅ Done. Total writes: ${totalWrites} | Skipped: ${skipped}`);
  if (DRY_RUN) console.log('⚠️  DRY RUN — nothing was written to Firestore.');
  process.exit(0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
