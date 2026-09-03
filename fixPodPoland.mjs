import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceKeyPath = join(__dirname, 'src/scripts/serviceAccountKey.json');

let credential;
try {
  const raw = readFileSync(serviceKeyPath, 'utf-8');
  credential = cert(JSON.parse(raw));
} catch {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    credential = cert(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  } else {
    console.error('❌  No Firebase credentials found.');
    process.exit(1);
  }
}

initializeApp({ credential, projectId: 'med-peptides-app' });
const db = getFirestore();

async function fixPodPolandProducts() {
  console.log('Fetching pod-poland products...');
  const snapshot = await db.collection('products')
    .where('supplierId', '==', 'pod-poland')
    .get();

  if (snapshot.empty) {
    console.log('No products found with supplierId = pod-poland');
    process.exit(0);
  }

  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    // Set supplier string correctly and generate a default variant
    const data = doc.data();
    batch.update(doc.ref, {
      supplier: 'pod-poland'
    });
    count++;
  });

  await batch.commit();
  console.log(`Updated ${count} products to have supplier: 'pod-poland'.`);
  process.exit(0);
}

fixPodPolandProducts().catch(console.error);
