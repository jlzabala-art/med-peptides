/**
 * scripts/algoliaSyncPrescriptions.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Configures `prescriptions` index settings, clinical galenic/test synonyms,
 * and reindexes all Firestore prescriptions using `formatPrescriptionRecord`.
 *
 * Usage:
 *   node scripts/algoliaSyncPrescriptions.mjs
 */
import admin from 'firebase-admin';
import { algoliasearch } from 'algoliasearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { formatPrescriptionRecord } from '../src/services/algoliaSyncService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  try {
    const svc = require(path.resolve(__dirname, '../serviceAccountKey.json'));
    admin.initializeApp({ credential: admin.credential.cert(svc) });
  } catch {
    admin.initializeApp();
  }
}

const db = admin.firestore();
const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
const adminKey = process.env.ALGOLIA_ADMIN_KEY;

if (!adminKey) {
  console.error('❌ Missing ALGOLIA_ADMIN_KEY in environment/.env.local');
  process.exit(1);
}

const client = algoliasearch(appId, adminKey);
const INDEX_NAME = 'prescriptions';

const CLINICAL_SYNONYMS = [
  { objectID: 'syn-nasal-spray', type: 'synonym', synonyms: ['nasal spray', 'intranasal', 'spray nasal', 'nasal_spray'] },
  { objectID: 'syn-prefilled-pen', type: 'synonym', synonyms: ['prefilled_pen', 'pre-filled pen', 'pluma precargada', 'multi-dose pen', 'cartridge'] },
  { objectID: 'syn-transdermal-cream', type: 'synonym', synonyms: ['pentravan', 'transdermal_cream', 'transdermal cream', 'liposomal cream'] },
  { objectID: 'syn-trichotest', type: 'synonym', synonyms: ['trichotest', 'aatri'] },
  { objectID: 'syn-telotest', type: 'synonym', synonyms: ['telotest', 'aatel'] },
  { objectID: 'syn-acnetest', type: 'synonym', synonyms: ['acnetest', 'aaacn'] },
  { objectID: 'syn-nutrigen', type: 'synonym', synonyms: ['nutrigen', 'aanut'] },
];

async function main() {
  console.log(`Configuring Algolia index "${INDEX_NAME}" settings & synonyms...`);
  await client.setSettings({
    indexName: INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        'code',
        'rxCode',
        'prescriptionCode',
        'fileNumber',
        'batchCode',
        'dispensingBatch',
        'patientName',
        'doctorName',
        'clinicName',
        'treatmentTitle',
        'searchableItems',
        'dispensingForm',
        'testType',
        'testName',
      ],
      attributesForFaceting: [
        'filterOnly(status)',
        'filterOnly(isPrinted)',
        'searchable(dispensingForm)',
        'searchable(testType)',
        'searchable(clinicName)',
        'searchable(doctorName)',
      ],
      customRanking: ['desc(createdAt_ts)'],
    },
  });

  await client.saveSynonyms({
    indexName: INDEX_NAME,
    synonymHit: CLINICAL_SYNONYMS,
    replaceExistingSynonyms: false,
  });

  console.log('Fetching prescriptions from Firestore...');
  const snap = await db.collection('prescriptions').get();
  const records = snap.docs.map((d) => formatPrescriptionRecord(d.id, d.data() || {}));

  console.log(`Uploading ${records.length} homogenized prescription records to Algolia...`);
  await client.saveObjects({
    indexName: INDEX_NAME,
    objects: records,
  });

  const statusCounts = records.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.log(`✅ Reindexed ${records.length} prescriptions to Algolia "${INDEX_NAME}".`);
  console.log('Status breakdown:', statusCounts);
}

main().catch((err) => {
  console.error('❌ Failed to sync prescriptions to Algolia:', err);
  process.exit(1);
});
