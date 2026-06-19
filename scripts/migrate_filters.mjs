import { db } from './lib/firebase-admin.mjs';

const BATCH_SIZE = 400;

function inferProductType(item) {
  const cat = (item.category || '').toLowerCase();
  const format = (item.format || '').toLowerCase();
  const name = (item.name || '').toLowerCase();

  if (cat.includes('peptide') || name.includes('peptide')) {
    if (format.includes('api') || name.includes('api')) return 'api_peptide';
    return 'lyophilized_peptide';
  }
  if (cat.includes('supplement') || format.includes('capsule') || format.includes('tablet')) {
    if (format.includes('api')) return 'api_supplement';
    return 'capsule_tablet';
  }
  if (cat.includes('injectable') || format.includes('injectable')) return 'injectable';
  if (cat.includes('pellet')) return 'pellet';
  if (cat.includes('dna') || cat.includes('genomic')) return 'dna_testing_kit';
  if (cat.includes('testing') || cat.includes('biomarker')) return 'biomarker_testing_kit';
  if (cat.includes('device')) return 'medical_device';
  if (cat.includes('consumable')) return 'consumable';
  if (cat.includes('service')) return 'service';

  return 'lyophilized_peptide'; // default fallback
}

function processItem(item) {
  // Goals
  let goals = item.goals || [];
  if (!Array.isArray(goals)) goals = [];
  
  // Try to infer goals if empty
  if (goals.length === 0 && item.tags && Array.isArray(item.tags)) {
    const tagsStr = item.tags.join(' ').toLowerCase();
    if (tagsStr.includes('weight') || tagsStr.includes('glp')) goals.push('weight_loss_glp1');
    if (tagsStr.includes('metabolic')) goals.push('metabolic_health');
    if (tagsStr.includes('aging') || tagsStr.includes('longevity')) goals.push('anti_aging_longevity');
    if (tagsStr.includes('recovery') || tagsStr.includes('healing')) goals.push('recovery_healing');
    if (tagsStr.includes('cognitive') || tagsStr.includes('mood') || tagsStr.includes('neuro')) goals.push('cognitive_mood');
    if (tagsStr.includes('hormon') || tagsStr.includes('sexual')) goals.push('hormonal_optimization');
  }

  // Deduplicate
  goals = [...new Set(goals)];

  // Product Type
  const productType = item.productType || inferProductType(item);

  // Commercial Status
  const stock = item.stock || item.inventoryLevel || 0;
  const inStock = stock > 0;
  const priceMissing = !item.price && !item.msrp && !item.cost;
  const supplierMissing = !item.supplier || item.supplier === 'Unassigned';
  const singleSourceRisk = item.suppliersCount === 1 || !item.suppliersCount;

  const commercialStatus = {
    inStock,
    outOfStock: !inStock,
    priceMissing,
    supplierMissing,
    singleSourceRisk
  };

  // Regulatory Status
  const hasCoa = item.hasCoa || item.coa === 'Available' || item.coaUrl;
  const missingCOA = !hasCoa || item.coa === 'Missing';
  const registered = item.registrationStatus === 'Registered' || item.registration === 'Active';
  const regulatoryRisk = !registered || missingCOA;
  const researchUseOnly = (item.tags || []).includes('RUO') || (item.category === 'Research');

  const regulatoryStatus = {
    registered,
    coaAvailable: !!hasCoa,
    missingCOA: !!missingCOA,
    regulatoryRisk,
    researchUseOnly
  };

  return {
    goals,
    productType,
    commercialStatus,
    regulatoryStatus
  };
}

async function migrateCollection(collectionName) {
  console.log(`📡 Fetching ${collectionName} from Firestore...`);
  const snap = await db.collection(collectionName).get();
  console.log(`✅ Found ${snap.size} documents in ${collectionName}`);

  let updated = 0;
  let batch = db.batch();
  let opsInBatch = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    const updates = processItem(data);

    batch.update(doc.ref, updates);
    opsInBatch++;
    updated++;

    if (opsInBatch >= BATCH_SIZE) {
      await batch.commit();
      console.log(`  ⚡ Batch committed (${opsInBatch} ops)`);
      batch = db.batch();
      opsInBatch = 0;
    }
  }

  if (opsInBatch > 0) {
    await batch.commit();
    console.log(`  ⚡ Final batch committed (${opsInBatch} ops)`);
  }

  console.log(`✅ ${collectionName} migration complete. Updated: ${updated}\n`);
}

async function run() {
  console.log('🚀 Starting Filter Panel Migration\n');
  try {
    await migrateCollection('products');
    await migrateCollection('variants');
    console.log('🎉 Migration finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

run();
