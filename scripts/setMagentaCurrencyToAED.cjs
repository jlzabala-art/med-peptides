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

async function setMagentaCurrencyToAED() {
  console.log('🚀 Updating Magenta Supplier and all Magenta Variants to AED currency...\n');

  // 1. Update Master Supplier Document
  const suppRef = db.collection('suppliers').doc('supplier-magenta');
  await suppRef.set({
    id: 'supplier-magenta',
    name: 'Magenta',
    currency: 'AED',
    defaultCurrency: 'AED',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log('✅ Master Supplier [supplier-magenta] -> Set currency = \'AED\'');

  // 2. Update CollectionGroup('variants') for Magenta
  const variantGroup = await db.collectionGroup('variants').get();
  let updatedVariants = 0;
  let batch = db.batch();
  let opCount = 0;

  for (const doc of variantGroup.docs) {
    const data = doc.data();
    const suppId = (data.supplierId || data.supplier_id || '').toLowerCase();
    const suppName = (data.supplierName || data.supplier || '').toLowerCase();
    const docId = doc.id.toLowerCase();

    if (
      suppId === 'supplier-magenta' || 
      suppId.includes('magenta') || 
      suppName.includes('magenta') || 
      docId.includes('magenta')
    ) {
      batch.update(doc.ref, {
        currency: 'AED',
        origCurrency: 'AED',
        price_aed: data.unit_price || data.price || data.trade_price || data.price_aed,
        updatedAt: new Date().toISOString()
      });
      opCount++;
      updatedVariants++;

      if (opCount >= 450) {
        await batch.commit();
        batch = db.batch();
        opCount = 0;
      }
    }
  }

  if (opCount > 0) {
    await batch.commit();
  }
  console.log(`✅ Updated ${updatedVariants} Magenta variant sub-documents to currency = 'AED'`);

  // 3. Update main products collection
  const productsSnap = await db.collection('products').get();
  let updatedProducts = 0;
  let prodBatch = db.batch();
  let prodOpCount = 0;

  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const suppId = (data.supplierId || data.supplier_id || '').toLowerCase();
    const suppName = (data.supplier || data.supplierName || '').toLowerCase();
    const docId = doc.id.toLowerCase();

    const isMagentaDoc = suppId === 'supplier-magenta' || suppId.includes('magenta') || suppName.includes('magenta') || docId.includes('magenta');

    let inlineModified = false;
    let newVariants = data.variants;

    if (Array.isArray(data.variants)) {
      newVariants = data.variants.map(v => {
        const vSuppId = (v.supplierId || v.supplier_id || '').toLowerCase();
        const vSuppName = (v.supplierName || v.supplier || '').toLowerCase();
        const vId = (v.id || '').toLowerCase();

        if (vSuppId === 'supplier-magenta' || vSuppId.includes('magenta') || vSuppName.includes('magenta') || vId.includes('magenta')) {
          inlineModified = true;
          return { ...v, currency: 'AED', origCurrency: 'AED' };
        }
        return v;
      });
    }

    if (isMagentaDoc || inlineModified) {
      const updates = { updatedAt: new Date().toISOString() };
      if (isMagentaDoc) updates.currency = 'AED';
      if (inlineModified) updates.variants = newVariants;

      prodBatch.update(doc.ref, updates);
      prodOpCount++;
      updatedProducts++;

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
  console.log(`✅ Updated ${updatedProducts} main product documents for Magenta to currency = 'AED'`);

  console.log('\n🎉 MAGENTA CURRENCY SUCCESSFULLY RECONCILED TO AED!');
}

setMagentaCurrencyToAED().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
