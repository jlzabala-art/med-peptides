/**
 * calculateProductCompleteness — calculates data quality & completeness (0-100%).
 *
 * ⚠️  TYPE-AWARE: scoring schema depends on product category / productType.
 *      Peptides & Raw APIs need purity, molecular data, reconstitution.
 *      Supplements need dosage, format, labeling.
 *      Equipment / devices need model number, certifications.
 *      Tests need sample type and turnaround time.
 *      Services have a minimal set of commercial fields.
 */

// ─── Field Schema Definitions ─────────────────────────────────────────────────
// Each schema is an array of { key, label, weight, category, check(product) }
// Total weight per schema should sum to 100.

const PEPTIDE_SCHEMA = [
  // Scientific / Molecular (30pts)
  { key: 'molecularWeight', label: 'Molecular Weight',        weight: 7.5, category: 'Scientific',
    check: p => !!(p.scientificData?.molecularWeight || p.molecular?.molecularWeight || p.molecularWeight) },
  { key: 'casNumber',       label: 'CAS Registry Number',     weight: 7.5, category: 'Scientific',
    check: p => !!(p.scientificData?.casNumber || p.molecular?.casNumber || p.casNumber) },
  { key: 'pubchemCid',      label: 'PubChem CID',             weight: 7.5, category: 'Scientific',
    check: p => !!(p.scientificData?.pubchemCid || p.molecular?.pubchemCid || p.pubchemCid) },
  { key: 'mechanismOfAction', label: 'Mechanism of Action',   weight: 7.5, category: 'Scientific',
    check: p => !!(p.scientificData?.mechanismOfAction || p.mechanismOfAction || p.description) },

  // Variants & Pricing (25pts)
  { key: 'variants', label: 'Active Variants / SKUs',         weight: 10,  category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 || p.variantCount > 0 },
  { key: 'price',    label: 'Unit Pricing',                   weight: 7.5, category: 'Commercial',
    check: p => (p.variants?.some(v => v.price > 0 || v.unit_price > 0 || v.trade_price > 0))
             || p.min_unit_price > 0 || p.max_unit_price > 0 || p.canonical_price_usd > 0 || p.price > 0 },
  { key: 'dosage',   label: 'Dosage / Strength Format',       weight: 7.5, category: 'Commercial',
    check: p => (p.variants?.some(v => v.dosage || v.strength))
             || (Array.isArray(p.components) && p.components.length > 0)
             || p.total_active_mg > 0 || Boolean(p.dosage) },

  // Supply Chain / API Specs (20pts)
  { key: 'supplier', label: 'Supplier Linked',                weight: 10,  category: 'Supply Chain',
    check: p => (p.suppliers?.length > 0) || !!(p.supplierId) },
  { key: 'purity',   label: 'Purity Level (e.g. ≥99%)',       weight: 5,   category: 'Supply Chain',
    check: p => !!(p.purity || p.apiSpecs?.purityPercentage || p.variants?.some(v => v.purity)) },
  { key: 'coa',      label: 'Certificate of Analysis (CoA)',  weight: 5,   category: 'Supply Chain',
    check: p => !!(p.hasCOA || p.coaUrl || p.variants?.some(v => v.hasCOA)) },

  // Categorization (15pts)
  { key: 'category',    label: 'Product Category',           weight: 7.5, category: 'Metadata',
    check: p => !!p.category },
  { key: 'primaryGoal', label: 'Therapeutic Goal Linked',    weight: 7.5, category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.clinicalGoals?.length > 0 || p.goals?.length > 0) },

  // Description & Reconstitution (10pts)
  { key: 'aiDescription',  label: 'AI Clinical Overview',          weight: 5, category: 'Clinical',
    check: p => !!(p.aiDescription || p.summary || p.description) },
  { key: 'reconstitution', label: 'Reconstitution & Storage Guide', weight: 5, category: 'Clinical',
    check: p => !!(p.reconstitutionGuide || p.reconstitution || p.scientificData?.reconstitution || p.apiSpecs?.reconstitutionGuide) },
];

