/**
 * import_protocols_v2.js
 * Imports the antigravity_v2 protocol bundle into Firestore.
 * Usage: node scripts/import_protocols_v2.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// ── Config ─────────────────────────────────────────────────────────────────
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
const BUNDLE_PATH           = path.resolve(__dirname, '../export/protocol_import_bundle_antigravity_v2.json');
const COLLECTION            = 'protocols';
// ────────────────────────────────────────────────────────────────────────────

// Init
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// Load bundle
const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'));
const protocols = bundle.protocols;

if (!Array.isArray(protocols) || protocols.length === 0) {
  console.error('❌  No protocols found in bundle.');
  process.exit(1);
}

console.log(`\n📦  Bundle: ${bundle.bundle_name}`);
console.log(`🗓️   Created: ${bundle.created_at}`);
console.log(`📋  Protocols to import: ${protocols.length}`);
console.log('─'.repeat(60));

async function importProtocols() {
  let successCount = 0;
  let errorCount   = 0;

  for (const protocol of protocols) {
    const protocolId = protocol.protocol_id;
    if (!protocolId) {
      console.warn('⚠️   Skipping protocol without protocol_id:', JSON.stringify(protocol).slice(0, 80));
      errorCount++;
      continue;
    }

    try {
      const docRef = db.collection(COLLECTION).doc(protocolId);

      // Add import metadata
      const dataToWrite = {
        ...protocol,
        _importedAt:      admin.firestore.FieldValue.serverTimestamp(),
        _importBundle:    bundle.bundle_name,
        _schemaVersion:   bundle.schema_version,
        _bundleCreatedAt: bundle.created_at,
      };

      await docRef.set(dataToWrite, { merge: true });

      console.log(`  ✅  ${protocolId.padEnd(15)}  →  ${protocol.metadata?.shortCode || ''} | ${protocol.protocol_title || ''}`);
      successCount++;
    } catch (err) {
      console.error(`  ❌  ${protocolId} — ERROR: ${err.message}`);
      errorCount++;
    }
  }

  console.log('─'.repeat(60));
  console.log(`\n✔️   Done — ${successCount} imported, ${errorCount} failed.\n`);
}

importProtocols()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
