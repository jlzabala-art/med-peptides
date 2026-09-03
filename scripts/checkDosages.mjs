import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function run() {
  const serviceAccount = JSON.parse(
    await readFile(new URL('../serviceAccountKey.json', import.meta.url))
  );

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
  }
  const db = getFirestore();

  const productsSnap = await db.collection('products').get();
  
  let total = 0;
  let missingDosage = 0;
  
  productsSnap.forEach(doc => {
    const data = doc.data();
    if (data.status === 'inactive' || data.status === 'archived' || data.isActive === false) return;
    total++;
    if (!data.dosage && !data.dose) {
      console.log(`Missing dosage: ${doc.id} - ${data.canonicalName || data.name} - supplier: ${data.supplierName}`);
      missingDosage++;
    }
  });

  console.log(`\nTotal active products: ${total}`);
  console.log(`Products missing dosage: ${missingDosage}`);
}

run().catch(console.error);
