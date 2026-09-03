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

async function executeFullMasterDataOptimization() {
  console.log('--- STARTING MASTER DATA & VARIANT HOMOGENIZATION ---');

  // Pre-calculate price ranges using collectionGroup to avoid N+1 queries
  console.log('Fetching variants via collectionGroup for O(1) price calculation...');
  const allVarsSnap = await db.collectionGroup('variants').get();
  const productPricesMap = new Map();

  allVarsSnap.forEach(vDoc => {
    const parentDocRef = vDoc.ref.parent.parent;
    if (!parentDocRef) return;
    const pId = parentDocRef.id;
    const v = vDoc.data();
    const price = v.unit_price || (v.price_aed ? parseFloat((v.price_aed / 3.67).toFixed(2)) : null);

    if (price && typeof price === 'number' && !isNaN(price)) {
      if (!productPricesMap.has(pId)) {
        productPricesMap.set(pId, { min: price, max: price });
      } else {
        const bounds = productPricesMap.get(pId);
        if (price < bounds.min) bounds.min = price;
        if (price > bounds.max) bounds.max = price;
      }
    }
  });

  const productsSnap = await db.collection('products').get();
  console.log(`Processing ${productsSnap.size} master product documents...`);

  let masterUpdatesCount = 0;
  let batch = db.batch();
  let batchSize = 0;

  for (const pDoc of productsSnap.docs) {
    const p = pDoc.data();
    const updates = {};
    let needsUpdate = false;

    // Standardize canonicalName
    if (!p.canonicalName) {
      updates.canonicalName = p.name || pDoc.id;
      needsUpdate = true;
    }

    // Standardize name
    if (!p.name) {
      updates.name = p.canonicalName || pDoc.id;
      needsUpdate = true;
    }

    // Standardize category
    if (!p.category) {
      updates.category = 'Peptide';
      needsUpdate = true;
    }

    // Standardize status
    if (!p.status) {
      updates.status = 'active';
      needsUpdate = true;
    }

    const bounds = productPricesMap.get(pDoc.id);
    if (bounds) {
      if (p.min_unit_price !== bounds.min) {
        updates.min_unit_price = bounds.min;
        needsUpdate = true;
      }
      if (p.max_unit_price !== bounds.max) {
        updates.max_unit_price = bounds.max;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      updates.updatedAt = new Date().toISOString();
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
    batch = db.batch();
    batchSize = 0;
  }

  console.log(`✓ Master Products: Updated ${masterUpdatesCount} documents with canonical properties and price bounds.`);

  // 2. Process All Variants in Collection Group
  console.log(`Processing ${allVarsSnap.size} total variants across all subcollections...`);

  let variantUpdatesCount = 0;

  for (const vDoc of allVarsSnap.docs) {
    const v = vDoc.data();
    const updates = {};
    let needsUpdate = false;

    // Standardize currency property
    if (!v.currency) {
      updates.currency = v.price_aed ? 'AED' : 'USD';
      needsUpdate = true;
    }

    // Standardize unit_price calculation if missing
    if (!v.unit_price && v.price_aed) {
      updates.unit_price = parseFloat((v.price_aed / 3.67).toFixed(2));
      needsUpdate = true;
    }

    // Standardize cost_tiers structure
    if (!v.cost_tiers || Object.keys(v.cost_tiers).length === 0) {
      const price = v.price_aed || v.unit_price || v.price || null;
      if (price) {
        updates.cost_tiers = { cost_10: parseFloat(price) };
        needsUpdate = true;
      }
    }

    // Standardize status
    if (!v.status) {
      updates.status = 'active';
      needsUpdate = true;
    }

    if (needsUpdate) {
      updates.updatedAt = new Date().toISOString();
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
  }

  console.log(`✓ Variants: Homogenized ${variantUpdatesCount} variant documents with explicit currency, unit prices, and status.`);
  console.log('--- MASTER DATA HOMOGENIZATION COMPLETE ---');
}

executeFullMasterDataOptimization().catch(console.error);
