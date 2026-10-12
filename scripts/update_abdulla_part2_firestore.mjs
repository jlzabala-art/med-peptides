import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

// Initialize firebase-admin
if (!admin.apps.length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

async function updateAbdullaPart2() {
  console.log('🔍 Updating Abdulla Part 2 (Night Formula) in Firestore...');

  const newDirections = 'Take 2 capsules 30-60 minutes before bedtime.';

  // 1. Update RX-51812-B directly
  const docRefB = db.collection('prescriptions').doc('RX-51812-B');
  const snapB = await docRefB.get();

  if (snapB.exists) {
    const data = snapB.data();
    console.log('Found prescriptions/RX-51812-B');

    // Clean items / apis
    let apis = data.apis || [];
    apis = apis.map(a => {
      let name = (a.name || a.drugName || '').replace(/\s*\(eq\.\s*400\s*mg\s*elemental\s*mg\)/gi, '').trim();
      let activeIngredient = (a.activeIngredient || '').replace(/\s*\(eq\.\s*400\s*mg\s*elemental\s*mg\)/gi, '').trim();
      return {
        ...a,
        name: name || 'Magnesium Bisglycinate',
        drugName: name || 'Magnesium Bisglycinate',
        activeIngredient: activeIngredient || 'Magnesium Bisglycinate'
      };
    });

    let items = data.items || [];
    items = items.map(item => {
      let name = (item.name || '').replace(/\s*\(eq\.\s*400\s*mg\s*elemental\s*mg\)/gi, '').trim();
      let activeIngredient = (item.activeIngredient || '').replace(/\s*\(eq\.\s*400\s*mg\s*elemental\s*mg\)/gi, '').trim();
      return {
        ...item,
        name: name || 'Magnesium Bisglycinate',
        activeIngredient: activeIngredient || 'Magnesium Bisglycinate'
      };
    });

    let activeIngredientsList = (data.activeIngredientsList || []).map(ing => {
      return ing.replace(/\s*\(eq\.\s*400\s*mg\s*elemental\s*mg\)/gi, '').trim();
    });

    const formula = 'Magnesium Bisglycinate 2,840 mg + Glycine 1,000 mg + L-Theanine 200 mg';

    await docRefB.set({
      directions: newDirections,
      instructions: newDirections,
      posology: newDirections,
      treatmentInstructions: newDirections,
      formula: formula,
      apis: apis,
      items: items,
      activeIngredientsList: activeIngredientsList,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('  ✓ Updated prescriptions/RX-51812-B with new directions and clean Magnesium Bisglycinate');
  }

  // 2. Also check prescriptions/51812 and prescriptions/RX-51812 labels array
  for (const parentId of ['51812', 'RX-51812']) {
    const parentRef = db.collection('prescriptions').doc(parentId);
    const parentSnap = await parentRef.get();

    if (parentSnap.exists) {
      const pData = parentSnap.data();
      if (Array.isArray(pData.labels) && pData.labels.length > 1) {
        console.log(`Updating labels array in prescriptions/${parentId}...`);
        const updatedLabels = pData.labels.map((lbl, idx) => {
          if (idx === 1 || lbl.partNumber === 2 || lbl.partLabel?.includes('Part 2')) {
            const cleanApis = (lbl.apis || []).map(a => ({
              ...a,
              name: (a.name || '').replace(/\s*\(eq\.\s*400\s*mg\s*elemental\s*mg\)/gi, '').trim()
            }));
            const cleanList = (lbl.activeIngredientsList || []).map(ing =>
              ing.replace(/\s*\(eq\.\s*400\s*mg\s*elemental\s*mg\)/gi, '').trim()
            );
            return {
              ...lbl,
              directions: newDirections,
              instructions: newDirections,
              formula: 'Magnesium Bisglycinate 2,840 mg + Glycine 1,000 mg + L-Theanine 200 mg',
              apis: cleanApis,
              activeIngredientsList: cleanList
            };
          }
          return lbl;
        });

        await parentRef.set({
          labels: updatedLabels,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`  ✓ Updated labels array in prescriptions/${parentId}`);
      }
    }
  }

  console.log('\n✅ Abdulla Part 2 successfully updated in Firestore!');
  process.exit(0);
}

updateAbdullaPart2().catch((err) => {
  console.error('❌ Error updating Firestore:', err);
  process.exit(1);
});
