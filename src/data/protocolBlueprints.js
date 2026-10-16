 
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
      adjuvants: [
        {
          slug: "colway-colvita",
          name: "Colvita Bioactive Native Collagen & Marine Algae",
          category: "Nutraceutical",
          dosage: "2 capsules daily with meals",
          role: "Provides rate-limiting freeze-dried fish tropocollagen oligopeptides (triple-helix preserved) and marine bladderwrack minerals to accelerate tendon, ligament, and cartilage neo-collagenesis."
        }
      ],
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
      adjuvants: [
        {
          slug: "colway-blue-diamond-cream",
          name: "Colway Blue Diamond Cream",
          category: "Facial Cosmeceutical",
          dosage: "Apply morning and night",
          role: "VEP-endorphin peptides and native fish tropocollagen bio-scaffold for dermal fibroblast stimulation."
        },
        {
          slug: "colway-blue-diamond-peeling",
          name: "Colway Blue Diamond Peeling",
          category: "Facial Cosmeceutical",
          dosage: "2x weekly prior to evening routine",
          role: "Gemmological diamond micro-dermabrasion and enzymatic peel to clear senescent corneocytes and maximize peptide receptivity."
        },
        {
          slug: "colway-colvita",
          name: "Colvita Bioactive Native Collagen & Marine Algae",
          category: "Nutraceutical",
          dosage: "2 capsules daily with meals",
          role: "Systemic oral tropocollagen triple-helix bio-scaffold supporting dermal matrix elasticity and fibroblast density."
        }
      ],
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
  },
  hairRestoration: {
    title: "Comprehensive Follicular Hair Restoration Protocol",
    summary: {
      goal: "Reverse follicular miniaturization, block scalp DHT, and reactivate dormant anagen growth.",
      duration: "16 weeks",
      benefits: ["Increased hair density", "Inhibition of scalp DHT", "Extended anagen phase", "Cuticle & peribulbar matrix reinforcement"]
    },
    phases: [
      {
        name: "Phase 1: Follicular Activation & Ostium Detox",
        weeks: 8,
        startWeek: 1,
        endWeek: 8,
        goal: "Purify follicular ostia and stimulate dermal papilla microcirculation.",
        medications: [
          { name: "GHK-Cu", dosage: "2.5mg", weeklyDose: 17.5, frequency: "Daily subcutaneous / topical", route: "subcutaneous", days: ["Daily"], mgPerVial: 50 },
          { name: "Zinc Thymulin", dosage: "100mcg", weeklyDose: 0.7, frequency: "Daily topical", route: "topical", days: ["Daily"], mgPerVial: 5 }
        ]
      },
      {
        name: "Phase 2: Anagen Consolidation & Anchorage",
        weeks: 8,
        startWeek: 9,
        endWeek: 16,
        goal: "Lock in follicular Collagen XVII anchorage and prevent hair shaft shedding.",
        medications: [
          { name: "GHK-Cu", dosage: "2mg", weeklyDose: 14, frequency: "Daily", route: "subcutaneous", days: ["Daily"], mgPerVial: 50 }
        ]
      }
    ],
    monitoring: [
      { week: 8, labs: ["Trichoscopy Analysis", "Serum Ferritin", "Vitamin D3", "Total & Free Testosterone"], note: "Evaluate hair density and microcirculatory vascularization" }
    ],
    safetyFlags: [
      { trigger: "Scalp irritation", alert: "Use Colway Strengthening Conditioner after each wash to maintain epicutaneous moisture." }
    ],
    expectedResults: {
      metric: "Increase in anagen-to-telogen ratio by >25%",
      observations: ["Reduced hair fall in shower", "Thicker hair shaft diameter", "Scalp calm with zero erythema"]
    },
    lifestyle: {
      nutrition: ["High protein & collagen intake", "Adequate iron & zinc", "Omega-3 fatty acids"],
      activity: ["Scalp massage 5 min/day to promote capillary circulation"]
    },
    safety: {
      sideEffects: ["Mild scalp tingling after caffeine application"],
      recommendedTests: ["Dermatological assessment", "Trichogram"]
    },
    clinical_metadata: {
      clinical_goal: "hair_restoration",
      secondary_goals: ["alopecia_reduction", "follicular_activation", "dermal_matrix"],
      primary_compounds: ["ghk_cu", "zinc_thymulin"],
      adjuvants: [
        {
          slug: "colway-strengthening-shampoo",
          name: "Colway Strengthening Hair Shampoo",
          category: "Trichology Cosmeceutical",
          dosage: "3-4x weekly on wet scalp (2-3 min contact)",
          role: "Diosmin, caffeine and Baicapil™ 2% to clear follicular ostia and stimulate dermal papilla microvascular flow before GHK-Cu application."
        },
        {
          slug: "colway-strengthening-conditioner",
          name: "Colway Strengthening Hair Conditioner",
          category: "Trichology Cosmeceutical",
          dosage: "After every wash, leave 3-5 min before rinsing",
          role: "Native fish tropocollagen and bio-silica to seal the hair cuticle and reinforce follicular anchorage."
        },
        {
          slug: "colway-colvita",
          name: "Colvita Bioactive Native Collagen & Marine Algae",
          category: "Nutraceutical",
          dosage: "2 capsules daily with meals",
          role: "Systemic tropocollagen and marine algae to supply structural amino acids for keratin synthesis and follicular dermal papilla extracellular matrix."
        }
      ],
      protocol_class: "trichological_based",
      duration_weeks: 16,
      intensity_level: "moderate"
    }
  },

  colwayDermoRenewal: {
    id: "colway-dermo-renewal",
    slug: "colway-dermo-renewal",
    title: "Colway Dermo-Renewal & Cellular Collagen Ritual",
    name: "Colway Dermo-Renewal & Cellular Collagen Ritual",
    category: "Skin / Anti-Aging",
    therapeutic_category: "Dermocosmetic Neocollagenesis & Enzymatic Diamond Micro-Exfoliation",
    summary: {
      goal: "Stimulate dermal fibroblast neocollagenesis, polish cutaneous micro-texture, and restore the hydrolipid protective barrier.",
      duration: "10 weeks",
      benefits: [
        "Elimination of senescent corneocytes via papain/subtilisin enzymatic action",
        "Neocollagenesis trigger via VEP-carrier peptides & CoQ10",
        "Intense transdermal hydration and skin turgor restoration",
        "Microbiome & cutaneous acid mantle stabilization (pH 5.5)"
      ]
    },
    phases: [
      {
        name: "Phase 1: Hydrolipid Preparation & Enzymatic Clearance",
        weeks: 4,
        startWeek: 1,
        endWeek: 4,
        goal: "Purify skin with sulfate-free amphoteric matrix and eliminate keratolytic debris via diamond micro-peel.",
        medications: [
          { name: "Cellular Collagen Hydrolipid Wash Gel", dosage: "1-2 pumps", weeklyDose: 14, frequency: "Twice daily (AM/PM)", route: "topical", days: ["Daily"], productSlug: "colway-collagen-wash-gel" },
          { name: "Blue Diamond Peeling", dosage: "Dime size", weeklyDose: 2, frequency: "2x weekly (Evening)", route: "topical", days: ["Wednesday", "Sunday"], productSlug: "colway-blue-diamond-peeling" },
          { name: "Blue Diamond Cream", dosage: "1 spatula", weeklyDose: 14, frequency: "Daily morning & evening", route: "topical", days: ["Daily"], productSlug: "colway-blue-diamond-cream" }
        ]
      },
      {
        name: "Phase 2: Dermal Architecture Consolidation",
        weeks: 6,
        startWeek: 5,
        endWeek: 10,
        goal: "Deep neocollagenesis, VEP peptide delivery, and long-term dermal firming.",
        medications: [
          { name: "Cellular Collagen Hydrolipid Wash Gel", dosage: "1-2 pumps", weeklyDose: 14, frequency: "Twice daily (AM/PM)", route: "topical", days: ["Daily"], productSlug: "colway-collagen-wash-gel" },
          { name: "Blue Diamond Cream", dosage: "1 spatula", weeklyDose: 14, frequency: "Daily morning & evening", route: "topical", days: ["Daily"], productSlug: "colway-blue-diamond-cream" }
        ]
      }
    ],
    items: [
      { name: "Colway Blue Diamond Cream (50 mL)", dosage: "Apply AM/PM to face and neck", route: "Topical", frequency: "Daily", slug: "colway-blue-diamond-cream" },
      { name: "Colway Blue Diamond Peeling (75 mL)", dosage: "Apply 2x weekly with gentle circular massage", route: "Topical", frequency: "2x Weekly", slug: "colway-blue-diamond-peeling" },
      { name: "Colway Cellular Collagen Hydrolipid Wash Gel (250 mL)", dosage: "Gentle cleanse AM/PM with lukewarm water", route: "Topical", frequency: "Twice Daily", slug: "colway-collagen-wash-gel" }
    ],
    monitoring: [
      { week: 4, labs: ["High-Frequency Dermal Ultrasound", "Visia Skin Analysis"], note: "Evaluate epidermal thickness, dermal echogenicity, and wrinkle volume reduction." }
    ],
    safetyFlags: [
      { trigger: "Active Erythema", alert: "Do not vigorously scrub peeling over active broken capillaries or rosacea flare-ups; let enzymes act without mechanical friction." }
    ],
    expectedResults: {
      metric: "Increase in skin hydration (+42%) and dermal elasticity (+28%)",
      observations: ["Immediate luminous complexion", "Zero dryness or stripping", "Firm contour definition"]
    },
    lifestyle: {
      nutrition: ["Drink minimum 2L water daily", "Support with oral antioxidant vitamin C", "Collagen peptide rich broths"],
      activity: ["Facial lymphatic drainage massage during cream application", "Strict SPF 50+ mineral sun protection"]
    },
    safety: {
      sideEffects: ["None observed in dermatological testing (CPNP registered, EU 1223/2009 compliant)."],
      recommendedTests: ["Dermatological baseline consultation"]
    },
    clinical_metadata: {
      clinical_goal: "skin_rejuvenation",
      secondary_goals: ["anti_aging", "corneocyte_renewal", "hydrolipid_barrier", "collagen_synthesis"],
      primary_compounds: ["native_tropocollagen", "vep_peptides", "diamond_micro_dust"],
      protocol_class: "cosmeceutical_based",
      duration_weeks: 10,
      intensity_level: "gentle"
    }
  },

  colwayHairRestoration: {
    id: "colway-hair-restoration",
    slug: "colway-hair-restoration",
    title: "Colway Anti-DHT Follicular Hair Restoration Protocol",
    name: "Colway Anti-DHT Follicular Hair Restoration Protocol",
    category: "Hair Loss / Scalp Health",
    therapeutic_category: "Follicular Stem Cell Activation & 5α-Reductase Scalp Shield",
    summary: {
      goal: "Arrest follicular miniaturization, clear sebum DHT, extend the anagen growth phase, and lock Collagen XVII at the dermal papilla.",
      duration: "16 weeks",
      benefits: [
        "Inhibition of scalp 5α-reductase without systemic anti-androgen side effects",
        "Stimulation of dermal papilla stem cells via Baicapil™ 2% botanical complex",
        "Microvascular perfusion boost through micronized diosmin and caffeine",
        "Systemic amino acid delivery for keratin synthesis via lyophilized Colvita"
      ]
    },
    phases: [
      {
        name: "Phase 1: Ostium Detox & Microvascular Priming",
        weeks: 8,
        startWeek: 1,
        endWeek: 8,
        goal: "Decongest sebaceous ostia, reduce scalp inflammation, and initiate follicular recruitment.",
        medications: [
          { name: "Strengthening Hair Shampoo", dosage: "5-10 mL", weeklyDose: 4, frequency: "3-4x weekly", route: "topical scalp", days: ["Mon", "Wed", "Fri", "Sun"], productSlug: "colway-strengthening-shampoo" },
          { name: "Strengthening Hair Conditioner", dosage: "5-10 mL", weeklyDose: 4, frequency: "3-4x weekly after wash", route: "topical hair", days: ["Mon", "Wed", "Fri", "Sun"], productSlug: "colway-strengthening-conditioner" },
          { name: "Colvita Bioactive Collagen", dosage: "2 capsules", weeklyDose: 14, frequency: "Daily with main meals", route: "oral", days: ["Daily"], productSlug: "colway-colvita" }
        ]
      },
      {
        name: "Phase 2: Anagen Anchorage & Stem Cell Consolidation",
        weeks: 8,
        startWeek: 9,
        endWeek: 16,
        goal: "Consolidate Collagen XVII anchoring fibrils and increase hair shaft tensile thickness.",
        medications: [
          { name: "Strengthening Hair Shampoo", dosage: "5-10 mL", weeklyDose: 3, frequency: "3x weekly", route: "topical scalp", days: ["Tue", "Thu", "Sat"], productSlug: "colway-strengthening-shampoo" },
          { name: "Strengthening Hair Conditioner", dosage: "5-10 mL", weeklyDose: 3, frequency: "3x weekly", route: "topical hair", days: ["Tue", "Thu", "Sat"], productSlug: "colway-strengthening-conditioner" },
          { name: "Colvita Bioactive Collagen", dosage: "2 capsules", weeklyDose: 14, frequency: "Daily with meals", route: "oral", days: ["Daily"], productSlug: "colway-colvita" }
        ]
      }
    ],
    items: [
      { name: "Colway Strengthening Hair Shampoo (250 mL)", dosage: "Massage into wet scalp for 2-3 min, rinse with cool water", route: "Topical", frequency: "3-4x Weekly", slug: "colway-strengthening-shampoo" },
      { name: "Colway Strengthening Hair Conditioner (200 mL)", dosage: "Apply roots to ends, leave 3-5 min, rinse", route: "Topical", frequency: "After Every Wash", slug: "colway-strengthening-conditioner" },
      { name: "Colvita Bioactive Native Collagen (60/120 Caps)", dosage: "2 capsules daily with a glass of water and meal", route: "Oral", frequency: "Daily", slug: "colway-colvita" }
    ],
    monitoring: [
      { week: 8, labs: ["Digital Trichoscopy (Fotofinder)", "Hair Pull Test", "Serum Ferritin & Zinc"], note: "Quantify anagen/telogen ratio and hair shaft caliber." }
    ],
    safetyFlags: [
      { trigger: "Post-Hair Transplant", alert: "Safe to resume Colway Strengthening Shampoo starting Day 14 post-FUE once graft sites have fully re-epithelialized." }
    ],
    expectedResults: {
      metric: "Hair density improvement (+18% to +26%) and shedding reduction (-60%)",
      observations: ["Dramatically less hair in drain after week 4", "Increased volume and hair anchoring", "Absence of scalp sebum itchiness"]
    },
    lifestyle: {
      nutrition: ["High sulfur amino acids (cysteine, methionine)", "Iron & Biotin optimization", "Adequate protein intake (1.5g/kg)"],
      activity: ["Daily circular scalp massage for 3-5 minutes", "Avoid excessive heat styling >160°C"]
    },
    safety: {
      sideEffects: ["None; 100% free of finasteride/minoxidil systemic cardiovascular or endocrine side effects."],
      recommendedTests: ["Trichogram", "Serum 25-OH Vitamin D3", "Free Testosterone", "Ferritin"]
    },
    clinical_metadata: {
      clinical_goal: "hair_restoration",
      secondary_goals: ["alopecia_reduction", "follicular_stem_cells", "dht_block", "collagen_xvii"],
      primary_compounds: ["baicapil_2pct", "diosmin", "native_tropocollagen", "keratin"],
      protocol_class: "trichological_based",
      duration_weeks: 16,
      intensity_level: "moderate"
    }
  },

  colwayNutricosmetic: {
    id: "colway-nutricosmetic",
    slug: "colway-nutricosmetic",
    title: "Colway Extracellular Matrix & Cellular Longevity Protocol",
    name: "Colway Extracellular Matrix & Cellular Longevity Protocol",
    category: "Longevity & Cellular",
    therapeutic_category: "Systemic Native Tropocollagen & Chlorella Plant Hydroxyproline Bio-Scaffold",
    summary: {
      goal: "Supply the systemic amino acid pool (Gly-Pro-Hyp) required for fibroblast neo-collagenesis, protect joint cartilage, and reinforce connective tissue longevity.",
      duration: "12 weeks",
      benefits: [
        "Freeze-dried active native fish tropocollagen preserving the intact triple-helix",
        "Marine algae Fucus vesiculosus supplying organic trace iodine and minerals",
        "Dual inside-out synergy: oral systemic replenishment + transdermal vegan matrix",
        "Zero gastric degradation: rapid small-intestine oligopeptide transcellular uptake"
      ]
    },
    phases: [
      {
        name: "Phase 1: Systemic ECM Saturation",
        weeks: 6,
        startWeek: 1,
        endWeek: 6,
        goal: "Saturate the systemic pool of native hydroxyproline and activate fibroblast receptors.",
        medications: [
          { name: "Colvita Bioactive Native Collagen", dosage: "2 capsules", weeklyDose: 14, frequency: "Twice daily with meals (1 AM, 1 PM)", route: "oral", days: ["Daily"], productSlug: "colway-colvita" },
          { name: "Collagen Vege Airless Gel", dosage: "1-2 pumps", weeklyDose: 7, frequency: "Every evening on moist skin", route: "topical", days: ["Daily"], productSlug: "colway-collagen-vege" }
        ]
      },
      {
        name: "Phase 2: Cellular Longevity & Neocollagenesis Maintenance",
        weeks: 6,
        startWeek: 7,
        endWeek: 12,
        goal: "Maintain optimal extracellular matrix density and connective tissue resilience.",
        medications: [
          { name: "Colvita Bioactive Native Collagen", dosage: "2 capsules", weeklyDose: 14, frequency: "Morning with breakfast", route: "oral", days: ["Daily"], productSlug: "colway-colvita" },
          { name: "Collagen Vege Airless Gel", dosage: "1-2 pumps", weeklyDose: 7, frequency: "Every evening on moist skin", route: "topical", days: ["Daily"], productSlug: "colway-collagen-vege" }
        ]
      }
    ],
    items: [
      { name: "Colway Colvita Freeze-Dried Native Collagen (60/120 Caps)", dosage: "2 capsules daily with a glass of water and meal", route: "Oral", frequency: "Daily", slug: "colway-colvita" },
      { name: "Colway Collagen Vege (45 mL)", dosage: "1-2 pumps applied on clean, slightly damp skin every evening", route: "Topical", frequency: "Nightly", slug: "colway-collagen-vege" }
    ],
    monitoring: [
      { week: 6, labs: ["HS-Omega-3 Index", "Intracellular NAD+ DBS", "Dermal Biometric Elasticity"], note: "Assess cellular membrane lipid balance and biological aging rate." }
    ],
    safetyFlags: [
      { trigger: "Iodine Sensitivity", alert: "Colvita contains natural bladderwrack algae (Fucus vesiculosus) with organic trace iodine. Consult your endocrinologist if diagnosed with active untreated hyperthyroidism or Hashimoto's with high iodine sensitivity." }
    ],
    expectedResults: {
      metric: "Connective tissue joint comfort (+35%) and skin barrier hydration (+40%)",
      observations: ["Reduced morning joint stiffness", "Smoother skin texture over entire body", "Strengthened nail beds and thicker hair"]
    },
    lifestyle: {
      nutrition: ["Vitamin C rich foods to act as essential cofactor for lysyl oxidase crosslinking", "Plenty of mineralized water"],
      activity: ["Low-impact resistance training to stimulate mechanical osteocyte and chondrocyte signaling"]
    },
    safety: {
      sideEffects: ["Extremely well tolerated; food supplement registered across the European Union under EFSA guidelines."],
      recommendedTests: ["Thyroid panel (TSH, Free T4) if sensitive to natural marine iodine"]
    },
    clinical_metadata: {
      clinical_goal: "extracellular_matrix_longevity",
      secondary_goals: ["anti_aging", "joint_health", "skin_turgor", "collagen_triple_helix"],
      primary_compounds: ["native_tropocollagen", "fucus_algae", "chlorella_hydroxyproline"],
      protocol_class: "cosmeceutical_based",
      duration_weeks: 12,
      intensity_level: "gentle"
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
  "Aesthetics & Skin Rejuvenation": "skinAntiAging",
  "Hair Restoration / Alopecia": "hairRestoration",
  "Hair Loss / Scalp Health": "hairRestoration",
  "Immune / Inflammation": "immuneInflammation",
  "Energy / Mitochondrial": "energyMitochondrial",
  "Other / General Wellness": "generalSupport"
};
