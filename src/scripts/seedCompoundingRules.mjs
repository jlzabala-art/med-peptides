import { adminDb } from '../lib/firebaseAdmin.js';

const RULES_DATA = {
  // Vehicles & Bases
  'trichosol-fagron': {
    isVehicle: true,
    vehicleType: 'aqueous_hydroalcoholic',
    targetRoute: 'Topical Scalp',
    dispensingForm: 'Topical Solution (Vehicle)',
    compatibleRoutes: ['Topical'],
    description: 'Hydroalcoholic formulation base for hair loss APIs (Minoxidil, Finasteride, Dutasteride, Latanoprost). Free from alcohol and PPG irritation.'
  },
  'trichooil-fagron': {
    isVehicle: true,
    vehicleType: 'lipophilic_oil',
    targetRoute: 'Topical Scalp / Beard',
    dispensingForm: 'Topical Oil (Vehicle)',
    compatibleRoutes: ['Topical'],
    description: '100% natural oil vehicle rich in omega fatty acids for lipophilic active ingredients.'
  },
  'trichofoam-fagron': {
    isVehicle: true,
    vehicleType: 'foam_solution',
    targetRoute: 'Topical Scalp',
    dispensingForm: 'Topical Foam (Vehicle)',
    compatibleRoutes: ['Topical'],
    description: 'Aqueous foam vehicle with proven high patient compliance and fast drying.'
  },
  'pentravan-fagron': {
    isVehicle: true,
    vehicleType: 'transdermal_cream',
    targetRoute: 'Transdermal / Topical',
    dispensingForm: 'Transdermal Cream (Vehicle)',
    compatibleRoutes: ['Transdermal', 'Topical'],
    description: 'Patented liposomal transdermal vanishing cream for deep tissue and systemic absorption.'
  },

  // Capillary & Active Compounding APIs
  'minoxidil': {
    compatibleVehicles: ['trichosol-fagron', 'trichofoam-fagron', 'trichooil-fagron'],
    maxRecommendedConcentration: '7.0%',
    defaultConcentration: '5.0%',
    targetRoute: 'Topical',
    targetForm: 'Topical Solution / Foam',
    phRange: '4.5 - 6.0'
  },
  'finasteride': {
    compatibleVehicles: ['trichosol-fagron', 'trichofoam-fagron'],
    maxRecommendedConcentration: '1.0%',
    defaultConcentration: '0.1%',
    targetRoute: 'Topical',
    targetForm: 'Topical Solution',
    phRange: '4.5 - 6.5'
  },
  'dutasteride': {
    compatibleVehicles: ['trichosol-fagron', 'trichooil-fagron', 'trichofoam-fagron'],
    maxRecommendedConcentration: '0.5%',
    defaultConcentration: '0.05%',
    targetRoute: 'Topical',
    targetForm: 'Topical Solution / Oil',
    phRange: '4.5 - 6.5'
  },
  'latanoprost': {
    compatibleVehicles: ['trichosol-fagron', 'trichofoam-fagron'],
    maxRecommendedConcentration: '0.01%',
    defaultConcentration: '0.005%',
    targetRoute: 'Topical',
    targetForm: 'Topical Solution',
    phRange: '5.0 - 7.0'
  },
  '17-alpha-estradiol': {
    compatibleVehicles: ['trichosol-fagron'],
    maxRecommendedConcentration: '0.1%',
    defaultConcentration: '0.025%',
    targetRoute: 'Topical',
    targetForm: 'Topical Solution'
  },
  'clobetasol-propionate': {
    compatibleVehicles: ['trichosol-fagron', 'trichofoam-fagron'],
    maxRecommendedConcentration: '0.05%',
    defaultConcentration: '0.05%',
    targetRoute: 'Topical',
    targetForm: 'Topical Solution'
  },
  'ciclopirox-olamine': {
    compatibleVehicles: ['trichosol-fagron'],
    maxRecommendedConcentration: '1.5%',
    defaultConcentration: '1.0%',
    targetRoute: 'Topical',
    targetForm: 'Topical Solution'
  },
  'spironolactone': {
    compatibleVehicles: ['trichosol-fagron', 'pentravan-fagron'],
    maxRecommendedConcentration: '5.0%',
    defaultConcentration: '2.0%',
    targetRoute: 'Topical / Transdermal',
    targetForm: 'Topical Solution / Cream'
  },

  // Oral Nutrients & Telomere / NutriGen APIs
  'n-acetylcysteine': {
    compatibleVehicles: ['oral_capsule', 'oral_powder'],
    maxRecommendedConcentration: '1200mg/day',
    defaultConcentration: '600mg',
    targetRoute: 'Oral',
    targetForm: 'Oral Capsule'
  },
  'astaxanthin': {
    compatibleVehicles: ['oral_capsule', 'oral_softgel'],
    maxRecommendedConcentration: '12mg/day',
    defaultConcentration: '4mg',
    targetRoute: 'Oral',
    targetForm: 'Oral Capsule / Softgel'
  },
  'vitamin-d3': {
    compatibleVehicles: ['oral_capsule', 'oral_drops'],
    maxRecommendedConcentration: '10000 IU/day',
    defaultConcentration: '4000 IU',
    targetRoute: 'Oral',
    targetForm: 'Oral Capsule / Drops'
  },
  'methylfolate': {
    compatibleVehicles: ['oral_capsule'],
    maxRecommendedConcentration: '15mg/day',
    defaultConcentration: '1000 mcg',
    targetRoute: 'Oral',
    targetForm: 'Oral Capsule'
  },
  'ubiquinol': {
    compatibleVehicles: ['oral_capsule', 'oral_softgel'],
    maxRecommendedConcentration: '300mg/day',
    defaultConcentration: '100mg',
    targetRoute: 'Oral',
    targetForm: 'Oral Softgel'
  }
};

async function run() {
  console.log('Seeding compounding rules for key Fagron products...');
  let updated = 0;

  for (const [prodId, rules] of Object.entries(RULES_DATA)) {
    const docRef = adminDb.collection('products').doc(prodId);
    const snap = await docRef.get();

    if (snap.exists) {
      await docRef.update({
        compoundingRules: rules,
        updatedAt: new Date().toISOString()
      });
      console.log(`✓ Updated compoundingRules for ${prodId}`);
      updated++;
    } else {
      console.log(`- Product ${prodId} not found in products collection.`);
    }
  }

  console.log(`\nSuccessfully updated compoundingRules on ${updated} products in Firestore.`);
  process.exit(0);
}

run().catch(err => {
  console.error('Seeding compounding rules error:', err);
  process.exit(1);
});
