import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./src/scripts/serviceAccountKey.json', 'utf8'));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

async function inspectData() {
  console.log('--- 🔍 AUDITING FIRESTORE DATA ---');

  // 1. Products
  const productsSnap = await db.collection('products').get();
  console.log(`Total Products: ${productsSnap.size}`);

  let missingName = 0;
  let legacyTitleOnly = 0;
  let missingSlug = 0;
  let missingCanonicalKey = 0;
  let missingCategoryId = 0;
  let nonCanonicalCategory = 0;
  let nonCanonicalStatus = 0;
  let nonCanonicalType = 0;
  let missingGoals = 0;
  let missingSchemaVersion = 0;
  let missingCasOrMol = 0;
  let variantsCount = 0;
  let variantsMissingSupplier = 0;
  let variantsMissingPricing = 0;

  const validStatuses = new Set(['draft', 'active', 'published', 'out of stock', 'hidden', 'archived']);
  const validTypes = new Set(['finished_product', 'raw_material', 'clinical_supplies', 'diagnostic', 'iv_drip', 'dual', 'service', 'logistics_service']);
  const validCategories = new Set([
    'peptide', 'iv_drips', 'iv_therapy', 'supplement', 'metabolic', 'hormone', 
    'diagnostic', 'diagnostic_test', 'genomics_biomarkers', 'nutricosmetics', 'raw_material', 'excipient_vehicle', 
    'clinical_supplies', 'consumable', 'skincare', 'cosmetics', 'aesthetic injectables', 'bundle', 'service', 
    'corporate_services', 'logistics_service', 'equipment'
  ]);

  const sampleIssues = [];

  for (const doc of productsSnap.docs) {
    const d = doc.data();
    const id = doc.id;

    if (!d.name && d.title) legacyTitleOnly++;
    if (!d.name && !d.title) missingName++;
    if (!d.slug) missingSlug++;
    if (!d.canonicalKey) missingCanonicalKey++;
    if (!d.categoryId) missingCategoryId++;
    else if (!validCategories.has(d.categoryId.toLowerCase())) nonCanonicalCategory++;

    if (d.status && !validStatuses.has(d.status.toLowerCase())) nonCanonicalStatus++;
    if (d.type && !validTypes.has(d.type.toLowerCase())) nonCanonicalType++;
    if (!d.goals || !Array.isArray(d.goals) || d.goals.length === 0) missingGoals++;
    if (!d._schemaVersion) missingSchemaVersion++;
    if (!d.cas && !d.casNumber && !d.molecularFormula) missingCasOrMol++;

    if (sampleIssues.length < 10) {
      const issues = [];
      if (!d.name) issues.push('no_name');
      if (!d.slug) issues.push('no_slug');
      if (!d.canonicalKey) issues.push('no_canonicalKey');
      if (!d.categoryId) issues.push('no_categoryId');
      if (!d._schemaVersion) issues.push('no_schemaVersion');
      if (issues.length > 0) {
        sampleIssues.push({ id, issues, currentName: d.name || d.title || 'UNKNOWN' });
      }
    }
  }

  // Check variants in bulk via collectionGroup
  console.log('Auditing variants collectionGroup...');
  const vSnap = await db.collectionGroup('variants').get();
  variantsCount = vSnap.size;
  vSnap.forEach(vd => {
    const v = vd.data();
    if (!v.supplierId && !v.supplier) variantsMissingSupplier++;
    if (!v.pricing || Object.keys(v.pricing).length === 0) variantsMissingPricing++;
  });

  console.log('\n--- 📦 PRODUCTS AUDIT ---');
  console.log(`- Products missing name: ${missingName}`);
  console.log(`- Products using legacy title only: ${legacyTitleOnly}`);
  console.log(`- Products missing slug: ${missingSlug}`);
  console.log(`- Products missing canonicalKey: ${missingCanonicalKey}`);
  console.log(`- Products missing categoryId: ${missingCategoryId}`);
  console.log(`- Products with non-canonical categoryId: ${nonCanonicalCategory}`);
  console.log(`- Products with non-canonical status: ${nonCanonicalStatus}`);
  console.log(`- Products with non-canonical type: ${nonCanonicalType}`);
  console.log(`- Products missing goals: ${missingGoals}`);
  console.log(`- Products missing _schemaVersion: ${missingSchemaVersion}`);
  console.log(`- Products missing CAS/Molecular specs: ${missingCasOrMol}`);
  console.log(`- Total subcollection variants: ${variantsCount}`);
  console.log(`- Variants missing supplierId: ${variantsMissingSupplier}`);
  console.log(`- Variants missing pricing: ${variantsMissingPricing}`);

  // 2. Protocols
  console.log('\n--- 📋 PROTOCOLS AUDIT ---');
  const protocolsSnap = await db.collection('protocols').get();
  console.log(`Total Protocols: ${protocolsSnap.size}`);

  let protoMissingName = 0;
  let protoLegacyProtocolNameOnly = 0;
  let protoMissingSlug = 0;
  let protoMissingDuration = 0;
  let protoMissingPhases = 0;
  let protoMissingGoals = 0;
  let protoNonCanonicalStatus = 0;
  let protoMissingSchemaVersion = 0;

  const validProtoStatuses = new Set(['draft', 'active', 'paused', 'archived', 'published']);

  for (const doc of protocolsSnap.docs) {
    const d = doc.data();
    if (!d.name && d.protocol_name) protoLegacyProtocolNameOnly++;
    if (!d.name && !d.protocol_name && !d.title) protoMissingName++;
    if (!d.slug && !d.protocol_slug) protoMissingSlug++;
    if (!d.duration_weeks && !d.durationWeeks && !d.duration) protoMissingDuration++;
    if ((!d.phases || d.phases.length === 0) && (!d.bom || d.bom.length === 0)) protoMissingPhases++;
    if (!d.goals || !Array.isArray(d.goals) || d.goals.length === 0) protoMissingGoals++;
    if (d.status && !validProtoStatuses.has(d.status.toLowerCase())) protoNonCanonicalStatus++;
    if (!d._schemaVersion) protoMissingSchemaVersion++;
  }

  console.log(`- Protocols missing name: ${protoMissingName}`);
  console.log(`- Protocols using legacy protocol_name only: ${protoLegacyProtocolNameOnly}`);
  console.log(`- Protocols missing slug: ${protoMissingSlug}`);
  console.log(`- Protocols missing duration: ${protoMissingDuration}`);
  console.log(`- Protocols missing phases/BOM: ${protoMissingPhases}`);
  console.log(`- Protocols missing goals: ${protoMissingGoals}`);
  console.log(`- Protocols with non-canonical status: ${protoNonCanonicalStatus}`);
  console.log(`- Protocols missing _schemaVersion: ${protoMissingSchemaVersion}`);

  console.log('\n--- Sample Products with Discrepancies ---');
  console.log(JSON.stringify(sampleIssues.slice(0, 5), null, 2));

  process.exit(0);
}

inspectData().catch(err => {
  console.error('Error during inspection:', err);
  process.exit(1);
});
