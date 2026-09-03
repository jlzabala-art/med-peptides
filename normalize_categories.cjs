/**
 * normalize_categories.cjs
 * Phase 1: Unify `category` → `categoryId` across all Firestore products
 *
 * Strategy:
 *  - If `categoryId` is missing/empty and `category` exists → copy category → categoryId
 *  - If both exist and they're DIFFERENT → trust categoryId, leave category as alias
 *  - Always ensures `categoryId` is a non-empty lowercase string
 *  - Does NOT delete `category` (kept for legacy read compat during transition)
 */
const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Map legacy free-text categories to canonical categoryId values
const CATEGORY_ALIAS_MAP = {
  'peptide':                  'peptide',
  'peptides':                 'peptide',
  'hormone':                  'hormone',
  'hormones':                 'hormone',
  'hormone optimization':     'hormone',
  'supplement':               'supplement',
  'supplements':              'supplement',
  'nutraceutical':            'supplement',
  'nutricosmetics':           'supplement',
  'weight_loss':              'supplement',
  'weight loss':              'supplement',
  'testing':                  'diagnostic_test',
  'test':                     'diagnostic_test',
  'diagnostic_test':          'diagnostic_test',
  'genetic_test':             'diagnostic_test',
  'lab_test':                 'diagnostic_test',
  'equipment':                'equipment',
  'consumable':               'consumable',
  'medical_device_consumable':'consumable',
  'excipient':                'consumable',
  'excipient_vehicle':        'consumable',
  'raw_material':             'raw_material',
  'api_raw_material':         'raw_material',
  'service':                  'service',
  'subscription':             'service',
  'bundle':                   'bundle',
  'skincare':                 'skincare',
  'topical_cosmetic':         'skincare',
  'cardiovascular':           'peptide',
  'metabolic':                'peptide',
  'professional_material':    'consumable',
  'compounding_material':     'consumable',
  'injectable_nutrient':      'supplement',
  'iv_protocol':              'supplement',
  'small_molecule':           'peptide',
  'genetic test':             'diagnostic_test',
};

function resolveCanonicalCategory(rawCategory) {
  if (!rawCategory || typeof rawCategory !== 'string') return null;
  const lower = rawCategory.toLowerCase().trim();
  return CATEGORY_ALIAS_MAP[lower] || lower;
}

async function run() {
  console.log('🔍 Phase 1: Normalizing category → categoryId in Firestore...\n');

  const snap = await db.collection('products').get();
  console.log(`Found ${snap.size} products to check.\n`);

  let batchCount = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let batch = db.batch();

  const BATCH_SIZE = 400;

  for (const doc of snap.docs) {
    const data = doc.data();
    const existingCategoryId = data.categoryId;
    const rawCategory = data.category;

    const canonicalId = resolveCanonicalCategory(existingCategoryId) 
                     || resolveCanonicalCategory(rawCategory);

    // Nothing to do if categoryId already correct
    if (existingCategoryId && existingCategoryId === canonicalId) {
      totalSkipped++;
      continue;
    }

    if (!canonicalId) {
      console.warn(`⚠️  [${doc.id}] No category or categoryId to resolve — skipping`);
      totalSkipped++;
      continue;
    }

    const update = { categoryId: canonicalId };

    // Keep category as alias if it was already set (backward compat)
    if (!rawCategory && canonicalId) {
      update.category = canonicalId;
    }

    // Log divergences
    if (existingCategoryId && rawCategory && existingCategoryId !== canonicalId) {
      console.log(`⚡ [${doc.id}] DIVERGENCE: categoryId="${existingCategoryId}" + category="${rawCategory}" → normalized to "${canonicalId}"`);
    } else {
      console.log(`✅ [${doc.id}] ${existingCategoryId || '(empty)'} + ${rawCategory || '(empty)'} → "${canonicalId}"`);
    }

    batch.update(doc.ref, update);
    batchCount++;
    totalUpdated++;

    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      console.log(`\n📦 Committed batch of ${batchCount} updates.\n`);
      batch = db.batch();
      batchCount = 0;
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`\n📦 Final batch committed (${batchCount} updates).`);
  }

  console.log(`\n✅ Phase 1 complete.`);
  console.log(`   Updated:  ${totalUpdated}`);
  console.log(`   Skipped:  ${totalSkipped}`);
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
