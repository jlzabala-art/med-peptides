import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
const db = admin.firestore();

import { resolveVariantPrice } from './src/utils/resolvePrice.js';

async function test() {
  const snap = await db.collection('supplierOffers').limit(1).get();
  if (snap.empty) {
    console.log('No supplierOffers found');
    process.exit(0);
  }
  const offer = snap.docs[0].data();
  console.log('--- OFFER DATA ---');
  console.log(offer);
  
  console.log('--- RESOLVED MASTER ---');
  console.log(resolveVariantPrice(offer, { tier: 'master' }));

  console.log('--- RESOLVED RETAIL ---');
  console.log(resolveVariantPrice(offer, { tier: 'retail' }));
}

test().catch(console.error);
