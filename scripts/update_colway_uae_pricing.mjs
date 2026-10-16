/**
 * update_colway_uae_pricing.mjs
 * 
 * Sets official UAE Landed Costs and 15% Wholesaler Markup for Colway products in Firestore.
 * Costs provided by Reimichon Shangchiri (landed cost without VAT in UAE):
 * 1. Shampoo = AED 100 -> Wholesale (+15%) = AED 115.00
 * 2. Conditioner = AED 100 -> Wholesale (+15%) = AED 115.00
 * 3. Blue Line Cream = AED 220 -> Wholesale (+15%) = AED 253.00
 * 4. Blue Line Peeling = AED 115 -> Wholesale (+15%) = AED 132.25
 * 5. Lip Balm = AED 15 -> Wholesale (+15%) = AED 17.25
 * 6. Washing Gel = AED 100 -> Wholesale (+15%) = AED 115.00
 * + Duo Pack (Trichology) = AED 200 -> Wholesale (+15%) = AED 230.00
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const COLWAY_UAE_DATA = {
  'colway-strengthening-shampoo': {
    name: 'Colway Strengthening Hair Shampoo',
    volume: '250 mL',
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180,
    sku: 'SKU-COLWAY-STR-SHAMPOO-250',
    category: 'Trichology & Scalp'
  },
  'colway-strengthening-conditioner': {
    name: 'Colway Strengthening Hair Conditioner',
    volume: '200 mL',
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 180,
    sku: 'SKU-COLWAY-STR-COND-200',
    category: 'Trichology & Scalp'
  },
  'colway-blue-diamond-cream': {
    name: 'Colway Blue Diamond Cream (Krem Niebieski Diament)',
    volume: '50 mL',
    landedCostAed: 220,
    wholesalePriceAed: 253,
    clinicPriceAed: 320,
    retailPriceAed: 395,
    sku: 'SKU-COLWAY-BLUEDIAMOND-50',
    category: 'Advanced Cellular Anti-Aging'
  },
  'colway-blue-diamond-peeling': {
    name: 'Colway Blue Diamond Peeling (Peeling Niebieski Diament)',
    volume: '75 mL',
    landedCostAed: 115,
    wholesalePriceAed: 132.25,
    clinicPriceAed: 175,
    retailPriceAed: 220,
    sku: 'SKU-COLWAY-BLUEDIAMOND-PEELING-75',
    category: 'Exfoliation & Cellular Renewal'
  },
  'colway-collagen-lip-care': {
    name: 'Colway Bioactive Collagen Lip Care',
    volume: '4.5 g (Individual Stick)',
    landedCostAed: 15,
    wholesalePriceAed: 17.25,
    clinicPriceAed: 25,
    retailPriceAed: 35,
    sku: 'SKU-COLWAY-LIP-CARE',
    category: 'Bioactive Barrier Care'
  },
  'colway-collagen-wash-gel': {
    name: 'Colway Cellular Collagen Hydrolipid Wash Gel',
    volume: '250 mL',
    landedCostAed: 100,
    wholesalePriceAed: 115,
    clinicPriceAed: 145,
    retailPriceAed: 185,
    sku: 'SKU-COLWAY-WASH-250',
    category: 'Cellular Cleansing'
  },
  'colway-trichology': {
    name: 'Colway Trichology Hair Strengthening System (2-Step Duo)',
    volume: '450 mL Total (250mL + 200mL)',
    landedCostAed: 200,
    wholesalePriceAed: 230,
    clinicPriceAed: 280,
    retailPriceAed: 340,
    sku: 'SKU-COLWAY-TRICHOLOGY-DUO',
    category: 'Trichology & Scalp System'
  }
};

async function updateColwayPricing() {
  console.log('🇦🇪 Updating Colway UAE Landed Costs & 15% Wholesaler Markup in Firestore...\n');

  for (const [docId, config] of Object.entries(COLWAY_UAE_DATA)) {
    const docRef = db.collection('products').doc(docId);
    const snap = await docRef.get();

    if (!snap.exists) {
      console.warn(`⚠️ Document not found: ${docId}`);
      continue;
    }

    const currentData = snap.data();
    const existingVariants = Array.isArray(currentData.variants) ? currentData.variants : [];

    const updatedVariants = existingVariants.map((v, idx) => {
      return {
        ...v,
        cost: config.landedCostAed,
        wholesale_price: config.wholesalePriceAed,
        wholesalePrice: config.wholesalePriceAed,
        price: config.retailPriceAed,
        unit_price: config.retailPriceAed,
        currency: 'AED',
        pricing: {
          ...(v.pricing || {}),
          master: { perUnit: config.landedCostAed, currency: 'AED' },
          wholesale: { perUnit: config.wholesalePriceAed, currency: 'AED', markup: 0.15 },
          clinic: { perUnit: config.clinicPriceAed, currency: 'AED' },
          retail: { perUnit: config.retailPriceAed, currency: 'AED' }
        }
      };
    });

    const updatePayload = {
      cost: config.landedCostAed,
      landed_cost: config.landedCostAed,
      landedCost: config.landedCostAed,
      landedCostAed: config.landedCostAed,
      wholesale_price: config.wholesalePriceAed,
      wholesalePrice: config.wholesalePriceAed,
      wholesalePriceAed: config.wholesalePriceAed,
      wholesaler_markup_pct: 15,
      wholesalerMarkupPct: 15,
      clinicPriceAed: config.clinicPriceAed,
      retailPriceAed: config.retailPriceAed,
      currency: 'AED',
      pricing_uae: {
        landedCostAed: config.landedCostAed,
        wholesalePriceAed: config.wholesalePriceAed,
        wholesalerMarkupPct: 15,
        marginAed: Number((config.wholesalePriceAed - config.landedCostAed).toFixed(2)),
        clinicPriceAed: config.clinicPriceAed,
        retailPriceAed: config.retailPriceAed,
        vatRatePct: 5,
        vatExcl: true,
        currency: 'AED',
        source: 'Reimichon Shangchiri — Landed Cost CIF Dubai/UAE',
        effectiveDate: '2026-10-16'
      },
      variants: updatedVariants,
      updated_at: FieldValue.serverTimestamp(),
      updatedAt: new Date().toISOString()
    };

    await docRef.update(updatePayload);
    console.log(`✅ Updated ${docId}:`);
    console.log(`   Landed Cost: AED ${config.landedCostAed.toFixed(2)} | Wholesaler (+15%): AED ${config.wholesalePriceAed.toFixed(2)} | Margin: AED ${(config.wholesalePriceAed - config.landedCostAed).toFixed(2)}`);
  }

  console.log('\n🎉 All 7 Colway products successfully updated with UAE Landed Costs and 15% Wholesaler Markup!');
}

updateColwayPricing().catch(err => {
  console.error('❌ Error updating Colway pricing:', err);
  process.exit(1);
});
