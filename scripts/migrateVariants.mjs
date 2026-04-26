/**
 * migrateVariants.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads every product in Firestore, extracts pricing from flat root fields,
 * and writes a proper variants subcollection with 4-tier pricing.
 *
 * DRY RUN by default — pass --apply to write to Firestore.
 * Usage:
 *   node scripts/migrateVariants.mjs           ← dry-run (safe)
 *   node scripts/migrateVariants.mjs --apply   ← writes to Firestore
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp }       from 'firebase-admin/firestore';
import { createRequire }                 from 'module';

const require  = createRequire(import.meta.url);
const svcAcct  = require('../serviceAccountKey.json');
const DRY_RUN  = !process.argv.includes('--apply');

if (!getApps().length) initializeApp({ credential: cert(svcAcct) });
const db = getFirestore();

// ─── Pricing tier mapping ─────────────────────────────────────────────────────
// Maps flat legacy fields → tier prices.
// Convention:
//   guest = retail (unauthenticated / public user)
//   pro   = clinic (authenticated professional)
//   wholesale / master → derived or same as pro for now
//
// If you have separate wholesale/master data, add it here.
function buildTierPricing(root) {
  const guestVial  = num(root.guestVialPrice  ?? root.perVialPriceUSD);
  const proVial    = num(root.proVialPrice);
  const guestKit   = num(root.guestKitPrice   ?? root.kitPriceUSD);
  const proKit     = num(root.proKitPrice);

  // Wholesale = 10% below pro; Master = 15% below pro (estimated if not set)
  const wholesaleVial = proVial ? round(proVial * 0.90) : null;
  const wholesaleKit  = proKit  ? round(proKit  * 0.90) : null;
  const masterVial    = proVial ? round(proVial * 0.85) : null;
  const masterKit     = proKit  ? round(proKit  * 0.85) : null;

  return {
    retail:    { perUnit: guestVial,     kit: guestKit     },
    clinic:    { perUnit: proVial,       kit: proKit       },
    wholesale: { perUnit: wholesaleVial, kit: wholesaleKit },
    master:    { perUnit: masterVial,    kit: masterKit    },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const num   = v => (v !== undefined && v !== null && !isNaN(Number(v))) ? Number(v) : null;
const round = v => v !== null ? Math.round(v * 100) / 100 : null;

function hasPricing(tier) {
  return tier.retail.perUnit !== null || tier.clinic.perUnit !== null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log(DRY_RUN ? '\n🔍 DRY RUN — no writes will happen\n' : '\n🚀 APPLY MODE — writing to Firestore\n');

  const snap    = await db.collection('products').get();
  const now     = Timestamp.now();
  let migrated  = 0;
  let noPrice   = 0;
  let skipped   = 0;
  const noPriceList = [];

  for (const doc of snap.docs) {
    const root = doc.data();
    const ref  = db.collection('products').doc(doc.id);

    // Check if variants already populated (skip if already done)
    const existingVariants = await ref.collection('variants').limit(1).get();
    if (!existingVariants.empty) {
      console.log(`⏭  [${doc.id}] already has variants — skipping`);
      skipped++;
      continue;
    }

    // Extract size/label from the product fields
    const size  = root.size ?? root.defaultSize ?? extractSize(doc.id);
    const form  = root.form ?? 'vial';
    const label = size ? `${size} ${form}`.trim() : form;

    // Build pricing from flat fields
    const pricing = buildTierPricing(root);

    if (!hasPricing(pricing)) {
      console.log(`❌ NO PRICE [${doc.id}] "${root.name}" — no pricing data found`);
      noPriceList.push({ id: doc.id, name: root.name ?? '(unknown)' });
      noPrice++;
      continue;
    }

    const variantDoc = {
      label,
      size:      size ?? null,
      form,
      isDefault: true,
      stock:     { available: true, quantity: null },
      pricing,
      legacy: {
        guestVialPrice:  num(root.guestVialPrice)   ?? null,
        proVialPrice:    num(root.proVialPrice)     ?? null,
        guestKitPrice:   num(root.guestKitPrice)    ?? null,
        proKitPrice:     num(root.proKitPrice)      ?? null,
        perVialPriceUSD: num(root.perVialPriceUSD)  ?? null,
        kitPriceUSD:     num(root.kitPriceUSD)      ?? null,
      },
      migratedAt: now,
    };

    console.log(`✅ [${doc.id}] "${root.name}"`);
    console.log(`   label: "${label}"`);
    console.log(`   retail: $${pricing.retail.perUnit} | clinic: $${pricing.clinic.perUnit} | wholesale: $${pricing.wholesale.perUnit} | master: $${pricing.master.perUnit}`);

    if (!DRY_RUN) {
      await ref.collection('variants').doc('default').set(variantDoc);
      // Mark root doc as migrated
      await ref.update({ _variantsMigrated: true, _migratedAt: now });
    }

    migrated++;
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`  Total products : ${snap.size}`);
  console.log(`  ✅ Migrated    : ${migrated}`);
  console.log(`  ⏭  Skipped     : ${skipped} (already had variants)`);
  console.log(`  ❌ No pricing  : ${noPrice}`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (noPriceList.length > 0) {
    console.log('Products with NO pricing data (need manual entry):');
    noPriceList.forEach(p => console.log(`  • [${p.id}] ${p.name}`));
    console.log('');
  }

  if (DRY_RUN && migrated > 0) {
    console.log('👆 Review above, then run with --apply to write to Firestore.\n');
  } else if (!DRY_RUN && migrated > 0) {
    console.log('🎉 Migration complete. Run scripts/checkVariants.mjs to verify.\n');
  }
}

// ─── Extract size from doc ID (e.g. "BPC-157-5mg-vial" → "5mg") ──────────────
function extractSize(id) {
  const m = id.match(/[\d.]+(?:mg|ml|iu|mcg|g)\b/i);
  return m ? m[0] : null;
}

main().catch(e => { console.error(e); process.exit(1); });
