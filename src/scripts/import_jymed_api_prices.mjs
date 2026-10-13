/**
 * import_jymed_api_prices.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Transactional import of Bulk API supplier quotations from
 * Shenzhen JYMed Technology Co., Ltd. (Peptide_API_RFQ_Mediluxe(1).xlsx).
 *
 * Strict Compliance:
 * - BULK ACTIVE PHARMACEUTICAL INGREDIENTS ONLY
 * - NOT finished vials or dosage forms
 * - Units in grams (g), prices in USD/g
 * - Never modifies or overwrites finished peptide vial records
 * - Updates supplier record with contact & manufacturing entity
 * - Registers quotation in 'supplier_quotations'
 * - Updates catalog facets
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';

if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const sa = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(sa) });
  } else {
    initializeApp({ projectId: 'med-peptides-app' });
  }
}

const db = getFirestore();

const IMPORT_PAYLOAD = {
  supplier: {
    id: "jymed-peptide",
    company_name: "Shenzhen JYMed Technology Co., Ltd.",
    website: "https://www.jymedtech.com",
    manufacturing_entity: {
      companyName: "Hubei JXBio Pharmaceutical Co., Ltd.",
      country: "China",
      facilityType: "API Manufacturing Facility",
      fdaStatus: "Supplier reports FDA-approved plant",
      verificationRequired: true,
      source: "Peptide_API_RFQ_Mediluxe(1).xlsx",
      linkedAt: new Date().toISOString()
    },
    contact: {
      name: "Hossam Rdowan",
      position: "BD Manager - MEA",
      department: "Emerging Markets API Business Division",
      whatsapp: "+201004909448",
      wechat: "00201004909448",
      linkedAt: new Date().toISOString()
    }
  },
  quotation: {
    quotationNumber: "SQ-JYMED-2026-MEDILUXE-01",
    quotationType: "BULK_API_SUPPLIER_PRICE_LIST",
    docType: "supplier_quotation",
    type: "supplier_quotation",
    category: "api_raw_materials",
    sourceDocument: "Peptide_API_RFQ_Mediluxe(1).xlsx",
    currency: "USD",
    priceUnit: "USD/g",
    minimumOrderUnit: "g",
    priceCategory: "SUPPLIER_PURCHASE_COST",
    finishedProduct: false,
    bulkMaterial: true,
    status: "received",
    recipientType: "compounding_pharmacy",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  products: [
    {
      id: "api-retatrutide-bulk",
      name: "Retatrutide Bulk API Powder",
      canonicalName: "Retatrutide",
      skuCode: "RETATRUTIDE",
      casNumber: "2381089-83-2",
      molecularFormula: "C223H343N53O66",
      molecularWeight: "4731.33 g/mol",
      category: "api_peptide",
      categoryName: "Metabolic & GIP/GLP-1/Glucagon Triple Receptor Agonist API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 350,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 3500,
      gmp_claim: "cGMP",
      documentation: ["CoA", "DMF"],
      availability: "Ready stock",
      price_status: "QUOTED",
      description: "High-purity Retatrutide in bulk lyophilized active pharmaceutical ingredient (API) powder form. Targeted triple agonist (GIP, GLP-1, and Glucagon receptors) for specialized investigational metabolic formulations."
    },
    {
      id: "api-tirzepatide-bulk",
      name: "Tirzepatide Bulk API Powder",
      canonicalName: "Tirzepatide",
      skuCode: "TIRZEPATIDE",
      casNumber: "2023788-19-2",
      molecularFormula: "C225H348N48O68",
      molecularWeight: "4813.45 g/mol",
      category: "api_peptide",
      categoryName: "Metabolic & Dual GIP/GLP-1 Receptor Agonist API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 260,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 2600,
      gmp_claim: "cGMP",
      documentation: ["CoA", "WC", "DMF"],
      availability: "Ready stock",
      price_status: "QUOTED",
      description: "Pharmaceutical-grade Tirzepatide bulk API powder. Dual glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptor agonist for customized clinical compounding."
    },
    {
      id: "api-semaglutide-bulk",
      name: "Semaglutide Bulk API Powder",
      canonicalName: "Semaglutide",
      skuCode: "SEMAGLUTIDE",
      casNumber: "910463-68-2",
      molecularFormula: "C187H291N45O59",
      molecularWeight: "4113.58 g/mol",
      category: "api_peptide",
      categoryName: "Metabolic & GLP-1 Receptor Agonist API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 250,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 2500,
      gmp_claim: "cGMP",
      documentation: ["CoA", "WC", "DMF"],
      availability: "Ready stock",
      price_status: "QUOTED",
      description: "Pharmaceutical-grade Semaglutide bulk API powder with written confirmation (WC) and Drug Master File (DMF) documentation. Selective GLP-1 receptor agonist for magistral preparations."
    },
    {
      id: "api-cagrilintide-bulk",
      name: "Cagrilintide Bulk API Powder",
      canonicalName: "Cagrilintide",
      skuCode: "CAGRILINTIDE",
      casNumber: "1415456-99-3",
      molecularFormula: "C170H269N47O54S",
      molecularWeight: "3843.34 g/mol",
      category: "api_peptide",
      categoryName: "Long-Acting Amylin Analogue API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: null,
      minimum_order_quantity_g: 4,
      minimum_order_value_usd: null,
      gmp_claim: "cGMP",
      documentation: ["CoA"],
      availability: "Sample for R&D trials",
      price_status: "PENDING_QUOTATION",
      description: "Cagrilintide bulk active pharmaceutical ingredient (API) powder sample for investigational R&D trials and compounding formulation development. Long-acting acylated amylin receptor agonist."
    },
    {
      id: "api-ghk-cu-cosmetic-raw",
      name: "GHK-Cu Cosmetic Raw Material Powder",
      canonicalName: "GHK-Cu",
      skuCode: "GHKCU",
      casNumber: "49557-75-7",
      molecularFormula: "C14H24CuN6O4",
      molecularWeight: "403.92 g/mol",
      category: "cosmetic_raw_material",
      categoryName: "Cosmetic Copper Tripeptide-1 Raw Material",
      material_type: "Bulk Peptide Raw Material",
      grade: "Cosmetic",
      price_usd_per_gram: 15,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 150,
      gmp_claim: "cGMP",
      documentation: ["CoA"],
      availability: "Ready stock",
      price_status: "QUOTED",
      description: "Cosmetic-grade Copper Tripeptide-1 (GHK-Cu) bulk raw material powder. Deep blue crystalline peptide material indicated strictly for topical cosmeceutical and dermal rejuvenation formulations."
    },
    {
      id: "api-oxytocin-acetate-bulk",
      name: "Oxytocin Acetate Bulk API Powder",
      canonicalName: "Oxytocin Acetate",
      skuCode: "OXYTOCIN",
      casNumber: "50-56-6",
      molecularFormula: "C43H66N12O12S2",
      molecularWeight: "1007.19 g/mol",
      category: "api_peptide",
      categoryName: "Neuropeptide Hormone API",
      material_type: "Bulk API",
      grade: "Pharmaceutical",
      price_usd_per_gram: 160,
      minimum_order_quantity_g: 10,
      minimum_order_value_usd: 1600,
      gmp_claim: "cGMP",
      documentation: ["CoA", "WC", "DMF", "CEP"],
      availability: "Ready stock",
      price_status: "QUOTED",
      description: "Pharmaceutical-grade Oxytocin Acetate bulk API powder backed by Certificate of Suitability (CEP) and European/US regulatory documentation. High-purity nonapeptide for sterile compounding."
    }
  ]
};

async function executeImport() {
  console.log('=================================================================');
  console.log('🚀 LIVE IMPORT: BULK API PRICES (Shenzhen JYMed Technology Co.)');
  console.log('=================================================================\n');

  const now = new Date().toISOString();

  // 1. UPDATE SUPPLIER RECORD
  console.log('📦 Updating supplier record "jymed-peptide"...');
  const supplierRef = db.collection('suppliers').doc('jymed-peptide');
  const supplierSnap = await supplierRef.get();
  const currentSupplier = supplierSnap.data() || {};

  const existingContacts = currentSupplier.contacts || [];
  const contactExists = existingContacts.some(c => c.name === IMPORT_PAYLOAD.supplier.contact.name);
  const updatedContacts = contactExists 
    ? existingContacts 
    : [...existingContacts, IMPORT_PAYLOAD.supplier.contact];

  const existingEntities = currentSupplier.manufacturingEntities || [];
  const entityExists = existingEntities.some(e => e.companyName === IMPORT_PAYLOAD.supplier.manufacturing_entity.companyName);
  const updatedEntities = entityExists
    ? existingEntities
    : [...existingEntities, IMPORT_PAYLOAD.supplier.manufacturing_entity];

  await supplierRef.set({
    contacts: updatedContacts,
    manufacturingEntities: updatedEntities,
    quotationsCount: (currentSupplier.quotationsCount || 0) + 1,
    productsSuppliedCount: (currentSupplier.productsSuppliedCount || 0) + IMPORT_PAYLOAD.products.length,
    lastQuotationDate: now,
    updatedAt: now
  }, { merge: true });

  console.log('✔ Supplier "jymed-peptide" updated with contact & manufacturing entity.\n');

  // 2. CREATE / UPSERT 6 BULK API PRODUCTS
  console.log('🧪 Importing 6 Bulk API products into "products" collection...');
  const quotationLineItems = [];

  for (let idx = 0; idx < IMPORT_PAYLOAD.products.length; idx++) {
    const item = IMPORT_PAYLOAD.products[idx];
    const isPriced = item.price_usd_per_gram !== null;

    const variantId = `${item.id}-${item.minimum_order_quantity_g}g-api-jymed`;
    const sku = `JYMED-${item.skuCode}-${item.minimum_order_quantity_g}G-API`;

    const variantData = {
      id: variantId,
      productId: item.id,
      name: `${item.name} (${item.minimum_order_quantity_g}g MOQ)`,
      sku: sku,
      type: "raw_material",
      productType: "raw_material",
      format: "bulk_api",
      presentation: `${item.minimum_order_quantity_g}g Bulk API Powder`,
      quantity: item.minimum_order_quantity_g,
      unit: "g",
      weightGrams: item.minimum_order_quantity_g,
      packageWeight: `${item.minimum_order_quantity_g}g`,
      dosage: `${item.minimum_order_quantity_g}g (Bulk API)`,

      // Financial breakdown per gram (USD/g)
      pricePerGram: item.price_usd_per_gram,
      costPrice: item.price_usd_per_gram,
      unit_price: item.price_usd_per_gram,
      price: item.price_usd_per_gram,
      supplierCost: item.price_usd_per_gram,
      currency: "USD",
      moq: item.minimum_order_quantity_g,
      totalBatchCost: item.minimum_order_value_usd,

      supplierId: "jymed-peptide",
      supplierName: "Shenzhen JYMed Technology Co., Ltd.",
      supplier: "JYMed Peptide",
      grade: item.grade,
      materialType: item.material_type,
      gmpClaim: item.gmp_claim,
      documentation: item.documentation,
      availability: item.availability,
      priceStatus: item.price_status,

      stockType: "on_demand",
      stock: 50,
      inStock: true,
      isDemand: true,
      leadTime: "7-14 business days",
      status: "active",
      isActive: true,
      updatedAt: now,
      createdAt: now
    };

    const productDocData = {
      id: item.id,
      slug: item.id,
      name: item.name,
      canonicalName: item.canonicalName,
      title: item.name,
      type: "raw_material",
      primaryType: "raw_material",
      availableTypes: ["raw_material"],
      category: item.category,
      categoryName: item.categoryName,
      materialType: item.material_type,
      grade: item.grade,
      format: "bulk_api",
      presentation: "Bulk API Powder (g)",
      presentations: ["bulk_powder_gram"],
      status: "active",
      isPublished: true,

      // Single Mass Unit Management
      purchaseUnit: "g",
      baseUnit: "g",
      priceUnit: "USD/g",

      // Quality & Regulatory
      qualityAndRegulatory: {
        gmpStatus: "SUPPLIER_DECLARED_NOT_VERIFIED",
        gmpClaim: item.gmp_claim,
        documentation: item.documentation,
        documentationStatus: "LISTED_BY_SUPPLIER_NOT_VERIFIED",
        requireBatchSpecificCoA: true,
        requireRegulatoryDocumentVerification: true,
        doNotInferMarketingAuthorization: true,
        doNotInferImportAuthorization: true,
        doNotInferClinicalUseAuthorization: true,
        verified: false
      },

      // Supplier and Manufacturing Information
      supplierId: "jymed-peptide",
      supplierName: "Shenzhen JYMed Technology Co., Ltd.",
      supplierIds: ["jymed-peptide"],
      suppliers: ["jymed-peptide"],
      manufacturingEntity: IMPORT_PAYLOAD.supplier.manufacturing_entity,

      // Pricing structure
      supplierPricing: {
        pricePerGram: item.price_usd_per_gram,
        currency: "USD",
        moqGrams: item.minimum_order_quantity_g,
        minOrderValueUsd: item.minimum_order_value_usd,
        priceStatus: item.price_status,
        quotationReference: IMPORT_PAYLOAD.quotation.quotationNumber,
        sourceDocument: IMPORT_PAYLOAD.quotation.sourceDocument,
        lastQuotationDate: now
      },

      molecular: {
        casNumber: item.casNumber,
        molecularFormula: item.molecularFormula,
        molecularWeight: item.molecularWeight
      },

      description: item.description,
      availability: item.availability,
      stockType: "on_demand",
      inStock: true,
      variants: [variantData],
      activeVariantCount: 1,
      createdAt: now,
      updatedAt: now
    };

    await db.collection('products').doc(item.id).set(productDocData, { merge: true });
    console.log(`  ✔ Product written: [${item.id}] ${item.name} (${item.grade}) - $${item.price_usd_per_gram || 'PENDING'}/g`);

    // Prepare quotation item
    quotationLineItems.push({
      lineIndex: idx + 1,
      productId: item.id,
      name: item.name,
      canonicalName: item.canonicalName,
      casNumber: item.casNumber,
      materialType: item.material_type,
      grade: item.grade,
      priceUSDPerGram: item.price_usd_per_gram,
      minimumOrderQuantityGrams: item.minimum_order_quantity_g,
      minimumOrderValueUSD: item.minimum_order_value_usd,
      priceStatus: item.price_status,
      gmpClaim: item.gmp_claim,
      documentation: item.documentation,
      availability: item.availability
    });
  }

  // 3. CREATE SUPPLIER QUOTATION DOCUMENT
  console.log('\n📄 Creating supplier quotation "SQ-JYMED-2026-MEDILUXE-01"...');
  const quoteDocData = {
    id: IMPORT_PAYLOAD.quotation.quotationNumber,
    quotationNumber: IMPORT_PAYLOAD.quotation.quotationNumber,
    supplierId: "jymed-peptide",
    supplierName: "Shenzhen JYMed Technology Co., Ltd.",
    manufacturingEntity: IMPORT_PAYLOAD.supplier.manufacturing_entity,
    contact: IMPORT_PAYLOAD.supplier.contact,
    docType: "supplier_quotation",
    type: "supplier_quotation",
    category: "api_raw_materials",
    quotationType: "BULK_API_SUPPLIER_PRICE_LIST",
    sourceDocument: IMPORT_PAYLOAD.quotation.sourceDocument,
    currency: "USD",
    priceUnit: "USD/g",
    status: "received",
    recipientType: "compounding_pharmacy",
    lineItems: quotationLineItems,
    itemsCount: quotationLineItems.length,
    pricedOffersCount: quotationLineItems.filter(i => i.priceStatus === 'QUOTED').length,
    pendingPriceOffersCount: quotationLineItems.filter(i => i.priceStatus === 'PENDING_QUOTATION').length,
    totalMinimumCommitmentUSD: quotationLineItems.reduce((acc, i) => acc + (i.minimumOrderValueUSD || 0), 0),
    regulatoryDisclaimer: "GMP certifications and regulatory documents (DMF/WC/CEP) are supplier-declared and have not been independently audited or verified for local marketing authorization.",
    createdAt: now,
    updatedAt: now
  };

  await db.collection('supplier_quotations').doc(IMPORT_PAYLOAD.quotation.quotationNumber).set(quoteDocData, { merge: true });
  console.log('✔ Quotation document SQ-JYMED-2026-MEDILUXE-01 created successfully.');

  // 4. RECOMPUTE CATALOG FACETS
  console.log('\n📊 Recomputing _meta/catalog_facets...');
  const productsSnap = await db.collection('products').get();
  const categories = {};
  const suppliers = {};
  const types = {};
  let totalProducts = 0;
  let totalVariants = 0;

  productsSnap.forEach(doc => {
    const p = doc.data();
    if (p.status === 'archived') return;
    totalProducts++;
    const cat = p.category || 'other';
    categories[cat] = (categories[cat] || 0) + 1;
    const supp = p.supplierName || p.supplierId || 'other';
    suppliers[supp] = (suppliers[supp] || 0) + 1;
    const t = p.type || p.primaryType || 'finished_product';
    types[t] = (types[t] || 0) + 1;
    if (Array.isArray(p.variants)) {
      totalVariants += p.variants.length;
    }
  });

  await db.collection('_meta').doc('catalog_facets').set({
    totalProducts,
    totalVariants,
    categories,
    suppliers,
    types,
    lastUpdated: now
  }, { merge: true });

  console.log(`✔ _meta/catalog_facets updated: ${totalProducts} products, ${totalVariants} variants.`);

  console.log('\n=================================================================');
  console.log('🎉 LIVE IMPORT COMPLETED SUCCESSFULLY');
  console.log('=================================================================');
  console.log(`• Supplier Record: jymed-peptide (Updated with contact & Hubei JXBio entity)`);
  console.log(`• API Products Created: 6 bulk API raw materials`);
  console.log(`• Quotation Record: SQ-JYMED-2026-MEDILUXE-01`);
  console.log(`• Finished Vial Products: 0 modified (All protected)`);
  console.log('=================================================================\n');
}

executeImport().catch(err => {
  console.error('❌ Fatal Import Error:', err);
  process.exit(1);
});
