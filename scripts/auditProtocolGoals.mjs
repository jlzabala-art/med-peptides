import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Use service account from the root
const serviceAccountPath = path.resolve('serviceAccount-target.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const NORMALIZED_GOALS = [
  'metabolic_weight',
  'recovery_repair',
  'cognitive_mood',
  'sleep_circadian',
  'longevity_anti_aging',
  'hormonal_optimization',
  'immune_support'
];

async function auditGoals() {
  console.log('--- Protocol Goal Audit ---');
  const snap = await db.collection('protocols').get();
  const counts = {};
  const invalidProtocols = [];

  snap.forEach(doc => {
    const data = doc.data();
    const goal = data.metadata?.primary_goal || data.primary_goal || 'none';
    counts[goal] = (counts[goal] || 0) + 1;

    if (!NORMALIZED_GOALS.includes(goal)) {
      invalidProtocols.push({
        id: doc.id,
        title: data.protocol_title || data.title || doc.id,
        goal: goal
      });
    }
  });

  console.log('\nGoal Counts:');
  console.table(counts);

  if (invalidProtocols.length > 0) {
    console.log('\nProtocols with non-normalized goals:');
    console.table(invalidProtocols);
  } else {
    console.log('\nAll protocols are normalized!');
  }
}

auditGoals().catch(console.error);
