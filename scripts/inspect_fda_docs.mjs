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

async function inspectDoc(id) {
  const doc = await db.collection('products').doc(id).get();
  if (doc.exists) {
    const data = doc.data();
    console.log(`Doc ID: ${id}`);
    console.log(`  name: ${data.name}`);
    console.log(`  slug: ${data.slug}`);
    console.log(`  synonyms: ${JSON.stringify(data.synonyms)}`);
    console.log(`  brand: ${data.brand}`);
    console.log(`  commercialNames: ${JSON.stringify(data.commercialNames)}`);
  }
}

async function run() {
  await inspectDoc('tirzepatide');
  await inspectDoc('semaglutide');
  await inspectDoc('pt-141');
  await inspectDoc('tesamorelin');
  await inspectDoc('sermorelin');
  await inspectDoc('oxytocin');
}

run().then(() => process.exit(0)).catch(console.error);
