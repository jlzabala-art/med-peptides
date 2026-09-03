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

function parseDosageFromIdOrName(str) {
  if (!str) return null;
  // Look for patterns like 100_mg, 15_mg, 30_mg, 10_mg, 500_mcg, 50_mg, 5_mg
  const match = str.match(/(\d+(?:[\._]\d+)?)\s*[_ ]?\s*(mg|mcg|g|iu)/i);
  if (match) {
    const value = match[1].replace('_', '.');
    const unit = match[2].toLowerCase();
    return `${value} ${unit}`;
  }
  return null;
}

async function fixBioniqDosages() {
  console.log('--- REPAIRING BIONIQ DOSAGES FROM ID AND METADATA ---');

  const vSnap = await db.collectionGroup('variants').get();
  let batch = db.batch();
  let batchSize = 0;
  let repairedCount = 0;

  for (const doc of vSnap.docs) {
    const v = doc.data();
    const sId = v.supplier_id || v.supplierId || '';

    if (sId.includes('bioniq')) {
      let dosageVal = v.dosage || v.dose;

      if (!dosageVal) {
        // Try parsing from variant ID or parent product ID
        const searchStr = `${doc.id} ${v._migratedFromProduct || ''}`;
        const parsed = parseDosageFromIdOrName(searchStr);

        if (parsed) {
          dosageVal = parsed;
        } else if (v.presentation === 'bundle') {
          dosageVal = 'Multi-product Stack';
        } else {
          dosageVal = 'Standard Clinical Strength';
        }

        batch.set(doc.ref, {
          dosage: dosageVal,
          dose: dosageVal,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        repairedCount++;
        batchSize++;

        if (batchSize >= 400) {
          await batch.commit();
          batch = db.batch();
          batchSize = 0;
        }
      }
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`✓ SUCCESS: Repaired dosages for ${repairedCount} Bioniq variants.`);
}

fixBioniqDosages().catch(console.error);
