import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { algoliasearch } from 'algoliasearch';

// 1. Initialize Firebase Admin
let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) {
  rawPk = rawPk.slice(1, -1);
}
const privateKey = rawPk.replace(/\\n/g, '\n');
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';

const app = getApps().length > 0 ? getApps()[0] : initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
});

const adminDb = getFirestore(app);
const adminAuth = getAuth(app);

// Data from Zoho Bigin
const contact = {
  id: '7006116000000951170',
  accountId: '7006116000000951165',
  name: 'Alfredo Villalobos',
  firstName: 'Alfredo',
  lastName: 'Villalobos',
  email: 'alfredo@villalobos.org',
  secondaryEmail: 'alfredo.villalobosquintana@tisa.telefonica.com',
  phone: '+34660548067',
  secondaryPhone: '+17867634286',
  companyName: 'Telefonica',
  title: 'Director',
  currency: 'EUR',
  country: 'Spain',
  city: 'Madrid',
  customMarkup: 20
};

async function main() {
  console.log('--- Onboarding Alfredo Villalobos as Distributor / Wholesaler ---');
  const now = new Date().toISOString();
  const email = contact.email.toLowerCase().trim();

  // 1. Firebase Auth User
  let authUser;
  try {
    authUser = await adminAuth.getUserByEmail(email);
    console.log(`Found existing Firebase Auth user: ${authUser.uid}`);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.log('Creating new Firebase Auth user...');
      authUser = await adminAuth.createUser({
        email,
        displayName: contact.name,
        phoneNumber: contact.phone,
        emailVerified: true
      });
      console.log(`Created Firebase Auth user: ${authUser.uid}`);
    } else {
      throw err;
    }
  }

  // 2. Custom claims: wholesaler / distributor
  await adminAuth.setCustomUserClaims(authUser.uid, {
    role: 'wholesaler',
    roles: ['wholesaler', 'distributor'],
    approved: true,
    admin: false
  });
  console.log('Set custom claims (role: wholesaler, approved: true)');

  const wholesellerDocId = 'telefonica-alfredo-villalobos';

  // 3. Save to 'wholesellers' collection
  await adminDb.collection('wholesellers').doc(wholesellerDocId).set({
    id: wholesellerDocId,
    name: contact.name,
    displayName: `${contact.companyName} · ${contact.name}`,
    companyName: contact.companyName,
    contactName: contact.name,
    contactEmail: email,
    secondaryEmail: contact.secondaryEmail,
    email,
    phone: contact.phone,
    mobile: contact.phone,
    secondaryPhone: contact.secondaryPhone,
    country: contact.country,
    city: contact.city,
    currency: contact.currency,
    status: 'active',
    type: 'wholeseller',
    role: 'wholesaler',
    commercialMarkup: contact.customMarkup,
    markup: contact.customMarkup,
    discountMargin: contact.customMarkup,
    pricingTier: 'distributor',
    pricingChannel: 'wholesale',
    zohoBiginContactId: contact.id,
    zohoBiginAccountId: contact.accountId,
    uid: authUser.uid,
    title: contact.title,
    notes: 'Imported and linked from Zoho Bigin as official distributor',
    categories: ['Peptides', 'Aesthetic Medicine', 'Longevity'],
    approved: true,
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`Saved wholesellers doc: ${wholesellerDocId}`);

  // 4. Save to 'users' collection
  await adminDb.collection('users').doc(authUser.uid).set({
    id: authUser.uid,
    uid: authUser.uid,
    email,
    secondaryEmail: contact.secondaryEmail,
    fullName: contact.name,
    firstName: contact.firstName,
    lastName: contact.lastName,
    displayName: contact.name,
    companyName: contact.companyName,
    institution: contact.companyName,
    phone: contact.phone,
    mobile: contact.phone,
    secondaryPhone: contact.secondaryPhone,
    role: 'wholesaler',
    roles: ['wholesaler', 'distributor'],
    type: 'wholeseller',
    priceTier: 'wholesale',
    pricingTier: 'distributor',
    pricingChannel: 'wholesale',
    commercialMarkup: contact.customMarkup,
    markup: contact.customMarkup,
    discountMargin: contact.customMarkup,
    currency: contact.currency,
    approved: true,
    professionalStatus: 'approved',
    status: 'active',
    shippingCountry: contact.country,
    shippingCity: contact.city,
    shippingAddress: { company: contact.companyName, city: contact.city, country: contact.country },
    billingAddress: { company: contact.companyName, city: contact.city, country: contact.country },
    zohoBiginContactId: contact.id,
    zohoBiginAccountId: contact.accountId,
    permissions: {
      canBulkOrder: true,
      canAccessAcademy: true,
      customSynthesis: true,
      trackCommission: true,
      canAccessCalculator: true,
      canAccessClinicalAI: false,
      canAccessCustomSynthesis: true,
      canAccessDoctorDashboard: false,
      clinicalLogs: false,
      canAccessAdminDashboard: false,
      manageStaff: false,
      canRecommend: false
    },
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`Saved users doc: ${authUser.uid}`);

  // 5. Save to 'customers' collection
  await adminDb.collection('customers').doc(authUser.uid).set({
    id: authUser.uid,
    email,
    name: contact.name,
    firstName: contact.firstName,
    lastName: contact.lastName,
    companyName: contact.companyName,
    legalName: contact.companyName,
    phone: contact.phone,
    customerType: 'wholesaler',
    pricingTier: 'distributor',
    commercialMarkup: contact.customMarkup,
    markup: contact.customMarkup,
    discountMargin: contact.customMarkup,
    currency: contact.currency,
    country: contact.country,
    city: contact.city,
    status: 'active',
    paymentTerms: 'Due on Receipt',
    creditLimit: 50000,
    tags: ['wholesaler', 'distributor', 'spain', 'bigin', 'telefonica'],
    wholesalerProfile: {
      exclusiveTerritories: ['Spain', 'Europe'],
      resellerCertificateUrl: null
    },
    shippingAddress: { street: '', city: contact.city, state: '', zipCode: '', country: contact.country },
    billingAddress: { street: '', city: contact.city, state: '', zipCode: '', country: contact.country },
    zohoBiginContactId: contact.id,
    zohoBiginAccountId: contact.accountId,
    updatedAt: now
  }, { merge: true });
  console.log(`Saved customers doc: ${authUser.uid}`);

  // 6. Sync to Algolia atlas_users
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  if (adminKey) {
    const algolia = algoliasearch(appId, adminKey);
    const algoliaUserRecord = {
      objectID: authUser.uid,
      id: authUser.uid,
      name: contact.name,
      fullName: contact.name,
      email: contact.email,
      phone: contact.phone,
      role: 'wholesaler',
      roles: ['wholesaler', 'distributor'],
      status: 'active',
      companyName: contact.companyName,
      institution: contact.companyName,
      country: contact.country,
      city: contact.city,
      pricingTier: 'distributor',
      createdAt_ts: Date.now()
    };
    await algolia.saveObjects({
      indexName: 'atlas_users',
      objects: [algoliaUserRecord]
    });
    console.log(`Synced to Algolia atlas_users index: ${authUser.uid}`);
  } else {
    console.warn('ALGOLIA_ADMIN_KEY not found, skipped Algolia sync');
  }

  console.log('✅ Alfredo Villalobos successfully registered as Distributor / Wholesaler!');
}

main().catch(console.error);

