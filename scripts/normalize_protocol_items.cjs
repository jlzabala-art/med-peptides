const { adminDb } = require('../src/lib/firebaseAdmin');

async function normalizeProtocols() {
  console.log('Starting normalization of protocol phases items...');
  const snapshot = await adminDb.collection('protocols').get();
  
  let updatedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    let changed = false;
    
    if (!data.phases || !Array.isArray(data.phases)) {
      continue;
    }

    const newPhases = data.phases.map((phase) => {
      // Some old phases might use 'medications' instead of 'items'
      let itemsList = phase.items || phase.medications || [];
      
      const newItems = itemsList.map(item => {
        // Extract names
        const name = item.name || item.productName || item.product_name || item.title || item.drug || item.drug_name || 'Unknown Product';
        
        // Extract IDs
        const product_id = item.product_id || item.productId || item.objectID || null;
        
        // Parse numerical values safely
        const parseNum = (val, fallback) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const parsed = parseFloat(val.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed)) return parsed;
          }
          return fallback;
        };

        const vialStrengthMg = parseNum(item.vialStrengthMg || item.vial_strength_mg || item.mg_per_vial || item.dosage_mg, 10);
        const doseMg = parseNum(item.doseMg || item.doseValue || item.dose_mg, 0.5);
        const frequencyPerWeek = parseNum(item.frequencyPerWeek || item.frequency_per_week, 5);
        const diluentMl = parseNum(item.diluentMl || item.reconstitution_ml, 2);
        const shelfLifeDays = parseNum(item.shelfLifeDays || item.shelf_life_days, 30);
        
        return {
          id: item.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          product_id,
          name,
          vialStrengthMg,
          doseMg,
          frequencyPerWeek,
          diluentMl,
          shelfLifeDays,
          // Preserve any extra fields if needed, but standardize these ones.
          // Note: removing the messy ones!
          ...Object.keys(item).reduce((acc, k) => {
            if (!['productName', 'product_name', 'title', 'drug', 'drug_name', 'productId', 'objectID', 'vial_strength_mg', 'mg_per_vial', 'dosage_mg', 'doseValue', 'dose_mg', 'frequency_per_week', 'reconstitution_ml', 'shelf_life_days', 'medications'].includes(k)) {
              acc[k] = item[k];
            }
            return acc;
          }, {})
        };
      });

      let newPhase = { ...phase, items: newItems };
      if (newPhase.medications) {
        delete newPhase.medications;
      }
      
      // Checking for differences would be ideal, but for safety we'll flag it as changed if there are items.
      changed = true;
      return newPhase;
    });

    if (changed) {
      await doc.ref.update({ phases: newPhases });
      console.log(`Updated protocol: ${doc.id} - ${data.protocol_name || 'Unnamed'}`);
      updatedCount++;
    }
  }

  console.log(`Finished normalizing. Updated ${updatedCount} protocols.`);
}

normalizeProtocols().catch(console.error);
