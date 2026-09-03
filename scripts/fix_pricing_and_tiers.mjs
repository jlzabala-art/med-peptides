import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
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

const TARGET_SUPPLIERS = ['supplier-nplabs', 'supplier-europeptides', 'supplier-vallida', 'supplier-bioniq', 'supplier-lotusland'];

async function fixPricingAndTiers() {
  console.log('=== UNIFYING UNIT PRICES AND PRICING TIERS FOR ALL IMPORTED PRODUCTS ===\n');

  const productsSnap = await db.collection('products').get();
  let batches = [db.batch()];
  let batchIdx = 0;
  let opCount = 0;
  let updatedCount = 0;

  productsSnap.docs.forEach(doc => {
    const p = doc.data();
    const sId = p.supplierId;

    if (!TARGET_SUPPLIERS.includes(sId)) return;

    let updates = {};

    // 1. Resolve unit price
    let unitPrice = p.pricing?.retail || 
                    p.originalPrice || 
                    p.retail_unit_price?.EUR || 
                    p.retail_unit_price?.USD || 
                    p.canonical_price_usd || 
                    p.variants?.[0]?.unit_price;

    let wholesalePrice = p.pricing?.wholesale || 
                        p.pricing?.volume10Kit || 
                        p.pricing?.supplierCost ||
                        (p.cost_tiers?.cost_10 ? p.cost_tiers.cost_10 / 10 : null);

    // If product has no price anywhere, mark as draft
    if (!unitPrice || unitPrice <= 0) {
      if (p.status !== 'draft') {
        updates.status = 'draft';
        console.log(`⚠️ Product "${p.name}" (${doc.id}) has no valid price -> set status to 'draft'`);
      }
    } else {
      // Ensure pricing object is fully populated
      const newPricing = {
        retail: unitPrice,
        wholesale: wholesalePrice || Math.round(unitPrice * 0.8 * 100) / 100,
        supplierCost: p.pricing?.supplierCost || wholesalePrice || null,
        clinic: p.pricing?.clinic || Math.round(unitPrice * 0.85 * 100) / 100,
        volume10Kit: wholesalePrice || null
      };

      if (JSON.stringify(p.pricing) !== JSON.stringify(newPricing)) {
        updates.pricing = newPricing;
        updates.originalPrice = unitPrice;
      }

      // 2. Ensure pricing_tiers array is standardized
      let tiers = Array.isArray(p.pricing_tiers) && p.pricing_tiers.length > 0 ? [...p.pricing_tiers] : [];

      if (tiers.length === 0) {
        tiers = [
          { min_qty: 1, max_qty: 9, price: unitPrice },
          { min_qty: 10, max_qty: null, price: wholesalePrice || Math.round(unitPrice * 0.8 * 100) / 100 }
        ];
        updates.pricing_tiers = tiers;
      }

      // 3. Ensure variants array is synced with unit price and tiers
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        let variantsChanged = false;
        const newVariants = p.variants.map((v, idx) => {
          const nv = { ...v };
          if (!nv.unit_price || nv.unit_price <= 0 || nv.unit_price !== unitPrice) {
            nv.unit_price = unitPrice;
            variantsChanged = true;
          }
          if (!nv.supplierId || nv.supplierId !== sId) {
            nv.supplierId = sId;
            nv.supplier = p.supplierName || sId;
            variantsChanged = true;
          }
          if (!nv.pricing_tiers || nv.pricing_tiers.length === 0) {
            nv.pricing_tiers = tiers;
            variantsChanged = true;
          }
          return nv;
        });

        if (variantsChanged) {
          updates.variants = newVariants;
        }
      } else {
        // Create default variant if missing
        updates.variants = [{
          variantId: `${doc.id}-default`,
          label: 'Default Variant',
          supplierId: sId,
          supplier: p.supplierName || sId,
          presentation: p.presentation || p.dosage_form || 'Vial',
          unit_price: unitPrice,
          pricing_tiers: tiers
        }];
      }
    }

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
    console.log(`✅ Successfully normalized pricing & tiers for ${updatedCount} products.`);
  } else {
    console.log(`✅ All products already have unified pricing and tiers.`);
  }

  process.exit(0);
}

fixPricingAndTiers().catch(console.error);
