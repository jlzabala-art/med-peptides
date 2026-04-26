/**
 * assignUserRoles.mjs
 *
 * Admin script to seed or update Firestore user role assignments.
 * Run with:  node scripts/assignUserRoles.mjs
 *
 * Requires:  serviceAccountKey.json in project root (never commit this file).
 *
 * Firestore path: users/{uid}
 * Fields updated: role, approved, updatedAt
 *
 * Pricing tier mapping (see src/hooks/usePricingTier.js):
 *   admin            → masterPrice   (full cost visibility)
 *   clinic           → clinicPrice   (institutional rate)
 *   pharmacy         → clinicPrice
 *   verified_medical → wholesalePrice (professional discount)
 *   distributor      → wholesalePrice
 *   researcher       → retailPrice   (standard public)
 *   guest (no login) → retailPrice   (highest price)
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Firebase Admin Init ────────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync(new URL('../serviceAccountKey.json', import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'med-peptides-app',
});

const db = getFirestore();

// ── Role Definitions ──────────────────────────────────────────────────────────
// Add entries below to assign or update roles.
// uid: Firebase Auth UID (find in Firebase Console → Authentication)
// role: must match ROLE_TO_TIER keys in usePricingTier.js

const USER_ROLE_ASSIGNMENTS = [
  // ── Admin accounts ─────────────────────────────────────────────────────────
  // { uid: 'REPLACE_WITH_ADMIN_UID', role: 'admin',            approved: true,  note: 'Platform admin' },

  // ── Clinic accounts ────────────────────────────────────────────────────────
  // { uid: 'REPLACE_WITH_CLINIC_UID', role: 'clinic',          approved: true,  note: 'Demo clinic account' },

  // ── Pharmacy accounts ──────────────────────────────────────────────────────
  // { uid: 'REPLACE_WITH_PHARMACY_UID', role: 'pharmacy',      approved: true,  note: 'Demo pharmacy' },

  // ── Verified medical professionals ─────────────────────────────────────────
  // { uid: 'REPLACE_WITH_DOCTOR_UID', role: 'verified_medical', approved: true, note: 'Dr. Example' },

  // ── Distributors / resellers ───────────────────────────────────────────────
  // { uid: 'REPLACE_WITH_DIST_UID',  role: 'distributor',      approved: true,  note: 'EU distributor' },

  // ── Standard researchers ───────────────────────────────────────────────────
  // { uid: 'REPLACE_WITH_RES_UID',   role: 'researcher',       approved: false, note: 'Pending review' },
];

// ── Pricing tier legend (for operator reference) ──────────────────────────────
const TIER_LEGEND = {
  admin:            'masterPrice   — supplier cost (admin eyes only)',
  clinic:           'clinicPrice   — institutional rate',
  pharmacy:         'clinicPrice   — institutional rate',
  verified_medical: 'wholesalePrice — professional discount',
  professional:     'wholesalePrice — professional discount',
  distributor:      'wholesalePrice — reseller rate',
  researcher:       'retailPrice   — standard public price',
  guest:            'retailPrice   — standard public price (not logged in)',
};

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (USER_ROLE_ASSIGNMENTS.length === 0) {
    console.log('\n⚠️  No role assignments defined.');
    console.log('   Edit the USER_ROLE_ASSIGNMENTS array in this file to assign roles.\n');
    console.log('Available roles and their pricing tiers:');
    Object.entries(TIER_LEGEND).forEach(([role, desc]) => {
      console.log(`  • ${role.padEnd(18)} → ${desc}`);
    });
    process.exit(0);
  }

  const batch = db.batch();
  let count = 0;

  for (const { uid, role, approved, note } of USER_ROLE_ASSIGNMENTS) {
    if (!uid || uid.startsWith('REPLACE_WITH')) {
      console.warn(`  ⏭ Skipping placeholder entry (uid="${uid}")`);
      continue;
    }

    const ref = db.collection('users').doc(uid);
    batch.set(ref, {
      role,
      approved: approved ?? false,
      updatedAt: new Date().toISOString(),
      ...(note ? { _adminNote: note } : {}),
    }, { merge: true }); // merge: true preserves existing fields (email, fullName, etc.)

    console.log(`  ✅ Queued: uid=${uid} → role=${role} | approved=${approved} | ${TIER_LEGEND[role] ?? 'unknown tier'}`);
    count++;
  }

  if (count === 0) {
    console.log('\n⚠️  No valid UIDs to write. Exiting without changes.\n');
    process.exit(0);
  }

  await batch.commit();
  console.log(`\n🎉 Successfully wrote ${count} role assignment(s) to Firestore (med-peptides-app).\n`);
}

main().catch((err) => {
  console.error('\n❌ Script failed:', err.message);
  process.exit(1);
});
