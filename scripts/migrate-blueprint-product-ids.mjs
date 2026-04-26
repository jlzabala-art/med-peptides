/**
 * migrate-blueprint-product-ids.mjs
 * 
 * One-time migration script: adds `productId` field to every drug entry
 * in every blueprint document in Firestore. This makes the Supply Engine
 * lookup direct and permanent, with no runtime slug-mapping needed.
 *
 * Run: node scripts/migrate-blueprint-product-ids.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load credentials ────────────────────────────────────────────────────────
// Priority: GOOGLE_APPLICATION_CREDENTIALS env var → local service-account.json → ADC
import { applicationDefault } from 'firebase-admin/app';

let appConfig = {};
try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const sa = JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
    appConfig = { credential: cert(sa) };
    console.log('✅ Using GOOGLE_APPLICATION_CREDENTIALS');
  } else {
    const saPath = resolve(__dirname, '../service-account.json');
    const sa = JSON.parse(readFileSync(saPath, 'utf8'));
    appConfig = { credential: cert(sa) };
    console.log('✅ Using service-account.json');
  }
} catch {
  // Fall back to Application Default Credentials (works with `firebase login --reauth`)
  appConfig = { credential: applicationDefault(), projectId: 'med-peptides-app' };
  console.log('✅ Using Application Default Credentials (ADC)');
}

initializeApp(appConfig);
const db = getFirestore();

// ─── Canonical slug → productId mapping ─────────────────────────────────────
// These are the PERMANENT product document IDs in the `products` collection.
const SLUG_TO_PRODUCT_ID = {
  // Cognitive / Neuro
  'semax':                   'Semax-30mg-vial',
  'selank':                  'Selank-30mg-vial',
  'pinealon':                'Pinealon-10mg-vial',
  'dsip':                    'DSIP-2mg-vial',

  // Mitochondrial / Anti-aging
  'ss-31':                   'SS-31-5mg-vial',
  'mots-c':                  'MOTS-C-10mg-vial',
  'epithalon':               'Epithalon-10mg-vial',

  // Metabolic / Body composition
  'aod-9604':                'AOD-9604-5mg-vial',
  'tesamorelin':             'Tesamorelin-2mg-vial',
  'ipamorelin':              'Ipamorelin-5mg-vial',
  'cjc-1295-ipamorelin':     'CJC-1295_without_DAC_Ipamorelin-5-5mg-vial',
  'cjc-1295':                'CJC-1295_without_DAC_Ipamorelin-5-5mg-vial',
  'retatrutide':             'Retatrutide-10mg-vial',
  'nmn':                     'NMN-50mg-tablet',

  // Immune / Recovery
  'thymosin-alpha-1':        'Thymosin_Alpha1-6mg-vial',
  'thymosin_alpha1':         'Thymosin_Alpha1-6mg-vial',
  'thymosin-alpha1':         'Thymosin_Alpha1-6mg-vial',
  'kpv':                     'KPV-5mg-vial',
  'bpc-157':                 'BPC-157-5mg-vial',
  'tb-500':                  'TB-500-5mg-vial',
  'bpc-157-tb-500':          'BPC-157_TB-500-5-5mg-vial',
  'ghk-cu':                  'GHK-Cu_(Copper_Peptide)-5mg-vial',
  'ara-290':                 'ARA-290-16mg-vial',
};

// ─── Migration logic ─────────────────────────────────────────────────────────
async function migrateBlueprintProductIds() {
  console.log('\n🚀 Starting blueprint productId migration...\n');

  const blueprintsRef = db.collection('blueprints');
  const snapshot = await blueprintsRef.get();

  let totalDocs = 0;
  let totalDrugsUpdated = 0;
  let totalDrugsSkipped = 0;
  let totalDrugsUnmapped = [];

  for (const doc of snapshot.docs) {
    totalDocs++;
    const data = doc.data();
    const phases = data.phases || [];

    if (!phases.length) {
      console.log(`  ⚠️  ${doc.id}: no phases found, skipping.`);
      continue;
    }

    let docUpdated = false;
    const updatedPhases = phases.map((phase) => {
      const drugs = phase.drugs_used || [];
      const updatedDrugs = drugs.map((drug) => {
        const slug = (drug.product_slug || '').toLowerCase().trim();
        
        if (!slug) {
          totalDrugsSkipped++;
          return drug; // No slug, skip
        }

        if (drug.productId && drug.productId !== 'NOT_SET') {
          totalDrugsSkipped++;
          return drug; // Already has a valid productId, skip
        }

        const productId = SLUG_TO_PRODUCT_ID[slug];
        if (!productId) {
          totalDrugsUnmapped.push({ doc: doc.id, slug });
          totalDrugsSkipped++;
          return drug; // Unknown slug, skip but report
        }

        docUpdated = true;
        totalDrugsUpdated++;
        return { ...drug, productId };
      });

      return { ...phase, drugs_used: updatedDrugs };
    });

    if (docUpdated) {
      await doc.ref.update({ phases: updatedPhases });
      console.log(`  ✅  ${doc.id}: updated`);
    } else {
      console.log(`  ⏭️  ${doc.id}: no changes needed`);
    }
  }

  // ─── Summary ────────────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────');
  console.log(`📊 Migration Complete`);
  console.log(`   Blueprints processed : ${totalDocs}`);
  console.log(`   Drug entries updated : ${totalDrugsUpdated}`);
  console.log(`   Drug entries skipped : ${totalDrugsSkipped}`);
  
  if (totalDrugsUnmapped.length > 0) {
    console.log(`\n⚠️  Unmapped slugs (need manual review):`);
    totalDrugsUnmapped.forEach(({ doc, slug }) => {
      console.log(`   - Blueprint: ${doc} | Slug: "${slug}"`);
    });
  } else {
    console.log(`\n✅  All slugs were successfully mapped!`);
  }
  console.log('─────────────────────────────────────────\n');
}

migrateBlueprintProductIds().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
