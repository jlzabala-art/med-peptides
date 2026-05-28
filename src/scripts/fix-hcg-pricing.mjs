/**
 * fix-hcg-pricing.mjs — Fix HCG-10000iu-vial perUnit prices (derived from kit)
 * Usage:
 *   node src/scripts/fix-hcg-pricing.mjs          # dry-run
 *   node src/scripts/fix-hcg-pricing.mjs --write   # apply to Firestore
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

const SA_PATHS = [
  './serviceAccountKey.json',
  './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json',
  './serviceAccount.json',
];

let saPath = SA_PATHS.find(p => existsSync(p));
if (!saPath && process.env.GOOGLE_APPLICATION_CREDENTIALS) saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!saPath) { console.error('❌ No service account found.'); process.exit(1); }

initializeApp({ credential: cert(JSON.parse(readFileSync(saPath, 'utf-8'))) });
const db = getFirestore();

const WRITE = process.argv.includes('--write');
const PRODUCT_ID = 'HCG-10000iu-vial';
const KIT_SIZE   = 10; // "10 vial/kit"

console.log(`\n🔍 Fixing product: ${PRODUCT_ID}`);
console.log(`Mode: ${WRITE ? '✏️  WRITE' : '🔍 DRY-RUN'}\n`);

const variantRef = db.collection('products').doc(PRODUCT_ID).collection('variants').doc('default');
const snap = await variantRef.get();

if (!snap.exists) {
  console.error('❌ Variant [default] not found.'); process.exit(1);
}

const vd = snap.data();
const currentPricing = vd.pricing ?? {};

// Build updated pricing: keep existing kit values, derive perUnit = kit / KIT_SIZE
const updatedPricing = {};
const tiers = ['retail', 'clinic', 'wholesale', 'master'];

for (const tier of tiers) {
  const entry = currentPricing[tier] ?? {};
  const kit     = entry.kit ?? null;
  const perUnit = kit != null ? Math.round((kit / KIT_SIZE) * 100) / 100 : null;

  updatedPricing[tier] = {
    ...entry,
    perUnit,
    kit,
    currency: entry.currency ?? 'USD',
  };

  const status = perUnit != null ? `✅ $${perUnit.toFixed(2)}/vial (derived from kit $${kit})` : '❌ missing';
  console.log(`  ${tier.padEnd(10)} ${status}`);
}

if (!WRITE) {
  console.log('\n─── DRY-RUN: pricing that WOULD be written ───');
  console.log(JSON.stringify(updatedPricing, null, 2));
  console.log('\nRun with --write to apply.');
  process.exit(0);
}

await variantRef.update({ pricing: updatedPricing });
console.log('\n✅ Variant [default] updated. Running QA check...');

// Quick self-verify
const after = (await variantRef.get()).data().pricing;
const allOk = tiers.every(t => after[t]?.perUnit != null);
console.log(allOk
  ? '✅ All tiers now have perUnit — product is fully canonical.'
  : '⚠️  Some tiers still missing perUnit — check Firestore manually.'
);
