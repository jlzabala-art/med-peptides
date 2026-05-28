/**
 * phase1_masterPrices.mjs
 * 
 * Updates EXISTING products in Firestore:
 *   1. Sets correct `master` tier prices (perUnit + kit) from PDF
 *   2. Adds `supplier: "Med-Peptides"` to product doc metadata
 *   3. Fixes combo product variant labels (e.g. "5mg | 5mg / vial")
 * 
 * Usage: node scripts/phase1_masterPrices.mjs
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sa = require(path.join(__dirname, '../serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(sa) });
}
const db = admin.firestore();

// ── Master price data from PDF (supplier cost = master tier) ─────────────────
// key = Firestore productId, value = { perUnit, kit, dosageLabel (for combos) }
const MASTER_PRICES = {
  // GLP-1 / Weight Loss
  'Retatrutide-10mg-vial':                    { perUnit: 90,  kit: 580  },
  'Tirzepatide-10mg-vial':                    { perUnit: 60,  kit: 390  },
  'Tirzepatide-15mg-vial':                    { perUnit: 90,  kit: 500  },
  'Tirzepatide-30mg-vial':                    { perUnit: 140, kit: 850  },
  'Semaglutide-5mg-vial':                     { perUnit: 38,  kit: 280  },
  'Cagrilintide-5mg-vial':                    { perUnit: 70,  kit: 380  },

  // Healing & Recovery
  'BPC-157-5mg-vial':                         { perUnit: 25,  kit: 150  },
  'AOD-9604-2mg-vial':                        { perUnit: 50,  kit: 280  },
  'TB-500_(Thymosin_β4)-2mg-vial':            { perUnit: 25,  kit: 180  },

  // Combos — include dosageLabel fix
  'GLOW_(BPC-157-TB-500-GHK-Cu)-10-10-75mg-vial': {
    perUnit: 120, kit: 750,
    dosageLabel: '10mg | 10mg | 75mg / vial',
    variantLabel: '10mg | 10mg | 75mg vial',
  },
  'KLOW_(BPC-157-TB-500-GHK-Cu-KPV)-10-10-75-10mg-vial': {
    perUnit: 140, kit: 850,
    dosageLabel: '10mg | 10mg | 75mg | 10mg / vial',
    variantLabel: '10mg | 10mg | 75mg | 10mg vial',
  },

  // Growth Hormone Axis
  'HGH-10iu-vial':                            { perUnit: 30,  kit: 150  },
  'HMG-75iu-vial':                            { perUnit: 30,  kit: 120  },
  'Ipamorelin-2mg-vial':                      { perUnit: 40,  kit: 250  },
  'Hexarelin-2mg-vial':                       { perUnit: 20,  kit: 130  },
  'Sermorelin-2mg-vial':                      { perUnit: 40,  kit: 380  },
  'Tesamorelin-2mg-vial':                     { perUnit: 25,  kit: 180  },
  'GHRP-2-5mg-vial':                          { perUnit: 40,  kit: 200  },
  'CJC-1295_with_DAC-2mg-vial':              { perUnit: 60,  kit: 350  },
  'CJC-1295_without_DAC_(Modified_GRF_1-29)-2mg-vial': { perUnit: 30, kit: 150 },
  'FST-344_(Follistatin)-1mg-vial':           { perUnit: 40,  kit: 250  },
  'IGF-1_LR3-0.1mg-vial':                    { perUnit: 30,  kit: 180  },
  'MK-677_(Ibutamoren)-10mg-vial':            { perUnit: 90,  kit: 480  },

  // Cognitive & Neuro
  'Semax-5mg-vial':                           { perUnit: 30,  kit: 180  },
  'Selank-5mg-vial':                          { perUnit: 30,  kit: 180  },
  'Pinealon-10mg-vial':                       { perUnit: 80,  kit: 80   },
  'DSIP-2mg-vial':                            { perUnit: 70,  kit: 380  },
  'PE-22_28-10mg-vial':                       { perUnit: 60,  kit: 350  },

  // Immune & Thymic
  'Thymosin_Alpha_1-5mg-vial':               { perUnit: 45,  kit: 350  },
  'Thymulin-10mg-vial':                       { perUnit: 90,  kit: 680  },
  'Cartalax-10mg-vial':                       { perUnit: 20,  kit: 100  },
  'Cardiogen-10mg-vial':                      { perUnit: 30,  kit: 160  },
  'Thymagen-10mg-vial':                       { perUnit: 30,  kit: 150  }, // Thymogen in PDF
  'Epithalon-10mg-vial':                      { perUnit: 70,  kit: 380  },
  'KPV-5mg-vial':                             { perUnit: 50,  kit: 270  },
  'Kisspeptin-10-5mg-vial':                  { perUnit: 40,  kit: 200  },

  // Peptide Bioregulators
  'Prostamax-10mg-vial':                      { perUnit: 70,  kit: 380  },
  'Testagen-10mg-vial':                       { perUnit: 70,  kit: 380  },

  // Metabolic & Longevity
  'GHK-Cu_(Copper_Peptide)-50mg-vial':       { perUnit: 60,  kit: 300  },
  'SS-31-10mg-vial':                          { perUnit: 80,  kit: 420  },
  'MOTS-C-10mg-vial':                         { perUnit: 40,  kit: 280  },
  'NMN-50mg-tablet':                          { perUnit: 80,  kit: 580  },
  'NAD+-500mg-vial':                          { perUnit: 30,  kit: 180  },
  'NAD+-1000mg-vial':                         { perUnit: 50,  kit: 280  },

  // Sexual Health
  'PT-141_(Bremelanotide)-10mg-vial':        { perUnit: 25,  kit: 150  },
  'MT2_(Melanotan_II)-10mg-vial':            { perUnit: 30,  kit: 180  },
  'HCG-5000iu-vial':                          { perUnit: 18,  kit: 455  },

  // Other peptides
  'ARA-290-16mg-vial':                        { perUnit: 60,  kit: 300  },
  'PNC-27-5mg-vial':                          { perUnit: 50,  kit: 280  },
  'PEG_MGF-2mg-vial':                         { perUnit: 70,  kit: 380  },
  'Snap-8-10mg-vial':                         { perUnit: 70,  kit: 380  },
  'Oxytocin_Acetate-2mg-vial':               { perUnit: 80,  kit: 380  },
  'SLU_PP-332-50mg-vial':                    { perUnit: 70,  kit: 380  },
  'GW-501516-10mg-vial':                      { perUnit: 30,  kit: 150  },

  // Special / Tablet
  '5-AMINO_1_MQ-50mg-tablet':               { perUnit: 60,  kit: 60   }, // bottle, not kit

  // Accessories (keep existing, no PDF price)
  // 'Bacteriostatic_Water-30ml-vial': skip
  // 'Precision_Insulin_Syringes-Box_of_100': skip
};

// ── Run migration ─────────────────────────────────────────────────────────────
async function main() {
  let updated = 0;
  let skipped = 0;
  const errors = [];

  for (const [productId, priceData] of Object.entries(MASTER_PRICES)) {
    try {
      const productRef = db.collection('products').doc(productId);
      const variantRef = productRef.collection('variants').doc('default');

      // 1. Update product doc: add supplier metadata
      await productRef.update({
        supplier: 'Med-Peptides',
        supplierUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // 2. Update variant: set master tier prices
      const variantUpdate = {
        'pricing.master.perUnit': priceData.perUnit,
        'pricing.master.kit': priceData.kit,
      };

      // Fix combo dosage labels if provided
      if (priceData.dosageLabel) {
        variantUpdate.dosage = priceData.dosageLabel;
        variantUpdate.label = priceData.variantLabel;
        variantUpdate.size = priceData.dosageLabel;
      }

      await variantRef.update(variantUpdate);

      console.log(`✅ ${productId} → master $${priceData.perUnit}/$${priceData.kit}`);
      updated++;
    } catch (e) {
      console.error(`❌ ${productId}: ${e.message}`);
      errors.push(productId);
      skipped++;
    }
  }

  console.log(`\n── Done ──`);
  console.log(`Updated: ${updated} | Skipped/Errors: ${skipped}`);
  if (errors.length) console.log('Errors:', errors);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
