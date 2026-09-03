const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const saPath = path.join(__dirname, 'serviceAccountKey.json');
let credential;
if (fs.existsSync(saPath)) {
  credential = admin.credential.cert(require(saPath));
} else {
  require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
  let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
  if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
    rawPk = rawPk.slice(1, -1);
  }
  const formattedPk = rawPk.replace(/\\n/g, '\n');
  credential = admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: formattedPk,
  });
}

if (!admin.apps.length) {
  admin.initializeApp({ credential });
}

const db = admin.firestore();

async function fixNPLabsCurrencyGlobal() {
  console.log('🔄 Performing global audit for all NP LABS documents & subcollection variants in Firestore...');
  let updatedSubDocs = 0;
  let updatedMainDocs = 0;

  // 1. Audit collectionGroup('variants')
  const variantGroup = await db.collectionGroup('variants').get();
  console.log(`Auditing ${variantGroup.docs.length} variant sub-documents across all products...`);

  for (const doc of variantGroup.docs) {
    const data = doc.data();
    const isNPLabs = 
      (data.supplierId || '').toLowerCase().includes('nplabs') ||
      (data.supplier_id || '').toLowerCase().includes('nplabs') ||
      (data.supplierName || '').toLowerCase().includes('np labs') ||
      (data.supplier || '').toLowerCase().includes('np labs') ||
      doc.id.toLowerCase().includes('np-labs') ||
      doc.id.toLowerCase().includes('nplabs');

    if (isNPLabs) {
      if (data.currency !== 'EUR') {
        await doc.ref.update({
          currency: 'EUR',
          updatedAt: new Date().toISOString()
        });
        updatedSubDocs++;
        console.log(`✅ Updated variant sub-doc [${doc.id}] -> currency: 'EUR'`);
      }
    }
  }

  // 2. Audit products main collection
  const productsSnap = await db.collection('products').get();
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const isNPLabsMain = 
      (data.supplierId || '').toLowerCase().includes('nplabs') ||
      (data.supplier || '').toLowerCase().includes('np labs') ||
      (data.supplierName || '').toLowerCase().includes('np labs');

    if (isNPLabsMain && data.currency !== 'EUR') {
      await doc.ref.update({
        currency: 'EUR',
        updatedAt: new Date().toISOString()
      });
      updatedMainDocs++;
      console.log(`✅ Updated product main doc [${doc.id}] -> currency: 'EUR'`);
    }

    // Also update any inline variants array inside main product doc if present
    if (Array.isArray(data.variants)) {
      let inlineModified = false;
      data.variants.forEach(v => {
        const isNPLabsVar = 
          (v.supplierId || '').toLowerCase().includes('nplabs') ||
          (v.supplier_id || '').toLowerCase().includes('nplabs') ||
          (v.supplierName || '').toLowerCase().includes('np labs') ||
          (v.supplier || '').toLowerCase().includes('np labs') ||
          (v.id || '').toLowerCase().includes('np-labs') ||
          (v.id || '').toLowerCase().includes('nplabs');

        if (isNPLabsVar && v.currency !== 'EUR') {
          v.currency = 'EUR';
          inlineModified = true;
        }
      });

      if (inlineModified) {
        await doc.ref.update({
          variants: data.variants,
          updatedAt: new Date().toISOString()
        });
        console.log(`✅ Updated inline variants array in main doc [${doc.id}] -> currency: 'EUR'`);
      }
    }
  }

  // 3. Audit suppliers collection
  const supplierDocRef = db.collection('suppliers').doc('supplier-nplabs');
  const suppDoc = await supplierDocRef.get();
  if (suppDoc.exists && suppDoc.data().currency !== 'EUR') {
    await supplierDocRef.update({
      currency: 'EUR',
      defaultCurrency: 'EUR',
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Updated supplier-nplabs master document -> currency: 'EUR'`);
  }

  console.log(`🎉 COMPLETED GLOBAL AUDIT! Updated ${updatedSubDocs} variant sub-docs and ${updatedMainDocs} product docs to EUR.`);
}

fixNPLabsCurrencyGlobal().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
