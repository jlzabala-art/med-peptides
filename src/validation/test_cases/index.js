// Clinical Validation Test Suite - 50 Structured Scenarios

const METABOLIC_CASES = [
  {
    id: "TC-MET-01",
    category: "Metabolic",
    description: "Standard Obesity + appetite dysregulation",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: []
    }
  },
  {
    id: "TC-MET-02",
    category: "Metabolic",
    description: "GLP-1 experienced patient - Advanced",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "45-54",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: ["Advanced allowed"]
    }
  },
  {
    id: "TC-MET-03",
    category: "Metabolic",
    description: "High cravings, needs simple protocol",
    patientContext: {
      patientType: "New patient",
      ageGroup: "25-34",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: ["Simple protocol required"]
    }
  },
  {
    id: "TC-MET-04",
    category: "Metabolic",
    description: "Weight plateau - Metabolic Health focus",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "35-44",
      primaryCondition: "Metabolic Health",
      contraindicationsSelected: []
    }
  },
  {
    id: "TC-MET-05",
    category: "Metabolic",
    description: "Low injection tolerance - prefers oral",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: ["Prefer oral", "Needle aversion"]
    }
  },
  {
    id: "TC-MET-06",
    category: "Metabolic",
    description: "Metabolic Health - Avoids Blends",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Metabolic Health",
      contraindicationsSelected: ["Avoid blends"]
    }
  },
  {
    id: "TC-MET-07",
    category: "Metabolic",
    description: "Budget sensitive weight loss",
    patientContext: {
      patientType: "New patient",
      ageGroup: "25-34",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: ["Budget sensitive"]
    }
  },
  {
    id: "TC-MET-08",
    category: "Metabolic",
    description: "High adherence required - Metabolic Health",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "35-44",
      primaryCondition: "Metabolic Health",
      contraindicationsSelected: ["High adherence required"]
    }
  },
  {
    id: "TC-MET-09",
    category: "Metabolic",
    description: "Metabolic + Sleep sensitive",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Metabolic Health",
      contraindicationsSelected: ["Sleep sensitive"]
    }
  },
  {
    id: "TC-MET-10",
    category: "Metabolic",
    description: "Obesity + ready protocols preferred",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: ["Prefer ready protocols"]
    }
  }
];

const RECOVERY_CASES = [
  {
    id: "TC-REC-01",
    category: "Recovery",
    description: "General muscle injury",
    patientContext: {
      patientType: "New patient",
      ageGroup: "25-34",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: []
    }
  },
  {
    id: "TC-REC-02",
    category: "Recovery",
    description: "Tendon injury - Advanced allowed",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "35-44",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Advanced allowed"]
    }
  },
  {
    id: "TC-REC-03",
    category: "Recovery",
    description: "Post-training recovery - Simple protocol",
    patientContext: {
      patientType: "New patient",
      ageGroup: "25-34",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Simple protocol required"]
    }
  },
  {
    id: "TC-REC-04",
    category: "Recovery",
    description: "Joint inflammation - Immune focus",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "45-54",
      primaryCondition: "Immune / Inflammation",
      contraindicationsSelected: []
    }
  },
  {
    id: "TC-REC-05",
    category: "Recovery",
    description: "Slow healing profile - Advanced recovery",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Advanced allowed"]
    }
  },
  {
    id: "TC-REC-06",
    category: "Recovery",
    description: "Injury recovery - Oral Only",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Oral only"]
    }
  },
  {
    id: "TC-REC-07",
    category: "Recovery",
    description: "Injury recovery - Avoid blends",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "25-34",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Avoid blends"]
    }
  },
  {
    id: "TC-REC-08",
    category: "Recovery",
    description: "Recovery - Budget sensitive",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Budget sensitive"]
    }
  },
  {
    id: "TC-REC-09",
    category: "Recovery",
    description: "Systemic inflammation - Sleep sensitive",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Immune / Inflammation",
      contraindicationsSelected: ["Sleep sensitive"]
    }
  },
  {
    id: "TC-REC-10",
    category: "Recovery",
    description: "Recovery - Prefer ready protocols",
    patientContext: {
      patientType: "New patient",
      ageGroup: "25-34",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Prefer ready protocols"]
    }
  }
];

