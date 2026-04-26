/**
 * comparePdfVsFirebase.mjs
 *
 * Compares the "master" pricing from RegenPept_Portfolio_rev7.pdf
 * against the Firestore `products/{id}/variants` subcollection.
 *
 * The PDF contains RETAIL prices (per vial + per kit of 10).
 * We compare against the `retail` tier in Firestore.
 *
 * Usage:
 *   node scripts/comparePdfVsFirebase.mjs
 */

import admin from 'firebase-admin';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// ── Firebase Init ─────────────────────────────────────────────────────────────
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── PDF Master Pricing (extracted from RegenPept_Portfolio_rev7.pdf) ──────────
// Format: { productName, dosage, perVial (USD), perKit (USD) }
// The PDF lists RETAIL prices. Dosage format matches variant labels in Firestore.
const PDF_PRICES = [
  // Page 1 products
  { product: 'Retatrutide',                dosage: '10mg',      perVial: 90,  perKit: 580  },
  { product: 'Retatrutide',                dosage: '15mg',      perVial: 120, perKit: 720  },
  { product: 'Retatrutide',                dosage: '20mg',      perVial: 130, perKit: 850  },
  { product: 'Tirzepatide',                dosage: '5mg',       perVial: 40,  perKit: 280  },
  { product: 'Tirzepatide',                dosage: '10mg',      perVial: 60,  perKit: 390  },
  { product: 'Tirzepatide',                dosage: '15mg',      perVial: 90,  perKit: 500  },
  { product: 'Tirzepatide',                dosage: '30mg',      perVial: 140, perKit: 850  },
  { product: 'Tirzepatide',                dosage: '60mg',      perVial: 270, perKit: 1550 },
  { product: 'Semaglutide',               dosage: '2mg',       perVial: 25,  perKit: 150  },
  { product: 'Semaglutide',               dosage: '5mg',       perVial: 38,  perKit: 280  },
  { product: 'Semaglutide',               dosage: '10mg',      perVial: 70,  perKit: 400  },
  { product: 'AOD-9604',                   dosage: '2mg',       perVial: 50,  perKit: 280  },
  { product: 'AOD-9604',                   dosage: '5mg',       perVial: 90,  perKit: 480  },
  { product: 'ARA-290',                    dosage: '10mg',      perVial: 60,  perKit: 300  },
  { product: 'BPC-157',                    dosage: '2mg',       perVial: 15,  perKit: 90   },
  { product: 'BPC-157',                    dosage: '5mg',       perVial: 25,  perKit: 150  },
  { product: 'BPC-157',                    dosage: '10mg',      perVial: 40,  perKit: 250  },
  { product: 'CJC-1295 with DAC',          dosage: '20mg',      perVial: 60,  perKit: 350  },
  { product: 'CJC-1295 without DAC + Ipamorelin', dosage: '5mg|5mg', perVial: 70, perKit: 380 },
  { product: 'CJC-1295 without DAC + Ipamorelin', dosage: '10mg|10mg', perVial: 130, perKit: 650 },
  { product: '5-Amino-1MQ',               dosage: '2mg',       perVial: 30,  perKit: 150  },
  { product: 'CJC-1295 without DAC',       dosage: '10mg',      perVial: 30,  perKit: 150  },
  { product: 'Cartalax',                   dosage: '2mg',       perVial: 20,  perKit: 100  },
  { product: 'Cardiogen',                  dosage: '5mg',       perVial: 30,  perKit: 160  },
  { product: 'Thymogen',                   dosage: '10mg',      perVial: 50,  perKit: 270  },
  { product: 'BPC-157 + TB-500',           dosage: '5mg|5mg',   perVial: 90,  perKit: 480  },
  { product: 'Prostamax',                  dosage: '25mg',      perVial: 70,  perKit: 380  },
  { product: 'Testagen',                   dosage: '25mg',      perVial: 70,  perKit: 380  },
  { product: 'Cagrilintide',               dosage: '25mg',      perVial: 70,  perKit: 380  },
  { product: 'DSIP',                       dosage: '25mg',      perVial: 70,  perKit: 380  },
  { product: 'Epithalon',                  dosage: '25mg',      perVial: 70,  perKit: 380  },
  { product: 'FST344',                     dosage: '5mg',       perVial: 40,  perKit: 250  },
  { product: 'FST344',                     dosage: '10mg',      perVial: 80,  perKit: 450  },
  { product: 'GHK-Cu',                     dosage: '2mg',       perVial: 40,  perKit: 200  },
  { product: 'GHK-Cu',                     dosage: '5mg',       perVial: 60,  perKit: 300  },
  { product: 'GHRP-2',                     dosage: '10mg',      perVial: 40,  perKit: 200  },
  { product: 'GLOW',                       dosage: '1mg',       perVial: 90,  perKit: 130  }, // note: kit price from PDF
  { product: 'GLOW',                       dosage: '50mg',      perVial: 25,  perKit: 130  },
  { product: 'GLOW',                       dosage: '100mg',     perVial: 45,  perKit: 220  },
  { product: 'hCG',                        dosage: '5000iu',    perVial: 18,  perKit: 750  }, // verify
  { product: 'KLOW',                       dosage: '10mg|10mg|75mg', perVial: 120, perKit: 750 },
  { product: 'KLOW',                       dosage: '10mg|10mg|75mg|10mg', perVial: 140, perKit: 850 },
  { product: 'hCG',                        dosage: '10000iu',   perVial: null, perKit: 585 }, // 2nd hCG kit
  // Page 2 products
  { product: 'Hexarelin',                  dosage: '2mg',       perVial: 20,  perKit: 130  },
  { product: 'Hexarelin',                  dosage: '5mg',       perVial: 40,  perKit: 260  },
  { product: 'HGH',                        dosage: '10iu',      perVial: 30,  perKit: 150  },
  { product: 'HMG',                        dosage: '75iu',      perVial: 30,  perKit: 120  },
  { product: 'IGF LR3',                    dosage: '0.1mg',     perVial: 30,  perKit: 180  },
  { product: 'Ipamorelin',                 dosage: '10mg',      perVial: 35,  perKit: 260  },
  { product: 'Ipamorelin',                 dosage: '5mg',       perVial: 40,  perKit: 250  },
  { product: 'MT2',                        dosage: '10mg',      perVial: 30,  perKit: 180  },
  { product: 'NAD+',                       dosage: '12mg',      perVial: 120, perKit: 120  }, // bottle
  { product: 'NAD+',                       dosage: '10mg',      perVial: 80,  perKit: 80   }, // bottle
  { product: 'Pinealon',                   dosage: '250mcg',    perVial: 80,  perKit: 80   }, // bottle
  { product: 'PNC-27',                     dosage: '5mg',       perVial: 50,  perKit: 280  },
  { product: 'PEG-MGF',                    dosage: '10mg',      perVial: 70,  perKit: 380  },
  { product: 'PT-141',                     dosage: '10mg',      perVial: 25,  perKit: 150  },
  { product: 'Selank',                     dosage: '500mg',     perVial: 30,  perKit: 180  },
  { product: 'Selank',                     dosage: '1000mg',    perVial: 50,  perKit: 280  },
  { product: '5-Amino-1MQ',               dosage: '50mg',      perVial: 60,  perKit: 60   }, // tablet, bottle
  { product: 'Semax',                      dosage: '2mg',       perVial: 30,  perKit: 180  },
  { product: 'Sermorelin',                 dosage: '16mg',      perVial: 40,  perKit: 380  },
  { product: 'Snap-8',                     dosage: '10mg',      perVial: 70,  perKit: 380  },
  { product: 'SS-31',                      dosage: '10mg',      perVial: 80,  perKit: 420  },
  { product: 'Thymulin',                   dosage: '5mg',       perVial: 90,  perKit: 680  },
  { product: 'Tesamorelin',               dosage: '5mg',       perVial: 25,  perKit: 180  },
  { product: 'Thymosin Alpha 1',           dosage: '10mg',      perVial: 45,  perKit: 350  },
  { product: 'Thymosin β4 (TB-500)',      dosage: '5mg',       perVial: 25,  perKit: 180  },
  { product: 'Thymosin β4 (TB-500)',      dosage: '10mg',      perVial: 90,  perKit: 600  },
  { product: 'Kisspeptin-10',              dosage: '10mg',      perVial: 40,  perKit: 200  },
  { product: 'KPV',                        dosage: '5mg',       perVial: 50,  perKit: 270  },
  { product: 'MK-677',                     dosage: '10mg',      perVial: 90,  perKit: 480  },
  { product: 'GW501516',                   dosage: '10mg',      perVial: 30,  perKit: 150  },
  { product: 'SLU-PP-332',                 dosage: '10mg',      perVial: 70,  perKit: 380  },
  { product: 'MOTS-C',                     dosage: '10mg',      perVial: 40,  perKit: 280  },
  { product: 'NMN',                        dosage: '10mg',      perVial: 80,  perKit: 580  },
  { product: 'Oxytocin Acetate',           dosage: '10mg',      perVial: 80,  perKit: 380  },
  { product: 'PE 22-28',                   dosage: '2mg',       perVial: 25,  perKit: 145  },
  { product: 'PE 22-28',                   dosage: '5mg',       perVial: 35,  perKit: 200  },
  { product: 'PE 22-28',                   dosage: '10mg',      perVial: 60,  perKit: 350  },
];

