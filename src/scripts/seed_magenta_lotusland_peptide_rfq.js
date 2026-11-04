/**
 * src/scripts/seed_magenta_lotusland_peptide_rfq.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers a new Request for Quotation (RFQ) for bulk Peptide APIs:
 *   - Client: Magenta Health LLC (Dubai Healthcare City, UAE)
 *   - Supplier: Lotusland Limited (EU / UK)
 *
 * Items Requested:
 *   1. 5-Amino-1MQ: 50 g (Bulk API Powder)
 *   2. Prostamax: 10 g (Synthetic Khavinson Prostate Bioregulator API Powder)
 *   3. Pinealon: 10 g (Synthetic Khavinson Brain Bioregulator API Powder)
 *   4. IGF-1 LR3 (IGF): 200 mg / 0.2 g (Recombinant Lyophilized Bulk API)
 *
 * Historical Benchmarks (from Lotusland QT-LOTUS-2026-API-OCT):
 *   - 5-Amino-1MQ : $22.66 / g  (Total ref. cost: $1,133.00 USD)
 *   - Prostamax   : $2,454.56 / g (Total ref. cost: $24,545.60 USD)
 *   - Pinealon    : $2,322.40 / g (Total ref. cost: $23,224.00 USD)
 *   - IGF-1 LR3   : $19.44 / mg ($19,440/g) (Total ref. cost: $3,888.00 USD)
 *   - Grand Total Benchmark Cost: $52,790.60 USD
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// 1. Initialize Firebase Admin
if (!getApps().length) {
  const saPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(saPath)) {
    const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    initializeApp({ credential: cert(sa) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

const CLIENT = {
  id: 'CE0nXEryOPhBs4fkA80WtnoSBx83',
  name: 'Magenta Health LLC',
  contactPerson: 'Lynn Iglesia',
  email: 'procurement@magenta-health.ae',
  phone: '+971 4 222 2500',
  companyName: 'Magenta Health LLC',
  clinicName: 'Magenta Health',
  wholesalerId: 'magenta-health',
  address: 'Dubai Healthcare City, Building 64, Suite 302, Dubai, UAE'
};

const SUPPLIER = {
  id: 'OLlBbQjgrj6tY7GmM2Jo',
  name: 'Lotusland Limited',
  displayName: 'Lotusland Limited',
  brand: 'Lotusland Research / RegenPept',
  email: 'orders@lotusland-research.com',
  hub: 'Lotusland EU Peptide Synthesis Hub'
};

const RFQ_ITEMS = [
  {
    lineIndex: 1,
    productId: '5-amino-1mq',
    name: '5-Amino-1MQ Bulk API',
    canonicalName: '5-Amino-1MQ',
    casNumber: '42464-96-0',
    requestedQuantity: 50,
    unit: 'g',
    packSize: '50g Bulk Powder',
    format: 'High Purity Crystalline Powder',
    grade: 'Pharmaceutical Grade (≥98.5% HPLC)',
    purity: '≥98.5%',
    category: 'metabolism_weight',
    previousUnitCost: 22.66,
    previousSellingPrice: 23.85,
    benchmarkTotalCost: 1133.00,
    targetUnitCost: 'Best Tier-1 Rate (Target ≤$21.50/g)',
    storageCondition: 'Store at -20°C desiccated',
    status: 'awaiting_supplier_quote'
  },
  {
    lineIndex: 2,
    productId: 'prostamax',
    name: 'Prostamax (Prostate Bioregulator API)',
    canonicalName: 'Prostamax (Khavinson Peptide)',
    casNumber: 'Synthetic Short Peptide',
    requestedQuantity: 10,
    unit: 'g',
    packSize: '10g Bulk Powder',
    format: 'Lyophilized Sterile Bulk Powder',
    grade: 'Pharmaceutical Compounding Grade (≥98.5% HPLC)',
    purity: '≥98.5%',
    category: 'mens_health',
    previousUnitCost: 2454.56,
    previousSellingPrice: 2583.75,
    benchmarkTotalCost: 24545.60,
    targetUnitCost: 'Competitive 10g Break (Target ≤$2,200/g)',
    storageCondition: 'Store at 2-8°C / -20°C for long term',
    status: 'awaiting_supplier_quote'
  },
  {
    lineIndex: 3,
    productId: 'pinealon',
    name: 'Pinealon (Brain Bioregulator API)',
    canonicalName: 'Pinealon (Glu-Arg-Glu Synthetic Tripeptide)',
    casNumber: '1028385-49-8',
    requestedQuantity: 10,
    unit: 'g',
    packSize: '10g Bulk Powder',
    format: 'Lyophilized Sterile Bulk Powder',
    grade: 'Pharmaceutical Compounding Grade (≥98.5% HPLC)',
    purity: '≥98.5%',
    category: 'nootropics',
    previousUnitCost: 2322.40,
    previousSellingPrice: 2444.63,
    benchmarkTotalCost: 23224.00,
    targetUnitCost: 'Competitive 10g Break (Target ≤$2,100/g)',
    storageCondition: 'Store at 2-8°C / -20°C for long term',
    status: 'awaiting_supplier_quote'
  },
  {
    lineIndex: 4,
    productId: 'igf-1-lr3',
    name: 'IGF-1 LR3 (Long R3 IGF-1 Bulk API)',
    canonicalName: 'IGF-1 LR3 (Recombinant Human)',
    casNumber: '949837-92-9',
    requestedQuantity: 200,
    unit: 'mg',
    packSize: '200mg Bulk Lyophilized Powder',
    format: 'Recombinant Lyophilized Powder',
    grade: 'Bio-Assay Verified (≥98.0% SDS-PAGE / HPLC)',
    purity: '≥98.0%',
    category: 'growth_hormone',
    previousUnitCost: 19.44, // per mg
    previousSellingPrice: 20.50,
    benchmarkTotalCost: 3888.00,
    targetUnitCost: 'Aggressive Volume Break (Target ≤$17.50/mg)',
    storageCondition: 'Store at -20°C (Cold-chain express DAP Dubai)',
    status: 'awaiting_supplier_quote'
  }
];

async function seedMagentaLotuslandPeptideRfq() {
  console.log(`\n================================================================`);
  console.log(`🧬 REGISTERING MAGENTA ↔ LOTUSLAND PEPTIDE API RFQ IN ATLAS`);
  console.log(`================================================================\n`);

  const nowIso = new Date().toISOString();
  const year = new Date().getFullYear() || 2026;

  const rfqId = `RFQ-${year}-MAGENTA-API-003`;
  const srfqId = `SRFQ-${year}-LOTUS-MAGENTA-003`;
  const quoteNumber = `QT-${year}-MAGENTA-API-003`;
  const supplierPurchaseRfqId = `rfq-lotusland-magenta-api-003`;

  const supplierToken = `token_lotusland_rfq_magenta_api_003`;
  const clientToken = `token_magenta_api_2026_003`;

  // 1. INBOUND CLIENT RFQ (rfqs collection)
  console.log(`📋 Phase 1: Creating Inbound Client RFQ '${rfqId}' in 'rfqs'...`);
  const rfqDoc = {
    id: rfqId,
    rfqId,
    rfqNumber: rfqId,
    docType: 'client_rfq',
    category: 'peptide_apis',
    status: 'active_negotiation',
    pricingStatus: 'awaiting_supplier_pricing',
    currency: 'USD',
    client: {
      id: CLIENT.id,
      name: CLIENT.contactPerson,
      companyName: CLIENT.companyName,
      clinicName: CLIENT.clinicName,
      facilityType: 'Compounding Pharmacy & Longevity Center',
      email: CLIENT.email,
      phone: CLIENT.phone,
      address: CLIENT.address
    },
    supplierAssigned: {
      id: SUPPLIER.id,
      name: SUPPLIER.name,
      email: SUPPLIER.email
    },
    items: RFQ_ITEMS,
    itemsCount: RFQ_ITEMS.length,
    benchmarkTotalCostUSD: 52790.60,
    commercialGoal: 'Secure Magenta as regular monthly recurring API buyer via price optimization program',
    tokens: {
      clientToken,
      supplierToken
    },
    priority: 'urgent_high',
    notes: 'Magenta Health re-quote opportunity for 4 peptide APIs following price optimization announcement. Client expects competitive volume breaks.',
    createdAt: nowIso,
    updatedAt: nowIso
  };
  await db.collection('rfqs').doc(rfqId).set(rfqDoc, { merge: true });
  console.log(`   ✓ Inbound RFQ created: ${rfqId}`);

  // 2. OUTBOUND SUPPLIER RFQ (supplier_rfqs collection)
  console.log(`🚢 Phase 2: Creating Outbound Supplier RFQ '${srfqId}' in 'supplier_rfqs'...`);
  const srfqDoc = {
    id: srfqId,
    srfqId,
    srfqNumber: srfqId,
    supplierId: SUPPLIER.id,
    supplierName: SUPPLIER.name,
    supplierEmail: SUPPLIER.email,
    clientReference: 'Magenta Health LLC (Dubai)',
    linkedClientRfqId: rfqId,
    linkedClientQuotationId: quoteNumber,
    category: 'peptide_bulk_apis',
    status: 'sent_to_supplier',
    pricingStatus: 'awaiting_supplier_quote',
    items: RFQ_ITEMS.map(it => ({
      lineIndex: it.lineIndex,
      productId: it.productId,
      name: it.name,
      casNumber: it.casNumber,
      requestedQuantity: it.requestedQuantity,
      unit: it.unit,
      packSize: it.packSize,
      requiredGrade: it.grade,
      requiredPurity: it.purity,
      previousBenchmarkUnitCost: it.previousUnitCost,
      targetVolumeUnitCost: it.targetUnitCost,
      storageCondition: it.storageCondition
    })),
    benchmarkGrossTotalUSD: 52790.60,
    incoterm: 'Express Cold-Chain 2-8°C DAP Dubai',
    leadTimeRequested: '7-10 business days',
    requiresCoA: true,
    requiresHPLC: true,
    notes: 'Urgent re-quote for Magenta Health. Total order value ~$53k USD. Requesting Lotusland Tier-1 volume break on 10g Prostamax, 10g Pinealon, and 50g 5-Amino-1MQ.',
    tokens: {
      supplierToken,
      publicRfqUrl: `https://atlashealth-services.com/rfq/${supplierToken}`
    },
    createdAt: nowIso,
    updatedAt: nowIso
  };
  await db.collection('supplier_rfqs').doc(srfqId).set(srfqDoc, { merge: true });
  console.log(`   ✓ Supplier RFQ created: ${srfqId}`);

  // 3. PURCHASE RFQ (purchase_rfqs collection - accessible via /rfq/[token])
  console.log(`🌐 Phase 3: Creating Interactive Supplier Portal RFQ in 'purchase_rfqs'...`);
  const purchaseRfqDoc = {
    id: supplierPurchaseRfqId,
    prfqId: srfqId,
    rfqNumber: srfqId,
    publicToken: supplierToken,
    rfqToken: supplierToken,
    supplierId: SUPPLIER.id,
    supplierName: SUPPLIER.name,
    clientName: CLIENT.name,
    clinicName: 'Magenta Health LLC (Dubai Healthcare City)',
    clientId: CLIENT.id,
    status: 'pending_supplier',
    currency: 'USD',
    shippingTerms: 'Cold-Chain 2-8°C Express Logistics (DAP Dubai)',
    estimatedOrderValueUSD: 52790.60,
    notes: 'Urgent Request for Quotation: Direct order opportunity for bulk peptide APIs. Please review historical benchmark costs and provide your best Tier-1 volume rates.',
    items: RFQ_ITEMS.map(it => ({
      itemId: it.lineIndex,
      lineIndex: it.lineIndex,
      productId: it.productId,
      name: it.name,
      amount: it.requestedQuantity,
      quantity: it.requestedQuantity,
      unit: it.unit,
      packSize: it.packSize,
      purity: it.purity,
      concentration: `${it.purity} · ${it.packSize}`,
      vehicle: 'Solid Lyophilized / Crystalline Powder',
      referenceCost: it.previousUnitCost,
      historicalBenchmarkCost: it.previousUnitCost,
      targetUnitCost: it.targetUnitCost,
      benchmarkTotal: it.benchmarkTotalCost
    })),
    createdAt: nowIso,
    updatedAt: nowIso
  };

  // Write under canonical ID and direct publicToken lookup ID
  await db.collection('purchase_rfqs').doc(supplierPurchaseRfqId).set(purchaseRfqDoc, { merge: true });
  await db.collection('purchase_rfqs').doc(supplierToken).set({ ...purchaseRfqDoc, id: supplierToken }, { merge: true });
  console.log(`   ✓ Purchase RFQ created: ${supplierPurchaseRfqId} and indexed under token: ${supplierToken}`);

  // 4. CLIENT QUOTATION DRAFT (quotations collection)
  console.log(`📄 Phase 4: Initializing Internal Client Quotation Draft in 'quotations'...`);
  const clientQuotationDoc = {
    id: quoteNumber,
    quotationNumber: quoteNumber,
    refNumber: quoteNumber,
    token: clientToken,
    linkedRfqId: rfqId,
    linkedSupplierRfqId: srfqId,
    supplierName: SUPPLIER.name,
    supplierId: SUPPLIER.id,

    // Client Context
    recipientType: 'clinic',
    clientId: CLIENT.id,
    clientName: CLIENT.contactPerson,
    companyName: CLIENT.companyName,
    clinicName: CLIENT.clinicName,
    wholesalerId: CLIENT.wholesalerId,
    wholesalerName: CLIENT.companyName,
    contactPerson: CLIENT.contactPerson,
    contactEmail: CLIENT.email,
    contactPhone: CLIENT.phone,

    // Commercial Terms
    status: 'draft',
    pricingStatus: 'awaiting_supplier_pricing',
    currency: 'USD',
    pricingTier: 'wholesale_bulk_api',
    targetMarginPercent: 5.5,

    items: RFQ_ITEMS.map(it => ({
      lineIndex: it.lineIndex,
      productId: it.productId,
      name: it.name,
      casNumber: it.casNumber,
      quantity: it.requestedQuantity,
      unit: it.unit,
      packSize: it.packSize,
      supplierCost: it.previousUnitCost,
      unitPrice: it.previousSellingPrice,
      totalPrice: Number((it.previousSellingPrice * it.requestedQuantity).toFixed(2)),
      pricingStatus: 'pending_supplier_re-quote',
      purity: it.purity
    })),

    benchmarkSubtotalUSD: 55576.30,
    benchmarkSupplierCostUSD: 52790.60,
    notes: 'Draft quotation for Magenta Health pending Lotusland final volume-discounted proforma. Benchmark prices shown with standard 5.5% wholesale margin.',
    createdAt: nowIso,
    updatedAt: nowIso
  };
  await db.collection('quotations').doc(quoteNumber).set(clientQuotationDoc, { merge: true });
  console.log(`   ✓ Client Quotation Draft created: ${quoteNumber}`);

  console.log(`\n================================================================`);
  console.log(`🎉 ALL 4 DOCUMENTS SUCCESSFULLY REGISTERED IN FIRESTORE:`);
  console.log(`   1. Client RFQ       : ${rfqId}`);
  console.log(`   2. Supplier RFQ     : ${srfqId}`);
  console.log(`   3. Interactive Portal: https://atlashealth-services.com/rfq/${supplierToken}`);
  console.log(`   4. Client Quotation : https://atlashealth-services.com/quotation/${clientToken}`);
  console.log(`================================================================\n`);
}

seedMagentaLotuslandPeptideRfq().catch(err => {
  console.error('Fatal error registering RFQ:', err);
  process.exit(1);
});

