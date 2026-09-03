import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

try {
  initializeApp();
} catch (error) {
  if (error.code !== 'app/duplicate-app') {
    throw error;
  }
}

const db = getFirestore();

async function run() {
  const productsRef = db.collection('products');
  const snapshot = await productsRef.get();

  for (const doc of snapshot.docs) {
    const product = doc.data();
    if (product.name && product.name.toLowerCase().includes('ghk')) {
      console.log('Product:', product.name, 'Peptide ID:', product.peptideId);
    }
  }
}

run().catch(console.error);
