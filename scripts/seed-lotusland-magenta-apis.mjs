#!/usr/bin/env node
/**
 * seed-lotusland-magenta-apis.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds the 3 new Lotusland bulk API raw materials (Adipotide, Dulaglutide,
 * HGH Frag 176-191) with -25% supplier discount and +6% Magenta commercial
 * pricing into Firestore:
 *   1. `api_materials/{id}`
 *   2. `products/{api-slug}` (full technical datasheet for /raw/[slug])
 *   3. `quotations/QT-MAG-20261127` (official Magenta quotation record)
 *
 * Usage: node scripts/seed-lotusland-magenta-apis.mjs
 */

import 'dotenv/config';
import { adminDb } from '../src/lib/firebaseAdmin.js';

if (!adminDb) {
  console.error('❌ Firebase Admin not initialized.');
  process.exit(1);
}

const NOW = new Date().toISOString();
const LOTUSLAND_SUPPLIER_ID = 'OLlBbQjgrj6tY7GmM2Jo';
const LOTUSLAND_SUPPLIER_NAME = 'Lotusland Limited';

const ITEMS = [
  {
    apiDocId: 'Adipotide',
    productDocId: 'api-adipotide',
    slug: 'api-adipotide',
    canonicalKey: 'raw_api:adipotide',
    canonicalName: 'Adipotide',
    name: 'Adipotide (FTPP) Bulk API',
    displayName: 'Adipotide (FTPP) Bulk API',
    casNumber: '859216-15-2',
    molecularFormula: 'C111H204N36O28S2',
    molecularWeight: '2,555.14 g/mol',
    sequence: 'CKGGRAKDC-GG-D(KLAKLAK)2 (26-aa Chimeric Peptidomimetic)',
    therapeuticClass: 'Adipose-Targeted Metabolic Peptide',
    grade: '≥98.5% (RP-HPLC) · USP / Ph. Eur. Compounding Reference Grade',
    purity: '≥98.5% (RP-HPLC)',
    format: 'Lyophilized Bulk API Powder',
    appearance: 'White to off-white sterile lyophilized crystalline powder',
    solubility: 'Soluble in sterile water for injection (WFI) & bacteriostatic water',
    storage: '-20 °C Protected from Light, Desiccated under Inert Nitrogen',
    shelfLife: '24 months unopened at -20 °C',
    endotoxin: '<0.1 EU/mg (LAL Test)',
    waterContent: '≤5.0% (Karl Fischer)',
    mechanismOfAction:
      'Adipotide (FTPP) is a chimeric peptidomimetic coupling a white-adipose-vasculature homing motif (CKGGRAKDC, binding prohibitin on white fat endothelial cells) with a proapoptotic D-enantiomer domain D(KLAKLAK)2, designed to selectively modulate adipose microvascular remodeling in controlled metabolic research and specialized compounding protocols.',
    description:
      'High-purity synthetic Adipotide (FTPP) bulk active pharmaceutical ingredient (CAS 859216-15-2) supplied as a lyophilized powder with full RP-HPLC purity verification, mass spectrometry identity confirmation, and batch Certificate of Analysis (CoA) for licensed compounding pharmacies.',
    quantityGrams: 10,
    listPricePerGramUsd: 2800.0,
    discountPct: 25,
    netCostPerGramUsd: 2100.0,
    magentaPricePerGramUsd: 2226.0,
  },
  {
    apiDocId: 'Dulaglutide',
    productDocId: 'api-dulaglutide',
    slug: 'api-dulaglutide',
    canonicalKey: 'raw_api:dulaglutide',
    canonicalName: 'Dulaglutide',
    name: 'Dulaglutide Bulk API',
    displayName: 'Dulaglutide Bulk API',
    casNumber: '923950-08-7',
    molecularFormula: 'C2646H4044N704O836S18',
    molecularWeight: '59,670 Da (~59.7 kDa Homodimer)',
    sequence: 'GLP-1(7-37) Analog Covalently Linked to Modified Human IgG4-Fc Fragment',
    therapeuticClass: 'Long-Acting GLP-1 Receptor Agonist',
    grade: '≥98.0% (SEC-HPLC / RP-HPLC) · Endotoxin <0.1 EU/mg · Lyophilized API',
    purity: '≥98.0% (SEC-HPLC / RP-HPLC)',
    format: 'Lyophilized Bulk API Powder',
    appearance: 'White lyophilized powder / cake',
    solubility: 'Soluble in buffered aqueous solution (pH 6.5 citrate buffer)',
    storage: '-20 °C to -80 °C Protected from Light · Cold-Chain 2–8 °C Express Transit',
    shelfLife: '24 months unopened at -20 °C',
    endotoxin: '<0.1 EU/mg (USP <85>)',
    waterContent: '≤5.0% (Karl Fischer)',
    mechanismOfAction:
      'Dulaglutide is a long-acting glucagon-like peptide-1 (GLP-1) receptor agonist engineered by fusing two identical DPP-4-resistant GLP-1 analog chains to a modified human IgG4-Fc domain, conferring extended systemic half-life (~4.7 days) to support glucose-dependent insulin secretion, glucagon suppression, delayed gastric emptying, and metabolic weight optimization.',
    description:
      'Pharmaceutical-grade Dulaglutide bulk active ingredient (CAS 923950-08-7) characterized by SEC-HPLC, RP-HPLC, peptide mapping, and endotoxin verification (<0.1 EU/mg) for authorized institutional compounding and clinical formulation.',
    quantityGrams: 10,
    listPricePerGramUsd: 3400.0,
    discountPct: 25,
    netCostPerGramUsd: 2550.0,
    magentaPricePerGramUsd: 2703.0,
  },
  {
    apiDocId: 'HGH_Frag_176_191',
    productDocId: 'api-hgh-frag-176-191',
    slug: 'api-hgh-frag-176-191',
    canonicalKey: 'raw_api:hgh-frag-176-191',
    canonicalName: 'HGH Frag 176-191',
    name: 'HGH Fragment 176-191 Bulk API',
    displayName: 'HGH Fragment 176-191 Bulk API',
    casNumber: '66004-57-7',
    molecularFormula: 'C78H125N23O23S2',
    molecularWeight: '1,817.12 g/mol',
    sequence: 'H-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe-OH (Cys6–Cys13 disulfide)',
    therapeuticClass: 'Lipolytic hGH C-Terminal Fragment',
    grade: '≥99.0% (RP-HPLC) · USP / Ph. Eur. Compounding Grade · COA Verified',
    purity: '≥99.0% (RP-HPLC)',
    format: 'Lyophilized Bulk API Powder',
    appearance: 'White to off-white lyophilized powder',
    solubility: 'Soluble in sterile WFI / dilute acetic acid / bacteriostatic water',
    storage: '-20 °C Protected from Light, Desiccated',
    shelfLife: '24 months unopened at -20 °C',
    endotoxin: '<0.1 EU/mg (LAL Test)',
    waterContent: '≤5.0% (Karl Fischer)',
    mechanismOfAction:
      'HGH Fragment 176-191 is the stabilized C-terminal 16-amino-acid sequence (residues 176–191) of human growth hormone responsible for lipolytic signaling. It stimulates beta-3 adrenergic lipolysis and inhibits de novo lipogenesis without binding the full-length GH receptor mitogenic axis, avoiding IGF-1 elevation or insulin resistance.',
    description:
      'High-purity synthetic HGH Fragment 176-191 bulk API powder (CAS 66004-57-7, ≥99.0% RP-HPLC) with verified disulfide bridge integrity, MS confirmation, and full CoA documentation for licensed 503A/GMP compounding pharmacies.',
    quantityGrams: 250,
    listPricePerGramUsd: 1280.0,
    discountPct: 25,
    netCostPerGramUsd: 960.0,
    magentaPricePerGramUsd: 1017.6,
  },
];

