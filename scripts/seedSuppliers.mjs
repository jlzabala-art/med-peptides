/**
 * seedSuppliers.mjs
 *
 * Seeds the `suppliers/` root collection in Firestore with known supplier data.
 * Safe to run multiple times — uses setDoc with merge: true (upsert).
 *
 * Usage:
 *   node scripts/seedSuppliers.mjs
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or firebase-admin initialized via serviceAccount.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }        from 'fs';
import { fileURLToPath }       from 'url';
import { dirname, join }       from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Init Firebase Admin ───────────────────────────────────────────────────────
const serviceAccountPath = join(__dirname, '../serviceAccount.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch {
  console.error('[seedSuppliers] serviceAccount.json not found at', serviceAccountPath);
  console.error('Export it from Firebase Console → Project settings → Service accounts');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// ── Supplier data ─────────────────────────────────────────────────────────────
// Add or edit suppliers here. supplierId becomes the Firestore doc id.

const SUPPLIERS = [
  {
    supplierId:      'sup_peptide_sciences',
    name:            'Peptide Sciences',
    shortName:       'PS',
    country:         'US',
    tier:            'premium',
    certifications:  ['GMP'],
    leadTimeDays:    { min: 2, max: 5 },
    minimumOrderUSD: 200,
    isActive:        true,
    notes:           '',
  },
  {
    supplierId:      'sup_biotech_peptides',
    name:            'Biotech Peptides',
    shortName:       'BP',
    country:         'US',
    tier:            'standard',
    certifications:  ['GMP'],
    leadTimeDays:    { min: 3, max: 7 },
    minimumOrderUSD: 150,
    isActive:        true,
    notes:           '',
  },
  {
    supplierId:      'sup_swiss_chems',
    name:            'Swiss Chems',
    shortName:       'SC',
    country:         'US',
    tier:            'standard',
    certifications:  [],
    leadTimeDays:    { min: 3, max: 7 },
    minimumOrderUSD: 100,
    isActive:        true,
    notes:           '',
  },
  {
    supplierId:      'sup_liminal',
    name:            'Limitless Life Nootropics',
    shortName:       'LLN',
    country:         'US',
    tier:            'standard',
    certifications:  [],
    leadTimeDays:    { min: 3, max: 10 },
    minimumOrderUSD: 100,
    isActive:        true,
    notes:           '',
  },
  {
    supplierId:      'sup_internal',
    name:            'Internal / Compounded',
    shortName:       'INT',
    country:         'ES',
    tier:            'premium',
    certifications:  ['GMP', 'EU-GMP'],
    leadTimeDays:    { min: 1, max: 3 },
    minimumOrderUSD: 0,
    isActive:        true,
    notes:           'Internal compounding or EU pharmacy partner',
  },
];

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const batch = db.batch();

  for (const supplier of SUPPLIERS) {
    const { supplierId, ...data } = supplier;
    const ref = db.collection('suppliers').doc(supplierId);
    batch.set(ref, {
      ...data,
      supplierId,
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }, { merge: true });
    console.log(`  ✓ Queued: ${supplierId} (${data.name})`);
  }

  await batch.commit();
  console.log(`\n✅ Seeded ${SUPPLIERS.length} suppliers to Firestore.`);
}

seed().catch((err) => {
  console.error('[seedSuppliers] Error:', err);
  process.exit(1);
});
