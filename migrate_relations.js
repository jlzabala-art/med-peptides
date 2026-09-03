import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccount-target.json', 'utf8'));

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const idMap = JSON.parse(fs.readFileSync('./migration_id_map.json', 'utf8'));

async function updateCollectionItems(collectionName) {
  console.log(`Updating ${collectionName}...`);
  const snap = await db.collection(collectionName).get();
  let updated = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    let changed = false;
    
    // Check cart (for users)
    if (data.cart && Array.isArray(data.cart)) {
      const newCart = data.cart.map(item => {
        if (item.id && idMap[item.id]) {
          changed = true;
          return { ...item, id: idMap[item.id].variantId, productId: idMap[item.id].canonicalId };
        }
        return item;
      });
      if (changed) data.cart = newCart;
    }
    
    // Check items (for orders, rfqs, etc)
    if (data.items && Array.isArray(data.items)) {
      const newItems = data.items.map(item => {
        if (item.id && idMap[item.id]) {
          changed = true;
          return { ...item, id: idMap[item.id].variantId, productId: idMap[item.id].canonicalId };
        }
        if (item.productId && idMap[item.productId]) {
          changed = true;
          return { ...item, productId: idMap[item.productId].canonicalId };
        }
        return item;
      });
      if (changed) data.items = newItems;
    }

    if (changed) {
      batch.update(doc.ref, data);
      batchCount++;
      updated++;
      if (batchCount >= 400) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
  }
  console.log(`Updated ${updated} documents in ${collectionName}.`);
}

async function run() {
  await updateCollectionItems('users');
  await updateCollectionItems('orders');
  await updateCollectionItems('prescriptions');
  await updateCollectionItems('b2b_sales_orders');
  console.log('Relations migration completed.');
}
run().catch(console.error);
