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

// Ground-Truth Native Currency Mapping per Supplier
const GROUND_TRUTH_CURRENCIES = {
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
};

async function reconcileAllSupplierCurrencies() {
  console.log('🚀 Starting Global Reconciliation of Supplier Native Currencies...\n');

  // 1. Update master suppliers collection
  for (const [suppId, targetCurrency] of Object.entries(GROUND_TRUTH_CURRENCIES)) {
    const suppRef = db.collection('suppliers').doc(suppId);
    const snap = await suppRef.get();
    if (snap.exists) {
      await suppRef.update({
        currency: targetCurrency,
        defaultCurrency: targetCurrency,
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Master Supplier [${suppId}] -> Set currency = '${targetCurrency}'`);
    } else {
      await suppRef.set({
        id: suppId,
        currency: targetCurrency,
        defaultCurrency: targetCurrency,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log(`✨ Created Master Supplier [${suppId}] -> Set currency = '${targetCurrency}'`);
    }
  }

  // 2. Update collectionGroup('variants')
  const variantGroup = await db.collectionGroup('variants').get();
  console.log(`\n📦 Auditing & Reconciling ${variantGroup.docs.length} variant sub-documents...`);
  let updatedVariants = 0;

  for (const doc of variantGroup.docs) {
    const data = doc.data();
    const suppId = (data.supplierId || data.supplier_id || '').toLowerCase();
    const suppName = (data.supplierName || data.supplier || '').toLowerCase();
    const docId = doc.id.toLowerCase();

    // Determine target currency based on supplier ID or variant ID patterns
    let targetCurr = null;
    for (const [key, curr] of Object.entries(GROUND_TRUTH_CURRENCIES)) {
      const cleanKey = key.replace('supplier-', '');
      if (
        suppId === key || 
        suppId.includes(cleanKey) || 
        suppName.includes(cleanKey.replace('-', ' ')) ||
        docId.includes(cleanKey)
      ) {
        targetCurr = curr;
        break;
      }
    }

    if (targetCurr && data.currency !== targetCurr) {
      await doc.ref.update({
        currency: targetCurr,
        origCurrency: targetCurr,
        updatedAt: new Date().toISOString()
      });
      updatedVariants++;
    }
  }

  console.log(`✅ Reconciled ${updatedVariants} variant sub-documents to their true native currencies.`);

  // 3. Update main products collection
  const productsSnap = await db.collection('products').get();
  let updatedProducts = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const suppId = (data.supplierId || data.supplier_id || '').toLowerCase();
    const suppName = (data.supplier || data.supplierName || '').toLowerCase();
    const docId = doc.id.toLowerCase();

    let targetCurr = null;
    for (const [key, curr] of Object.entries(GROUND_TRUTH_CURRENCIES)) {
      const cleanKey = key.replace('supplier-', '');
      if (
        suppId === key || 
        suppId.includes(cleanKey) || 
        suppName.includes(cleanKey.replace('-', ' ')) ||
        docId.includes(cleanKey)
      ) {
        targetCurr = curr;
        break;
      }
    }

    let inlineModified = false;
    if (Array.isArray(data.variants)) {
      data.variants.forEach(v => {
        const vSuppId = (v.supplierId || v.supplier_id || '').toLowerCase();
        const vSuppName = (v.supplierName || v.supplier || '').toLowerCase();
        const vId = (v.id || '').toLowerCase();

        for (const [key, curr] of Object.entries(GROUND_TRUTH_CURRENCIES)) {
          const cleanKey = key.replace('supplier-', '');
          if (
            vSuppId === key || 
            vSuppId.includes(cleanKey) || 
            vSuppName.includes(cleanKey.replace('-', ' ')) ||
            vId.includes(cleanKey)
          ) {
            if (v.currency !== curr) {
              v.currency = curr;
              inlineModified = true;
            }
            break;
          }
        }
      });
    }

    if ((targetCurr && data.currency !== targetCurr) || inlineModified) {
      const updateData = { updatedAt: new Date().toISOString() };
      if (targetCurr) updateData.currency = targetCurr;
      if (inlineModified) updateData.variants = data.variants;

      await doc.ref.update(updateData);
      updatedProducts++;
    }
  }

  console.log(`✅ Reconciled ${updatedProducts} main product documents.`);
  console.log('\n🎉 GLOBAL CURRENCY RECONCILIATION COMPLETED SUCCESSFULLY!');
}

reconcileAllSupplierCurrencies().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
