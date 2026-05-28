import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function inspect() {
  const snapshot = await db.collection('products').get();
  const activeIds = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.isActive !== false && data.status !== 'draft') {
      activeIds.push({ id: doc.id, name: data.name, category: data.category, supplier: data.supplier });
    }
  });

  console.log(`Found ${activeIds.length} active products in Firestore.`);
  console.log('Sample Active Product IDs:');
  activeIds.slice(0, 50).forEach(p => {
    console.log(`- ID: ${p.id.padEnd(50)} | Name: ${p.name.padEnd(35)} | Supplier: ${p.supplier}`);
  });
}

inspect().catch(console.error);
