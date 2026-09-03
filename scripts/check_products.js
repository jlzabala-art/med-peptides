import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

const db = admin.firestore();

async function run() {
  const snapshot = await db.collection('products').get();
  let podProducts = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.supplier && data.supplier.toLowerCase().includes('pod')) {
      console.log(`Product: ${data.name}, Supplier: "${data.supplier}"`);
      podProducts++;
      if (podProducts > 10) break;
    }
  }
  console.log(`Found ${podProducts} POD products (showing max 10)`);
  process.exit(0);
}

run();
