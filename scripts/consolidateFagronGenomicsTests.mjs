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
  console.log('🚀 Consolidating Fagron Genomics tests into a single product...\n');

  // Strict list of ONLY the genomic test product IDs (DO NOT TOUCH ANY RAW APIS OR VEHICLES)
  const fagronTestList = [
    { id: 'fagron-trichotest', variantId: 'trichotest', name: 'Fagron TrichoTest™ (Alopecia & Hair Loss)', unitPrice: 155, sortOrder: 1, isDefault: true },
    { id: 'fagron-nutrigen', variantId: 'nutrigen', name: 'Fagron NutriGen™ (Nutrigenetics & Weight Loss)', unitPrice: 150, sortOrder: 2 },
    { id: 'fagron-acnetest', variantId: 'acnetest', name: 'Fagron AcneTest™ (Personalized Dermatology)', unitPrice: 150, sortOrder: 3 },
    { id: 'fagron-telotest', variantId: 'telotest', name: 'Fagron TeloTest™ (Telomeres & Cellular Aging)', unitPrice: 160, sortOrder: 4 },
    { id: 'fagron-sportgen', variantId: 'sportgen', name: 'Fagron SportGen™ (Athletic Performance)', unitPrice: 179, sortOrder: 5 },
  ];

  const canonicalProductId = 'fagron-genomics-dna-tests';
  const canonicalProductRef = db.collection('products').doc(canonicalProductId);

  const baseProduct = {
    id: canonicalProductId,
    canonicalId: canonicalProductId,
    name: 'Fagron Genomics DNA Tests & Panels',
    canonicalName: 'Fagron Genomics DNA Tests & Panels',
    displayName: 'Fagron Genomics DNA Tests & Panels',
    category: 'genomics_biomarkers',
    productType: 'genomics_biomarkers',
    primaryType: 'genomics_biomarkers',
    availableTypes: ['genomics_biomarkers'],
    format: 'kit',
    presentation: 'saliva_swab',
    presentationName: 'Buccal Swab (Saliva)',
    vendor: 'Fagron Genomics',
    brand: 'Fagron Genomics',
    supplier: 'Fagron Genomics S.L.',
    supplierId: 'supplier-fagron-genomics',
    status: 'active',
    isActive: true,
    variantsCount: fagronTestList.length,
    description: 'Precision genomic testing kits by Fagron Genomics for personalized clinical formulas (alopecia, nutrigenetics, acne, biological aging and athletic performance). DNA microarray genotyping via non-invasive buccal swab.',
    sampleType: 'Saliva (Buccal Swab)',
    turnaroundTime: '10-14 Business Days',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await canonicalProductRef.set(baseProduct, { merge: true });
  console.log(`✓ Created canonical product: ${canonicalProductId}`);

  for (const item of fagronTestList) {
    const origDoc = await db.collection('products').doc(item.id).get();
    let origVariant = {};

    if (origDoc.exists) {
      const vSnap = await origDoc.ref.collection('variants').get();
      if (!vSnap.empty) {
        origVariant = vSnap.docs[0].data();
      }
    }

    const unitPrice = origVariant.unit_price || item.unitPrice;
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
      turnaroundTime: '10-14 Business Days',
      type: 'genomics_biomarkers',
      category: 'genomics_biomarkers',
      unit_price: unitPrice,
      price: unitPrice,
      cost_1: unitPrice,
      wholesalePrice: wholesale,
      clinicPrice: clinic,
      retailPrice: retail,
      pricing: {
        master: { perUnit: unitPrice, currency: 'EUR' },
        wholesale: { perUnit: wholesale, currency: 'EUR' },
        clinic: { perUnit: clinic, currency: 'EUR' },
        retail: { perUnit: retail, currency: 'EUR' }
      },
      sortOrder: item.sortOrder,
      isDefault: !!item.isDefault,
      status: 'active',
      isActive: true,
      supplier: 'Fagron Genomics S.L.',
      supplierId: 'supplier-fagron-genomics',
      supplierName: 'Fagron Genomics S.L.',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await canonicalProductRef.collection('variants').doc(item.variantId).set(variantDoc, { merge: true });
    console.log(`  ✓ Variant added: ${item.variantId} (${item.name}) - Cost: €${unitPrice}`);

    // Delete obsolete individual product document & subcollection
    if (origDoc.exists) {
      const vs = await origDoc.ref.collection('variants').get();
      for (const d of vs.docs) await d.ref.delete();
      await origDoc.ref.delete();
      console.log(`  🗑️ Deleted obsolete product: ${item.id}`);
    }
  }

  console.log('\n🎉 Successfully consolidated Fagron Genomics tests into 1 product without touching any APIs or compounding bases.');
}

run().catch(console.error);
