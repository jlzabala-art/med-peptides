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

// Ground-Truth Native Currencies
const SUPPLIER_CURRENCIES = {
  'supplier-lotusland': 'USD',
  'lotusland': 'USD',
  'supplier-nplabs': 'EUR',
  'nplabs': 'EUR',
  'np-labs': 'EUR',
  'supplier-europeptides': 'EUR',
  'europeptides': 'EUR',
  'supplier-vallida': 'EUR',
  'vallida': 'EUR',
  'supplier-24genetics': 'EUR',
  '24genetics': 'EUR',
  'supplier-eternadx': 'EUR',
  'eternadx': 'EUR',
  'supplier-fagron-genomics': 'EUR',
  'fagron': 'EUR',
  'supplier-bloodo': 'EUR',
  'bloodo': 'EUR',
  'supplier-bioniq': 'EUR',
  'bioniq': 'EUR',
  'supplier-pod-poland': 'AED',
  'pod-poland': 'AED',
  'pod poland': 'AED',
  'supplier-fusion': 'AED',
  'fusion': 'AED',
  'supplier-magenta': 'USD',
  'magenta': 'USD'
};

function getTargetCurrency(suppId, suppName, docId) {
  const str = `${suppId || ''} ${suppName || ''} ${docId || ''}`.toLowerCase();
  
  if (str.includes('lotusland')) return 'USD';
  if (str.includes('nplabs') || str.includes('np labs') || str.includes('np-labs')) return 'EUR';
  if (str.includes('europeptides')) return 'EUR';
  if (str.includes('vallida')) return 'EUR';
  if (str.includes('24genetics')) return 'EUR';
  if (str.includes('eterna')) return 'EUR';
  if (str.includes('fagron')) return 'EUR';
  if (str.includes('bloodo')) return 'EUR';
  if (str.includes('bioniq')) return 'EUR';
  if (str.includes('pod') || str.includes('poland')) return 'AED';
  if (str.includes('fusion')) return 'AED';
  if (str.includes('magenta')) return 'USD';

  return null;
}

async function fastReconcile() {
  console.log('🚀 Fast Batch Reconciling All Firestore Supplier Currencies...\n');

  // 1. Update Master Suppliers Collection
  for (const [key, curr] of Object.entries({
    'supplier-lotusland': 'USD',
    'supplier-nplabs': 'EUR',
    'supplier-europeptides': 'EUR',
    'supplier-vallida': 'EUR',
    'supplier-24genetics': 'EUR',
    'supplier-eternadx': 'EUR',
    'supplier-fagron-genomics': 'EUR',
    'supplier-bloodo': 'EUR',
    'supplier-bioniq': 'EUR',
    'supplier-pod-poland': 'AED',
    'supplier-fusion': 'AED',
    'supplier-magenta': 'USD'
  })) {
    await db.collection('suppliers').doc(key).set({
      id: key,
      currency: curr,
      defaultCurrency: curr,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }
  console.log('✅ Master Suppliers updated.');

  // 2. Batch Update CollectionGroup('variants')
  const variantGroup = await db.collectionGroup('variants').get();
  console.log(`Processing ${variantGroup.docs.length} variant sub-documents...`);

  let batch = db.batch();
  let operationCount = 0;
  let totalVariantUpdates = 0;

  for (const doc of variantGroup.docs) {
    const data = doc.data();
    const targetCurr = getTargetCurrency(data.supplierId || data.supplier_id, data.supplierName || data.supplier, doc.id);

    if (targetCurr && data.currency !== targetCurr) {
      batch.update(doc.ref, {
        currency: targetCurr,
        origCurrency: targetCurr,
        updatedAt: new Date().toISOString()
      });
      operationCount++;
      totalVariantUpdates++;

      if (operationCount >= 450) {
        await batch.commit();
        batch = db.batch();
        operationCount = 0;
      }
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }

  console.log(`✅ Committed ${totalVariantUpdates} variant sub-document currency fixes.`);

  // 3. Batch Update Products Main Collection
  const productsSnap = await db.collection('products').get();
  let prodBatch = db.batch();
  let prodOpCount = 0;
  let totalProdUpdates = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const targetCurr = getTargetCurrency(data.supplierId || data.supplier_id, data.supplier || data.supplierName, doc.id);

    let inlineModified = false;
    let newVariants = data.variants;

    if (Array.isArray(data.variants)) {
      newVariants = data.variants.map(v => {
        const vCurr = getTargetCurrency(v.supplierId || v.supplier_id, v.supplierName || v.supplier, v.id);
        if (vCurr && v.currency !== vCurr) {
          inlineModified = true;
          return { ...v, currency: vCurr };
        }
        return v;
      });
    }

    if ((targetCurr && data.currency !== targetCurr) || inlineModified) {
      const updates = { updatedAt: new Date().toISOString() };
      if (targetCurr) updates.currency = targetCurr;
      if (inlineModified) updates.variants = newVariants;

      prodBatch.update(doc.ref, updates);
      prodOpCount++;
      totalProdUpdates++;

      if (prodOpCount >= 450) {
        await prodBatch.commit();
        prodBatch = db.batch();
        prodOpCount = 0;
      }
    }
  }

  if (prodOpCount > 0) {
    await prodBatch.commit();
  }

  console.log(`✅ Committed ${totalProdUpdates} main product document currency fixes.`);
  console.log('\n🎉 ALL SUPPLIER CURRENCIES 100% RECONCILED!');
}

fastReconcile().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
