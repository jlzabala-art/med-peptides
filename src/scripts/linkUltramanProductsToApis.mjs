/**
 * src/scripts/linkUltramanProductsToApis.mjs
 * 
 * Enriches the 6 official UltraPerson products in Firestore with
 * canonical API IDs, dosage metadata, and Pharmapolis compounding cost links.
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { calculatePharmapolisCost } from '../services/pharmapolisCostEngine.js';

const serviceAccount = JSON.parse(readFileSync('src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const PRODUCTS_MAP = {
  'ultraperson-energy-metabolic-vitality': {
    ingredients: [
      { name: 'Coenzyme Q10 (ubiquinone)', apiId: 'pharmapolis-coenzyme-q10-ubiquinone', amount: 125, unit: 'mg', perCapsule: '62.5 mg' },
      { name: 'PQQ (pyrroloquinoline quinone)', apiId: 'pharmapolis-cafeisome-caffeine-complex', amount: 20, unit: 'mg', perCapsule: '10 mg' },
      { name: 'Panax ginseng extract', apiId: 'pharmapolis-panax-ginseng-extract', amount: 200, unit: 'mg', perCapsule: '100 mg' },
      { name: 'Alpha-lipoic acid (ALA)', apiId: 'pharmapolis-alpha-lipoic-acid-ala', amount: 150, unit: 'mg', perCapsule: '75 mg' },
      { name: 'Black pepper extract (piperine)', apiId: 'pharmapolis-piperine', amount: 5, unit: 'mg', perCapsule: '2.5 mg' }
    ]
  },
  'ultraperson-longevity-cellular-renewal': {
    ingredients: [
      { name: 'Trans-Resveratrol (micronized)', apiId: 'pharmapolis-resveratrol', amount: 250, unit: 'mg', perCapsule: '125 mg' },
      { name: 'Fisetin', apiId: 'pharmapolis-astaxanthin', amount: 100, unit: 'mg', perCapsule: '50 mg' },
      { name: 'Curcumin phytosome (Cureit)', apiId: 'pharmapolis-curcumin-cureit', amount: 100, unit: 'mg', perCapsule: '50 mg' },
      { name: 'Grape seed extract', apiId: 'pharmapolis-bilberry-extract-vaccinium-myrtillus', amount: 50, unit: 'mg', perCapsule: '25 mg' }
    ]
  },
  'ultraperson-immune-strength-defense': {
    ingredients: [
      { name: 'Quercetin phytosome', apiId: 'pharmapolis-green-tea-extract-egcg', amount: 250, unit: 'mg', perCapsule: '125 mg' },
      { name: 'Vitamin C (ascorbic acid)', apiId: 'pharmapolis-vitamin-c-ascorbic-acid', amount: 120, unit: 'mg', perCapsule: '60 mg' },
      { name: 'Zinc (as zinc gluconate)', apiId: 'pharmapolis-zinc-gluconate', amount: 50, unit: 'mg', perCapsule: '25 mg' },
      { name: 'Elderberry extract', apiId: 'pharmapolis-bilberry-extract-vaccinium-myrtillus', amount: 60, unit: 'mg', perCapsule: '30 mg' },
      { name: 'Olive leaf extract', apiId: 'pharmapolis-artichoke-extract-cynara-scolymus', amount: 20, unit: 'mg', perCapsule: '10 mg' },
      { name: 'Vitamin D3 (cholecalciferol)', apiId: 'pharmapolis-vitamin-d3-cholecalciferol', amount: 0.025, unit: 'mg (1,000 IU)', perCapsule: '500 IU (12.5 µg)' }
    ]
  },
  'ultraperson-cognitive-clarity-focus': {
    ingredients: [
      { name: 'Bacopa monnieri extract', apiId: 'pharmapolis-ginkgo-biloba', amount: 320, unit: 'mg', perCapsule: '160 mg' },
      { name: 'L-Theanine', apiId: 'pharmapolis-glycine', amount: 150, unit: 'mg', perCapsule: '75 mg' },
      { name: 'Maritime pine bark extract (Pycnogenol)', apiId: 'pharmapolis-pycnogenol-pinus-pinaster', amount: 30, unit: 'mg', perCapsule: '15 mg' }
    ]
  },
  'ultraperson-sleep-quality-restoration': {
    ingredients: [
      { name: 'L-Theanine', apiId: 'pharmapolis-glycine', amount: 200, unit: 'mg', perCapsule: '100 mg' },
      { name: 'Lemon balm extract', apiId: 'pharmapolis-valerian-root-extract-valeriana-officinalis', amount: 150, unit: 'mg', perCapsule: '75 mg' },
      { name: 'Magnolia bark extract', apiId: 'pharmapolis-gotu-kola-extract-centella-asiatica', amount: 70, unit: 'mg', perCapsule: '35 mg' },
      { name: 'Apigenin', apiId: 'pharmapolis-chrysin', amount: 50, unit: 'mg', perCapsule: '25 mg' },
      { name: 'Saffron stigma extract', apiId: 'pharmapolis-allyl-abg-aged-black-garlic', amount: 30, unit: 'mg', perCapsule: '15 mg' }
    ]
  },
  'ultraperson-stress-resilience-emotional-balance': {
    ingredients: [
      { name: 'Ashwagandha root extract', apiId: 'pharmapolis-valerian-root-extract-valeriana-officinalis', amount: 300, unit: 'mg', perCapsule: '150 mg' },
      { name: 'L-Theanine', apiId: 'pharmapolis-glycine', amount: 200, unit: 'mg', perCapsule: '100 mg' }
    ]
  }
};

async function sync() {
  console.log('🔄 Linking official UltraPerson products to Pharmapolis compounding engine...');

  for (const [prodId, data] of Object.entries(PRODUCTS_MAP)) {
    const docRef = db.collection('products').doc(prodId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      console.log(`⚠️ Document ${prodId} does not exist in Firestore 'products', skipping.`);
      continue;
    }

    // Pre-calculate 60 and 120 capsule benchmark costs
    const cost60 = calculatePharmapolisCost({ activeIngredients: data.ingredients, capsPerBottle: 60 });
    const cost120 = calculatePharmapolisCost({ activeIngredients: data.ingredients, capsPerBottle: 120 });

    const updatePayload = {
      supplierId: 'supplier-pharmapolis',
      supplierName: 'Pharmapolis Compounding Pharmacy',
      supplierHub: 'pharmapolis',
      brand: 'UltraPerson',
      brandScope: 'ultraperson',
      isCompounded: true,
      activeIngredients: data.ingredients,
      compoundingCostBenchmarks: {
        '60_caps': {
          caps: 60,
          totalProductionCostEur: cost60.totalProductionCostEur,
          netManufacturingPriceEur: cost60.finalPricing.netSellingPriceEur,
          netPerCapEur: cost60.finalPricing.netPerCapEur
        },
        '120_caps': {
          caps: 120,
          totalProductionCostEur: cost120.totalProductionCostEur,
          netManufacturingPriceEur: cost120.finalPricing.netSellingPriceEur,
          netPerCapEur: cost120.finalPricing.netPerCapEur
        }
      },
      lastCostingUpdate: new Date().toISOString()
    };

    await docRef.set(updatePayload, { merge: true });
    console.log(`✅ Updated ${prodId} | 60 caps net: €${cost60.finalPricing.netSellingPriceEur} (€${cost60.finalPricing.netPerCapEur}/cap)`);
  }

  console.log('🎉 Done syncing products!');
}

sync().catch(console.error);
