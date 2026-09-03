export const getCategorySchema = (product, variant) => {
  const format = (variant?.format || product?.format || '').toLowerCase();
  const variantType = (variant?.type || variant?.productType || '').toLowerCase();
  const productType = (product?.primaryType || product?.type || product?.productType || product?.category || '').toLowerCase();
  const availableTypes = Array.isArray(product?.availableTypes) ? product.availableTypes : [];

  if (
    variantType === 'raw_material' ||
    variantType.includes('api') ||
    format.includes('api') ||
    format.includes('powder') ||
    productType.includes('api') ||
    productType.includes('raw_material')
  ) {
    return API_PEPTIDES_SCHEMA;
  }
  if (
    format.includes('bottle') ||
    format.includes('cap') ||
    format.includes('tab') ||
    productType.includes('capsule') ||
    productType.includes('tablet')
  ) {
    return CAPSULES_SCHEMA;
  }
  if (
    variantType === 'diagnostic' ||
    format.includes('dna') ||
    format.includes('swab') ||
    productType.includes('dna') ||
    productType.includes('diagnostic') ||
    productType.includes('test') ||
    availableTypes.includes('diagnostic')
  ) {
    return DNA_KITS_SCHEMA;
  }
  if (format.includes('inject') || productType.includes('injectable') || productType.includes('liquid')) {
    return INJECTABLES_SCHEMA;
  }

  // Default to Lyophilized Peptides schema as it's the most common for 'vial'
  return LYOPHILIZED_SCHEMA;
};

// Common fields across all schemas
const COMMON_COMMERCIAL = [
  { name: 'cost', label: 'Cost Price ($)', type: 'number', required: false },
  { name: 'supplierCost10', label: 'Cost Price (10 Kits) ($)', type: 'number', required: false },
  { name: 'wholesalePrice', label: 'Wholesale Price ($)', type: 'number', required: false },
  { name: 'wholesale10', label: 'Wholesale Price (10 Kits) ($)', type: 'number', required: false },
  { name: 'clinicPrice', label: 'Clinic Price ($)', type: 'number', required: false },
  { name: 'clinic10', label: 'Clinic Price (10 Kits) ($)', type: 'number', required: false },
  { name: 'msrp', label: 'Selling Price (MSRP) ($)', type: 'number', required: false },
  { name: 'retail10', label: 'Selling Price (MSRP) (10 Kits) ($)', type: 'number', required: false },
  { name: 'competitorAvgPrice', label: 'Market Avg Price ($)', type: 'number', required: false },
  { name: 'competitorMinPrice', label: 'Market Min Price ($)', type: 'number', required: false },
  { name: 'marketPpm', label: 'Market Price/mg ($/mg)', type: 'number', required: false },
];

const COMMON_REGULATORY = [
  {
    name: 'regStatus',
    label: 'Registration Status',
    type: 'select',
    options: ['Unregistered', 'Registered', 'Pending', 'Restricted'],
    required: false,
  },
  { name: 'coaAvailable', label: 'COA Available', type: 'boolean', required: false },
  {
    name: 'coaFileUrl',
    label: 'Certificate of Analysis (COA) Document',
    type: 'file_upload',
    accept: '.pdf,.png,.jpg,.jpeg',
    required: false,
  },
];

const COMMON_INVENTORY = [
  {
    name: 'stockType',
    label: 'Supply & Stock Model',
    type: 'select',
    options: ['On Demand', 'In Stock', 'Pre-Order'],
    defaultValue: 'On Demand',
    required: false,
  },
  {
    name: 'leadTime',
    label: 'Synthesis / Lead Time',
    type: 'text',
    defaultValue: '3-7 business days',
    placeholder: 'e.g. 3-7 business days',
    required: false,
  },
  { name: 'inventory', label: 'Local Safety Stock (Optional)', type: 'number', required: false },
  {
    name: 'warehouseStock',
    label: 'Warehouse Stock Distribution',
    type: 'warehouse_stock',
    required: false,
  },
  { name: 'reorderPoint', label: 'Reorder Point', type: 'number', required: false },
];

export const LYOPHILIZED_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'peptideName', label: 'Peptide Name', type: 'text', required: false },
    { name: 'dosage', label: 'Dosage (e.g. 5mg, 10mg)', type: 'text', required: true },
    { name: 'vialsPerKit', label: 'Vials per Kit', type: 'number', required: false },
  ],
  technical: [
    {
      name: 'format',
      label: 'Physical Format',
      type: 'select',
      options: ['Vial', 'Bottle', 'Cartridge', 'Pre-filled Syringe'],
      required: true,
    },
    {
      name: 'route',
      label: 'Route of Administration',
      type: 'select',
      options: ['Subcutaneous', 'Intramuscular', 'Intravenous', 'Oral', 'Nasal'],
      required: false,
    },
    {
      name: 'formulationType',
      label: 'Formulation Type',
      type: 'select',
      options: ['Lyophilized Powder', 'Pre-mixed Liquid', 'Blend'],
      required: false,
    },
    { name: 'storageConditions', label: 'Storage Conditions', type: 'text', required: false },
    {
      name: 'reconstitutionRequired',
      label: 'Reconstitution Required',
      type: 'boolean',
      required: false,
    },
    { name: 'purity', label: 'Purity %', type: 'number', required: false },
    { name: 'shelfLife', label: 'Shelf Life (Months)', type: 'number', required: false },
  ],
  regulatory: [
    { name: 'batchNumber', label: 'Batch Number', type: 'text', required: false },
    ...COMMON_REGULATORY,
  ],
  commercial: [...COMMON_COMMERCIAL],
  inventory: [...COMMON_INVENTORY],
};

