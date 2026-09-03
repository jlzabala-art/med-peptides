const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function check() {
  const productsSnap = await db.collection('products').get();
  const productSuppliers = new Set();
  productsSnap.forEach(doc => {
    const data = doc.data();
    if (data.supplier) productSuppliers.add(data.supplier.trim());
  });

  console.log("Suppliers found in products:");
  console.log(Array.from(productSuppliers));

  const suppliersSnap = await db.collection('suppliers').get();
  console.log("\nSuppliers found in suppliers collection:");
  suppliersSnap.forEach(doc => {
    const data = doc.data();
    console.log(`- ${data.name || data.companyName} (hasProducts: ${data.hasProducts}, productsSupplied: ${data.productsSupplied})`);
  });
}

check().then(() => process.exit(0)).catch(console.error);
