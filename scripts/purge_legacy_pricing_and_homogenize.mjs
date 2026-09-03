import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const app = initializeApp({ credential: cert({
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
}) });
const db = getFirestore(app);

const EUR_TO_USD = 1.09;
const USD_TO_EUR = 0.917;

async function homogenizeAllProductPricing() {
  console.log('==================================================');
  console.log(' PURGING LEGACY PRICING & HOMOGENIZING SCHEMA');
  console.log('==================================================\n');

  const productsSnap = await db.collection('products').get();
  console.log(`Processing ${productsSnap.size} products...\n`);

  let batches = [db.batch()];
  let batchIdx = 0;
  let opCount = 0;
  let updatedCount = 0;

  productsSnap.docs.forEach(doc => {
    const p = doc.data();
    const updates = {};

    // Determine base currency & unit price
    let currency = (p.currency || p.originalCurrency || 'USD').toUpperCase();
    let retailPrice = p.pricing?.retail || 
                      p.originalPrice || 
                      p.retail_unit_price?.EUR || 
                      p.retail_unit_price?.USD || 
                      p.canonical_price_usd || 
                      p.canonical_price_eur ||
                      p.provisional_price_usd ||
                      p.variants?.[0]?.unit_price || null;

    let wholesalePrice = p.pricing?.wholesale || 
                          p.pricing?.volume10Kit || 
                          p.pricing?.supplierCost ||
                          (p.cost_tiers?.cost_10 ? p.cost_tiers.cost_10 / 10 : null) || null;

    if (retailPrice && retailPrice > 0) {
      retailPrice = Math.round(retailPrice * 100) / 100;
      wholesalePrice = wholesalePrice ? Math.round(wholesalePrice * 100) / 100 : Math.round(retailPrice * 0.8 * 100) / 100;
      const clinicPrice = Math.round(retailPrice * 0.85 * 100) / 100;

      // 1. Homogenized 'pricing' object
      updates.currency = currency;
      updates.pricing = {
        retail: retailPrice,
        wholesale: wholesalePrice,
        clinic: clinicPrice,
        supplierCost: p.pricing?.supplierCost || wholesalePrice,
        volume10Kit: wholesalePrice
      };

      // 2. Homogenized 'pricing_tiers' array
      let rawTiers = Array.isArray(p.pricing_tiers) ? p.pricing_tiers : [];
      let homogenizedTiers = [];

      if (rawTiers.length > 0) {
        homogenizedTiers = rawTiers.map(t => {
          const priceVal = t.price || t.price_usd || t.unit_price_eur || t.unit_price || retailPrice;
          return {
            min_qty: t.min_qty || 1,
            max_qty: t.max_qty || null,
            price: Math.round(priceVal * 100) / 100,
            currency: currency
          };
        });
      } else {
        homogenizedTiers = [
          { min_qty: 1, max_qty: 9, price: retailPrice, currency: currency },
          { min_qty: 10, max_qty: null, price: wholesalePrice, currency: currency }
        ];
      }
      updates.pricing_tiers = homogenizedTiers;

      // 3. Homogenized 'pricing_normalized' object
      let usdPrice = currency === 'EUR' ? Math.round(retailPrice * EUR_TO_USD * 100) / 100 : retailPrice;
      let eurPrice = currency === 'USD' ? Math.round(retailPrice * USD_TO_EUR * 100) / 100 : retailPrice;
      updates.pricing_normalized = {
        retail_usd: usdPrice,
        retail_eur: eurPrice
      };

      // 4. Homogenized 'variants' array
      const sId = p.supplierId || 'unknown';
      const sName = p.supplierName || 'Unknown Supplier';

      if (Array.isArray(p.variants) && p.variants.length > 0) {
        updates.variants = p.variants.map((v, idx) => ({
          variantId: v.variantId || `${doc.id}-var-${idx}`,
          label: v.label || `Variant ${idx + 1}`,
          supplierId: sId,
          supplierName: sName,
          presentation: v.presentation || p.presentation || p.dosage_form || 'Vial',
          unit_price: retailPrice,
          pricing_tiers: homogenizedTiers
        }));
      } else {
        updates.variants = [{
          variantId: `${doc.id}-default`,
          label: 'Default Variant',
          supplierId: sId,
          supplierName: sName,
          presentation: p.presentation || p.dosage_form || 'Vial',
          unit_price: retailPrice,
          pricing_tiers: homogenizedTiers
        }];
      }
    } else {
      // Products with no price -> mark as draft
      updates.status = 'draft';
    }

    // 5. PURGE LEGACY FIELDS
    const legacyFieldsToDelete = [
      'supplier',
      'cost_tiers',
      'canonical_price_eur',
      'canonical_price_aed',
      'listed_price_aed',
      'provisional_price_usd',
      'provisional_price_usd_per_mg',
      'originalPrice',
      'originalCurrency',
      'retail_unit_price'
    ];

    legacyFieldsToDelete.forEach(field => {
      if (p[field] !== undefined) {
        updates[field] = FieldValue.delete();
      }
    });

    if (Object.keys(updates).length > 0) {
      batches[batchIdx].update(doc.ref, updates);
      updatedCount++;
      opCount++;

      if (opCount >= 400) {
        batches.push(db.batch());
        batchIdx++;
        opCount = 0;
      }
    }
  });

  if (updatedCount > 0) {
    for (let i = 0; i < batches.length; i++) {
      await batches[i].commit();
    }
    console.log(`✅ Purged legacy fields and homogenized pricing schema for ${updatedCount} products.`);
  } else {
    console.log(`✅ All products already clean and homogenized.`);
  }

  process.exit(0);
}

homogenizeAllProductPricing().catch(console.error);
