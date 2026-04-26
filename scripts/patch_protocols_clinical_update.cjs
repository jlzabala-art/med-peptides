/**
 * patch_protocols_clinical_update.cjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads the enriched clinical-update bundle and MERGES each protocol into
 * the Firestore `protocols` collection (non-destructive: only adds/overwrites
 * the fields present in the file, leaves everything else untouched).
 *
 * Usage: node scripts/patch_protocols_clinical_update.cjs
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

// ── Config ───────────────────────────────────────────────────────────────────
const SA_PATH     = path.resolve(__dirname, '../med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
const BUNDLE_PATH = path.resolve(__dirname, '../export/protocols/regen_pept_protocols_clinical_update_2026-04-26.json');
const COLLECTION  = 'protocols';
// ─────────────────────────────────────────────────────────────────────────────

// Init Firebase
const serviceAccount = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

// Load bundle
let bundle;
try {
  bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'));
} catch (e) {
  console.error('❌  Could not read bundle:', e.message);
  process.exit(1);
}

const protocols = bundle.protocols;
if (!Array.isArray(protocols) || protocols.length === 0) {
  console.error('❌  No protocols array found in bundle.');
  process.exit(1);
}

console.log(`\n📦  Bundle  : ${bundle.bundle_name}`);
console.log(`🗓️   Exported: ${bundle.exported_at}`);
console.log(`📋  Protocols to patch: ${protocols.length}`);
console.log('─'.repeat(66));

// ── Strip null/undefined recursively (clean merge payload) ───────────────────
function deepClean(obj) {
  if (Array.isArray(obj)) return obj.map(deepClean).filter(v => v !== null && v !== undefined);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k, deepClean(v)])
    );
  }
  return obj;
}

async function patchProtocols() {
  let ok = 0, fail = 0;

  for (const protocol of protocols) {
    // Resolve document ID — prefer protocol_id, fall back to id
    const docId = protocol.protocol_id || protocol.id;
    if (!docId) {
      console.warn('⚠️   Skipping entry without id / protocol_id');
      fail++;
      continue;
    }

    const payload = deepClean({
      ...protocol,
      _patchedAt    : admin.firestore.FieldValue.serverTimestamp(),
      _patchBundle  : bundle.bundle_name,
      _patchSchema  : bundle.schema_version,
    });

    try {
      await db.collection(COLLECTION).doc(docId).set(payload, { merge: true });
      const code  = protocol.metadata?.shortCode || '';
      const title = protocol.protocol_title || protocol.metadata?.abbreviatedName || '';
      console.log(`  ✅  ${docId.padEnd(14)}  ${code.padEnd(10)}  ${title}`);
      ok++;
    } catch (err) {
      console.error(`  ❌  ${docId} — ${err.message}`);
      fail++;
    }
  }

  console.log('─'.repeat(66));
  console.log(`\n✔️   Done — ${ok} patched, ${fail} failed.\n`);
}

patchProtocols()
  .then(() => process.exit(0))
  .catch(e => { console.error('Fatal:', e); process.exit(1); });
