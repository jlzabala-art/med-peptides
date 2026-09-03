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

async function cleanDiagnosticPresentations() {
  console.log('🚀 Starting Diagnostic & Genetic Test Presentation Cleanup in Firestore...');

  // 1. Load all products for category / name context
  const pSnap = await db.collection('products').get();
  const products = {};
  pSnap.forEach(d => { products[d.id] = { id: d.id, ...d.data(), ref: d.ref }; });

  const vSnap = await db.collectionGroup('variants').get();
  console.log(`Auditing ${vSnap.size} variants across ${pSnap.size} products...`);

  let batch = db.batch();
  let opCount = 0;
  let updatedCount = 0;

  for (const vd of vSnap.docs) {
    const v = vd.data();
    const parentId = vd.ref.parent.parent ? vd.ref.parent.parent.id : null;
    const prod = parentId ? products[parentId] : null;
    if (!prod) continue;

    const nameLower = (prod.name || '').toLowerCase();
    const catLower = (prod.category || '').toLowerCase();
    const pTypeLower = (prod.productType || '').toLowerCase();
    const formatLower = String(v.format || '').toLowerCase();
    const presLower = String(v.presentation || '').toLowerCase();

    // Check if it is a diagnostic, test, service, or accessory
    const isDnaOrGenetics = 
      nameLower.includes('dna') || 
      nameLower.includes('genetic') || 
      nameLower.includes('nutrigen') ||
      nameLower.includes('ancestry') ||
      nameLower.includes('microbiome') ||
      nameLower.includes('trichotest') ||
      nameLower.includes('acnetest') ||
      nameLower.includes('telotest') ||
      nameLower.includes('sportgen');

    const isDigitalService = 
      nameLower.includes('subscription') || 
      nameLower.includes('connect') ||
      catLower === 'service' ||
      pTypeLower === 'service' ||
      formatLower === 'digital';

    const isBloodTest = 
      (nameLower.includes('blood') || 
       nameLower.includes('cortisol') ||
       nameLower.includes('hba1c') ||
       nameLower.includes('hemoglobin') ||
       nameLower.includes('omega') ||
       nameLower.includes('agescan') ||
       nameLower.includes('epigenetic') ||
       (nameLower.includes('test') && (nameLower.includes('nad') || nameLower.includes('testosterone') || nameLower.includes('vitamin d')))) &&
      !isDnaOrGenetics &&
      !isDigitalService;

    const isKitOrBundle = 
      (nameLower.includes('bundle') || nameLower.includes('starter kit')) && 
      !nameLower.includes('vial');

    // Only touch items that are NOT legitimate injectable peptides/hormones
    const isActualPeptide = 
      (nameLower.includes('bpc') || nameLower.includes('semaglutide') || nameLower.includes('cjc') || 
       nameLower.includes('ipamorelin') || nameLower.includes('testagen') || nameLower.includes('vip-vasoactive')) && 
      !nameLower.includes('test');

    if (isActualPeptide) continue;

    let targetPres = null;
    let targetPresName = null;
    let targetFormat = null;

    if (isDigitalService) {
      targetPres = 'digital';
      targetPresName = 'Digital Service';
      targetFormat = 'digital';
    } else if (isDnaOrGenetics) {
      targetPres = 'kit';
      targetPresName = 'DNA Test Kit';
      targetFormat = 'kit';
    } else if (isBloodTest) {
      targetPres = 'blood_test';
      targetPresName = 'Blood Test';
      targetFormat = 'blood_test';
    } else if (isKitOrBundle) {
      targetPres = 'kit';
      targetPresName = 'Kit';
      targetFormat = 'kit';
    } else if (catLower === 'diagnostic' || catLower === 'genetic_test' || catLower === 'diagnostic_test') {
      targetPres = 'kit';
      targetPresName = 'Diagnostic Kit';
      targetFormat = 'kit';
    }

    if (targetPres && (presLower === 'vial' || formatLower === 'vial' || !v.presentation || !v.format)) {
      console.log(`[FIX] ${prod.name} -> Variant ${vd.id}: "${v.presentation}" => "${targetPres}" (${targetPresName})`);
      
      const updateData = {
        presentation: targetPres,
        presentationName: targetPresName,
        format: targetFormat,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      batch.set(vd.ref, updateData, { merge: true });
      opCount++;
      updatedCount++;

      // Also ensure parent product does not have format: 'vial'
      if (prod.format === 'vial' || prod.presentation === 'vial') {
        batch.set(prod.ref, {
          presentation: targetPres,
          format: targetFormat,
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
  }

  console.log(`\n🎉 Successfully updated ${updatedCount} variants in Firestore!`);
}

cleanDiagnosticPresentations().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
