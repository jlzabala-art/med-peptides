/**
 * upload-bundle.js
 * Usage: node scripts/upload-bundle.js <path-to-bundle-json>
 * Uploads all protocols from a bundle JSON to Firestore blueprints collection.
 */
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/upload-bundle.js <path-to-bundle-json>');
  process.exit(1);
}

const filePath = resolve(args[0]);
const bundle = JSON.parse(readFileSync(filePath, 'utf-8'));

// Support bundle.protocols as array OR object (key → protocol)
let protocols;
if (Array.isArray(bundle.protocols)) {
  protocols = bundle.protocols;
} else if (bundle.protocols && typeof bundle.protocols === 'object') {
  // Object map: { "sa_001": { ... }, "skin_001": { ... } }
  protocols = Object.entries(bundle.protocols).map(([id, proto]) => ({
    protocol_id: proto.protocol_id ?? id,
    ...proto,
  }));
} else {
  protocols = [bundle];
}

if (!protocols.length) {
  console.error('ERROR: No protocols found in JSON.');
  process.exit(1);
}

if (!getApps().length) {
  initializeApp({ projectId: 'Med-Peptides-app' });
}

const db = getFirestore();

async function uploadBundle() {
  console.log(`\n📦 Bundle: ${bundle.description || filePath}`);
  console.log(`🔢 Protocols to upload: ${protocols.length}\n`);

  let success = 0;
  let failed = 0;

  for (const protocol of protocols) {
    const { protocol_id } = protocol;
    if (!protocol_id) {
      console.warn('⚠️  Skipping protocol without protocol_id');
      failed++;
      continue;
    }
    try {
      const ref = db.collection('blueprints').doc(protocol_id);
      await ref.set(protocol, { merge: false });
      console.log(`  ✅ ${protocol_id}`);
      success++;
    } catch (err) {
      console.error(`  ❌ ${protocol_id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✨ Done — ${success} uploaded, ${failed} failed.`);
}

uploadBundle().catch((err) => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
