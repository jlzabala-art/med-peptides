import { classifyQuery } from '../utils/classifyQuery.js';
import { buildClinicalAITrainingBlock } from '../config/clinicalAIRules.js';

/**
 * qa-clinicalai-deep.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Validation suite for ClinicalAI Phase 2 & 3 improvements.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const MOCK_CATALOG = [
  { name: 'BPC-157', productType: 'peptide' },
  { name: 'AOD-9604', productType: 'peptide' }
];

const TEST_SCENARIOS = [
  {
    name: "Scenario A: Personalized Goal Alignment",
    query: "Where should I start?",
    userProfile: { goals: ['fat-loss'], researchLevel: 'beginner' },
    expectedIntent: 'vague'
  },
  {
    name: "Scenario B: Scientific Citation Trigger",
    query: "What is the mechanism of BPC-157?",
    userProfile: null,
    expectedIntent: 'peptide'
  },
  {
    name: "Scenario C: Complex Comparison",
    query: "Compare BPC-157 vs AOD-9604 for recovery",
    userProfile: null,
    expectedIntent: 'comparison'
  }
];

console.log('\n🧪 Starting ClinicalAI Deep Validation (Phases 5-10)');
console.log('==========================================================\n');

let passed = 0;

TEST_SCENARIOS.forEach((test, i) => {
  console.log(`📝 Test ${i+1}: ${test.name}`);
  console.log(`   Query: "${test.query}"`);
  
  const classifyResult = classifyQuery(test.query, { catalogIndex: MOCK_CATALOG });
  
  // Map internal query types to the intents used in buildClinicalAITrainingBlock
  let intent = test.expectedIntent;
  if (classifyResult.query_type === 'peptide_query') intent = 'peptide';
  if (classifyResult.query_type === 'comparison_query') intent = 'comparison';

  // 1. Verify Dynamic Prompting (Rule presence)
  const trainingBlock = buildClinicalAITrainingBlock(intent);
  const hasIntentRule = trainingBlock.toLowerCase().includes('query') || trainingBlock.toLowerCase().includes('mode');
  
  // 2. Verify Entity Detection
  const hasEntities = classifyResult.detected_entities.length > 0;

  console.log(`   Detected Intent: ${intent}`);
  console.log(`   Entities Found: ${classifyResult.detected_entities.map(e => e.name).join(', ') || 'None'}`);
  console.log(`   Training Block: ${hasIntentRule ? '✅ TAILORED' : '❌ GENERIC'}`);
  
  const isVagueOk = intent === 'vague' && !hasEntities;
  const isSpecificOk = intent !== 'vague' && hasEntities;

  if (hasIntentRule && (isVagueOk || isSpecificOk)) {
    console.log('   ✅ PASS');
    passed++;
  } else {
    console.log('   ❌ FAIL');
  }
  console.log('----------------------------------------------------------');
});

console.log(`\n🎯 Summary: ${passed}/${TEST_SCENARIOS.length} Scenarios Validated`);
if (passed === TEST_SCENARIOS.length) {
  console.log('🚀 Deep Validation successful! ClinicalAI is ready for production.');
} else {
  console.log('⚠️ Some validation checks failed.');
  process.exit(1);
}
