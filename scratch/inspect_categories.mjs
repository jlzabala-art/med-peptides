import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore }        from 'firebase-admin/firestore';
import { readFileSync }       from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function inspect() {
  const snap = await db.collection('products').get();
  const categories = {};
  
  snap.forEach(doc => {
    const data = doc.data();
    const cat = data.category || '(no category)';
    const type = data.productType || '(no productType)';
    const supplier = data.supplier || '(no supplier)';
    
    const key = `${cat} | ${type} | ${supplier}`;
    categories[key] = (categories[key] || 0) + 1;
  });
  
  console.log('Category | ProductType | Supplier -> Count');
  Object.entries(categories).sort().forEach(([key, count]) => {
    console.log(`- ${key}: ${count}`);
  });
}

inspect().catch(console.error);
