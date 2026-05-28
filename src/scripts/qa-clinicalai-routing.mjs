import { classifyQuery } from '../utils/classifyQuery.js';

/**
 * QA Script: ClinicalAI Routing & Classification Test Matrix
 * Based on AI-Training ClinicAI rules (Phases 13 & 14)
 * Run this with: npm run qa:clinicalai
 */

const TEST_MATRIX = [
  {
    query: "What is BPC-157 used for?",
    expectedType: "peptide_query",
    description: "Exact peptide name lookup"
  },
  {
    query: "Tirzepatide vs Retatrutide",
    expectedType: "comparison_query",
    description: "Comparison with vs keyword"
  },
  {
    query: "I want to improve my sleep",
    expectedType: "goal_query",
    description: "Goal/lifestyle query"
  },
  {
    query: "How do I mix peptides?",
    expectedType: "reconstitution_query",
    description: "Reconstitution terminology"
  },
  {
    query: "Is this legal?",
    expectedType: "safety_or_beginner_query",
    description: "Safety/Legality query"
  },
  {
    query: "Do you have wholesale GHK-Cu?",
    expectedType: "availability_query",
    description: "Wholesale/Availability terminology"
  },
  {
    query: "What is a peptide?",
    expectedType: "general_education_query",
    description: "General educational question"
  },
  {
    query: "Recovery stack protocol",
    expectedType: "protocol_query",
    description: "Protocol terminology"
  },
  {
    query: "Glutathione",
    expectedType: "supplement_query",
    description: "Non-peptide supplement"
  }
];

// Mock catalog for testing entity detection (normally fetched from Firebase)
const MOCK_CATALOG = [
  { name: "BPC-157", productType: "peptides", slug: "bpc-157" },
  { name: "Tirzepatide", productType: "peptides", slug: "tirzepatide" },
  { name: "Retatrutide", productType: "peptides", slug: "retatrutide" },
  { name: "Glutathione", productType: "supplements", slug: "glutathione" }
];

console.log("🧪 Starting ClinicalAI Routing Validation (Phases 13 & 14)");
console.log("==========================================================");

let passed = 0;
let failed = 0;

TEST_MATRIX.forEach((testCase) => {
  const result = classifyQuery(testCase.query, { catalogIndex: MOCK_CATALOG });
  
  const isPass = result.query_type === testCase.expectedType;
  if (isPass) passed++; else failed++;

  console.log(`\n📝 Test: ${testCase.description}`);
  console.log(`   Query: "${testCase.query}"`);
  console.log(`   Expected: ${testCase.expectedType}`);
  console.log(`   Actual:   ${result.query_type} (Confidence: ${(result.confidence * 100).toFixed(0)}%)`);
  
  if (isPass) {
    console.log(`   ✅ PASS`);
  } else {
    console.log(`   ❌ FAIL`);
  }
});

console.log("\n==========================================================");
console.log(`🎯 Summary: ${passed} Passed, ${failed} Failed`);

if (failed > 0) {
  console.error("⚠️ Test matrix validation failed. Review the classification logic in src/utils/classifyQuery.js");
  process.exit(1);
} else {
  console.log("🚀 All ClinicalAI routing tests passed successfully!");
  process.exit(0);
}
