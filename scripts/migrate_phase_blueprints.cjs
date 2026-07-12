const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  console.log("Starting phase_blueprints to phases migration...");
  const snapshot = await db.collection('protocols').get();
  
  let migratedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let updates = {};
    let needsUpdate = false;
    
    if (data.phase_blueprints && Array.isArray(data.phase_blueprints) && data.phase_blueprints.length > 0) {
      // If the document has phase_blueprints, we use them to populate/overwrite phases
      // Because phase_blueprints contains the REAL drugs
      const newPhases = data.phase_blueprints.map((bp, index) => {
        return {
          label: bp.title || `Phase ${index + 1}`,
          durationWeeks: bp.duration_weeks || 4,
          objective: bp.description || '',
          items: (bp.drugs || []).map(drug => {
            let freq = 1;
            const fLower = (drug.frequency || '').toLowerCase();
            if (fLower.includes('daily')) freq = 7;
            else if (fLower.includes('twice weekly')) freq = 2;
            else if (fLower.includes('3x')) freq = 3;
            else if (fLower.includes('5x')) freq = 5;

            return {
              name: drug.compound_name || 'Unknown Product',
              dose: drug.dose || '',
              roa: drug.roa || '',
              frequency: drug.frequency || '',
              frequencyPerWeek: freq,
              doseValue: 0 // Cannot reliably parse "Standard Concentration", UI will handle 0
            };
          })
        };
      });

      updates.phases = newPhases;
      updates.phase_blueprints = FieldValue.delete();
      needsUpdate = true;
    }
    
    if (needsUpdate) {
      try {
        await doc.ref.update(updates);
        console.log(`Migrated protocol phases: ${doc.id}`);
        migratedCount++;
      } catch (err) {
        console.error(`Failed to migrate protocol ${doc.id}:`, err);
      }
    }
  }
  
  console.log(`Migration complete. Standardized phases for ${migratedCount} protocols.`);
  process.exit(0);
}

run().catch(console.error);
