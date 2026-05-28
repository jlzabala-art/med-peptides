/* eslint-disable no-unused-vars */
// Validation Scorer
// Translates the output of validation rules into a rigid 1-5 grading system

import {
  checkGoalAlignment,
  checkConstraintCompliance,
  checkPhaseSequence,
  checkDoseProgression,
  checkProductConsistency,
  checkCostConsistency,
  checkContradictions
} from './rules.js';

/**
 * 5 = Excellent (0 flags)
 * 4 = Acceptable (1 minor warning)
 * 3 = Questionable (2-3 warnings)
 * 2 = Poor (1 critical violation)
 * 1 = Invalid (>1 critical violations)
 */

const calculateDimensionScore = (violations) => {
  if (violations.length === 0) return 5;
  
  const hasCritical = violations.some(v => v.includes("Violation") || v.includes("Failed"));
  const numCritical = violations.filter(v => v.includes("Violation") || v.includes("Failed")).length;
  const numWarnings = violations.filter(v => v.includes("Warning")).length;

  if (numCritical > 1) return 1;
  if (numCritical === 1) return 2;
  if (numWarnings >= 2) return 3;
  if (numWarnings === 1) return 4;

  return 3; // Fallback
};

export const scoreProtocol = (testCase, generatedData, productsDb) => {

  const req1 = checkGoalAlignment(testCase, generatedData, productsDb);
  const req2 = checkConstraintCompliance(testCase, generatedData, productsDb);
  const req3 = checkPhaseSequence(generatedData);
  const req4 = checkDoseProgression(generatedData);
  const req5 = checkProductConsistency(generatedData, productsDb);
  const req6 = checkCostConsistency(generatedData);
  const req7 = checkContradictions(testCase, generatedData);

  const explainabilityFlags = generatedData.confidenceData && generatedData.confidenceData.reasoningSummary 
    ? [] : ["Explainability Failed: No clinical reasoning provided."];

  const dimensions = {
    goalAlignment: calculateDimensionScore(req1),
    constraintCompliance: calculateDimensionScore(req2),
    phaseLogic: calculateDimensionScore(req3),
    doseLogic: calculateDimensionScore(req4),
    compoundSelection: calculateDimensionScore(req5),
    costLogic: calculateDimensionScore(req6),
    explainability: calculateDimensionScore(explainabilityFlags)
  };

  const allViolations = [
    ...req1, ...req2, ...req3, ...req4, ...req5, ...req6, ...req7, ...explainabilityFlags
  ];

  const redFlags = allViolations.filter(v => v.includes("Violation") || v.includes("Failed"));

  // Calculate Average
  const totalScore = Object.values(dimensions).reduce((a, b) => a + b, 0);
  const averageScore = Number((totalScore / Object.keys(dimensions).length).toFixed(2));

  // Any score <= 2 triggers failure flag. Or any explicit critical red flags.
  const isFailed = averageScore <= 2 || redFlags.length > 0;

  return {
    testCaseId: testCase.id,
    patientCategory: testCase.category,
    averageScore,
    isFailed,
    dimensions,
    redFlags,
    allWarnings: allViolations,
    generatedDataSnapshot: {
      timeline: generatedData.timelineCache.map(t => ({ name: t.name, phase: t.phase })),
      cost: generatedData.costCache.totalEstimatedCost,
      reasoning: generatedData.confidenceData?.reasoningSummary
    }
  };
};
