/**
 * homogenizeFirestoreModel.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Safely homogenizes Firestore collections to match AGENTS.md Rule #28
 * and canonical `dispensingForm` keys:
 *  - Creates a full JSON backup of every modified document before writing.
 *  - Preserves original raw `dispensingForm` in `legacyDispensingForm` when normalized.
 *  - NEVER modifies Delivery Label clinical fields (`productTitle`, `dose`, `instructions`).
 *
 * Usage:
 *   node scripts/homogenizeFirestoreModel.mjs --dry-run
 *   node scripts/homogenizeFirestoreModel.mjs --apply
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

if (!getApps().length) {
  try {
    const svc = require(resolve(__dirname, '../serviceAccountKey.json'));
    initializeApp({ credential: cert(svc) });
  } catch {
    initializeApp();
  }
}

import {
  normalizeRxStatus,
  normalizeDoctorStatus,
  normalizePatientStatus,
  normalizeProductStatus,
  resolveCanonicalDispensingForm,
} from '../src/utils/firestoreModelGuard.js';

const db = getFirestore();
const isApply = process.argv.includes('--apply');

async function main() {
  const [rxSnap, patSnap, docSnap, prodSnap] = await Promise.all([
    db.collection('prescriptions').get(),
    db.collection('patients').get(),
    db.collection('doctors').get(),
    db.collection('products').get(),
  ]);

  const backups = [];
  const ops = [];
  const anomalies = [];

  for (const d of rxSnap.docs) {
    const data = d.data();
    const patch = {};

    const nextStatus = normalizeRxStatus(data.status);
    if (nextStatus !== data.status) patch.status = nextStatus;

    const nextForm = resolveCanonicalDispensingForm(data);
    if (data.dispensingForm !== nextForm) {
      if (data.dispensingForm && !data.legacyDispensingForm) {
        patch.legacyDispensingForm = data.dispensingForm;
      }
      patch.dispensingForm = nextForm;
    }

    const pName = data.patientName || data.patient?.name || data.patientFullName || '';
    const items = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.medications)
        ? data.medications
        : Array.isArray(data.products)
          ? data.products
          : [];
    if (!pName.trim() || items.length === 0) {
      anomalies.push({
        id: d.id,
        status: nextStatus,
        missingPatientName: !pName.trim(),
        missingItems: items.length === 0,
        title: data.treatmentTitle || data.title || '',
      });
    }

    if (Object.keys(patch).length > 0) {
      backups.push({ collection: 'prescriptions', id: d.id, data });
      ops.push({ ref: d.ref, collection: 'prescriptions', id: d.id, patch });
    }
  }

  for (const d of patSnap.docs) {
    const data = d.data();
    const nextStatus = normalizePatientStatus(data.status);
    if (nextStatus !== data.status) {
      backups.push({ collection: 'patients', id: d.id, data });
      ops.push({ ref: d.ref, collection: 'patients', id: d.id, patch: { status: nextStatus } });
    }
  }

  for (const d of docSnap.docs) {
    const data = d.data();
    const nextStatus = normalizeDoctorStatus(data.status);
    if (nextStatus !== data.status) {
      backups.push({ collection: 'doctors', id: d.id, data });
      ops.push({ ref: d.ref, collection: 'doctors', id: d.id, patch: { status: nextStatus } });
    }
  }

  for (const d of prodSnap.docs) {
    const data = d.data();
    const nextStatus = normalizeProductStatus(data.status);
    if (nextStatus !== data.status) {
      backups.push({ collection: 'products', id: d.id, data });
      ops.push({ ref: d.ref, collection: 'products', id: d.id, patch: { status: nextStatus } });
    }
  }

  const byCol = ops.reduce((acc, o) => {
    acc[o.collection] = (acc[o.collection] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Homogenization Plan Summary:', JSON.stringify(byCol, null, 2));
  console.log(`⚠️ Orphan / incomplete prescriptions flagged (${anomalies.length}):`);
  for (const a of anomalies) console.log('  -', JSON.stringify(a));

  if (backups.length > 0) {
    const backupDir = '/Users/joseluiszabala/.gemini/antigravity/brain/c5bb77dc-1727-42d1-9f81-8fe8796cb501/scratch';
    mkdirSync(backupDir, { recursive: true });
    const backupPath = `${backupDir}/firestore_homogenize_backup_${Date.now()}.json`;
    writeFileSync(backupPath, JSON.stringify(backups, null, 2), 'utf8');
    console.log(`\n💾 Backup saved safely to: ${backupPath}`);
  }

  if (!isApply) {
    console.log('\nℹ️ Dry-run complete. Re-run with --apply to write updates.\n');
    return;
  }

  // Commit in Firestore batches of 400
  let written = 0;
  for (let i = 0; i < ops.length; i += 400) {
    const batch = db.batch();
    const chunk = ops.slice(i, i + 400);
    for (const op of chunk) {
      batch.update(op.ref, op.patch);
    }
    await batch.commit();
    written += chunk.length;
  }
  console.log(`\n✅ Applied homogenization to ${written} document(s) across Firestore.\n`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
