/**
 * phase4_legacyPeptideVariants.mjs
 *
 * Migrates the 5 legacy peptide product docs that still have flat
 * `guestVialPrice` fields and no variants subcollection.
 *
 * These are older dosage SKUs that pre-date the canonical migration:
 *   SS-31-5mg-vial, Selank-30mg-vial, Semax-30mg-vial,
 *   TB-500-5mg-vial, Thymosin_Alpha1-6mg-vial
 *
 * Strategy:
 *   - master  = round(guestVialPrice / 1.50, 2)  (reverse of retail margin)
 *   - retail  = master × 1.50
 *   - wholesale = master × 1.20
 *   - clinic  = master × 1.30
 *
 * Creates:
 *   products/{id}/variants/default  — single variant doc
 *
 * Also marks the root product doc:
 *   isActive: true, status: 'active', migratedAt: now, _legacyMigrated: true
 *
 * Run: node scripts/phase4_legacyPeptideVariants.mjs
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const sa      = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}

const db = admin.firestore();

// ── Margin multipliers (must match phase3) ───────────────────────────────────
const MARGINS = {
  retail:    1.50,
  wholesale: 1.20,
  clinic:    1.30,
};

function round2(n) { return Math.round(n * 100) / 100; }
function applyMargin(master, mult) { return master == null ? null : round2(master * mult); }

// ── Legacy product definitions ───────────────────────────────────────────────
// Inferred from live Firestore inspection: guestVialPrice values
const LEGACY_PRODUCTS = [
  { id: 'SS-31-5mg-vial',          size: '5mg',  form: 'vial',  label: '5mg vial',  guestVialPrice: 95 },
  { id: 'Selank-30mg-vial',        size: '30mg', form: 'vial',  label: '30mg vial', guestVialPrice: 75 },
  { id: 'Semax-30mg-vial',         size: '30mg', form: 'vial',  label: '30mg vial', guestVialPrice: 89 },
  { id: 'TB-500-5mg-vial',         size: '5mg',  form: 'vial',  label: '5mg vial',  guestVialPrice: 48 },
  { id: 'Thymosin_Alpha1-6mg-vial',size: '6mg',  form: 'vial',  label: '6mg vial',  guestVialPrice: 78 },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const batch = db.batch();

  console.log('Phase 4 — Migrating 5 legacy peptide docs to canonical variant structure\n');

  for (const p of LEGACY_PRODUCTS) {
    const productRef = db.collection('products').doc(p.id);
    const variantRef = productRef.collection('variants').doc('default');

    // Derive master price from retail (guestVialPrice was the retail price)
    const masterPerUnit = round2(p.guestVialPrice / MARGINS.retail);

    const pricing = {
      master: {
        perUnit:  masterPerUnit,
        kit:      null,          // no kit for these legacy SKUs
        currency: 'USD',
      },
    };

    for (const [tier, mult] of Object.entries(MARGINS)) {
      pricing[tier] = {
        perUnit:  applyMargin(masterPerUnit, mult),
        kit:      null,
        currency: 'USD',
      };
    }

    const variantData = {
      label:     p.label,
      size:      p.size,
      form:      p.form,
      dosage:    `${p.size}/${p.form}`,
      isDefault: true,
      isActive:  true,
      sortOrder: 0,
      stock: {
        available: true,
        quantity:  null,
      },
      pricing,
      migratedAt: now,
      _legacySource: {
        guestVialPrice: p.guestVialPrice,
        migratedByScript: 'phase4_legacyPeptideVariants.mjs',
      },
    };

    batch.set(variantRef, variantData);

    // Update root product doc — mark as migrated, strip old flat price fields
    batch.update(productRef, {
      isActive:         true,
      status:           'active',
      migratedAt:       now,
      _legacyMigrated:  true,
      // Clear stale flat pricing fields
      guestVialPrice:   admin.firestore.FieldValue.delete(),
      proVialPrice:     admin.firestore.FieldValue.delete(),
      guestKitPrice:    admin.firestore.FieldValue.delete(),
      proKitPrice:      admin.firestore.FieldValue.delete(),
      priceUSD:         admin.firestore.FieldValue.delete(),
    });

    console.log(`  ✓ ${p.id}`);
    console.log(`      master:    perUnit $${masterPerUnit}`);
    console.log(`      retail:    perUnit $${pricing.retail.perUnit}`);
    console.log(`      wholesale: perUnit $${pricing.wholesale.perUnit}`);
    console.log(`      clinic:    perUnit $${pricing.clinic.perUnit}`);
    console.log('');
  }

  await batch.commit();
  console.log('── Batch committed. 5 products migrated. ✓');
  process.exit(0);
}

run().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