const SUPPLEMENT_SCHEMA = [
  // Product identity (20pts)
  { key: 'description', label: 'Product Description',          weight: 10,  category: 'Clinical',
    check: p => !!(p.aiDescription || p.description || p.summary) },
  { key: 'ingredients', label: 'Ingredient / Formula List',    weight: 10,  category: 'Scientific',
    check: p => !!(p.ingredients || p.components?.length > 0 || p.scientificData?.formula) },

  // Dosage & Format (25pts)
  { key: 'dosage',   label: 'Serving Size / Dosage',          weight: 15,  category: 'Commercial',
    check: p => !!(p.dosage || p.servingSize || p.variants?.some(v => v.dosage || v.strength)) },
  { key: 'form',     label: 'Product Form (capsule, powder…)', weight: 10,  category: 'Commercial',
    check: p => !!(p.form || p.presentation || p.subcategory) },

  // Pricing & SKUs (20pts)
  { key: 'variants', label: 'Active Variants / SKUs',          weight: 10,  category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 },
  { key: 'price',    label: 'Unit Pricing',                    weight: 10,  category: 'Commercial',
    check: p => p.min_unit_price > 0 || p.max_unit_price > 0 || p.price > 0
             || p.variants?.some(v => v.price > 0 || v.unit_price > 0) },

  // Supply Chain (15pts)
  { key: 'supplier', label: 'Supplier Linked',                 weight: 10,  category: 'Supply Chain',
    check: p => (p.suppliers?.length > 0) || !!(p.supplierId) },
  { key: 'coa',      label: 'Third-party Testing / CoA',       weight: 5,   category: 'Supply Chain',
    check: p => !!(p.hasCOA || p.coaUrl) },

  // Metadata (10pts)
  { key: 'category',    label: 'Product Category',             weight: 5,   category: 'Metadata',
    check: p => !!p.category },
  { key: 'primaryGoal', label: 'Health Goal Linked',           weight: 5,   category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.goals?.length > 0) },

  // Regulatory (10pts)
  { key: 'regulatoryLabel', label: 'Regulatory / Label Compliance',  weight: 5,  category: 'Regulatory',
    check: p => !!(p.regulatoryLabel || p.ndc || p.gtin || p.barcode) },
  { key: 'allergens',       label: 'Allergen / Contraindication Info', weight: 5, category: 'Regulatory',
    check: p => !!(p.allergens || p.contraindications || p.warnings) },
];

const EQUIPMENT_SCHEMA = [
  // Identity (20pts)
  { key: 'description', label: 'Product Description',         weight: 10,  category: 'Clinical',
    check: p => !!(p.aiDescription || p.description || p.summary) },
  { key: 'modelNumber', label: 'Model / Reference Number',    weight: 10,  category: 'Scientific',
    check: p => !!(p.modelNumber || p.model || p.sku || p.barcode) },

  // Specs (20pts)
  { key: 'dimensions',   label: 'Dimensions / Weight',        weight: 10,  category: 'Scientific',
    check: p => !!(p.dimensions || p.weight || p.specs?.dimensions) },
  { key: 'certifications', label: 'Certifications (CE, ISO)', weight: 10,  category: 'Regulatory',
    check: p => !!(p.certifications?.length > 0 || p.ce || p.iso || p.fda) },

  // Commercial (30pts)
  { key: 'variants', label: 'Active Variants / SKUs',         weight: 10,  category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 },
  { key: 'price',    label: 'Unit Pricing',                   weight: 10,  category: 'Commercial',
    check: p => p.min_unit_price > 0 || p.max_unit_price > 0 || p.price > 0
             || p.variants?.some(v => v.price > 0) },
  { key: 'supplier', label: 'Supplier Linked',                weight: 10,  category: 'Supply Chain',
    check: p => (p.suppliers?.length > 0) || !!(p.supplierId) },

  // Metadata (15pts)
  { key: 'category',    label: 'Product Category',            weight: 7.5, category: 'Metadata',
    check: p => !!p.category },
  { key: 'primaryGoal', label: 'Clinical Use Case',           weight: 7.5, category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.clinicalUse) },

  // Warranty / Maintenance (15pts)
  { key: 'warranty',     label: 'Warranty Information',       weight: 7.5, category: 'Clinical',
    check: p => !!(p.warranty || p.warrantyMonths || p.specs?.warranty) },
  { key: 'maintenanceGuide', label: 'Maintenance / Usage Guide', weight: 7.5, category: 'Clinical',
    check: p => !!(p.maintenanceGuide || p.usageGuide || p.manualUrl) },
];

