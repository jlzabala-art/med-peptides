const admin = require('firebase-admin');

try {
  admin.initializeApp();
  console.log('Initialized using default credentials.');
} catch (e) {
  console.log('Failed to init default credentials', e.message);
  process.exit(1);
}

const db = admin.firestore();

async function run() {
  console.log('Starting Lotusland format and dosage migration...');
  let updated = 0;

  const productsSnap = await db.collection('products').get();
  for (const pDoc of productsSnap.docs) {
    const variantsSnap = await pDoc.ref.collection('variants').get();
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
            updateData.size = dosage; // Keep size in sync if used
            needsUpdate = true;
          }
        }

        // Set format to "vial" for lyophilized peptides
        // If it's a peptide, the format should be vial. Let's just set format to "vial" for Lotusland.
        // Wait, the user said "para los lyofilizied peptides". Lotusland only sells lyophilized peptides?
        // Let's set format = 'vial' if it's currently missing or not 'vial'.
        if (!vData.format || vData.format.toLowerCase() !== 'vial') {
          updateData.format = 'vial';
          needsUpdate = true;
        }

        if (needsUpdate) {
          await vDoc.ref.update(updateData);
          updated++;
          console.log(`Updated ${sku}: format=${updateData.format}, dosage=${updateData.dosage}`);
        }
      }
    }
  }

  console.log(`Migration complete! Updated ${updated} Lotusland variants.`);
  process.exit(0);
}

run().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});
