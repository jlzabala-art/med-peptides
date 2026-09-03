const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

async function run() {
  console.log('Searching products...');
  const productsSnap = await db.collection('products').get();
  productsSnap.docs.forEach(d => {
    const data = d.data();
    if (JSON.stringify(data).toLowerCase().includes('vanilla')) {
      console.log('Product matches vanilla:', d.id, data.name, 'Supplier:', data.supplierId);
    }
  });

  console.log('Searching wholesellers...');
  const wsSnap = await db.collection('wholesellers').get();
  wsSnap.docs.forEach(d => {
    const data = d.data();
    if (JSON.stringify(data).toLowerCase().includes('vanilla')) {
      console.log('Wholeseller matches vanilla:', d.id, data.name || data.companyName);
    }
  });
}

run().catch(console.error);
