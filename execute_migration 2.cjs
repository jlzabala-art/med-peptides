const admin = require('firebase-admin');

// Ensure we use the application default credentials from the user's local gcloud auth
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/Users/joseluiszabala/.config/gcloud/application_default_credentials.json";

try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });
} catch (e) {
  console.error("Initialization failed. Please run 'gcloud auth application-default login' first if not authenticated.");
  process.exit(1);
}

const db = admin.firestore();

const normalizeDosage = (dosageStr, sku) => {
  if (!dosageStr) dosageStr = '';
  
  const upperSku = (sku || '').toUpperCase();
  if (upperSku.includes('RAW') || upperSku.includes('API')) {
    return { format: 'API Peptide', dosage: 'Bulk', type: 'api_peptide', unit: 'gram' };
  }

  const combined = `${dosageStr} ${sku}`.toUpperCase();
  let mgMatch = combined.match(/(\d+(?:\.\d+)?)\s*MG/);
  let mcgMatch = combined.match(/(\d+(?:\.\d+)?)\s*MCG/);
  let iuMatch = combined.match(/(\d+(?:\.\d+)?)\s*IU/);

  let cleanDosage = null;
  if (mgMatch) cleanDosage = `${mgMatch[1]}mg`;
  else if (mcgMatch) cleanDosage = `${mcgMatch[1]}mcg`;
  else if (iuMatch) cleanDosage = `${iuMatch[1]}IU`;

  if (combined.includes('CAP') || combined.includes('TAB')) {
    return { format: 'Capsule / Tablet', dosage: cleanDosage || 'Capsule', type: 'capsule', unit: 'capsule' };
  }

  if (combined.includes('NASAL')) {
    return { format: 'Nasal Spray', dosage: cleanDosage || 'Spray', type: 'nasal', unit: 'bottle' };
  }

  if (cleanDosage) {
    return { format: 'Lyophilized Peptide', dosage: cleanDosage, type: 'lyophilized_peptide', unit: 'vial' };
  }

  return { format: 'Unknown', dosage: dosageStr || '-', type: 'unknown', unit: 'unit' };
};

async function runMigration() {
  console.log("🚀 Starting database normalization migration...");

  try {
    const productsRef = db.collection('products');
    const productsSnap = await productsRef.get();
    console.log(`Found ${productsSnap.size} products to scan.`);

    let batch = db.batch();
    let batchCount = 0;
    let updateCount = 0;

    for (const pDoc of productsSnap.docs) {
      const variantsRef = db.collection('products').doc(pDoc.id).collection('variants');
      const variantsSnap = await variantsRef.get();

      variantsSnap.forEach(vDoc => {
        const vData = vDoc.data();
        const sku = vData.sku || '';
        const currentDosage = vData.dosage || (vData.strength && vData.strength.dosageLabel) || '';

        const normalized = normalizeDosage(currentDosage, sku);

        const updates = {};
        let needsUpdate = false;

        // Update format/type
        if (vData.productType !== normalized.type) {
          updates.productType = normalized.type;
          updates.formatLabel = normalized.format;
          needsUpdate = true;
        }

        // Update dosage
        if (!vData.strength || vData.strength.dosageLabel !== normalized.dosage || vData.dosage !== normalized.dosage) {
          updates.dosage = normalized.dosage;
          updates['strength.dosageLabel'] = normalized.dosage;
          needsUpdate = true;
        }

        // Update kit unit
        if (!vData.kit || vData.kit.unit !== normalized.unit) {
          updates['kit.unit'] = normalized.unit;
          needsUpdate = true;
        }

        if (needsUpdate) {
          batch.update(vDoc.ref, updates);
          batchCount++;
          updateCount++;
          console.log(`[UPDATE] ${sku || 'No-SKU'}: ${currentDosage} -> Format: ${normalized.format}, Dosage: ${normalized.dosage}`);
        }

        if (batchCount >= 400) {
          batch.commit();
          batch = db.batch();
          batchCount = 0;
          console.log("✅ Committed batch of 400.");
        }
      });
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`✅ Committed final batch of ${batchCount}.`);
    }

    console.log(`\n🎉 Migration complete! Successfully updated ${updateCount} variants.`);
    process.exit(0);
  } catch (e) {
    console.error("❌ Migration failed:", e.message);
    process.exit(1);
  }
}

runMigration();
