import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateLotuslandFormatAndDosage() {
  console.log('Starting Lotusland Format and Dosage Migration...');
  let updatedCount = 0;
  try {
    const productsRef = db.collection('products');
    const productsSnap = await productsRef.get();

    for (const pDoc of productsSnap.docs) {
      const variantsRef = db.collection('products').doc(pDoc.id).collection('variants');
      const variantsSnap = await variantsRef.get();

      for (const vDoc of variantsSnap.docs) {
        const vData = vDoc.data();
        if (vData.supplier && vData.supplier.toLowerCase().includes('lotusland')) {
          let needsUpdate = false;
          let updateData = {};
          
          // Extract dosage from SKU (e.g. HP-MET-FRZOPA-5MG-BOX)
          const sku = vData.sku || '';
          const mgMatch = sku.match(/(\d+)MG/i);
          if (mgMatch) {
            const dosage = `${mgMatch[1]} mg`;
            if (vData.dosage !== dosage) {
              updateData.dosage = dosage;
              updateData.size = dosage;
              needsUpdate = true;
            }
          }
          
          // Set format to "vial" for lyophilized peptides
          if (!vData.format || vData.format.toLowerCase() !== 'vial') {
            updateData.format = 'vial';
            needsUpdate = true;
          }

          if (needsUpdate) {
            await vDoc.ref.update(updateData);
            updatedCount++;
            console.log(`Updated ${sku}: format=${updateData.format || vData.format}, dosage=${updateData.dosage || vData.dosage}`);
          }
        }
      }
    }
    console.log(`Lotusland Format & Dosage Migration Complete! Updated ${updatedCount} variants.`);
  } catch (e) {
    console.error(`Migration Failed: ${e.message}`);
  }
}

migrateLotuslandFormatAndDosage().then(() => process.exit(0));
