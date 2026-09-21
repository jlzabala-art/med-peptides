/**
 * seedMagentaIvDrips.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Seeds the 3 Magenta IV Drip formulations (50mL / 280 AED) into Firestore:
 *  1. Immune Support Drip+ IV Drip (50mL)
 *  2. Longevity+ IV Drip (50mL)
 *  3. Radiant Skin+ IV Drip (50mL)
 * 
 * Populates complete structured ingredient matrices, clinical goals, administration
 * guidelines, and supplier agreement rates in USD and AED.
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;

const app = getApps().length === 0 
  ? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }) 
  : getApps()[0];
const db = getFirestore(app);

const IV_DRIPS = [
  {
    id: 'immune-support-drip-plus',
    slug: 'immune-support-drip-plus',
    name: 'Immune Support Drip+ IV Drip',
    title: 'Immune Support Drip+ IV Drip (50mL)',
    shortDescription: 'Clinical High-Dose Vitamin C, NAC, Glutamine & Micronutrient Intravenous Infusion Complex for Immune Defense & Antioxidant Restoration.',
    description: 'Immune Support Drip+ is a comprehensive 50mL clinical intravenous compounding formulation engineered to support immune resilience, leukocyte function, and cellular antioxidant reserves. Combines 5,000 mg of buffered Ascorbic Acid with N-Acetylcysteine, Glutamine, MSM, Zinc, and bioactive B-complex co-factors. Includes a separate iron vial for clinical dose confirmation.',
    category: 'iv_drips',
    categoryId: 'iv_drips',
    product_type: 'iv_drip',
    primaryType: 'iv_drip',
    availableTypes: ['iv_drip', 'compounding'],
    presentation: 'iv_drip',
    presentationName: 'IV Drip (50 mL)',
    status: 'published',
    visibility: 'public',
    volume_ml: 50,
    routeOfAdministration: 'Intravenous Infusion (IV)',
    infusionProtocol: {
      carrierVolume: '250 mL – 500 mL Sterile 0.9% NaCl or 5% Dextrose',
      durationMinutes: '45 – 60 min',
      infusionRate: '50 – 75 drops/min',
      storageCondition: '2°C – 8°C (Refrigerated). Protect from light.',
      inUseStability: 'Administer within 4 hours of compounding into carrier bag.'
    },
    hasSeparateVial: true,
    separateVialNotes: 'Separate Vial: Iron (Dose for clinical confirmation)',
    clinicalGoals: ['immunity', 'antioxidant', 'infection_defense', 'cellular_repair', 'recovery'],
    totalActiveMg: 10086,
    ingredients: [
      { name: 'Ascorbic acid (Vitamin C)', amount: 5000, unit: 'mg', category: 'Vitamin / Antioxidant', role: 'High-dose antioxidant and immune cell phagocytosis support' },
      { name: 'Dimethyl sulfone (MSM)', amount: 1000, unit: 'mg', category: 'Sulfur Donor', role: 'Cellular membrane permeability and organic sulfur replenishment' },
      { name: 'Magnesium chloride', amount: 1000, unit: 'mg', category: 'Mineral / Electrolyte', role: 'Cellular relaxation, enzyme co-factor, and vasodilation' },
      { name: 'N-Acetylcysteine (NAC)', amount: 1000, unit: 'mg', category: 'Antioxidant Precursor', role: 'Rate-limiting precursor for endogenous glutathione biosynthesis' },
      { name: 'L-Glutamine', amount: 1000, unit: 'mg', category: 'Amino Acid', role: 'Primary fuel substrate for lymphocytes and intestinal mucosal integrity' },
      { name: 'Glycine', amount: 500, unit: 'mg', category: 'Amino Acid', role: 'Collagen synthesis, glutathione tripeptide component, and anti-inflammatory signaling' },
      { name: 'Dexpanthenol (Vitamin B5)', amount: 250, unit: 'mg', category: 'B-Vitamin', role: 'Coenzyme A synthesis and fatty acid oxidation' },
      { name: 'Thiamine HCl (Vitamin B1)', amount: 200, unit: 'mg', category: 'B-Vitamin', role: 'Pyruvate dehydrogenase co-factor and ATP cellular energy cycle' },
      { name: 'Pyridoxine (Vitamin B6)', amount: 100, unit: 'mg', category: 'B-Vitamin', role: 'Amino acid transamination and neurotransmitter biosynthesis' },
      { name: 'Zinc', amount: 30, unit: 'mg', category: 'Trace Mineral', role: 'Thymulin activation, antiviral defense, and protein synthesis' },
      { name: 'Riboflavin-5-phosphate (Vitamin B2)', amount: 4, unit: 'mg', category: 'B-Vitamin', role: 'FAD/FMN co-enzyme for mitochondrial electron transport chain' },
      { name: 'Hydroxocobalamin (Vitamin B12)', amount: 2, unit: 'mg', category: 'B-Vitamin', role: 'Methylation pathway, red blood cell synthesis, and neuroprotection' }
    ],
    suppliers: ['supplier-magenta'],
    defaultVariantId: 'var-magenta-immune-drip-50ml',
    preferredVariantId: 'var-magenta-immune-drip-50ml',
    variant: {
      id: 'var-magenta-immune-drip-50ml',
      productId: 'immune-support-drip-plus',
      sku: 'RP-MAG-IV-IMMUNE-50ML',
      supplierId: 'supplier-magenta',
      supplierName: 'Magenta Compounding Pharmacy',
      supplier: 'Magenta Compounding Pharmacy',
      supplierCode: 'MAG-IV-IMMUNE-50',
      dosage: '50 mL Infusion',
      dose: '50 mL Infusion',
      scale: '50 mL',
      presentation: 'iv_drip',
      presentationName: 'IV Drip (50 mL)',
      volume_ml: 50,
      totalMg: 10086,
      unitOfMeasure: 'unit',
      moq: 1,
      costCurrency: 'AED',
      originalCurrency: 'AED',
      cost_1: 76.29,
      unit_price: 76.29,
      price: 76.29,
      cost_10: 762.90,
      pricing: {
        master: { perUnit: 76.29, currency: 'USD', costAED: 280.00, originalCostAED: 280.00 },
        clinic: { perUnit: 114.44, clinicPriceAED: 420.00 },
        retail: { perUnit: 190.74, patientPriceAED: 700.00 }
      },
      supplierPricing: {
        currency: 'AED',
        netCost: 76.29,
        costAED: 280.00,
        unitOfMeasure: 'unit',
        moq: 1,
        lastQuotationDate: '2026-09-20'
      },
      leadTime: '🇦🇪 24-48h (Dubai Compounding)',
      supplierLeadTime: '🇦🇪 24-48h (Dubai Compounding)',
      hasCOA: true,
      isDefault: true,
      isPreferred: true
    }
  },
  {
    id: 'longevity-plus-iv-drip',
    slug: 'longevity-plus-iv-drip',
    name: 'Longevity+ IV Drip',
    title: 'Longevity+ IV Drip (50mL)',
    shortDescription: 'Advanced Intravenous Longevity Formulation with 5g Vitamin C, MSM, TMG, Proline, Carnitine & Full Bioactive Methylation Spectrum.',
    description: 'Longevity+ is an advanced parenteral longevity infusion delivering 14,839 mg of active cellular nutrients. Formulated to optimize mitochondrial biogenesis, methylation balance (TMG & Betaine), endogenous glutathione synthesis, and extracellular collagen matrix maintenance.',
    category: 'iv_drips',
    categoryId: 'iv_drips',
    product_type: 'iv_drip',
    primaryType: 'iv_drip',
    availableTypes: ['iv_drip', 'compounding'],
    presentation: 'iv_drip',
    presentationName: 'IV Drip (50 mL)',
    status: 'published',
    visibility: 'public',
    volume_ml: 50,
    routeOfAdministration: 'Intravenous Infusion (IV)',
    infusionProtocol: {
      carrierVolume: '250 mL – 500 mL Sterile 0.9% NaCl or 5% Dextrose',
      durationMinutes: '45 – 60 min',
      infusionRate: '50 – 75 drops/min',
      storageCondition: '2°C – 8°C (Refrigerated). Protect from light.',
      inUseStability: 'Administer within 4 hours of compounding into carrier bag.'
    },
    hasSeparateVial: false,
    clinicalGoals: ['longevity', 'anti_aging', 'cellular_energy', 'methylation', 'mitochondrial_health', 'collagen'],
    totalActiveMg: 14839.1,
    ingredients: [
      { name: 'Ascorbic acid (Vitamin C)', amount: 5000, unit: 'mg', category: 'Vitamin / Antioxidant', role: 'Mitochondrial antioxidant protection and pro-collagen hydroxylation' },
      { name: 'Dimethyl sulfone (MSM)', amount: 3000, unit: 'mg', category: 'Sulfur Donor', role: 'Extracellular matrix synthesis and systemic inflammation modulation' },
      { name: 'Trimethylglycine (TMG / Betaine)', amount: 1200, unit: 'mg', category: 'Methyl Donor', role: 'Homocysteine recycling, cellular osmoregulation, and SAMe synthesis' },
      { name: 'Proline', amount: 1000, unit: 'mg', category: 'Amino Acid', role: 'Key building block for collagen triple-helix structural integrity' },
      { name: 'Magnesium chloride', amount: 600, unit: 'mg', category: 'Mineral / Electrolyte', role: 'Cellular ATP stabilization and vascular smooth muscle relaxation' },
      { name: 'Arginine', amount: 500, unit: 'mg', category: 'Amino Acid', role: 'Nitric oxide (NO) precursor for microvascular endothelial perfusion' },
      { name: 'Dexpanthenol (Vitamin B5)', amount: 500, unit: 'mg', category: 'B-Vitamin', role: 'CoA synthesis and adrenal stress hormone regulation' },
      { name: 'L-Carnitine', amount: 500, unit: 'mg', category: 'Amino Acid Derivative', role: 'Long-chain fatty acid shuttle into mitochondrial matrix for beta-oxidation' },
      { name: 'Lysine', amount: 500, unit: 'mg', category: 'Essential Amino Acid', role: 'Cross-linking of collagen fibers and structural protein renewal' },
      { name: 'Glycine', amount: 250, unit: 'mg', category: 'Amino Acid', role: 'Glutathione substrate and central inhibitory neurotransmission' },
      { name: 'N-Acetylcysteine (NAC)', amount: 250, unit: 'mg', category: 'Antioxidant Precursor', role: 'Cellular redox maintenance and free radical scavenger' },
      { name: 'Taurine', amount: 250, unit: 'mg', category: 'Amino Sulfonic Acid', role: 'Cardioprotection, bile salt conjugation, and calcium homeostasis' },
      { name: 'Thiamine HCl (Vitamin B1)', amount: 250, unit: 'mg', category: 'B-Vitamin', role: 'Carbohydrate fuel metabolism and nerve conduction' },
      { name: 'L-Glutamine', amount: 150, unit: 'mg', category: 'Amino Acid', role: 'Nitrogen transport and cellular repair' },
      { name: 'Pyridoxine (Vitamin B6)', amount: 100, unit: 'mg', category: 'B-Vitamin', role: 'Enzymatic transamination and neurotransmitter balance' },
      { name: 'Zinc', amount: 30, unit: 'mg', category: 'Trace Mineral', role: 'Superoxide dismutase (SOD) co-factor and genomic stabilization' },
      { name: 'Riboflavin (Vitamin B2)', amount: 5, unit: 'mg', category: 'B-Vitamin', role: 'FAD redox cycling and glutathione reductase activation' },
      { name: 'Biotin (Vitamin B7)', amount: 2, unit: 'mg', category: 'B-Vitamin', role: 'Carboxylase enzyme co-factor for keratin and metabolic synthesis' },
      { name: 'Hydroxocobalamin (Vitamin B12)', amount: 1, unit: 'mg', category: 'B-Vitamin', role: 'DNA synthesis and homocysteine remethylation' },
      { name: 'Folic acid / Folate (Vitamin B9)', amount: 1, unit: 'mg', category: 'B-Vitamin', role: 'One-carbon metabolism and nucleotide synthesis' },
      { name: 'Selenium', amount: 0.1, unit: 'mg', category: 'Trace Mineral', role: 'Glutathione peroxidase active catalytic center' }
    ],
    suppliers: ['supplier-magenta'],
    defaultVariantId: 'var-magenta-longevity-drip-50ml',
    preferredVariantId: 'var-magenta-longevity-drip-50ml',
    variant: {
      id: 'var-magenta-longevity-drip-50ml',
      productId: 'longevity-plus-iv-drip',
      sku: 'RP-MAG-IV-LONGEV-50ML',
      supplierId: 'supplier-magenta',
      supplierName: 'Magenta Compounding Pharmacy',
      supplier: 'Magenta Compounding Pharmacy',
      supplierCode: 'MAG-IV-LONGEV-50',
      dosage: '50 mL Infusion',
      dose: '50 mL Infusion',
      scale: '50 mL',
      presentation: 'iv_drip',
      presentationName: 'IV Drip (50 mL)',
      volume_ml: 50,
      totalMg: 14839.1,
      unitOfMeasure: 'unit',
      moq: 1,
      costCurrency: 'AED',
      originalCurrency: 'AED',
      cost_1: 76.29,
      unit_price: 76.29,
      price: 76.29,
      cost_10: 762.90,
      pricing: {
        master: { perUnit: 76.29, currency: 'USD', costAED: 280.00, originalCostAED: 280.00 },
        clinic: { perUnit: 114.44, clinicPriceAED: 420.00 },
        retail: { perUnit: 190.74, patientPriceAED: 700.00 }
      },
      supplierPricing: {
        currency: 'AED',
        netCost: 76.29,
        costAED: 280.00,
        unitOfMeasure: 'unit',
        moq: 1,
        lastQuotationDate: '2026-09-20'
      },
      leadTime: '🇦🇪 24-48h (Dubai Compounding)',
      supplierLeadTime: '🇦🇪 24-48h (Dubai Compounding)',
      hasCOA: true,
      isDefault: true,
      isPreferred: true
    }
  },
  {
    id: 'radiant-skin-plus-iv-drip',
    slug: 'radiant-skin-plus-iv-drip',
    name: 'Radiant Skin+ IV Drip',
    title: 'Radiant Skin+ IV Drip (50mL)',
    shortDescription: 'Targeted Dermatological IV Infusion for Dermal Collagen Induction, Melanin Regulation & Radiant Skin Rejuvenation.',
    description: 'Radiant Skin+ is an intravenous aesthetic formulation designed for medical spas, dermatology practices, and anti-aging clinics. Features 4,000 mg Vitamin C synergistic with NAC, Proline, Niacinamide, Carnitine, Zinc, and Selenium to promote type I/III collagen synthesis and skin radiance.',
    category: 'iv_drips',
    categoryId: 'iv_drips',
    product_type: 'iv_drip',
    primaryType: 'iv_drip',
    availableTypes: ['iv_drip', 'compounding'],
    presentation: 'iv_drip',
    presentationName: 'IV Drip (50 mL)',
    status: 'published',
    visibility: 'public',
    volume_ml: 50,
    routeOfAdministration: 'Intravenous Infusion (IV)',
    infusionProtocol: {
      carrierVolume: '250 mL – 500 mL Sterile 0.9% NaCl or 5% Dextrose',
      durationMinutes: '45 – 60 min',
      infusionRate: '50 – 75 drops/min',
      storageCondition: '2°C – 8°C (Refrigerated). Protect from light.',
      inUseStability: 'Administer within 4 hours of compounding into carrier bag.'
    },
    hasSeparateVial: false,
    clinicalGoals: ['skin_rejuvenation', 'collagen_synthesis', 'dermatology', 'skin_brightening', 'antioxidant'],
    totalActiveMg: 8885.2,
    ingredients: [
      { name: 'Ascorbic acid (Vitamin C)', amount: 4000, unit: 'mg', category: 'Vitamin / Antioxidant', role: 'Dermal fibroblast collagen induction and tyrosinase inhibition' },
      { name: 'Dimethyl sulfone (MSM)', amount: 1000, unit: 'mg', category: 'Sulfur Donor', role: 'Keratin cross-linking and skin barrier support' },
      { name: 'N-Acetylcysteine (NAC)', amount: 1000, unit: 'mg', category: 'Antioxidant Precursor', role: 'Glutathione booster for intracellular skin brightening and radical quenching' },
      { name: 'Proline', amount: 800, unit: 'mg', category: 'Amino Acid', role: 'Dermal elasticity, wound healing, and collagen structure' },
      { name: 'L-Carnitine', amount: 500, unit: 'mg', category: 'Amino Acid Derivative', role: 'Cellular lipid metabolism and microcirculation' },
      { name: 'Magnesium chloride', amount: 500, unit: 'mg', category: 'Mineral / Electrolyte', role: 'Cellular hydration and stress-induced inflammation reduction' },
      { name: 'L-Glutamine', amount: 300, unit: 'mg', category: 'Amino Acid', role: 'Nitrogen balance and rapid tissue remodeling' },
      { name: 'Dexpanthenol (Vitamin B5)', amount: 250, unit: 'mg', category: 'B-Vitamin', role: 'Skin hydration, epithelization, and lipid barrier maintenance' },
      { name: 'Niacinamide (Vitamin B3)', amount: 200, unit: 'mg', category: 'B-Vitamin', role: 'NAD+ precursor, ceramide synthesis, and pigment regulation' },
      { name: 'Lysine', amount: 100, unit: 'mg', category: 'Essential Amino Acid', role: 'Collagen fiber stabilization and tissue repair' },
      { name: 'Pyridoxine (Vitamin B6)', amount: 100, unit: 'mg', category: 'B-Vitamin', role: 'Sebum regulation and amino acid processing' },
      { name: 'Thiamine HCl (Vitamin B1)', amount: 100, unit: 'mg', category: 'B-Vitamin', role: 'Cellular bioenergetics' },
      { name: 'Zinc', amount: 30, unit: 'mg', category: 'Trace Mineral', role: 'Matrix metalloproteinase regulation and skin clarity' },
      { name: 'Riboflavin (Vitamin B2)', amount: 5, unit: 'mg', category: 'B-Vitamin', role: 'Cellular respiration and skin tissue maintenance' },
      { name: 'Selenium', amount: 0.2, unit: 'mg', category: 'Trace Mineral', role: 'Protection against UV-induced oxidative stress' }
    ],
    suppliers: ['supplier-magenta'],
    defaultVariantId: 'var-magenta-radiant-skin-drip-50ml',
    preferredVariantId: 'var-magenta-radiant-skin-drip-50ml',
    variant: {
      id: 'var-magenta-radiant-skin-drip-50ml',
      productId: 'radiant-skin-plus-iv-drip',
      sku: 'RP-MAG-IV-RADIANT-50ML',
      supplierId: 'supplier-magenta',
      supplierName: 'Magenta Compounding Pharmacy',
      supplier: 'Magenta Compounding Pharmacy',
      supplierCode: 'MAG-IV-RADIANT-50',
      dosage: '50 mL Infusion',
      dose: '50 mL Infusion',
      scale: '50 mL',
      presentation: 'iv_drip',
      presentationName: 'IV Drip (50 mL)',
      volume_ml: 50,
      totalMg: 8885.2,
      unitOfMeasure: 'unit',
      moq: 1,
      costCurrency: 'AED',
      originalCurrency: 'AED',
      cost_1: 76.29,
      unit_price: 76.29,
      price: 76.29,
      cost_10: 762.90,
      pricing: {
        master: { perUnit: 76.29, currency: 'USD', costAED: 280.00, originalCostAED: 280.00 },
        clinic: { perUnit: 114.44, clinicPriceAED: 420.00 },
        retail: { perUnit: 190.74, patientPriceAED: 700.00 }
      },
      supplierPricing: {
        currency: 'AED',
        netCost: 76.29,
        costAED: 280.00,
        unitOfMeasure: 'unit',
        moq: 1,
        lastQuotationDate: '2026-09-20'
      },
      leadTime: '🇦🇪 24-48h (Dubai Compounding)',
      supplierLeadTime: '🇦🇪 24-48h (Dubai Compounding)',
      hasCOA: true,
      isDefault: true,
      isPreferred: true
    }
  }
];

async function seedIvDrips() {
  console.log('🚀 Starting ingestion of 3 Magenta IV Drip products into Firestore...');

  for (const item of IV_DRIPS) {
    const { variant, ...productDoc } = item;
    
    // Add embedded variants array for immediate reactivity
    productDoc.variants = [variant];
    productDoc.variantsCount = 1;
    productDoc.updatedAt = new Date().toISOString();
    productDoc.createdAt = new Date().toISOString();

    await db.collection('products').doc(productDoc.id).set(productDoc, { merge: true });
    console.log(`  ✓ Written parent product [${productDoc.id}]`);

    await db.collection('products').doc(productDoc.id).collection('variants').doc(variant.id).set({
      ...variant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log(`    ↳ Written subcollection variant [${variant.id}] (280 AED / $76.29 USD)`);
  }

  console.log('\n🎉 ALL 3 MAGENTA IV DRIPS SUCCESSFULLY INGESTED!');
}

seedIvDrips().catch(err => {
  console.error('❌ Ingestion failed:', err);
  process.exit(1);
});
