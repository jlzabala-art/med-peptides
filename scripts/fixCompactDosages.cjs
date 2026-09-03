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

// Simplify dosage strings to contain ONLY numerical values + units (e.g., '15 mg + 15 mg')
const COMPACT_DOSAGES = {
  'bioniq_anti_aging_and_immunity_bundle_bundle-default': '10 mg + 50 mg + 10 mg',
  'bioniq_cellular_repair_and_energy_bundle_bundle-default': '10 mg + 10 mg + 100 mg',
  'bioniq_glow_stack_bundle-default': '50 mg + 10 mg + 10 mg',
  'bioniq_health_optimisation_bundle_bundle-default': '10 mg + 10 mg + 100 mg',
  'bioniq_skin_tissue_regeneration_stack_bundle-default': '100 mg + 10 mg',
  'bioniq_wolverine_repair_bundle_bundle-default': '15 mg + 15 mg'
};

async function fixCompactDosages() {
  console.log('--- CLEANING DOSAGE STRINGS TO PURE NUMERICAL VALUES (X mg + Y mg) ---');

  const vSnap = await db.collectionGroup('variants').get();
  let batch = db.batch();
  let batchSize = 0;
  let updatedCount = 0;

  for (const doc of vSnap.docs) {
    const v = doc.data();
    const docId = doc.id;

    let targetDosage = COMPACT_DOSAGES[docId] || null;

    // Clean any other variant where peptide names are redundantly repeated in dosage string
    if (!targetDosage && (v.dosage || v.dose)) {
      const current = v.dosage || v.dose;
      if (current.includes('+') && /[a-zA-Z]{3,}/.test(current)) {
        // Strip product names, keeping numbers and units
        const matches = current.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml))/gi);
        if (matches && matches.length > 1) {
          targetDosage = matches.join(' + ');
        }
      }
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

  console.log(`✓ SUCCESS: Cleaned dosage strings for ${updatedCount} variants to pure values (e.g., '15 mg + 15 mg').`);
}

fixCompactDosages().catch(console.error);
