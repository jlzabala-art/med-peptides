const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: 'med-peptides-app'
  });
}

const db = admin.firestore();

async function updateSKUs() {
  const snap = await db.collection('products').get();
  let updatedCount = 0;
  
  const batch = db.batch();

  for (const doc of snap.docs) {
    const data = doc.data();
    // Only update if SKU is missing or empty
    if (!data.sku || data.sku.trim() === '') {
      const categoryRaw = data.category || (data.goals && data.goals[0]) || 'GEN';
      const catAbbr = categoryRaw.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
      
      const nameRaw = data.displayName || data.title || doc.id;
      const nameAbbr = nameRaw.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 7);
      
      // Attempt to extract dosage from title or id if not explicit
      const match = nameRaw.match(/(\d+mg)/i);
      let format = '';
      if (match) {
        const isVial = data.typeData?.peptide?.administrationRoutes?.includes('injectable_vial');
        format = '-' + match[1].toUpperCase() + (isVial ? '/VIAL' : '');
      } else {
        // Fallback to checking variants
        if (data.variants && data.variants.length > 0) {
          const varDosage = data.variants[0].dosage || data.variants[0].strength;
          if (varDosage) {
            format = '-' + varDosage.toUpperCase().replace(/\s+/g, '');
          }
        }
      }

      const newSku = `MP-${catAbbr}-${nameAbbr}${format}`;
      
      batch.update(doc.ref, { sku: newSku });
      console.log(`Will update ${doc.id} -> SKU: ${newSku}`);
      updatedCount++;
    }
  }

  if (updatedCount > 0) {
    await batch.commit();
    console.log(`Successfully updated ${updatedCount} products with default SKUs.`);
  } else {
    console.log(`No products needed SKU generation.`);
  }
}

updateSKUs().catch(console.error);
