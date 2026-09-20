/**
 * update_magenta_lotusland_pricing.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates Firestore with the official Lotusland cost quotation for bulk APIs:
 *   1. Curcumin (1,000g)               @ $0.50/g gross - 25% = $0.3750/g  -> Cost: $375.00
 *   2. Edetate Disodium / EDTA (1,000g)@ $0.83/g gross - 25% = $0.6225/g  -> Cost: $622.50
 *   3. NAD+ (4,000g)                   @ $0.85/g gross - 25% = $0.6375/g  -> Cost: $2,550.00
 *   4. GABA (1,000g)                   @ $0.60/g gross - 25% = $0.4500/g  -> Cost: $450.00
 *
 * Gross Total: $5,330.00 USD
 * Supplier Discount: -25% (-$1,332.50 USD)
 * Net Supplier Cost (Lotusland): $3,997.50 USD
 *
 * Applying 6% Commercial Margin for Magenta Health Quotation:
 *   - Margin Amount (+6%): +$239.85 USD
 *   - Grand Total Quotation: $4,237.35 USD
 *
 * Sells to Magenta:
 *   1. Curcumin (1,000g): $0.39750/g  -> $397.50 USD
 *   2. EDTA (1,000g):     $0.65985/g  -> $659.85 USD
 *   3. NAD+ (4,000g):     $0.67575/g  -> $2,703.00 USD
 *   4. GABA (1,000g):     $0.47700/g  -> $477.00 USD
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

export const LOTUSLAND_MAGENTA_APIS = [
  {
    id: 'api-curcumin-1kg',
    aliasIds: ['api-curcumin-100g'],
    name: 'Curcumin (Ph.Eur / USP)',
    displayName: 'Curcumin Active Pharmaceutical Ingredient (1kg Pack)',
    canonicalName: 'Curcumin',
    casNumber: '458-37-7',
    molecularFormula: 'C21H20O6',
    packSize: '1000g (1kg)',
    packUnits: 'g',
    packValue: 1000,
    requestedQuantityGrams: 1000,
    category: 'api_raw_materials',
    productType: 'raw_api',
    type: 'raw_api',
    format: 'Crystalline Powder',
    grade: 'Ph.Eur / USP (≥95.0% Curcuminoids)',
    purity: '≥95.0%',
    storageCondition: 'Protect from light and moisture, 15-25°C',
    supplierGrossRatePerGram: 0.50,
    supplierDiscountPercent: 25,
    supplierNetRatePerGram: 0.3750,
    netCostTotal: 375.00,
    marginPercent: 6.0,
    clientUnitRatePerGram: 0.39750,
    clientTotalAmount: 397.50,
    hsnCode: '29072990',
  },
  {
    id: 'api-edetate-disodium-1kg',
    name: 'Edetate Disodium (EDTA) USP',
    displayName: 'Edetate Disodium (EDTA) Dihydrate API (1kg Pack)',
    canonicalName: 'Edetate Disodium (EDTA)',
    casNumber: '6381-92-6',
    molecularFormula: 'C10H14N2Na2O8·2H2O',
    packSize: '1000g (1kg)',
    packUnits: 'g',
    packValue: 1000,
    requestedQuantityGrams: 1000,
    category: 'api_raw_materials',
    productType: 'raw_api',
    type: 'raw_api',
    format: 'White Crystalline Powder',
    grade: 'USP / EP (Chelating Agent / Buffer Grade)',
    purity: '99.0% - 101.0%',
    storageCondition: 'Store at 20-25°C in tightly sealed containers',
    supplierGrossRatePerGram: 0.83,
    supplierDiscountPercent: 25,
    supplierNetRatePerGram: 0.6225,
    netCostTotal: 622.50,
    marginPercent: 6.0,
    clientUnitRatePerGram: 0.65985,
    clientTotalAmount: 659.85,
    hsnCode: '29224985',
  },
  {
    id: 'api-nad-plus-1kg',
    name: 'Nicotinamide adenine dinucleotide+ (NAD+)',
    displayName: 'β-Nicotinamide Adenine Dinucleotide (NAD+) Free Acid (1kg Pack)',
    canonicalName: 'Nicotinamide adenine dinucleotide+ (NAD+)',
    casNumber: '53-84-9',
    molecularFormula: 'C21H27N7O14P2',
    packSize: '4000g (4x 1kg Packs)',
    packUnits: 'g',
    packValue: 4000,
    requestedQuantityGrams: 4000,
    category: 'api_raw_materials',
    productType: 'raw_api',
    type: 'raw_api',
    format: 'Lyophilized White Powder',
    grade: 'High Purity β-NAD+ (≥98.0% Enzymatic Assay)',
    purity: '≥98.0%',
    storageCondition: 'Keep desiccated at -20°C (Cold-Chain Transportation Required)',
    requiresColdChain: true,
    supplierGrossRatePerGram: 0.85,
    supplierDiscountPercent: 25,
    supplierNetRatePerGram: 0.6375,
    netCostTotal: 2550.00,
    marginPercent: 6.0,
    clientUnitRatePerGram: 0.67575,
    clientTotalAmount: 2703.00,
    hsnCode: '29349990',
  },
  {
    id: 'api-gaba-1kg',
    aliasIds: ['api-gaba-500g'],
    name: 'GABA (Gamma-aminobutyric acid)',
    displayName: 'GABA (Gamma-Aminobutyric Acid) USP / FCC (1kg Pack)',
    canonicalName: 'GABA (Gamma-aminobutyric acid)',
    casNumber: '56-12-2',
    molecularFormula: 'C4H9NO2',
    packSize: '1000g (1kg)',
    packUnits: 'g',
    packValue: 1000,
    requestedQuantityGrams: 1000,
    category: 'api_raw_materials',
    productType: 'raw_api',
    type: 'raw_api',
    format: 'White Crystalline Powder',
    grade: 'USP / FCC (≥99.0% Neurotransmitter API)',
    purity: '≥99.0%',
    storageCondition: 'Store in airtight container at 15-30°C',
    supplierGrossRatePerGram: 0.60,
    supplierDiscountPercent: 25,
    supplierNetRatePerGram: 0.4500,
    netCostTotal: 450.00,
    marginPercent: 6.0,
    clientUnitRatePerGram: 0.47700,
    clientTotalAmount: 477.00,
    hsnCode: '29224985',
  }
];

async function updateMagentaLotuslandPricing() {
  console.log(`\n================================================================`);
  console.log(`🧪 INTEGRATING LOTUSLAND API COSTS & MAGENTA 6% MARGIN QUOTE`);
  console.log(`================================================================\n`);

  const nowIso = new Date().toISOString();
  const year = 2026;

  const totalSupplierCost = 3997.50;
  const marginPercent = 6.0;
  const marginTotal = 239.85;
  const grandTotal = 4237.35;

  // 1. UPDATE PRODUCTS IN `products` COLLECTION
  console.log(`📦 Phase 1: Registering 4 Bulk API Products with Live Lotusland Sourcing...`);
  for (const item of LOTUSLAND_MAGENTA_APIS) {
    const productPayload = {
      id: item.id,
      name: item.name,
      displayName: item.displayName,
      canonicalName: item.canonicalName,
      productType: 'raw_api',
      category: 'api_raw_materials',
      categoryId: 'api_raw_materials',
      type: 'raw_api',
      status: 'active',
      isActive: true,
      pricingStatus: 'active',
      isWholesaleOnly: true,
      isCompoundingOnly: true,
      casNumber: item.casNumber,
      molecularFormula: item.molecularFormula,
      packSize: item.packSize,
      packUnits: item.packUnits,
      format: item.format,
      grade: item.grade,
      purity: item.purity,
      storageCondition: item.storageCondition,
      requiresColdChain: !!item.requiresColdChain,
      hsnCode: item.hsnCode,
      supplier: 'Lotusland Limited',
      supplierIds: ['supplier-lotusland'],
      pricing: {
        costPrice: { base: item.netCostTotal, currency: 'USD', perGram: item.supplierNetRatePerGram },
        wholesalePrice: { base: item.clientTotalAmount, currency: 'USD', perGram: item.clientUnitRatePerGram },
        masterPrice: { base: item.clientTotalAmount, currency: 'USD' }
      },
      supplierCostHistory: [
        {
          date: nowIso,
          supplier: 'Lotusland Limited',
          grossPricePerGram: item.supplierGrossRatePerGram,
          discountPercent: item.supplierDiscountPercent,
          netCostPerGram: item.supplierNetRatePerGram,
          quantityGrams: item.requestedQuantityGrams
        }
      ],
      updatedAt: nowIso,
    };

    await db.collection('products').doc(item.id).set(productPayload, { merge: true });
    console.log(`   ✓ Updated Product '${item.id}' -> Cost: $${item.netCostTotal} ($${item.supplierNetRatePerGram}/g) | B2B Quote: $${item.clientTotalAmount} ($${item.clientUnitRatePerGram}/g)`);

    // Merge aliases if any
    if (item.aliasIds) {
      for (const aliasId of item.aliasIds) {
        await db.collection('products').doc(aliasId).set(productPayload, { merge: true });
      }
    }
  }

  // 2. REGISTER SUPPLIER QUOTATION (`supplier_quotations` COLLECTION)
  console.log(`\n🚢 Phase 2: Storing Lotusland Proforma Quotation 'SQ-LOTUS-2026-API-001'...`);
  const sqId = `SQ-LOTUS-2026-API-001`;
  const supplierQuotationPayload = {
    quotationNumber: sqId,
    supplierId: 'supplier-lotusland',
    supplierName: 'Lotusland Limited',
    clientReference: 'Magenta Health LLC (Dubai) - 4 Bulk APIs',
    category: 'api_raw_materials',
    status: 'received',
    currency: 'USD',
    recipientType: 'clinic',
    docType: 'supplier_quotation',
    grossSubtotal: 5330.00,
    discountPercent: 25.0,
    discountAmount: 1332.50,
    netSubtotal: totalSupplierCost,
    shippingCost: 0.0,
    grandTotal: totalSupplierCost,
    incoterm: 'CIP Dubai Airport / Lab Direct',
    leadTime: '7-10 business days',
    paymentTerms: '100% advance wire transfer before dispatch',
    items: LOTUSLAND_MAGENTA_APIS.map((item, idx) => ({
      lineIndex: idx + 1,
      productId: item.id,
      name: item.name,
      casNumber: item.casNumber,
      quantityGrams: item.requestedQuantityGrams,
      grossRatePerGram: item.supplierGrossRatePerGram,
      discountPercent: item.supplierDiscountPercent,
      netRatePerGram: item.supplierNetRatePerGram,
      lineGrossTotal: item.requestedQuantityGrams * item.supplierGrossRatePerGram,
      lineNetCost: item.netCostTotal,
      grade: item.grade,
      purity: item.purity,
      storageCondition: item.storageCondition
    })),
    createdAt: nowIso,
    updatedAt: nowIso
  };

  await db.collection('supplier_quotations').doc(sqId).set(supplierQuotationPayload, { merge: true });
  console.log(`   ✓ Stored Supplier Quotation '${sqId}' ($${totalSupplierCost} USD Net)`);

  // 3. UPDATE INBOUND RFQ (`rfqs` COLLECTION)
  console.log(`\n📋 Phase 3: Updating Magenta RFQ 'RFQ-2026-MAGENTA-API-001'...`);
  const rfqId = `RFQ-${year}-MAGENTA-API-001`;
  const rfqUpdatePayload = {
    status: 'priced_from_supplier',
    pricingStatus: 'ready_for_quotation',
    supplierSourced: 'Lotusland Limited',
    supplierCostTotal: totalSupplierCost,
    targetQuotationTotal: grandTotal,
    marginAppliedPercent: marginPercent,
    items: LOTUSLAND_MAGENTA_APIS.map((item, idx) => ({
      lineIndex: idx + 1,
      productId: item.id,
      name: item.name,
      casNumber: item.casNumber,
      quantityGrams: item.requestedQuantityGrams,
      unitCost: item.supplierNetRatePerGram,
      totalCost: item.netCostTotal,
      targetUnitPrice: item.clientUnitRatePerGram,
      targetTotalPrice: item.clientTotalAmount,
      grade: item.grade,
      purity: item.purity,
      status: 'priced'
    })),
    updatedAt: nowIso
  };
  await db.collection('rfqs').doc(rfqId).set(rfqUpdatePayload, { merge: true });
  console.log(`   ✓ Updated RFQ '${rfqId}' to 'priced_from_supplier'`);

  // 4. UPDATE CLIENT QUOTATION (`quotations` COLLECTION)
  console.log(`\n📄 Phase 4: Updating Client Quotation 'QT-2026-MAGENTA-002' (+6% Margin)...`);
  const quoteNumber = `QT-${year}-MAGENTA-002`;
  const clientQuotePayload = {
    id: quoteNumber,
    quotationNumber: quoteNumber,
    refNumber: quoteNumber,
    linkedRfqId: rfqId,
    linkedRfqNumber: rfqId,
    supplierName: 'Lotusland Limited (GMP / ISO Synthesis Facility)',
    recipientType: 'clinic',
    clientId: 'CE0nXEryOPhBs4fkA80WtnoSBx83',
    clientName: 'Lynn Iglesia',
    clinicName: 'Magenta Health',
    wholesalerId: 'magenta-health',
    wholesalerName: 'Magenta Health LLC',
    contactPerson: 'Lynn Iglesia',
    contactEmail: 'procurement@magenta-health.ae',
    contactPhone: '+971 4 222 2500',
    zohoContactId: '7006116000000593278',
    deliveryAddress: {
      street: 'Dubai Healthcare City, Building 64, Suite 302',
      city: 'Dubai',
      country: 'United Arab Emirates'
    },
    status: 'ready_for_dispatch',
    pricingStatus: 'active',
    currency: 'USD',
    pricingTier: 'wholesale_bulk_api',
    totalSupplierCost: totalSupplierCost,
    marginPercent: marginPercent,
    marginTotal: marginTotal,
    subtotal: grandTotal,
    shippingCost: 0.0,
    shippingType: 'Air Express Cold-Chain Included (-20°C for NAD+)',
    taxTotal: 0.0,
    grandTotal: grandTotal,
    paymentTerms: 'due_on_receipt',
    validityDays: 30,
    docType: 'quotation',
    itemsCount: LOTUSLAND_MAGENTA_APIS.length,
    publicToken: `token_magenta_api_lotusland_approved`,
    notes: 'Quotation for 4 Active Pharmaceutical Ingredients (APIs) sourced from Lotusland Limited. Prices calculated based on official manufacturer proforma (-25% volume discount applied) plus 6% commercial compounding logistics margin.',
    items: LOTUSLAND_MAGENTA_APIS.map((item, idx) => ({
      lineIndex: idx + 1,
      productId: item.id,
      name: item.name,
      description: `${item.displayName} - Grade: ${item.grade} (CAS: ${item.casNumber})`,
      casNumber: item.casNumber,
      packSize: item.packSize,
      quantity: item.requestedQuantityGrams,
      quantityGrams: item.requestedQuantityGrams,
      unit: 'g',
      supplierCostPerGram: item.supplierNetRatePerGram,
      supplierCostTotal: item.netCostTotal,
      marginPercent: marginPercent,
      unitPricePerGram: item.clientUnitRatePerGram,
      unitPrice: item.clientUnitRatePerGram,
      totalPrice: item.clientTotalAmount,
      grade: item.grade,
      purity: item.purity,
      storageCondition: item.storageCondition,
      requiresColdChain: !!item.requiresColdChain
    })),
    updatedAt: nowIso
  };

  await db.collection('quotations').doc(quoteNumber).set(clientQuotePayload, { merge: true });
  console.log(`   ✓ Updated Quotation '${quoteNumber}':`);
  console.log(`     - Total Supplier Cost : $${totalSupplierCost.toFixed(2)} USD`);
  console.log(`     - 6% Margin Markup    : +$${marginTotal.toFixed(2)} USD`);
  console.log(`     - Grand Total Quote   : $${grandTotal.toFixed(2)} USD`);
  console.log(`     - Status              : ready_for_dispatch`);
  console.log(`     - Public Token        : token_magenta_api_lotusland_approved`);

  console.log(`\n================================================================`);
  console.log(`🎉 ALL 4 BULK APIS INTEGRATED & PRICED SUCCESSFULLY!`);
  console.log(`================================================================\n`);
}

updateMagentaLotuslandPricing().catch(err => {
  console.error('Error updating Magenta pricing:', err);
  process.exit(1);
});