async function run() {
  for (const item of ITEMS) {
    const distributorPrice = Number((item.netCostPerGramUsd * 1.15).toFixed(2));
    const wholesalePrice = Number((item.netCostPerGramUsd * 1.3225).toFixed(2));
    const clinicPrice = Number((wholesalePrice * 1.15).toFixed(2));

    // 1. Write to api_materials
    await adminDb.collection('api_materials').doc(item.apiDocId).set(
      {
        name: item.canonicalName,
        peptideId: item.productDocId,
        casNumber: item.casNumber,
        currency: 'USD',
        list_price_per_g_usd: item.listPricePerGramUsd,
        discount_pct: item.discountPct,
        price_per_g_usd: item.netCostPerGramUsd,
        magenta_price_per_g_usd: item.magentaPricePerGramUsd,
        quantity_g: item.quantityGrams,
        supplierId: LOTUSLAND_SUPPLIER_ID,
        supplierName: LOTUSLAND_SUPPLIER_NAME,
        updatedAt: NOW,
      },
      { merge: true }
    );

    // 2. Write to products (powers /raw/api-adipotide, /raw/api-dulaglutide, /raw/api-hgh-frag-176-191)
    await adminDb.collection('products').doc(item.productDocId).set(
      {
        id: item.productDocId,
        slug: item.slug,
        canonicalKey: item.canonicalKey,
        canonicalName: item.canonicalName,
        name: item.name,
        displayName: item.displayName,
        productName: item.name,
        type: 'raw_material',
        productType: 'raw_api',
        is_raw_api: true,
        is_peptide: true,
        category: 'api_raw_materials',
        categoryId: 'raw_material',
        status: 'published',
        isActive: true,
        casNumber: item.casNumber,
        molecularFormula: item.molecularFormula,
        molecularWeight: item.molecularWeight,
        sequence: item.sequence,
        therapeuticClass: item.therapeuticClass,
        grade: item.grade,
        purity: item.purity,
        format: item.format,
        appearance: item.appearance,
        solubility: item.solubility,
        storage: item.storage,
        shelfLife: item.shelfLife,
        endotoxin: item.endotoxin,
        waterContent: item.waterContent,
        mechanismOfAction: item.mechanismOfAction,
        description: item.description,
        packUnits: 'g',
        unit: 'g',
        packSize: `${item.quantityGrams}g`,
        currency: 'USD',
        supplierId: LOTUSLAND_SUPPLIER_ID,
        supplierName: LOTUSLAND_SUPPLIER_NAME,
        listPricePerGramUsd: item.listPricePerGramUsd,
        supplierDiscountPct: item.discountPct,
        costPerGram: item.netCostPerGramUsd,
        costPrice: item.netCostPerGramUsd,
        pricePerGram: item.netCostPerGramUsd,
        basePrice: item.netCostPerGramUsd,
        price: wholesalePrice,
        pricing: {
          baseCurrency: 'USD',
          currency: 'USD',
          listPrice: item.listPricePerGramUsd,
          supplierDiscountPct: item.discountPct,
          masterPrice: item.netCostPerGramUsd,
          mediluxePrice: distributorPrice,
          distributorPrice,
          wholesalePrice,
          clinicPrice,
          byCustomer: {
            magenta: {
              currency: 'USD',
              markupPct: 6,
              perGram: item.magentaPricePerGramUsd,
              allocatedGrams: item.quantityGrams,
              lineTotal: Number((item.magentaPricePerGramUsd * item.quantityGrams).toFixed(2)),
            },
          },
        },
        lastQuoteRef: 'QT-MAG-20261127',
        updatedAt: NOW,
      },
      { merge: true }
    );

    console.log(
      `✅ Seeded ${item.productDocId} + api_materials/${item.apiDocId} | List $${item.listPricePerGramUsd}/g -> Net(-25%) $${item.netCostPerGramUsd}/g -> Magenta(+6%) $${item.magentaPricePerGramUsd}/g`
    );
  }

  // 3. Write official Magenta Quotation document to Firestore `quotations/QT-MAG-20261127`
  await adminDb.collection('quotations').doc('QT-MAG-20261127').set(
    {
      quotationNumber: 'QT-MAG-20261127',
      issueDate: '2026-11-27',
      validUntil: '2026-12-11',
      status: 'pending',
      currency: 'USD',
      buyerName: 'Magenta Pharma Medicine Trading LLC',
      buyerTrn: '100574948400003',
      supplierId: LOTUSLAND_SUPPLIER_ID,
      supplierName: LOTUSLAND_SUPPLIER_NAME,
      supplierDiscountPct: 25,
      atlasCommissionPct: 6,
      listSubtotalUsd: 382000.0,
      netCostUsd: 286500.0,
      atlasCommissionUsd: 17190.0,
      grandTotalUsd: 303690.0,
      clientSavingsVsListUsd: 78310.0,
      clientSavingsVsListPct: 20.5,
      totalQuantityGrams: 270,
      items: ITEMS.map((it, idx) => ({
        itemNumber: idx + 1,
        productId: it.productDocId,
        datasheetUrl: `/raw/${it.slug}`,
        apiName: it.canonicalName,
        casNumber: it.casNumber,
        quantityGrams: it.quantityGrams,
        listPricePerGramUsd: it.listPricePerGramUsd,
        netCostPerGramUsd: it.netCostPerGramUsd,
        unitPriceUsd: it.magentaPricePerGramUsd,
        lineTotalUsd: Number((it.magentaPricePerGramUsd * it.quantityGrams).toFixed(2)),
      })),
      updatedAt: NOW,
    },
    { merge: true }
  );

  console.log('✅ Seeded quotations/QT-MAG-20261127 (Total Magenta: $303,690.00 | Net Cost: $286,500.00 | Commission 6%: $17,190.00)');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
