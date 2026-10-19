import { adminDb } from '../src/lib/firebaseAdmin.js';
import { generateSignedQuoteToken } from '../src/services/dynamicPricingEngine.js';

async function updateCodifiedCatalog() {
  // 1. Delete old reveal link if exists
  try {
    await adminDb.collection('shared_catalog_links').doc('CAT-NPLABS-LOTUS-20').delete();
    console.log('Deleted old revealing link: CAT-NPLABS-LOTUS-20');
  } catch (e) {
    // Ignore if not present
  }

  // 2. Create opaque codified catalog ID (No brand, supplier, or client names in URL)
  const catalogId = 'CAT-RX-7482';
  const validityDays = 90;
  const issuedAt = new Date().toISOString();

  const catalogPayload = {
    catalogId,
    batchCode: catalogId,
    title: 'Clinical Peptide Formulations • Specialized Portfolio',
    recipientName: 'Authorized Medical Partner',
    recipientEmail: 'nikpsathas@gmail.com',
    recipientPhone: '+30 694 444 5512',
    recipientType: 'wholeseller',
    recipientUserId: 'nikolaos-psathas',
    wholesalerId: 'np-labs-international',
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
    notes: 'Institutional peptide formulations and lyophilized vials directory in EUR with standard verified tier.',
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
    expiresAt: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: issuedAt,
    updatedAt: issuedAt
  }, { merge: true });

  console.log('========================================');
  console.log('CONFIDENTIAL CODIFIED CATALOG CREATED:');
  console.log(`Short URL: ${shortUrl}`);
  console.log(`Token URL: ${longUrl}`);
  console.log(`Title: ${catalogPayload.title}`);
  console.log(`Recipient: ${catalogPayload.recipientName}`);
  console.log('========================================');

  process.exit(0);
}

updateCodifiedCatalog().catch(err => {
  console.error(err);
  process.exit(1);
});
