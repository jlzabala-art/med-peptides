/**
 * scripts/import_ultraperson_products.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Institutional Product Registrar for UltraPerson Personalization Supplements
 * Supplier: PharmaPolis (Pharmapolis Ltd. - Plovdiv, Bulgaria)
 * 
 * Rules:
 *   - Title includes "UltraPerson" and product name
 *   - Supplier: PharmaPolis (supplier-pharmapolis)
 *   - Dosage: 2 capsules daily = 500 mg total active ingredients/day
 *   - 1-Month Supply: 60 capsules (30 daily servings)
 *   - 3-Month Treatment (AAA): 180 capsules (90 daily servings)
 *   - 100% Vegan HPMC acid-resistant capsules, allergen-free
 *
 * Usage:
 *   node scripts/import_ultraperson_products.mjs          (Dry-run)
 *   node scripts/import_ultraperson_products.mjs --live   (Commit to Firestore)
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sa = require(path.join(__dirname, 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

const IS_LIVE = process.argv.includes('--live');
const SUPPLIER_ID = 'supplier-pharmapolis';
const SUPPLIER_NAME = 'PharmaPolis';
const SUPPLIER_COMPANY = 'Pharmapolis Ltd.';

export const ULTRAPERSON_CATALOG = [
  {
    id: 'ultraperson-energy-metabolic-vitality',
    title: 'UltraPerson Energy & Metabolic Vitality',
    subtitle: 'Enhances cellular energy, stamina, and metabolic efficiency to support sustained daily performance.',
    category: 'supplements',
    categoryId: 'supplement',
    therapeuticArea: 'Mitochondrial Biogenesis & Metabolic Energy',
    dailyServing: '2 capsules daily',
    activesPerServingMg: 500,
    activesPerCapsuleMg: 250,
    threeMonthsCapsules: 180,
    threeMonthsDays: 90,
    activeIngredients: [
      { name: 'Coenzyme Q10 (ubiquinone)', amount: 125, unit: 'mg', perCapsule: '62.5 mg', role: 'Mitochondrial ETC complex electron carrier' },
      { name: 'PQQ (pyrroloquinoline quinone)', amount: 20, unit: 'mg', perCapsule: '10 mg', role: 'Mitochondrial biogenesis activator' },
      { name: 'Panax ginseng extract', amount: 200, unit: 'mg', perCapsule: '100 mg', role: 'Adaptogenic stamina and glucose metabolism' },
      { name: 'Alpha-lipoic acid (ALA)', amount: 150, unit: 'mg', perCapsule: '75 mg', role: 'Universal intracellular antioxidant & Krebs cycle co-factor' },
      { name: 'Black pepper extract (≥95% piperine)', amount: 5, unit: 'mg', perCapsule: '2.5 mg', role: 'Bioavailability and absorption enhancer' }
    ],
    pricing: {
      oneMonth: { cost: 18, clinic: 34, retail: 49, currency: 'EUR' },
      threeMonth: { cost: 48, clinic: 89, retail: 129, currency: 'EUR' }
    }
  },
  {
    id: 'ultraperson-cognitive-clarity-focus',
    title: 'UltraPerson Cognitive Clarity & Focus',
    subtitle: 'Sharpens mental performance, attention, and memory for improved productivity and mental resilience.',
    category: 'supplements',
    categoryId: 'supplement',
    therapeuticArea: 'Nootropic & Synaptic Neuroplasticity',
    dailyServing: '2 capsules daily',
    activesPerServingMg: 500,
    activesPerCapsuleMg: 250,
    threeMonthsCapsules: 180,
    threeMonthsDays: 90,
    activeIngredients: [
      { name: 'Bacopa monnieri extract (≥55% bacosides)', amount: 320, unit: 'mg', perCapsule: '160 mg', role: 'Synaptic communication, memory retention and dendrite arborization' },
      { name: 'L-Theanine', amount: 150, unit: 'mg', perCapsule: '75 mg', role: 'Alpha wave brain activity promotion and glutamate modulation' },
      { name: 'Maritime pine bark extract (≥95% OPCs)', amount: 30, unit: 'mg', perCapsule: '15 mg', role: 'Cerebral microcirculation and endothelial nitric oxide support' }
    ],
    pricing: {
      oneMonth: { cost: 18, clinic: 34, retail: 49, currency: 'EUR' },
      threeMonth: { cost: 48, clinic: 89, retail: 129, currency: 'EUR' }
    }
  },
  {
    id: 'ultraperson-stress-resilience-emotional-balance',
    title: 'UltraPerson Stress Resilience & Emotional Balance',
    subtitle: 'Supports a calm, adaptive stress response and balanced mood to improve overall wellbeing.',
    category: 'supplements',
    categoryId: 'supplement',
    therapeuticArea: 'HPA Axis Adaptation & Cortisol Homeostasis',
    dailyServing: '2 capsules daily',
    activesPerServingMg: 500,
    activesPerCapsuleMg: 250,
    threeMonthsCapsules: 180,
    threeMonthsDays: 90,
    activeIngredients: [
      { name: 'Ashwagandha root extract (full-spectrum withanolides)', amount: 300, unit: 'mg', perCapsule: '150 mg', role: 'Downregulates elevated serum cortisol and stabilizes HPA axis' },
      { name: 'L-Theanine', amount: 200, unit: 'mg', perCapsule: '100 mg', role: 'GABAergic neurocalm without sedation' }
    ],
    pricing: {
      oneMonth: { cost: 16, clinic: 32, retail: 45, currency: 'EUR' },
      threeMonth: { cost: 44, clinic: 84, retail: 119, currency: 'EUR' }
    }
  },
  {
    id: 'ultraperson-sleep-quality-restoration',
    title: 'UltraPerson Sleep Quality & Restoration (Melatonin-Free)',
    subtitle: 'Promotes deep, restorative sleep and optimal recovery to restore mind and body balance.',
    category: 'supplements',
    categoryId: 'supplement',
    therapeuticArea: 'Restorative Sleep Architecture (Non-Hormonal)',
    dailyServing: '2 capsules daily',
    activesPerServingMg: 500,
    activesPerCapsuleMg: 250,
    threeMonthsCapsules: 180,
    threeMonthsDays: 90,
    activeIngredients: [
      { name: 'L-Theanine', amount: 200, unit: 'mg', perCapsule: '100 mg', role: 'Pre-somnolent central nervous relaxation' },
      { name: 'Lemon balm extract (≥5% rosmarinic acid)', amount: 150, unit: 'mg', perCapsule: '75 mg', role: 'Inhibits GABA transaminase, raising cerebral GABA levels' },
      { name: 'Magnolia bark extract', amount: 70, unit: 'mg', perCapsule: '35 mg', role: 'Honokiol/magnolol positive allosteric GABA-A modulators' },
      { name: 'Apigenin (from Matricaria chamomile)', amount: 50, unit: 'mg', perCapsule: '25 mg', role: 'Natural benzodiazepine receptor binding flavonol' },
      { name: 'Saffron stigma extract (Crocus sativus)', amount: 30, unit: 'mg', perCapsule: '15 mg', role: 'Serotonin and restorative slow-wave sleep enhancement' }
    ],
    pricing: {
      oneMonth: { cost: 19, clinic: 36, retail: 52, currency: 'EUR' },
      threeMonth: { cost: 50, clinic: 94, retail: 135, currency: 'EUR' }
    }
  },
  {
    id: 'ultraperson-immune-strength-defense',
    title: 'UltraPerson Immune Strength & Defense',
    subtitle: 'Fortifies immune response, reduces inflammation, and strengthens overall wellness and protection.',
    category: 'supplements',
    categoryId: 'supplement',
    therapeuticArea: 'Innate & Adaptive Immunomodulation',
    dailyServing: '2 capsules daily',
    activesPerServingMg: 500,
    activesPerCapsuleMg: 250,
    threeMonthsCapsules: 180,
    threeMonthsDays: 90,
    activeIngredients: [
      { name: 'Quercetin phytosome / dihydrate', amount: 250, unit: 'mg', perCapsule: '125 mg', role: 'Zinc ionophore, mast-cell stabilization and antiviral defense' },
      { name: 'Vitamin C (ascorbic acid)', amount: 120, unit: 'mg', perCapsule: '60 mg', role: 'Leukocyte phagocytosis and intracellular antioxidant recycling' },
      { name: 'Zinc (as zinc picolinate; ~10 mg elemental)', amount: 50, unit: 'mg', perCapsule: '25 mg', role: 'Thymic hormone production and T-lymphocyte maturation' },
      { name: 'Elderberry extract (≥10% anthocyanins)', amount: 60, unit: 'mg', perCapsule: '30 mg', role: 'Mucosal adherence inhibition against respiratory pathogens' },
      { name: 'Olive leaf extract (≥20% oleuropein)', amount: 20, unit: 'mg', perCapsule: '10 mg', role: 'Broad-spectrum antimicrobial and vascular protection' },
      { name: 'Vitamin D3 (cholecalciferol)', amount: 0.025, unit: 'mg (1,000 IU)', perCapsule: '500 IU (12.5 µg)', role: 'Cathelicidin and defensin antimicrobial peptide upregulation' }
    ],
    pricing: {
      oneMonth: { cost: 17, clinic: 33, retail: 47, currency: 'EUR' },
      threeMonth: { cost: 46, clinic: 86, retail: 125, currency: 'EUR' }
    }
  },
  {
    id: 'ultraperson-longevity-cellular-renewal',
    title: 'UltraPerson Longevity & Cellular Renewal',
    subtitle: 'Protects against aging, supports hormonal and cardiovascular health, and promotes cellular regeneration for long-term vitality.',
    category: 'supplements',
    categoryId: 'supplement',
    therapeuticArea: 'Sirtuin Activation & Senolytic Longevity',
    dailyServing: '2 capsules daily',
    activesPerServingMg: 500,
    activesPerCapsuleMg: 250,
    threeMonthsCapsules: 180,
    threeMonthsDays: 90,
    activeIngredients: [
      { name: 'Trans-Resveratrol (micronized)', amount: 250, unit: 'mg', perCapsule: '125 mg', role: 'SIRT1 sirtuin longevity gene allosteric activator' },
      { name: 'Fisetin', amount: 100, unit: 'mg', perCapsule: '50 mg', role: 'Targeted senolytic clearance of senescent p16/p21 cells' },
      { name: 'Curcumin phytosome (enhanced bioavailability)', amount: 100, unit: 'mg', perCapsule: '50 mg', role: 'NF-kB transcription factor suppression and anti-inflammatory' },
      { name: 'Grape seed extract (≥95% OPCs)', amount: 50, unit: 'mg', perCapsule: '25 mg', role: 'Vascular endothelial NO production and collagen protection' }
    ],
    pricing: {
      oneMonth: { cost: 20, clinic: 38, retail: 55, currency: 'EUR' },
      threeMonth: { cost: 52, clinic: 99, retail: 145, currency: 'EUR' }
    }
  }
];

export async function run() {
  console.log(`\n══════════════════════════════════════════════════════════════`);
  console.log(`🌿 UltraPerson Personalization Supplements Registrar`);
  console.log(`🏭 Supplier: ${SUPPLIER_NAME} (${SUPPLIER_COMPANY}) [${SUPPLIER_ID}]`);
  console.log(`Mode: ${IS_LIVE ? '🔴 COMMIT TO FIRESTORE' : '🟡 DRY-RUN'}`);
  console.log(`══════════════════════════════════════════════════════════════\n`);

  // Ensure Supplier document is updated with aliases and UltraPerson line
  const supplierRef = db.collection('suppliers').doc(SUPPLIER_ID);
  const supplierSnap = await supplierRef.get();
  if (supplierSnap.exists) {
    console.log(`✓ Supplier record found: "${supplierSnap.data().name}"`);
    if (IS_LIVE) {
      await supplierRef.update({
        displayName: 'PharmaPolis',
        aliases: admin.firestore.FieldValue.arrayUnion('PharmaPolis', 'PolisPharma', 'Pharmapolis Ltd.'),
        specialties: admin.firestore.FieldValue.arrayUnion('Personalized Nutraceutical Formulations (UltraPerson)'),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✓ Updated supplier metadata with PharmaPolis aliases & UltraPerson line.`);
    }
  } else {
    console.log(`⚠️ Supplier ${SUPPLIER_ID} not found, creating baseline...`);
    if (IS_LIVE) {
      await supplierRef.set({
        id: SUPPLIER_ID,
        name: 'Pharmapolis Ltd.',
        displayName: 'PharmaPolis',
        companyName: 'Pharmapolis Ltd.',
        type: 'compounding_pharmacy',
        country: 'Bulgaria',
        city: 'Plovdiv',
        status: 'active',
        aliases: ['PharmaPolis', 'PolisPharma', 'Pharmapolis Ltd.'],
        specialties: [
          'Trichology Formulations',
          'Compounded Acid-Resistant Capsules',
          'Bioactive Enzymes',
          'Personalized Nutraceutical Formulations (UltraPerson)'
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  for (const item of ULTRAPERSON_CATALOG) {
    console.log(`\n📦 Processing Product: [${item.id}]`);
    console.log(`   Title: ${item.title}`);
    console.log(`   Therapeutic Area: ${item.therapeuticArea}`);
    console.log(`   Daily Serving: ${item.dailyServing} (${item.activesPerServingMg} mg actives total)`);
    console.log(`   AAA 3-Month Protocol: ${item.threeMonthsCapsules} capsules (${item.threeMonthsDays} days supply)`);

    const variant30Days = {
      id: `${item.id}-30d`,
      variantId: `${item.id}-30d`,
      docId: `${item.id}-30d`,
      productId: item.id,
      name: `${item.title} - 30-Day Supply (60 Caps)`,
      productName: item.title,
      label: '30-Day Protocol (60 Capsules)',
      dosage: '60 Capsules (2 daily / 30 Days)',
      dose: '60 Capsules',
      format: 'Bottle (60 Acid-Resistant HPMC Caps)',
      capsulesCount: 60,
      durationDays: 30,
      dailyServing: '2 capsules/day',
      pricing: {
        wholesale: { perUnit: item.pricing.oneMonth.clinic, currency: item.pricing.oneMonth.currency },
        clinic: { perUnit: item.pricing.oneMonth.clinic, currency: item.pricing.oneMonth.currency },
        retail: { perUnit: item.pricing.oneMonth.retail, currency: item.pricing.oneMonth.currency },
        master: { perUnit: item.pricing.oneMonth.cost, currency: item.pricing.oneMonth.currency }
      },
      costPrice: item.pricing.oneMonth.cost,
      clinicPrice: item.pricing.oneMonth.clinic,
      retailPrice: item.pricing.oneMonth.retail,
      price: item.pricing.oneMonth.retail,
      unit_price: item.pricing.oneMonth.clinic,
      currency: item.pricing.oneMonth.currency,
      inStock: true,
      stockType: 'compounded_on_demand',
      supplierId: SUPPLIER_ID,
      supplierName: SUPPLIER_NAME,
      supplier: SUPPLIER_NAME,
      leadTime: '3-5 business days',
      status: 'published'
    };

    const variant90Days = {
      id: `${item.id}-90d-aaa`,
      variantId: `${item.id}-90d-aaa`,
      docId: `${item.id}-90d-aaa`,
      productId: item.id,
      name: `${item.title} - 3-Month Protocol AAA (180 Caps)`,
      productName: item.title,
      label: '3-Month Protocol AAA (180 Capsules)',
      dosage: '180 Capsules (2 daily / 90 Days)',
      dose: '180 Capsules',
      format: 'Triple Pack / Master Pack (180 Acid-Resistant HPMC Caps)',
      capsulesCount: 180,
      durationDays: 90,
      dailyServing: '2 capsules/day',
      treatmentType: 'AAA 3-Month Clinical Regimen',
      pricing: {
        wholesale: { perUnit: item.pricing.threeMonth.clinic, currency: item.pricing.threeMonth.currency },
        clinic: { perUnit: item.pricing.threeMonth.clinic, currency: item.pricing.threeMonth.currency },
        retail: { perUnit: item.pricing.threeMonth.retail, currency: item.pricing.threeMonth.currency },
        master: { perUnit: item.pricing.threeMonth.cost, currency: item.pricing.threeMonth.currency }
      },
      costPrice: item.pricing.threeMonth.cost,
      clinicPrice: item.pricing.threeMonth.clinic,
      retailPrice: item.pricing.threeMonth.retail,
      price: item.pricing.threeMonth.retail,
      unit_price: item.pricing.threeMonth.clinic,
      currency: item.pricing.threeMonth.currency,
      inStock: true,
      stockType: 'compounded_on_demand',
      supplierId: SUPPLIER_ID,
      supplierName: SUPPLIER_NAME,
      supplier: SUPPLIER_NAME,
      leadTime: '3-5 business days',
      status: 'published'
    };

    const productPayload = {
      id: item.id,
      name: item.title,
      title: item.title,
      product_name: item.title,
      canonicalName: item.title,
      brand: 'UltraPerson',
      line: 'Zero-Star Personalization Supplements',
      category: item.category,
      categoryId: item.categoryId,
      productType: 'finished_product',
      format: 'Acid-Resistant Vegan HPMC Capsules',
      deliveryFormat: 'capsules',
      therapeuticArea: item.therapeuticArea,
      shortDescription: item.subtitle,
      description: `${item.subtitle} Formulated as 100% vegan acid-resistant HPMC capsules delivering 500 mg active pharmaceutical-grade ingredients per daily serving (2 capsules). Standardized for 3-Month AAA clinical protocols (180 capsules total).`,
      supplierId: SUPPLIER_ID,
      supplierName: SUPPLIER_NAME,
      supplier: SUPPLIER_NAME,
      supplierIds: [SUPPLIER_ID],
      status: 'published',
      dailyServing: item.dailyServing,
      activesPerServingMg: item.activesPerServingMg,
      activesPerCapsuleMg: item.activesPerCapsuleMg,
      treatmentProtocol: {
        targetDurationMonths: 3,
        totalCapsulesRequired: 180,
        dailyCapsules: 2,
        protocolCode: 'AAA-3M'
      },
      activeIngredients: item.activeIngredients,
      certifications: [
        '100% Vegan (HPMC)',
        'Acid-Resistant Delayed Release',
        'EU GMP Compounded',
        'Zero Animal Excipients',
        'Allergen-Free Clean Label'
      ],
      variantsCount: 2,
      variants: [variant30Days, variant90Days],
      updatedAt: new Date().toISOString()
    };

    if (IS_LIVE) {
      await db.collection('products').doc(item.id).set(productPayload, { merge: true });
      await db.collection('variants').doc(variant30Days.id).set(variant30Days, { merge: true });
      await db.collection('variants').doc(variant90Days.id).set(variant90Days, { merge: true });
      console.log(`   ✅ Saved to Firestore [products/${item.id}] & variants: [${variant30Days.id}, ${variant90Days.id}]`);
    } else {
      console.log(`   [DRY-RUN] Would create product doc [${item.id}] with 2 variants (60 caps & 180 caps).`);
    }
  }

  console.log(`\n🎉 Done! All 6 UltraPerson products processed.`);
  if (!IS_LIVE) {
    console.log(`To commit to Firestore, run:\nnode scripts/import_ultraperson_products.mjs --live`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch(console.error);
}
