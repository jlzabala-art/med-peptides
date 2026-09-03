/**
 * migrate_prefill_pens_single_cartridge.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Migration script to backfill existing prefilled pen variants with the
 * canonical single_cartridge penConfig data structure.
 *
 * Usage:
 *   node src/scripts/migrate_prefill_pens_single_cartridge.js --dry-run
 *   node src/scripts/migrate_prefill_pens_single_cartridge.js --execute
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';

const isDryRun = !process.argv.includes('--execute');

// Initialize Firebase Admin
if (!getApps().length) {
  const serviceAccountPath = path.resolve(process.cwd(), 'serviceAccount-target.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

function parseStrengthMg(dosageStr) {
  if (!dosageStr) return null;
  const match = String(dosageStr).match(/(\d+(?:\.\d+)?)\s*mg/i);
  return match ? parseFloat(match[1]) : null;
}

function parseVolumeMl(presentationStr) {
  if (!presentationStr) return 3.0;
  const match = String(presentationStr).match(/(\d+(?:\.\d+)?)\s*ml/i);
  return match ? parseFloat(match[1]) : 3.0;
}

async function migratePrefillPens() {
  console.log(`\n======================================================`);
  console.log(`🚀 MIGRATION: Prefill Pens -> single_cartridge config`);
  console.log(`Mode: ${isDryRun ? '🔍 DRY RUN (no writes)' : '⚡ LIVE EXECUTION'}`);
  console.log(`======================================================\n`);

  const productsSnap = await db.collection('products').get();
  console.log(`Found ${productsSnap.size} total products in Firestore.`);

  let matchedProductsCount = 0;
  let updatedVariantsCount = 0;

  for (const doc of productsSnap.docs) {
    const pData = doc.data();
    let hasModifications = false;

    // Check if variants exist as embedded array
    if (Array.isArray(pData.variants) && pData.variants.length > 0) {
      const updatedVariants = pData.variants.map((v) => {
        const fmt = (v.format || v.presentation || '').toLowerCase();
        const isPen = fmt.includes('pen') || fmt.includes('prefilled') || v.route === 'injectable_pen';

        if (isPen && !v.penConfig) {
          const volumeMl = parseVolumeMl(v.presentation || v.format || v.unit);
          const strengthMg = parseStrengthMg(v.dosage || v.dose || v.strength?.dosageLabel || pData.dosage);

          const penConfig = {
            cartridgeType: 'single_cartridge',
            chamberCount: 1,
            totalVolumeMl: volumeMl,
            chambers: [
              {
                chamberIndex: 1,
                role: 'active_solution',
                substanceName: pData.name || 'Active Peptide',
                strengthMg: strengthMg || 0,
                volumeMl: volumeMl,
                concentrationMgMl: strengthMg ? parseFloat((strengthMg / volumeMl).toFixed(2)) : 0
              }
            ],
            dosingSpecs: {
              clicksPerMl: 100,
              unitsPerClick: 0.01,
              maxDosePerInjectionMl: 0.6,
              reconstitutionRequired: false
            }
          };

          updatedVariantsCount++;
          hasModifications = true;
          return {
            ...v,
            format: 'pre_filled_pen',
            penConfig
          };
        }
        return v;
      });

      if (hasModifications) {
        matchedProductsCount++;
        console.log(`[Product] ${pData.name || doc.id}: updating ${updatedVariants.filter(v => v.penConfig).length} pen variant(s)`);
        if (!isDryRun) {
          await doc.ref.update({
            variants: updatedVariants,
            updatedAt: new Date()
          });
        }
      }
    }

    // Check subcollection variants if any
    const subVariantsSnap = await doc.ref.collection('variants').get();
    if (!subVariantsSnap.empty) {
      for (const vDoc of subVariantsSnap.docs) {
        const v = vDoc.data();
        const fmt = (v.format || v.presentation || '').toLowerCase();
        const isPen = fmt.includes('pen') || fmt.includes('prefilled') || v.route === 'injectable_pen';

        if (isPen && !v.penConfig) {
          const volumeMl = parseVolumeMl(v.presentation || v.format || v.unit);
          const strengthMg = parseStrengthMg(v.dosage || v.dose || v.strength?.dosageLabel || pData.dosage);

          const penConfig = {
            cartridgeType: 'single_cartridge',
            chamberCount: 1,
            totalVolumeMl: volumeMl,
            chambers: [
              {
                chamberIndex: 1,
                role: 'active_solution',
                substanceName: pData.name || 'Active Peptide',
                strengthMg: strengthMg || 0,
                volumeMl: volumeMl,
                concentrationMgMl: strengthMg ? parseFloat((strengthMg / volumeMl).toFixed(2)) : 0
              }
            ],
            dosingSpecs: {
              clicksPerMl: 100,
              unitsPerClick: 0.01,
              maxDosePerInjectionMl: 0.6,
              reconstitutionRequired: false
            }
          };

          updatedVariantsCount++;
          console.log(`  [Subvariant] ${vDoc.id} in ${doc.id}: adding single_cartridge penConfig`);
          if (!isDryRun) {
            await vDoc.ref.update({
              format: 'pre_filled_pen',
              penConfig,
              updatedAt: new Date()
            });
          }
        }
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`✅ Summary:`);
  console.log(`   Products with Pen Variants : ${matchedProductsCount}`);
  console.log(`   Total Pen Variants Configured: ${updatedVariantsCount}`);
  console.log(`======================================================\n`);
}

migratePrefillPens().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
