import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.local' });

const __dirname = dirname(fileURLToPath(import.meta.url));
let credential;

if (existsSync(join(__dirname, 'serviceAccountKey.json'))) {
  const sa = JSON.parse(readFileSync(join(__dirname, 'serviceAccountKey.json'), 'utf8'));
  credential = cert(sa);
} else {
  credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  });
}

if (!getApps().length) initializeApp({ credential });
const db = getFirestore();

async function updateCentricoInfo() {
  console.log('Enriching Centrico supplier metadata in Firestore...');
  const suppRef = db.collection('suppliers').doc('supplier-centrico');
  await suppRef.set({
    id: 'supplier-centrico',
    name: 'Centrico',
    canonicalName: 'Centric Compounding Pharmacy',
    companyName: 'Centric Compounding Pharmacy (Centrico)',
    location: 'Dubai Science Park, Laboratory Complex Building, Suite #216, Dubai, UAE',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    currency: 'AED',
    email: 'customercare@centricco.com',
    phone: '+971 52 982 0677',
    website: 'https://www.centricco.com',
    type: 'Compounding Pharmacy (Finished Formulations & Pens)',
    categoriesSupplied: ['peptides', 'peptide_combinations', 'weight_loss'],
    status: 'active',
    isActive: true,
    lastQuotationDate: '2026-08-20',
    agreementNotes: 'Centric Compounding Pharmacy (Dubai Science Park) - Pre-filled Pens in AED (Clinic & Patient Rates)',
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('Centrico supplier record enriched successfully.');
}

updateCentricoInfo().catch(console.error);
