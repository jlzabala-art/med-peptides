/**
 * migrate-users-to-wholesellers.mjs
 *
 * Script de migración ONE-TIME:
 *   users (role = 'wholeseller') → wholesellers/{id}
 *
 * El documento en `users` NO se modifica (auth no cambia).
 * Se crea un documento espejo en `wholesellers` con referencia al userId.
 *
 * Uso:
 *   node scripts/migrate-users-to-wholesellers.mjs [--dry-run]
 *
 * Flags:
 *   --dry-run   Muestra qué haría, sin escribir nada en Firestore
 *   --force     Re-crea el documento aunque ya exista en `wholesellers`
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

// ── Init Firebase Admin ───────────────────────────────────────────────────────
if (!getApps().length) {
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountPath) throw new Error('GOOGLE_APPLICATION_CREDENTIALS env var not set');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE   = process.argv.includes('--force');

console.log('='.repeat(60));
console.log(' MIGRATION: users(role=wholeseller) → wholesellers collection');
console.log(`  Mode: ${DRY_RUN ? '🟡 DRY RUN (no writes)' : '🔴 LIVE'}`);
console.log('='.repeat(60));
console.log();

async function main() {
  // 1. Find all users with role='wholeseller'
  const usersSnap = await db.collection('users')
    .where('role', '==', 'wholeseller')
    .get();

  console.log(`Found ${usersSnap.size} users with role='wholeseller'\n`);

  let created = 0;
  let skipped = 0;
  let errors  = 0;

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data();
    const userId = userDoc.id;

    // Build wholeseller document
    const wholesellerData = {
      // Identity
      companyName: userData.companyName || userData.clinicName || userData.displayName || userData.fullName || '',
      contactEmail: userData.email || '',
      contactPhone: userData.phone || '',
      contactPerson: userData.displayName || userData.fullName || [userData.firstName, userData.lastName].filter(Boolean).join(' ') || '',

      // Link back to Firebase Auth user
      userId: userId,

      // Address
      country: userData.country || userData.billingCountry || '',
      region: userData.region || '',
      address: userData.address || userData.billingAddress || '',

      // Business
      type: userData.companyType || 'Distributor',
      pricingTier: userData.pricingTier || 'standard',
      taxId: userData.taxId || userData.vatNumber || '',

      // Status
      status: userData.isArchived ? 'archived' : (userData.status || 'active'),

      // Catalog access: empty = full access
      authorizedVariantIds: userData.authorizedVariantIds || [],
      catalogAccessId: userData.catalogAccessId || null,

      // Metadata
      notes: userData.notes || '',
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      migratedFromUsersAt: new Date().toISOString(),
      migratedFromUserId: userId,
    };

    // Check if already exists in wholesellers
    const existingDoc = await db.collection('wholesellers').doc(`ws-${userId}`).get();

    if (existingDoc.exists && !FORCE) {
      console.log(`  ⏭  SKIP  ws-${userId} (${wholesellerData.companyName || userId}) — already exists`);
      skipped++;
      continue;
    }

    console.log(`  ${DRY_RUN ? '🔍 WOULD CREATE' : '✅ CREATING'}  ws-${userId}`);
    console.log(`     companyName : ${wholesellerData.companyName || '(empty)'}`);
    console.log(`     email       : ${wholesellerData.contactEmail}`);
    console.log(`     country     : ${wholesellerData.country || '—'}`);
    console.log(`     status      : ${wholesellerData.status}`);
    console.log();

    if (!DRY_RUN) {
      try {
        await db.collection('wholesellers').doc(`ws-${userId}`).set(wholesellerData, { merge: FORCE });
        created++;
      } catch (err) {
        console.error(`  ❌ ERROR creating ws-${userId}:`, err.message);
        errors++;
      }
    } else {
      created++;
    }
  }

  console.log('='.repeat(60));
  console.log(` SUMMARY`);
  console.log(`  ${DRY_RUN ? 'Would create' : 'Created'} : ${created}`);
  console.log(`  Skipped   : ${skipped}`);
  console.log(`  Errors    : ${errors}`);
  console.log('='.repeat(60));

  if (DRY_RUN) {
    console.log('\n💡 Re-run without --dry-run to apply changes.');
  } else {
    console.log('\n✅ Migration complete. wholesellers collection populated.');
    console.log('   Original users documents are UNCHANGED.');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
