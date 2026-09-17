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
 * Actions performed:
 *   - Onboards the 6 raw API products into `products` collection with CAS numbers.
 *   - Registers Inbound RFQ `RFQ-2026-MAGENTA-API-001` in `rfqs` collection.
 *   - Creates Draft Client Quotation `QT-2026-MAGENTA-002` in `quotations` (+8% margin).
 *   - Creates Outbound Supplier Sourcing RFQ `SRFQ-2026-LOTUS-API-001` in `supplier_rfqs`.
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
    estimatedSupplierUnitCost: 40.0, // USD per 100g pack
    targetClientUnitPrice: 43.20,    // USD (+8% margin)
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
    estimatedSupplierUnitCost: 65.0, // USD per 1kg pack
    targetClientUnitPrice: 70.20,    // USD (+8% margin)
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
    estimatedSupplierUnitCost: 52.0, // USD per 500g pack
    targetClientUnitPrice: 56.16,    // USD (+8% margin)
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
    estimatedSupplierUnitCost: 1350.0, // USD per 1kg pack
    targetClientUnitPrice: 1458.00,    // USD (+8% margin)
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
    estimatedSupplierUnitCost: 35.0, // USD per 10g pack
    targetClientUnitPrice: 37.80,    // USD (+8% margin)
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
    estimatedSupplierUnitCost: 28.0, // USD per 5g pack
    targetClientUnitPrice: 30.24,    // USD (+8% margin)
    hsnCode: '28111980',
  },
];