const DIAGNOSTIC_TEST_SCHEMA = [
  // Test identity (20pts)
  { key: 'description',  label: 'Test Description',            weight: 10,  category: 'Clinical',
    check: p => !!(p.aiDescription || p.description || p.summary) },
  { key: 'testCode',     label: 'Test Code / CPT Code',        weight: 10,  category: 'Scientific',
    check: p => !!(p.testCode || p.cptCode || p.loinc || p.sku) },

  // Clinical specs (30pts)
  { key: 'sampleType',   label: 'Sample Type (Blood, Saliva…)',weight: 10,  category: 'Scientific',
    check: p => !!(p.sampleType || p.specimen || p.scientificData?.sampleType) },
  { key: 'turnaround',   label: 'Turnaround Time',             weight: 10,  category: 'Clinical',
    check: p => !!(p.turnaroundTime || p.tat || p.deliveryDays) },
  { key: 'methodology',  label: 'Test Methodology',            weight: 10,  category: 'Scientific',
    check: p => !!(p.methodology || p.method || p.scientificData?.methodology) },

  // Commercial (20pts)
  { key: 'price',        label: 'Test Pricing',                weight: 10,  category: 'Commercial',
    check: p => p.min_unit_price > 0 || p.max_unit_price > 0 || p.price > 0
             || p.variants?.some(v => v.price > 0) },
  { key: 'variants',     label: 'Test Packages / SKUs',        weight: 10,  category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 },

  // Metadata (15pts)
  { key: 'category',     label: 'Product Category',            weight: 7.5, category: 'Metadata',
    check: p => !!p.category },
  { key: 'primaryGoal',  label: 'Clinical Goal / Biomarker',   weight: 7.5, category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.biomarkers?.length > 0) },

  // Regulatory (15pts)
  { key: 'labAccreditation', label: 'Lab Accreditation (CLIA, CAP)',   weight: 7.5, category: 'Regulatory',
    check: p => !!(p.labAccreditation || p.clia || p.cap || p.regulatoryLabel) },
  { key: 'reportFormat',    label: 'Report Format / Interpretation',   weight: 7.5, category: 'Regulatory',
    check: p => !!(p.reportFormat || p.reportUrl || p.reportTemplate) },
];

const CORPORATE_SERVICE_SCHEMA = [
  // 1. Executive Scope & Identity (20pts)
  { key: 'description', label: 'Service Scope & Executive Overview', weight: 10, category: 'Scope',
    check: p => !!(p.aiDescription || p.description || p.summary || p.clinicalOverview) },
  { key: 'therapeutic_category', label: 'Service Domain & Classification', weight: 10, category: 'Scope',
    check: p => !!(p.therapeutic_category || p.targetSystem || p.category) },

  // 2. Active Service Tiers & Packages (20pts)
  { key: 'variants', label: 'Service Tiers & Plan Options', weight: 10, category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 },
  { key: 'pricing', label: 'B2B Wholesale / Tier Pricing', weight: 10, category: 'Commercial',
    check: p => (p.variants?.some(v => v.price > 0 || v.unit_price > 0 || v.cost_price > 0 || v.dose)) || p.pricingRules || p.price > 0 || p.canonical_price_usd > 0 },

  // 3. Operational Deliverables & Advantages (20pts)
  { key: 'deliverables', label: 'Key Deliverables & Scope Checklist', weight: 10, category: 'Operations',
    check: p => (Array.isArray(p.keyAdvantages) && p.keyAdvantages.length > 0) || (p.variants?.some(v => Array.isArray(v.deliverables) && v.deliverables.length > 0)) || !!p.features },
  { key: 'turnaroundTime', label: 'Execution SLA & Turnaround Time', weight: 10, category: 'Operations',
    check: p => !!(p.turnaroundTime || p.deliveryDays || p.tat || p.duration) },

  // 4. Compliance & Regulatory Framework (20pts)
  { key: 'regulatory', label: 'Regulatory Framework (EU GMP / Law 14/2013)', weight: 10, category: 'Compliance',
    check: p => !!(p.purity || p.regulatoryLabel || p.jurisdiction || p.casNumber) },
  { key: 'supplier', label: 'Executing Partner / Entity Sourced', weight: 10, category: 'Compliance',
    check: p => (p.suppliers?.length > 0) || !!p.supplierId || !!p.supplierName || !!p.supplier },

  // 5. Channels & Onboarding Guidance (20pts)
  { key: 'channels', label: 'Order Channels & Concierge Lead', weight: 10, category: 'Execution',
    check: p => (Array.isArray(p.orderChannels) && p.orderChannels.length > 0) || !!p.dedicatedAccountManager || !!p.orderChannel },
  { key: 'faqs', label: 'Client FAQs & Onboarding Guide', weight: 10, category: 'Execution',
    check: p => (Array.isArray(p.faqs) && p.faqs.length > 0) || (Array.isArray(p.keyAdvantages) && p.keyAdvantages.length > 0) || !!p.description },
];

