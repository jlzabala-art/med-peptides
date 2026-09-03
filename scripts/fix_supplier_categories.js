import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    })
  });
}

const db = admin.firestore();

async function fixCategories() {
  const targetNames = ['24 genomics', '24Genomics', 'Eterna', 'Bloodo', '24 Genetics'];
  
  const suppliersSnap = await db.collection('suppliers').get();
  for (const doc of suppliersSnap.docs) {
    const data = doc.data();
    const name = data.name || data.companyName || '';
    if (targetNames.some(t => name.toLowerCase().includes(t.toLowerCase()))) {
      console.log(`Fixing supplier: ${name} (${doc.id})`);
      await doc.ref.update({
        categories: ['Tests'],
        productCategories: ['Tests'],
        primaryCategory: 'Tests',
      });
      console.log(`Fixed supplier: ${name}`);
    }
  }

  const wholesellersSnap = await db.collection('wholesellers').get();
  for (const doc of wholesellersSnap.docs) {
    const data = doc.data();
    const name = data.name || data.companyName || '';
    if (targetNames.some(t => name.toLowerCase().includes(t.toLowerCase()))) {
      console.log(`Fixing wholeseller: ${name} (${doc.id})`);
      await doc.ref.update({
        categories: ['Tests'],
        productCategories: ['Tests'],
        primaryCategory: 'Tests',
      });
      console.log(`Fixed wholeseller: ${name}`);
    }
  }

  // Also let's fix products from these suppliers
  const productsSnap = await db.collection('products').get();
  for (const doc of productsSnap.docs) {
    const data = doc.data();
    const supplier = data.supplier || '';
    if (targetNames.some(t => supplier.toLowerCase().includes(t.toLowerCase()))) {
       if (data.category && data.category.toLowerCase().includes('peptid')) {
           console.log(`Fixing product: ${data.name} (Supplier: ${supplier})`);
           await doc.ref.update({
             category: 'Testing'
           });
       }
    }
  }
}

fixCategories().then(() => console.log('Done')).catch(console.error);
