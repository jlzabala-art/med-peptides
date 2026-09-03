import { adminDb } from './src/lib/firebaseAdmin.js';
import { CLINICAL_GOALS } from './src/config/goals.js';

const categoryToGoalMap = {
  'Recovery': 'recovery',
  'Sleep': 'sleep',
  'Metabolism': 'metabolism',
  'Longevity': 'longevity',
  'Sexual Health': 'sexual_health',
  'Cognitive Health': 'cognitive_health',
  'Growth Hormone': 'growth_hormone',
  'Immune Support': 'immune_support',
  'Aesthetics': 'aesthetics',
  'Cardiac Health': 'cardiac_health'
};

async function migrateCollection(collectionName) {
  console.log(`Migrating ${collectionName}...`);
  const snapshot = await adminDb.collection(collectionName).get();
  const batch = adminDb.batch();
  let updatedCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    let legacyCategory = data.therapeutic_category || data.category;
    let goalIds = Array.isArray(data.goalIds) ? data.goalIds : [];

    if (legacyCategory && typeof legacyCategory === 'string') {
      // Find mapping
      const mappedId = categoryToGoalMap[legacyCategory];
      if (mappedId && !goalIds.includes(mappedId)) {
        goalIds.push(mappedId);
      }
    }

    if (goalIds.length > 0) {
      batch.update(doc.ref, { goalIds });
      updatedCount++;
    }
  });

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`Successfully migrated ${updatedCount} documents in ${collectionName}.`);
  } else {
    console.log(`No documents needed migration in ${collectionName}.`);
  }
}

async function main() {
  try {
    await migrateCollection('protocols');
    await migrateCollection('products');
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  }
}

main();
