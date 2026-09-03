const admin = require('firebase-admin');
if (!admin.apps.length) admin.initializeApp({ projectId: 'med-peptides-app' });
const db = admin.firestore();

async function run() {
  const productsSnap = await db.collection('products').where('supplierId', '==', 'supplier-vallida').get();
  console.log(`Found ${productsSnap.size} products for supplier-vallida`);
  productsSnap.docs.forEach(d => {
    const data = d.data();
    console.log(d.id, data.name, 'Supplier:', data.supplierId);
  });
  
  const vallidaSnap = await db.collection('products').where('supplierId', '==', 'vallida').get();
  console.log(`Found ${vallidaSnap.size} products for vallida`);
  vallidaSnap.docs.forEach(d => {
    const data = d.data();
    console.log(d.id, data.name, 'Supplier:', data.supplierId);
  });
}

run().catch(console.error);
