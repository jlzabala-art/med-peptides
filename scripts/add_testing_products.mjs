/**
 * Seeding script for diagnostic testing products.
 * Inserts testing products with canonical capabilities and variant sub-documents.
 */

import { db } from './lib/firebase-admin.mjs';

const tests = [
  // --- FAGRON GENOMICS ---
  {
    docId: 'fagron-nutrigen',
    brandId: 'fagron',
    name: 'Fagron NutriGen',
    displayName: 'Fagron NutriGen',
    productType: 'testing',
    category: 'Testing',
    desc: 'Nutrigenetic test providing insights into genetic predisposition related to nutrition, weight management, and metabolism.',
    objective: 'Nutrigenomics screening & metabolic profile optimization',
    route: 'testing',
    status: 'active',
    capabilities: {
      analyzesBiomarkers: ['SNPs related to metabolism'],
      providesHealthInsights: true,
      providesAncestry: false,
      providesPharmacogenomics: false,
      providesNutrition: true,
    },
    sampleKit: {
      type: 'Saliva_Tube',
      requiresFasting: false,
      collectionMethod: 'At_Home',
      shippingMethod: 'Prepaid_Mailer',
    },
    additionalCapabilities: {
      requiresPrescription: true,
      physicianConsultationIncluded: false,
      b2bPortalAccess: true,
      aiInterpretationService: false,
      allowsRawDataUpload: false,
      digitalDashboard: true,
      wearableIntegration: false,
    },
    pricing: { retail: { perUnit: 170, currency: 'EUR' }, clinic: { perUnit: 125, currency: 'EUR' } }
  },
  {
    docId: 'fagron-trichotest',
    brandId: 'fagron',
    name: 'Fagron TrichoTest™',
    displayName: 'Fagron TrichoTest™',
    productType: 'testing',
    category: 'Testing',
    desc: 'Pharmacogenetic test for hair loss, analyzing genetic variations and lifestyle factors.',
    objective: 'Alopecia genetic predisposition & personalized treatment',
    route: 'testing',
    status: 'active',
    capabilities: {
      analyzesBiomarkers: ['Alopecia related SNPs'],
      providesHealthInsights: true,
      providesAncestry: false,
      providesPharmacogenomics: true,
      providesNutrition: false,
    },
    sampleKit: {
      type: 'Saliva_Tube',
      requiresFasting: false,
      collectionMethod: 'At_Home',
      shippingMethod: 'Prepaid_Mailer',
    },
    additionalCapabilities: {
      requiresPrescription: true,
      physicianConsultationIncluded: false,
      b2bPortalAccess: true,
      aiInterpretationService: false,
      allowsRawDataUpload: false,
      digitalDashboard: true,
      wearableIntegration: false,
    },
    pricing: { retail: { perUnit: 180, currency: 'EUR' }, clinic: { perUnit: 130, currency: 'EUR' } }
  },
  
  // --- 24Genetics ---
  {
    docId: '24genetics-all-in-one',
    brandId: '24genetics',
    name: '24Genetics All in One Pack',
    displayName: '24Genetics All in One',
    productType: 'testing',
    category: 'Testing',
    desc: 'Comprehensive DNA test covering Health, Pharmacogenetics, Nutrigenetics, Sports, Skin Care, Ancestry, and Talent.',
    objective: 'Complete genome interpretation across all wellness domains',
    route: 'testing',
    status: 'active',
    capabilities: {
      analyzesBiomarkers: ['Whole exome/genome variants'],
      providesHealthInsights: true,
      providesAncestry: true,
      providesPharmacogenomics: true,
      providesNutrition: true,
    },
    sampleKit: {
      type: 'Saliva_Tube',
      requiresFasting: false,
      collectionMethod: 'At_Home',
      shippingMethod: 'Prepaid_Mailer',
    },
    additionalCapabilities: {
      requiresPrescription: false,
      physicianConsultationIncluded: false,
      b2bPortalAccess: false,
      aiInterpretationService: true,
      allowsRawDataUpload: true,
      digitalDashboard: true,
      wearableIntegration: false,
    },
    pricing: { retail: { perUnit: 199, currency: 'EUR' }, clinic: { perUnit: 150, currency: 'EUR' } }
  },

  // --- Bloodo ---
  {
    docId: 'bloodo-nad-test',
    brandId: 'bloodo',
    name: 'Bloodo NAD Level Test',
    displayName: 'Bloodo NAD+ Test',
    productType: 'testing',
    category: 'Testing',
    desc: 'Measures NAD+ and NADH levels to provide insights into cellular energy, aging, and metabolic health.',
    objective: 'NAD+ concentration measurement for cellular energy optimization',
    route: 'testing',
    status: 'active',
    capabilities: {
      analyzesBiomarkers: ['NAD+', 'NADH'],
      providesHealthInsights: true,
      providesAncestry: false,
      providesPharmacogenomics: false,
      providesNutrition: false,
    },
    sampleKit: {
      type: 'Dried_Blood_Spot',
      requiresFasting: true,
      collectionMethod: 'At_Home',
      shippingMethod: 'Prepaid_Mailer',
    },
    additionalCapabilities: {
      requiresPrescription: false,
      physicianConsultationIncluded: false,
      b2bPortalAccess: false,
      aiInterpretationService: false,
      allowsRawDataUpload: false,
      digitalDashboard: true,
      wearableIntegration: false,
    },
    pricing: { retail: { perUnit: 120, currency: 'EUR' }, clinic: { perUnit: 90, currency: 'EUR' } }
  },

  // --- EternaRx ---
  {
    docId: 'eternarx-longevity-panel',
    brandId: 'eternarx',
    name: 'EternaRx Longevity Blood Panel',
    displayName: 'EternaRx Longevity Diagnostic',
    productType: 'testing',
    category: 'Testing',
    desc: 'Comprehensive blood work diagnostic service used alongside EternaRx longevity and wellness treatments.',
    objective: 'Systemic biomarker tracking for longevity therapeutics',
    route: 'testing',
    status: 'active',
    capabilities: {
      analyzesBiomarkers: ['Hormones', 'Lipids', 'Metabolic Panel'],
      providesHealthInsights: true,
      providesAncestry: false,
      providesPharmacogenomics: false,
      providesNutrition: false,
    },
    sampleKit: {
      type: 'Venipuncture',
      requiresFasting: true,
      collectionMethod: 'Clinic',
      shippingMethod: 'Cold_Chain',
    },
    additionalCapabilities: {
      requiresPrescription: true,
      physicianConsultationIncluded: true,
      b2bPortalAccess: false,
      aiInterpretationService: false,
      allowsRawDataUpload: false,
      digitalDashboard: true,
      wearableIntegration: false,
    },
    pricing: { retail: { perUnit: 250, currency: 'EUR' }, clinic: { perUnit: 200, currency: 'EUR' } }
  },

  // --- Ultrahuman (Ultraman) ---
  {
    docId: 'ultrahuman-blood-vision',
    brandId: 'ultrahuman',
    name: 'Ultrahuman Blood Vision',
    displayName: 'Ultrahuman Blood Vision',
    productType: 'testing',
    category: 'Testing',
    desc: 'Metabolic and blood-testing services integrated with CGM data and wearables.',
    objective: 'Metabolic tracking and dynamic biomarker feedback',
    route: 'testing',
    status: 'active',
    capabilities: {
      analyzesBiomarkers: ['Glucose', 'Metabolic Markers', 'Inflammation'],
      providesHealthInsights: true,
      providesAncestry: false,
      providesPharmacogenomics: false,
      providesNutrition: true,
    },
    sampleKit: {
      type: 'Venipuncture',
      requiresFasting: true,
      collectionMethod: 'Phlebotomist',
      shippingMethod: 'Standard',
    },
    additionalCapabilities: {
      requiresPrescription: false,
      physicianConsultationIncluded: false,
      b2bPortalAccess: false,
      aiInterpretationService: true,
      allowsRawDataUpload: false,
      digitalDashboard: true,
      wearableIntegration: true, // Key differentiator
    },
    pricing: { retail: { perUnit: 149, currency: 'EUR' }, clinic: { perUnit: 110, currency: 'EUR' } }
  }
];

async function seed() {
  console.log('Seeding canonical testing products to Firestore...');
  for (const t of tests) {
    const { docId, pricing, ...payload } = t;
    
    // 1. Create/Update top-level product doc
    const prodRef = db.collection('products').doc(docId);
    await prodRef.set({
      ...payload,
      syncedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`  Synced product: ${docId}`);

    // 2. Create default variant sub-doc
    const variantRef = prodRef.collection('variants').doc('default');
    await variantRef.set({
      sku: `${docId.toUpperCase()}-01`,
      isDefault: true,
      isActive: true,
      sortOrder: 1,
      pricing: pricing,
      route: 'testing',
      supplier: payload.brandId.toUpperCase(),
      syncedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`    Synced default variant for: ${docId}`);
  }
  console.log('Done seeding products!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding:', err);
  process.exit(1);
});
