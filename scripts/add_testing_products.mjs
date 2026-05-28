/**
 * Seeding script for diagnostic testing products.
 * Inserts 10 diagnostic testing products with clinic vs retail pricing and variant sub-documents.
 */

import { db } from './lib/firebase-admin.mjs';

const tests = [
  {
    docId: 'eterna-epigenetic-test',
    name: 'ETERNA® Epigenetic Age Test',
    displayName: 'ETERNA® Epigenetic Age Test',
    type: 'testing',
    productType: 'testing',
    category: 'Longevity Diagnostics',
    goals: ['longevity_anti_aging'],
    desc: 'Advanced biological age and epigenetic tracking platform to measure cellular aging rates.',
    objective: 'Epigenetic age monitoring & biological rate of aging assessment',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 199, currency: 'EUR' },
      clinic: { perUnit: 150, currency: 'EUR' }
    }
  },
  {
    docId: 'progen-longevity-test',
    name: 'ProGen Longevity DNA Test',
    displayName: 'ProGen Longevity DNA Test',
    type: 'testing',
    productType: 'testing',
    category: 'Longevity Diagnostics',
    goals: ['longevity_anti_aging'],
    desc: 'Epigenetic methylation profiling to quantify organ-specific biological age and systemic health.',
    objective: 'Methylation profile analysis & biological aging rate',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 249, currency: 'EUR' },
      clinic: { perUnit: 190, currency: 'EUR' }
    }
  },
  {
    docId: 'fagron-trichotest',
    name: 'Fagron Trichotest',
    displayName: 'Fagron Trichotest',
    type: 'testing',
    productType: 'testing',
    category: 'Genomic Diagnostics',
    goals: ['hormonal_optimization', 'recovery_repair'],
    desc: 'Genetic analysis for personalized hair loss treatments, evaluating 48 genetic variations.',
    objective: 'Alopecia genetic predisposition & pathway analysis',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 180, currency: 'EUR' },
      clinic: { perUnit: 130, currency: 'EUR' }
    }
  },
  {
    docId: 'fagron-telotest',
    name: 'Fagron Telotest',
    displayName: 'Fagron Telotest',
    type: 'testing',
    productType: 'testing',
    category: 'Genomic Diagnostics',
    goals: ['longevity_anti_aging'],
    desc: 'Telomere length measurement tool to quantify cellular age and rate of aging.',
    objective: 'Telomere length quantification & cellular health aging indicator',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 160, currency: 'EUR' },
      clinic: { perUnit: 120, currency: 'EUR' }
    }
  },
  {
    docId: 'fagron-nutrigen',
    name: 'Fagron Nutrigen',
    displayName: 'Fagron Nutrigen',
    type: 'testing',
    productType: 'testing',
    category: 'Genomic Diagnostics',
    goals: ['metabolic_weight'],
    desc: 'Nutrigenomics DNA profile evaluating metabolic responses, nutrient assimilation, and exercise response.',
    objective: 'Nutrigenomics screening & metabolic profile optimization',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 170, currency: 'EUR' },
      clinic: { perUnit: 125, currency: 'EUR' }
    }
  },
  {
    docId: 'fagron-acnetest',
    name: 'Fagron Acnetest',
    displayName: 'Fagron Acnetest',
    type: 'testing',
    productType: 'testing',
    category: 'Genomic Diagnostics',
    goals: ['recovery_repair', 'hormonal_optimization'],
    desc: 'Genetic test to determine personalized acne treatments based on inflammatory and metabolic markers.',
    objective: 'Acne pathogenesis genetics & personalized formulation roadmap',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 150, currency: 'EUR' },
      clinic: { perUnit: 110, currency: 'EUR' }
    }
  },
  {
    docId: 'nad-blood-test',
    name: 'NAD Blood Biomarker Test',
    displayName: 'NAD Blood Biomarker Test',
    type: 'testing',
    productType: 'testing',
    category: 'Biomarker Diagnostics',
    goals: ['longevity_anti_aging', 'metabolic_weight'],
    desc: 'Intracellular NAD+ levels biomarker analysis to measure mitochondrial capability.',
    objective: 'NAD+ concentration measurement for cellular energy optimization',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 120, currency: 'EUR' },
      clinic: { perUnit: 90, currency: 'EUR' }
    }
  },
  {
    docId: 'cortisol-blood-test',
    name: 'Cortisol Blood Biomarker Test',
    displayName: 'Cortisol Blood Biomarker Test',
    type: 'testing',
    productType: 'testing',
    category: 'Biomarker Diagnostics',
    goals: ['sleep_circadian', 'cognitive_mood'],
    desc: 'Quantitative serum cortisol test to monitor adrenal stress response and circadian rhythms.',
    objective: 'HPA axis tracking & cortisol level profiling',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 60, currency: 'EUR' },
      clinic: { perUnit: 45, currency: 'EUR' }
    }
  },
  {
    docId: 'testosterone-blood-test',
    name: 'Testosterone Blood Biomarker Test',
    displayName: 'Testosterone Blood Biomarker Test',
    type: 'testing',
    productType: 'testing',
    category: 'Biomarker Diagnostics',
    goals: ['hormonal_optimization'],
    desc: 'Quantitative blood serum testosterone analysis (free and total) for metabolic and hormonal balance.',
    objective: 'Serum androgen profile tracking',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 70, currency: 'EUR' },
      clinic: { perUnit: 50, currency: 'EUR' }
    }
  },
  {
    docId: '24-genomics-nutrigen',
    name: '24 Genomics Nutrigen Test',
    displayName: '24 Genomics Nutrigen Test',
    type: 'testing',
    productType: 'testing',
    category: 'Genomic Diagnostics',
    goals: ['metabolic_weight'],
    desc: 'DNA nutrigenetics test to profile individual nutrition requirements and metabolic patterns.',
    objective: 'Genomic nutritional profiling & diet plan configuration',
    route: 'testing',
    status: 'active',
    pricing: {
      retail: { perUnit: 150, currency: 'EUR' },
      clinic: { perUnit: 110, currency: 'EUR' }
    }
  }
];

async function seed() {
  console.log('Seeding testing products to Firestore...');
  for (const t of tests) {
    const { docId, ...payload } = t;
    
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
      pricing: payload.pricing,
      route: 'testing',
      supplier: 'REGENPEPT-LABS',
      syncedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`    Synced default variant for: ${docId}`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error seeding:', err);
  process.exit(1);
});
