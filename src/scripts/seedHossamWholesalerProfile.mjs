import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = path.resolve('src/scripts/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

async function seedWholesaler() {
  console.log('Seeding Hossam Ahmed / Ryhanh Medical profile into Firestore...');

  // 1. In wholesalers collection
  const wholesalerRef = db.collection('wholesalers').doc('ryhanh-medical-qatar');
  await wholesalerRef.set({
    id: 'ryhanh-medical-qatar',
    slug: 'ryhanh',
    name: 'Ryhanh Medical Company',
    companyName: 'Ryhanh Medical Company (Ryhanh Group)',
    contactPerson: 'Hossam Ahmed',
    email: 'hossam@ryhanh.com',
    phone: '+974 4400 0000',
    country: 'Qatar',
    territory: 'State of Qatar (Exclusive B2B)',
    tier: 'Exclusive Commercial Partner',
    role: 'wholesaler',
    status: 'active',
    assignedAgreementIds: ['colway-qatar-ryhanh', '24genomics-qatar-ryhanh'],
    agreements: {
      colway: 'colway-qatar',
      genomics: '24genomics-qatar'
    },
    defaultCurrency: 'QAR',
    accessKey: 'RYHANH-QA-2026',
    verifiedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  console.log('✓ Seeded wholesaler: wholesalers/ryhanh-medical-qatar');

  // 2. In users collection for instant auth matching
  const userRef = db.collection('users').doc('partner_hossam_ahmed');
  await userRef.set({
    uid: 'partner_hossam_ahmed',
    email: 'hossam@ryhanh.com',
    displayName: 'Hossam Ahmed',
    organization: 'Ryhanh Medical Company',
    role: 'wholesaler',
    wholesalerId: 'ryhanh-medical-qatar',
    assignedAgreementId: 'colway-qatar',
    assignedGenomicsAgreementId: '24genomics-qatar',
    territory: 'State of Qatar',
    status: 'active',
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });

  console.log('✓ Seeded user: users/partner_hossam_ahmed');
}

seedWholesaler().catch(err => {
  console.error('Error seeding wholesaler:', err);
  process.exit(1);
});

