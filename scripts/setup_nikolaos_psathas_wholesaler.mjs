import { adminDb } from '../src/lib/firebaseAdmin.js';
import { generateSignedQuoteToken } from '../src/services/dynamicPricingEngine.js';

async function main() {
  const wholesalerId = 'np-labs-international';
  const wholesalerData = {
    id: wholesalerId,
    slug: wholesalerId,
    name: 'NP Labs International Compounding Pharmacy',
    companyName: 'NP Labs International Compounding Pharmacy',
    legalName: 'NP Labs International Compounding Pharmacy',
    contactPerson: 'Nikolaos Psathas',
    managerName: 'Nikolaos Psathas',
    title: 'Chief Executive Officer & Founder',
    email: 'nikpsathas@gmail.com',
    managerEmail: 'nikpsathas@gmail.com',
    phone: '+30 694 444 5512',
    managerPhone: '+30 694 444 5512',
    mobile: '+30 694 444 5512',
    country: 'Greece',
    city: 'Athens',
    countryCode: 'GR',
    currency: 'EUR',
    type: 'compounding_and_distributor',
    role: 'wholesaler',
    status: 'active',
    bigin_id: '7006116000000580888',
    bigin_account_id: '7006116000000591026',
    defaultMarginPercent: 20,
    catalogBrand: 'Lotusland',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // 1. Save in wholesalers collection
  await adminDb.collection('wholesalers').doc(wholesalerId).set(wholesalerData, { merge: true });
  console.log(`Saved wholesaler doc in wholesalers/${wholesalerId}`);

  // 2. Also register under nikolaos-psathas alias for direct slug resolution
  await adminDb.collection('wholesalers').doc('nikolaos-psathas').set({
    ...wholesalerData,
    id: 'nikolaos-psathas',
    slug: 'nikolaos-psathas'
  }, { merge: true });
  console.log(`Saved wholesaler alias in wholesalers/nikolaos-psathas`);

  // 3. Register user in users collection
  await adminDb.collection('users').doc('nikolaos-psathas').set({
    uid: 'nikolaos-psathas',
    email: 'nikpsathas@gmail.com',
    displayName: 'Nikolaos Psathas',
    name: 'Nikolaos Psathas',
    company: 'NP Labs International Compounding Pharmacy',
    role: 'wholesaler',
    wholesalerId: wholesalerId,
    phone: '+30 694 444 5512',
    country: 'Greece',
    status: 'active',
    updatedAt: new Date().toISOString()
  }, { merge: true });
  console.log(`Saved user record in users/nikolaos-psathas`);

  // 4. Generate Personalized Lotusland Peptides Catalog with 20% Wholesaler Margin
  const catalogId = 'CAT-NPLABS-LOTUS-20';
  const validityDays = 90;
  const issuedAt = new Date().toISOString();

  const catalogPayload = {
    catalogId,
    batchCode: catalogId,
    title: 'Lotusland Formulations & Peptides • NP Labs Exclusive',
    recipientName: 'Nikolaos Psathas (NP Labs)',
    recipientEmail: 'nikpsathas@gmail.com',
    recipientPhone: '+30 694 444 5512',
    recipientType: 'wholeseller',
    recipientUserId: 'nikolaos-psathas',
    supplierId: 'supplier-lotusland',
    supplierFilter: 'supplier-lotusland',
    catalogueFilter: 'lotusland',
    category: 'all',
    priceSource: 'wholesale',
    priceMarkupPercent: 20,
    currency: 'EUR',
    accountManagerName: 'Atlas Commercial Desk',
    accountManagerEmail: 'orders@atlas-solutions.com',
    validityDays,
    notes: 'Exclusive Lotusland portfolio pricing for NP Labs International Compounding Pharmacy with +20% wholesaler margin tier.',
    issuedAt
  };

  const token = generateSignedQuoteToken(catalogPayload, validityDays * 24);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.atlashealth-services.com';
  const shortUrl = `${baseUrl}/c/${catalogId}`;
  const longUrl = `${baseUrl}/shared/catalog/${token}`;

  await adminDb.collection('shared_catalog_links').doc(catalogId).set({
    ...catalogPayload,
    token,
    shortUrl,
    longUrl,
    shareableUrl: shortUrl,
    status: 'sent',
    channel: 'portal',
    sourceType: 'web',
    visitsCount: 0,
    lastVisitedAt: null,
    interactions: {
      pdfDownloaded: false,
      webOpened: false,
      orderPlaced: false,
      lastInteractionAt: null
    },
    wholesalerId,
    expiresAt: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: issuedAt,
    updatedAt: issuedAt
  }, { merge: true });

  console.log(`\n========================================`);
  console.log(`SUCCESSFULLY CREATED PERSONALIZED CATALOG!`);
  console.log(`Short URL: ${shortUrl}`);
  console.log(`Token URL: ${longUrl}`);
  console.log(`Markup: 20% Wholesaler Margin`);
  console.log(`Supplier: Lotusland Peptides`);
  console.log(`Recipient: Nikolaos Psathas (NP Labs)`);
  console.log(`========================================\n`);

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
