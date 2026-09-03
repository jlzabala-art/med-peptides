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

function cleanDosageStringGlobal(rawDosage) {
  if (!rawDosage || typeof rawDosage !== 'string') return null;

  let str = rawDosage.trim();

  // If it's a test/kit/digital service, preserve concise description
  if (str.includes('test') || str.includes('kit') || str.includes('Stack')) return str;

  // Extract all numeric strengths and units (e.g. 500 mcg, 10 mg, 1200 mcg/mL, 30 ml)
  const matches = str.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml|l)(?:\s*\/\s*(?:vial|bottle|pen|ml))?)/gi);
  if (matches && matches.length > 0) {
    return matches.join(' + ').toLowerCase();
  }

  return str;
}

async function cleanAllSupplierDosagesGlobal() {
  console.log('--- CLEANING DOSAGE STRINGS FOR ALL 584 VARIANTS ACROSS ALL SUPPLIERS ---');

  const vSnap = await db.collectionGroup('variants').get();
  let batch = db.batch();
  let batchSize = 0;
  let updatedCount = 0;

  for (const doc of vSnap.docs) {
    const v = doc.data();
    const currentDosage = v.dosage || v.dose;

    if (currentDosage) {
      const cleaned = cleanDosageStringGlobal(currentDosage);

      if (cleaned && (v.dosage !== cleaned || v.dose !== cleaned)) {
        batch.set(doc.ref, {
          dosage: cleaned,
          dose: cleaned,
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
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`✓ SUCCESS: Cleaned and standardized pure numeric dosage strings for ${updatedCount} variants across all suppliers.`);
}

cleanAllSupplierDosagesGlobal().catch(console.error);
