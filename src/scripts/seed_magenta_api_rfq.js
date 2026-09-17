/**
 * seed_magenta_api_rfq.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers Magenta Health's Request for Quotation (RFQ) for 6 bulk APIs:
 *   1. Curcumin (100g pack x 5 = 500g)
 *   2. Edetate Disodium / EDTA (1kg pack x 2 = 2kg)
 *   3. GABA / Gamma-aminobutyric acid (500g pack x 1 = 500g)
 *   4. Nicotinamide adenine dinucleotide+ / NAD+ (1kg pack x 4 = 4kg)
 *   5. Sodium Selenite (10g pack x 1 = 10g)
 *   6. Selenious acid (5g pack x 1 = 5g)
 *
 * NOTE: All prices are strictly initialized to $0.00 / Pending Supplier Quote
 * to avoid any confusion or unverified estimates until official supplier
 * proformas are received.
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

export const MAGENTA_API_ITEMS = [
  {
    id: 'api-curcumin-100g',
    name: 'Curcumin (Ph.Eur / USP)',
    displayName: 'Curcumin Active Pharmaceutical Ingredient (100g Pack)',
    canonicalName: 'Curcumin',
    casNumber: '458-37-7',
    molecularFormula: 'C21H20O6',
    packSize: '100g',
    packUnits: 'g',
    packValue: 100,
    requestedQuantity: 5,
    totalRequestedVolume: '500g',
    category: 'api_raw_materials',
    productType: 'raw_api',
    format: 'Crystalline Powder',
    grade: 'Ph.Eur / USP (≥95.0% Curcuminoids)',
    purity: '≥95.0%',
    storageCondition: 'Protect from light and moisture, 15-25°C',
    supplierUnitCost: 0.0, // Pending supplier quote from Lotusland/lab
    targetClientUnitPrice: 0.0,
    pricingStatus: 'awaiting_supplier_quote',
    hsnCode: '29072990',
  },
  {
    id: 'api-edetate-disodium-1kg',
    name: 'Edetate Disodium (EDTA) USP',
    displayName: 'Edetate Disodium (EDTA) Dihydrate API (1kg Pack)',
    canonicalName: 'Edetate Disodium (EDTA)',
    casNumber: '6381-92-6',
    molecularFormula: 'C10H14N2Na2O8·2H2O',
    packSize: '1kg',
    packUnits: 'kg',
    packValue: 1,
    requestedQuantity: 2,
    totalRequestedVolume: '2kg',
    category: 'api_raw_materials',
    productType: 'raw_api',
    format: 'White Crystalline Powder',
    grade: 'USP / EP (Chelating Agent / Buffer Grade)',
    purity: '99.0% - 101.0%',
    storageCondition: 'Store at 20-25°C in tightly sealed containers',
    supplierUnitCost: 0.0,
    targetClientUnitPrice: 0.0,
    pricingStatus: 'awaiting_supplier_quote',
    hsnCode: '29224985',
  },
  {
    id: 'api-gaba-500g',
    name: 'GABA (Gamma-aminobutyric acid)',
    displayName: 'GABA (Gamma-Aminobutyric Acid) USP / FCC (500g Pack)',
    canonicalName: 'GABA (Gamma-aminobutyric acid)',
    casNumber: '56-12-2',
    molecularFormula: 'C4H9NO2',
    packSize: '500g',
    packUnits: 'g',
    packValue: 500,
    requestedQuantity: 1,
    totalRequestedVolume: '500g',
    category: 'api_raw_materials',
    productType: 'raw_api',
    format: 'White Crystalline Powder',
    grade: 'USP / FCC (≥99.0% Neurotransmitter API)',
    purity: '≥99.0%',
    storageCondition: 'Store in airtight container at 15-30°C',
    supplierUnitCost: 0.0,
    targetClientUnitPrice: 0.0,
    pricingStatus: 'awaiting_supplier_quote',
    hsnCode: '29224985',
  },
  {
    id: 'api-nad-plus-1kg',
    name: 'Nicotinamide adenine dinucleotide+ (NAD+)',
    displayName: 'β-Nicotinamide Adenine Dinucleotide (NAD+) Free Acid (1kg Pack)',
    canonicalName: 'Nicotinamide adenine dinucleotide+ (NAD+)',
    casNumber: '53-84-9',
    molecularFormula: 'C21H27N7O14P2',
    packSize: '1kg',
    packUnits: 'kg',
    packValue: 1,
    requestedQuantity: 4,
    totalRequestedVolume: '4kg',
    category: 'api_raw_materials',
    productType: 'raw_api',
    format: 'Lyophilized White Powder',
    grade: 'High Purity β-NAD+ (≥98.0% Enzymatic Assay)',
    purity: '≥98.0%',
    storageCondition: 'Keep desiccated at -20°C (Cold-Chain Transportation Required)',
    supplierUnitCost: 0.0,
    targetClientUnitPrice: 0.0,
    pricingStatus: 'awaiting_supplier_quote',
    hsnCode: '29349990',
  },
  {
    id: 'api-sodium-selenite-10g',
    name: 'Sodium Selenite USP',
    displayName: 'Sodium Selenite Anhydrous API (10g Pack)',
    canonicalName: 'Sodium Selenite',
    casNumber: '10102-18-8',
    molecularFormula: 'Na2SeO3',
    packSize: '10g',
    packUnits: 'g',
    packValue: 10,
    requestedQuantity: 1,
    totalRequestedVolume: '10g',
    category: 'api_raw_materials',
    productType: 'raw_api',
    format: 'Fine White Powder',
    grade: 'USP Grade (Essential Trace Element)',
    purity: '≥98.0%',
    storageCondition: 'Toxic / Corrosive standard storage, 15-25°C',
    supplierUnitCost: 0.0,
    targetClientUnitPrice: 0.0,
    pricingStatus: 'awaiting_supplier_quote',
    hsnCode: '28429090',
  },
  {
    id: 'api-selenious-acid-5g',
    name: 'Selenious acid USP',
    displayName: 'Selenious Acid Trace Element API (5g Pack)',
    canonicalName: 'Selenious acid',
    casNumber: '7783-00-8',
    molecularFormula: 'H2SeO3',
    packSize: '5g',
    packUnits: 'g',
    packValue: 5,
    requestedQuantity: 1,
    totalRequestedVolume: '5g',
    category: 'api_raw_materials',
    productType: 'raw_api',
    format: 'Colorless Hexagonal Crystals',
    grade: 'USP Injectable Trace Element Grade',
    purity: '≥98.0%',
    storageCondition: 'Store in tight, light-resistant container at 15-25°C',
    supplierUnitCost: 0.0,
    targetClientUnitPrice: 0.0,
    pricingStatus: 'awaiting_supplier_quote',
    hsnCode: '28111980',
  },
];

async function seedMagentaApiRfq() {
  console.log(`\n================================================================`);
  console.log(`🧪 UPDATING MAGENTA HEALTH RFQ: 6 BULK APIs (PRICING: $0.00 / TBD)`);
  console.log(`================================================================\n`);

  const nowIso = new Date().toISOString();
  const year = new Date().getFullYear() || 2026;

  // Magenta Health Client Profile
  const magentaUserId = 'CE0nXEryOPhBs4fkA80WtnoSBx83';
  const magentaUserSnap = await db.collection('users').doc(magentaUserId).get();
  const magentaData = magentaUserSnap.exists ? magentaUserSnap.data() : {
    displayName: 'Lynn Iglesia',
    email: 'procurement@magenta-health.ae',
    wholesellerId: 'magenta-health',
    phone: '+971 4 222 2500',
    zohoContactId: '7006116000000593278'
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 1. UPDATE 6 PRODUCTS IN `products` COLLECTION
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`📦 Phase 1: Updating 6 Raw API Products into Master Catalog ($0.00 / TBD)...`);
  for (const item of MAGENTA_API_ITEMS) {
    const productDoc = {
      id: item.id,
      name: item.name,
      displayName: item.displayName,
      canonicalName: item.canonicalName,
      productType: item.productType,
      category: item.category,
      categoryId: item.category,
      type: 'raw_api',
      status: 'active',
      isActive: true,
      pricingStatus: 'awaiting_supplier_quote',
      casNumber: item.casNumber,
      molecularFormula: item.molecularFormula,
      packSize: item.packSize,
      packUnits: item.packUnits,
      format: item.format,
      grade: item.grade,
      purity: item.purity,
      storageCondition: item.storageCondition,
      hsnCode: item.hsnCode,
      description: `${item.displayName}. Pharma grade bulk raw material with full COA and HPLC assay documentation. Pricing is pending supplier confirmation.`,
      supplier: 'Lotusland Limited / Chemical Synthesis Labs',
      supplierIds: ['supplier-lotusland'],
      pricing: {
        masterPrice: { base: 0.0, currency: 'USD' },
        wholesalePrice: { base: 0.0, currency: 'USD' },
        costPrice: { base: 0.0, currency: 'USD' },
      },
      updatedAt: nowIso,
      createdAt: nowIso,
    };

    await db.collection('products').doc(item.id).set(productDoc, { merge: true });
    console.log(`   ✓ Updated Product: ${item.name} (CAS ${item.casNumber}) [${item.packSize}] -> Price: $0.00 (Pending Quote)`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. REGISTER INBOUND CLIENT RFQ (`rfqs` COLLECTION)
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`\n📋 Phase 2: Updating Inbound RFQ in 'rfqs' Collection...`);
  const rfqId = `RFQ-${year}-MAGENTA-API-001`;

  const rfqLineItems = MAGENTA_API_ITEMS.map((item, idx) => ({
    lineIndex: idx + 1,
    productId: item.id,
    name: item.name,
    casNumber: item.casNumber,
    packSize: item.packSize,
    quantity: item.requestedQuantity,
    totalVolume: item.totalRequestedVolume,
    grade: item.grade,
    purity: item.purity,
    storageCondition: item.storageCondition,
    targetUnitCost: 0.0,
    targetUnitPrice: 0.0,
    status: 'awaiting_supplier_quote',
  }));

  const rfqDoc = {
    id: rfqId,
    rfqId,
    rfqNumber: rfqId,
    docType: 'client_rfq',
    category: 'api_raw_materials',
    status: 'pending_supplier_quote',
    pricingStatus: 'awaiting_supplier_pricing',
    currency: 'USD',
    
    // Client Meta
    client: {
      id: magentaUserId,
      name: magentaData.displayName || 'Lynn Iglesia',
      companyName: 'Magenta Health LLC',
      clinicName: 'Magenta Health',
      facilityType: 'Compounding Pharmacy & Longevity Center',
      email: magentaData.email || 'procurement@magenta-health.ae',
      phone: magentaData.phone || '+971 4 222 2500',
      zohoContactId: magentaData.zohoContactId || '7006116000000593278',
      deliveryAddress: {
        street: 'Dubai Healthcare City, Building 64, Suite 302',
        city: 'Dubai',
        country: 'United Arab Emirates',
      }
    },

    items: rfqLineItems,
    itemsCount: rfqLineItems.length,
    notes: 'Inbound RFQ from Magenta Health for 6 bulk APIs. Prices set to $0.00 awaiting formal proforma from supplier (Lotusland / API laboratory).',
    priority: 'high',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.collection('rfqs').doc(rfqId).set(rfqDoc);
  console.log(`   ✓ Updated Inbound RFQ: '${rfqId}' for Magenta Health (Status: pending_supplier_quote)`);

  // ───────────────────────────────────────────────────────────────────────────
  // 3. GENERATE DRAFT CLIENT QUOTATION (`quotations` COLLECTION)
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`\n📄 Phase 3: Updating Draft Client Quotation in 'quotations' with $0.00...`);
  const quoteNumber = `QT-${year}-MAGENTA-002`;

  const quoteItems = MAGENTA_API_ITEMS.map((item, idx) => {
    return {
      lineIndex: idx + 1,
      productId: item.id,
      name: item.name,
      description: `${item.displayName} - ${item.grade} (CAS: ${item.casNumber})`,
      casNumber: item.casNumber,
      packSize: item.packSize,
      quantity: item.requestedQuantity,
      totalVolume: item.totalRequestedVolume,
      supplierCost: 0.0,
      supplierName: 'Lotusland Limited',
      unitRate: 0.0,
      unitPrice: 0.0,
      totalPrice: 0.0,
      marginPercent: 0.0,
      pricingStatus: 'awaiting_supplier_quote',
      storageCondition: item.storageCondition,
    };
  });

  const clientQuotationDoc = {
    id: quoteNumber,
    quotationNumber: quoteNumber,
    refNumber: quoteNumber,
    linkedRfqId: rfqId,
    linkedRfqNumber: rfqId,
    supplierName: 'Lotusland Limited / Chemical Synthesis Hub',

    // Client Context
    recipientType: 'clinic',
    clientId: magentaUserId,
    clientName: magentaData.displayName || 'Lynn Iglesia',
    clinicName: 'Magenta Health',
    wholesalerId: 'magenta-health',
    wholesalerName: 'Magenta Health LLC',
    contactPerson: magentaData.displayName || 'Lynn Iglesia',
    contactEmail: magentaData.email || 'procurement@magenta-health.ae',
    contactPhone: magentaData.phone || '+971 4 222 2500',
    zohoContactId: magentaData.zohoContactId || '7006116000000593278',

    // Commercial Terms
    status: 'draft',
    pricingStatus: 'awaiting_supplier_pricing',
    currency: 'USD',
    pricingTier: 'wholesale_bulk_api',
    marginPercent: 0.0,
    totalSupplierCost: 0.0,
    marginTotal: 0.0,
    subtotal: 0.0,
    shippingCost: 0.0,
    shippingType: 'Air Express Cold-Chain (-20°C to +4°C) - TBD',
    taxTotal: 0.0,
    grandTotal: 0.0,
    paymentTerms: 'due_on_receipt',
    validityDays: 30,
    docType: 'quotation',
    items: quoteItems,
    itemsCount: quoteItems.length,
    publicToken: `token_magenta_api_${Date.now()}_draft`,
    dispatchPolicy: 'manual_only',
    notes: 'Draft quotation for 6 bulk APIs. All items initialized at $0.00 pending formal proforma quotation from supplier (Lotusland / API lab).',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.collection('quotations').doc(quoteNumber).set(clientQuotationDoc);
  console.log(`   ✓ Updated Client Quotation: '${quoteNumber}'`);
  console.log(`     - Subtotal (APIs)  : $0.00 USD (Awaiting Supplier Pricing)`);
  console.log(`     - Grand Total      : $0.00 USD`);

  // ───────────────────────────────────────────────────────────────────────────
  // 4. GENERATE OUTBOUND SUPPLIER RFQ (`supplier_rfqs` COLLECTION)
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`\n🚢 Phase 4: Updating Outbound Supplier RFQ in 'supplier_rfqs'...`);
  const srfqId = `SRFQ-${year}-LOTUS-API-001`;

  const supplierRfqDoc = {
    id: srfqId,
    srfqId,
    srfqNumber: srfqId,
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    clientReference: 'Magenta Health LLC (Dubai)',
    linkedClientRfqId: rfqId,
    linkedClientQuotationId: quoteNumber,
    category: 'api_synthesis',
    status: 'draft_sourcing',
    pricingStatus: 'awaiting_supplier_quote',
    items: MAGENTA_API_ITEMS.map((item, idx) => ({
      lineIndex: idx + 1,
      productId: item.id,
      name: item.name,
      casNumber: item.casNumber,
      packSize: item.packSize,
      quantity: item.requestedQuantity,
      totalVolume: item.totalRequestedVolume,
      requiredGrade: item.grade,
      requiredPurity: item.purity,
      targetCostPerUnit: 0.0,
      pricingStatus: 'pending_quote',
    })),
    incoterm: 'CIP Dubai Airport',
    leadTimeRequested: '10-14 business days',
    notes: 'Please provide formal proforma invoice with batch CoA including HPLC assay, endotoxin testing, and residual solvent analysis.',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.collection('supplier_rfqs').doc(srfqId).set(supplierRfqDoc);
  console.log(`   ✓ Updated Outbound Supplier RFQ: '${srfqId}' to Lotusland Limited`);

  console.log(`\n================================================================`);
  console.log(`🎉 SUCCESS: All items updated to $0.00 (Pending Supplier Pricing)`);
  console.log(`   - Client RFQ ID : ${rfqId}`);
  console.log(`   - Client Quote  : ${quoteNumber} ($0.00 USD - Status: DRAFT)`);
  console.log(`   - Supplier RFQ  : ${srfqId}`);
  console.log(`================================================================\n`);
}

seedMagentaApiRfq().catch(err => {
  console.error('Error seeding Magenta API RFQ:', err);
  process.exit(1);
});