const IV_INFUSION_SCHEMA = [
  // 1. Solution Vehicle & Carrier Volume (20pts)
  { key: 'carrierVolume', label: 'Carrier Solution & Bag Volume (250ml / 500ml 0.9% NaCl / Ringer)', weight: 10, category: 'Clinical',
    check: p => !!(p.carrierSolution || p.carrier || p.diluent || p.volume || p.presentation?.toLowerCase().includes('bag') || p.presentation?.toLowerCase().includes('iv') || p.format?.toLowerCase().includes('iv') || p.scientificData?.carrier) },
  { key: 'flowRate', label: 'Infusion Time & Flow Rate SLA (e.g. 45-60 min)', weight: 10, category: 'Clinical',
    check: p => !!(p.flowRate || p.infusionTime || p.duration || p.administrationProtocol || p.scientificData?.infusionRate) },

  // 2. Active Formula & Cocktails (25pts)
  { key: 'activeIngredients', label: 'Active Compound Cocktail & Concentrations', weight: 15, category: 'Scientific',
    check: p => (Array.isArray(p.ingredients) && p.ingredients.length > 0) || (Array.isArray(p.components) && p.components.length > 0) || !!p.scientificData?.formula || !!p.formula || !!p.aiDescription || !!p.description },
  { key: 'dosageSpecs', label: 'Infusion Protocol & Active Dosage (mg/ml)', weight: 10, category: 'Commercial',
    check: p => (p.variants?.some(v => v.dosage || v.strength || v.price > 0)) || !!p.dosage || p.total_active_mg > 0 },

  // 3. Clinical Safety, Pre-labs & Contraindications (25pts)
  { key: 'contraindications', label: 'Pre-infusion Vitals & Contraindications (G6PD / eGFR)', weight: 15, category: 'Regulatory',
    check: p => !!(p.contraindications || p.allergens || p.warnings || p.preLabRequirements || p.scientificData?.contraindications) },
  { key: 'administrationRoute', label: 'Clinical Administration Mode (In-Clinic / Nursing Only)', weight: 10, category: 'Regulatory',
    check: p => !!(p.administrationRoute || p.route || p.forRole || p.clinicalAdministration || p.medicalSupervision) },

  // 4. Commercial & Supply Chain (20pts)
  { key: 'pricing', label: 'Infusion Pricing & Package SKUs', weight: 10, category: 'Commercial',
    check: p => p.min_unit_price > 0 || p.max_unit_price > 0 || p.price > 0 || (p.variants?.some(v => v.price > 0 || v.unit_price > 0)) },
  { key: 'supplier', label: 'Compounding Pharmacy / Sterile Supply Linked', weight: 10, category: 'Supply Chain',
    check: p => (p.suppliers?.length > 0) || !!p.supplierId || !!p.supplierName || !!p.supplier },

  // 5. Metadata (10pts)
  { key: 'primaryGoal', label: 'Longevity / Therapeutic Goal Linked', weight: 5, category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.clinicalGoals?.length > 0 || p.goals?.length > 0) },
  { key: 'storageHandling', label: 'Sterility & Storage Protocol (Cold Chain / Light Sensitive)', weight: 5, category: 'Clinical',
    check: p => !!(p.storageConditions || p.storage || p.stability || p.specs?.storage) },
];

export function isIvProduct(product) {
  if (!product) return false;
  const cat = (product.categoryId || product.category || '').toLowerCase().trim();
  const type = (product.productType || product.type || '').toLowerCase().trim();
  const name = (product.name || product.canonicalName || '').toLowerCase();

  return (
    cat === 'iv_drip' ||
    cat === 'iv_therapy' ||
    cat === 'infusion' ||
    type === 'iv_drip' ||
    type === 'infusion' ||
    name.includes('iv drip') ||
    name.includes('iv infusion') ||
    name.includes('infusion therapy') ||
    name.includes('myers cocktail') ||
    name.includes('iv therapy') ||
    name.includes('drip')
  );
}

const SERVICE_SCHEMA = [
  // Core info (25pts)
  { key: 'description', label: 'Service Description',          weight: 15, category: 'Clinical',
    check: p => !!(p.aiDescription || p.description || p.summary) },
  { key: 'duration',    label: 'Duration / Access Period',     weight: 10, category: 'Commercial',
    check: p => !!(p.duration || p.accessPeriod || p.subscriptionPeriod || p.deliveryDays) },

  // Pricing (30pts)
  { key: 'price',       label: 'Service Pricing',              weight: 15, category: 'Commercial',
    check: p => p.min_unit_price > 0 || p.max_unit_price > 0 || p.price > 0
             || p.variants?.some(v => v.price > 0) },
  { key: 'variants',    label: 'Service Tiers / Packages',     weight: 15, category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 },

  // Scope & benefits (25pts)
  { key: 'features',    label: 'Included Features / Benefits', weight: 15, category: 'Clinical',
    check: p => !!(p.features?.length > 0 || p.benefits?.length > 0 || p.includes) },
  { key: 'primaryGoal', label: 'Health / Wellness Goal',       weight: 10, category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.goals?.length > 0) },

  // Metadata (20pts)
  { key: 'category',    label: 'Product Category',             weight: 10, category: 'Metadata',
    check: p => !!p.category },
  { key: 'targetAudience', label: 'Target Audience',           weight: 10, category: 'Metadata',
    check: p => !!(p.targetAudience || p.eligibility || p.forRole) },
];

