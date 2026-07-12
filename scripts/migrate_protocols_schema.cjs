const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function runMigration() {
  console.log("Starting protocol schema migration...");
  const snapshot = await db.collection('protocols').get();
  
  let migratedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let updates = {};
    let needsUpdate = false;
    
    // 1. Normalize Names
    if (!data.protocol_name && data.name) {
      updates.protocol_name = data.name;
      updates.name = FieldValue.delete();
      needsUpdate = true;
    } else if (data.protocol_name && data.name) {
      updates.name = FieldValue.delete();
      needsUpdate = true;
    }

    // 2. Normalize Categories
    if (!data.therapeutic_category && data.category) {
      updates.therapeutic_category = data.category;
      updates.category = FieldValue.delete();
      needsUpdate = true;
    } else if (data.therapeutic_category && data.category) {
      updates.category = FieldValue.delete();
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      try {
        await doc.ref.update(updates);
        console.log(`Migrated protocol: ${doc.id}`);
        migratedCount++;
      } catch (err) {
        console.error(`Failed to migrate protocol ${doc.id}:`, err);
      }
    }
  }
  
  console.log(`Migration complete. Standardized ${migratedCount} protocols.`);
}

runMigration().catch(console.error);
