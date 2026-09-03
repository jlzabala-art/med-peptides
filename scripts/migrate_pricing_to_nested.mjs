/**
 * MIGRATE PRICING TO NESTED FORMAT
 * ================================
 * Converts all products from 5 target suppliers from flat pricing schema:
 *   pricing: { retail: 55, wholesale: 49.5, clinic: 46.75, supplierCost: 49.5 }
 *
 * To canonical nested schema expected by resolvePrice.js:
 *   pricing: {
 *     retail:    { perUnit: 55,   currency: 'EUR' },
 *     wholesale: { perUnit: 49.5, currency: 'EUR' },
 *     clinic:    { perUnit: 46.75, currency: 'EUR' },
 *     master:    { perUnit: 49.5, currency: 'EUR' }   // from supplierCost
 *   }
 *
 * Also sets pricing_normalized: true and cleans up old flat fields.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

const TARGET_SUPPLIERS = [
  'supplier-nplabs',
  'supplier-europeptides',
  'supplier-vallida',
  'supplier-bioniq',
  'supplier-lotusland',
];

// Supplier default currencies
const SUPPLIER_CURRENCIES = {
  'supplier-nplabs':       'EUR',  // NP Labs bills in EUR (Greek supplier)
  'supplier-europeptides': 'EUR',  // Bulgarian supplier, EUR
  'supplier-vallida':      'GBP',  // UK supplier
  'supplier-bioniq':       'EUR',  // UK but EUR pricing
  'supplier-lotusland':    'USD',  // Hong Kong, USD
};

/**
 * Converts a flat pricing object to the nested canonical format.
 * Handles both flat numbers and already-nested objects.
 */
function toNestedPricing(flatPricing, currency) {
  if (!flatPricing) return null;

  const result = {};
  const cur = currency || 'USD';

  // Helper: convert a field value (number or nested object) to nested object
  const toEntry = (val, cur) => {
    if (val == null) return null;
    if (typeof val === 'number' && !isNaN(val)) {
      return { perUnit: parseFloat(val.toFixed(4)), currency: cur };
    }
    if (typeof val === 'object' && val.perUnit != null) {
      // Already nested — ensure currency is set
      return { ...val, currency: val.currency || cur };
    }
    return null;
  };

  // Map flat pricing fields to nested canonical keys
  const retailEntry = toEntry(flatPricing.retail, cur);
  if (retailEntry) result.retail = retailEntry;

  const wholesaleEntry = toEntry(flatPricing.wholesale, cur);
  if (wholesaleEntry) result.wholesale = wholesaleEntry;

  const clinicEntry = toEntry(flatPricing.clinic, cur);
  if (clinicEntry) result.clinic = clinicEntry;

  // master = supplierCost (cost price for the clinic/master buyer)
  const masterVal = flatPricing.supplierCost ?? flatPricing.master;
  const masterEntry = toEntry(masterVal, cur);
  if (masterEntry) result.master = masterEntry;

  // Volume kit pricing
  const volume10KitEntry = toEntry(flatPricing.volume10Kit, cur);
  if (volume10KitEntry) result.volume10Kit = volume10KitEntry;

  return Object.keys(result).length > 0 ? result : null;
}

async function migrate() {
  console.log('=======================================================');
  console.log(' MIGRATING PRICING TO NESTED FORMAT — 5 SUPPLIERS');
  console.log('=======================================================\n');

  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const supplierId of TARGET_SUPPLIERS) {
    const currency = SUPPLIER_CURRENCIES[supplierId] || 'USD';
    console.log(`\n--- Processing ${supplierId} (base currency: ${currency}) ---`);

    const snap = await db.collection('products').where('supplierId', '==', supplierId).get();
    console.log(`  Found ${snap.size} products`);

    let batchOps = [];
    let batch = db.batch();
    let opCount = 0;
    let supplierUpdated = 0;
    let supplierSkipped = 0;

    snap.docs.forEach(doc => {
      const p = doc.data();
      const existingPricing = p.pricing;

      if (!existingPricing) {
        console.log(`  ⚠️  ${doc.id} — no pricing field, skipping`);
        supplierSkipped++;
        return;
      }

      // Check if already in nested format (has perUnit in retail)
      const isAlreadyNested = existingPricing.retail && 
                              typeof existingPricing.retail === 'object' && 
                              existingPricing.retail.perUnit != null;

      // Determine product currency (product-level may override)
      const productCurrency = p.currency || currency;

      // Convert to nested
      const nestedPricing = toNestedPricing(existingPricing, productCurrency);

      if (!nestedPricing || Object.keys(nestedPricing).length === 0) {
        console.log(`  ⚠️  ${doc.id} — could not convert pricing, skipping`);
        supplierSkipped++;
        return;
      }

      if (isAlreadyNested) {
        supplierSkipped++;
        return; // Already correct format
      }

      // Build the update
      const update = {
        pricing: nestedPricing,
        pricing_normalized: true,
        updatedAt: FieldValue.serverTimestamp(),
      };

      // Remove old flat fields that might exist at top level
      const legacyFields = ['price', 'priceUSD', 'priceEUR', 'originalPrice', 
                            'retailPrice', 'wholesalePrice', 'costPrice', 
                            'pricing_tiers', 'unit_price'];
      legacyFields.forEach(f => {
        if (p[f] !== undefined) {
          update[f] = FieldValue.delete();
        }
      });

      batch.update(doc.ref, update);
      opCount++;
      supplierUpdated++;

      // Firestore batch limit = 500
      if (opCount >= 400) {
        batchOps.push(batch.commit());
        batch = db.batch();
        opCount = 0;
      }
    });

    if (opCount > 0) {
      batchOps.push(batch.commit());
    }

    try {
      await Promise.all(batchOps);
      console.log(`  ✅ Updated: ${supplierUpdated} | Skipped (already ok or empty): ${supplierSkipped}`);
      totalUpdated += supplierUpdated;
      totalSkipped += supplierSkipped;
    } catch (err) {
      console.error(`  ❌ Batch error for ${supplierId}:`, err.message);
      totalErrors++;
    }
  }

  console.log('\n=======================================================');
  console.log(` DONE: Updated=${totalUpdated} | Skipped=${totalSkipped} | Errors=${totalErrors}`);
  console.log('=======================================================');
  process.exit(totalErrors > 0 ? 1 : 0);
}

migrate().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
