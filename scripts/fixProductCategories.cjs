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

const CATEGORY_ALIASES = {
  'peptides':                  'peptide',
  'peptide':                   'peptide',
  'peptide blend':             'peptide',
  'peptide_blend':             'peptide',
  'peptide combination':       'peptide',
  'peptide_combination':       'peptide',
  'blend':                     'peptide',
  'supplement':                'supplement',
  'nutraceutical':             'supplement',
  'capsules & consumables':    'supplement',
  'capsules_and_consumables':  'supplement',
  'diagnostic':                'diagnostic',
  'dna_test':                  'diagnostic',
  'test_kit':                  'diagnostic',
  'biomarker_test':            'diagnostic',
  'blood_analysis':            'diagnostic',
  'proteomics':                'diagnostic',
  'raw_material':              'raw_material',
  'api_raw_material':          'raw_material',
  'excipient':                 'raw_material',
  'compounding_material':      'raw_material',
  'service':                   'service',
  'subscription':              'service',
  'equipment':                 'service'
};

function resolveCategory(raw) {
  if (!raw) return 'peptide';
  const cleaned = String(raw).trim().toLowerCase();
  return CATEGORY_ALIASES[cleaned] || 'peptide';
}

async function fixProductCategoriesToStrictIds() {
  console.log('--- CLEANING FIRESTORE PRODUCT CATEGORIES TO STRICT CANONICAL IDS ---');

  const productsSnap = await db.collection('products').get();
  console.log(`Auditing ${productsSnap.size} master products...`);

  let updatedCount = 0;
  let batch = db.batch();
  let batchSize = 0;
  const categoryDistribution = {};

  for (const pDoc of productsSnap.docs) {
    const data = pDoc.data();
    const currentCat = data.category;
    const targetCatId = resolveCategory(currentCat);

    categoryDistribution[targetCatId] = (categoryDistribution[targetCatId] || 0) + 1;

    if (currentCat !== targetCatId) {
      batch.set(pDoc.ref, {
        category: targetCatId,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      updatedCount++;
      batchSize++;

      if (batchSize >= 450) {
        await batch.commit();
        batch = db.batch();
        batchSize = 0;
      }
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`\n✓ SUCCESS: Cleaned and updated ${updatedCount} master products to strict category IDs.`);
  console.log('\n--- FINAL STRICT CATEGORY ID DISTRIBUTION ---');
  console.log(categoryDistribution);
}

fixProductCategoriesToStrictIds().catch(console.error);
