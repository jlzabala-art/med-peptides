/**
 * normalizeColwayDataAndPricing.mjs
 * 
 * Comprehensive Firestore Normalization for all Colway Products:
 * 1. Sets exact landed cost in AED as specified by user:
 *    - Shampoo = AED 100
 *    - Conditioner = AED 100
 *    - Blue Line Cream = AED 220
 *    - Blue Line Peeling = AED 115
 *    - Lip Balm = AED 15
 *    - Washing Gel = AED 100
 *    + Colvita = AED 105
 *    + Collagen Vege = AED 85
 * 2. Computes wholesale price (+15% markup) and clinic/retail prices.
 * 3. Normalizes both AED and USD pricing blocks, eliminating the price inversion in USD views.
 * 4. Assigns the unified clinical categories, routine steps, and Inside-Out synergies.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const AED_PER_USD = 3.6725;

const COLWAY_NORMALIZED_DATA = {
  'colway-strengthening-shampoo': {
    name: 'Colway Strengthening Hair Shampoo',
    volume: '250 mL',
    sku: 'SKU-COLWAY-STR-SHAMPOO-250',
    category: 'trichology',
    clinical_line: 'Clinical Trichology & Scalp Restoration Line',
    routine_step: 'step_1_prep',
    step_number: 1,
    routine_badge: 'Step 1 • Follicular Cleansing',
    routine_role: 'Follicular ostium cleansing & microcirculation stimulation (Baicapil™ + Diosmin)',
    pricing: {
      aed: { cost: 100, wholesale: 115, clinic: 145, retail: 180, currency: 'AED' },
      usd: { cost: 27.23, wholesale: 31.31, clinic: 39.48, retail: 49.00, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-strengthening-conditioner',
        slug: 'colway-strengthening-conditioner',
        name: 'Colway Strengthening Hair Conditioner',
        role: 'Peribulbar cuticular biosealing & hair shaft tensile reinforcement'
      },
      inside_out: {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen Capsules',
        mechanism: 'Oral supply of glycine, proline and hydroxyproline for follicular matrix synthesis from bloodstream'
      },
      bundle: {
        id: 'colway-trichology',
        name: 'Colway Complete Trichology 2-Step System (Duo)',
        savings: '10% Protocol Savings'
      }
    }
  },

  'colway-strengthening-conditioner': {
    name: 'Colway Strengthening Hair Conditioner',
    volume: '200 mL',
    sku: 'SKU-COLWAY-STR-COND-200',
    category: 'trichology',
    clinical_line: 'Clinical Trichology & Scalp Restoration Line',
    routine_step: 'step_2_activate',
    step_number: 2,
    routine_badge: 'Step 2 • Fiber Anchorage & Cuticle Seal',
    routine_role: 'Cuticular sealing, tensile strength (+24%) & shock-loss mitigation',
    pricing: {
      aed: { cost: 100, wholesale: 115, clinic: 145, retail: 180, currency: 'AED' },
      usd: { cost: 27.23, wholesale: 31.31, clinic: 39.48, retail: 49.00, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-strengthening-shampoo',
        slug: 'colway-strengthening-shampoo',
        name: 'Colway Strengthening Hair Shampoo',
        role: 'Pre-cleanses follicular ostium to maximize bioactive penetration'
      },
      inside_out: {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen Capsules',
        mechanism: 'Systemic substrate supply to dermal papilla'
      },
      bundle: {
        id: 'colway-trichology',
        name: 'Colway Complete Trichology 2-Step System (Duo)',
        savings: '10% Protocol Savings'
      }
    }
  },

  'colway-blue-diamond-cream': {
    name: 'Colway Blue Diamond Cream (Krem Niebieski Diament)',
    volume: '50 mL',
    sku: 'SKU-COLWAY-BLUEDIAMOND-50',
    category: 'epigenetic-cellular',
    clinical_line: 'Blue Diamond Epigenetic Cellular Line',
    routine_step: 'step_2_activate',
    step_number: 2,
    routine_badge: 'Step 2 • Epigenetic Rejuvenation',
    routine_role: 'VEP-carrier diamond peptide cellular stimulation & neocollagenesis',
    pricing: {
      aed: { cost: 220, wholesale: 253, clinic: 320, retail: 395, currency: 'AED' },
      usd: { cost: 59.90, wholesale: 68.89, clinic: 87.13, retail: 108.00, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-blue-diamond-peeling',
        slug: 'colway-blue-diamond-peeling',
        name: 'Colway Blue Diamond Peeling',
        role: 'Diamond powder micro-exfoliation to triple peptide permeation'
      },
      inside_out: {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen Capsules',
        mechanism: 'Provides circulating amino acid pool required by stimulated fibroblasts to build new tropocollagen'
      },
      bundle: {
        id: 'bundle-blue-diamond-ritual',
        name: 'Blue Diamond Complete Cellular Epigenetic Ritual (Peeling + Cream + Colvita)',
        savings: 'Clinical Protocol Bundle • 15% Total Benefit'
      }
    }
  },

  'colway-blue-diamond-peeling': {
    name: 'Colway Blue Diamond Peeling (Peeling Niebieski Diament)',
    volume: '75 mL',
    sku: 'SKU-COLWAY-BLUEDIAMOND-PEELING-75',
    category: 'epigenetic-cellular',
    clinical_line: 'Blue Diamond Epigenetic Cellular Line',
    routine_step: 'step_1_prep',
    step_number: 1,
    routine_badge: 'Step 1 • Cellular Pre-Opening & Exfoliation',
    routine_role: 'Diamond dust and papain-assisted corneocyte shedding without micro-tears',
    pricing: {
      aed: { cost: 115, wholesale: 132.25, clinic: 175, retail: 220, currency: 'AED' },
      usd: { cost: 31.31, wholesale: 36.01, clinic: 47.65, retail: 60.00, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-blue-diamond-cream',
        slug: 'colway-blue-diamond-cream',
        name: 'Colway Blue Diamond Cream',
        role: 'Intense epigenetic peptide replenishment post-exfoliation'
      },
      inside_out: {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen Capsules',
        mechanism: 'Accelerates epidermal basal layer mitotic renewal'
      },
      bundle: {
        id: 'bundle-blue-diamond-ritual',
        name: 'Blue Diamond Complete Cellular Epigenetic Ritual',
        savings: 'Clinical Protocol Bundle • 15% Total Benefit'
      }
    }
  },

  'colway-collagen-lip-care': {
    name: 'Colway Bioactive Collagen Lip Care',
    volume: '4.5 g (Single Stick) / 3-Stick Pack',
    sku: 'SKU-COLWAY-LIP-CARE',
    category: 'native-dermal',
    clinical_line: 'Native Dermal Collagen & Barrier Line',
    routine_step: 'step_3_protect',
    step_number: 3,
    routine_badge: 'Step 3 • Mucosal Barrier Shield',
    routine_role: 'Native collagen & shea butter biolipid reconstruction of labial vermilion',
    pricing: {
      aed: { cost: 15, wholesale: 17.25, clinic: 25, retail: 35, currency: 'AED' },
      usd: { cost: 4.08, wholesale: 4.70, clinic: 6.81, retail: 9.50, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-collagen-vege',
        slug: 'colway-collagen-vege',
        name: 'Colway Collagen Vege Airless',
        role: 'Perioral fine line treatment prior to lip seal'
      },
      inside_out: {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen Capsules',
        mechanism: 'Dermal support for labial fullness and vascular elasticity'
      }
    }
  },

  'colway-collagen-wash-gel': {
    name: 'Colway Cellular Collagen Hydrolipid Wash Gel',
    volume: '250 mL',
    sku: 'SKU-COLWAY-WASH-250',
    category: 'native-dermal',
    clinical_line: 'Native Dermal Collagen & Barrier Line',
    routine_step: 'step_1_prep',
    step_number: 1,
    routine_badge: 'Step 1 • Physiological Cleansing',
    routine_role: 'Sulfate-free cleansing protecting hydrolipid film & preparing skin for native collagen absorption',
    pricing: {
      aed: { cost: 100, wholesale: 115, clinic: 145, retail: 185, currency: 'AED' },
      usd: { cost: 27.23, wholesale: 31.31, clinic: 39.48, retail: 50.00, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-collagen-vege',
        slug: 'colway-collagen-vege',
        name: 'Colway Collagen Vege Airless',
        role: 'Immediate bio-collagen application onto damp skin post-wash'
      },
      inside_out: {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen Capsules',
        mechanism: 'Comprehensive dermis + epidermis barrier restoration'
      }
    }
  },

  'colway-collagen-vege': {
    name: 'Colway Collagen Vege (Plant-Based Bioactive Tropocollagen)',
    volume: '45 mL',
    sku: 'SKU-COLWAY-VEGE-45',
    category: 'native-dermal',
    clinical_line: 'Native Dermal Collagen & Barrier Line',
    routine_step: 'step_2_activate',
    step_number: 2,
    routine_badge: 'Step 2 • Dermal Bio-Replenishment',
    routine_role: 'Chlorella-derived full human-matching aminogram for sensitive and post-procedure recovery',
    pricing: {
      aed: { cost: 85, wholesale: 97.75, clinic: 135, retail: 175, currency: 'AED' },
      usd: { cost: 23.14, wholesale: 26.62, clinic: 36.76, retail: 48.00, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-collagen-wash-gel',
        slug: 'colway-collagen-wash-gel',
        name: 'Colway Cellular Collagen Hydrolipid Wash Gel',
        role: 'Non-stripping cleansing base for maximum absorption'
      },
      inside_out: {
        id: 'colway-colvita',
        slug: 'colway-colvita',
        name: 'Colvita Bioactive Native Collagen Capsules',
        mechanism: 'Oral triple-helix amino acid reservoir for systemic neocollagenesis'
      }
    }
  },

  'colway-colvita': {
    name: 'Colvita Bioactive Native Collagen Capsules',
    volume: '60 / 120 Capsules',
    sku: 'SKU-COLWAY-COLVITA-60',
    category: 'nutricosmetics',
    clinical_line: 'Inside-Out Systemic Nutricosmetic Pillar',
    routine_step: 'systemic_support',
    step_number: 0,
    routine_badge: 'Systemic Pillar • Inside-Out Foundation',
    routine_role: 'Lyophilized active fish tropocollagen + Fucus algae + vitamin E: systemic substrate for fibroblasts',
    pricing: {
      aed: { cost: 105, wholesale: 120.75, clinic: 160, retail: 210, currency: 'AED' },
      usd: { cost: 28.59, wholesale: 32.88, clinic: 43.57, retail: 58.00, currency: 'USD' }
    },
    synergy: {
      topical_companion: {
        id: 'colway-blue-diamond-cream',
        slug: 'colway-blue-diamond-cream',
        name: 'Colway Blue Diamond Cream',
        role: 'Topical signaling peptide (stimulates fibroblast receptor) paired with oral building blocks'
      },
      inside_out: {
        id: 'colway-strengthening-shampoo',
        slug: 'colway-strengthening-shampoo',
        name: 'Colway Strengthening Hair System',
        mechanism: 'Provides vascular and dermal papilla matrix nutrition during topical anagen stimulation'
      }
    }
  }
};

async function runNormalization() {
  console.log('🔄 Starting Comprehensive Colway Firestore Normalization...\n');

  for (const [docId, item] of Object.entries(COLWAY_NORMALIZED_DATA)) {
    const docRef = db.collection('products').doc(docId);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.warn(`⚠️ Document not found: ${docId}, creating...`);
    }

    const aed = item.pricing.aed;
    const usd = item.pricing.usd;

    const payload = {
      name: item.name,
      volume: item.volume,
      sku: item.sku,
      category: item.category,
      clinical_line: item.clinical_line,
      routine_step: item.routine_step,
      step_number: item.step_number,
      routine_badge: item.routine_badge,
      routine_role: item.routine_role,
      synergy: item.synergy,

      // Base fields standardized to USD with wholesale < retail
      price: usd.retail,
      unit_price: usd.retail,
      wholesale_price: usd.wholesale,
      wholesalePrice: usd.wholesale,
      cost: usd.cost,
      landed_cost: usd.cost,
      currency: 'USD',

      // Explicit UAE AED Pricing
      landedCostAed: aed.cost,
      wholesalePriceAed: aed.wholesale,
      clinicPriceAed: aed.clinic,
      retailPriceAed: aed.retail,
      wholesaler_markup_pct: 15,
      wholesalerMarkupPct: 15,

      // Dual-Currency Master Object (Golden SSOT)
      pricing: {
        aed: {
          cost: aed.cost,
          wholesale: aed.wholesale,
          clinic: aed.clinic,
          retail: aed.retail,
          currency: 'AED',
          markup_pct: 15
        },
        usd: {
          cost: usd.cost,
          wholesale: usd.wholesale,
          clinic: usd.clinic,
          retail: usd.retail,
          currency: 'USD',
          markup_pct: 15
        }
      },

      pricing_uae: {
        landedCostAed: aed.cost,
        wholesalePriceAed: aed.wholesale,
        clinicPriceAed: aed.clinic,
        retailPriceAed: aed.retail,
        wholesalerMarkupPct: 15,
        marginAed: Number((aed.wholesale - aed.cost).toFixed(2)),
        currency: 'AED',
        source: 'Official Colway UAE Landed Cost Schedule',
        effectiveDate: '2026-10-17'
      },

      updated_at: FieldValue.serverTimestamp(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(payload, { merge: true });
    console.log(`✅ Normalized ${docId}:`);
    console.log(`   AED: Cost ${aed.cost} | Wholesale (+15%) ${aed.wholesale} | Retail ${aed.retail}`);
    console.log(`   USD: Cost $${usd.cost} | Wholesale (+15%) $${usd.wholesale} | Retail $${usd.retail}`);
    console.log(`   Category: ${item.category} | Step: ${item.routine_badge}\n`);
  }

  // Also ensure the duo pack 'colway-trichology' bundle is normalized
  const duoRef = db.collection('products').doc('colway-trichology');
  await duoRef.set({
    name: 'Colway Trichology Hair Strengthening System (2-Step Duo)',
    volume: '450 mL (250mL Shampoo + 200mL Conditioner)',
    sku: 'SKU-COLWAY-TRICHOLOGY-DUO',
    category: 'trichology',
    clinical_line: 'Clinical Trichology & Scalp Restoration Line',
    routine_step: 'complete_bundle',
    step_number: 99,
    routine_badge: 'Complete 2-Step Trichological System',
    routine_role: 'Simultaneous ostium follicle cleansing + peribulbar cuticular biosealing',
    price: 92.00,
    wholesale_price: 62.63,
    cost: 54.46,
    currency: 'USD',
    landedCostAed: 200,
    wholesalePriceAed: 230,
    clinicPriceAed: 280,
    retailPriceAed: 340,
    wholesaler_markup_pct: 15,
    pricing: {
      aed: { cost: 200, wholesale: 230, clinic: 280, retail: 340, currency: 'AED', markup_pct: 15 },
      usd: { cost: 54.46, wholesale: 62.63, clinic: 76.24, retail: 92.00, currency: 'USD', markup_pct: 15 }
    },
    pricing_uae: {
      landedCostAed: 200,
      wholesalePriceAed: 230,
      clinicPriceAed: 280,
      retailPriceAed: 340,
      currency: 'AED'
    },
    updated_at: FieldValue.serverTimestamp(),
    updatedAt: new Date().toISOString()
  }, { merge: true });

  console.log('✅ Normalized colway-trichology Duo Bundle!\n');
  console.log('🎉 Full Colway Normalization Completed Successfully!');
}

runNormalization().catch(err => {
  console.error('❌ Normalization failed:', err);
  process.exit(1);
});