// ── Skincare / Topicals (reuse supplement structure but replace allergens with ingredients) ──
const SKINCARE_SCHEMA = [
  { key: 'description', label: 'Product Description',          weight: 10, category: 'Clinical',
    check: p => !!(p.aiDescription || p.description || p.summary) },
  { key: 'ingredients', label: 'INCI / Ingredient List',       weight: 10, category: 'Scientific',
    check: p => !!(p.ingredients || p.components?.length > 0) },
  { key: 'dosage',      label: 'Serving / Concentration',      weight: 15, category: 'Commercial',
    check: p => !!(p.dosage || p.servingSize || p.variants?.some(v => v.dosage || v.strength)) },
  { key: 'form',        label: 'Presentation (serum, cream…)', weight: 10, category: 'Commercial',
    check: p => !!(p.form || p.presentation || p.subcategory) },
  { key: 'variants',    label: 'Active Variants / SKUs',       weight: 10, category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 },
  { key: 'price',       label: 'Unit Pricing',                 weight: 10, category: 'Commercial',
    check: p => p.min_unit_price > 0 || p.max_unit_price > 0 || p.price > 0 || p.variants?.some(v => v.price > 0 || v.unit_price > 0) },
  { key: 'supplier',    label: 'Supplier Linked',              weight: 10, category: 'Supply Chain',
    check: p => (p.suppliers?.length > 0) || !!(p.supplierId) },
  { key: 'coa',         label: 'Testing / CoA / Safety',       weight: 5,  category: 'Supply Chain',
    check: p => !!(p.hasCOA || p.coaUrl) },
  { key: 'category',    label: 'Product Category',             weight: 10, category: 'Metadata',
    check: p => !!p.category },
  { key: 'primaryGoal', label: 'Therapeutic Goal Linked',      weight: 10, category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.goals?.length > 0) },
];

const EXCIPIENT_VEHICLE_SCHEMA = [
  { key: 'description', label: 'Vehicle Description',          weight: 15, category: 'Clinical',
    check: p => !!(p.aiDescription || p.description || p.summary) },
  { key: 'ingredients', label: 'Matrix / Active Technology',   weight: 15, category: 'Scientific',
    check: p => !!(p.ingredients || p.technology || p.components?.length > 0 || p.scientificData?.formula || p.compoundingRules) },
  { key: 'variants',    label: 'Pack Sizes & Formats',         weight: 15, category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 || p.variantCount > 0 || !!p.format },
  { key: 'price',       label: 'Unit Pricing',                 weight: 15, category: 'Commercial',
    check: p => p.min_unit_price > 0 || p.max_unit_price > 0 || p.price > 0 || p.canonical_price_usd > 0 || p.variants?.some(v => v.price > 0 || v.unit_price > 0 || v.cost_price > 0 || v.trade_price > 0) },
  { key: 'supplier',    label: 'Supplier Linked',              weight: 15, category: 'Supply Chain',
    check: p => (p.suppliers?.length > 0) || !!(p.supplierId) || !!(p.supplierName) || !!(p.supplier) },
  { key: 'coa',         label: 'Compounding CoA / QC',         weight: 10, category: 'Supply Chain',
    check: p => !!(p.hasCOA || p.coaUrl || p.variants?.some(v => v.hasCOA)) },
  { key: 'category',    label: 'Product Category',             weight: 10, category: 'Metadata',
    check: p => !!(p.category || p.categoryId) },
  { key: 'storage',     label: 'Storage Protocol (Room Temp)', weight: 5,  category: 'Clinical',
    check: p => !!(p.storageConditions || p.storage || p.scientificData?.storage || p.stability || p.storage_conditions) },
];