async function seedMagentaApiRfq() {
  console.log(`\n================================================================`);
  console.log(`🧪 ONBOARDING MAGENTA HEALTH RFQ: 6 BULK APIs (CAS & QUOTATIONS)`);
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
  // 1. ONBOARD 6 PRODUCTS INTO `products` COLLECTION
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`📦 Phase 1: Upserting 6 Raw API Products into Master Catalog...`);
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
      casNumber: item.casNumber,
      molecularFormula: item.molecularFormula,
      packSize: item.packSize,
      packUnits: item.packUnits,
      format: item.format,
      grade: item.grade,
      purity: item.purity,
      storageCondition: item.storageCondition,
      hsnCode: item.hsnCode,
      description: `${item.displayName}. Pharma grade bulk raw material with full COA and HPLC assay documentation.`,
      supplier: 'Lotusland Limited / Chemical Synthesis Labs',
      supplierIds: ['supplier-lotusland'],
      pricing: {
        masterPrice: { base: item.targetClientUnitPrice, currency: 'USD' },
        wholesalePrice: { base: item.targetClientUnitPrice, currency: 'USD' },
        costPrice: { base: item.estimatedSupplierUnitCost, currency: 'USD' },
      },
      updatedAt: nowIso,
      createdAt: nowIso,
    };

    await db.collection('products').doc(item.id).set(productDoc, { merge: true });
    console.log(`   ✓ Registered Product: ${item.name} (CAS ${item.casNumber}) [${item.packSize}]`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. REGISTER INBOUND CLIENT RFQ (`rfqs` COLLECTION)
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`\n📋 Phase 2: Ingesting Inbound RFQ into 'rfqs' Collection...`);
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
    targetUnitCost: item.estimatedSupplierUnitCost,
    targetUnitPrice: item.targetClientUnitPrice,
  }));

  const rfqDoc = {
    id: rfqId,
    rfqId,
    rfqNumber: rfqId,
    docType: 'client_rfq',
    category: 'api_raw_materials',
    status: 'pending_supplier_quote', // 'pending_supplier_quote' | 'quoted' | 'converted_to_po'
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
    notes: 'Inbound RFQ from Magenta Health for 6 bulk APIs. Special attention to cold-chain for 4kg NAD+ (freeze transport -20°C).',
    priority: 'high',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.collection('rfqs').doc(rfqId).set(rfqDoc);
  console.log(`   ✓ Registered Inbound RFQ: '${rfqId}' for Magenta Health`);

  // ───────────────────────────────────────────────────────────────────────────
  // 3. GENERATE DRAFT CLIENT QUOTATION (`quotations` COLLECTION)
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`\n📄 Phase 3: Generating Draft Client Quotation in 'quotations'...`);
  const quoteNumber = `QT-${year}-MAGENTA-002`;
  const marginPercent = 8.0; // 8% commercial margin for bulk APIs

  let totalSupplierCost = 0;
  let subtotal = 0;

  const quoteItems = MAGENTA_API_ITEMS.map((item, idx) => {
    const unitCost = item.estimatedSupplierUnitCost;
    const unitPrice = parseFloat((unitCost * (1 + marginPercent / 100)).toFixed(2));
    const qty = item.requestedQuantity;
    const lineSupplierCost = parseFloat((unitCost * qty).toFixed(2));
    const lineTotal = parseFloat((unitPrice * qty).toFixed(2));

    totalSupplierCost += lineSupplierCost;
    subtotal += lineTotal;

    return {
      lineIndex: idx + 1,
      productId: item.id,
      name: item.name,
      description: `${item.displayName} - ${item.grade} (CAS: ${item.casNumber})`,
      casNumber: item.casNumber,
      packSize: item.packSize,
      quantity: qty,
      totalVolume: item.totalRequestedVolume,
      supplierCost: unitCost,
      supplierName: 'Lotusland Limited',
      unitRate: unitPrice,
      unitPrice,
      totalPrice: lineTotal,
      marginPercent,
      storageCondition: item.storageCondition,
    };
  });

  const coldChainShippingCost = 280.0; // Isothermal shipper + datalogger for NAD+
  const grandTotal = parseFloat((subtotal + coldChainShippingCost).toFixed(2));
  const marginTotal = parseFloat((subtotal - totalSupplierCost).toFixed(2));

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
    status: 'draft', // DRAFT - Awaiting admin review and supplier rate confirmation
    currency: 'USD',
    pricingTier: 'wholesale_bulk_api',
    marginPercent,
    totalSupplierCost,
    marginTotal,
    subtotal: parseFloat(subtotal.toFixed(2)),
    shippingCost: coldChainShippingCost,
    shippingType: 'Air Express Cold-Chain (-20°C to +4°C)',
    taxTotal: 0,
    grandTotal,
    paymentTerms: 'due_on_receipt',
    validityDays: 30,
    docType: 'quotation',
    items: quoteItems,
    itemsCount: quoteItems.length,
    publicToken: `token_magenta_api_${Date.now()}_draft`,
    dispatchPolicy: 'manual_only',
    notes: 'Draft quotation for 6 bulk APIs based on indicative wholesale pricing. Final supplier proforma from Lotusland pending verification.',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.collection('quotations').doc(quoteNumber).set(clientQuotationDoc);
  console.log(`   ✓ Created Client Quotation: '${quoteNumber}'`);
  console.log(`     - Subtotal (APIs)  : $${subtotal.toFixed(2)} USD`);
  console.log(`     - Gross Margin (+8%): +$${marginTotal.toFixed(2)} USD`);
  console.log(`     - Cold-Chain Freight: $${coldChainShippingCost.toFixed(2)} USD`);
  console.log(`     - Grand Total      : $${grandTotal.toFixed(2)} USD`);

  // ───────────────────────────────────────────────────────────────────────────
  // 4. GENERATE OUTBOUND SUPPLIER RFQ (`supplier_rfqs` COLLECTION)
  // ───────────────────────────────────────────────────────────────────────────
  console.log(`\n🚢 Phase 4: Sourcing Outbound Supplier RFQ in 'supplier_rfqs'...`);
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
    status: 'draft_sourcing', // 'draft_sourcing' | 'dispatched' | 'quote_received'
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
      targetCostPerUnit: item.estimatedSupplierUnitCost,
    })),
    incoterm: 'CIP Dubai Airport',
    leadTimeRequested: '10-14 business days',
    notes: 'Please provide formal proforma invoice with batch CoA including HPLC assay, endotoxin testing, and residual solvent analysis.',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await db.collection('supplier_rfqs').doc(srfqId).set(supplierRfqDoc);
  console.log(`   ✓ Created Outbound Supplier RFQ: '${srfqId}' to Lotusland Limited`);

  console.log(`\n================================================================`);
  console.log(`🎉 SUCCESS: Magenta Health API RFQ successfully recorded!`);
  console.log(`   - Client RFQ ID : ${rfqId}`);
  console.log(`   - Client Quote  : ${quoteNumber} (Status: DRAFT)`);
  console.log(`   - Supplier RFQ  : ${srfqId}`);
  console.log(`================================================================\n`);
}

seedMagentaApiRfq().catch(err => {
  console.error('Error seeding Magenta API RFQ:', err);
  process.exit(1);
});
