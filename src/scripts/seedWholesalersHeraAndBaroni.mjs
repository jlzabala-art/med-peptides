/**
 * src/scripts/seedWholesalersHeraAndBaroni.mjs
 * 
 * Creates Dr. Raluca Hera and Dr. Ana Baroni as authorized B2B Wholesalers
 * in Firestore (`wholesellers`, `customers`, `users`).
 */

import { adminDb } from '../lib/firebaseAdmin.js';

async function seedWholesalers() {
  if (!adminDb) {
    console.error('Firebase Admin DB not initialized');
    process.exit(1);
  }

  const now = new Date().toISOString();

  // ── 1. DR. RALUCA HERA (Hera Medical Institute) ────────────────────────────
  const heraId = 'hera-medical-institute';
  const heraWholesaler = {
    id: heraId,
    name: 'Dr. Raluca Hera',
    fullName: 'Dr. med. Raluca Hera, MD PhD',
    contactName: 'Dr. Raluca Hera, MD PhD',
    displayName: 'Hera Medical Institute · Dr. Raluca Hera',
    companyName: 'Hera Medical Institute',
    title: 'Founder; Senior Specialist in Obstetrics and Gynecology',
    email: 'office@dr-hera.com',
    contactEmail: 'office@dr-hera.com',
    secondaryEmail: 'raluca.hera@dr-hera.com',
    phone: '+40 726 714 810',
    mobile: '+41 77 416 49 29',
    landline: '+41 43 343 97 30',
    country: 'Romania',
    city: 'Bucharest',
    address: 'Docenților 12A, RO-011403 Bucharest, Romania',
    shippingAddress: 'Docenților 12A, RO-011403 Bucharest, Romania',
    billingAddress: 'Docenților 12A, RO-011403 Bucharest, Romania',
    secondaryAddress: 'Lochmannstrasse 2, CH-8001 Zurich, Switzerland',
    secondaryCountry: 'Switzerland',
    secondaryCity: 'Zurich',
    website: 'https://dr-hera.com',
    speciality: 'Obstetrics and Gynecology; Menopause and Longevity Medicine; Bioidentical Hormone Optimization',
    zohoBiginContactId: '7006116000001741002',
    zohoBiginAccountId: '7006116000001742002',
    type: 'wholeseller',
    role: 'wholesaler',
    status: 'active',
    commercialMarkup: 20,
    markup: 20,
    discountMargin: 20,
    currency: 'EUR',
    categories: ['Peptides', 'Longevity Medicine', 'Aesthetic Medicine', 'Hormone Optimization'],
    wholesalerProfile: {
      authorizedVariantIds: [],
      exclusiveTerritories: ['Romania', 'Switzerland', 'Eastern Europe'],
      resellerCertificateUrl: null
    },
    notes: 'Founder of Hera Medical Institute. Specialist in obstetrics, gynecology, menopause management, bioidentical hormone optimization, longevity medicine, and intimate health. Practices in Bucharest (Docenților 12A) and Zurich (Lochmannstrasse 2). SREG speaker for clinical frameworks in peptide medicine.',
    createdAt: now,
    updatedAt: now
  };

  const heraCustomer = {
    id: heraId,
    customerType: 'wholesaler',
    pricingTier: 'wholesale',
    name: 'Dr. Raluca Hera',
    firstName: 'Raluca',
    lastName: 'Hera',
    companyName: 'Hera Medical Institute',
    legalName: 'Hera Medical Institute',
    email: 'office@dr-hera.com',
    secondaryEmail: 'raluca.hera@dr-hera.com',
    phone: '+40 726 714 810',
    city: 'Bucharest',
    country: 'Romania',
    currency: 'EUR',
    commercialMarkup: 20,
    markup: 20,
    discountMargin: 20,
    creditLimit: 50000,
    paymentTerms: 'Due on Receipt',
    status: 'active',
    zohoBiginContactId: '7006116000001741002',
    zohoBiginAccountId: '7006116000001742002',
    wholesalerProfile: {
      authorizedVariantIds: [],
      exclusiveTerritories: ['Romania', 'Switzerland'],
      resellerCertificateUrl: null
    },
    shippingAddress: {
      street: 'Docenților 12A',
      city: 'Bucharest',
      zipCode: '011403',
      country: 'Romania',
      state: ''
    },
    billingAddress: {
      street: 'Docenților 12A',
      city: 'Bucharest',
      zipCode: '011403',
      country: 'Romania',
      state: ''
    },
    tags: ['wholesaler', 'romania', 'switzerland', 'hera_institute', 'longevity', 'bigin'],
    createdAt: now,
    updatedAt: now
  };

  // ── 2. DR. ANA BARONI ──────────────────────────────────────────────────────
  const baroniId = 'dr-ana-baroni';
  const baroniWholesaler = {
    id: baroniId,
    name: 'Ana Baroni',
    fullName: 'Dr. Ana Baroni, MD PhD MSc',
    contactName: 'Dr. Ana Baroni, MD PhD MSc',
    displayName: 'Dr. Ana Baroni · Longevity Medicine',
    companyName: 'Asia Pacific Longevity Medicine Society / Dr. Ana Baroni',
    title: 'Chief Scientific & Innovation Officer; Co-Founder & General Secretary',
    email: 'dranabaroni@gmail.com',
    contactEmail: 'dranabaroni@gmail.com',
    phone: '+34 693 76 57 65',
    mobile: '+34 693 76 57 65',
    country: 'Spain',
    city: 'Madrid / Barcelona',
    address: 'Spain',
    shippingAddress: 'Spain',
    billingAddress: 'Spain',
    website: 'https://www.linkedin.com/in/dranabaronimdphd/',
    speciality: 'Longevity Medicine, Precision Health, Regenerative Medicine, Genomics & Molecular Diagnostics',
    zohoBiginContactId: '7006116000001708010',
    type: 'wholeseller',
    role: 'wholesaler',
    status: 'active',
    commercialMarkup: 20,
    markup: 20,
    discountMargin: 20,
    currency: 'EUR',
    categories: ['Peptides', 'Longevity Medicine', 'Translational Medicine', 'Molecular Diagnostics'],
    wholesalerProfile: {
      authorizedVariantIds: [],
      exclusiveTerritories: ['Spain', 'Asia Pacific', 'Hong Kong'],
      resellerCertificateUrl: null
    },
    notes: 'MD, PhD, MSc. Co-Founder, Asia Pacific Acceleration and Validation Center (Hong Kong), and General Secretary & Co-Founder, Asia Pacific Longevity Medicine Society. Executive leader with 27+ years experience in healthspan, precision, regenerative, and functional medicine.',
    createdAt: now,
    updatedAt: now
  };

  const baroniCustomer = {
    id: baroniId,
    customerType: 'wholesaler',
    pricingTier: 'wholesale',
    name: 'Dr. Ana Baroni',
    firstName: 'Ana',
    lastName: 'Baroni',
    companyName: 'Dr. Ana Baroni (Asia Pacific Longevity Medicine)',
    legalName: 'Dr. Ana Baroni',
    email: 'dranabaroni@gmail.com',
    phone: '+34 693 76 57 65',
    city: 'Spain',
    country: 'Spain',
    currency: 'EUR',
    commercialMarkup: 20,
    markup: 20,
    discountMargin: 20,
    creditLimit: 50000,
    paymentTerms: 'Due on Receipt',
    status: 'active',
    zohoBiginContactId: '7006116000001708010',
    wholesalerProfile: {
      authorizedVariantIds: [],
      exclusiveTerritories: ['Spain', 'Asia Pacific'],
      resellerCertificateUrl: null
    },
    shippingAddress: {
      street: '',
      city: '',
      zipCode: '',
      country: 'Spain',
      state: ''
    },
    billingAddress: {
      street: '',
      city: '',
      zipCode: '',
      country: 'Spain',
      state: ''
    },
    tags: ['wholesaler', 'spain', 'baroni', 'longevity', 'bigin'],
    createdAt: now,
    updatedAt: now
  };

  // Execute Firestore writes
  console.log('Writing Dr. Raluca Hera to Firestore...');
  await adminDb.collection('wholesellers').doc(heraId).set(heraWholesaler, { merge: true });
  await adminDb.collection('customers').doc(heraId).set(heraCustomer, { merge: true });
  await adminDb.collection('users').doc(heraId).set({
    id: heraId,
    uid: heraId,
    email: 'office@dr-hera.com',
    secondaryEmail: 'raluca.hera@dr-hera.com',
    fullName: 'Dr. med. Raluca Hera, MD PhD',
    displayName: 'Dr. Raluca Hera',
    companyName: 'Hera Medical Institute',
    role: 'wholesaler',
    roles: ['wholesaler', 'wholeseller'],
    status: 'active',
    approved: true,
    currency: 'EUR',
    priceTier: 'wholesale',
    country: 'Romania',
    city: 'Bucharest',
    phone: '+40 726 714 810',
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  console.log('Writing Dr. Ana Baroni to Firestore...');
  await adminDb.collection('wholesellers').doc(baroniId).set(baroniWholesaler, { merge: true });
  await adminDb.collection('customers').doc(baroniId).set(baroniCustomer, { merge: true });
  await adminDb.collection('users').doc(baroniId).set({
    id: baroniId,
    uid: baroniId,
    email: 'dranabaroni@gmail.com',
    fullName: 'Dr. Ana Baroni, MD PhD MSc',
    displayName: 'Dr. Ana Baroni',
    companyName: 'Asia Pacific Longevity Medicine Society / Dr. Ana Baroni',
    role: 'wholesaler',
    roles: ['wholesaler', 'wholeseller'],
    status: 'active',
    approved: true,
    currency: 'EUR',
    priceTier: 'wholesale',
    country: 'Spain',
    phone: '+34 693 76 57 65',
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  console.log('✅ Both wholesalers successfully created in Firestore (wholesellers, customers, users)!');
  process.exit(0);
}

seedWholesalers().catch(err => {
  console.error('❌ Error seeding wholesalers:', err);
  process.exit(1);
});
