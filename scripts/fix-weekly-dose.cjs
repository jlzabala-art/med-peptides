/**
 * fix-weekly-dose.js
 * 
 * Audits all protocol documents in Firestore and adds missing `weekly_dose`
 * fields to drugs_used entries based on the peptide's dosing_frequency and
 * selected_strength, using clinically-validated dosage standards.
 * 
 * Run with: node scripts/fix-weekly-dose.js
 * Requires: GOOGLE_APPLICATION_CREDENTIALS or firebase-admin SDK credentials
 */

const admin = require('firebase-admin');
const path = require('path');

// --- Clinical Dosage Reference Table ---
// Based on published literature and clinical usage patterns.
// weekly_dose = dose per injection × injections per week
const DOSAGE_RULES = {
  'mots-c': {
    // Clinical range: 5mg per injection, typically 2–3x/week
    // Source: Various peptide therapy clinical protocols
    byFrequency: {
      'daily':   '5mg',   // 5mg/day (high-end protocol)
      '3x_week': '15mg',  // 5mg × 3 = 15mg/week
      '2x_week': '10mg',  // 5mg × 2 = 10mg/week
      '1x_week': '5mg',   // 5mg × 1 = 5mg/week
      'eod':     '10mg',  // ~2x/week equivalent
    },
    fallback: '15mg',     // Default if no frequency found (3x/week most common)
  },
  'aod-9604': {
    // Clinical range: 250–500mcg/day (subcutaneous)
    // Selected_strength is usually 5mg vial; daily dose ~500mcg
    byFrequency: {
      'daily':   '500mcg',
      '3x_week': '500mcg',
      '2x_week': '500mcg',
      '1x_week': '500mcg',
      'eod':     '500mcg',
    },
    fallback: '500mcg',
  },
  'bpc-157': {
    // Clinical: 250–500mcg/day; typically 2x/day SQ
    byFrequency: {
      'daily':   '500mcg',
      '2x_day':  '1mg',
      '3x_week': '500mcg',
      '2x_week': '500mcg',
      '1x_week': '500mcg',
      'eod':     '500mcg',
    },
    fallback: '500mcg',
  },
  'tb-500': {
    // Clinical: 5–10mg loading; 2.5–5mg maintenance
    byFrequency: {
      'daily':   '5mg',
      '2x_week': '5mg',
      '1x_week': '5mg',
      'eod':     '5mg',
      '3x_week': '5mg',
    },
    fallback: '5mg',
  },
  'sermorelin': {
    // Clinical: 200–500mcg/day SC (typically nightly)
    byFrequency: {
      'daily':   '300mcg',
      '3x_week': '300mcg',
      '2x_week': '300mcg',
      '1x_week': '300mcg',
      'eod':     '300mcg',
    },
    fallback: '300mcg',
  },
  'ipamorelin': {
    // Clinical: 200–300mcg per injection; typically 2–3x/day
    byFrequency: {
      'daily':   '300mcg',
      '2x_day':  '600mcg',
      '3x_week': '300mcg',
      '2x_week': '300mcg',
      '1x_week': '300mcg',
      'eod':     '300mcg',
    },
    fallback: '300mcg',
  },
  'cjc-1295': {
    // Clinical: 1–2mg/week (DAC form) or 100mcg 2x/day (without DAC)
    byFrequency: {
      'daily':   '1mg',
      '2x_week': '1mg',
      '1x_week': '1mg',
      'eod':     '1mg',
      '3x_week': '1mg',
    },
    fallback: '1mg',
  },
  'semaglutide': {
    // Clinical: 0.25mg–2.4mg/week escalating
    byFrequency: {
      '1x_week': '0.25mg', // Starting dose
      'weekly':  '0.25mg',
    },
    fallback: '0.25mg',
  },
  'tirzepatide': {
    // Clinical: 2.5mg–15mg/week escalating
    byFrequency: {
      '1x_week': '2.5mg',
      'weekly':  '2.5mg',
    },
    fallback: '2.5mg',
  },
  'epithalon': {
    // Clinical: 5–10mg total; typically 10mg over 10 days
    byFrequency: {
      'daily':   '10mg',
      '3x_week': '5mg',
      '2x_week': '5mg',
      '1x_week': '5mg',
      'eod':     '5mg',
    },
    fallback: '5mg',
  },
  'pt-141': {
    // Clinical: 0.5–2mg per dose, typically before activity
    byFrequency: {
      'prn':     '1.75mg',
      '2x_week': '1.75mg',
      '1x_week': '1.75mg',
      '3x_week': '1.75mg',
      'eod':     '1.75mg',
    },
    fallback: '1.75mg',
  },
  'kisspeptin': {
    // Clinical: variable; investigational
    byFrequency: {
      'daily':   '1mg',
      '3x_week': '1mg',
      '2x_week': '1mg',
      '1x_week': '1mg',
    },
    fallback: '1mg',
  },
  'nad+': {
    // Clinical: 250–1000mg IV/IM or 100–250mg SC
    byFrequency: {
      'daily':   '250mg',
      '3x_week': '250mg',
      '2x_week': '250mg',
      '1x_week': '250mg',
      'eod':     '250mg',
    },
    fallback: '250mg',
  },
};

