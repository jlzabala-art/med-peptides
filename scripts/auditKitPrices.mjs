/**
 * auditKitPrices.mjs
 * Audits all Firestore product variants for missing perUnit and kit prices.
 * Reports exactly which products/variants/tiers are incomplete.
 *
 * Usage:
 *   node scripts/auditKitPrices.mjs
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }                  from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

const TIERS = ['retail', 'wholesale', 'clinic', 'master'];

async function main() {
  const productsSnap = await db.collection('products').get();
  console.log(`\nTotal products: ${productsSnap.size}\n`);

  const missingKit     = [];  // Has perUnit but kit is null
  const missingPerUnit = [];  // Has kit but perUnit is null
  const missingBoth    = [];  // Both null
  const noVariants     = [];  // Product has no variants at all

  let totalVariants = 0;
  let variantsChecked = 0;

  for (const pDoc of productsSnap.docs) {
    const pData = pDoc.data();
    const varSnap = await db.collection('products').doc(pDoc.id).collection('variants').get();

    if (varSnap.empty) {
      noVariants.push({ product: pDoc.id, name: pData.name || pDoc.id });
      continue;
    }

    totalVariants += varSnap.size;

    for (const vDoc of varSnap.docs) {
      const v = vDoc.data();
      variantsChecked++;

      for (const tier of TIERS) {
        const p = v.pricing?.[tier];
        if (!p) continue; // Tier block doesn't exist at all — skip

        const hasPerUnit = p.perUnit != null;
        const hasKit     = p.kit != null;

        const entry = {
          product:  pDoc.id,
          name:     pData.name || pDoc.id,
          variant:  vDoc.id,
          dosage:   v.dosage || v.strength || vDoc.id,
          tier,
          perUnit:  p.perUnit,
          kit:      p.kit,
        };

        if (!hasPerUnit && !hasKit) missingBoth.push(entry);
        else if (!hasKit)           missingKit.push(entry);
        else if (!hasPerUnit)       missingPerUnit.push(entry);
      }
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('════════════════════════════════════════════════');
  console.log(`  PRICING AUDIT RESULTS`);
  console.log('════════════════════════════════════════════════');
  console.log(`  Total products:   ${productsSnap.size}`);
  console.log(`  Total variants:   ${totalVariants}`);
  console.log(`  No variants:      ${noVariants.length}`);
  console.log(`  Missing KIT only: ${missingKit.length} entries`);
  console.log(`  Missing PER UNIT: ${missingPerUnit.length} entries`);
  console.log(`  Missing BOTH:     ${missingBoth.length} entries`);
  console.log('════════════════════════════════════════════════\n');

  if (missingKit.length > 0) {
    console.log('── MISSING KIT PRICE (kit = null, but perUnit exists) ──');
    console.log('These need a 10-vial kit price added:\n');
    // Group by product for readability
    const byProduct = {};
    missingKit.forEach(e => {
      if (!byProduct[e.product]) byProduct[e.product] = [];
      byProduct[e.product].push(e);
    });
    Object.entries(byProduct).forEach(([prod, entries]) => {
      console.log(`  📦 ${prod}`);
      entries.forEach(e => {
        console.log(`      variant: ${e.variant} | dosage: ${e.dosage} | tier: ${e.tier} | perUnit: $${e.perUnit}`);
      });
    });
    console.log();
  }

  if (missingPerUnit.length > 0) {
    console.log('── MISSING PER UNIT (perUnit = null, but kit exists) ──');
    missingPerUnit.forEach(e => {
      console.log(`  ${e.product} / ${e.variant} / ${e.tier} | kit: $${e.kit}`);
    });
    console.log();
  }

  if (missingBoth.length > 0) {
    console.log('── MISSING BOTH (perUnit = null AND kit = null) ──');
    missingBoth.forEach(e => {
      console.log(`  ${e.product} / ${e.variant} / ${e.tier}`);
    });
    console.log();
  }

  if (noVariants.length > 0) {
    console.log(`── PRODUCTS WITH NO VARIANTS (${noVariants.length}) ──`);
    noVariants.forEach(p => console.log(`  ${p.product}`));
    console.log();
  }

  console.log('Done.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
