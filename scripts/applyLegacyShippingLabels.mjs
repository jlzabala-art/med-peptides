/**
 * applyLegacyShippingLabels.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Safely backfills ONLY `shippingTitle` on historical prescriptions in Firestore
 * using the verified Legacy Labels table.
 *
 * STRICT SAFETY GUARANTEE:
 *  - Creates a full JSON backup before writing anything.
 *  - NEVER modifies Delivery Label fields (productTitle, productName, dose, instructions).
 *
 * Usage:
 *   node scripts/applyLegacyShippingLabels.mjs --dry-run
 *   node scripts/applyLegacyShippingLabels.mjs --apply
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync } from 'fs';
import { findHistoricalLegacyLabel, patientNamesMatch } from '../src/utils/legacyLabels.js';

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

const db = getFirestore();
const isApply = process.argv.includes('--apply');

async function main() {
  const snap = await db.collection('prescriptions').get();
  console.log(`\n📦 Loaded ${snap.docs.length} prescriptions from Firestore.\n`);

  const backups = [];
  const updates = [];

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const patientName = data.patientName || data.patient?.name || data.patientFullName || '';
    if (!patientName) continue;

    // Inspect multi-item arrays (`items`, `medications`, `products`) or single-item fields
    const arrayKey = Array.isArray(data.items)
      ? 'items'
      : Array.isArray(data.medications)
        ? 'medications'
        : Array.isArray(data.products)
          ? 'products'
          : null;

    if (arrayKey) {
      let changed = false;
      const nextArray = data[arrayKey].map((item) => {
        const rxTitle = item.productTitle || item.productName || item.medicationName || item.name || '';
        const legacyLabel = findHistoricalLegacyLabel(patientName, rxTitle);
        if (!legacyLabel) return item;
        if (item.shippingTitle === legacyLabel) return item;
        changed = true;
        return {
          ...item,
          shippingTitle: legacyLabel,
          legacyShippingApplied: true,
        };
      });

      if (changed) {
        backups.push({ id: docSnap.id, patientName, data });
        updates.push({
          docRef: docSnap.ref,
          id: docSnap.id,
          patientName,
          payload: { [arrayKey]: nextArray },
          summary: nextArray
            .filter((i) => i.legacyShippingApplied)
            .map((i) => `${i.productTitle || i.productName || i.medicationName || i.name} -> ${i.shippingTitle}`),
        });
      }
    } else {
      const rxTitle = data.productTitle || data.productName || data.medicationName || '';
      const legacyLabel = findHistoricalLegacyLabel(patientName, rxTitle);
      if (legacyLabel && data.shippingTitle !== legacyLabel) {
        backups.push({ id: docSnap.id, patientName, data });
        updates.push({
          docRef: docSnap.ref,
          id: docSnap.id,
          patientName,
          payload: { shippingTitle: legacyLabel, legacyShippingApplied: true },
          summary: [`${rxTitle} -> ${legacyLabel}`],
        });
      }
    }
  }

  console.log(`🔍 Matched ${updates.length} prescription(s) with historical Shipping labels:\n`);
  for (const u of updates) {
    console.log(`  • [${u.id}] ${u.patientName}:`);
    for (const s of u.summary) console.log(`      ${s}`);
  }

  if (backups.length > 0) {
    const backupDir = '/Users/joseluiszabala/.gemini/antigravity/brain/c5bb77dc-1727-42d1-9f81-8fe8796cb501/scratch';
    mkdirSync(backupDir, { recursive: true });
    const backupPath = `${backupDir}/legacy_shipping_backup_${Date.now()}.json`;
    writeFileSync(backupPath, JSON.stringify(backups, null, 2), 'utf8');
    console.log(`\n💾 Backup saved safely to: ${backupPath}`);
  }

  if (!isApply) {
    console.log('\nℹ️ Dry-run complete. Re-run with --apply to write ONLY shippingTitle.\n');
    return;
  }

  let appliedCount = 0;
  for (const u of updates) {
    await u.docRef.update(u.payload);
    appliedCount += 1;
  }
  console.log(`\n✅ Updated ONLY shippingTitle on ${appliedCount} prescription(s). Delivery fields were untouched.\n`);
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
