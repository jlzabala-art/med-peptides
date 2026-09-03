import { adminDb } from './src/lib/firebaseAdmin.js';

async function listSuppliers() {
  const snapshot = await adminDb.collection('suppliers').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    console.log(`Supplier ID: ${doc.id} - Name: ${data.name || data.companyName}`);
  });
}

listSuppliers();
