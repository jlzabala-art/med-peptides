const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const keyPath = path.resolve(__dirname, '../serviceAccountKey.json');

if (fs.existsSync(keyPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(require(keyPath)),
  });
} else {
  admin.initializeApp();
}

// Los 7 Goals + Research
const CANONICAL_GOALS = [
  'Metabolic & Weight',
  'Recovery & Repair',
  'Longevity & Anti-Aging',
  'Cognitive & Mood',
  'Hormonal Optimization',
  'Sleep & Circadian',
  'Immune Support',
  'Research Supplies',
  'Other' // Fallback
];

function mapToGoal(rawCat) {
  if (!rawCat) return 'Other';
  const rawLower = rawCat.toLowerCase();
  
  // Strict match
  if (CANONICAL_GOALS.includes(rawCat)) return rawCat;
  
  // Keyword mapping
  if (rawLower.includes('metabolic') || rawLower.includes('weight')) return 'Metabolic & Weight';
  if (rawLower.includes('recovery') || rawLower.includes('repair') || rawLower.includes('healing')) return 'Recovery & Repair';
  if (rawLower.includes('longevity') || rawLower.includes('aging')) return 'Longevity & Anti-Aging';
  if (rawLower.includes('cognitive') || rawLower.includes('mood') || rawLower.includes('neuro')) return 'Cognitive & Mood';
  if (rawLower.includes('sleep') || rawLower.includes('circadian')) return 'Sleep & Circadian';
  if (rawLower.includes('immune') || rawLower.includes('anti-inflam') || rawLower.includes('antioxidant')) return 'Immune Support';
  if (rawLower.includes('hormon') || rawLower.includes('growth')) return 'Hormonal Optimization';
  if (rawLower.includes('supply') || rawLower.includes('supplies') || rawLower.includes('diagnostic') || rawLower.includes('testing')) return 'Research Supplies';
  if (rawLower.includes('amino acid') || rawLower.includes('vitamin') || rawLower.includes('adaptogen')) return 'Other';
  
  return 'Other';
}

async function migrateCollection(collectionName) {
  const db = admin.firestore();
  console.log(`\n--- Migrating collection: ${collectionName} ---`);
  const snapshot = await db.collection(collectionName).get();
  
  if (snapshot.empty) {
    console.log(`Collection ${collectionName} is empty.`);
    return;
  }

  const batch = db.batch();
  let updatedCount = 0;
  let batchCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const currentCat = data.category || data.Category;
    
    if (currentCat) {
      const newGoal = mapToGoal(currentCat);
      
      // We keep the old category as "original_category" just in case we need it later
      if (newGoal !== currentCat) {
        batch.update(doc.ref, { 
          category: newGoal,
          original_category: currentCat
        });
        updatedCount++;
        batchCount++;
      }
    }
  });

  if (batchCount > 0) {
    await batch.commit();
    console.log(`✅ Successfully updated ${updatedCount} documents in ${collectionName} to use the 7 core goals.`);
  } else {
    console.log(`No documents needed updating in ${collectionName}.`);
  }
}

async function runMigration() {
  await migrateCollection('products');
  await migrateCollection('protocols');
  await migrateCollection('supplements');
  console.log('\nMigration complete!');
}

runMigration().catch(console.error).then(() => process.exit(0));