const LONGEVITY_CASES = [
  {
    id: "TC-LONG-01",
    category: "Longevity",
    description: "Skin/Anti-aging basic",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Skin / Anti-Aging",
      contraindicationsSelected: []
    }
  },
  {
    id: "TC-LONG-02",
    category: "Longevity",
    description: "Hormonal Support - Advanced",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "55-64",
      primaryCondition: "Hormonal Support",
      contraindicationsSelected: ["Advanced allowed"]
    }
  },
  {
    id: "TC-LONG-03",
    category: "Longevity",
    description: "Energy / Mitochondrial - Simple",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Energy / Mitochondrial",
      contraindicationsSelected: ["Simple protocol required"]
    }
  },
  {
    id: "TC-LONG-04",
    category: "Longevity",
    description: "Anti-aging - Oral preference",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Skin / Anti-Aging",
      contraindicationsSelected: ["Prefer oral"]
    }
  },
  {
    id: "TC-LONG-05",
    category: "Longevity",
    description: "Hormonal Support - Avoid injectables",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Hormonal Support",
      contraindicationsSelected: ["Avoid injectables"]
    }
  },
  {
    id: "TC-LONG-06",
    category: "Longevity",
    description: "Mitochondrial - Avoid blends",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "45-54",
      primaryCondition: "Energy / Mitochondrial",
      contraindicationsSelected: ["Avoid blends"]
    }
  },
  {
    id: "TC-LONG-07",
    category: "Longevity",
    description: "Anti-aging - Sleep sensitive",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Skin / Anti-Aging",
      contraindicationsSelected: ["Sleep sensitive"]
    }
  },
  {
    id: "TC-LONG-08",
    category: "Longevity",
    description: "Hormonal - Budget sensitive",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Hormonal Support",
      contraindicationsSelected: ["Budget sensitive"]
    }
  },
  {
    id: "TC-LONG-09",
    category: "Longevity",
    description: "Mitochondrial - High Adherence",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "35-44",
      primaryCondition: "Energy / Mitochondrial",
      contraindicationsSelected: ["High adherence required"]
    }
  },
  {
    id: "TC-LONG-10",
    category: "Longevity",
    description: "Anti-aging - Prefer ready protocols",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Skin / Anti-Aging",
      contraindicationsSelected: ["Prefer ready protocols"]
    }
  }
];

const COGNITIVE_CASES = [
  {
    id: "TC-COG-01",
    category: "Cognitive",
    description: "Basic Cognitive Support",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Cognitive Support",
      contraindicationsSelected: []
    }
  },
  {
    id: "TC-COG-02",
    category: "Cognitive",
    description: "Sleep Support - Basic",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Sleep Support",
      contraindicationsSelected: []
    }
  },
  {
    id: "TC-COG-03",
    category: "Cognitive",
    description: "Cognitive Support - Advanced",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "25-34",
      primaryCondition: "Cognitive Support",
      contraindicationsSelected: ["Advanced allowed"]
    }
  },
  {
    id: "TC-COG-04",
    category: "Cognitive",
    description: "Sleep Support - Avoid Injectables",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Sleep Support",
      contraindicationsSelected: ["Avoid injectables"]
    }
  },
  {
    id: "TC-COG-05",
    category: "Cognitive",
    description: "Cognitive Support - Oral Only",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Cognitive Support",
      contraindicationsSelected: ["Oral only"]
    }
  },
  {
    id: "TC-COG-06",
    category: "Cognitive",
    description: "Sleep Support - Simple Protocol",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Sleep Support",
      contraindicationsSelected: ["Simple protocol required"]
    }
  },
  {
    id: "TC-COG-07",
    category: "Cognitive",
    description: "Cognitive Support - Avoid Blends",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "25-34",
      primaryCondition: "Cognitive Support",
      contraindicationsSelected: ["Avoid blends"]
    }
  },
  {
    id: "TC-COG-08",
    category: "Cognitive",
    description: "Sleep Support - High Adherence",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Sleep Support",
      contraindicationsSelected: ["High adherence required"]
    }
  },
  {
    id: "TC-COG-09",
    category: "Cognitive",
    description: "Cognitive Support - Budget Sensitive",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Cognitive Support",
      contraindicationsSelected: ["Budget sensitive"]
    }
  },
  {
    id: "TC-COG-10",
    category: "Cognitive",
    description: "Sleep Support - Prefer Ready Protocols",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Sleep Support",
      contraindicationsSelected: ["Prefer ready protocols"]
    }
  }
];

