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

// Data from Zoho Books (MEDILUXE HEALTH SOLUTIONS - Org: 662274409)
const vendorData = {
  vendorIdAED: '1183263000022818023',
  vendorNumberAED: 'VEN-79',
  vendorIdEUR: '1183263000022818037',
  vendorNumberEUR: 'VEN-80',
  name: 'Health Source Canada',
  companyName: 'Health Source Canada',
  contactName: 'Dr. Jan Alomia',
  firstName: 'Jan',
  lastName: 'Alomia',
  email: 'jia9156@gmail.com',
  phone: '+971-506167657',
  currency: 'AED',
  secondaryCurrency: 'EUR',
  country: 'United Arab Emirates',
  city: 'Dubai',
  commissionModel: 'profit',
  facilitatorCommissionPercent: 40.0,
  paymentTerms: 'Net 10 after customer payemnt',
  paymentTermsDays: 10,
  status: 'active'
};

async function main() {
  console.log('--- Onboarding Health Source Canada as Wholesaler / Partner in Atlas ---');
  const now = new Date().toISOString();
  const email = vendorData.email.toLowerCase().trim();

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
        displayName: `${vendorData.companyName} · ${vendorData.contactName}`,
        phoneNumber: '+971506167657',
        emailVerified: true
      });
      console.log(`Created Firebase Auth user: ${authUser.uid}`);
    } else {
      throw err;
    }
  }

  // 2. Custom User Claims
  await adminAuth.setCustomUserClaims(authUser.uid, {
    role: 'wholesaler',
    roles: ['wholesaler', 'supplier', 'facilitator'],
    approved: true,
    admin: false
  });
  console.log('Set custom claims (role: wholesaler, approved: true)');

  const wholesellerDocId = 'health-source-canada-aed';

  // 3. Save to 'wholesellers' collection
  await adminDb.collection('wholesellers').doc(wholesellerDocId).set({
    id: wholesellerDocId,
    name: vendorData.companyName,
    displayName: `${vendorData.companyName} · ${vendorData.contactName}`,
    companyName: vendorData.companyName,
    contactName: vendorData.contactName,
    firstName: vendorData.firstName,
    lastName: vendorData.lastName,
    contactEmail: email,
    email,
    phone: vendorData.phone,
    mobile: vendorData.phone,
    country: vendorData.country,
    city: vendorData.city,
    currency: vendorData.currency,
    secondaryCurrency: vendorData.secondaryCurrency,
    status: 'active',
    type: 'wholeseller',
    role: 'wholesaler',
    pricingTier: 'facilitator_40',
    pricingChannel: 'wholesale',
    commercialMarkup: 40,
    facilitatorCommissionPercent: vendorData.facilitatorCommissionPercent,
    commissionModel: vendorData.commissionModel,
    paymentTerms: vendorData.paymentTerms,
    zohoBooksVendorId: vendorData.vendorIdAED,
    zohoBooksVendorNumber: vendorData.vendorNumberAED,
    zohoBooksVendorIdEUR: vendorData.vendorIdEUR,
    zohoBooksVendorNumberEUR: vendorData.vendorNumberEUR,
    uid: authUser.uid,
    notes: 'Imported and linked from Zoho Books (VEN-79 / VEN-80). Facilitator Commission: 40% on profit.',
    categories: ['Peptides', 'Compounding', 'Clinical Logistics'],
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
    fullName: vendorData.contactName,
    firstName: vendorData.firstName,
    lastName: vendorData.lastName,
    displayName: `${vendorData.companyName} · ${vendorData.contactName}`,
    companyName: vendorData.companyName,
    institution: vendorData.companyName,
    phone: vendorData.phone,
    mobile: vendorData.phone,
    role: 'wholesaler',
    roles: ['wholesaler', 'supplier', 'facilitator'],
    type: 'wholeseller',
    priceTier: 'wholesale',
    pricingTier: 'facilitator_40',
    pricingChannel: 'wholesale',
    commercialMarkup: 40,
    facilitatorCommissionPercent: vendorData.facilitatorCommissionPercent,
    commissionModel: vendorData.commissionModel,
    paymentTerms: vendorData.paymentTerms,
    currency: vendorData.currency,
    approved: true,
    professionalStatus: 'approved',
    status: 'active',
    shippingCountry: vendorData.country,
    shippingCity: vendorData.city,
    shippingAddress: { company: vendorData.companyName, city: vendorData.city, country: vendorData.country },
    billingAddress: { company: vendorData.companyName, city: vendorData.city, country: vendorData.country },
    zohoBooksVendorId: vendorData.vendorIdAED,
    zohoBooksVendorNumber: vendorData.vendorNumberAED,
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
    name: vendorData.contactName,
    firstName: vendorData.firstName,
    lastName: vendorData.lastName,
    companyName: vendorData.companyName,
    legalName: vendorData.companyName,
    phone: vendorData.phone,
    customerType: 'wholesaler',
    pricingTier: 'facilitator_40',
    currency: vendorData.currency,
    country: vendorData.country,
    city: vendorData.city,
    status: 'active',
    paymentTerms: vendorData.paymentTerms,
    creditLimit: 100000,
    tags: ['wholesaler', 'vendor', 'uae', 'dubai', 'zoho-books', 'ven-79'],
    zohoBooksVendorId: vendorData.vendorIdAED,
    zohoBooksVendorNumber: vendorData.vendorNumberAED,
    updatedAt: now
  }, { merge: true });
  console.log(`Saved customers doc: ${authUser.uid}`);

  // 6. Generate secure public statement share record
  const shareToken = 'HSC-PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  await adminDb.collection('shared_payable_statements').doc(wholesellerDocId).set({
    id: wholesellerDocId,
    token: shareToken,
    wholesalerId: wholesellerDocId,
    wholesalerName: vendorData.companyName,
    contactName: vendorData.contactName,
    contactEmail: email,
    phone: vendorData.phone,
    currency: vendorData.currency,
    vendorIdAED: vendorData.vendorIdAED,
    vendorNumberAED: vendorData.vendorNumberAED,
    vendorIdEUR: vendorData.vendorIdEUR,
    vendorNumberEUR: vendorData.vendorNumberEUR,
    facilitatorCommissionPercent: vendorData.facilitatorCommissionPercent,
    paymentTerms: vendorData.paymentTerms,
    shareUrl: `https://www.atlashealth-services.com/b2b/payables/${shareToken}`,
    status: 'active',
    createdAt: now,
    updatedAt: now
  }, { merge: true });
  console.log(`Created payable statement share doc: token=${shareToken}`);

  // 7. Sync to Algolia atlas_users
  const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || 'G722EVODUJ';
  const adminKey = process.env.ALGOLIA_ADMIN_KEY;
  if (adminKey) {
    const algolia = algoliasearch(appId, adminKey);
    await algolia.saveObjects({
      indexName: 'atlas_users',
      objects: [{
        objectID: authUser.uid,
        id: authUser.uid,
        name: `${vendorData.companyName} · ${vendorData.contactName}`,
        fullName: vendorData.contactName,
        email: vendorData.email,
        phone: vendorData.phone,
        role: 'wholesaler',
        roles: ['wholesaler', 'supplier', 'facilitator'],
        status: 'active',
        companyName: vendorData.companyName,
        country: vendorData.country,
        city: vendorData.city,
        pricingTier: 'facilitator_40',
        createdAt_ts: Date.now()
      }]
    });
    console.log(`Synced to Algolia atlas_users index: ${authUser.uid}`);
  }

  console.log('✅ Health Source Canada AED successfully onboarded!');
  console.log(`🔗 Payables Portal Token: ${shareToken}`);
  console.log(`🔗 URL: https://www.atlashealth-services.com/b2b/payables/${shareToken}`);
}

main().catch(console.error);

