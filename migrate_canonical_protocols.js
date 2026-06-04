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
    let updates = {};

    // 1. Merge doses and units into existing phases
    if (data.phases && data.phase_blueprints) {
      const newPhases = data.phases.map((phase, pIndex) => {
        const newPhase = { ...phase };
        const blueprintPhase = data.phase_blueprints[pIndex];

        if (blueprintPhase && blueprintPhase.drugs && newPhase.items) {
          newPhase.items = newPhase.items.map((item, iIndex) => {
            const newItem = { ...item };
            const bpDrug = blueprintPhase.drugs[iIndex];
            
            if (bpDrug && bpDrug.dose_logic) {
              const dl = bpDrug.dose_logic;
              // Set new dosage and doseUnit fields, remove old dosageMg
              newItem.dosage = dl.dose_per_administration || dl.starting_daily_dose || 0;
              newItem.doseUnit = dl.dose_unit || 'mg';
              // Convert frequency to uppercase first letter format if needed
              if (dl.administration_frequency) {
                let f = dl.administration_frequency;
                if (f === 'daily') newItem.frequency = 'Daily';
                else if (f === '3x_week') newItem.frequency = '3x Weekly';
                else if (f === '5x_week') newItem.frequency = '5x Weekly';
                else if (f === 'once_weekly') newItem.frequency = 'Weekly';
                else if (f === '2x_week') newItem.frequency = '2x Weekly';
                else newItem.frequency = f.charAt(0).toUpperCase() + f.slice(1);
              }
              // delete legacy property
              delete newItem.dosageMg;
            }
            return newItem;
          });
        }
        return newPhase;
      });
      
      updates.phases = newPhases;
      updated = true;
    }

    // 2. Add supplements to root if they exist
    if (data.recommended_supplements && !data.supplements) {
      // Create a clean supplements array for the UI to edit
      updates.supplements = data.recommended_supplements.map(sup => ({
        name: sup.name || '',
        dosage: sup.dosage || '',
        rationale: sup.rationale || '',
        timing: sup.timing || ''
      }));
      updated = true;
    } else if (!data.supplements) {
       updates.supplements = [];
       updated = true;
    }

    if (updated) {
      batch.update(doc.ref, updates);
      count++;
      totalMigrated++;
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
