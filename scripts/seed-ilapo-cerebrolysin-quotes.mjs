#!/usr/bin/env node
/**
 * scripts/seed-ilapo-cerebrolysin-quotes.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Onboards `ilapo` (`suppliers/supplier-ilapo-germany`), uploads BOTH original
 * Cerebrolysin Sales Quote PDFs (SQ212214 @ €54 and improved @ €49) to Firebase
 * Storage, registers both revision-linked documents in `supplier_quotations`, and
 * non-destructively adds the ilapo SKU 056500 variant to `products/cerebrolysin`.
 *
 * Usage: node scripts/seed-ilapo-cerebrolysin-quotes.mjs
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import { admin, db } from './lib/firebase-admin.mjs';
import {
  ILAPO_SUPPLIER_PROFILE,
  computeQuoteRevisionImprovement,
} from '../src/lib/quotations/supplierQuoteRevisions.js';

const BUCKET_NAME =
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'med-peptides-app.firebasestorage.app';

const PDF_R1_PATH =
  '/Users/joseluiszabala/.gemini/antigravity/brain/cf7b6ede-bb88-435e-acc0-90f0a723b66d/.user_uploaded/media_1795856087936_25ae64f0.pdf';
const PDF_R2_PATH =
  '/Users/joseluiszabala/.gemini/antigravity/brain/cf7b6ede-bb88-435e-acc0-90f0a723b66d/.user_uploaded/media_1795856087936_b1e81069.pdf';

const STORAGE_R1 = 'supplier_quotations/supplier-ilapo-germany/SQ212214/SQ212214_R1_54EUR_2026-11-25.pdf';
const STORAGE_R2 = 'supplier_quotations/supplier-ilapo-germany/SQ212214/SQ212214_R2_49EUR_2026-11-25.pdf';

async function uploadPdfToStorage(localPath, storagePath) {
  if (!fs.existsSync(localPath)) {
    throw new Error(`PDF missing at ${localPath}`);
  }
  const buf = fs.readFileSync(localPath);
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex');
  const bucket = admin.storage().bucket(BUCKET_NAME);
  const file = bucket.file(storagePath);

  await file.save(buf, {
    resumable: false,
    contentType: 'application/pdf',
    metadata: {
      cacheControl: 'private, max-age=0',
      metadata: {
        supplierId: ILAPO_SUPPLIER_PROFILE.id,
        supplierQuoteNumber: 'SQ212214',
        sha256,
      },
    },
  });

  const [exists] = await file.exists();
  if (!exists) {
    throw new Error(`Storage upload verification failed for ${storagePath}`);
  }

  return {
    storagePath,
    bucket: BUCKET_NAME,
    fileName: storagePath.split('/').pop(),
    mimeType: 'application/pdf',
    sizeBytes: buf.length,
    sha256,
    uploadedAt: new Date().toISOString(),
  };
}

function buildLineItem(unitPriceEur) {
  return {
    sku: '056500',
    productId: 'cerebrolysin',
    description: '5x5 ML AMP Cerebrolysin i.m. 215,2 MG/ML Ebewe / Ever Neuro Pharma (AT)',
    manufacturer: 'Ebewe / Ever Neuro Pharma (AT)',
    tariffNo: '30049000000',
    quantity: 500,
    unit: 'Piece',
    unitPrice: unitPriceEur,
    vatPercent: 0,
    lineAmount: Number((unitPriceEur * 500).toFixed(2)),
    currency: 'EUR',
    expirationDate: '2029-03-31',
    shippingTime: '14WD - 21WD',
    storageCondition: 'Ambient max. 25°C',
  };
}

async function main() {
  const now = new Date().toISOString();

  console.log(`☁️  Uploading both ilapo Cerebrolysin PDFs to gs://${BUCKET_NAME}...`);
  const [sourceDocR1, sourceDocR2] = await Promise.all([
    uploadPdfToStorage(PDF_R1_PATH, STORAGE_R1),
    uploadPdfToStorage(PDF_R2_PATH, STORAGE_R2),
  ]);
  console.log(`  ✓ R1 uploaded: ${sourceDocR1.storagePath} (${sourceDocR1.sizeBytes} bytes)`);
  console.log(`  ✓ R2 uploaded: ${sourceDocR2.storagePath} (${sourceDocR2.sizeBytes} bytes)`);

  const improvement = computeQuoteRevisionImprovement({
    previousUnitPrice: 54,
    currentUnitPrice: 49,
    quantity: 500,
    currency: 'EUR',
  });

  // 1. Upsert supplier
  const supplierDoc = {
    ...ILAPO_SUPPLIER_PROFILE,
    productsCount: 1,
    productsSuppliedCount: 1,
    quotationsCount: 2,
    lastQuotationDate: '2026-11-25',
    updatedAt: now,
  };
  await db.collection('suppliers').doc(ILAPO_SUPPLIER_PROFILE.id).set(supplierDoc, { merge: true });
  console.log(`✅ Upserted suppliers/${ILAPO_SUPPLIER_PROFILE.id}`);

  // 2. Upsert both linked revisions in supplier_quotations
  const baseQuoteMeta = {
    supplierQuoteNumber: 'SQ212214',
    quoteGroupId: 'SQ212214',
    supplierId: ILAPO_SUPPLIER_PROFILE.id,
    supplierName: ILAPO_SUPPLIER_PROFILE.companyName,
    docType: 'supplier_quotation',
    quotationType: 'pharmaceutical_wholesale',
    category: 'finished_product',
    currency: 'EUR',
    documentDate: '2026-11-25',
    salesperson: 'Jan-Luca Bade',
    sellToCustomerNo: '66796',
    clientName: 'Mediluxe Health Solutions FZE',
    clientAddress: 'Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE',
    paymentTerms: 'Vorkasse/Prepayment',
    incoterm: 'FCA, Friedenheimer Brücke 21, 80639 München',
    requiresColdChain: false,
    storageCondition: 'Ambient max. 25°C',
    shippingCost: 0,
    taxTotal: 0,
    recipientType: 'supplier_inbound',
    updatedAt: now,
  };

  await db.collection('supplier_quotations').doc('SQ212214-R1').set(
    {
      ...baseQuoteMeta,
      id: 'SQ212214-R1',
      quotationNumber: 'SQ212214-R1',
      revisionNumber: 1,
      isLatestRevision: false,
      status: 'superseded',
      supersedesQuotationId: null,
      supersededByQuotationId: 'SQ212214-R2',
      unitPrice: 54,
      subtotal: 27000,
      grandTotal: 27000,
      lineItems: [buildLineItem(54)],
      sourceDocument: sourceDocR1,
      commercialNotes: 'Initial ilapo offer (€54.00/pack of 5x5 mL ampoules) — superseded by SQ212214-R2 (€49.00).',
      createdAt: now,
    },
    { merge: true }
  );

  await db.collection('supplier_quotations').doc('SQ212214-R2').set(
    {
      ...baseQuoteMeta,
      id: 'SQ212214-R2',
      quotationNumber: 'SQ212214-R2',
      revisionNumber: 2,
      isLatestRevision: true,
      status: 'active',
      supersedesQuotationId: 'SQ212214-R1',
      supersededByQuotationId: null,
      unitPrice: 49,
      subtotal: 24500,
      grandTotal: 24500,
      improvementSummary: {
        previousQuotationId: 'SQ212214-R1',
        previousUnitPriceEur: improvement.previousUnitPrice,
        currentUnitPriceEur: improvement.currentUnitPrice,
        unitDeltaEur: improvement.unitDelta,
        totalDeltaEur: improvement.totalDelta,
        improvementPct: improvement.improvementPct,
        currency: 'EUR',
        note: `Improved unit cost from €54.00 to €49.00 (-€5.00/pack, ${improvement.improvementPct}%, saving €2,500.00 across 500 packs).`,
      },
      lineItems: [buildLineItem(49)],
      sourceDocument: sourceDocR2,
      commercialNotes: 'Improved ilapo price revision (€49.00/pack FCA Munich, exp. 31.03.2029, shipping 14-21 WD).',
      createdAt: now,
    },
    { merge: true }
  );
  console.log('✅ Upserted supplier_quotations/SQ212214-R1 (€54, superseded) & SQ212214-R2 (€49, active)');

  // 3. Merge non-destructively into products/cerebrolysin
  const prodRef = db.collection('products').doc('cerebrolysin');
  const prodSnap = await prodRef.get();
  const existingData = prodSnap.exists ? prodSnap.data() || {} : {};
  const existingVariants = Array.isArray(existingData.variants) ? existingData.variants : [];

  const ilapoVariant = {
    id: 'cerebrolysin-ilapo-056500',
    productId: 'cerebrolysin',
    sku: '056500',
    supplierId: ILAPO_SUPPLIER_PROFILE.id,
    supplierName: ILAPO_SUPPLIER_PROFILE.companyName,
    presentation: '5×5 mL Ampoules (215.2 mg/mL · Ebewe / Ever Neuro Pharma AT)',
    concentration: '215.2 mg/mL',
    route: 'Intramuscular (i.m.)',
    type: 'finished_product',
    tariffNo: '30049000000',
    expirationDate: '2029-03-31',
    leadTime: '14WD - 21WD',
    storageCondition: 'Ambient max. 25°C',
    incoterm: 'FCA Munich',
    moq: { qty: 500, unit: 'Piece' },
    activeQuotationId: 'SQ212214-R2',
    cost: 49,
    costPriceEur: 49,
    pricing: {
      master: { perUnit: 49, currency: 'EUR' },
      wholesale: { perUnit: 64.8, currency: 'EUR' },
      clinic: { perUnit: 74.52, currency: 'EUR' },
      retail: { perUnit: 96.88, currency: 'EUR' },
    },
    priceHistory: [
      {
        quotationId: 'SQ212214-R1',
        revisionNumber: 1,
        unitPriceEur: 54,
        totalEur: 27000,
        status: 'superseded',
        date: '2026-11-25',
      },
      {
        quotationId: 'SQ212214-R2',
        revisionNumber: 2,
        unitPriceEur: 49,
        totalEur: 24500,
        deltaEur: -5,
        improvementPct: -9.26,
        status: 'active',
        date: '2026-11-25',
      },
    ],
    isActive: true,
    updatedAt: now,
  };

  const mergedVariants = [
    ...existingVariants.filter((v) => v?.id !== ilapoVariant.id && v?.supplierId !== ILAPO_SUPPLIER_PROFILE.id),
    ilapoVariant,
  ];

  await prodRef.set(
    {
      supplierIds: admin.firestore.FieldValue.arrayUnion(ILAPO_SUPPLIER_PROFILE.id),
      variants: mergedVariants,
      updatedAt: now,
    },
    { merge: true }
  );
  await prodRef.collection('variants').doc(ilapoVariant.id).set(ilapoVariant, { merge: true });

  // Verify live Storage + Firestore readbacks
  const [sq1, sq2, prodCheck] = await Promise.all([
    db.collection('supplier_quotations').doc('SQ212214-R1').get(),
    db.collection('supplier_quotations').doc('SQ212214-R2').get(),
    prodRef.get(),
  ]);
  console.log('\n🔍 Live Verification:');
  console.log(`  - R1 exists=${sq1.exists}, status=${sq1.data()?.status}, unitPrice=€${sq1.data()?.unitPrice}`);
  console.log(`  - R2 exists=${sq2.exists}, status=${sq2.data()?.status}, unitPrice=€${sq2.data()?.unitPrice}, delta=${sq2.data()?.improvementSummary?.improvementPct}%`);
  console.log(`  - cerebrolysin supplierIds=${JSON.stringify(prodCheck.data()?.supplierIds)}, variantsCount=${prodCheck.data()?.variants?.length}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ ilapo seed failed:', err);
    process.exit(1);
  });
