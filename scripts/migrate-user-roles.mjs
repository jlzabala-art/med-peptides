/**
 * One-time migration script: assign role:'pending' to all Firestore users missing a role.
 *
 * Usage (from project root):
 *   node scripts/migrate-user-roles.mjs
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON, OR
 *   - Run inside a Firebase Admin context (e.g. Cloud Functions shell)
 *
 * Install peer deps if needed:
 *   npm install firebase-admin
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Bootstrap ───────────────────────────────────────────────────────────────
if (!getApps().length) {
  initializeApp(); // uses GOOGLE_APPLICATION_CREDENTIALS automatically
}
const db = getFirestore();

// ─── Migration ───────────────────────────────────────────────────────────────
async function migrateUserRoles() {
  const usersRef = db.collection('users');
  const snapshot = await usersRef.get();

  let updated = 0;
  let skipped = 0;
  const batch = db.batch();

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.role) {
      batch.update(docSnap.ref, { role: 'pending' });
      updated++;
      console.log(`  → Queuing update for uid: ${docSnap.id} (had no role)`);
    } else {
      skipped++;
    }
  });

  if (updated > 0) {
    await batch.commit();
    console.log(`\n✅ Migration complete: ${updated} users updated, ${skipped} already had a role.`);
  } else {
    console.log(`\n✅ No migration needed: all ${skipped} users already have a role.`);
  }
}

migrateUserRoles().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
