import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'serviceAccountKey.json'), 'utf-8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Map common raw goals or categories to clean canonical strings
function getCanonicalGoal(p) {
  const raw = p.primary_goal || p.goal || (Array.isArray(p.goals) && p.goals[0]) || p.executiveSummary?.goal || p.categoryId || p.category || p.therapeutic_category;
  if (!raw) return 'Tissue Repair & Recovery';
  return String(raw).trim();
}

function getCanonicalCategory(p, canonicalGoal) {
  const raw = p.therapeutic_category || p.category || p.categoryId || canonicalGoal;
  if (!raw) return 'Regenerative';
  return String(raw).trim();
}

async function migrateProtocols() {
  console.log('Fetching all protocol documents via Admin SDK...');
  const snap = await db.collection('protocols').get();
  console.log(`Found ${snap.docs.length} protocols to standardize.`);

  let batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const canonicalGoal = getCanonicalGoal(data);
    const canonicalCategory = getCanonicalCategory(data, canonicalGoal);
    const goalsArray = Array.isArray(data.goals) && data.goals.length > 0
      ? data.goals
      : [canonicalGoal];

    const updates = {
      primary_goal: canonicalGoal,
      goal: canonicalGoal,
      goals: goalsArray,
      therapeutic_category: canonicalCategory,
      category: canonicalCategory,
      categoryId: data.categoryId || canonicalCategory,
      version_number: data.version_number || data.protocol_version || data.version || 1,
      name: data.name || data.title || data.protocol_name || 'Unnamed Protocol',
      updatedAt: new Date().toISOString(),
    };

    batch.update(d.ref, updates);
    count++;
    batchCount++;

    if (batchCount >= 400) {
      await batch.commit();
      batch = db.batch();
      batchCount = 0;
      console.log(`Committed batch. Total updated: ${count}...`);
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`Successfully migrated and standardized ${count} protocols in Firestore!`);
}

migrateProtocols().catch(console.error);
