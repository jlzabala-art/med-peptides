import admin from 'firebase-admin';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf8');
const privateKeyLine = envFile.match(/FIREBASE_PRIVATE_KEY=(.*)/)[1];
const privateKey = privateKeyLine.replace(/\\n/g, '\n').replace(/^\"|\"$/g, '');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'med-peptides-app',
      clientEmail: 'firebase-adminsdk-fbsvc@med-peptides-app.iam.gserviceaccount.com',
      privateKey: privateKey
    })
  });
}

const db = admin.firestore();

async function run() {
  console.log('🚀 Starting 24Genetics consolidation & Category Migration...\n');

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. BACKUP CURRENT STATE
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('📦 Step 1: Creating safety backup of affected products...');
  const allProductsSnap = await db.collection('products').get();
  const backupData = [];

  allProductsSnap.forEach(doc => {
    const data = doc.data();
    const cat = (data.category || '').toLowerCase();
    const id = doc.id;
    if (
      cat.includes('diag') || 
      cat.includes('test') || 
      id.includes('24genetics') || 
      id.includes('eterna') || 
      id.includes('fagron')
    ) {
      backupData.push({ id, ...data });
    }
  });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `./scripts/migration/backup_genomics_${timestamp}.json`;
  fs.mkdirSync('./scripts/migration', { recursive: true });
  fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
  console.log(`✓ Backup saved: ${backupPath} (${backupData.length} products backed up)\n`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. CONSOLIDATE 24GENETICS DNA TESTS INTO SINGLE CANONICAL PRODUCT
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('🧬 Step 2: Consolidating 24Genetics tests into 24genetics-dna-tests...');

  const individual24GIds = [
    { id: '24genetics-all-in-one', variantId: 'all-in-one', name: 'All in One DNA Test (Full 7 Reports)', sortOrder: 1, isDefault: true },
    { id: '24genetics-all-in-one-plus', variantId: 'all-in-one-plus', name: 'All in One Plus DNA Test (7 Reports + Raw Data)', sortOrder: 2 },
    { id: '24genetics-health', variantId: 'health', name: 'Health DNA Panel', sortOrder: 3 },
    { id: '24genetics-pharmacogenetics', variantId: 'pharmacogenetics', name: 'Pharmacogenetics Plus DNA Panel', sortOrder: 4 },
    { id: '24genetics-nutrigenetics', variantId: 'nutrigenetics', name: 'Nutrigenetics DNA Panel', sortOrder: 5 },
    { id: '24genetics-sport', variantId: 'sport', name: 'Sport & Fitness DNA Panel', sortOrder: 6 },
    { id: '24genetics-skin', variantId: 'skin', name: 'Skin & Hair DNA Panel', sortOrder: 7 },
    { id: '24genetics-ancestry', variantId: 'ancestry', name: 'Ancestry DNA Panel', sortOrder: 8 },
    { id: '24genetics-personality', variantId: 'personality', name: 'Personality & Talent DNA Panel', sortOrder: 9 },
  ];

  const canonicalProductId = '24genetics-dna-tests';
  const canonicalProductRef = db.collection('products').doc(canonicalProductId);

  const consolidatedProduct = {
    id: canonicalProductId,
    canonicalId: canonicalProductId,
    name: '24Genetics DNA Tests & Genomic Panels',
    canonicalName: '24Genetics DNA Tests & Genomic Panels',
    displayName: '24Genetics DNA Tests & Genomic Panels',
    category: 'genomics_biomarkers',
    productType: 'genomics_biomarkers',
    primaryType: 'genomics_biomarkers',
    availableTypes: ['genomics_biomarkers'],
    format: 'kit',
    presentation: 'saliva_swab',
    presentationName: 'Buccal Swab (Saliva)',
    vendor: '24Genetics',
    brand: '24Genetics',
    supplier: '24Genetics S.L.',
    supplierId: 'supplier-24genetics',
    status: 'active',
    isActive: true,
    variantsCount: 9,
    description: 'Comprehensive non-diagnostic direct-to-consumer genomic and health profiling panels powered by high-density DNA microarrays (700,000+ SNPs). Non-invasive buccal swab sample.',
    sampleType: 'Saliva (Buccal Swab)',
    turnaroundTime: '3-4 Weeks',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await canonicalProductRef.set(consolidatedProduct, { merge: true });
  console.log(`✓ Created canonical product: ${canonicalProductId}`);

  // Add 9 variants to subcollection
  for (const item of individual24GIds) {
    const origDoc = await db.collection('products').doc(item.id).get();
    const origData = origDoc.exists ? origDoc.data() : {};

    let origVariant = {};
    if (origDoc.exists) {
      const vSnap = await origDoc.ref.collection('variants').get();
      if (!vSnap.empty) {
        origVariant = vSnap.docs[0].data();
      }
    }

    const unitPrice = origVariant.unit_price || 149;
    const wholesale = origVariant.wholesalePrice || Math.round(unitPrice * 1.2 * 100) / 100;
    const clinic = origVariant.clinicPrice || Math.round(unitPrice * 1.35 * 100) / 100;
    const retail = origVariant.retailPrice || Math.round(unitPrice * 1.5 * 100) / 100;

    const variantDoc = {
      ...origVariant,
      id: item.variantId,
      variantId: item.variantId,
      name: item.name,
      label: item.name,
      dosage: item.name,
      dose: '1 Kit',
      format: 'kit',
      presentation: 'saliva_swab',
      presentationName: 'Buccal Swab (Saliva)',
      sampleType: 'Saliva (Buccal Swab)',
      turnaroundTime: '3-4 Weeks',
      type: 'genomics_biomarkers',
      category: 'genomics_biomarkers',
      unit_price: unitPrice,
      price: unitPrice,
      cost_1: unitPrice,
      wholesalePrice: wholesale,
      clinicPrice: clinic,
      retailPrice: retail,
      pricing: {
        master: { perUnit: unitPrice, currency: 'USD' },
        wholesale: { perUnit: wholesale, currency: 'USD' },
        clinic: { perUnit: clinic, currency: 'USD' },
        retail: { perUnit: retail, currency: 'USD' }
      },
      sortOrder: item.sortOrder,
      isDefault: !!item.isDefault,
      status: 'active',
      isActive: true,
      supplier: '24Genetics S.L.',
      supplierId: 'supplier-24genetics',
      supplierName: '24Genetics S.L.',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await canonicalProductRef.collection('variants').doc(item.variantId).set(variantDoc, { merge: true });
    console.log(`  ✓ Variant migrated: ${item.variantId} (${item.name})`);

    // Delete obsolete individual product and variants
    if (origDoc.exists) {
      const vs = await origDoc.ref.collection('variants').get();
      for (const d of vs.docs) await d.ref.delete();
      await origDoc.ref.delete();
      console.log(`  🗑️ Deleted obsolete product: ${item.id}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. FIX 24GENETICS AI CONNECT SUBSCRIPTION PRICING
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n💻 Step 3: Updating 24Genetics AI Connect Subscription pricing...');
  const subRef = db.collection('products').doc('24genetics-ai-connect-subscription');
  const subDoc = await subRef.get();

  if (subDoc.exists) {
    await subRef.update({
      category: 'service',
      productType: 'service',
      primaryType: 'service',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Update monthly variant
    await subRef.collection('variants').doc('monthly').set({
      dosage: 'Monthly Billing',
      label: 'Monthly Subscription',
      billingInterval: 'monthly',
      billingCycle: 'monthly',
      periodMonths: 1,
      unit_price: 9.99,
      price: 9.99,
      wholesalePrice: 11.99,
      clinicPrice: 13.99,
      retailPrice: 14.99,
      pricing: {
        master: { perUnit: 9.99, currency: 'EUR' },
        wholesale: { perUnit: 11.99, currency: 'EUR' },
        clinic: { perUnit: 13.99, currency: 'EUR' },
        retail: { perUnit: 14.99, currency: 'EUR' }
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✓ Updated monthly subscription variant: $9.99 / month');

    // Update annual variant
    await subRef.collection('variants').doc('annual').set({
      dosage: 'Annual Billing',
      label: 'Annual Subscription (12 Months)',
      billingInterval: 'annual',
      billingCycle: 'annual',
      periodMonths: 12,
      unit_price: 99.99,
      price: 99.99,
      wholesalePrice: 119.99,
      clinicPrice: 139.99,
      retailPrice: 149.99,
      pricing: {
        master: { perUnit: 99.99, currency: 'EUR' },
        wholesale: { perUnit: 119.99, currency: 'EUR' },
        clinic: { perUnit: 139.99, currency: 'EUR' },
        retail: { perUnit: 149.99, currency: 'EUR' }
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log('✓ Updated annual subscription variant: $99.99 / year (effective $8.33 / month)');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. MIGRATE 'diagnostic', 'diagnostic_test', 'genetic_test' TO 'genomics_biomarkers'
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n🏷️ Step 4: Migrating categories to "genomics_biomarkers"...');
  const prodsToUpdateSnap = await db.collection('products').get();
  let migratedCount = 0;

  for (const doc of prodsToUpdateSnap.docs) {
    const p = doc.data();
    const cat = (p.category || '').toLowerCase();
    const type = (p.productType || p.primaryType || p.type || '').toLowerCase();

    if (
      cat === 'diagnostic' || 
      cat === 'diagnostic_test' || 
      cat === 'genetic_test' ||
      type === 'diagnostic' ||
      type === 'diagnostic_test' ||
      type === 'genetic_test'
    ) {
      await doc.ref.update({
        category: 'genomics_biomarkers',
        productType: 'genomics_biomarkers',
        primaryType: 'genomics_biomarkers',
        availableTypes: admin.firestore.FieldValue.arrayUnion('genomics_biomarkers'),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      migratedCount++;
      console.log(`  ✓ Migrated: [${doc.id}] ${p.name} -> category: 'genomics_biomarkers'`);
    }
  }
  console.log(`\n🎉 Successfully migrated ${migratedCount} products to category 'genomics_biomarkers'.`);
}

run().catch(console.error);
