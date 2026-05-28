/**
 * auditPrices.mjs
 * Checks each ACTIVE product's variants for pricing completeness.
 * Skips draft/inactive products (status: 'draft' || isActive: false).
 * Reports missing tiers and actual price values for the first variant.
 *
 * Canonical pricing schema:
 *   variant.pricing.{retail|wholesale|clinic|master}.perUnit
 *   variant.pricing.{retail|wholesale|clinic|master}.kit     (nullable)
 *   variant.pricing.{retail|wholesale|clinic|master}.currency
 *
 * Usage:
 *   node scripts/auditPrices.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

// Canonical tier keys (matches phase3 / phase4 migration output)
const TIERS = ['retail', 'wholesale', 'clinic', 'master'];

async function main() {
  const productsSnap = await db.collection('products').get();
  console.log(`\n📦 Scanning ${productsSnap.size} total product documents\n`);

  const noVariants   = [];
  const missingTiers = [];
  const noPricing    = [];
  let   totalVariants = 0;
  let   skippedDraft  = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();

    // ── Skip draft / inactive stubs ──────────────────────────────
    if (data.status === 'draft' || data.isActive === false) {
      skippedDraft++;
      continue;
    }

    const varSnap = await db.collection('products').doc(doc.id).collection('variants').get();

    // ── Canonical: variants subcollection ────────────────────────
    if (varSnap.size > 0) {
      totalVariants += varSnap.size;
      for (const vDoc of varSnap.docs) {
        const v = vDoc.data();
        if (!v.pricing) {
          noPricing.push({ product: doc.id, variant: vDoc.id });
          continue;
        }
        // Check canonical keys: pricing.retail.perUnit, etc.
        const missing = TIERS.filter(t => {
          const tier = v.pricing[t];
          return !tier || (tier.perUnit == null && tier.kit == null);
        });
        if (missing.length > 0) {
          missingTiers.push({
            product: doc.id,
            variant: vDoc.id,
            label: v.label ?? v.dosage ?? '?',
            missing,
          });
        }
      }
    }
    // ── Embedded variants array (legacy repository pattern) ──────
    else if (Array.isArray(data.variants) && data.variants.length > 0) {
      totalVariants += data.variants.length;
      for (const v of data.variants) {
        if (!v.pricing) {
          noPricing.push({ product: doc.id, variant: v.id ?? v.dosage ?? '?' });
          continue;
        }
        const missing = TIERS.filter(t => {
          const tier = v.pricing[t];
          return !tier || (tier.perUnit == null && tier.kit == null);
        });
        if (missing.length > 0) {
          missingTiers.push({
            product: doc.id,
            variant: v.id ?? '?',
            label: v.label ?? v.dosage ?? '?',
            missing,
          });
        }
      }
    }
    // ── No variants at all ────────────────────────────────────────
    else {
      noVariants.push({ product: doc.id, name: data.name, note: 'no variants subcollection' });
    }
  }

  // ── Sample: show actual prices for first 5 fully-priced variants ─────────
  console.log('══ SAMPLE PRICE CHECK (first 5 fully-priced active variants) ══\n');
  let shown = 0;
  outer:
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    if (data.status === 'draft' || data.isActive === false) continue;

    const varSnap = await db.collection('products').doc(doc.id).collection('variants').get();
    const variants = varSnap.size > 0
      ? varSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      : (data.variants ?? []);

    for (const v of variants) {
      if (!v.pricing?.retail?.perUnit) continue;
      const p = v.pricing;
      console.log(`  Product: ${doc.id}`);
      console.log(`  Variant: ${v.id ?? v.dosage ?? v.label}`);
      console.log(`    retail    → perUnit: $${p.retail?.perUnit}   kit: $${p.retail?.kit ?? 'n/a'}`);
      console.log(`    wholesale → perUnit: $${p.wholesale?.perUnit ?? 'n/a'}`);
      console.log(`    clinic    → perUnit: $${p.clinic?.perUnit ?? 'n/a'}`);
      console.log(`    master    → perUnit: $${p.master?.perUnit ?? 'n/a'}`);
      console.log('');
      if (++shown >= 5) break outer;
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('══ AUDIT SUMMARY ══\n');
  console.log(`  Total products scanned   : ${productsSnap.size}`);
  console.log(`  Draft/inactive (skipped) : ${skippedDraft}`);
  console.log(`  Active products checked  : ${productsSnap.size - skippedDraft}`);
  console.log(`  Total active variants    : ${totalVariants}`);
  console.log(`  Variants missing pricing : ${noPricing.length}`);
  console.log(`  Variants missing tier(s) : ${missingTiers.length}`);
  console.log(`  Active products w/no variants : ${noVariants.length}`);

  if (noPricing.length > 0) {
    console.log('\n❌ NO PRICING OBJECT:');
    noPricing.forEach(e => console.log(`   ${e.product} / ${e.variant}`));
  }

  if (missingTiers.length > 0) {
    console.log('\n⚠️  MISSING TIERS:');
    missingTiers.forEach(e => console.log(`   ${e.product} [${e.label}] — missing: ${e.missing.join(', ')}`));
  }

  if (noVariants.length > 0) {
    console.log('\n🚫 ACTIVE PRODUCTS WITH NO VARIANTS:');
    noVariants.forEach(e => console.log(`   ${e.product}: ${e.note}`));
  }

  const isClean = noPricing.length === 0 && missingTiers.length === 0 && noVariants.length === 0;
  console.log(isClean
    ? '\n✅ Catalog is CLEAN — all active products have full pricing across all tiers.\n'
    : '\n⚠️  Audit complete — issues found above require attention.\n'
  );
}

main().catch(e => { console.error(e); process.exit(1); });
