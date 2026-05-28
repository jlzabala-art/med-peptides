/**
 * One-time migration: disable KnowledgeHubShowcase in Firestore config/homeLayout
 * Run with: node scripts/disable-knowledge-hub.mjs
 */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Try to load service account from well-known paths
let serviceAccount;
const candidates = [
  resolve(__dirname, '../serviceAccountKey.json'),
  resolve(__dirname, '../.serviceAccountKey.json'),
];

for (const p of candidates) {
  try {
    serviceAccount = JSON.parse(readFileSync(p, 'utf8'));
    console.log(`✅ Loaded service account from: ${p}`);
    break;
  } catch { /* not found */ }
}

if (!serviceAccount) {
  console.error('❌ No service account key found. Place serviceAccountKey.json in the project root.');
  process.exit(1);
}

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const SECTION_ID = 'KnowledgeHubShowcase';
const docRef    = db.collection('config').doc('homeLayout');

async function run() {
  const snap = await docRef.get();
  if (!snap.exists) {
    console.error('❌ config/homeLayout document does not exist in Firestore.');
    process.exit(1);
  }

  const data = snap.data();
  let changed = false;

  for (const audience of ['guest', 'professional']) {
    const sections = data[audience] ?? [];
    const updated  = sections.map(s => {
      if (s.id === SECTION_ID && s.enabled !== false) {
        changed = true;
        console.log(`  [${audience}] ${SECTION_ID}: enabled true → false`);
        return { ...s, enabled: false };
      }
      return s;
    });
    data[audience] = updated;
  }

  if (!changed) {
    console.log(`ℹ️  ${SECTION_ID} is already disabled in all audiences. Nothing to do.`);
    return;
  }

  await docRef.update({
    guest:        data.guest,
    professional: data.professional,
    updatedAt:    new Date(),
    updatedBy:    'script:disable-knowledge-hub',
  });

  console.log(`✅ Firestore updated — ${SECTION_ID} is now disabled for all audiences.`);
}

run().catch(err => { console.error(err); process.exit(1); });
