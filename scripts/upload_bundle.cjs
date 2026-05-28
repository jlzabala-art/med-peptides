#!/usr/bin/env node
/**
 * upload_bundle.cjs
 * Uploads all protocols from the enhanced bundle JSON to Firestore (protocols collection).
 * Uses the Admin SDK via ADC (Application Default Credentials).
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const BUNDLE_PATH = path.join(__dirname, '../export/enhanced_protocols_bundle_cog_energy_horm.json');
const COLLECTION = 'protocols';
const PROJECT_ID = 'Med-Peptides-app';

// Initialize with project ID — uses ADC (firebase CLI token)
if (!admin.apps.length) {
  admin.initializeApp({ projectId: PROJECT_ID });
}

const db = admin.firestore();

async function main() {
  const raw = fs.readFileSync(BUNDLE_PATH, 'utf8');
  const bundle = JSON.parse(raw);
  const protocols = bundle.protocols;

  console.log(`\n📦 Bundle: ${bundle._bundleType} v${bundle._schemaVersion}`);
  console.log(`📋 Protocols to upload: ${protocols.length}\n`);

  let success = 0;
  let errors = 0;

  for (const protocol of protocols) {
    const docId = protocol.protocol_id;
    if (!docId) {
      console.warn('⚠️  Skipping protocol with no protocol_id:', Object.keys(protocol).slice(0, 4));
      errors++;
      continue;
    }

    try {
      await db.collection(COLLECTION).doc(docId).set(protocol, { merge: true });
      const name = protocol.metadata?.name || protocol.generated_protocol_template?.title || docId;
      console.log(`✅ ${docId} — "${name}"`);
      success++;
    } catch (err) {
      console.error(`❌ Failed to upload ${docId}:`, err.message);
      errors++;
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Uploaded: ${success}`);
  console.log(`❌ Errors:   ${errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  process.exit(errors > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
