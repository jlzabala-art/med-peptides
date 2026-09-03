import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}
const db = admin.firestore();

async function check() {
  const productsSnap = await db.collection('products').get();
  const productSuppliers = new Set();
  productsSnap.forEach(doc => {
    const data = doc.data();
    if (data.supplier) productSuppliers.add(data.supplier.trim());
    if (data.manufacturer) productSuppliers.add(data.manufacturer.trim());
  });

  console.log("Suppliers found in products:");
  console.log(Array.from(productSuppliers));

  const suppliersSnap = await db.collection('wholesellers').get();
  console.log("\nSuppliers found in wholesellers collection:");
  suppliersSnap.forEach(doc => {
    const data = doc.data();
    console.log(`- ${data.name || data.companyName} (hasProducts: ${data.hasProducts}, productsSupplied: ${data.productsSupplied})`);
  });
}

check().then(() => process.exit(0)).catch(console.error);
