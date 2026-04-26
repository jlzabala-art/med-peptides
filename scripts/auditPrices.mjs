/**
 * auditPrices.mjs
 * Checks each product's variants for pricing completeness.
 * Reports missing tiers and actual price values for the first variant.
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node scripts/auditPrices.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

const TIERS = ['retailPrice', 'wholesalePrice', 'clinicPrice', 'masterPrice'];

async function main() {
  const productsSnap = await db.collection('products').get();
  console.log(`\n📦 Auditing prices for ${productsSnap.size} products\n`);

  const noVariants   = [];
  const missingTiers = [];
  const noPricing    = [];
  let   totalVariants = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const varSnap = await db.collection('products').doc(doc.id).collection('variants').get();

    // Check nested variants sub-collection first
    if (varSnap.size > 0) {
      totalVariants += varSnap.size;
      for (const vDoc of varSnap.docs) {
        const v = vDoc.data();
        if (!v.pricing) {
          noPricing.push({ product: doc.id, variant: vDoc.id });
          continue;
        }
        const missing = TIERS.filter(t => !v.pricing[t]?.base?.perUnit && !v.pricing[t]?.base?.kit);
        if (missing.length > 0) {
          missingTiers.push({ product: doc.id, variant: vDoc.id, label: v.label ?? v.dosage ?? '?', missing });
        }
      }
    }
    // Also check embedded variants[] array (repository pattern)
    else if (Array.isArray(data.variants) && data.variants.length > 0) {
      totalVariants += data.variants.length;
      for (const v of data.variants) {
        if (!v.pricing) {
          noPricing.push({ product: doc.id, variant: v.id ?? v.dosage ?? '?' });
          continue;
        }
        const missing = TIERS.filter(t => !v.pricing[t]?.base?.perUnit && !v.pricing[t]?.base?.kit);
        if (missing.length > 0) {
          missingTiers.push({ product: doc.id, variant: v.id ?? '?', label: v.label ?? v.dosage ?? '?', missing });
        }
      }
    }
    // Legacy flat pricing on the root doc
    else if (data.pricing || data.guestVialPrice || data.proVialPrice) {
      totalVariants += 1;
      const pricing = data.pricing ?? {};
      const missing = TIERS.filter(t => !pricing[t]?.base?.perUnit && !pricing[t]?.base?.kit);
      if (missing.length === TIERS.length) {
        // Has only legacy flat fields
        noVariants.push({ product: doc.id, name: data.name, note: 'legacy flat pricing' });
      } else if (missing.length > 0) {
        missingTiers.push({ product: doc.id, variant: '(root)', label: data.name, missing });
      }
    } else {
      noVariants.push({ product: doc.id, name: data.name, note: 'no pricing at all' });
    }
  }

  // ── Sample: show actual prices for first product that has full pricing ─────
  console.log('══ SAMPLE PRICE CHECK (first 5 fully-priced variants) ══\n');
  let shown = 0;
  outer:
  for (const doc of productsSnap.docs) {
    const varSnap = await db.collection('products').doc(doc.id).collection('variants').get();
    const variants = varSnap.size > 0
      ? varSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      : (doc.data().variants ?? []);

    for (const v of variants) {
      if (!v.pricing?.retailPrice?.base?.perUnit) continue;
      const p = v.pricing;
      console.log(`  Product: ${doc.id}`);
      console.log(`  Variant: ${v.id ?? v.dosage ?? v.label}`);
      console.log(`    retailPrice  → perUnit: $${p.retailPrice?.base?.perUnit}   kit: $${p.retailPrice?.base?.kit ?? 'n/a'}`);
      console.log(`    wholesale    → perUnit: $${p.wholesalePrice?.base?.perUnit ?? 'n/a'}`);
      console.log(`    clinicPrice  → perUnit: $${p.clinicPrice?.base?.perUnit ?? 'n/a'}`);
      console.log(`    masterPrice  → perUnit: $${p.masterPrice?.base?.perUnit ?? 'n/a'}`);
      console.log('');
      if (++shown >= 5) break outer;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('══ AUDIT SUMMARY ══\n');
  console.log(`  Total variants checked : ${totalVariants}`);
  console.log(`  Variants missing pricing object entirely : ${noPricing.length}`);
  console.log(`  Variants with some missing tier(s) : ${missingTiers.length}`);
  console.log(`  Products with no pricing anywhere : ${noVariants.length}`);

  if (noPricing.length > 0) {
    console.log('\n❌ NO PRICING OBJECT:');
    noPricing.forEach(e => console.log(`   ${e.product} / ${e.variant}`));
  }

  if (missingTiers.length > 0) {
    console.log('\n⚠️  MISSING TIERS:');
    missingTiers.forEach(e => console.log(`   ${e.product} [${e.label}] — missing: ${e.missing.join(', ')}`));
  }

  if (noVariants.length > 0) {
    console.log('\n🚫 PRODUCTS WITH NO PRICING ANYWHERE:');
    noVariants.forEach(e => console.log(`   ${e.product}: ${e.note}`));
  }

  console.log('\n✅ Audit complete.\n');
}

main().catch(e => { console.error(e); process.exit(1); });