const EDGE_CASES = [
  {
    id: "TC-EDGE-01",
    category: "Edge Case",
    description: "Avoid injectables completely",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Avoid injectables"]
    }
  },
  {
    id: "TC-EDGE-02",
    category: "Edge Case",
    description: "Oral only strict constraint",
    patientContext: {
      patientType: "New patient",
      ageGroup: "45-54",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: ["Oral only"]
    }
  },
  {
    id: "TC-EDGE-03",
    category: "Edge Case",
    description: "Avoid blends completely",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "25-34",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Avoid blends"]
    }
  },
  {
    id: "TC-EDGE-04",
    category: "Edge Case",
    description: "Budget sensitive + Simple",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Skin / Anti-Aging",
      contraindicationsSelected: ["Budget sensitive", "Simple protocol required"]
    }
  },
  {
    id: "TC-EDGE-05",
    category: "Edge Case",
    description: "Conflicting preferences (Avoid Injectables + Advanced)",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "45-54",
      primaryCondition: "Hormonal Support",
      contraindicationsSelected: ["Avoid injectables", "Advanced allowed"]
    }
  },
  {
    id: "TC-EDGE-06",
    category: "Edge Case",
    description: "Conflicting (Oral only + Avoid Blends)",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Metabolic Health",
      contraindicationsSelected: ["Oral only", "Avoid blends"]
    }
  },
  {
    id: "TC-EDGE-07",
    category: "Edge Case",
    description: "All constraints checked (Unrealistic)",
    patientContext: {
      patientType: "New patient",
      ageGroup: "25-34",
      primaryCondition: "Recovery / Injury",
      contraindicationsSelected: ["Oral only", "Avoid blends", "Simple protocol required", "Budget sensitive", "Sleep sensitive"]
    }
  },
  {
    id: "TC-EDGE-08",
    category: "Edge Case",
    description: "Sleep Sensitive + Cognitive",
    patientContext: {
      patientType: "Experienced",
      ageGroup: "45-54",
      primaryCondition: "Cognitive Support",
      contraindicationsSelected: ["Sleep sensitive"]
    }
  },
  {
    id: "TC-EDGE-09",
    category: "Edge Case",
    description: "Ready Protocols + Avoid Blends (Conflict)",
    patientContext: {
      patientType: "New patient",
      ageGroup: "35-44",
      primaryCondition: "Weight Management / Obesity",
      contraindicationsSelected: ["Prefer ready protocols", "Avoid blends"]
    }
  },
  {
    id: "TC-EDGE-10",
    category: "Edge Case",
    description: "High Adherence + Simple Protocol",
    patientContext: {
      patientType: "New patient",
      ageGroup: "55-64",
      primaryCondition: "Energy / Mitochondrial",
      contraindicationsSelected: ["High adherence required", "Simple protocol required"]
    }
  }
];

export const VALIDATION_TEST_CASES = [
  ...METABOLIC_CASES,
  ...RECOVERY_CASES,
  ...LONGEVITY_CASES,
  ...COGNITIVE_CASES,
  ...EDGE_CASES
];
