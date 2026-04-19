// Validation Engine Runner
// Orchestrates the execution of all 50 test cases through the Protocol Engine and Scorer.

import { generateProtocolData } from '../../services/protocolEngine';
import { scoreProtocol } from './scorer';
import { VALIDATION_TEST_CASES } from '../test_cases';

export const runValidationSuite = async (productsDb, onProgress) => {
  const results = [];
  const testCases = VALIDATION_TEST_CASES;
  let totalTests = testCases.length;
  let passed = 0;
  let failed = 0;
  let totalScore = 0;
  let allRedFlags = [];

  for (let i = 0; i < totalTests; i++) {
    const testCase = testCases[i];
    
    if (onProgress) {
      onProgress(i + 1, totalTests, testCase.id);
    }

    try {
      // Execute the headless generation engine (skip PubMed scrape for speed)
      const generatedData = await generateProtocolData(testCase.patientContext, productsDb, true);
      
      // Score the result
      const scoredResult = scoreProtocol(testCase, generatedData, productsDb);
      
      results.push(scoredResult);

      if (scoredResult.isFailed) {
        failed++;
        allRedFlags.push(...scoredResult.redFlags.map(f => `[${testCase.id}] ${f}`));
      } else {
        passed++;
      }
      
      totalScore += scoredResult.averageScore;

    } catch (err) {
      // Hard failure running the test
      failed++;
      const fatalError = `[${testCase.id}] Fatal Engine Error: ${err.message}`;
      allRedFlags.push(fatalError);
      
      results.push({
        testCaseId: testCase.id,
        patientCategory: testCase.category,
        averageScore: 1,
        isFailed: true,
        dimensions: {
          goalAlignment: 1, constraintCompliance: 1, phaseLogic: 1, doseLogic: 1, compoundSelection: 1, costLogic: 1, explainability: 1
        },
        redFlags: [fatalError],
        allWarnings: [fatalError],
        generatedDataSnapshot: null
      });
    }
  }

  const averageSystemScore = Number((totalScore / totalTests).toFixed(2));
  const failurePercentage = Number(((failed / totalTests) * 100).toFixed(1));

  return {
    totalTests,
    passed,
    failed,
    averageSystemScore,
    failurePercentage,
    allRedFlags,
    topRecurringFailures: [...new Set(allRedFlags)].slice(0, 5), // Unique top 5
    caseResults: results,
    timestamp: new Date().toISOString()
  };
};
