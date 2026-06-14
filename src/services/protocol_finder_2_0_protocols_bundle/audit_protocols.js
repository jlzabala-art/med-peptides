/* eslint-disable no-unused-vars */
import fs from 'fs';
import path from 'path';

const bundleDir = './src/services/protocol_finder_2_0_protocols_bundle';
const files = fs.readdirSync(bundleDir).filter(f => f.endsWith('.js'));

const results = [];

files.forEach(file => {
  const filePath = path.join(bundleDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const protocolId = data.protocol_id;
  const title = data.protocol_title;
  
  const missingData = [];
  
  // Check Phases
  if (data.phase_blueprints) {
    data.phase_blueprints.forEach((phase, pIdx) => {
      if (phase.drugs) {
        phase.drugs.forEach((drug, dIdx) => {
          const logic = drug.dose_logic || {};
          const hasDosage = !!(logic.starting_weekly_dose || logic.default_weekly_dose || logic.dose_per_administration);
          const hasFrequency = !!logic.administration_frequency;
          
          if (!hasDosage) missingData.push(`Phase ${pIdx + 1}, Drug ${drug.product_title}: Missing Dosage`);
          if (!hasFrequency) missingData.push(`Phase ${pIdx + 1}, Drug ${drug.product_title}: Missing Frequency`);
        });
      }
    });
  } else {
    missingData.push('Missing phase_blueprints');
  }
  
  // Check Supplements
  if (data.recommended_supplements) {
    data.recommended_supplements.forEach((supp, sIdx) => {
      const hasDosage = !!supp.dosage;
      const hasFrequency = !!supp.frequency; // Note: Current schema might not have frequency for supplements yet
      
      if (!hasDosage) missingData.push(`Supplement ${supp.name}: Missing Dosage`);
      if (!hasFrequency) missingData.push(`Supplement ${supp.name}: Missing Frequency`);
    });
  }
  
  results.push({
    id: protocolId,
    title,
    missing: missingData
  });
});

console.log(JSON.stringify(results, null, 2));
