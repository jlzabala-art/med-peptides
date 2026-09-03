import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

let credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});

const app = initializeApp({ credential });
const adminDb = getFirestore(app);

async function run() {
  const req = new Request('http://localhost:3000/api/catalog/summary');
  const { GET } = await import('../src/app/api/catalog/summary/route.js');
  const res = await GET(req);
  const data = await res.json();
  const npLabsProduct = data.find(p => p.suppliers.some(s => s.name === 'NP LABS'));
  console.log("Found NP Labs product:", npLabsProduct ? npLabsProduct.canonicalName : "No");
  if (npLabsProduct) {
      console.log("Variants array length:", npLabsProduct.variants?.length);
      console.log("First variant:", npLabsProduct.variants[0]);
  }
}

run().catch(console.error);
