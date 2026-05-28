import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';

const SA_PATHS = [
  './serviceAccountKey.json',
  './med-peptides-app-firebase-adminsdk-fbsvc-d01b0469f1.json',
  './serviceAccount.json',
];

let saPath = SA_PATHS.find(p => existsSync(p));
if (!saPath) {
  console.error('No service account key found.');
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(saPath, 'utf-8'))) });
const db = getFirestore();

const docRef = db.collection('products').doc('HCG-10000iu-vial');
const snap = await docRef.get();
if (!snap.exists) {
  console.error('HCG product doc not found.');
  process.exit(1);
}

const data = snap.data();
const pricing = data.pricing || {};

const updatedPricing = {
  retail: {
    currency: 'USD',
    kit: 877.5,
    perUnit: 87.75
  },
  clinic: {
    currency: 'USD',
    kit: 760.5,
    perUnit: 76.05
  },
  wholesale: {
    currency: 'USD',
    kit: 702.0,
    perUnit: 70.20
  },
  master: {
    currency: 'USD',
    kit: 585.0,
    perUnit: 58.50
  }
};

await docRef.update({ pricing: updatedPricing });
console.log('Successfully updated HCG root pricing!');
process.exit(0);