export const API_PEPTIDES_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'apiName', label: 'API Name', type: 'text', required: true },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', options: ['mg', 'g', 'kg'], required: true },
  ],
  technical: [
    {
      name: 'format',
      label: 'Physical Format',
      type: 'text',
      defaultValue: 'Powder',
      required: false,
    },
    { name: 'purity', label: 'Purity %', type: 'number', required: true },
    { name: 'storageConditions', label: 'Storage Conditions', type: 'text', required: false },
  ],
  regulatory: [
    { name: 'batchNumber', label: 'Batch Number', type: 'text', required: false },
    ...COMMON_REGULATORY,
  ],
  commercial: [
    { name: 'costPerGram', label: 'Cost per Gram ($)', type: 'number', required: false },
    ...COMMON_COMMERCIAL,
  ],
  inventory: [...COMMON_INVENTORY],
};

export const DNA_KITS_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'testName', label: 'Test Name', type: 'text', required: true },
    { name: 'laboratory', label: 'Laboratory', type: 'text', required: true },
    {
      name: 'sampleType',
      label: 'Sample Type',
      type: 'select',
      options: ['Saliva', 'Buccal Swab', 'Blood Spot', 'Blood (Whole)', 'Other'],
      required: true,
    },
    {
      name: 'targetAudience',
      label: 'Target Audience',
      type: 'select',
      options: ['All Adults', 'Athletes', 'Longevity Patients', 'Pediatric', 'General Public'],
      required: false,
    },
  ],
  technical: [
    {
      name: 'collectionKitIncluded',
      label: 'Collection Kit Included',
      type: 'boolean',
      required: false,
    },
    {
      name: 'rawDataUploadAllowed',
      label: 'Raw Data Upload Allowed (No Kit Required)',
      type: 'boolean',
      required: false,
    },
    {
      name: 'sequencingTechnology',
      label: 'Sequencing Technology',
      type: 'select',
      options: [
        'Illumina (700k SNPs)',
        'Next-Generation Sequencing (NGS)',
        'Whole Exome Sequencing (WES)',
        'Whole Genome Sequencing (WGS)',
        'Genotyping Microarray',
        'PCR Analysis',
      ],
      required: false,
    },
    {
      name: 'geneticMarkersCount',
      label: 'Number of Genetic Markers Analysed',
      type: 'text',
      placeholder: 'e.g. 700,000 SNPs',
      required: false,
    },
    {
      name: 'reportType',
      label: 'Report Types Included',
      type: 'text',
      placeholder: 'e.g. Ancestry, Health, Nutrigenetics, Sports, Skin Care, Talent',
      required: false,
    },
    { name: 'turnaroundTime', label: 'Turnaround Time (Days)', type: 'number', required: false },
    {
      name: 'reportLanguage',
      label: 'Available Report Languages',
      type: 'text',
      defaultValue: 'English, Spanish',
      required: false,
    },
  ],
  regulatory: [
    {
      name: 'labCertification',
      label: 'Laboratory Accreditation',
      type: 'select',
      options: [
        'CLIA Certified & CAP Accredited',
        'CLIA Certified Only',
        'ISO 15189',
        'None / Research Only',
      ],
      required: false,
    },
    {
      name: 'privacyCompliance',
      label: 'Data Privacy Compliance',
      type: 'select',
      options: [
        'GDPR & HIPAA Compliant',
        'GDPR Compliant',
        'HIPAA Compliant',
        'Standard Privacy Policy',
      ],
      required: false,
    },
    ...COMMON_REGULATORY,
  ],
  commercial: [...COMMON_COMMERCIAL],
  inventory: [...COMMON_INVENTORY],
};

export const CAPSULES_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'formulaName', label: 'Formula Name', type: 'text', required: true },
    { name: 'strength', label: 'Strength', type: 'text', required: true },
    {
      name: 'unit',
      label: 'Unit',
      type: 'select',
      options: ['mg', 'mcg', 'g', 'iu'],
      required: false,
    },
  ],
  technical: [
    {
      name: 'unitsPerBottle',
      label: 'Units (Capsules/Tablets) Per Bottle',
      type: 'number',
      required: true,
    },
    { name: 'bottleSize', label: 'Bottle Size / Content', type: 'text', required: false },
    { name: 'shelfLife', label: 'Shelf Life (Months)', type: 'number', required: false },
  ],
  regulatory: [...COMMON_REGULATORY],
  commercial: [...COMMON_COMMERCIAL],
  inventory: [...COMMON_INVENTORY],
};

export const INJECTABLES_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'productName', label: 'Product Name', type: 'text', required: true },
    { name: 'strength', label: 'Strength', type: 'text', required: true },
    { name: 'volume', label: 'Volume (ml)', type: 'number', required: true },
    {
      name: 'unit',
      label: 'Unit',
      type: 'select',
      options: ['mg/ml', 'mcg/ml', 'iu/ml'],
      required: false,
    },
  ],
  technical: [
    {
      name: 'route',
      label: 'Route of Administration',
      type: 'select',
      options: ['Subcutaneous', 'Intramuscular', 'Intravenous'],
      required: false,
    },
    { name: 'vialsPerBox', label: 'Vials Per Box', type: 'number', required: false },
    { name: 'storageConditions', label: 'Storage Conditions', type: 'text', required: false },
    { name: 'shelfLife', label: 'Shelf Life (Months)', type: 'number', required: false },
  ],
  regulatory: [...COMMON_REGULATORY],
  commercial: [...COMMON_COMMERCIAL],
  inventory: [...COMMON_INVENTORY],
};
