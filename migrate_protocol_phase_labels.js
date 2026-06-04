import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function run() {
  const snapshot = await db.collection('protocols').get();
  let batch = db.batch();
  let count = 0;
  let totalMigrated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let updated = false;
    
    if (data.phases && Array.isArray(data.phases)) {
      const newPhases = data.phases.map(phase => {
        let changed = false;
        const newPhase = { ...phase };
        
        if (!newPhase.label && newPhase.phase_title) {
          newPhase.label = newPhase.phase_title;
          changed = true;
        }
        
        if (!newPhase.durationWeeks && newPhase.end_week) {
          const start = newPhase.start_week || 1;
          const end = newPhase.end_week;
          newPhase.durationWeeks = (end - start) + 1;
          changed = true;
        }

        // Try to get dosage if possible
        if (newPhase.items) {
           newPhase.items = newPhase.items.map(item => {
             // If we can't get dosage, leave it 0
             return item;
           });
        }
        
        if (changed) updated = true;
        return newPhase;
      });
      
      if (updated) {
        batch.update(doc.ref, { phases: newPhases });
        count++;
        totalMigrated++;
      }
    }

    if (count >= 50) {
      await batch.commit();
      batch = db.batch();
      count = 0;
      console.log(`Committed 50 updates. Total: ${totalMigrated}`);
    }
  }

  if (count > 0) {
    await batch.commit();
    console.log(`Committed final ${count} updates. Total: ${totalMigrated}`);
  } else if (totalMigrated === 0) {
    console.log("No protocols needed migration.");
  }
}

run().catch(console.error);
