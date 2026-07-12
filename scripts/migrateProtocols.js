import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse service account
const serviceAccount = JSON.parse(
  readFileSync(resolve('./serviceAccountKey.json'), 'utf8')
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// We need to import the blueprints. Since it's ES module syntax, we'll read the file and eval or import it.
// Actually, I'll just write the import dynamically or copy the object here to be safe.
// Wait, I can just dynamically import the JS file if this script is run with node.

async function migrate() {
  console.log('Loading blueprints...');
  const { PROTOCOL_BLUEPRINTS } = await import('../src/data/protocolBlueprints.js');
  
  const keys = Object.keys(PROTOCOL_BLUEPRINTS);
  console.log(`Found ${keys.length} protocols to check/migrate.`);
  
  let migratedCount = 0;
  
  for (const key of keys) {
    const blueprint = PROTOCOL_BLUEPRINTS[key];
    const docRef = db.collection('protocols').doc(key);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      console.log(`Migrating protocol: ${key}`);
      
      const { phases, clinical_metadata, ...rest } = blueprint;
      
      // Convert array phases into a subcollection (following v5 schema)
      const payload = {
        ...rest,
        protocol_id: key,
        active: true,
        isPublic: true,
        visibility: 'public',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
        source: 'migration',
      };
      
      const batch = db.batch();
      batch.set(docRef, payload);
      
      if (phases && Array.isArray(phases)) {
        phases.forEach((phase, index) => {
          const phaseRef = docRef.collection('phases').doc(`phase_${index}`);
          batch.set(phaseRef, { ...phase, index });
        });
      }
      
      if (clinical_metadata) {
        // Just merge it in the main doc or keep it as an object
        batch.set(docRef, { clinical_metadata }, { merge: true });
      }
      
      await batch.commit();
      migratedCount++;
    } else {
      console.log(`Protocol ${key} already exists in Firestore. Ensuring it is public.`);
      await docRef.update({ 
        active: true, 
        isPublic: true, 
        visibility: 'public',
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  
  console.log(`Migration complete. Migrated ${migratedCount} new protocols.`);
}

migrate().catch(console.error);