// ── Firestore Fetch ───────────────────────────────────────────────────────────
async function fetchAllVariants() {
  const productsSnap = await db.collection('products').get();
  const results = [];

  for (const productDoc of productsSnap.docs) {
    const productData = productDoc.data();
    const variantsSnap = await db
      .collection('products')
      .doc(productDoc.id)
      .collection('variants')
      .get();

    for (const variantDoc of variantsSnap.docs) {
      const v = variantDoc.data();
      results.push({
        productId: productDoc.id,
        productName: productData.name || productData.title || productDoc.id,
        variantId: variantDoc.id,
        dosage: v.dosage || v.strength || variantDoc.id,
        // Firestore retail pricing
        retailPerUnit: v.pricing?.retail?.perUnit ?? null,
        retailKit: v.pricing?.retail?.kit ?? null,
        // Master pricing
        masterPerUnit: v.pricing?.master?.perUnit ?? null,
        masterKit: v.pricing?.master?.kit ?? null,
      });
    }
  }
  return results;
}

// ── Normalize helpers ─────────────────────────────────────────────────────────
function normalizeName(s) {
  return (s || '').toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/tbfive|tb500/g, 'tb500')
    .replace(/thymosinbeta4/g, 'tb500');
}

function normalizeDosage(s) {
  return (s || '').toLowerCase()
    .replace(/\s+/g, '')
    .replace(/mcg/g, 'mcg')
    .replace(/\//g, '|');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Fetching Firestore variants…\n');
  const firestoreVariants = await fetchAllVariants();

  const issues = [];
  const matched = [];
  const pdNotInDb = [];

  for (const pdfEntry of PDF_PRICES) {
    const pdfNameNorm = normalizeName(pdfEntry.product);
    const pdfDosageNorm = normalizeDosage(pdfEntry.dosage);

    // Try to find the matching Firestore variant
    const candidates = firestoreVariants.filter(fv => {
      const dbNameNorm = normalizeName(fv.productName);
      const dbDosageNorm = normalizeDosage(fv.dosage);
      const nameMatch = dbNameNorm.includes(pdfNameNorm) || pdfNameNorm.includes(dbNameNorm);
      const dosageMatch = dbDosageNorm === pdfDosageNorm || dbDosageNorm.includes(pdfDosageNorm) || pdfDosageNorm.includes(dbDosageNorm);
      return nameMatch && dosageMatch;
    });

    if (candidates.length === 0) {
      pdNotInDb.push({ ...pdfEntry, note: 'NOT FOUND IN FIRESTORE' });
      continue;
    }

    for (const fv of candidates) {
      const priceIssues = [];
      // Compare perVial (PDF retail ↔ Firestore retail.perUnit)
      if (pdfEntry.perVial !== null && fv.retailPerUnit === null) {
        priceIssues.push(`retail.perUnit missing (PDF says $${pdfEntry.perVial})`);
      } else if (pdfEntry.perVial !== null && Math.abs(fv.retailPerUnit - pdfEntry.perVial) > 0.5) {
        priceIssues.push(`retail.perUnit mismatch: DB=$${fv.retailPerUnit} PDF=$${pdfEntry.perVial}`);
      }
      // Compare kit
      if (pdfEntry.perKit !== null && fv.retailKit === null) {
        priceIssues.push(`retail.kit missing (PDF says $${pdfEntry.perKit})`);
      } else if (pdfEntry.perKit !== null && Math.abs(fv.retailKit - pdfEntry.perKit) > 0.5) {
        priceIssues.push(`retail.kit mismatch: DB=$${fv.retailKit} PDF=$${pdfEntry.perKit}`);
      }

      if (priceIssues.length > 0) {
        issues.push({
          productName: fv.productName,
          variantId: fv.variantId,
          dosage: fv.dosage,
          issues: priceIssues,
          pdfPerVial: pdfEntry.perVial,
          pdfPerKit: pdfEntry.perKit,
          dbRetailPerUnit: fv.retailPerUnit,
          dbRetailKit: fv.retailKit,
        });
      } else {
        matched.push({ productName: fv.productName, dosage: fv.dosage });
      }
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ MATCHED (no pricing discrepancies): ${matched.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  matched.forEach(m => console.log(`  ✓ ${m.productName} — ${m.dosage}`));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`❌ PRICING ISSUES: ${issues.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  issues.forEach(i => {
    console.log(`\n  🔴 ${i.productName} [${i.dosage}]`);
    i.issues.forEach(iss => console.log(`       → ${iss}`));
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`⚠️  PDF PRODUCTS NOT FOUND IN FIRESTORE: ${pdNotInDb.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  pdNotInDb.forEach(p => console.log(`  ⚠️  ${p.product} — ${p.dosage} ($${p.perVial}/${p.perKit})`));

  // ── Firestore-only entries (not in PDF) ─────────────────────────────────────
  const pdfProductNames = new Set(PDF_PRICES.map(p => normalizeName(p.product)));
  const dbOnlyVariants = firestoreVariants.filter(fv => {
    const dbNameNorm = normalizeName(fv.productName);
    return ![...pdfProductNames].some(pn => dbNameNorm.includes(pn) || pn.includes(dbNameNorm));
  });

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`ℹ️  FIRESTORE PRODUCTS NOT IN PDF: ${dbOnlyVariants.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  const seen = new Set();
  dbOnlyVariants.forEach(v => {
    const key = `${v.productName}|${v.dosage}`;
    if (!seen.has(key)) {
      seen.add(key);
      console.log(`  ℹ️  ${v.productName} [${v.dosage}] — retailPerUnit=$${v.retailPerUnit} retailKit=$${v.retailKit}`);
    }
  });

  console.log('\nDone.');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
