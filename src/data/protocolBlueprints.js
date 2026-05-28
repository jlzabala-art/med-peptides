 
export const PROTOCOL_BLUEPRINTS = {
  metabolicWeightLoss: {
    title: "Personalized Metabolic Weight Loss Protocol",
    summary: {
      goal: "Reduce appetite, burn fat, and improve your metabolism safely.",
      duration: "16 weeks",
      benefits: [
        "Control hunger",
        "Reduce cravings",
        "Burn body fat",
        "Maintain long-term weight loss"
      ]
    },
    phases: [
      {
        name: "Phase 1: Start the Metabolism",
        weeks: 4,
        startWeek: 1,
        endWeek: 4,
        goal: "Reduce hunger, activate metabolism, prepare your body.",
        medications: [
          { name: "Tirzepatide", dosage: "2.5mg", weeklyDose: 2.5, frequency: "Weekly Injection", route: "subcutaneous", days: ["Sunday"], mgPerVial: 10 },
          { name: "MOTS-C", dosage: "5mg", weeklyDose: 15, frequency: "3 times per week", route: "subcutaneous", days: ["Monday", "Wednesday", "Friday"], mgPerVial: 10 }
        ]
      },
      {
        name: "Phase 2: Active Fat Loss",
        weeks: 8,
        startWeek: 5,
        endWeek: 12,
        goal: "Burn body fat, maintain appetite control, prevent weight loss plateau.",
        medications: [
          { name: "Tirzepatide", dosage: "7.5mg", weeklyDose: 7.5, frequency: "Weekly Injection", route: "subcutaneous", days: ["Sunday"], mgPerVial: 10 },
          { name: "AOD-9604", dosage: "300mcg", weeklyDose: 2.1, frequency: "Daily morning", route: "oral/subcutaneous", days: ["Daily"], mgPerVial: 2 },
          { name: "MOTS-C", dosage: "5mg", weeklyDose: 15, frequency: "3 times per week", route: "subcutaneous", days: ["Monday", "Wednesday", "Friday"], mgPerVial: 10 }
        ]
      },
      {
        name: "Phase 3: Stabilization",
        weeks: 4,
        startWeek: 13,
        endWeek: 16,
        goal: "Maintain weight loss, avoid rebound hunger, stabilize metabolism.",
        medications: [
          { name: "Tirzepatide", dosage: "10mg", weeklyDose: 10, frequency: "Weekly Injection", route: "subcutaneous", days: ["Sunday"], mgPerVial: 10 },
          { name: "MOTS-C", dosage: "5mg", weeklyDose: 10, frequency: "2 times per week", route: "subcutaneous", days: ["Monday", "Thursday"], mgPerVial: 10 }
        ]
      }
    ],
    monitoring: [
      { week: 4, labs: ["Fasting Glucose", "Basic Metabolic Panel"], note: "Assess initial tolerance and glucose response" },
      { week: 12, labs: ["HbA1c", "Lipid Panel", "Liver Enzymes"], note: "Mid-protocol efficacy check" }
    ],
    safetyFlags: [
      { trigger: "Sleep sensitive", alert: "Avoid taking AOD-9604 or MOTS-C in the evening. Dose in the morning." }
    ],
    expectedResults: {
      weightLoss: "8–14 kg in 12–16 weeks",
      observations: ["Reduced hunger", "Fewer cravings", "Easier portion control", "Visible fat loss"]
    },
    lifestyle: {
      nutrition: ["Eat high protein meals", "Avoid sugary drinks", "Eat 2–3 meals daily", "Reduce processed foods"],
      activity: ["Minimum: 8,000–10,000 steps/day", "Strength training 3x/week"]
    },
    safety: {
      sideEffects: ["Nausea", "Mild reflux", "Reduced appetite"],
      recommendedTests: ["Blood glucose", "HbA1c", "Lipids", "Liver enzymes"]
    },
    clinical_metadata: {
      clinical_goal: "weight_loss",
      secondary_goals: ["fat_loss", "insulin_sensitivity", "metabolic_health"],
      primary_compounds: ["tirzepatide", "mots_c", "aod_9604"],
      protocol_class: "glp1_based",
      duration_weeks: 16,
      intensity_level: "high"
    }
  },
  recoveryInjury: {
    title: "Accelerated Tissue Recovery Protocol",
    summary: {
      goal: "Accelerate tissue repair, reduce systemic inflammation.",
      duration: "12 weeks",
      benefits: ["Faster injury healing", "Reduced systemic inflammation", "Improved joint mobility", "Muscle repair"]
    },
    phases: [
      {
        name: "Phase 1: Acute Healing",
        weeks: 4,
        startWeek: 1,
        endWeek: 4,
        goal: "Rapidly reduce inflammation and initiate tissue repair.",
        medications: [
          { name: "BPC-157", dosage: "250mcg", weeklyDose: 3.5, frequency: "Twice daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 5 },
          { name: "TB-500", dosage: "2.5mg", weeklyDose: 5, frequency: "Twice weekly", route: "subcutaneous", days: ["Tuesday", "Saturday"], mgPerVial: 5 }
        ]
      },
      {
        name: "Phase 2: Continued Remodeling",
        weeks: 8,
        startWeek: 5,
        endWeek: 12,
        goal: "Support ongoing collagen synthesis and structural repair.",
        medications: [
          { name: "BPC-157", dosage: "250mcg", weeklyDose: 1.75, frequency: "Once daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 5 },
          { name: "GHK-Cu", dosage: "2mg", weeklyDose: 14, frequency: "Daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 50 }
        ]
      }
    ],
    monitoring: [
      { week: 6, labs: ["CRP", "ESR"], note: "Check systemic inflammation markers" }
    ],
    safetyFlags: [
      { trigger: "Needle aversion", alert: "BPC-157 is available in oral format for GI healing, but systemic musculoskeletal healing is best via injection." }
    ],
    expectedResults: {
      metric: "Reduction in pain scale by 4-6 points",
      observations: ["Decreased joint pain", "Faster post-workout recovery", "Improved mobility"]
    },
    lifestyle: {
      nutrition: ["High collagen intake", "Omega-3 supplementation", "Adequate protein"],
      activity: ["Physical therapy", "Progressive overload as tolerated"]
    },
    safety: {
      sideEffects: ["Injection site redness (especially GHK-Cu)", "Mild fatigue"],
      recommendedTests: ["Inflammatory panels"]
    },
    clinical_metadata: {
      clinical_goal: "recovery",
      secondary_goals: ["anti_inflammatory", "tissue_repair", "joint_mobility"],
      primary_compounds: ["bpc_157", "tb_500", "ghk_cu"],
      protocol_class: "regenerative_based",
      duration_weeks: 12,
      intensity_level: "moderate"
    }
  },
  cognitiveSupport: {
    title: "Neuro-Cognitive Enhancement Protocol",
    summary: {
      goal: "Enhance focus, memory, and neuroplasticity.",
      duration: "8 weeks",
      benefits: ["Sharper focus", "Better memory retention", "Reduced brain fog", "Neuroprotection"]
    },
    phases: [
      {
        name: "Phase 1: Neuro-Activation",
        weeks: 4,
        startWeek: 1,
        endWeek: 4,
        goal: "Stimulate neurogenesis and improve immediate focus.",
        medications: [
          { name: "Semax", dosage: "200mcg", weeklyDose: 1.4, frequency: "Daily morning", route: "subcutaneous/nasal", days: ["Daily"], mgPerVial: 10 },
          { name: "Cerebrolysin", dosage: "5ml", weeklyDose: 25, frequency: "5 days on, 2 off", route: "intramuscular", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], mgPerVial: 5 }
        ]
      },
      {
        name: "Phase 2: Maintenance & Plasticity",
        weeks: 4,
        startWeek: 5,
        endWeek: 8,
        goal: "Consolidate neural pathways and maintain cognitive endurance.",
        medications: [
          { name: "Selank", dosage: "250mcg", weeklyDose: 1.75, frequency: "Daily", route: "subcutaneous/nasal", days: ["Daily"], mgPerVial: 5 },
          { name: "Dihexa", dosage: "10mg", weeklyDose: 70, frequency: "Daily", route: "oral", days: ["Daily"], mgPerVial: 10 }
        ]
      }
    ],
    monitoring: [
      { week: 4, labs: ["Homocysteine", "Vitamin B12", "Folate"], note: "Assess methylation" }
    ],
    safetyFlags: [],
    expectedResults: {
      metric: "Enhanced cognitive stamina",
      observations: ["Better recall", "Sustained focus through the day", "Reduced mental fatigue"]
    },
    lifestyle: {
      nutrition: ["Omega-3s", "Antioxidant-rich foods", "Hydration"],
      activity: ["Aerobic exercise for blood flow", "Cognitive training"]
    },
    safety: {
      sideEffects: ["Mild headache", "Over-stimulation if taken late"],
      recommendedTests: ["Standard metabolic panel"]
    },
    clinical_metadata: {
      clinical_goal: "cognitive_support",
      secondary_goals: ["neuroprotection", "mental_clarity", "stress_reduction"],
      primary_compounds: ["semax", "cerebrolysin", "selank", "dihexa"],
      protocol_class: "nootropic_based",
      duration_weeks: 8,
      intensity_level: "moderate"
    }
  },
  sleepSupport: {
    title: "Deep Sleep & Circadian Reset Protocol",
    summary: {
      goal: "Restore natural circadian rhythms and enhance deep sleep.",
      duration: "6 weeks",
      benefits: ["Faster sleep onset", "Increased REM/Deep sleep", "Better morning energy"]
    },
    phases: [
      {
        name: "Phase 1: Circadian Reset",
        weeks: 3,
        startWeek: 1,
        endWeek: 3,
        goal: "Force circadian alignment and induce deep sleep.",
        medications: [
          { name: "DSIP", dosage: "100mcg", weeklyDose: 0.3, frequency: "3x weekly before bed", route: "subcutaneous", days: ["Mon", "Wed", "Fri"], mgPerVial: 5 },
          { name: "Epitalon", dosage: "1mg", weeklyDose: 7, frequency: "Daily night", route: "subcutaneous", days: ["Daily"], mgPerVial: 10 }
        ]
      },
      {
        name: "Phase 2: Sleep Maintenance",
        weeks: 3,
        startWeek: 4,
        endWeek: 6,
        goal: "Maintain consistent sleep architecture with lighter support.",
        medications: [
          { name: "Epitalon", dosage: "1mg", weeklyDose: 3, frequency: "3x weekly", route: "subcutaneous", days: ["Mon", "Wed", "Fri"], mgPerVial: 10 }
        ]
      }
    ],
    monitoring: [
      { week: 3, labs: ["Cortisol AM", "DHEA"], note: "Check adrenal response" }
    ],
    safetyFlags: [],
    expectedResults: {
      metric: "Increased sleep efficiency > 85%",
      observations: ["Waking up refreshed", "Fewer nighttime awakenings"]
    },
    lifestyle: {
      nutrition: ["Limit caffeine after 12PM", "No heavy meals before bed"],
      activity: ["Morning sunlight exposure", "Evening wind-down routine"]
    },
    safety: {
      sideEffects: ["Morning grogginess (rare)"],
      recommendedTests: ["Cortisol curve"]
    },
    clinical_metadata: {
      clinical_goal: "longevity",
      secondary_goals: ["sleep_quality", "circadian_reset", "anti_aging"],
      primary_compounds: ["dsip", "epitalon"],
      protocol_class: "epigenetic_based",
      duration_weeks: 6,
      intensity_level: "low"
    }
  },
  hormonalSupport: {
    title: "Hormonal Optimization & GH Secretagogue Protocol",
    summary: {
      goal: "Naturally stimulate growth hormone and optimize systemic hormones.",
      duration: "16 weeks",
      benefits: ["Improved body composition", "Better skin/hair", "Increased vitality"]
    },
    phases: [
      {
        name: "Phase 1: Secretagogue Loading",
        weeks: 8,
        startWeek: 1,
        endWeek: 8,
        goal: "Stimulate natural GH pulsatility.",
        medications: [
          { name: "Ipamorelin", dosage: "200mcg", weeklyDose: 1.4, frequency: "Nightly", route: "subcutaneous", days: ["Daily"], mgPerVial: 5 },
          { name: "CJC-1295 (No DAC)", dosage: "100mcg", weeklyDose: 0.7, frequency: "Nightly", route: "subcutaneous", days: ["Daily"], mgPerVial: 2 }
        ]
      },
      {
        name: "Phase 2: Sustained Pulse",
        weeks: 8,
        startWeek: 9,
        endWeek: 16,
        goal: "Maintain GH levels while preventing desensitization.",
        medications: [
          { name: "Tesamorelin", dosage: "1mg", weeklyDose: 5, frequency: "5 days on, 2 off", route: "subcutaneous", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], mgPerVial: 2 }
        ]
      }
    ],
    monitoring: [
      { week: 8, labs: ["IGF-1", "Fasting Insulin"], note: "Monitor GH response and insulin sensitivity" }
    ],
    safetyFlags: [
      { trigger: "Cancer history", alert: "GH secretagogues are contraindicated in active malignancy." }
    ],
    expectedResults: {
      metric: "Increase in IGF-1 levels",
      observations: ["Fat loss around midsection", "Better sleep", "Improved recovery"]
    },
    lifestyle: {
      nutrition: ["Fasting 2 hours before night injection"],
      activity: ["Heavy resistance training"]
    },
    safety: {
      sideEffects: ["Water retention", "Tingling in hands", "Mild insulin resistance"],
      recommendedTests: ["IGF-1", "HbA1c"]
    },
    clinical_metadata: {
      clinical_goal: "longevity",
      secondary_goals: ["body_composition", "fat_loss", "recovery"],
      primary_compounds: ["ipamorelin", "cjc_1295", "tesamorelin"],
      protocol_class: "gh_secretagogue_based",
      duration_weeks: 16,
      intensity_level: "moderate"
    }
  },
  skinAntiAging: {
    title: "Cellular Rejuvenation & Skin Protocol",
    summary: {
      goal: "Promote collagen synthesis and cellular youth.",
      duration: "10 weeks",
      benefits: ["Thicker, more elastic skin", "Reduced wrinkles", "Telomere support"]
    },
    phases: [
      {
        name: "Phase 1: Intensive Collagen Synthesis",
        weeks: 6,
        startWeek: 1,
        endWeek: 6,
        goal: "Flood system with copper peptides for skin remodeling.",
        medications: [
          { name: "GHK-Cu", dosage: "2mg", weeklyDose: 14, frequency: "Daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 50 },
          { name: "Epitalon", dosage: "1mg", weeklyDose: 7, frequency: "Daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 10 }
        ]
      },
      {
        name: "Phase 2: Cellular Clearance",
        weeks: 4,
        startWeek: 7,
        endWeek: 10,
        goal: "Senolytic clearance of aged cells.",
        medications: [
          { name: "FoxO4-DRI", dosage: "3mg", weeklyDose: 9, frequency: "Every other day", route: "subcutaneous", days: ["Mon", "Wed", "Fri"], mgPerVial: 10 }
        ]
      }
    ],
    monitoring: [
      { week: 5, labs: ["Serum Copper", "Zinc"], note: "Ensure copper/zinc balance with GHK-Cu use" }
    ],
    safetyFlags: [],
    expectedResults: {
      metric: "Visible improvement in skin elasticity",
      observations: ["Reduced fine lines", "Better hair health", "Glowing skin"]
    },
    lifestyle: {
      nutrition: ["Zinc supplementation needed to balance copper"],
      activity: ["Sun protection"]
    },
    safety: {
      sideEffects: ["Post-injection pain (GHK-Cu)"],
      recommendedTests: ["Copper/Zinc ratio"]
    },
    clinical_metadata: {
      clinical_goal: "longevity",
      secondary_goals: ["anti_aging", "skin_health", "cellular_rejuvenation"],
      primary_compounds: ["ghk_cu", "epitalon", "foxo4_dri"],
      protocol_class: "epigenetic_based",
      duration_weeks: 10,
      intensity_level: "low"
    }
  },
  immuneInflammation: {
    title: "Immune Modulation Protocol",
    summary: {
      goal: "Balance immune response and fight systemic pathogens.",
      duration: "8 weeks",
      benefits: ["Enhanced immunity", "Reduced autoimmune flares", "Antimicrobial support"]
    },
    phases: [
      {
        name: "Phase 1: Immune Priming",
        weeks: 4,
        startWeek: 1,
        endWeek: 4,
        goal: "Modulate T-cell function and reduce systemic inflammation.",
        medications: [
          { name: "Thymosin Alpha-1 (TA1)", dosage: "1.5mg", weeklyDose: 3, frequency: "Twice weekly", route: "subcutaneous", days: ["Mon", "Thu"], mgPerVial: 10 },
          { name: "LL-37", dosage: "100mcg", weeklyDose: 0.3, frequency: "3x weekly", route: "subcutaneous", days: ["Mon", "Wed", "Fri"], mgPerVial: 2 }
        ]
      },
      {
        name: "Phase 2: Sustained Modulation",
        weeks: 4,
        startWeek: 5,
        endWeek: 8,
        goal: "Maintain balanced immune surveillance.",
        medications: [
          { name: "Thymosin Alpha-1 (TA1)", dosage: "1.5mg", weeklyDose: 1.5, frequency: "Once weekly", route: "subcutaneous", days: ["Sun"], mgPerVial: 10 }
        ]
      }
    ],
    monitoring: [
      { week: 4, labs: ["CBC with Differential", "ANA"], note: "Monitor white blood cell counts" }
    ],
    safetyFlags: [],
    expectedResults: {
      metric: "Fewer sick days / reduced flare intensity",
      observations: ["Better resistance to seasonal illness", "Reduced joint/systemic aches"]
    },
    lifestyle: {
      nutrition: ["Vitamin D3 + K2", "Vitamin C"],
      activity: ["Moderate exercise (avoid overtraining)"]
    },
    safety: {
      sideEffects: ["Mild fatigue during initial immune response"],
      recommendedTests: ["CBC"]
    },
    clinical_metadata: {
      clinical_goal: "anti_inflammatory",
      secondary_goals: ["immune_modulation", "longevity", "recovery"],
      primary_compounds: ["thymosin_alpha1", "ll_37"],
      protocol_class: "immunomodulatory_based",
      duration_weeks: 8,
      intensity_level: "moderate"
    }
  },
  energyMitochondrial: {
    title: "Mitochondrial Energy Optimization",
    summary: {
      goal: "Enhance ATP production and mitochondrial efficiency.",
      duration: "12 weeks",
      benefits: ["More stamina", "Reduced chronic fatigue", "Better metabolic flexibility"]
    },
    phases: [
      {
        name: "Phase 1: Mitochondrial Kickstart",
        weeks: 4,
        startWeek: 1,
        endWeek: 4,
        goal: "Up-regulate mitochondrial function via AMPK activation.",
        medications: [
          { name: "MOTS-C", dosage: "10mg", weeklyDose: 10, frequency: "Once weekly", route: "subcutaneous", days: ["Monday"], mgPerVial: 10 },
          { name: "SS-31 (Elamipretide)", dosage: "4mg", weeklyDose: 28, frequency: "Daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 50 }
        ]
      },
      {
        name: "Phase 2: Sustained Energy & NAD+",
        weeks: 8,
        startWeek: 5,
        endWeek: 12,
        goal: "Support newly functioning mitochondria and cellular energy.",
        medications: [
          { name: "NAD+", dosage: "100mg", weeklyDose: 200, frequency: "Twice weekly", route: "subcutaneous", days: ["Tue", "Fri"], mgPerVial: 500 },
          { name: "MOTS-C", dosage: "5mg", weeklyDose: 5, frequency: "Once weekly", route: "subcutaneous", days: ["Monday"], mgPerVial: 10 }
        ]
      }
    ],
    monitoring: [
      { week: 6, labs: ["Lactate", "Metabolic Panel"], note: "Check ATP efficiency markers" }
    ],
    safetyFlags: [],
    expectedResults: {
      metric: "Improved VO2 Max and daily energy score",
      observations: ["No afternoon crashes", "Better workout endurance"]
    },
    lifestyle: {
      nutrition: ["Intermittent fasting to support mitophagy"],
      activity: ["Zone 2 cardio"]
    },
    safety: {
      sideEffects: ["Intravenous/injection NAD+ can cause transient chest pressure/nausea"],
      recommendedTests: ["Standard Bloods"]
    },
    clinical_metadata: {
      clinical_goal: "metabolic_health",
      secondary_goals: ["longevity", "mitochondrial_support", "anti_inflammatory"],
      primary_compounds: ["mots_c", "ss_31", "nad_plus"],
      protocol_class: "mitochondrial_based",
      duration_weeks: 12,
      intensity_level: "high"
    }
  },
  generalSupport: {
    title: "General Wellness & Optimization",
    summary: {
      goal: "Baseline systemic improvement for overall health.",
      duration: "8 weeks",
      benefits: ["Balanced recovery", "Mild anti-aging", "General vitality"]
    },
    phases: [
      {
        name: "Phase 1: Systemic Balance",
        weeks: 8,
        startWeek: 1,
        endWeek: 8,
        goal: "Provide baseline healing and regulatory peptides.",
        medications: [
          { name: "BPC-157", dosage: "250mcg", weeklyDose: 1.75, frequency: "Daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 5 },
          { name: "CJC-1295 / Ipamorelin", dosage: "300mcg", weeklyDose: 1.5, frequency: "5 days on, 2 off", route: "subcutaneous", days: ["Mon", "Tue", "Wed", "Thu", "Fri"], mgPerVial: 5 }
        ]
      }
    ],
    monitoring: [],
    safetyFlags: [],
    expectedResults: {
      metric: "Overall wellness score improvement",
      observations: ["Better sleep", "Less aches and pains", "More balanced energy"]
    },
    lifestyle: {
      nutrition: ["Balanced whole foods"],
      activity: ["Regular daily movement"]
    },
    safety: {
      sideEffects: ["Minimal side effects expected"],
      recommendedTests: []
    },
    clinical_metadata: {
      clinical_goal: "recovery",
      secondary_goals: ["anti_inflammatory", "longevity", "sleep_quality"],
      primary_compounds: ["bpc_157", "cjc_1295", "ipamorelin"],
      protocol_class: "regenerative_based",
      duration_weeks: 8,
      intensity_level: "low"
    }
  }
};

export const BLUEPRINT_MAPPING = {
  "Weight Management / Obesity": "metabolicWeightLoss",
  "Metabolic Health": "metabolicWeightLoss",
  "Recovery / Injury": "recoveryInjury",
  "Cognitive Support": "cognitiveSupport",
  "Sleep Support": "sleepSupport",
  "Hormonal Support": "hormonalSupport",
  "Skin / Anti-Aging": "skinAntiAging",
  "Immune / Inflammation": "immuneInflammation",
  "Energy / Mitochondrial": "energyMitochondrial",
  "Other / General Wellness": "generalSupport"
};
