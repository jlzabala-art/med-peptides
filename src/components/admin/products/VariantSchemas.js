export const getCategorySchema = (product, variant) => {
  const format = (variant?.format || product?.format || '').toLowerCase();
  const type = (product?.type || product?.category || '').toLowerCase();
  
  if (format.includes('api') || format.includes('powder') || type.includes('api') || type.includes('raw')) {
    return API_PEPTIDES_SCHEMA;
  }
  if (format.includes('bottle') || format.includes('cap') || format.includes('tab') || type.includes('capsule') || type.includes('tablet')) {
    return CAPSULES_SCHEMA;
  }
  if (format.includes('dna') || format.includes('swab') || type.includes('dna') || type.includes('test')) {
    return DNA_KITS_SCHEMA;
  }
  if (format.includes('inject') || type.includes('injectable') || type.includes('liquid')) {
    return INJECTABLES_SCHEMA;
  }
  
  // Default to Lyophilized Peptides schema as it's the most common for 'vial'
  return LYOPHILIZED_SCHEMA;
};

// Common fields across all schemas
const COMMON_COMMERCIAL = [
  { name: 'cost', label: 'Cost Price ($)', type: 'number', required: false },
  { name: 'wholesalePrice', label: 'Wholesale Price ($)', type: 'number', required: false },
  { name: 'clinicPrice', label: 'Clinic Price ($)', type: 'number', required: false },
  { name: 'msrp', label: 'Selling Price (MSRP) ($)', type: 'number', required: false }
];

const COMMON_REGULATORY = [
  { name: 'regStatus', label: 'Registration Status', type: 'select', options: ['Unregistered', 'Registered', 'Pending', 'Restricted'], required: false },
  { name: 'coaAvailable', label: 'COA Available', type: 'boolean', required: false },
  { name: 'coaFileUrl', label: 'Certificate of Analysis (COA) Document', type: 'file_upload', accept: '.pdf,.png,.jpg,.jpeg', required: false }
];

const COMMON_INVENTORY = [
  { name: 'inventory', label: 'Total Stock', type: 'number', required: false },
  { name: 'warehouseStock', label: 'Warehouse Stock Distribution', type: 'warehouse_stock', required: false },
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
    { name: 'format', label: 'Physical Format', type: 'select', options: ['Vial', 'Bottle', 'Cartridge', 'Pre-filled Syringe'], required: true },
    { name: 'route', label: 'Route of Administration', type: 'select', options: ['Subcutaneous', 'Intramuscular', 'Intravenous', 'Oral', 'Nasal'], required: false },
    { name: 'formulationType', label: 'Formulation Type', type: 'select', options: ['Lyophilized Powder', 'Pre-mixed Liquid', 'Blend'], required: false },
    { name: 'storageConditions', label: 'Storage Conditions', type: 'text', required: false },
    { name: 'reconstitutionRequired', label: 'Reconstitution Required', type: 'boolean', required: false },
    { name: 'purity', label: 'Purity %', type: 'number', required: false },
    { name: 'shelfLife', label: 'Shelf Life (Months)', type: 'number', required: false },
  ],
  regulatory: [
    { name: 'batchNumber', label: 'Batch Number', type: 'text', required: false },
    ...COMMON_REGULATORY
  ],
  commercial: [
    ...COMMON_COMMERCIAL
  ],
  inventory: [
    ...COMMON_INVENTORY
  ]
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
    { name: 'format', label: 'Physical Format', type: 'text', defaultValue: 'Powder', required: false },
    { name: 'purity', label: 'Purity %', type: 'number', required: true },
    { name: 'storageConditions', label: 'Storage Conditions', type: 'text', required: false },
  ],
  regulatory: [
    { name: 'batchNumber', label: 'Batch Number', type: 'text', required: false },
    ...COMMON_REGULATORY
  ],
  commercial: [
    { name: 'costPerGram', label: 'Cost per Gram ($)', type: 'number', required: false },
    ...COMMON_COMMERCIAL
  ],
  inventory: [
    ...COMMON_INVENTORY
  ]
};

export const DNA_KITS_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'testName', label: 'Test Name', type: 'text', required: true },
    { name: 'laboratory', label: 'Laboratory', type: 'text', required: true },
    { name: 'sampleType', label: 'Sample Type', type: 'select', options: ['Saliva', 'Buccal Swab', 'Blood Spot', 'Other'], required: true },
  ],
  technical: [
    { name: 'collectionKitIncluded', label: 'Collection Kit Included', type: 'boolean', required: false },
    { name: 'reportType', label: 'Report Type', type: 'text', required: false },
    { name: 'turnaroundTime', label: 'Turnaround Time (Days)', type: 'number', required: false },
    { name: 'countriesAvailable', label: 'Countries Available', type: 'text', required: false },
  ],
  regulatory: [
    ...COMMON_REGULATORY
  ],
  commercial: [
    ...COMMON_COMMERCIAL
  ],
  inventory: [
    ...COMMON_INVENTORY
  ]
};

export const CAPSULES_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'formulaName', label: 'Formula Name', type: 'text', required: true },
    { name: 'strength', label: 'Strength', type: 'text', required: true },
    { name: 'unit', label: 'Unit', type: 'select', options: ['mg', 'mcg', 'g', 'iu'], required: false },
  ],
  technical: [
    { name: 'unitsPerBottle', label: 'Units (Capsules/Tablets) Per Bottle', type: 'number', required: true },
    { name: 'bottleSize', label: 'Bottle Size / Content', type: 'text', required: false },
    { name: 'shelfLife', label: 'Shelf Life (Months)', type: 'number', required: false },
  ],
  regulatory: [
    ...COMMON_REGULATORY
  ],
  commercial: [
    ...COMMON_COMMERCIAL
  ],
  inventory: [
    ...COMMON_INVENTORY
  ]
};

export const INJECTABLES_SCHEMA = {
  general: [
    { name: 'sku', label: 'SKU', type: 'text', required: true },
    { name: 'supplier', label: 'Supplier', type: 'supplierSelect', required: true },
    { name: 'productName', label: 'Product Name', type: 'text', required: true },
    { name: 'strength', label: 'Strength', type: 'text', required: true },
    { name: 'volume', label: 'Volume (ml)', type: 'number', required: true },
    { name: 'unit', label: 'Unit', type: 'select', options: ['mg/ml', 'mcg/ml', 'iu/ml'], required: false },
  ],
  technical: [
    { name: 'route', label: 'Route of Administration', type: 'select', options: ['Subcutaneous', 'Intramuscular', 'Intravenous'], required: false },
    { name: 'vialsPerBox', label: 'Vials Per Box', type: 'number', required: false },
    { name: 'storageConditions', label: 'Storage Conditions', type: 'text', required: false },
    { name: 'shelfLife', label: 'Shelf Life (Months)', type: 'number', required: false },
  ],
  regulatory: [
    ...COMMON_REGULATORY
  ],
  commercial: [
    ...COMMON_COMMERCIAL
  ],
  inventory: [
    ...COMMON_INVENTORY
  ]
};
