import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Replace with path to your service account key
const serviceAccount = JSON.parse(fs.readFileSync(resolve(__dirname, '../../../regenpept-firebase-adminsdk.json'), 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function upload() {
  const mergedProducts = JSON.parse(fs.readFileSync('products_merged.json', 'utf8'));
  console.log(`Uploading ${mergedProducts.length} merged products...`);

  // First let's wipe the existing products in the DB to avoid duplicates with old names
  // But wait, what if some products have references in other collections?
  // Well, we are mostly preserving the IDs of the base products. The ones that get deleted are the duplicates.
  // Actually, wiping and writing is safer to ensure no ghost products remain.
  
  const productsRef = db.collection('products');
  const existingDocs = await productsRef.get();
  
  const batchDelete = db.batch();
  let count = 0;
  
  for (const doc of existingDocs.docs) {
    batchDelete.delete(doc.ref);
    count++;
    if (count % 400 === 0) {
      await batchDelete.commit();
      console.log(`Deleted ${count} products`);
    }
  }
  if (count % 400 !== 0) await batchDelete.commit();
  console.log(`Deleted total ${count} old products`);

  // Now upload new products
  let uploadCount = 0;
  for (const p of mergedProducts) {
    const docRef = p.id ? productsRef.doc(p.id) : productsRef.doc();
    // Ensure id matches docRef.id
    p.id = docRef.id;
    // Remove undefined/nulls if needed, firestore handles nulls ok, but let's be safe
    // Also remove fields we don't need or want
    await docRef.set(p);
    uploadCount++;
    if (uploadCount % 50 === 0) console.log(`Uploaded ${uploadCount} products`);
  }
  console.log(`Upload complete. Total: ${uploadCount}`);
}

upload().catch(console.error);
