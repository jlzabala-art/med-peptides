/**
 * testingProductSchema.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical Schema for Testing Products (DNA, Blood, Microbiome, etc.)
 * Integrates with existing product data models while adding specialized fields.
 */

export const TESTING_CATEGORY = Object.freeze({
  DNA: 'DNA',
  BLOOD: 'Blood',
  MICROBIOME: 'Microbiome',
  GENERAL_DIAGNOSTIC: 'General_Diagnostic',
});

export const SAMPLE_KIT_TYPE = Object.freeze({
  SALIVA_TUBE: 'Saliva_Tube',
  BUCCAL_SWAB: 'Buccal_Swab',
  DRIED_BLOOD_SPOT: 'Dried_Blood_Spot',
  VENIPUNCTURE: 'Venipuncture',
  NONE: 'None',
});

export const COLLECTION_METHOD = Object.freeze({
  AT_HOME: 'At_Home',
  CLINIC: 'Clinic',
  PHLEBOTOMIST: 'Phlebotomist',
});

export const SHIPPING_METHOD = Object.freeze({
  PREPAID_MAILER: 'Prepaid_Mailer',
  STANDARD: 'Standard',
  COLD_CHAIN: 'Cold_Chain',
});

/**
 * Return a blank testing product skeleton.
 */
export function emptyTestingProduct(overrides = {}) {
  const now = new Date().toISOString();
  return {
    id: '',
    brandId: '', // e.g., 'fagron', '24genetics', 'bloodo', 'eternarx', 'ultrahuman'
    name: '',
    description: '',
    category: TESTING_CATEGORY.DNA,
    price: 0,
    currency: 'USD',
    
    // Core Capabilities
    capabilities: {
      analyzesBiomarkers: [],
      providesHealthInsights: false,
      providesAncestry: false,
      providesPharmacogenomics: false,
      providesNutrition: false,
    },

    // Physical Sample Requirements
    sampleKit: {
      type: SAMPLE_KIT_TYPE.NONE,
      requiresFasting: false,
      collectionMethod: COLLECTION_METHOD.AT_HOME,
      shippingMethod: SHIPPING_METHOD.PREPAID_MAILER,
    },

    // Additional/Premium Capabilities
    additionalCapabilities: {
      requiresPrescription: false,
      physicianConsultationIncluded: false,
      b2bPortalAccess: false,
      aiInterpretationService: false,
      allowsRawDataUpload: false,
      digitalDashboard: false,
      wearableIntegration: false,
    },
    
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Validate a testing product object.
 */
export function validateTestingProduct(p) {
  if (!p || typeof p !== 'object') {
    return { ok: false, errors: ['product is null or not an object'] };
  }

  const errors = [];
  const requiredRoots = ['id', 'brandId', 'name', 'category', 'price', 'currency'];
  
  for (const field of requiredRoots) {
    if (p[field] === undefined || p[field] === null || p[field] === '') {
      errors.push(`Missing root field: "${field}"`);
    }
  }

  if (p.category && !Object.values(TESTING_CATEGORY).includes(p.category)) {
    errors.push(`Invalid category: "${p.category}"`);
  }

  if (p.sampleKit && p.sampleKit.type && !Object.values(SAMPLE_KIT_TYPE).includes(p.sampleKit.type)) {
    errors.push(`Invalid sampleKit.type: "${p.sampleKit.type}"`);
  }

  const valid = errors.length === 0;
  return { valid, ok: valid, errors };
}
