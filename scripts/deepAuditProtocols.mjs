import { db } from './lib/firebase-admin.mjs';

async function deepAudit() {
  console.log('🔍 Starting Deep Diagnostic Audit of the canonical "protocols" collection...');
  const snap = await db.collection('protocols').get();
  console.log(`📋 Auditing all ${snap.docs.length} documents...`);

  const auditReport = [];

  snap.docs.forEach((doc) => {
    const data = doc.data();
    const pid = doc.id;
    const title = data.protocol_title || data.name || pid;

    const issues = [];

    // 1. Check for missing critical top-level fields
    const criticalFields = [
      'protocol_title',
      'protocol_slug',
      'primary_goal',
      'category',
      'clinical_disclaimer',
      'overview_summary'
    ];

    criticalFields.forEach((field) => {
      const val = data[field];
      if (val === undefined || val === null || val === '') {
        issues.push({ type: 'missing_metadata', field, message: `Top-level field "${field}" is missing or empty.` });
      } else if (typeof val === 'string' && val.toUpperCase().includes('TODO')) {
        issues.push({ type: 'placeholder_metadata', field, message: `Top-level field "${field}" contains a "TODO" placeholder: "${val}".` });
      }
    });

    // 2. Check for empty structural arrays
    const structuralArrays = [
      { name: 'phases', min: 1 },
      { name: 'recommended_supplements', min: 0 },
      { name: 'expected_outcomes', min: 1 }
    ];

    structuralArrays.forEach(({ name, min }) => {
      const arr = data[name];
      if (!arr || !Array.isArray(arr)) {
        issues.push({ type: 'missing_structure', field: name, message: `Structural array "${name}" is missing or not an array.` });
      } else if (arr.length < min) {
        issues.push({ type: 'empty_structure', field: name, message: `Structural array "${name}" is empty (expected at least ${min} items).` });
      }
    });

    // 3. Check phases and drug details
    const phases = data.phases || [];
    phases.forEach((phase, phIdx) => {
      const phaseNum = phase.phase_number || (phIdx + 1);
      const phaseName = phase.phase_title || `Phase ${phIdx + 1}`;

      if (!phase.start_week || !phase.end_week) {
        issues.push({
          type: 'phase_missing_weeks',
          phase: phaseNum,
          message: `Phase ${phaseNum} ("${phaseName}") is missing start_week or end_week.`
        });
      }

      const drugs = phase.drugs_used || [];
      if (drugs.length === 0) {
        issues.push({
          type: 'phase_no_drugs',
          phase: phaseNum,
          message: `Phase ${phaseNum} ("${phaseName}") contains no active drugs.`
        });
      }

      drugs.forEach((drug, dIdx) => {
        const drugSlug = drug.product_slug || drug.product_id || drug.name || `Drug ${dIdx + 1}`;
        
        // Check for placeholder values in drug properties
        Object.entries(drug).forEach(([key, val]) => {
          if (typeof val === 'string' && val.toUpperCase().includes('TODO')) {
            issues.push({
              type: 'placeholder_drug_field',
              phase: phaseNum,
              drug: drugSlug,
              field: key,
              message: `Phase ${phaseNum}, Drug "${drugSlug}" field "${key}" has placeholder: "${val}".`
            });
          }
        });

        // Check for missing dosage/freq specific fields on drug
        if (!drug.weekly_dose && !drug.dosage) {
          issues.push({
            type: 'missing_drug_dose',
            phase: phaseNum,
            drug: drugSlug,
            message: `Phase ${phaseNum}, Drug "${drugSlug}" is missing both "weekly_dose" and "dosage".`
          });
        }

        // Validate separated amount and unit fields
        if (drug.weekly_dose) {
          if (drug.weekly_dose_amount === undefined || drug.weekly_dose_amount === null) {
            issues.push({
              type: 'missing_weekly_dose_amount',
              phase: phaseNum,
              drug: drugSlug,
              message: `Phase ${phaseNum}, Drug "${drugSlug}" is missing separated "weekly_dose_amount".`
            });
          } else if (typeof drug.weekly_dose_amount !== 'number') {
            issues.push({
              type: 'invalid_weekly_dose_amount_type',
              phase: phaseNum,
              drug: drugSlug,
              message: `Phase ${phaseNum}, Drug "${drugSlug}" "weekly_dose_amount" should be a number, got "${typeof drug.weekly_dose_amount}".`
            });
          }

          if (drug.weekly_dose_unit === undefined || drug.weekly_dose_unit === null || drug.weekly_dose_unit === '') {
            issues.push({
              type: 'missing_weekly_dose_unit',
              phase: phaseNum,
              drug: drugSlug,
              message: `Phase ${phaseNum}, Drug "${drugSlug}" is missing separated "weekly_dose_unit".`
            });
          } else if (typeof drug.weekly_dose_unit !== 'string') {
            issues.push({
              type: 'invalid_weekly_dose_unit_type',
              phase: phaseNum,
              drug: drugSlug,
              message: `Phase ${phaseNum}, Drug "${drugSlug}" "weekly_dose_unit" should be a string, got "${typeof drug.weekly_dose_unit}".`
            });
          }
        }
      });
    });

    if (issues.length > 0) {
      auditReport.push({
        id: pid,
        title,
        issues
      });
    }
  });

  console.log('\n=================== DEEP AUDIT RESULTS ===================');
  if (auditReport.length === 0) {
    console.log('🎉 Superb! 0 issues found in the entire protocols collection.');
  } else {
    console.log(`⚠️ Found issues in ${auditReport.length} out of ${snap.docs.length} protocols.`);
    auditReport.forEach((proto) => {
      console.log(`\n📄 Protocol: ${proto.id} (${proto.title})`);
      proto.issues.forEach((issue) => {
        console.log(`  - [${issue.type.toUpperCase()}] ${issue.message}`);
      });
    });
  }
}

deepAudit().catch(console.error);
