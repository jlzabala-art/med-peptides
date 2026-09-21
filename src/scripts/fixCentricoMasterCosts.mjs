/**
 * src/scripts/fixCentricoMasterCosts.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Root Fix for Centrico Supplier Master Costs in Firestore
 *
 * Populates unit_price, cost_1, and pricing.master for all Centrico variants
 * that had clinic/patient prices but missing base costs.
 *
 * Formula:
 * - If supplierPricing.clinicPriceAED exists:
 *     netCostAED = clinicPriceAED / 1.50 (standard 33.3% margin on clinic)
 *     unit_price (USD) = Number((clinic_price / 1.50).toFixed(2))
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'med-peptides-app';
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;

const app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

async function fixCentrico() {
  console.log('🔍 Starting root fix for Centrico supplier costs in Firestore...');
  const snap = await db.collection('products').get();
  let updatedVariants = 0;
  let updatedProducts = 0;

  for (const doc of snap.docs) {
    const data = doc.data();
    let productModified = false;
    const embeddedVariants = data.variants || [];

    // 1. Check embedded variants array
    const newEmbeddedVariants = embeddedVariants.map(v => {
      const supp = (v.supplier || v.supplierName || v.supplierId || '').toLowerCase();
      if (supp.includes('centrico')) {
        const clinicUSD = Number(v.clinic_price || v.pricing?.clinic?.perUnit || 0);
        const clinicAED = Number(v.supplierPricing?.clinicPriceAED || (clinicUSD * 3.67) || 0);
        const currentCost = Number(v.unit_price || v.cost || v.pricing?.master?.perUnit || 0);

        if (currentCost === 0 && (clinicUSD > 0 || clinicAED > 0)) {
          // Standard wholesale base cost: clinic / 1.50
          const calcCostUSD = Number((clinicUSD / 1.50).toFixed(2));
          const calcCostAED = Number((clinicAED / 1.50).toFixed(2));
          const calcWholesaleUSD = Number((clinicUSD / 1.20).toFixed(2));
          const calcWholesaleAED = Number((clinicAED / 1.20).toFixed(2));

          console.log(`  ✓ Fixing embedded Centrico variant in product [${doc.id}]: clinic=$${clinicUSD} (${clinicAED} AED) -> cost=$${calcCostUSD} (${calcCostAED} AED)`);
          productModified = true;
          updatedVariants++;

          return {
            ...v,
            unit_price: calcCostUSD,
            cost: calcCostUSD,
            cost_1: calcCostUSD,
            cost_10: Number((calcCostUSD * 10).toFixed(2)),
            price: v.price || calcCostUSD,
            supplierPricing: {
              ...(v.supplierPricing || {}),
              netCost: calcCostAED,
              currency: 'AED'
            },
            pricing: {
              ...(v.pricing || {}),
              master: {
                perUnit: calcCostUSD,
                kit: Number((calcCostUSD * 10).toFixed(2)),
                currency: 'AED'
              },
              wholesale: {
                perUnit: calcWholesaleUSD,
                kit: Number((calcWholesaleUSD * 10).toFixed(2)),
                currency: 'AED'
              },
              clinic: {
                perUnit: clinicUSD,
                kit: Number((clinicUSD * 10).toFixed(2)),
                currency: 'AED'
              },
              retail: {
                perUnit: Number(v.retail_price || v.pricing?.retail?.perUnit || (clinicUSD * 2).toFixed(2)),
                kit: Number(((v.retail_price || (clinicUSD * 2)) * 10).toFixed(2)),
                currency: 'AED'
              }
            }
          };
        }
      }
      return v;
    });

    // 2. Also check and fix subcollection variants
    const subSnap = await doc.ref.collection('variants').get();
    for (const subDoc of subSnap.docs) {
      const sv = subDoc.data();
      const supp = (sv.supplier || sv.supplierName || sv.supplierId || '').toLowerCase();
      if (supp.includes('centrico')) {
        const clinicUSD = Number(sv.clinic_price || sv.pricing?.clinic?.perUnit || 0);
        const clinicAED = Number(sv.supplierPricing?.clinicPriceAED || (clinicUSD * 3.67) || 0);
        const currentCost = Number(sv.unit_price || sv.cost || sv.pricing?.master?.perUnit || 0);

        if (currentCost === 0 && (clinicUSD > 0 || clinicAED > 0)) {
          const calcCostUSD = Number((clinicUSD / 1.50).toFixed(2));
          const calcCostAED = Number((clinicAED / 1.50).toFixed(2));
          const calcWholesaleUSD = Number((clinicUSD / 1.20).toFixed(2));

          console.log(`    ↳ Updating subcollection doc [${subDoc.id}] for product [${doc.id}]`);
          await subDoc.ref.update({
            unit_price: calcCostUSD,
            cost: calcCostUSD,
            cost_1: calcCostUSD,
            cost_10: Number((calcCostUSD * 10).toFixed(2)),
            'supplierPricing.netCost': calcCostAED,
            'pricing.master.perUnit': calcCostUSD,
            'pricing.master.kit': Number((calcCostUSD * 10).toFixed(2)),
            'pricing.wholesale.perUnit': calcWholesaleUSD,
            'pricing.wholesale.kit': Number((calcWholesaleUSD * 10).toFixed(2))
          });
        }
      }
    }

    if (productModified) {
      await doc.ref.update({ variants: newEmbeddedVariants });
      updatedProducts++;
    }
  }

  console.log(`\n🎉 ROOT FIX COMPLETE! Successfully updated ${updatedVariants} Centrico variants across ${updatedProducts} products in Firestore.`);
}

fixCentrico().catch(err => {
  console.error('Fatal error fixing Centrico costs:', err);
  process.exit(1);
});
