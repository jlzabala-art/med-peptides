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
        if (phase.drugs_used && !phase.items) {
          updated = true;
          return {
            ...phase,
            items: phase.drugs_used.map(drug => ({
              productId: drug.productId || drug.product_slug || '',
              productName: drug.productId || drug.product_slug || '',
              frequency: drug.dosing_frequency ? (drug.dosing_frequency.charAt(0).toUpperCase() + drug.dosing_frequency.slice(1)) : 'Weekly',
              vialsNeeded: drug.vials_required_for_phase || 1,
              dosageMg: 0
            })),
            // optionally delete drugs_used or keep it
            drugs_used: db.FieldValue ? undefined : null // We will just let it be, but add items
          };
        } else if (phase.drugs_used && phase.items) {
           // If both exist, do nothing
           return phase;
        }
        return phase;
      });
      
      // Clean up undefined properties for firestore
      const cleanPhases = newPhases.map(p => {
         const cleanP = { ...p };
         delete cleanP.drugs_used; // remove old key if we want to clean up
         return cleanP;
      });

      if (updated) {
        batch.update(doc.ref, { phases: cleanPhases });
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
