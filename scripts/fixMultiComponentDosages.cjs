const admin = require('firebase-admin');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const privateKeyLine = envFile.match(/FIREBASE_PRIVATE_KEY=(.*)/)[1];
const privateKey = privateKeyLine.replace(/\\n/g, '\n').replace(/^\"|\"$/g, '');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'med-peptides-app',
    clientEmail: 'firebase-adminsdk-fbsvc@med-peptides-app.iam.gserviceaccount.com',
    privateKey: privateKey
  })
});

const db = admin.firestore();

// Specific multi-component dosage mappings for bundles and blends
const MULTI_COMPONENT_DOSAGES = {
  'bioniq_anti_aging_and_immunity_bundle_bundle-default': 'Epitalon 10 mg + GHK-Cu 50 mg + Thymosin Alpha-1 10 mg',
  'bioniq_cellular_repair_and_energy_bundle_bundle-default': 'BPC-157 10 mg + TB-500 10 mg + NAD+ 100 mg',
  'bioniq_glow_stack_bundle-default': 'GHK-Cu 50 mg + BPC-157 10 mg + TB-500 10 mg',
  'bioniq_health_optimisation_bundle_bundle-default': 'MOTS-c 10 mg + Epitalon 10 mg + NAD+ 100 mg',
  'bioniq_skin_tissue_regeneration_stack_bundle-default': 'GHK-Cu 100 mg + BPC-157 10 mg',
  'bioniq_wolverine_repair_bundle_bundle-default': 'BPC-157 15 mg + TB-500 15 mg'
};

async function fixMultiComponentDosages() {
  console.log('--- REPAIRING MULTI-COMPONENT AND BUNDLE DOSAGES WITH EXPLICIT COMBINATIONS ---');

  const vSnap = await db.collectionGroup('variants').get();
  let batch = db.batch();
  let batchSize = 0;
  let updatedCount = 0;

  for (const doc of vSnap.docs) {
    const v = doc.data();
    const docId = doc.id;

    let targetDosage = null;

    // Check direct mapping
    if (MULTI_COMPONENT_DOSAGES[docId]) {
      targetDosage = MULTI_COMPONENT_DOSAGES[docId];
    } else if (v.dosage === 'Multi-product Stack' || v.dose === 'Multi-product Stack') {
      // Fallback for any remaining stack/bundle
      if (docId.includes('wolverine')) targetDosage = 'BPC-157 15 mg + TB-500 15 mg';
      else if (docId.includes('glow')) targetDosage = 'GHK-Cu 50 mg + BPC-157 10 mg + TB-500 10 mg';
      else if (docId.includes('repair')) targetDosage = 'BPC-157 10 mg + TB-500 10 mg';
      else targetDosage = 'Multi-compound Stack (Explicit Dosage)';
    }

    if (targetDosage && (v.dosage !== targetDosage || v.dose !== targetDosage)) {
      batch.set(doc.ref, {
        dosage: targetDosage,
        dose: targetDosage,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      updatedCount++;
      batchSize++;

      if (batchSize >= 400) {
        await batch.commit();
        batch = db.batch();
        batchSize = 0;
      }
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`✓ SUCCESS: Updated explicit multi-component dosages for ${updatedCount} variants.`);
}

fixMultiComponentDosages().catch(console.error);
