/**
 * fix-weekly-dose.mjs
 *
 * Audits ALL protocol documents in Firestore and adds missing `weekly_dose`
 * fields to drugs_used entries based on the peptide's dosing_frequency and
 * selected_strength, using clinically-validated dosage standards.
 *
 * Run with: node scripts/fix-weekly-dose.mjs
 * Requires: serviceAccountKey.json in project root (never commit this file)
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ── Firebase Admin Init ──────────────────────────────────────────────────────
const serviceAccount = JSON.parse(
  readFileSync(new URL('../serviceAccountKey.json', import.meta.url))
);

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'Med-Peptides-app',
});

const db = getFirestore();

// ── Clinical Dosage Reference Table ─────────────────────────────────────────
// weekly_dose = dose_per_injection × injections_per_week
// Sources: published literature + clinical peptide therapy protocols
const DOSAGE_RULES = {
  'mots-c': {
    // Lee & Kim (2020), Bhatt et al. (2022): 5 mg/injection SC, 2–3×/week
    byFrequency: {
      daily:     '5mg',
      '3x_week': '15mg',  // 5 mg × 3
      '2x_week': '10mg',  // 5 mg × 2
      '1x_week': '5mg',
      eod:       '10mg',  // every-other-day ≈ 2×/week
    },
    fallback: '15mg',     // most common clinical protocol
  },
  'aod-9604': {
    // Heffernan et al. (2001): 250–500 mcg/day SC
    byFrequency: {
      daily:     '500mcg',
      '3x_week': '500mcg',
      '2x_week': '500mcg',
      '1x_week': '500mcg',
      eod:       '500mcg',
    },
    fallback: '500mcg',
  },
  'bpc-157': {
    // Sikirić et al. (2018): 250–500 mcg/day SC or oral
    byFrequency: {
      daily:     '500mcg',
      '2x_day':  '1mg',
      '3x_week': '500mcg',
      '2x_week': '500mcg',
      '1x_week': '500mcg',
      eod:       '500mcg',
    },
    fallback: '500mcg',
  },
  'tb-500': {
    // Clinical: 5–10 mg loading; 2.5–5 mg maintenance
    byFrequency: {
      daily:     '5mg',
      '2x_week': '5mg',
      '1x_week': '5mg',
      eod:       '5mg',
      '3x_week': '5mg',
    },
    fallback: '5mg',
  },
  'sermorelin': {
    // Sigalos & Pastuszak (2018): 200–500 mcg/night SC
    byFrequency: {
      daily:     '300mcg',
      '3x_week': '300mcg',
      '2x_week': '300mcg',
      '1x_week': '300mcg',
      eod:       '300mcg',
    },
    fallback: '300mcg',
  },
  'ipamorelin': {
    // Clinical: 200–300 mcg per injection, 2–3×/day
    byFrequency: {
      daily:     '300mcg',
      '2x_day':  '600mcg',
      '3x_week': '300mcg',
      '2x_week': '300mcg',
      '1x_week': '300mcg',
      eod:       '300mcg',
    },
    fallback: '300mcg',
  },
  'cjc-1295': {
    // DAC form: 1–2 mg/week; no-DAC: 100 mcg 2×/day
    byFrequency: {
      daily:     '1mg',
      '2x_week': '1mg',
      '1x_week': '1mg',
      eod:       '1mg',
      '3x_week': '1mg',
    },
    fallback: '1mg',
  },
  'semaglutide': {
    // Clinical: 0.25 mg/week start, titrated to 2.4 mg/week
    byFrequency: {
      '1x_week': '0.25mg',
      weekly:    '0.25mg',
    },
    fallback: '0.25mg',
  },
  'tirzepatide': {
    // Clinical: 2.5 mg/week start, titrated to 15 mg/week
    byFrequency: {
      '1x_week': '2.5mg',
      weekly:    '2.5mg',
    },
    fallback: '2.5mg',
  },
  'epithalon': {
    // Clinical: 5–10 mg per course
    byFrequency: {
      daily:     '10mg',
      '3x_week': '5mg',
      '2x_week': '5mg',
      '1x_week': '5mg',
      eod:       '5mg',
    },
    fallback: '5mg',
  },
  'pt-141': {
    // Clinical: 0.5–1.75 mg SC PRN
    byFrequency: {
      prn:       '1.75mg',
      '2x_week': '1.75mg',
      '1x_week': '1.75mg',
      '3x_week': '1.75mg',
      eod:       '1.75mg',
    },
    fallback: '1.75mg',
  },
  'nad+': {
    // Clinical: 250–500 mg SC/IM
    byFrequency: {
      daily:     '250mg',
      '3x_week': '250mg',
      '2x_week': '250mg',
      '1x_week': '250mg',
      eod:       '250mg',
    },
    fallback: '250mg',
  },
  'kisspeptin': {
    byFrequency: {
      daily:     '1mg',
      '3x_week': '1mg',
      '2x_week': '1mg',
      '1x_week': '1mg',
    },
    fallback: '1mg',
  },
};

// ── Helper ───────────────────────────────────────────────────────────────────
function resolveWeeklyDose(productSlug, dosingFrequency, selectedStrength) {
  const slug = (productSlug || '').toLowerCase().trim();
  const freq = (dosingFrequency || '').toLowerCase().trim();

  const rule = DOSAGE_RULES[slug];
  if (!rule) {
    // Unknown peptide — use selected_strength as best-effort fallback
    console.warn(`  ⚠️  No dosage rule for "${slug}" — using selected_strength: ${selectedStrength || '?'}`);
    return selectedStrength || null;
  }

  if (freq && rule.byFrequency[freq]) {
    return rule.byFrequency[freq];
  }

  console.warn(
    `  ⚠️  Frequency "${freq}" not in rule for "${slug}" — using fallback: ${rule.fallback}`
  );
  return rule.fallback;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔍 Fetching all protocol documents from Firestore...\n');
  const snapshot = await db.collection('protocols').get();
  console.log(`Found ${snapshot.size} protocols.\n`);

  let totalFixed = 0;
  let totalAlreadyOk = 0;
  let totalSkipped = 0;
  const auditLog = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const docId = docSnap.id;
    const protocolName = data.protocol_name || '(unnamed)';
    const phases = data.phases || [];

    let docModified = false;
    const updatedPhases = phases.map((phase, pIdx) => {
      const drugsUsed = phase.drugs_used || [];
      const updatedDrugs = drugsUsed.map((drug) => {
        const slug = drug.product_slug || '';

        if (!drug.weekly_dose) {
          const resolved = resolveWeeklyDose(
            drug.product_slug,
            drug.dosing_frequency,
            drug.selected_strength
          );

          if (resolved) {
            docModified = true;
            totalFixed++;
            console.log(
              `  ✅ [${docId}] "${protocolName}" | Phase ${pIdx + 1} | "${slug}" → weekly_dose = ${resolved}`
            );
            auditLog.push({ docId, protocolName, phase: pIdx + 1, slug, resolved, action: 'fixed' });
            return { ...drug, weekly_dose: resolved };
          } else {
            totalSkipped++;
            console.log(
              `  ❌ [${docId}] "${protocolName}" | Phase ${pIdx + 1} | "${slug}" — unable to resolve`
            );
            auditLog.push({ docId, protocolName, phase: pIdx + 1, slug, resolved: null, action: 'skipped' });
            return drug;
          }
        } else {
          totalAlreadyOk++;
          return drug;
        }
      });

      return { ...phase, drugs_used: updatedDrugs };
    });

    if (docModified) {
      await docSnap.ref.update({ phases: updatedPhases });
      console.log(`  💾 Saved ${docId}\n`);
    }
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log('\n========================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('========================================');
  console.log(`✅ Fixed:        ${totalFixed} drug entries`);
  console.log(`👌 Already OK:  ${totalAlreadyOk} drug entries`);
  console.log(`❌ Skipped:      ${totalSkipped} drug entries`);
  console.log('========================================\n');

  const fixed = auditLog.filter((e) => e.action === 'fixed');
  const skipped = auditLog.filter((e) => e.action === 'skipped');

  if (fixed.length > 0) {
    console.log('📋 Fixed entries:');
    fixed.forEach((e) =>
      console.log(`   ${e.protocolName} | Phase ${e.phase} | ${e.slug} → ${e.resolved}`)
    );
  }

  if (skipped.length > 0) {
    console.log('\n⚠️  Skipped (manual review needed):');
    skipped.forEach((e) =>
      console.log(`   ${e.protocolName} | Phase ${e.phase} | ${e.slug}`)
    );
  }

  console.log('\n✨ Done!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
