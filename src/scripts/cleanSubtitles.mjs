import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf-8')
);

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function run() {
  const productsSnapshot = await db.collection('products').get();
  console.log(`Found ${productsSnapshot.size} products.`);
  
  let printed = 0;

  for (const doc of productsSnapshot.docs) {
    const data = doc.data();
    const title = data.title || data.name || '';
    const subtitle = data.subtitle || '';
    
    if (subtitle) {
      console.log(`ID: ${doc.id}`);
      console.log(`  Title:    ${title}`);
      console.log(`  Subtitle: ${subtitle}`);
      console.log('---');
      printed++;
      if (printed > 20) break;
    }
  }
}

run().catch(console.error);
