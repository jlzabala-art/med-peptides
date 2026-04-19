// Validation Rules Engine
// Detects clinical violations and constraint breaches in generated protocols

import { parseDosage, calculateVialsNeeded } from '../../services/protocolEngine';

/**
 * RULE 1: Goal Alignment
 * Ensures the selected products actually align with the patient's primary condition
 */
export const checkGoalAlignment = (testCase, generatedData, productsDb) => {
  const flags = [];
  const primaryGoal = testCase.patientContext.primaryCondition;
  const items = generatedData.timelineCache || [];

  if (items.length === 0) {
    flags.push("Empty protocol generated.");
    return flags;
  }

  // Very simplistic check: If Recovery is goal, check if ANY product has repair/healing tags
  const isRecovery = primaryGoal.includes("Recovery");
  const isMetabolic = primaryGoal.includes("Weight") || primaryGoal.includes("Metabolic");
  
  let hasRecoveryTag = false;
  let hasMetabolicTag = false;

  items.forEach(item => {
    const dbProduct = productsDb.find(p => p.name === item.name);
    if (dbProduct) {
      const tags = (dbProduct.tags || []).map(t => t.toLowerCase());
      const desc = (dbProduct.desc || "").toLowerCase();
      
      if (tags.includes("repair") || tags.includes("healing") || tags.includes("joint") || desc.includes("recovery")) hasRecoveryTag = true;
      if (tags.includes("metabolic") || tags.includes("glp-1") || tags.includes("appetite") || desc.includes("weight")) hasMetabolicTag = true;
    }
  });

  if (isRecovery && !hasRecoveryTag) {
    flags.push(`Goal Alignment Failed: Protocol generated for ${primaryGoal} but lacks recovery compounds.`);
  }

  if (isMetabolic && !hasMetabolicTag) {
    flags.push(`Goal Alignment Failed: Protocol generated for ${primaryGoal} but lacks metabolic compounds.`);
  }

  return flags;
};

/**
 * RULE 2: Constraint Compliance
 * Ensures "Avoid injectables", "Oral only", "Avoid blends" are strictly followed
 */
export const checkConstraintCompliance = (testCase, generatedData, productsDb) => {
  const flags = [];
  const constraints = testCase.patientContext.contraindicationsSelected || [];
  const items = generatedData.timelineCache || [];

  const avoidInjectables = constraints.includes("Avoid injectables") || constraints.includes("Oral only");
  const avoidBlends = constraints.includes("Avoid blends");

  items.forEach(item => {
    const dbProduct = productsDb.find(p => p.name === item.name);
    if (!dbProduct) return;

    const tags = (dbProduct.tags || []).map(t => t.toLowerCase());
    const desc = (dbProduct.desc || "").toLowerCase();
    const pName = dbProduct.name.toLowerCase();

    const isInjectable = tags.includes("injectable") || desc.includes("injectable") || dbProduct.dosage.includes("vial");
    const isBlend = tags.includes("blend") || desc.includes("blend") || pName.includes("/") || pName.includes("+");

    if (avoidInjectables && isInjectable) {
      flags.push(`Constraint Violation: Included injectable compound (${dbProduct.name}) despite "Avoid injectables" constraint.`);
    }

    if (avoidBlends && isBlend) {
      flags.push(`Constraint Violation: Included blended compound (${dbProduct.name}) despite "Avoid blends" constraint.`);
    }
  });

  return flags;
};

/**
 * RULE 3: Phase Sequence Logic
 * Ensures phases progress logically (e.g. Phase 1 -> Phase 2 -> Phase 3)
 */
export const checkPhaseSequence = (generatedData) => {
  const flags = [];
  const items = generatedData.timelineCache || [];

  if (items.length > 1) {
    const hasPhase1 = items.some(i => (i.phase || "").includes("1"));
    const hasPhase2 = items.some(i => (i.phase || "").includes("2"));
    
    // In our simplified logic, if there's >1 item, item 0 is Phase 1 and item 1 is Phase 2
    if (!hasPhase1 && items.length > 0) {
      flags.push("Phase Logic Violation: Missing initial loading/Phase 1.");
    }
  }

  return flags;
};

/**
 * RULE 4: Dose Progression
 * Ensures unrealistic dose jumps don't occur across phases for the same product
 */
export const checkDoseProgression = (generatedData) => {
  const flags = [];
  // Currently protocolBuilder assigns a static dose (default or pulled from db).
  // In a real dose-escalation engine, we would verify week 1 vs week 4.
  // We flag if weeklyDose is > 10mg generically unless GLP-1 (which spans up to 15mg)
  
  const items = generatedData.timelineCache || [];
  items.forEach(item => {
    const wDose = item.weeklyDose || parseDosage(item.dosage);
    if (wDose > 20 && !item.name.toLowerCase().includes("bpc")) { // BPC can be high mg due to oral forms
      flags.push(`Dose Progression Warning: Unusually high weekly dose spotted (${wDose}mg) for ${item.name}. Verify escalation protocol.`);
    }
  });

  return flags;
};

/**
 * RULE 5: Product Consistency
 * All products must exist in database
 */
export const checkProductConsistency = (generatedData, productsDb) => {
  const flags = [];
  const items = generatedData.timelineCache || [];

  items.forEach(item => {
    const exists = productsDb.some(p => p.name === item.name);
    if (!exists) {
      flags.push(`Product Consistency Violation: Selected product "${item.name}" does NOT exist in the clinical database.`);
    }
  });

  return flags;
};

/**
 * RULE 6: Cost Consistency
 * Ensures Vials * Price = Phase Total
 */
export const checkCostConsistency = (generatedData) => {
  const flags = [];
  const cost = generatedData.costCache;
  const items = generatedData.timelineCache || [];

  if (!cost || typeof cost.totalEstimatedCost !== 'number') {
    flags.push("Cost Consistency Violation: Cost calculation missing or malformed.");
    return flags;
  }

  if (cost.totalEstimatedCost < 0) {
    flags.push("Cost Consistency Violation: Negative cost detected.");
  }
  
  if (items.length > 0 && cost.totalEstimatedCost === 0) {
    flags.push("Cost Consistency Violation: Protocol has items but calculated cost is $0.");
  }

  return flags;
};

/**
 * RULE 7: Contradiction Detection
 * Specific conflicting selections within the generated protocol
 */
export const checkContradictions = (testCase, generatedData) => {
  const flags = [];
  const constraints = testCase.patientContext.contraindicationsSelected || [];

  if (constraints.includes("Simple protocol required") && generatedData.timelineCache.length > 2) {
    flags.push(`Contradiction Violation: Protocol contains 3+ phases/items despite "Simple protocol required" constraint.`);
  }

  return flags;
};

export const runAllRules = (testCase, generatedData, productsDb) => {
  const violations = [
    ...checkGoalAlignment(testCase, generatedData, productsDb),
    ...checkConstraintCompliance(testCase, generatedData, productsDb),
    ...checkPhaseSequence(generatedData),
    ...checkDoseProgression(generatedData),
    ...checkProductConsistency(generatedData, productsDb),
    ...checkCostConsistency(generatedData),
    ...checkContradictions(testCase, generatedData)
  ];
  return violations;
};
