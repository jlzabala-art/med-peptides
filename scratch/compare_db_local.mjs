import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// Local products
const localProducts = JSON.parse(readFileSync('./src/data/v2/products.v2.json', 'utf8'));

async function run() {
  const snap = await db.collection('products').get();
  const dbProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  const activeDb = dbProducts.filter(p => p.isActive !== false && p.status !== 'draft');
  console.log(`Active DB count: ${activeDb.length}`);
  console.log(`Local product count: ${localProducts.length}`);
  
  const localSlugs = new Set(localProducts.map(p => p.slug));
  const dbSlugs = new Set(activeDb.map(p => p.slug || p.id));
  
  console.log('\nActive DB products NOT in local products.v2.json:');
  const notInLocal = activeDb.filter(p => !localSlugs.has(p.slug || p.id));
  notInLocal.forEach(p => {
    console.log(`- ID: ${p.id} | Slug: ${p.slug} | Name: ${p.name} | Supplier: ${p.supplier}`);
  });
  
  console.log('\nLocal products NOT in active DB:');
  const notInDb = localProducts.filter(p => !dbSlugs.has(p.slug));
  notInDb.forEach(p => {
    console.log(`- Slug: ${p.slug} | Name: ${p.name}`);
  });
}
run().catch(console.error);