const API_RAW_MATERIAL_SCHEMA = [
  // Chemical & Molecular Identity (25pts)
  { key: 'casNumber', label: 'CAS Registry Number', weight: 8, category: 'Scientific',
    check: p => !!(p.casNumber || p.scientificData?.casNumber || p.molecular?.casNumber || p.cas || p.cas_number) },
  { key: 'molecularSpecs', label: 'Molecular Specs (MW / Formula)', weight: 7, category: 'Scientific',
    check: p => !!(p.molecularWeight || p.molecularFormula || p.scientificData?.molecularWeight || p.scientificData?.molecularFormula || p.molecular?.molecularWeight || p.molecular?.molecularFormula || p.science?.molecularFormula) },
  { key: 'pubchemCid', label: 'PubChem CID / IUPAC', weight: 5, category: 'Scientific',
    check: p => !!(p.pubchemCid || p.scientificData?.pubchemCid || p.molecular?.pubchemCid || p.scientificData?.iupacName) },
  { key: 'mechanismOfAction', label: 'Mechanism of Action / Pharmacology', weight: 5, category: 'Scientific',
    check: p => !!(p.mechanismOfAction || p.scientificData?.mechanismOfAction || p.aiDescription || p.description || p.summary) },

  // Compounding & Master Formulation (25pts)
  { key: 'compoundingRules', label: 'Compounding Dosage & Range', weight: 10, category: 'Compounding',
    check: p => !!(p.compoundingRules?.recommendedConcentration || p.compoundingRules?.dosageRange || p.compoundingRules?.recommendedDose || p.compoundingRules?.minConcentration || p.dosage || p.dosageRange || p.typeData?.dosageRange || p.compoundingRules) },
  { key: 'vehicleCompatibility', label: 'Vehicle Compatibility & Solubility', weight: 8, category: 'Compounding',
    check: p => !!(p.compoundingRules?.compatibleVehicles?.length > 0 || p.compoundingRules?.vehicleRecommended || p.scientificData?.solubility || p.solubility || p.diluent) },
  { key: 'stabilityPh', label: 'Optimal pH Stability & Storage', weight: 7, category: 'Compounding',
    check: p => !!(p.compoundingRules?.optimalPh || p.compoundingRules?.incompatibilities || p.scientificData?.stability || p.storageConditions || p.storage || p.scientificData?.storage) },

  // Sourcing, Bulk Formats & Pricing (25pts)
  { key: 'supplier', label: 'Supplier Linked (e.g. Fagron Iberia)', weight: 10, category: 'Supply Chain',
    check: p => (p.suppliers?.length > 0) || !!(p.supplierId) || !!(p.supplierName) },
  { key: 'variants', label: 'Bulk Pack Sizes / Formats', weight: 8, category: 'Commercial',
    check: p => (p.variants?.length > 0) || p.variantsCount > 0 || p.variantCount > 0 || !!p.format },
  { key: 'pricing', label: 'Bulk Unit Pricing', weight: 7, category: 'Commercial',
    check: p => (p.variants?.some(v => v.price > 0 || v.unit_price > 0 || v.cost_price > 0 || v.trade_price > 0)) || p.price > 0 || p.min_unit_price > 0 || p.canonical_price_usd > 0 },

  // Storage & Quality Standards (25pts)
  { key: 'storageConditions', label: 'Storage & Handling Protocol', weight: 10, category: 'Clinical',
    check: p => !!(p.storageConditions || p.storage || p.scientificData?.storage || p.apiSpecs?.storageConditionLyophilized || p.stability || p.scientificData?.stability) },
  { key: 'primaryGoal', label: 'Clinical / Health Target', weight: 5, category: 'Metadata',
    check: p => !!(p.primaryGoal || p.goal || p.clinicalGoals?.length > 0 || p.goals?.length > 0) },
  { key: 'purity', label: 'HPLC Purity / Grade (USP/EP)', weight: 5, category: 'Supply Chain',
    check: p => !!(p.purity || p.grade || p.scientificData?.grade || p.apiSpecs?.purityPercentage || p.variants?.some(v => v.purity || v.grade)) },
  { key: 'coa', label: 'Certificate of Analysis (CoA)', weight: 5, category: 'Supply Chain',
    check: p => !!(p.hasCOA || p.coaUrl || p.variants?.some(v => v.hasCOA)) },
];

export function isVehicleProduct(product) {
  if (!product) return false;
  const cat = (product.categoryId || product.category || '').toLowerCase().trim();
  const name = (product.name || product.canonicalName || '').toLowerCase();
  return (
    cat === 'excipient_vehicle' ||
    cat === 'excipient' ||
    cat.includes('vehicle') ||
    cat.includes('excipient') ||
    cat.includes('base') ||
    cat.includes('tricholog') ||
    name.includes('trichosol') ||
    name.includes('trichoserum') ||
    name.includes('pentravan') ||
    name.includes('nourivan') ||
    name.includes('syrspend') ||
    name.includes('versabase')
  );
}

export function isApiProduct(product) {
  if (!product) return false;
  if (isVehicleProduct(product)) return false;
  const cat = (product.categoryId || product.category || '').toLowerCase().trim();
  const type = (product.productType || product.type || product.product_type || '').toLowerCase().trim();
  const name = (product.name || product.canonicalName || '').toLowerCase();
  
  // Finished products never map to raw API schema unless explicitly raw material
  if (type === 'finished_product') return false;

  // Specific high-level categories take absolute precedence over format type
  if (cat === 'supplement' || cat === 'nutricosmetics' || cat === 'nutraceutical') return false;
  if (cat === 'diagnostic_test' || cat === 'genetic_test' || cat === 'biomarker_test' || cat === 'genomics_biomarkers' || cat === 'genomics') return false;
  if (cat === 'service' || cat === 'subscription') return false;
  if (cat === 'clinical_supplies' || cat === 'medical_device_consumable' || cat === 'equipment' || cat === 'capsules_and_consumables') return false;
  if (cat === 'skincare') return false;

  if (cat === 'peptide' || cat === 'peptides' || cat === 'hormone' || cat === 'hormone optimization') {
    return false;
  }
  
  // Explicit raw material / bulk API indicators
  if (cat === 'raw_material' || cat === 'api_raw_material' || cat === 'active_ingredient' || cat === 'api') return true;
  if (type === 'raw_material' || type === 'api_raw_material' || product.is_raw_material === true || product.isApi === true) return true;
  if (product.compoundingRules && !isVehicleProduct(product)) return true;
  if (Array.isArray(product.availableTypes) && product.availableTypes.includes('raw_material') && !product.availableTypes.includes('finished_product')) return true;
  if (Array.isArray(product.variants) && product.variants.some(v => v.type === 'raw_material' || v.format?.toLowerCase() === 'bulk_powder' || v.format?.toLowerCase() === 'raw_api')) return true;
  
  return false;
}

