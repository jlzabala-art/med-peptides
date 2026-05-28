/**
 * testSupplyMath.mjs
 * 
 * Test script to verify supply calculations and PK-based optimization.
 */

import { derivePhaseSupply, buildSupplyManifest } from '../utils/supplyMath.js';
import { PEPTIDE_PK_DATA } from '../data/peptidePharmacokinetics.js';

const mockProtocol = [
  {
    phase_title: "Loading Phase",
    duration_weeks: 4,
    drugs_used: [
      {
        product_slug: "sermorelin",
        product_title: "Sermorelin 5mg",
        vial_size_mg: 5,
        dose_logic: {
          dose_per_administration: 0.25, // 250mcg
          administration_frequency: "once_weekly", // Suboptimal for Sermorelin
        }
      },
      {
        product_slug: "tirzepatide",
        product_title: "Tirzepatide 10mg",
        vial_size_mg: 10,
        dose_logic: {
          starting_weekly_dose: 2.5,
          administration_frequency: "weekly",
        }
      }
    ]
  }
];

console.log("--- STARTING SUPPLY MATH TEST ---");

const enrichedPhases = derivePhaseSupply(mockProtocol);
const manifest = buildSupplyManifest(enrichedPhases);

console.log("\nPhase 1 Compounds:");
enrichedPhases[0].compounds.forEach(c => {
  console.log(`- ${c.label}: ${c.vialsNeeded} vials (Dose: ${c.doseAmount}${c.unit}, Freq: ${c.dosingPerWeek}x/week)`);
});

console.log("\nSupply Manifest Totals:");
console.log(`- Total Vials: ${manifest.totals.vialsTotal}`);
console.log(`- Syringe Packs: ${manifest.accessories.find(a => a.id === 'insulin_syringe')?.qty}`);

// Check Sermorelin calculation
// Dose: 0.25mg per shot. 
// Original Freq: 1 shot/week (Suboptimal)
// Optimized Freq: 7 shots/week (Daily)
// Total requirement: 0.25 * 7 * 4 = 7mg total over 4 weeks. 
// Vial size: 5mg. 
// Result should be 2 vials.
const sermorelin = enrichedPhases[0].compounds.find(c => c.slug === 'sermorelin');
console.log(`\nSermorelin Detail:`);
console.log(`- Original Freq: ${sermorelin.originalDosingPerWeek}x/week`);
console.log(`- Optimized Freq: ${sermorelin.dosingPerWeek}x/week`);
console.log(`- Vials Needed: ${sermorelin.vialsNeeded}`);

if (sermorelin.pkOptimized && sermorelin.vialsNeeded === 2) {
  console.log("✅ Sermorelin frequency and vial count successfully optimized based on PK data.");
} else {
  console.error(`\n❌ Sermorelin optimization error: expected vials=2 and pkOptimized=true, got vials=${sermorelin.vialsNeeded} and pkOptimized=${sermorelin.pkOptimized}`);
}

console.log("\n--- TEST COMPLETE ---");
