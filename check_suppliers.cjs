const admin = require('firebase-admin');
const fs = require('fs');

async function run() {
  const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  const db = admin.firestore();

  const suppliersSnap = await db.collection('suppliers').get();
  const suppliers = {};
  suppliersSnap.forEach(doc => {
    suppliers[doc.id] = doc.data().companyName || doc.data().name || doc.id;
  });
  console.log('Suppliers DB count:', suppliersSnap.size);

  const productsSnap = await db.collection('products').get();
  const productSuppliers = new Set();
  const productSupplierIds = new Set();

  productsSnap.forEach(doc => {
    const data = doc.data();
    if (data.supplier) productSuppliers.add(data.supplier);
    if (data.supplierName) productSuppliers.add(data.supplierName);
    if (data.supplierId) productSupplierIds.add(data.supplierId);
  });
  
  console.log('Unique supplier names in products:', Array.from(productSuppliers));
  console.log('Unique supplier IDs in products:', Array.from(productSupplierIds));
  console.log('Actual supplier IDs from suppliers collection:', Object.keys(suppliers));
}

run().catch(console.error);