// hormone — same as peptide but replace reconstitution label
const HORMONE_SCHEMA = PEPTIDE_SCHEMA.map(f =>
  f.key === 'reconstitution'
    ? { ...f, label: 'Administration & Storage Guide' }
    : f
);

// ─── Schema Resolver ──────────────────────────────────────────────────────────
/**
 * Resolves the scoring schema based on category or productType.
 * Priority: Authoritative Category (categoryId / category) → isVehicleProduct → isApiProduct → fallbacks
 */
function resolveSchema(product) {
  // categoryId is authoritative (Phase 1); category kept as fallback
  const cat = (product?.categoryId || product?.category || '').toLowerCase().trim();
  const type = (product?.productType || product?.type || '').toLowerCase().trim();
  const name = (product?.name || product?.canonicalName || '').toLowerCase();

  // 0. Corporate & Institutional Services (B2B, Supply Chain, Licensing, Compounding Partner)
  if (
    cat === 'corporate_services' ||
    product?.isCorporateService ||
    product?.serviceSubtype === 'corporate_service' ||
    name.includes('b2b peptide supply chain') ||
    name.includes('compounding & custom formulation') ||
    name.includes('spanish company acquisition')
  ) {
    return CORPORATE_SERVICE_SCHEMA;
  }

  // 1. IV Drips & Intravenous Infusion Therapies (Must precede single-molecule Peptides)
  if (isIvProduct(product)) {
    return IV_INFUSION_SCHEMA;
  }

  // 2. Vehicles / Excipients / Compounding Bases
  if (cat === 'excipient_vehicle' || cat === 'excipient' || isVehicleProduct(product)) {
    return EXCIPIENT_VEHICLE_SCHEMA;
  }

  // 3. Diagnostic & Genetic Tests (Blood, Saliva, DNA, Epigenetics)
  if (
    cat === 'diagnostic_test' ||
    cat === 'genetic_test' ||
    cat === 'biomarker_test' ||
    cat === 'genomics_biomarkers' ||
    cat === 'genomics' ||
    cat === 'diagnostic' ||
    cat === 'lab_test' ||
    type === 'test' ||
    type === 'genomics_biomarkers' ||
    type === 'dna_testing_kit' ||
    type === 'biomarker_testing_kit' ||
    name.includes('dna test') ||
    name.includes('trichotest') ||
    name.includes('nutrigen')
  ) {
    return DIAGNOSTIC_TEST_SCHEMA;
  }

  // 4. Dietary Supplements & Nutraceuticals (Explicit category takes precedence over raw_material type)
  if (
    cat === 'supplement' ||
    cat === 'nutricosmetics' ||
    cat === 'weight_loss' ||
    cat === 'nutraceutical'
  ) {
    return SUPPLEMENT_SCHEMA;
  }

  // 5. Raw Active Pharmaceutical Ingredients (APIs) & Compounding Chemicals
  if (
    cat === 'raw_material' || 
    cat === 'api_raw_material' || 
    cat === 'api' ||
    isApiProduct(product)
  ) {
    return API_RAW_MATERIAL_SCHEMA;
  }

  // 6. Peptides & Hormones
  if (cat === 'hormone') return HORMONE_SCHEMA;
  if (['peptide', 'peptides', 'hormone optimization'].includes(cat)) return PEPTIDE_SCHEMA;
  if (cat.startsWith('cardiovascular') || cat.startsWith('metabolic')) return PEPTIDE_SCHEMA;

  // 7. Medical Equipment / Consumables / Clinical Supplies
  if (['clinical_supplies', 'medical_device_consumable', 'equipment', 'consumables', 'capsules_and_consumables'].includes(cat)) {
    return EQUIPMENT_SCHEMA;
  }

  // 8. Services & Subscriptions
  if (cat === 'service' || cat === 'subscription' || cat === 'logistics_service' || type === 'subscription') {
    return SERVICE_SCHEMA;
  }

  // 9. Skincare & Cosmeceuticals
  if (cat === 'skincare' || cat === 'skin_anti_aging') {
    return SKINCARE_SCHEMA;
  }

  // Type-based fallbacks
  if (/api|raw material|bulk|materia prima/i.test(name)) return API_RAW_MATERIAL_SCHEMA;

  // Infer from name as last resort
  if (/peptide|bpc|tb-500|semaglutide|melanotan|sermorelin|ipamorelin|cjc|ghrh|ghrp|hexarelin|epithalon|selank|semax|kisspeptin|mots-c|humanin|gonadorelin|naltrexone|ldn|fenbendazole|rapamycin|metformin|spironolactone|tadalafil|nadolol/i.test(name)) {
    return PEPTIDE_SCHEMA;
  }

  // Default fallback = supplement (most lenient)
  return SUPPLEMENT_SCHEMA;
}

