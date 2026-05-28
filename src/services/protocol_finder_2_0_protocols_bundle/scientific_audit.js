/* eslint-disable no-undef, no-unused-vars */
import fs from 'fs';
import path from 'path';
import { SCIENTIFIC_STANDARDS, standardizeData } from './ScientificStandards.js';

const bundleDir = './src/services/protocol_finder_2_0_protocols_bundle';
const files = fs.readdirSync(bundleDir).filter(f => f.endsWith('.json') && !f.includes('package'));

const results = [];
const fixMode = process.argv.includes('--fix');

files.forEach(file => {
  const filePath = path.join(bundleDir, file);
  let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let hasChanges = false;
  
  const protocolId = data.protocol_id;
  const title = data.protocol_title;
  const issues = [];
  
  // Audit Phases & Drugs
  if (data.phase_blueprints) {
    data.phase_blueprints.forEach((phase, pIdx) => {
      if (phase.drugs) {
        phase.drugs.forEach((drug, dIdx) => {
          const productId = drug.product_id;
          const cleanId = productId.toLowerCase().replace('prd_', '');
          const standard = SCIENTIFIC_STANDARDS.registry[cleanId];
          
          if (standard) {
            const logic = drug.dose_logic || {};
            const currentUnit = logic.dose_unit;
            
            // Check Unit and convert if necessary
            if (currentUnit && currentUnit !== standard.unit) {
              issues.push(`[UNIT] Phase ${pIdx + 1}, Drug ${drug.product_title}: Found "${currentUnit}", Expected "${standard.unit}"`);
              if (fixMode) {
                // Conversion Logic
                const convert = (val) => {
                  if (typeof val !== 'number') return val;
                  if (currentUnit === 'mcg' && standard.unit === 'mg') return val / 1000;
                  if (currentUnit === 'mg' && standard.unit === 'mcg') return val * 1000;
                  return val;
                };
                
                logic.dose_unit = standard.unit;
                logic.starting_weekly_dose = convert(logic.starting_weekly_dose);
                logic.default_weekly_dose = convert(logic.default_weekly_dose);
                logic.dose_per_administration = convert(logic.dose_per_administration);
                hasChanges = true;
              }
            }

            // Safety Threshold Check (e.g., Tirzepatide 2500mg is definitely 2500mcg)
            if (standard.threshold && logic.dose_per_administration > standard.threshold && standard.unit === 'mg') {
              issues.push(`[SAFETY] Drug ${drug.product_title}: Dose ${logic.dose_per_administration} is too high for mg. Correcting to mcg.`);
              if (fixMode) {
                 logic.dose_unit = 'mcg';
                 // We don't change the value here because if it's 2500 and supposed to be mcg, the number is right, only unit is wrong.
                 // HOWEVER, our registry says standard is mg. 
                 // If the standard is mg but the value is 2500, it's definitely mcg.
                 // So we should convert it to the standard unit (mg) -> 2.5mg
                 const val = logic.dose_per_administration;
                 logic.dose_unit = standard.unit;
                 logic.starting_weekly_dose = logic.starting_weekly_dose / 1000;
                 logic.default_weekly_dose = logic.default_weekly_dose / 1000;
                 logic.dose_per_administration = logic.dose_per_administration / 1000;
                 hasChanges = true;
              }
            }
            
            // Check Dosage Form Terminology
            const currentForm = drug.dosage_form?.toLowerCase();
            if (currentForm !== standard.form) {
              issues.push(`[FORM] Phase ${pIdx + 1}, Drug ${drug.product_title}: Found "${currentForm}", Expected "${standard.form}"`);
              if (fixMode) {
                drug.dosage_form = standard.form;
                hasChanges = true;
              }
            }
            
            // Check Route
            const currentRoute = drug.route?.toLowerCase();
            if (currentRoute !== standard.route) {
              issues.push(`[ROUTE] Phase ${pIdx + 1}, Drug ${drug.product_title}: Found "${currentRoute}", Expected "${standard.route}"`);
              if (fixMode) {
                drug.route = standard.route;
                hasChanges = true;
              }
            }
          } else {
            issues.push(`[MISSING_REGISTRY] Drug ${drug.product_title} (${productId}) not found in ScientificStandards.js`);
          }
        });
      }
    });
  }
  
  // Audit Supplements
  if (data.recommended_supplements) {
    data.recommended_supplements.forEach((supp, sIdx) => {
      const productId = supp.id || '';
      const cleanId = productId.toLowerCase().replace('prd_', '');
      const standard = SCIENTIFIC_STANDARDS.registry[cleanId];
      
      if (standard) {
        // Supplements often use 'mg' or 'capsules'
        const currentForm = supp.dosage_form?.toLowerCase();
        if (standard.form && currentForm !== standard.form) {
           issues.push(`[FORM] Supplement ${supp.name}: Found "${currentForm}", Expected "${standard.form}"`);
           if (fixMode) {
             supp.dosage_form = standard.form;
             hasChanges = true;
           }
        }
      }
      
      // Ensure frequency and dosage are present
      if (!supp.dosage) issues.push(`[MISSING_DATA] Supplement ${supp.name} missing dosage`);
      if (!supp.frequency) issues.push(`[MISSING_DATA] Supplement ${supp.name} missing frequency`);
    });
  }

  // Audit Testing Section
  if (!data.monitoring_plan) {
    data.monitoring_plan = { baseline_required: [], checkpoints: [], labs: [] };
    if (fixMode) hasChanges = true;
  }
  
  if (!data.monitoring_plan.labs) {
     issues.push(`[DATA] Missing monitoring_plan.labs array`);
     if (fixMode) {
       data.monitoring_plan.labs = [];
       hasChanges = true;
     }
  }

  if (fixMode && hasChanges) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
  
  if (issues.length > 0) {
    results.push({
      file,
      id: protocolId,
      title,
      issues
    });
  }
});

if (results.length === 0) {
  console.log("✅ Scientific Audit Passed: All protocols align with standards.");
} else {
  console.log(JSON.stringify(results, null, 2));
  console.log(`\n❌ Found ${results.reduce((acc, curr) => acc + curr.issues.length, 0)} issues across ${results.length} files.`);
  if (!fixMode) {
    console.log("Tip: Run with --fix to automatically correct unit and terminology discrepancies.");
  } else {
    console.log("✅ Fixes applied where possible.");
  }
}
