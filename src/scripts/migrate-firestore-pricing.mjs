/**
 * migrate-firestore-pricing.mjs — Phase 9: Firestore Data Normalization
 * ─────────────────────────────────────────────────────────────────────────────
 * Run: node src/scripts/migrate-firestore-pricing.mjs [--dry-run] [--product=id]
 *
 * What it does:
 *   1. Reads each product document from Firestore
 *   2. If legacy flat fields (perVialPriceUSD, kitPriceUSD) exist at root level:
 *      → Maps them to canonical pricing.retail.perUnit & pricing.retail.kit
 *      → Removes the legacy fields
 *   3. Writes the cleaned document back to Firestore
 *
 * Safety:
 *   --dry-run    Preview changes without writing to Firestore (default mode)
 *   --write      Actually write changes to Firestore
 *   --product=id Only migrate a single product by ID
 *
 * Tier mapping logic:
 *   perVialPriceUSD  → pricing.retail.perUnit  (if not already set)
 *   kitPriceUSD      → pricing.retail.kit       (if not already set)
 *
 * The script NEVER overwrites existing canonical pricing data.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

// ── CLI args ───────────────────────────────────────────────────────────────────
const args      = process.argv.slice(2);
const DRY_RUN   = !args.includes('--write');
const PRODUCT_FILTER = args.find(a => a.startsWith('--product='))?.split('=')[1] ?? null;

// ── Init Firebase Admin ────────────────────────────────────────────────────────
const SA_PATHS = [
  './serviceAccountKey.json',
  './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json',
  './serviceAccount.json',
];

let initialized = false;
for (const p of SA_PATHS) {
  if (existsSync(p)) {
    const sa = JSON.parse(readFileSync(p, 'utf-8'));
    initializeApp({ credential: cert(sa) });
    initialized = true;
    console.log(`✅ Firebase initialized with: ${p}`);
    break;
  }
}
if (!initialized && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  initializeApp();
  initialized = true;
}
if (!initialized) {
  console.error('❌ No service account found.');
  process.exit(1);
}

const db = getFirestore();

// ── Legacy field definitions ───────────────────────────────────────────────────
const LEGACY_FIELDS_TO_REMOVE = [
  'perVialPriceUSD',
  'kitPriceUSD',
  'priceUSD',
  'guestVialPrice',
  'proVialPrice',
  'base_price',
  'unit_price',
  'costPrice',
];

// ── Migration logic ────────────────────────────────────────────────────────────

/**
 * Compute the update payload for a single product document.
 * Returns null if no changes are needed.
 */
function computeUpdate(data) {
  const updates  = {};
  const deletes  = {};
  let hasChanges = false;

  // 1. Map legacy flat fields → canonical pricing (only if canonical slot is empty)
  const existingRetailPerUnit = data.pricing?.retail?.perUnit ?? data.pricing?.retail?.unit;
  const existingRetailKit     = data.pricing?.retail?.kit;

  if (data.perVialPriceUSD != null && existingRetailPerUnit == null) {
    const val = parseFloat(data.perVialPriceUSD);
    if (!isNaN(val) && val > 0) {
      updates['pricing.retail.perUnit'] = val;
      updates['pricing.retail.currency'] = updates['pricing.retail.currency'] ?? 'USD';
      hasChanges = true;
    }
  }

  if (data.kitPriceUSD != null && existingRetailKit == null) {
    const val = parseFloat(data.kitPriceUSD);
    if (!isNaN(val) && val > 0) {
      updates['pricing.retail.kit'] = val;
      updates['pricing.retail.currency'] = updates['pricing.retail.currency'] ?? 'USD';
      hasChanges = true;
    }
  }

  // 2. Schedule deletion of all legacy root-level fields
  for (const field of LEGACY_FIELDS_TO_REMOVE) {
    if (data[field] !== undefined) {
      deletes[field] = FieldValue.delete();
      hasChanges = true;
    }
  }

  if (!hasChanges) return null;
  return { ...updates, ...deletes };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\nMode: ${DRY_RUN ? '🔍 DRY RUN (preview only — use --write to apply)' : '✍️  WRITE MODE'}`);
  if (PRODUCT_FILTER) console.log(`Filter: product = ${PRODUCT_FILTER}\n`);
  else console.log('');

  let query = db.collection('products');
  if (PRODUCT_FILTER) query = query.where('__name__', '==', PRODUCT_FILTER);

  const snapshot = await query.get();
  console.log(`📦 Products found: ${snapshot.size}\n`);

  let migrated = 0, skipped = 0, errors = 0;

  const BATCH_SIZE = 400;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data   = doc.data();
    const name   = data.name ?? data.productName ?? doc.id;

    try {
      const update = computeUpdate(data);

      if (!update) {
        console.log(`  ⏭  [${doc.id}] ${name} — no changes needed`);
        skipped++;
        continue;
      }

      // Show what would change
      const setFields = Object.entries(update)
        .filter(([, v]) => v !== FieldValue.delete())
        .map(([k, v]) => `${k}=${v}`);
      const removeFields = Object.entries(update)
        .filter(([, v]) => v === FieldValue.delete())
        .map(([k]) => k);

      console.log(`  ✏️  [${doc.id}] ${name}`);
      if (setFields.length)    console.log(`       SET:    ${setFields.join(', ')}`);
      if (removeFields.length) console.log(`       REMOVE: ${removeFields.join(', ')}`);

      if (!DRY_RUN) {
        batch.update(doc.ref, update);
        batchCount++;

        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          batch = db.batch();
          batchCount = 0;
          console.log('  💾 Batch committed\n');
        }
      }

      migrated++;
    } catch (err) {
      console.error(`  ❌ [${doc.id}] ${name} — Error: ${err.message}`);
      errors++;
    }
  }

  // Commit remaining batch
  if (!DRY_RUN && batchCount > 0) {
    await batch.commit();
    console.log('\n  💾 Final batch committed');
  }

  console.log('\n════════════════════════════════════════════════');
  console.log(`  MIGRATION SUMMARY`);
  console.log('────────────────────────────────────────────────');
  console.log(`  Products scanned : ${snapshot.size}`);
  console.log(`  To migrate       : ${migrated}`);
  console.log(`  Already clean    : ${skipped}`);
  console.log(`  Errors           : ${errors}`);
  if (DRY_RUN) {
    console.log('\n  ⚠️  DRY RUN — no changes written to Firestore');
    console.log('  Run with --write to apply:');
    console.log('  node src/scripts/migrate-firestore-pricing.mjs --write');
  } else {
    console.log(`\n  ✅ ${migrated} products migrated in Firestore`);
  }
  console.log('════════════════════════════════════════════════\n');
}

run().catch(err => {
  console.error('❌ Migration failed:', err.message);
  process.exit(2);
});
