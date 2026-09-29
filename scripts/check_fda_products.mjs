import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const credential = cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
});
const app = initializeApp({ credential });
const db = getFirestore(app);

const TARGET_SLUGS = [
  'tirzepatide',
  'semaglutide',
  'liraglutide',
  'tesamorelin',
  'pt-141-bremelanotide',
  'pt-141',
  'sermorelin',
  'oxytocin'
];

async function checkProducts() {
  console.log('Querying Firestore products...');
  for (const slug of TARGET_SLUGS) {
    const docById = await db.collection('products').doc(slug).get();
    if (docById.exists) {
      console.log(`Found by ID "${slug}": name=${docById.data().name}, current commercialNames=${JSON.stringify(docById.data().commercialNames)}`);
    } else {
      const snap = await db.collection('products').where('slug', '==', slug).get();
      if (!snap.empty) {
        console.log(`Found by slug query "${slug}": count=${snap.docs.length}, ids=${snap.docs.map(d => d.id).join(', ')}`);
      } else {
        console.log(`NOT found: "${slug}"`);
      }
    }
  }
}

checkProducts().then(() => process.exit(0)).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
