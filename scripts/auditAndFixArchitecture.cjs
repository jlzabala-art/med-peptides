const admin = require('firebase-admin');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const privateKeyLine = envFile.match(/FIREBASE_PRIVATE_KEY=(.*)/)[1];
const privateKey = privateKeyLine.replace(/\\n/g, '\n').replace(/^\"|\"$/g, '');

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: 'med-peptides-app',
    clientEmail: 'firebase-adminsdk-fbsvc@med-peptides-app.iam.gserviceaccount.com',
    privateKey: privateKey
  })
});

const db = admin.firestore();

async function executeDeepArchitectureFix() {
  console.log('--- STARTING DEEP DATA ARCHITECTURE OPTIMIZATION ---');

  // Step 1: Query all variants to build product -> suppliers map & supplierId homogenization
  console.log('Scanning 584 variants via collectionGroup...');
  const allVarsSnap = await db.collectionGroup('variants').get();

  const productSuppliersMap = new Map(); // productId -> Set of supplierIds
  const productVariantCounts = new Map(); // productId -> count

  let variantUpdatesCount = 0;
  let batch = db.batch();
  let batchSize = 0;

  for (const vDoc of allVarsSnap.docs) {
    const v = vDoc.data();
    const parentRef = vDoc.ref.parent.parent;
    if (!parentRef) continue;
    const pId = parentRef.id;

    // Track variant count per product
    productVariantCounts.set(pId, (productVariantCounts.get(pId) || 0) + 1);

    // Track unique suppliers per product
    const sId = v.supplier_id || v.supplierId || v.supplier;
    if (sId) {
      if (!productSuppliersMap.has(pId)) productSuppliersMap.set(pId, new Set());
      productSuppliersMap.get(pId).add(sId);
    }

    // Homogenize variant fields (supplierId, supplier_id, createdAt, updatedAt)
    const updates = {};
    let needsUpdate = false;

    if (sId) {
      if (v.supplier_id !== sId) { updates.supplier_id = sId; needsUpdate = true; }
      if (v.supplierId !== sId) { updates.supplierId = sId; needsUpdate = true; }
    }

    const nowIso = new Date().toISOString();
    if (!v.createdAt) { updates.createdAt = nowIso; needsUpdate = true; }
    if (!v.updatedAt) { updates.updatedAt = nowIso; needsUpdate = true; }

    if (needsUpdate) {
      batch.set(vDoc.ref, updates, { merge: true });
      variantUpdatesCount++;
      batchSize++;

      if (batchSize >= 450) {
        await batch.commit();
        batch = db.batch();
        batchSize = 0;
      }
    }
  }

  if (batchSize > 0) {
    await batch.commit();
    batch = db.batch();
    batchSize = 0;
  }

  console.log(`✓ Variants: Homogenized ${variantUpdatesCount} variant documents (supplierId & timestamp fields).`);

  // Step 2: Update master product documents
  const productsSnap = await db.collection('products').get();
  console.log(`Updating ${productsSnap.size} master products with denormalized suppliers & variantsCount...`);

  let masterUpdatesCount = 0;
  const nowIso = new Date().toISOString();

  for (const pDoc of productsSnap.docs) {
    const p = pDoc.data();
    const pId = pDoc.id;
    const updates = {};
    let needsUpdate = false;

    // Denormalize suppliers array
    const suppliersSet = productSuppliersMap.get(pId) || new Set();
    const suppliersArray = Array.from(suppliersSet);
    if (JSON.stringify(p.suppliers || []) !== JSON.stringify(suppliersArray)) {
      updates.suppliers = suppliersArray;
      needsUpdate = true;
    }

    // Denormalize variantsCount
    const count = productVariantCounts.get(pId) || 0;
    if (p.variantsCount !== count) {
      updates.variantsCount = count;
      needsUpdate = true;
    }

    // Standardize timestamps
    if (!p.createdAt) { updates.createdAt = nowIso; needsUpdate = true; }
    if (!p.updatedAt) { updates.updatedAt = nowIso; needsUpdate = true; }

    if (needsUpdate) {
      batch.set(pDoc.ref, updates, { merge: true });
      masterUpdatesCount++;
      batchSize++;

      if (batchSize >= 450) {
        await batch.commit();
        batch = db.batch();
        batchSize = 0;
      }
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`✓ Master Products: Denormalized ${masterUpdatesCount} products with suppliers array, variantsCount, and timestamps.`);
  console.log('--- DEEP DATA ARCHITECTURE OPTIMIZATION COMPLETE ---');
}

executeDeepArchitectureFix().catch(console.error);
