/**
 * src/scripts/seed_lotusland_magenta_pos.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers PO RXP2026-0085 and PO RXP2026-0097 into Atlas:
 *   - Buyer / Client: Magenta Health LLC (Lynn Iglesia)
 *   - Supplier: Lotusland Limited (Lotusland Research)
 * 
 * Creates linked documents across:
 *   1. purchase_orders (PO-RXP2026-0085 & PO-RXP2026-0097)
 *   2. purchase_rfqs (Supplier view via /rfq/[token])
 *   3. quotations (Client view via /quotation/[token])
 *   4. batches (Vial verification via /verify/[code])
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

// 1. Initialize Firebase Admin SDK
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
  address: 'Dubai Healthcare City, Building 64, Dubai, UAE'
};

const SUPPLIER = {
  id: 'OLlBbQjgrj6tY7GmM2Jo',
  name: 'Lotusland Limited',
  displayName: 'Lotusland Limited',
  brand: 'Lotusland Research / RegenPept',
  email: 'orders@lotusland-research.com',
  hub: 'Lotusland EU Lyophilization Hub'
};

// ── PO RXP2026-0085 ──────────────────────────────────────────────────────────
export const PO_085_DATA = {
  poNumber: 'RXP2026-0085',
  supplierId: SUPPLIER.id,
  supplierName: SUPPLIER.name,
  clientId: CLIENT.id,
  clientName: CLIENT.name,
  contactPerson: CLIENT.contactPerson,
  contactEmail: CLIENT.email,
  contactPhone: CLIENT.phone,
  status: 'processing',
  fulfillmentStatus: 'partial_ready',
  currency: 'USD',
  notes: 'Order RXP2026-0085: 460 vials available & ready, 320 vials under production/replenishment. Solid oral forms (MK-677 & GW-501516) currently unavailable.',
  supplierNotes: '460 vials packaged and QC-released in cold-chain storage. 320 vials in scheduled lyophilization queue. Tablets backordered.',
  shippingTerms: 'Cold-Chain 2-8°C Express Logistics (DAP Dubai)',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tokens: {
    clientToken: 'token_magenta_rxp2026_0085',
    supplierToken: 'token_lotusland_rxp2026_0085'
  },
  items: [
    // Available & Ready
    {
      productId: 'cartalax',
      slug: 'cartalax',
      name: 'Cartalax (Cartilage Bioregulator)',
      dosage: '25 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 100,
      kits: 10,
      vialsPerKit: 10,
      unitPriceVial: 70.00,
      unitPriceKit: 380.00,
      lineTotal: 3800.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-CT25-085',
      purity: '≥99.1% (HPLC Verified)'
    },
    {
      productId: 'cardiogen',
      slug: 'cardiogen',
      name: 'Cardiogen (Myocardial Bioregulator)',
      dosage: '25 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 100,
      kits: 10,
      vialsPerKit: 10,
      unitPriceVial: 70.00,
      unitPriceKit: 380.00,
      lineTotal: 3800.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-CD25-085',
      purity: '≥99.2% (HPLC Verified)'
    },
    {
      productId: 'thymogen',
      slug: 'thymogen',
      name: 'Thymogen (Thymus Bioregulator)',
      dosage: '25 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 100,
      kits: 10,
      vialsPerKit: 10,
      unitPriceVial: 50.00,
      unitPriceKit: 280.00,
      lineTotal: 2800.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-TG25-085',
      purity: '≥99.3% (HPLC Verified)'
    },
    {
      productId: 'testagen',
      slug: 'testagen',
      name: 'Testagen (Testicular Bioregulator)',
      dosage: '25 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 150,
      kits: 15,
      vialsPerKit: 10,
      unitPriceVial: 70.00,
      unitPriceKit: 380.00,
      lineTotal: 5700.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-TS25-085',
      purity: '≥99.0% (HPLC Verified)'
    },
    {
      productId: 'thymulin',
      slug: 'thymulin',
      name: 'Thymulin (Thymic Factor Nonapeptide)',
      dosage: '10 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 10,
      kits: 1,
      vialsPerKit: 10,
      unitPriceVial: 55.00,
      unitPriceKit: 300.00,
      lineTotal: 300.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-TU10-085',
      purity: '≥99.1% (HPLC Verified)'
    },
    // Replenishment / Production
    {
      productId: 'prostamax',
      slug: 'prostamax',
      name: 'Prostamax (Prostate Bioregulator)',
      dosage: '25 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 100,
      kits: 10,
      vialsPerKit: 10,
      unitPriceVial: 70.00,
      unitPriceKit: 380.00,
      lineTotal: 3800.00,
      fulfillmentState: 'in_production',
      fulfillmentLabel: 'Under replenishment / production scheduling',
      batchCode: 'RP-LOT-PX25-085',
      purity: '≥99.0% (HPLC Target)'
    },
    {
      productId: 'snap-8',
      slug: 'snap-8',
      name: 'SNAP-8 (Acetyl Octapeptide-3)',
      dosage: '10 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 20,
      kits: 2,
      vialsPerKit: 10,
      unitPriceVial: 35.00,
      unitPriceKit: 180.00,
      lineTotal: 360.00,
      fulfillmentState: 'in_production',
      fulfillmentLabel: 'Under replenishment / production scheduling',
      batchCode: 'RP-LOT-S810-085',
      purity: '≥99.2% (HPLC Target)'
    },
    {
      productId: 'hmg',
      slug: 'hmg',
      name: 'HMG (Human Menopausal Gonadotropin)',
      dosage: '75 IU',
      format: '10R Lyophilized Vial',
      quantityVials: 200,
      kits: 20,
      vialsPerKit: 10,
      unitPriceVial: 35.00,
      unitPriceKit: 180.00,
      lineTotal: 3600.00,
      fulfillmentState: 'in_production',
      fulfillmentLabel: 'Under replenishment / production scheduling',
      batchCode: 'RP-LOT-HG75-085',
      purity: '≥99.0% (Bio-Assay Target)'
    },
    // Unavailable
    {
      productId: 'mk-677-tablets',
      slug: 'mk-677',
      name: 'MK-677 (Ibutamoren) Tablets',
      dosage: '12 mg',
      format: 'Tablets (Bottle)',
      quantityVials: 0,
      kits: 0,
      vialsPerKit: 0,
      unitPriceVial: 0,
      unitPriceKit: 0,
      lineTotal: 0.00,
      fulfillmentState: 'unavailable',
      fulfillmentLabel: 'Currently unavailable',
      batchCode: 'N/A',
      purity: 'N/A'
    },
    {
      productId: 'gw-501516-tablets',
      slug: 'gw-501516',
      name: 'GW-501516 (Cardarine) Tablets',
      dosage: '10 mg',
      format: 'Tablets (Bottle)',
      quantityVials: 0,
      kits: 0,
      vialsPerKit: 0,
      unitPriceVial: 0,
      unitPriceKit: 0,
      lineTotal: 0.00,
      fulfillmentState: 'unavailable',
      fulfillmentLabel: 'Currently unavailable',
      batchCode: 'N/A',
      purity: 'N/A'
    }
  ],
  totals: {
    totalVials: 780,
    readyVials: 460,
    inProductionVials: 320,
    unavailableItems: 2,
    readySubtotal: 16400.00,
    inProductionSubtotal: 7760.00,
    grandTotal: 24160.00
  }
};

// ── PO RXP2026-0097 ──────────────────────────────────────────────────────────
export const PO_097_DATA = {
  poNumber: 'RXP2026-0097',
  supplierId: SUPPLIER.id,
  supplierName: SUPPLIER.name,
  clientId: CLIENT.id,
  clientName: CLIENT.name,
  contactPerson: CLIENT.contactPerson,
  contactEmail: CLIENT.email,
  contactPhone: CLIENT.phone,
  status: 'processing',
  fulfillmentStatus: 'partial_ready',
  currency: 'USD',
  notes: 'Order RXP2026-0097: 960 vials available & ready, 80 vials under production/replenishment.',
  supplierNotes: '960 vials packaged and QC-released in cold-chain storage. 80 vials in scheduled lyophilization queue.',
  shippingTerms: 'Cold-Chain 2-8°C Express Logistics (DAP Dubai)',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  tokens: {
    clientToken: 'token_magenta_rxp2026_0097',
    supplierToken: 'token_lotusland_rxp2026_0097'
  },
  items: [
    // Available & Ready
    {
      productId: 'epithalon',
      slug: 'epithalon',
      name: 'Epithalon (Epithalamin Tetra-Peptide)',
      dosage: '100 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 80,
      kits: 8,
      vialsPerKit: 10,
      unitPriceVial: 230.00,
      unitPriceKit: 950.00,
      lineTotal: 7600.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-EP100-097',
      purity: '≥99.3% (HPLC Verified)'
    },
    {
      productId: 'ghk-cu',
      slug: 'ghk-cu',
      name: 'GHK-Cu (Copper Tripeptide-1)',
      dosage: '100 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 400,
      kits: 40,
      vialsPerKit: 10,
      unitPriceVial: 65.00,
      unitPriceKit: 350.00,
      lineTotal: 14000.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-GC100-097',
      purity: '≥99.4% (HPLC Verified)'
    },
    {
      productId: 'ss-31',
      slug: 'ss-31',
      name: 'SS-31 (Elamipretide Mitochondrial Peptide)',
      dosage: '50 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 80,
      kits: 8,
      vialsPerKit: 10,
      unitPriceVial: 210.00,
      unitPriceKit: 850.00,
      lineTotal: 6800.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-SS50-097',
      purity: '≥99.4% (HPLC Verified)'
    },
    {
      productId: 'pt-141',
      slug: 'pt-141',
      name: 'PT-141 (Bremelanotide)',
      dosage: '20 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 400,
      kits: 40,
      vialsPerKit: 10,
      unitPriceVial: 45.00,
      unitPriceKit: 240.00,
      lineTotal: 9600.00,
      fulfillmentState: 'ready',
      fulfillmentLabel: 'Available and ready',
      batchCode: 'RP-LOT-PT20-097',
      purity: '≥99.2% (HPLC Verified)'
    },
    // Replenishment / Production
    {
      productId: 'mots-c',
      slug: 'mots-c',
      name: 'MOTS-c (Mitochondrial ORF 12S rRNA Type-c)',
      dosage: '40 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 10,
      kits: 1,
      vialsPerKit: 10,
      unitPriceVial: 120.00,
      unitPriceKit: 550.00,
      lineTotal: 550.00,
      fulfillmentState: 'in_production',
      fulfillmentLabel: 'Under replenishment / production scheduling',
      batchCode: 'RP-LOT-MC40-097',
      purity: '≥99.1% (HPLC Target)'
    },
    {
      productId: 'kisspeptin-10',
      slug: 'kisspeptin-10',
      name: 'Kisspeptin-10 Acetate',
      dosage: '5 mg',
      format: '10R Lyophilized Vial',
      quantityVials: 70,
      kits: 7,
      vialsPerKit: 10,
      unitPriceVial: 40.00,
      unitPriceKit: 200.00,
      lineTotal: 1400.00,
      fulfillmentState: 'in_production',
      fulfillmentLabel: 'Under replenishment / production scheduling',
      batchCode: 'RP-LOT-KP5-097',
      purity: '≥99.1% (HPLC Target)'
    }
  ],
  totals: {
    totalVials: 1040,
    readyVials: 960,
    inProductionVials: 80,
    unavailableItems: 0,
    readySubtotal: 38000.00,
    inProductionSubtotal: 1950.00,
    grandTotal: 39950.00
  }
};

async function seedOrders() {
  console.log('🚀 Seeding PO RXP2026-0085 and RXP2026-0097 into Atlas Firestore...');

  const ordersToSeed = [PO_085_DATA, PO_097_DATA];

  for (const po of ordersToSeed) {
    const poId = `po-${po.poNumber.toLowerCase()}`;
    const prfqId = `prfq-${po.poNumber.toLowerCase()}`;
    const quoteId = `quote-${po.poNumber.toLowerCase()}`;

    // 1. Write purchase_orders doc
    await db.collection('purchase_orders').doc(poId).set({
      id: poId,
      poId,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      clientId: po.clientId,
      clientName: po.clientName,
      contactPerson: po.contactPerson,
      contactEmail: po.contactEmail,
      contactPhone: po.contactPhone,
      status: po.status,
      fulfillmentStatus: po.fulfillmentStatus,
      currency: po.currency,
      items: po.items,
      totals: po.totals,
      notes: po.notes,
      supplierNotes: po.supplierNotes,
      shippingTerms: po.shippingTerms,
      publicTokens: po.tokens,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt
    }, { merge: true });
    console.log(`  ✓ purchase_orders/${poId} saved (${po.poNumber})`);

    // 2. Write purchase_rfqs doc (Supplier Portal View /rfq/[token])
    await db.collection('purchase_rfqs').doc(prfqId).set({
      id: prfqId,
      prfqId: po.poNumber,
      rfqNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      clinicName: po.clientName,
      requestedByUid: po.clientId,
      publicToken: po.tokens.supplierToken,
      status: 'supplier_quoted',
      currency: po.currency,
      items: po.items.map(it => ({
        productId: it.productId,
        name: it.name,
        dosage: it.dosage,
        qty: it.quantityVials,
        quantity: it.quantityVials,
        kits: it.kits,
        targetPrice: it.unitPriceKit,
        proposedUnitPrice: it.unitPriceKit,
        finalUnitPrice: it.unitPriceKit,
        lineTotal: it.lineTotal,
        batchCode: it.batchCode,
        status: it.fulfillmentState
      })),
      totals: {
        subtotal: po.totals.grandTotal,
        total: po.totals.grandTotal,
        readySubtotal: po.totals.readySubtotal,
        inProductionSubtotal: po.totals.inProductionSubtotal
      },
      notes: po.notes,
      supplierNotes: po.supplierNotes,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt
    }, { merge: true });
    console.log(`  ✓ purchase_rfqs/${prfqId} saved with supplier token: ${po.tokens.supplierToken}`);

    // 3. Write quotations doc (Client Portal View /quotation/[token])
    await db.collection('quotations').doc(quoteId).set({
      id: quoteId,
      quotationNumber: `QT-2026-MAGENTA-${po.poNumber.slice(-4)}`,
      orderNumber: po.poNumber,
      publicToken: po.tokens.clientToken,
      clientId: po.clientId,
      clientName: po.clientName,
      wholesalerName: po.clientName,
      contactPerson: po.contactPerson,
      contactEmail: po.contactEmail,
      contactPhone: po.contactPhone,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      currency: po.currency,
      status: 'pending',
      grandTotal: po.totals.grandTotal,
      subtotal: po.totals.grandTotal,
      totalAmount: po.totals.grandTotal,
      totals: po.totals,
      items: po.items.filter(it => it.fulfillmentState !== 'unavailable').map((it, idx) => ({
        lineIndex: idx + 1,
        productId: it.productId,
        name: it.name,
        dosage: it.dosage,
        format: it.format,
        quantity: it.quantityVials,
        kits: it.kits,
        unitPrice: it.unitPriceKit,
        totalPrice: it.lineTotal,
        batchCode: it.batchCode,
        fulfillmentStatus: it.fulfillmentState,
        fulfillmentLabel: it.fulfillmentLabel,
        purity: it.purity
      })),
      notes: po.notes,
      createdAt: po.createdAt,
      updatedAt: po.updatedAt
    }, { merge: true });
    console.log(`  ✓ quotations/${quoteId} saved with client token: ${po.tokens.clientToken}`);

    // 4. Write batches docs for each item (/verify/[code])
    for (const it of po.items) {
      if (it.batchCode && it.batchCode !== 'N/A') {
        await db.collection('batches').doc(it.batchCode).set({
          id: it.batchCode,
          code: it.batchCode,
          batchCode: it.batchCode,
          lotNumber: it.batchCode,
          poNumber: po.poNumber,
          productId: it.productId,
          productSlug: it.slug,
          productName: it.name,
          dosage: it.dosage,
          format: it.format,
          purity: it.purity,
          supplierId: po.supplierId,
          supplierName: po.supplierName,
          status: 'verified',
          fulfillmentState: it.fulfillmentState,
          testedAt: '2026-10-25',
          mfgDate: '2026-10-20',
          expDate: '2028-10-20',
          coaUrl: `/p/${it.slug}?dose=${encodeURIComponent(it.dosage)}&presentation=vial&supplier=supplier-lotusland&batch=${it.batchCode}#specs-section`,
          createdAt: po.createdAt,
          updatedAt: po.updatedAt
        }, { merge: true });
        console.log(`    • batch: ${it.batchCode} -> ${it.name} (${it.dosage})`);
      }
    }
  }

  console.log('\n✅ All documents successfully registered in Atlas Firestore!');
}

seedOrders().catch(err => {
  console.error('❌ Error seeding orders:', err);
  process.exit(1);
});
