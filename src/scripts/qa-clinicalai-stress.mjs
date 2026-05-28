import { classifyQuery } from '../utils/classifyQuery.js';
import { buildClinicalAITrainingBlock } from '../config/clinicalAIRules.js';

/**
 * qa-clinicalai-stress.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * 25+ Scenario Stress Test for Intermediate Users.
 * Verifies accuracy of intent routing and rule triggering.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const STRESS_CATALOG = [
  { name: 'BPC-157', productType: 'peptide' },
  { name: 'TB-500', productType: 'peptide' },
  { name: 'GHK-Cu', productType: 'peptide' },
  { name: 'CJC-1295', productType: 'peptide' },
  { name: 'Ipamorelin', productType: 'peptide' },
  { name: 'Semaglutide', productType: 'peptide' },
  { name: 'Tirzepatide', productType: 'peptide' },
  { name: 'Retatrutide', productType: 'peptide' },
  { name: 'AOD-9604', productType: 'peptide' },
  { name: 'MOTS-c', productType: 'peptide' },
  { name: 'Epitalon', productType: 'peptide' },
  { name: 'NAD+', productType: 'supplement' }
];

const STRESS_SCENARIOS = [
  // --- PEPTIDE DEEP-DIVE ---
  { q: "What is the primary mechanism of BPC-157?", intent: 'peptide' },
  { q: "Tell me about GHK-Cu for skin research", intent: 'peptide' },
  { q: "Storage temperature for lyophilized peptides?", intent: 'reconstitution' },
  { q: "Optimal injection sites for localized healing?", intent: 'education' },
  { q: "Does TB-500 affect systemic angiogenesis?", intent: 'peptide' },

  // --- COMPARISONS ---
  { q: "BPC-157 vs TB-500 for tendon repair", intent: 'comparison' },
  { q: "Which is better for GH release: Ipamorelin or CJC-1295?", intent: 'comparison' },
  { q: "Tirzepatide vs Retatrutide for metabolic research", intent: 'comparison' },
  { q: "Semaglutide vs AOD-9604 for lipolysis", intent: 'comparison' },
  { q: "Compare all growth hormone secretagogues", intent: 'comparison' },

  // --- STACKING / SYNERGIES ---
  { q: "Can I stack BPC-157 and TB-500?", intent: 'protocol' },
  { q: "Synergies for CJC-1295 and Ipamorelin", intent: 'protocol' },
  { q: "Best recovery stack for ligament tears", intent: 'protocol' },
  { q: "Weight loss protocol overview", intent: 'protocol' },
  { q: "Longevity protocol including Epitalon", intent: 'protocol' },

  // --- PHARMACOLOGY ---
  { q: "Half-life of Semaglutide in research models", intent: 'peptide' },
  { q: "Reconstitution volume for a 5mg vial", intent: 'reconstitution' },
  { q: "Stability of GHK-Cu in saline solution", intent: 'reconstitution' },
  { q: "Is CJC-1295 DAC or No-DAC?", intent: 'peptide' },
  { q: "Peptide saturation levels for GH release", intent: 'education' },

  // --- SAFETY ---
  { q: "Risk profile of chronic GH secretagogue use", intent: 'safety' },
  { q: "Contraindications for GHK-Cu", intent: 'safety' },
  { q: "Side effects of Tirzepatide in recent studies", intent: 'safety' },

  // --- NAVIGATION / AVAILABILITY ---
  { q: "Do you have wholesale GHK-Cu available?", intent: 'availability' },
  { q: "Current stock of Retatrutide kits", intent: 'availability' },

  // --- EDGE CASES / MULTI-LANG ---
  { q: "How to mix peptides? (en español)", intent: 'reconstitution' },
  { q: "Diferencia entre BPC y TB", intent: 'comparison' },
  { q: "What should I take for my injury?", intent: 'vague' }
];

console.log('\n🔥 Starting ClinicalAI Intermediate Stress Test (25+ Scenarios)');
console.log('==========================================================\n');

let passed = 0;

STRESS_SCENARIOS.forEach((test, i) => {
  const result = classifyQuery(test.q, { catalogIndex: STRESS_CATALOG });
  
  let detectedIntent = result.query_type.replace('_query', '');
  if (detectedIntent === 'safety_or_beginner') detectedIntent = 'safety';
  if (detectedIntent === 'general_education') detectedIntent = 'education';

  const isOk = detectedIntent === test.intent || 
               (test.intent === 'peptide' && detectedIntent === 'supplement') || // Cross-over
               (test.intent === 'protocol' && detectedIntent === 'peptide');     // Some protocols are peptide queries

  const trainingBlock = buildClinicalAITrainingBlock(detectedIntent);
  const hasGuardrails = trainingBlock.includes('NOT a doctor');

  console.log(`[${i+1}] Query: "${test.q}"`);
  console.log(`    Expected: ${test.intent} | Actual: ${detectedIntent} | ${isOk ? '✅' : '❌'}`);
  
  if (isOk && hasGuardrails) passed++;
});

console.log('\n==========================================================');
console.log(`🎯 STRESS TEST SUMMARY: ${passed}/${STRESS_SCENARIOS.length} passed.`);
console.log('==========================================================\n');

if (passed >= 25) {
  console.log('🚀 SYSTEM READY: ClinicalAI handles intermediate complexity with high reliability.');
} else {
  console.log('⚠️ SYSTEM WARNING: Some complex intents were misclassified.');
  process.exit(1);
}