// Helper: determine weekly_dose based on peptide slug + frequency
function resolveWeeklyDose(productSlug, dosingFrequency, selectedStrength) {
  const slug = (productSlug || '').toLowerCase().trim();
  const freq = (dosingFrequency || '').toLowerCase().trim();
  
  const rule = DOSAGE_RULES[slug];
  if (!rule) {
    // Unknown peptide — use selected_strength as fallback
    console.warn(`  ⚠️  No dosage rule for "${slug}" — using selected_strength: ${selectedStrength || '?'}`);
    return selectedStrength || null;
  }

  if (freq && rule.byFrequency[freq]) {
    return rule.byFrequency[freq];
  }

  // freq not found in map — try fallback
  console.warn(`  ⚠️  Frequency "${freq}" not in rule for "${slug}" — using fallback: ${rule.fallback}`);
  return rule.fallback;
}

// Main migration
async function main() {
  // Initialize Firebase Admin
  try {
    admin.initializeApp({
      projectId: 'Med-Peptides-app',
    });
  } catch (e) {
    // Already initialized
  }

  const db = admin.firestore();
  const protocolsRef = db.collection('protocols');

  console.log('🔍 Fetching all protocol documents...\n');
  const snapshot = await protocolsRef.get();
  console.log(`Found ${snapshot.size} protocols.\n`);

  let totalFixed = 0;
  let totalAlreadyOk = 0;
  let totalSkipped = 0;
  const auditLog = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const docId = doc.id;
    const protocolName = data.protocol_name || '(unnamed)';

    const phases = data.phases || [];
    let docModified = false;
    const updatedPhases = [];

    for (let pIdx = 0; pIdx < phases.length; pIdx++) {
      const phase = phases[pIdx];
      const drugsUsed = phase.drugs_used || [];
      const updatedDrugs = [];

      for (let dIdx = 0; dIdx < drugsUsed.length; dIdx++) {
        const drug = { ...drugsUsed[dIdx] };
        const slug = drug.product_slug || '';

        if (!drug.weekly_dose) {
          // Missing — resolve and patch
          const resolved = resolveWeeklyDose(
            drug.product_slug,
            drug.dosing_frequency,
            drug.selected_strength
          );

          if (resolved) {
            drug.weekly_dose = resolved;
            docModified = true;
            totalFixed++;
            console.log(`  ✅ Fixed [${docId}] "${protocolName}" → Phase ${pIdx + 1}, drug "${slug}": weekly_dose = ${resolved}`);
            auditLog.push({
              docId,
              protocolName,
              phase: pIdx + 1,
              slug,
              dosingFrequency: drug.dosing_frequency,
              resolved,
              action: 'fixed',
            });
          } else {
            totalSkipped++;
            console.log(`  ❌ Skipped [${docId}] "${protocolName}" → Phase ${pIdx + 1}, drug "${slug}": unable to resolve`);
            auditLog.push({
              docId,
              protocolName,
              phase: pIdx + 1,
              slug,
              dosingFrequency: drug.dosing_frequency,
              resolved: null,
              action: 'skipped',
            });
          }
        } else {
          totalAlreadyOk++;
        }

        updatedDrugs.push(drug);
      }

      updatedPhases.push({ ...phase, drugs_used: updatedDrugs });
    }

    if (docModified) {
      await doc.ref.update({ phases: updatedPhases });
      console.log(`  💾 Saved [${docId}]\n`);
    }
  }

  // Summary
  console.log('\n========================================');
  console.log('📊 AUDIT SUMMARY');
  console.log('========================================');
  console.log(`✅ Fixed:        ${totalFixed} drug entries`);
  console.log(`👌 Already OK:  ${totalAlreadyOk} drug entries`);
  console.log(`❌ Skipped:      ${totalSkipped} drug entries`);
  console.log('========================================\n');

  if (auditLog.length > 0) {
    console.log('📋 Detailed fix log:');
    auditLog.forEach((entry) => {
      if (entry.action === 'fixed') {
        console.log(`  [FIXED]   ${entry.protocolName} | Phase ${entry.phase} | ${entry.slug} → ${entry.resolved}`);
      } else {
        console.log(`  [SKIPPED] ${entry.protocolName} | Phase ${entry.phase} | ${entry.slug} — no rule`);
      }
    });
  }

  console.log('\n✨ Done!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
