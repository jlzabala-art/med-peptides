/**
 * upload-energy-bundle.js
 * Uploads enhanced_protocols_bundle_energy.json to Firestore (blueprints collection).
 * Handles both flat format (energy_001) and data-wrapped format (energy_002.data).
 * Usage: node scripts/upload-energy-bundle.js
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const filePath = resolve(__dirname, '../protocol-exports/enhanced_protocols_bundle_energy.json');

const bundle = JSON.parse(readFileSync(filePath, 'utf-8'));

if (!getApps().length) {
  initializeApp({ projectId: 'Med-Peptides-app' });
}

const db = getFirestore();

function normalizeProtocol(id, raw) {
  // Some entries wrap actual data under a `.data` key
  const proto = (raw.data && typeof raw.data === 'object') ? { ...raw.data } : { ...raw };
  // Ensure protocol_id is set
  if (!proto.protocol_id) proto.protocol_id = id;
  // Remove meta-only fields not needed in Firestore
  delete proto.missing_fields;
  return proto;
}

async function upload() {
  const protocolsMap = bundle.protocols;
  if (!protocolsMap || typeof protocolsMap !== 'object') {
    console.error('❌ No protocols map found in bundle.');
    process.exit(1);
  }

  const entries = Object.entries(protocolsMap);
  console.log(`\n📦  Bundle: ${bundle.bundleName}`);
  console.log(`🔢  Protocols to upload: ${entries.length}\n`);

  let success = 0;
  let failed = 0;

  for (const [id, raw] of entries) {
    const protocol = normalizeProtocol(id, raw);
    try {
      const ref = db.collection('blueprints').doc(protocol.protocol_id);
      await ref.set(protocol, { merge: true });
      console.log(`  ✅  ${protocol.protocol_id}`);
      success++;
    } catch (err) {
      console.error(`  ❌  ${id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✨  Done — ${success} uploaded, ${failed} failed.`);
}

upload().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
