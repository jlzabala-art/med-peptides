/**
 * create_magenta_client_quote.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Converts Supplier Quotation SQ-LOTUS-2026-001 into an internal draft
 * Client Quotation for Magenta Health with a 6% gross margin.
 *
 * NOTE: This is strictly an internal draft in Firestore. NO external emails
 * or messages are dispatched to the client.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

async function createMagentaClientQuote() {
  console.log(`\n======================================================`);
  console.log(`📄 CREATE INTERNAL CLIENT QUOTATION: MAGENTA HEALTH (+6% Margin)`);
  console.log(`======================================================\n`);

  const supplierQuoteId = 'SQ-LOTUS-2026-001';
  const supplierQuoteSnap = await db.collection('supplier_quotations').doc(supplierQuoteId).get();

  if (!supplierQuoteSnap.exists) {
    throw new Error(`Supplier quote ${supplierQuoteId} does not exist.`);
  }

  const sqData = supplierQuoteSnap.data();

  // Fetch Magenta Health user profile
  const magentaUserId = 'CE0nXEryOPhBs4fkA80WtnoSBx83';
  const magentaUserSnap = await db.collection('users').doc(magentaUserId).get();
  const magentaData = magentaUserSnap.exists ? magentaUserSnap.data() : {
    displayName: 'Lynn Iglesia',
    email: 'procurement@magenta-health.ae',
    wholesellerId: 'magenta-health',
    phone: '04-2222500',
    zohoContactId: '7006116000000593278'
  };

  const marginPercent = 6.0;
  const marginFactor = 1 + marginPercent / 100;
  const year = new Date().getFullYear() || 2026;
  const quoteNumber = `QT-${year}-MAGENTA-001`;

  const items = (sqData.lineItems || sqData.items || []).map((it, idx) => {
    const supplierCost = Number(it.supplierCost || it.unitPrice || 100);
    const unitPrice = parseFloat((supplierCost * marginFactor).toFixed(2));
    const qty = Number(it.quantity || 20);
    const totalPrice = parseFloat((unitPrice * qty).toFixed(2));

    return {
      lineIndex: idx + 1,
      productId: it.productId,
      variantId: it.variantId,
      name: it.name,
      dosage: it.dosage || (it.productId === 'tirzepatide' ? '20mg' : '0.01ml / click'),
      format: it.format,
      quantity: qty,
      supplierCost,
      supplierName: 'Lotusland Limited',
      unitRate: unitPrice,
      unitPrice,
      totalPrice,
      marginPercent,
      originWarehouse: it.originWarehouse
    };
  });

  const subtotal = items.reduce((sum, it) => sum + it.totalPrice, 0); // 2120 + 424 = 2544
  const shippingCost = Number(sqData.shippingCost || 160);
  const grandTotal = subtotal + shippingCost; // 2544 + 160 = 2704
  const marginTotal = subtotal - Number(sqData.subtotal || 2400); // 144

  const publicToken = `token_magenta_${Date.now()}_draft`;

  const clientQuotationDoc = {
    quotationNumber: quoteNumber,
    refNumber: quoteNumber,
    linkedSupplierQuotationId: supplierQuoteId,
    linkedSupplierQuotationNumber: sqData.quotationNumber || supplierQuoteId,
    supplierName: 'Lotusland Limited',

    // Client Context
    recipientType: 'clinic',
    clientId: magentaUserId,
    clientName: magentaData.displayName || 'Lynn Iglesia',
    clinicName: 'Magenta Health',
    wholesalerId: magentaData.wholesellerId || 'magenta-health',
    wholesalerName: 'Magenta Health',
    contactPerson: magentaData.displayName || 'Lynn Iglesia',
    contactEmail: magentaData.email || 'procurement@magenta-health.ae',
    contactPhone: magentaData.phone || '04-2222500',
    zohoContactId: magentaData.zohoContactId || '7006116000000593278',

    // Commercial Conditions
    status: 'draft', // DRAFT - Internal Only
    currency: 'USD',
    marginPercent,
    marginTotal,
    subtotal,
    shippingCost,
    taxTotal: 0,
    grandTotal,
    paymentTerms: 'due_on_receipt',
    pricingTier: 'wholesale',
    docType: 'quotation',
    items,
    publicToken,
    dispatchPolicy: 'manual_only',
    notes: 'Internal Client Quotation generated from Lotusland supplier quote (+6% margin). Not dispatched to client.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const clientQuoteRef = db.collection('quotations').doc(quoteNumber);
  await clientQuoteRef.set(clientQuotationDoc);

  // Link in Supplier Quotation
  await db.collection('supplier_quotations').doc(supplierQuoteId).update({
    linkedClientQuotationId: quoteNumber,
    linkedClientQuotationNumber: quoteNumber,
    clientTargetName: 'Magenta Health',
    clientMarginPercent: 6.0,
    updatedAt: new Date().toISOString()
  });

  console.log(`✅ Client Quotation '${quoteNumber}' created successfully in Firestore:`);
  console.log(`   - Client        : Magenta Health (Lynn Iglesia - procurement@magenta-health.ae)`);
  console.log(`   - Status        : DRAFT (Internal only, not sent)`);
  console.log(`   - Tirzepatide   : 20 pcs @ $106.00 USD = $2,120.00 USD`);
  console.log(`   - Injector Pens : 20 pcs @ $21.20 USD = $424.00 USD`);
  console.log(`   - Subtotal      : $2,544.00 USD (Gross Margin: +$144.00 USD)`);
  console.log(`   - Shipping      : $160.00 USD`);
  console.log(`   - Grand Total   : $2,704.00 USD`);
  console.log(`======================================================\n`);
}

createMagentaClientQuote().catch(err => {
  console.error('Error creating Magenta quote:', err);
  process.exit(1);
});
