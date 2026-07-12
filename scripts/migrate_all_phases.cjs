const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('../serviceAccount-target.json');

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function run() {
  console.log("Starting universal phases migration...");
  const snapshot = await db.collection('protocols').get();
  
  let migratedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let updates = {};
    let needsUpdate = false;
    
    if (data.phases && Array.isArray(data.phases)) {
      let isClean = true;
      const newPhases = data.phases.map((p, index) => {
        const label = p.label || p.phaseName || p.title || `Phase ${index + 1}`;
        const durationWeeks = p.durationWeeks || p.duration_weeks || 4;
        const objective = p.objective || p.description || p.notes || '';
        
        let itemsSource = p.items && p.items.length > 0 ? p.items : (p.drugs && p.drugs.length > 0 ? p.drugs : []);
        
        const items = itemsSource.map(item => {
          let freq = item.frequencyPerWeek || 1;
          if (!item.frequencyPerWeek && item.frequency) {
            const fLower = (item.frequency || '').toLowerCase();
            if (fLower.includes('daily')) freq = 7;
            else if (fLower.includes('twice weekly')) freq = 2;
            else if (fLower.includes('3x')) freq = 3;
            else if (fLower.includes('5x')) freq = 5;
            else if (fLower.includes('once weekly') || fLower.includes('weekly')) freq = 1;
          }

          const name = item.name || item.compound_name || item.productName || 'Unknown Product';
          
          if (!p.items || item.productName || item.compound_name || !item.name) {
            isClean = false;
          }

          return {
            name: name,
            dose: item.dose || '',
            roa: item.roa || '',
            frequency: item.frequency || '',
            frequencyPerWeek: freq,
            doseValue: item.doseValue || 0,
            notes: item.notes || ''
          };
        });

        if (!p.label || p.phaseName) isClean = false;

        return { label, durationWeeks, objective, items };
      });

      if (!isClean) {
        updates.phases = newPhases;
        needsUpdate = true;
      }
    }
    
    if (needsUpdate) {
      try {
        await doc.ref.update(updates);
        console.log(`Cleaned phases for: ${doc.id} - ${data.protocol_name}`);
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
