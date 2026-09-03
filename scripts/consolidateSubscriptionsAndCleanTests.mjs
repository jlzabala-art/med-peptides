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
  console.log('🚀 [1/3] Cleaning diagnostic, DNA test, and blood test presentations in Firestore...');

  const pSnap = await db.collection('products').get();
  const products = {};
  pSnap.forEach(d => { products[d.id] = { id: d.id, ...d.data(), ref: d.ref }; });

  const vSnap = await db.collectionGroup('variants').get();
  console.log(`Found ${vSnap.size} total variants in Firestore.`);

  let batch = db.batch();
  let opCount = 0;
  let fixedCount = 0;

  for (const vd of vSnap.docs) {
    const v = vd.data();
    const parentId = vd.ref.parent.parent ? vd.ref.parent.parent.id : null;
    const prod = parentId ? products[parentId] : null;
    if (!prod) continue;

    const nameLower = (prod.name || '').toLowerCase();
    const catLower = (prod.category || '').toLowerCase();
    const presLower = String(v.presentation || '').toLowerCase();
    const formatLower = String(v.format || '').toLowerCase();

    // Skip actual injectable peptides/hormones
    const isActualPeptide = 
      (nameLower.includes('bpc') || nameLower.includes('semaglutide') || nameLower.includes('cjc') || 
       nameLower.includes('ipamorelin') || nameLower.includes('testagen') || nameLower.includes('vip-vasoactive')) && 
      !nameLower.includes('test');
    if (isActualPeptide) continue;

    const isDna = 
      nameLower.includes('dna') || 
      nameLower.includes('genetic') || 
      nameLower.includes('nutrigen') ||
      nameLower.includes('ancestry') ||
      nameLower.includes('microbiome') ||
      nameLower.includes('trichotest') ||
      nameLower.includes('acnetest') ||
      nameLower.includes('telotest') ||
      nameLower.includes('sportgen');

    const isDigital = 
      nameLower.includes('subscription') || 
      nameLower.includes('connect') ||
      catLower === 'service';

    const isBlood = 
      (nameLower.includes('blood') || 
       nameLower.includes('cortisol') ||
       nameLower.includes('hba1c') ||
       nameLower.includes('hemoglobin') ||
       nameLower.includes('omega') ||
       nameLower.includes('agescan') ||
       nameLower.includes('epigenetic') ||
       (nameLower.includes('test') && (nameLower.includes('nad') || nameLower.includes('testosterone') || nameLower.includes('vitamin d')))) &&
      !isDna && !isDigital;

    const isBundle = (nameLower.includes('bundle') || nameLower.includes('starter kit')) && !nameLower.includes('vial');

    let newPres = null;
    let newPresName = null;
    let newFormat = null;

    if (isDigital) {
      newPres = 'digital';
      newPresName = 'Digital Service';
      newFormat = 'digital';
    } else if (isDna) {
      newPres = 'kit';
      newPresName = 'DNA Test Kit';
      newFormat = 'kit';
    } else if (isBlood) {
      newPres = 'blood_test';
      newPresName = 'Blood Test';
      newFormat = 'blood_test';
    } else if (isBundle) {
      newPres = 'kit';
      newPresName = 'Kit';
      newFormat = 'kit';
    } else if (catLower === 'diagnostic' || catLower === 'genetic_test' || catLower === 'diagnostic_test') {
      newPres = 'kit';
      newPresName = 'Diagnostic Kit';
      newFormat = 'kit';
    }

    if (newPres && (presLower === 'vial' || formatLower === 'vial' || !v.presentation || !v.format)) {
      batch.set(vd.ref, {
        presentation: newPres,
        presentationName: newPresName,
        format: newFormat,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      opCount++;
      fixedCount++;

      if (prod.presentation === 'vial' || prod.format === 'vial') {
        batch.set(prod.ref, {
          presentation: newPres,
          format: newFormat,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        opCount++;
      }

      if (opCount >= 400) {
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }
    }
  }

  if (opCount > 0) {
    await batch.commit();
    batch = db.batch();
    opCount = 0;
  }
  console.log(`✓ Cleaned ${fixedCount} variant presentation entries in Firestore.`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Consolidate 24Genetics AI Connect Subscription
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n🚀 [2/3] Consolidating 24Genetics AI Connect Subscription into single product with variants...');
  const gAnnualDoc = await db.collection('products').doc('24genetics-ai-subscription-annual').get();
  const gMonthlyDoc = await db.collection('products').doc('24genetics-ai-subscription-monthly').get();

  const gAnnualData = gAnnualDoc.exists ? gAnnualDoc.data() : {};
  const gMonthlyData = gMonthlyDoc.exists ? gMonthlyDoc.data() : {};

  // Fetch their variants
  let gAnnualVariant = {};
  if (gAnnualDoc.exists) {
    const vs = await gAnnualDoc.ref.collection('variants').get();
    if (!vs.empty) gAnnualVariant = vs.docs[0].data();
  }
  let gMonthlyVariant = {};
  if (gMonthlyDoc.exists) {
    const vs = await gMonthlyDoc.ref.collection('variants').get();
    if (!vs.empty) gMonthlyVariant = vs.docs[0].data();
  }

  const consolidated24GId = '24genetics-ai-connect-subscription';
  const consolidated24GRef = db.collection('products').doc(consolidated24GId);

  const base24GProduct = {
    id: consolidated24GId,
    canonicalId: consolidated24GId,
    name: '24Genetics AI Connect Subscription',
    canonicalName: '24Genetics AI Connect Subscription',
    displayName: '24Genetics AI Connect Subscription',
    category: 'service',
    productType: 'service',
    primaryType: 'service',
    availableTypes: ['service'],
    format: 'digital',
    presentation: 'digital',
    presentationName: 'Digital Service',
    vendor: '24Genetics',
    brand: '24Genetics',
    supplier: '24Genetics S.L.',
    supplierId: 'supplier-24genetics',
    status: 'active',
    isActive: true,
    variantsCount: 2,
    description: gAnnualData.description || gMonthlyData.description || '24Genetics AI Connect cloud interpretation and genetic insights service.',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await consolidated24GRef.set(base24GProduct, { merge: true });

  // Add Annual Variant
  await consolidated24GRef.collection('variants').doc('annual').set({
    ...gAnnualVariant,
    id: 'annual',
    variantId: 'annual',
    dosage: 'Annual Billing',
    label: 'Annual Billing (1 Year Access)',
    billingInterval: 'annual',
    cadence: 'annual',
    format: 'digital',
    presentation: 'digital',
    presentationName: 'Annual Subscription',
    type: 'service',
    status: 'active',
    isActive: true,
    supplierId: 'supplier-24genetics',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Add Monthly Variant
  await consolidated24GRef.collection('variants').doc('monthly').set({
    ...gMonthlyVariant,
    id: 'monthly',
    variantId: 'monthly',
    dosage: 'Monthly Billing',
    label: 'Monthly Billing (Flexible)',
    billingInterval: 'monthly',
    cadence: 'monthly',
    format: 'digital',
    presentation: 'digital',
    presentationName: 'Monthly Subscription',
    type: 'service',
    status: 'active',
    isActive: true,
    supplierId: 'supplier-24genetics',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Delete legacy products and subcollections
  if (gAnnualDoc.exists) {
    const vs = await gAnnualDoc.ref.collection('variants').get();
    for (const d of vs.docs) await d.ref.delete();
    await gAnnualDoc.ref.delete();
    console.log('✓ Deleted legacy 24genetics-ai-subscription-annual');
  }
  if (gMonthlyDoc.exists) {
    const vs = await gMonthlyDoc.ref.collection('variants').get();
    for (const d of vs.docs) await d.ref.delete();
    await gMonthlyDoc.ref.delete();
    console.log('✓ Deleted legacy 24genetics-ai-subscription-monthly');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Consolidate Eterna DX Pro Subscription
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n🚀 [3/3] Consolidating Eterna DX Pro Subscription into single product with variants...');
  const eAnnualDoc = await db.collection('products').doc('eternadx-pro-subscription-annual').get();
  const eMonthlyDoc = await db.collection('products').doc('eternadx-pro-subscription-monthly').get();

  const eAnnualData = eAnnualDoc.exists ? eAnnualDoc.data() : {};
  const eMonthlyData = eMonthlyDoc.exists ? eMonthlyDoc.data() : {};

  let eAnnualVariant = {};
  if (eAnnualDoc.exists) {
    const vs = await eAnnualDoc.ref.collection('variants').get();
    if (!vs.empty) eAnnualVariant = vs.docs[0].data();
  }
  let eMonthlyVariant = {};
  if (eMonthlyDoc.exists) {
    const vs = await eMonthlyDoc.ref.collection('variants').get();
    if (!vs.empty) eMonthlyVariant = vs.docs[0].data();
  }

  const consolidatedEDxId = 'eternadx-pro-subscription';
  const consolidatedEDxRef = db.collection('products').doc(consolidatedEDxId);

  const baseEDxProduct = {
    id: consolidatedEDxId,
    canonicalId: consolidatedEDxId,
    name: 'Eterna DX Pro Subscription',
    canonicalName: 'Eterna DX Pro Subscription',
    displayName: 'Eterna DX Pro Subscription',
    category: 'service',
    productType: 'service',
    primaryType: 'service',
    availableTypes: ['service'],
    format: 'digital',
    presentation: 'digital',
    presentationName: 'Digital Service',
    vendor: 'EternaDx',
    brand: 'EternaDx',
    status: 'active',
    isActive: true,
    variantsCount: 2,
    description: eAnnualData.description || eMonthlyData.description || 'Eterna DX Pro ongoing longitudinal biomarker & epigenetic monitoring platform.',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  await consolidatedEDxRef.set(baseEDxProduct, { merge: true });

  await consolidatedEDxRef.collection('variants').doc('annual').set({
    ...eAnnualVariant,
    id: 'annual',
    variantId: 'annual',
    dosage: 'Annual Billing',
    label: 'Annual Billing (1 Year Access)',
    billingInterval: 'annual',
    cadence: 'annual',
    format: 'digital',
    presentation: 'digital',
    presentationName: 'Annual Subscription',
    type: 'service',
    status: 'active',
    isActive: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  await consolidatedEDxRef.collection('variants').doc('monthly').set({
    ...eMonthlyVariant,
    id: 'monthly',
    variantId: 'monthly',
    dosage: 'Monthly Billing',
    label: 'Monthly Billing (Flexible)',
    billingInterval: 'monthly',
    cadence: 'monthly',
    format: 'digital',
    presentation: 'digital',
    presentationName: 'Monthly Subscription',
    type: 'service',
    status: 'active',
    isActive: true,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  if (eAnnualDoc.exists) {
    const vs = await eAnnualDoc.ref.collection('variants').get();
    for (const d of vs.docs) await d.ref.delete();
    await eAnnualDoc.ref.delete();
    console.log('✓ Deleted legacy eternadx-pro-subscription-annual');
  }
  if (eMonthlyDoc.exists) {
    const vs = await eMonthlyDoc.ref.collection('variants').get();
    for (const d of vs.docs) await d.ref.delete();
    await eMonthlyDoc.ref.delete();
    console.log('✓ Deleted legacy eternadx-pro-subscription-monthly');
  }

  console.log('\n🎉 ALL DATABASE UPDATES COMPLETED SUCCESSFULLY!');
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
