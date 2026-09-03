import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential;
credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
});

if (!initializeApp.apps?.length) {
  initializeApp({ credential });
}

const db = getFirestore();

function generateCanonicalId(name) {
  if (!name) return '';
  let id = name.toLowerCase().trim();
  id = id.replace(/\s*\([^)]*\)/g, '');
  id = id.replace(/[\s\/\+]+/g, '-');
  id = id.replace(/[^a-z0-9\-]/g, '');
  id = id.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return id;
}

async function run() {
  console.log("Loading LotusLand products...");
  const productsSnap = await db.collection('products')
    .where('supplier', '==', 'LotusLand')
    .get();

  const aliasToProductId = new Map();
  productsSnap.forEach(doc => {
    const data = doc.data();
    const canId = generateCanonicalId(data.name.split('mg')[0].split('IU')[0].split('mcg')[0].trim()); // rough strip of dosage
    if (!aliasToProductId.has(canId)) {
      aliasToProductId.set(canId, doc.id);
    }
    const canIdFull = data.canonicalId;
    if (!aliasToProductId.has(canIdFull)) {
      aliasToProductId.set(canIdFull, doc.id);
    }
  });

  console.log(`Created mapping for ${aliasToProductId.size} canonical names.`);

  let batch = db.batch();
  let opCount = 0;

  async function commitBatch() {
    if (opCount > 0) {
      await batch.commit();
      batch = db.batch();
      opCount = 0;
    }
  }

  // Update Protocols
  console.log("Updating protocols...");
  const protocolsSnap = await db.collection('protocols').get();
  for (const doc of protocolsSnap.docs) {
    const data = doc.data();
    let updated = false;

    if (data.phases && Array.isArray(data.phases)) {
      for (const phase of data.phases) {
        if (phase.items && Array.isArray(phase.items)) {
          for (const item of phase.items) {
            if (item.name) {
              const canId = generateCanonicalId(item.name);
              if (aliasToProductId.has(canId)) {
                item.product_id = aliasToProductId.get(canId);
                item.productId = aliasToProductId.get(canId); // Set both just in case
                updated = true;
              }
            }
          }
        }
      }
    }

    if (updated) {
      batch.update(doc.ref, { phases: data.phases || [] });
      opCount++;
      if (opCount >= 400) await commitBatch();
    }
  }

  // Update Prescriptions
  console.log("Updating prescriptions...");
  const presSnap = await db.collection('prescriptions').get();
  for (const doc of presSnap.docs) {
    const data = doc.data();
    let updated = false;

    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.name) {
          const canId = generateCanonicalId(item.name);
          if (aliasToProductId.has(canId)) {
            item.product_id = aliasToProductId.get(canId);
            item.productId = aliasToProductId.get(canId);
            updated = true;
          }
        }
      }
    }

    if (updated) {
      batch.update(doc.ref, { items: data.items });
      opCount++;
      if (opCount >= 400) await commitBatch();
    }
  }
  
  await commitBatch();
  
  // Delete old product_usage collection
  console.log("Deleting old product_usage collection...");
  const usageSnap = await db.collection('product_usage').get();
  for (const doc of usageSnap.docs) {
    batch.delete(doc.ref);
    opCount++;
    if (opCount >= 400) await commitBatch();
  }
  await commitBatch();

  console.log("Normalization complete!");
}

run().catch(console.error);
