 
// Validation Engine Runner
// Orchestrates the execution of all 50 test cases through the Protocol Engine and Scorer.

import { generateProtocolData } from '../../services/protocolEngine.js';
import { scoreProtocol } from './scorer.js';
import { scoreAIResponse } from './scorer_ai.js';
import { VALIDATION_TEST_CASES } from '../test_cases/index.js';
import { CLINICAL_AI_TEST_CASES } from '../test_cases/clinicalAI_cases.js';

export const runValidationSuite = async (productsDb, onProgress, mode = 'protocol', aiResponder = null) => {
  const results = [];
  const testCases = mode === 'ai' ? CLINICAL_AI_TEST_CASES : VALIDATION_TEST_CASES;
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
      let scoredResult;

      if (mode === 'ai') {
        if (!aiResponder) throw new Error("AI Responder required for AI mode");
        const responseText = await aiResponder(testCase);
        scoredResult = scoreAIResponse(testCase, responseText);
      } else {
        const generatedData = await generateProtocolData(testCase.patientContext, productsDb, true);
        scoredResult = scoreProtocol(testCase, generatedData, productsDb);
      }
      
      results.push(scoredResult);

      if (scoredResult.isFailed) {
        failed++;
        const issues = scoredResult.redFlags || scoredResult.allFlags.filter(f => f.includes("CRITICAL") || f.includes("VIOLATION"));
        allRedFlags.push(...issues.map(f => `[${testCase.id}] ${f}`));
      } else {
        passed++;
      }
      
      totalScore += scoredResult.averageScore || scoredResult.finalScore;

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
