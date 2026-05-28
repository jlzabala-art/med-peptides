'use strict';
/**
 * export_protocols_clean.cjs
 * Exports all 25 protocols from Firestore as a clean JSON file.
 * Output: export/protocols_all.json
 */

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

const SA_PATH = path.resolve(__dirname, '../Med-Peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json');
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(SA_PATH, 'utf8'))) });
const db = admin.firestore();

const OUT_DIR  = path.resolve(__dirname, '../export');
const OUT_FILE = path.join(OUT_DIR, 'protocols_all.json');

async function run() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log('\nFetching all protocols from Firestore…');
  const snap = await db.collection('protocols').get();
  console.log(`Found ${snap.size} protocols.\n`);

  // Sort by document ID for readability
  const sorted = snap.docs.sort((a, b) => a.id.localeCompare(b.id));

  const output = {
    exported_at: new Date().toISOString(),
    total: snap.size,
    protocols: {}
  };

  sorted.forEach(doc => {
    output.protocols[doc.id] = { id: doc.id, ...doc.data() };
    console.log(`  ✓  ${doc.id.padEnd(20)} | ${(doc.data().category || 'NO-CATEGORY').padEnd(35)} | ${doc.data().metadata?.shortCode || 'NO-CODE'}`);
  });

  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  const sizeKB = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`\n✅  Exported to: export/protocols_all.json  (${sizeKB} KB)\n`);

  await admin.app().delete();
}

run().catch(err => { console.error(err); process.exit(1); });
