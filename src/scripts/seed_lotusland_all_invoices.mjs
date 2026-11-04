/**
 * scripts/seed_lotusland_all_invoices.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers all 10 Lotusland Limited Commercial Invoices into Atlas & Firebase:
 *   - Supplier: Lotusland Limited (Hong Kong Reg: 71705158)
 *   - Buyers:
 *       1. Magenta Pharma Medicine Trading LLC (TRN: 100574948400003, DIP 2)
 *          / Magenta RX Plus Compounding Pharmacy (Al Mamzar & Al Jaddaf)
 *       2. Mediluxe Health Solutions FZE (Sharjah Publishing City Free Zone)
 *          / Medical Guild Trading FZC (Dubai Silicon Oasis, TRN: 104906198700003)
 *
 * Saves in Firestore collections:
 *   - b2b_invoices (Consumed by InvoicesHub.jsx)
 *   - invoices (Consumed by Finance & Transactions)
 *   - supplier_invoices (Audit trail & AP)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

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

export const LOTUSLAND_SUPPLIER = {
  id: 'OLlBbQjgrj6tY7GmM2Jo',
  name: 'Lotusland Limited',
  legalName: 'LOTUSLAND LIMITED',
  regNumber: '71705158',
  address: 'Flat/Rm 11, 20/F Floor, The Cloud, No. 111 Tung Chau Street, Tai Kok Tsui, Kowloon, Hong Kong, 999077',
  contactPerson: 'Jon',
  phone: '+86 19521488211',
  email: 'info@longyupharma.com',
  bankDetails: {
    citibank: {
      beneficiary: 'Lotusland Limited',
      accountNumber: '395710448',
      swift: 'CITIHKHX',
      bankCode: '006',
      branchCode: '391',
      bankName: 'CITIBANK N.A.',
      bankAddress: 'Champion Tower, Three Garden Road, Central, Hong Kong'
    },
    chouzhouEur: {
      intermediary: 'BARCDEFFXXX (Barclays Bank Ireland PLC – Frankfurt Branch)',
      bankName: 'Zhejiang Chouzhou Commercial Bank',
      swift: 'CZCBCN2X',
      beneficiary: 'Lu Yu Zhou',
      accountNumber: '15650142110300002673',
      address: 'Yiwu Leyuan East, Jiangbin Road, Yiwu, Zhejiang, China'
    }
  }
};

export const BUYER_MAGENTA = {
  id: 'CE0nXEryOPhBs4fkA80WtnoSBx83',
  name: 'Magenta Pharma Medicine Trading LLC',
  legalName: 'Magenta Pharma Medicine Trading LLC',
  trn: '100574948400003',
  altTrn: '104906198700003',
  address: 'Warehouse 6, Dubai Investment Park 2, Dubai, UAE',
  phone: '04-2222500 / +971 50 521 4903',
  shipToAlMamzar: {
    facility: 'Magenta RX Plus Compounding Pharmacy',
    address: 'Office #219, Al Raihan Building, Al Mamzar, Deira Dubai, UAE',
    attn: 'Lynn Iglesia / Noriel Punzalan',
    phone: '+971 50 490 4371 / +971 50 521 4903'
  },
  shipToAlJaddaf: {
    facility: 'Magenta RX Compounding Pharmacy',
    address: 'Al Wasl Sports Club showrooms, Al Nawras St., Al Jaddaf, Dubai, 33233, UAE',
    attn: 'Noriel Punzalan',
    phone: '+971 50 490 4371'
  }
};

export const BUYER_MEDILUXE = {
  id: 'mediluxe-health-solutions',
  name: 'Mediluxe Health Solutions FZE',
  legalName: 'Mediluxe Health Solutions FZE',
  licenseNo: '4418091.01',
  email: 'jose@mediluxeme.com',
  address: 'Business Centre, Sharjah Publishing City Free Zone, Sharjah, UAE',
  contactPerson: 'Reimichon Shangchiri',
  phone: '+971 56 417 9259',
  shipTo: {
    facility: 'Medical Guild Trading FZC',
    trn: '104906198700003',
    address: 'IFZA Business Park, Dubai Silicon Oasis, Dubai, UAE, 342001'
  }
};

export const INVOICES_DATA = [
  // 1. MY20260519021Y (May 19, 2026)
  {
    invoiceNumber: 'MY20260519021Y',
    date: '2026-05-19',
    buyer: BUYER_MAGENTA,
    currency: 'USD',
    subtotal: 922.00,
    discountAmount: 500.00,
    shippingAmount: 422.00,
    grandTotal: 422.00,
    deliveryTerms: 'FCA Seller’s Facility, China (Incoterms 2020)',
    paymentTerms: '50% deposit, 50% prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: 'Enclomiphene', quantityGrams: 10, unitPrice: 50.00, lineTotal: 500.00, category: 'api_raw_materials' },
      { name: 'DHL EXPRESS', quantityGrams: 0, unitPrice: 422.00, lineTotal: 422.00, category: 'shipping' }
    ],
    notes: 'Invoice of Enclomiphene with $500 product discount applied.'
  },

  // 2. MY20260506021Y (May 6, 2026)
  {
    invoiceNumber: 'MY20260506021Y',
    date: '2026-05-06',
    buyer: BUYER_MAGENTA,
    currency: 'USD',
    subtotal: 23553.13,
    discountAmount: 0,
    shippingAmount: 400.00,
    grandTotal: 23953.13,
    deliveryTerms: 'FCA Seller’s Facility, China (Incoterms 2020)',
    paymentTerms: '50% deposit, 50% prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: 'Enclomiphene', quantityGrams: 500, unitPrice: 17.89, lineTotal: 8945.00, category: 'api_raw_materials' },
      { name: 'VIP (Vasoactive Intestinal Peptide)', quantityGrams: 7.5, unitPrice: 1947.75, lineTotal: 14608.13, category: 'api_raw_materials' },
      { name: 'Shipping by Express', quantityGrams: 0, unitPrice: 400.00, lineTotal: 400.00, category: 'shipping' }
    ],
    notes: 'Bulk Enclomiphene (500g) and VIP Peptide API procurement.'
  },

  // 3. MY20260420101Y (April 20, 2026)
  {
    invoiceNumber: 'MY20260420101Y',
    date: '2026-04-20',
    buyer: BUYER_MAGENTA,
    shipTo: BUYER_MAGENTA.shipToAlMamzar,
    currency: 'USD',
    subtotal: 75008.25,
    discountAmount: 0,
    shippingAmount: 0,
    grandTotal: 75008.25,
    deliveryTerms: 'EXW Seller’s Facility, China (Incoterms 2020)',
    paymentTerms: '100% T/T prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: '5-Amino-1MQ', quantityGrams: 5, unitPrice: 23.85, lineTotal: 119.25, category: 'api_raw_materials' },
      { name: 'Cartalax', quantityGrams: 2, unitPrice: 2365.13, lineTotal: 4730.25, category: 'api_raw_materials' },
      { name: 'Thymogen', quantityGrams: 2, unitPrice: 2583.75, lineTotal: 5167.50, category: 'api_raw_materials' },
      { name: 'Prostamax', quantityGrams: 2, unitPrice: 2583.75, lineTotal: 5167.50, category: 'api_raw_materials' },
      { name: 'Testagen', quantityGrams: 4, unitPrice: 2369.10, lineTotal: 9476.40, category: 'api_raw_materials' },
      { name: 'Carglilintide (Cagrilintide)', quantityGrams: 1, unitPrice: 2365.13, lineTotal: 2365.13, category: 'api_raw_materials' },
      { name: 'HMG', quantityGrams: 1, unitPrice: 1272.00, lineTotal: 1272.00, category: 'api_raw_materials' },
      { name: 'MK-677 (Ibutamoren)', quantityGrams: 180, unitPrice: 55.65, lineTotal: 10017.00, category: 'api_raw_materials' },
      { name: 'GW-501516 (Cardarine)', quantityGrams: 100, unitPrice: 23.85, lineTotal: 2385.00, category: 'api_raw_materials' },
      { name: 'ARA-290 (Cibinetide)', quantityGrams: 2, unitPrice: 2146.50, lineTotal: 4293.00, category: 'api_raw_materials' },
      { name: 'Cardiogen', quantityGrams: 2, unitPrice: 2663.25, lineTotal: 5326.50, category: 'api_raw_materials' },
      { name: 'MT-2 (Melanotan II)', quantityGrams: 1, unitPrice: 898.35, lineTotal: 898.35, category: 'api_raw_materials' },
      { name: 'Pinealon', quantityGrams: 3, unitPrice: 2444.63, lineTotal: 7333.88, category: 'api_raw_materials' },
      { name: 'PE-22-28', quantityGrams: 2, unitPrice: 2424.75, lineTotal: 4849.50, category: 'api_raw_materials' },
      { name: 'PEG-MGF', quantityGrams: 1, unitPrice: 6519.00, lineTotal: 6519.00, category: 'api_raw_materials' },
      { name: 'SNAP-8', quantityGrams: 2, unitPrice: 556.50, lineTotal: 1113.00, category: 'api_raw_materials' },
      { name: 'Thymulin', quantityGrams: 2, unitPrice: 1987.50, lineTotal: 3975.00, category: 'api_raw_materials' }
    ],
    notes: 'Multi-peptide raw materials batch (17 APIs) shipped to Magenta RX Plus Compounding Pharmacy.'
  },

  // 4. MY20260414096Y (April 14, 2026)
  {
    invoiceNumber: 'MY20260414096Y',
    date: '2026-04-14',
    buyer: BUYER_MAGENTA,
    shipTo: BUYER_MAGENTA.shipToAlMamzar,
    currency: 'USD',
    subtotal: 25633.15,
    discountAmount: 0,
    shippingAmount: 600.00,
    grandTotal: 26233.15,
    deliveryTerms: 'FCA Seller’s Facility, China (Incoterms 2020)',
    paymentTerms: '100% full payment prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: 'DSIP Acetate', quantityGrams: 5, unitPrice: 803.25, lineTotal: 4016.25, category: 'api_raw_materials' },
      { name: 'IGF-1 LR3', quantityGrams: 0.1, unitPrice: 21262.50, lineTotal: 2126.25, category: 'api_raw_materials' },
      { name: 'CJC without DAC Acetate', quantityGrams: 5, unitPrice: 2165.63, lineTotal: 10828.15, category: 'api_raw_materials' },
      { name: 'Thymosin Alpha-1 Acetate', quantityGrams: 5, unitPrice: 1732.50, lineTotal: 8662.50, category: 'api_raw_materials' },
      { name: 'SHIPPING WITH ICE PACK FEDEX', quantityGrams: 0, unitPrice: 600.00, lineTotal: 600.00, category: 'shipping' }
    ],
    notes: 'Key peptide raw materials batch: CJC no DAC, Thymosin Alpha-1, DSIP, IGF-1 LR3.'
  },

  // 5. MY20260406021Y (April 6, 2026)
  {
    invoiceNumber: 'MY20260406021Y',
    date: '2026-04-06',
    buyer: BUYER_MAGENTA,
    shipTo: BUYER_MAGENTA.shipToAlMamzar,
    currency: 'USD',
    subtotal: 93517.10,
    discountAmount: 0,
    shippingAmount: 1300.00, // $600 + $700 difference
    grandTotal: 94817.10,
    deliveryTerms: 'FCA Seller’s Facility, China (Incoterms 2020)',
    paymentTerms: '100% full payment prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: 'HCG', quantityGrams: 1, unitPrice: 17850.00, lineTotal: 17850.00, category: 'api_raw_materials' },
      { name: 'HUMANIN', quantityGrams: 5, unitPrice: 3453.19, lineTotal: 17265.95, category: 'api_raw_materials' },
      { name: 'IPAMORELIN', quantityGrams: 15, unitPrice: 338.63, lineTotal: 5079.45, category: 'api_raw_materials' },
      { name: 'MGF', quantityGrams: 2, unitPrice: 2551.50, lineTotal: 5103.00, category: 'api_raw_materials' },
      { name: 'THYMOSIN BETA-4 ACETATE', quantityGrams: 30, unitPrice: 1607.29, lineTotal: 48218.70, category: 'api_raw_materials' },
      { name: 'SHIPPING WITH ICE PACK FEDEX', quantityGrams: 0, unitPrice: 600.00, lineTotal: 600.00, category: 'shipping' },
      { name: 'SHIPPING CHARGES FROM PREVIOUS ORDER (DIFFERENCE)', quantityGrams: 0, unitPrice: 700.00, lineTotal: 700.00, category: 'shipping_adjustment' }
    ],
    notes: 'Thymosin Beta-4 (30g), Humanin, HCG, Ipamorelin, MGF. Includes shipping diff adjustments (RXP2026-0071: $150, MRX2026-047R1: $550).'
  },

  // 6. MY20260309021Y (March 9, 2026)
  {
    invoiceNumber: 'MY20260309021Y',
    date: '2026-03-09',
    buyer: BUYER_MAGENTA,
    shipTo: BUYER_MAGENTA.shipToAlMamzar,
    currency: 'USD',
    subtotal: 28726.85,
    discountAmount: 0,
    shippingAmount: 250.00,
    grandTotal: 28976.85,
    deliveryTerms: 'FCA Seller’s Facility, China (Incoterms 2020)',
    paymentTerms: '100% full payment prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: 'Aod-9604', quantityGrams: 15, unitPrice: 1475.52, lineTotal: 22132.80, category: 'api_raw_materials' },
      { name: 'Sermorelin', quantityGrams: 5, unitPrice: 1318.81, lineTotal: 6594.05, category: 'api_raw_materials' },
      { name: 'Fedex shipping', quantityGrams: 0, unitPrice: 250.00, lineTotal: 250.00, category: 'shipping' }
    ],
    notes: 'AOD-9604 (15g) and Sermorelin (5g) API batch for compounding.'
  },

  // 7. MY20260224021Y (February 24, 2026)
  {
    invoiceNumber: 'MY20260224021Y',
    date: '2026-02-24',
    buyer: BUYER_MAGENTA,
    shipTo: BUYER_MAGENTA.shipToAlMamzar,
    currency: 'USD',
    subtotal: 106764.00,
    discountAmount: 0,
    shippingAmount: 500.00,
    grandTotal: 107264.00,
    deliveryTerms: 'FCA Seller’s Facility, China (Incoterms 2020)',
    paymentTerms: '100% full payment prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: 'Kisspeptin-10', quantityGrams: 30, unitPrice: 937.00, lineTotal: 28110.00, category: 'api_raw_materials' },
      { name: 'Dihexa Acetate', quantityGrams: 75, unitPrice: 254.80, lineTotal: 19110.00, category: 'api_raw_materials' },
      { name: 'Thymosin Alpha Acetate', quantityGrams: 15, unitPrice: 1470.00, lineTotal: 22050.00, category: 'api_raw_materials' },
      { name: 'DSIP Acetate', quantityGrams: 5, unitPrice: 836.20, lineTotal: 4181.00, category: 'api_raw_materials' },
      { name: 'KPV Acetate', quantityGrams: 20, unitPrice: 604.70, lineTotal: 12094.00, category: 'api_raw_materials' },
      { name: 'PT-141 (Bremelanotide)', quantityGrams: 30, unitPrice: 707.30, lineTotal: 21219.00, category: 'api_raw_materials' },
      { name: 'Fedex shipping', quantityGrams: 0, unitPrice: 500.00, lineTotal: 500.00, category: 'shipping' }
    ],
    notes: 'Major procurement: Dihexa (75g), PT-141 (30g), Kisspeptin-10 (30g), KPV (20g), Thymosin Alpha (15g), DSIP (5g).'
  },

  // 8. MY20260204022Y (February 4, 2026)
  {
    invoiceNumber: 'MY20260204022Y',
    date: '2026-02-04',
    buyer: BUYER_MAGENTA,
    shipTo: BUYER_MAGENTA.shipToAlJaddaf,
    currency: 'USD',
    subtotal: 125640.00,
    discountAmount: 0,
    shippingAmount: 250.00,
    grandTotal: 125890.00,
    deliveryTerms: 'EXW China (Incoterms 2020)',
    paymentTerms: '50% deposit upon confirmation, 50% prior to shipment',
    bankProfile: 'citibank',
    items: [
      { name: 'Semax', quantityGrams: 30, unitPrice: 550.00, lineTotal: 16500.00, category: 'api_raw_materials' },
      { name: 'Selank', quantityGrams: 30, unitPrice: 550.00, lineTotal: 16500.00, category: 'api_raw_materials' },
      { name: 'Hcg', quantityGrams: 1, unitPrice: 19140.00, lineTotal: 19140.00, category: 'api_raw_materials' },
      { name: 'Epithalon', quantityGrams: 30, unitPrice: 350.00, lineTotal: 10500.00, category: 'api_raw_materials' },
      { name: 'Bpc-157 Acetate', quantityGrams: 30, unitPrice: 600.00, lineTotal: 18000.00, category: 'api_raw_materials' },
      { name: 'Tirzepatide', quantityGrams: 100, unitPrice: 450.00, lineTotal: 45000.00, category: 'api_raw_materials' },
      { name: 'Fedex shipping', quantityGrams: 0, unitPrice: 250.00, lineTotal: 250.00, category: 'shipping' }
    ],
    notes: 'Large batch: Tirzepatide (100g), Semax (30g), Selank (30g), Epithalon (30g), BPC-157 (30g), HCG (1g).'
  },

  // 9. MY20260124018Y (January 24, 2025)
  {
    invoiceNumber: 'MY20260124018Y',
    date: '2025-01-24',
    buyer: BUYER_MEDILUXE,
    shipTo: BUYER_MEDILUXE.shipTo,
    currency: 'USD',
    subtotal: 91964.00,
    discountAmount: 22973.00, // 25% discount on total
    shippingAmount: 250.00,
    grandTotal: 69241.00,
    deliveryTerms: 'EXW China (Incoterms 2020)',
    paymentTerms: '50% deposit, 50% prior to shipment (EUR transfer via Zhejiang Chouzhou Bank)',
    bankProfile: 'chouzhouEur',
    items: [
      { name: 'Tesamorelin', quantityGrams: 30, unitPrice: 2818.80, lineTotal: 84540.00, category: 'api_raw_materials' },
      { name: 'Aod 9604 Acetate', quantityGrams: 4, unitPrice: 1856.00, lineTotal: 7424.00, category: 'api_raw_materials' },
      { name: 'Shipping', quantityGrams: 0, unitPrice: 250.00, lineTotal: 250.00, category: 'shipping' }
    ],
    notes: 'Mediluxe Health Solutions FZE order: Tesamorelin 30g, AOD-9604 4g. 25% discount applied.'
  },

  // 10. MY20251230038Y (December 30, 2025)
  {
    invoiceNumber: 'MY20251230038Y',
    date: '2025-12-30',
    buyer: BUYER_MEDILUXE,
    shipTo: BUYER_MEDILUXE.shipTo,
    currency: 'EUR',
    currencyEquivalentUsd: 122851.96,
    subtotal: 140716.45,
    discountAmount: 36023.41, // 25.6% discount
    shippingAmount: 0,
    grandTotal: 104693.04,
    deliveryTerms: 'EXW China (Incoterms 2020)',
    paymentTerms: '100% T/T in advance (50% deposit, 50% prior to shipment)',
    bankProfile: 'chouzhouEur',
    items: [
      { name: 'Mots-C Acetate', quantityGrams: 90, unitPrice: 1000.39, lineTotal: 90035.10, category: 'api_raw_materials' },
      { name: 'Bremelanotide (PT 141) Acetate', quantityGrams: 15, unitPrice: 833.53, lineTotal: 12502.95, category: 'api_raw_materials' },
      { name: 'Thymosin Beta-4', quantityGrams: 10, unitPrice: 1739.69, lineTotal: 17396.90, category: 'api_raw_materials' },
      { name: 'TB500', quantityGrams: 13, unitPrice: 1087.30, lineTotal: 14134.90, category: 'api_raw_materials' },
      { name: 'BPC-157 Acetate', quantityGrams: 10, unitPrice: 664.66, lineTotal: 6646.60, category: 'api_raw_materials' }
    ],
    notes: 'Mediluxe EUR order: MOTS-c (90g), PT-141 (15g), TB-500 (13g), Thymosin Beta-4 (10g), BPC-157 (10g). 25.6% discount. USD Wire Equiv: $122,851.96.'
  }
];

async function seedAllInvoices() {
  console.log('🚀 Starting registration of 10 Lotusland Commercial Invoices into Atlas & Firebase...');
  
  let totalUsdSum = 0;
  let totalEurSum = 0;

  for (const inv of INVOICES_DATA) {
    const docId = `inv-lotusland-${inv.invoiceNumber.toLowerCase()}`;
    const poNumber = `PO-${inv.invoiceNumber}`;
    
    if (inv.currency === 'USD') {
      totalUsdSum += inv.grandTotal;
    } else {
      totalEurSum += inv.grandTotal;
    }

    const payload = {
      id: docId,
      documentNumber: inv.invoiceNumber,
      invoiceNumber: inv.invoiceNumber,
      poNumber: poNumber,
      type: 'commercial_invoice',
      invoiceType: 'supplier_invoice',
      category: 'api_raw_materials',
      status: 'approved',
      paymentStatus: 'paid_verified',
      date: inv.date,
      createdAt: new Date(`${inv.date}T10:00:00Z`).toISOString(),
      updatedAt: new Date().toISOString(),
      currency: inv.currency,
      currencyEquivalentUsd: inv.currencyEquivalentUsd || null,
      subtotal: inv.subtotal,
      discountAmount: inv.discountAmount || 0,
      shippingAmount: inv.shippingAmount || 0,
      grandTotal: inv.grandTotal,
      total: inv.grandTotal,
      deliveryTerms: inv.deliveryTerms,
      paymentTerms: inv.paymentTerms,
      notes: inv.notes,
      
      // Supplier Metadata
      supplierId: LOTUSLAND_SUPPLIER.id,
      supplierName: LOTUSLAND_SUPPLIER.name,
      supplierLegalName: LOTUSLAND_SUPPLIER.legalName,
      supplierRegNumber: LOTUSLAND_SUPPLIER.regNumber,
      supplierAddress: LOTUSLAND_SUPPLIER.address,
      supplierContact: LOTUSLAND_SUPPLIER.contactPerson,
      supplierPhone: LOTUSLAND_SUPPLIER.phone,
      supplierEmail: LOTUSLAND_SUPPLIER.email,
      bankAccountDetails: inv.bankProfile === 'chouzhouEur' 
        ? LOTUSLAND_SUPPLIER.bankDetails.chouzhouEur 
        : LOTUSLAND_SUPPLIER.bankDetails.citibank,
      
      // Customer / Buyer Metadata
      customerName: inv.buyer.name,
      customerId: inv.buyer.id,
      buyerLegalName: inv.buyer.legalName,
      buyerTrn: inv.buyer.trn || inv.buyer.altTrn || null,
      buyerAddress: inv.buyer.address,
      buyerPhone: inv.buyer.phone,
      buyerEmail: inv.buyer.email || null,
      shipTo: inv.shipTo || null,
      
      // Line Items
      items: inv.items.map(item => ({
        ...item,
        supplierName: 'Lotusland Limited',
        currency: inv.currency
      }))
    };

    // 1. Write to b2b_invoices (Consumed by InvoicesHub.jsx)
    await db.collection('b2b_invoices').doc(docId).set(payload, { merge: true });
    
    // 2. Write to invoices (Finance & Transactions unified collection)
    await db.collection('invoices').doc(docId).set(payload, { merge: true });
    
    // 3. Write to supplier_invoices (Procurement AP audit)
    await db.collection('supplier_invoices').doc(docId).set(payload, { merge: true });

    console.log(`  ✓ Registered ${inv.invoiceNumber}: ${inv.currency} ${inv.grandTotal.toLocaleString()} -> b2b_invoices, invoices, supplier_invoices`);
  }

  console.log('\n════════════════════════════════════════════════════════════');
  console.log(`🎉 ALL 10 INVOICES REGISTERED SUCCESSFULLY!`);
  console.log(`   Total USD Invoiced: $${totalUsdSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`   Total EUR Invoiced: €${totalEurSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
  console.log(`   Grand Combined Portfolio: ~$674,657.44 USD across 10 API commercial invoices`);
  console.log('════════════════════════════════════════════════════════════\n');
}

seedAllInvoices().catch(err => {
  console.error('Fatal seeding error:', err);
  process.exit(1);
});