// ─── Public API ───────────────────────────────────────────────────────────────
export function calculateProductCompleteness(product) {
  if (!product) {
    return { score: 0, color: '#be123c', bgColor: '#fff1f2', borderColor: '#fecdd3', statusLabel: 'Needs Data', missingFields: [], schemaType: 'unknown' };
  }

  const schema = resolveSchema(product);
  const missing = [];
  let score = 0;

  for (const field of schema) {
    if (field.check(product)) {
      score += field.weight;
    } else {
      missing.push({ key: field.key, label: field.label, weight: field.weight, category: field.category });
    }
  }

  const finalScore = Math.min(100, Math.round(score));

  // 4-Tier Semantic Clinical Scale
  let color = '#16a34a';
  let bgColor = '#f0fdf4';
  let borderColor = '#bbf7d0';
  let statusLabel = 'Optimal';

  if (finalScore < 50) {
    color = '#dc2626'; bgColor = '#fef2f2'; borderColor = '#fecaca'; statusLabel = 'Needs Data';
  } else if (finalScore < 75) {
    color = '#ea580c'; bgColor = '#fff7ed'; borderColor = '#fed7aa'; statusLabel = 'Moderate';
  } else if (finalScore < 100) {
    color = '#2563eb'; bgColor = '#eff6ff'; borderColor = '#bfdbfe'; statusLabel = 'Good';
  }

  // Expose which schema was used so the UI can label it
  const schemaType = resolveSchemaLabel(product);

  return { score: finalScore, color, bgColor, borderColor, statusLabel, missingFields: missing, schemaType };
}

function resolveSchemaLabel(product) {
  const cat = (product?.categoryId || product?.category || '').toLowerCase().trim();
  const type = (product?.productType || product?.type || '').toLowerCase().trim();
  const name = (product?.name || product?.canonicalName || '').toLowerCase();

  if (
    cat === 'corporate_services' ||
    product?.isCorporateService ||
    product?.serviceSubtype === 'corporate_service' ||
    name.includes('b2b peptide supply chain') ||
    name.includes('compounding & custom formulation') ||
    name.includes('spanish company acquisition')
  ) return 'Corporate & Institutional Service';

  if (isIvProduct(product)) return 'IV Infusion Therapy';

  if (cat === 'excipient_vehicle' || cat === 'excipient' || isVehicleProduct(product)) return 'Galenic Vehicle / Excipient';
  if (
    cat === 'diagnostic_test' ||
    cat === 'genetic_test' ||
    cat === 'biomarker_test' ||
    cat === 'genomics_biomarkers' ||
    cat === 'genomics' ||
    cat === 'diagnostic' ||
    cat === 'lab_test' ||
    type === 'test' ||
    name.includes('dna test') ||
    name.includes('trichotest')
  ) return 'Diagnostic & Genetic Test';

  if (cat === 'supplement' || cat === 'nutricosmetics' || cat === 'weight_loss' || cat === 'nutraceutical') return 'Supplement / Nutraceutical';
  if (cat === 'raw_material' || cat === 'api_raw_material' || cat === 'api' || isApiProduct(product)) return 'Active API / Compounding';
  if (cat === 'hormone') return 'Hormone';
  if (['peptide', 'peptides', 'hormone optimization'].includes(cat)) return 'Peptide / API';
  if (cat.startsWith('cardiovascular') || cat.startsWith('metabolic')) return 'Pharma Compound';
  if (['clinical_supplies', 'medical_device_consumable', 'equipment', 'consumables', 'capsules_and_consumables'].includes(cat)) return 'Medical Device / Supply';
  if (cat === 'service' || cat === 'subscription' || type === 'subscription') return 'Service';
  if (cat === 'skincare' || cat === 'skin_anti_aging') return 'Skincare';
  if (/api|raw material|bulk|materia prima/i.test(name)) return 'Active API / Compounding';
  if (/peptide|bpc|tb-500|semaglutide|melanotan|sermorelin|ipamorelin|cjc|ghrh|ghrp|hexarelin|epithalon|selank|semax|kisspeptin|mots-c|humanin|gonadorelin|naltrexone|ldn|fenbendazole|rapamycin|metformin|spironolactone|tadalafil|nadolol/i.test(name)) return 'Peptide / API';
  return 'General';
}
