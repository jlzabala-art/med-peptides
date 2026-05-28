const fs = require('fs');
const path = require('path');

const PROTOCOLS_FILE = path.join(__dirname, '../src/data/protocolBlueprintsV2.json');

const protocolUpdates = {
  // Specific Overrides
  "wm_001": {
    synergy_rationale: "Tirzepatide powerfully suppresses appetite and improves glycemic control via GLP-1/GIP. However, rapid weight loss can slow metabolism. MOTS-c is added to activate AMPK and preserve mitochondrial metabolic rate, counteracting the metabolic adaptation often seen with incretins alone.",
    expected_outcomes: ["Reduced appetite and food noise", "Progressive visceral and subcutaneous fat loss", "Improved metabolic efficiency", "Preservation of metabolic rate during deficit"],
    clinical_timeline: [
      { phase: "Weeks 1-4", expected: "Appetite suppression begins. Water weight drops. Mild GI adaptation." },
      { phase: "Weeks 5-8", expected: "Accelerated fat loss. Improved fasting glucose. Energy levels stabilize." },
      { phase: "Weeks 9-12", expected: "Significant body composition shifts. Visceral fat reduction measurable." }
    ],
    recommended_supplements: ["berberine", "magnesium-glycinate", "b-complex"]
  },
  "met_001": {
    synergy_rationale: "MOTS-c acts centrally and peripherally to activate AMPK and improve insulin sensitivity. AOD-9604 directly targets adipocytes to stimulate lipolysis without affecting blood glucose. Together, they shift the body from fat-storage to fat-oxidation mode.",
    expected_outcomes: ["Enhanced insulin sensitivity", "Targeted fat oxidation", "Improved exercise capacity", "Stabilized energy levels"],
    clinical_timeline: [
      { phase: "Weeks 1-3", expected: "Increased stamina during exercise. Stabilized blood sugar." },
      { phase: "Weeks 4-7", expected: "Noticeable reduction in stubborn fat areas. Enhanced thermogenesis." },
      { phase: "Weeks 8-10", expected: "Long-term metabolic flexibility improved." }
    ],
    recommended_supplements: ["berberine", "nmn", "resveratrol"]
  },
  "rec_001": {
    synergy_rationale: "BPC-157 signals for cellular repair, collagen synthesis, and angiogenesis via FAK-paxillin. TB-500 works synergistically by sequestering actin, which gives cells the flexibility and motility to migrate into the new vessels and tissues created by BPC-157.",
    expected_outcomes: ["Accelerated soft tissue healing", "Reduced systemic inflammation", "Improved joint mobility", "Faster recovery from surgical interventions or injuries"],
    clinical_timeline: [
      { phase: "Weeks 1-2", expected: "Significant reduction in acute pain and inflammation." },
      { phase: "Weeks 3-5", expected: "Improved range of motion. Accelerated healing of the primary site." },
      { phase: "Weeks 6-8", expected: "Tissue remodeling and strengthening. Return to activity." }
    ],
    recommended_supplements: ["curcumin", "boswellia", "omega-3-forte", "bromelain"]
  },
  "cog_001": {
    synergy_rationale: "Semax acts as a powerful nootropic by upregulating BDNF and enhancing dopaminergic tone, which can sometimes be overstimulating. Selank acts as a GABAergic modulator, dampening anxiety and HPA-axis stress. Together, they create a state of 'calm focus'—high cognitive output without the jitteriness.",
    expected_outcomes: ["Enhanced focus and executive function", "Reduction in stress-induced anxiety", "Improved memory consolidation", "Clearer cognitive processing"],
    clinical_timeline: [
      { phase: "Weeks 1-2", expected: "Immediate reduction in brain fog and acute anxiety." },
      { phase: "Weeks 3-4", expected: "Noticeable improvements in sustained focus and stress resilience." },
      { phase: "Weeks 5-6", expected: "Enhanced learning capacity and memory recall." }
    ],
    recommended_supplements: ["lion-s-mane-mushroom", "ginkgo-biloba", "l-theanine"]
  },
  "sleep_001": {
    synergy_rationale: "DSIP induces deep, restorative delta-wave sleep. However, high cortisol can prevent sleep onset. Selank is used concurrently to lower CRF-driven HPA hyperactivation (cortisol), allowing DSIP to effectively initiate and maintain deep sleep.",
    expected_outcomes: ["Faster sleep onset", "Increased duration of deep (delta) sleep", "Reduced nighttime awakenings", "Lowered evening cortisol levels"],
    clinical_timeline: [
      { phase: "Weeks 1-2", expected: "Easier transition to sleep. Reduction in racing thoughts at night." },
      { phase: "Weeks 3-5", expected: "Fewer awakenings. Feeling more rested upon waking." },
      { phase: "Weeks 6-8", expected: "Normalized circadian rhythm. Deep sleep architecture restored." }
    ],
    recommended_supplements: ["magnesium-threonate", "ashwagandha", "melatonin"]
  }
};

const categoryDefaults = {
  "Weight Management / Obesity": {
    lifestyle: {
      nutrition: "High protein (>1.5g/kg body weight), caloric deficit (15-20%), high fiber.",
      activity: "Resistance training 3-4x weekly to preserve lean mass. 8,000+ daily steps.",
      hydration: "Minimum 3 liters of water daily with electrolytes.",
      sleep: "7-8 hours to minimize cortisol-driven insulin resistance."
    },
    recommended_supplements: ["berberine", "magnesium-glycinate"],
    expected_outcomes: ["Weight reduction", "Appetite control", "Improved metabolic markers"]
  },
  "Metabolic Health": {
    lifestyle: {
      nutrition: "Low glycemic index, Mediterranean style, intermittent fasting (e.g., 16:8) optional.",
      activity: "Zone 2 cardio 150 mins/week + HIIT 1x/week.",
      hydration: "2.5-3 liters daily.",
      sleep: "Consistent sleep schedule to support circadian metabolic rhythms."
    },
    recommended_supplements: ["nmn", "resveratrol", "berberine"],
    expected_outcomes: ["Improved insulin sensitivity", "Enhanced metabolic flexibility", "Better energy levels"]
  },
  "Recovery / Injury": {
    lifestyle: {
      nutrition: "Maintenance calories, high protein, anti-inflammatory foods (omega-3s, antioxidants).",
      activity: "Physical therapy protocols, active recovery, avoid loading injured tissue.",
      hydration: "Adequate hydration to support tissue elasticity.",
      sleep: "8+ hours for optimal GH release and tissue repair."
    },
    recommended_supplements: ["curcumin", "boswellia", "omega-3-forte"],
    expected_outcomes: ["Reduced pain", "Accelerated healing", "Decreased inflammation"]
  },
  "Cognitive Support": {
    lifestyle: {
      nutrition: "Brain-healthy fats (DHA/EPA), antioxidant-rich foods, avoid sugar spikes.",
      activity: "Aerobic exercise to promote neurogenesis (BDNF).",
      hydration: "Consistent hydration (even mild dehydration impairs cognition).",
      sleep: "Focus on REM and deep sleep for memory consolidation."
    },
    recommended_supplements: ["lion-s-mane-mushroom", "ginkgo-biloba", "acetyl-carnitine"],
    expected_outcomes: ["Improved focus", "Better memory retention", "Reduced mental fatigue"]
  },
  "Longevity": {
    lifestyle: {
      nutrition: "Nutrient-dense, slight caloric restriction or time-restricted eating.",
      activity: "Mix of resistance training, Zone 2, and mobility work.",
      hydration: "Standard adequate hydration.",
      sleep: "Strict adherence to circadian rhythms."
    },
    recommended_supplements: ["nmn", "resveratrol", "spermidine", "quercetin"],
    expected_outcomes: ["Improved cellular markers", "Enhanced vitality", "Mitochondrial support"]
  },
  "Sleep Support": {
    lifestyle: {
      nutrition: "Avoid heavy meals 3 hours before bed. Limit evening carbohydrates.",
      activity: "Morning sunlight exposure. Avoid intense workouts late evening.",
      hydration: "Limit fluids 2 hours before bed.",
      sleep: "Cold room (18°C), blackout curtains, no blue light 1 hour prior."
    },
    recommended_supplements: ["magnesium-threonate", "l-theanine", "ashwagandha"],
    expected_outcomes: ["Improved sleep architecture", "Faster sleep onset", "Better recovery"]
  },
  "Hormonal Support": {
    lifestyle: {
      nutrition: "Adequate healthy fats for hormone production. Sufficient protein.",
      activity: "Heavy compound lifting to stimulate natural GH/Testosterone.",
      hydration: "Standard adequate hydration.",
      sleep: "Deep sleep is critical for natural hormone pulses."
    },
    recommended_supplements: ["zinc-citrate", "vit-d3", "ashwagandha"],
    expected_outcomes: ["Hormonal balance", "Improved body composition", "Enhanced vitality"]
  },
  "Skin / Anti-Aging": {
    lifestyle: {
      nutrition: "High antioxidants, Vitamin C, collagen peptides, high water content foods.",
      activity: "Regular exercise to improve dermal blood flow.",
      hydration: "High hydration is critical for skin turgor.",
      sleep: "Adequate sleep for tissue regeneration ('beauty sleep')."
    },
    recommended_supplements: ["hyaluronic-acid", "resveratrol", "quercetin"],
    expected_outcomes: ["Improved skin elasticity", "Reduced fine lines", "Enhanced tissue repair"]
  },
  "Immune Support": {
    lifestyle: {
      nutrition: "Nutrient-dense, low sugar (sugar impairs phagocytosis).",
      activity: "Moderate daily activity (avoid overtraining which suppresses immunity).",
      hydration: "Adequate hydration for lymphatic function.",
      sleep: "Prioritize sleep length and quality."
    },
    recommended_supplements: ["vit-d3", "zinc-citrate", "nac", "quercetin"],
    expected_outcomes: ["Enhanced immune response", "Reduced illness duration", "Better resilience"]
  },
  "Energy / Mitochondrial": {
    lifestyle: {
      nutrition: "Mitochondrial-supportive diet (healthy fats, B-vitamins).",
      activity: "Consistent aerobic exercise.",
      hydration: "Standard adequate hydration.",
      sleep: "Quality sleep to clear metabolic waste."
    },
    recommended_supplements: ["co-q10", "nmn", "rhodiola-rosea", "b-complex"],
    expected_outcomes: ["Sustained energy", "Reduced cellular fatigue", "Enhanced mitochondrial function"]
  }
};

console.log('Reading protocols database...');
let protocols = JSON.parse(fs.readFileSync(PROTOCOLS_FILE, 'utf8'));
let updatedCount = 0;

for (let protocol of protocols) {
  const goal = protocol.primary_goal;
  const id = protocol.protocol_id;

  const defaults = categoryDefaults[goal] || categoryDefaults["Longevity"]; // Fallback
  const specific = protocolUpdates[id] || {};

  // 1. Lifestyle
  if (!protocol.lifestyle) {
    protocol.lifestyle = defaults.lifestyle;
  }

  // 2. Synergy Rationale
  if (specific.synergy_rationale) {
    protocol.synergy_rationale = specific.synergy_rationale;
  } else if (!protocol.synergy_rationale) {
    // Generate a generic one if missing and multi-drug
    if (protocol.phases && protocol.phases[0] && protocol.phases[0].drugs_used && protocol.phases[0].drugs_used.length > 1) {
       protocol.synergy_rationale = "This multi-compound protocol is designed to provide synergistic effects, targeting multiple complementary biological pathways simultaneously to achieve " + goal.toLowerCase() + " more effectively than monotherapy.";
    }
  }

  // 3. Recommended Supplements
  if (!protocol.recommended_supplements) {
    protocol.recommended_supplements = specific.recommended_supplements || defaults.recommended_supplements;
  }

  // 4. Expected Outcomes (Standardization)
  if (!protocol.expected_outcomes || protocol.expected_outcomes.length === 0) {
    protocol.expected_outcomes = specific.expected_outcomes || defaults.expected_outcomes;
  } else if (specific.expected_outcomes) {
    protocol.expected_outcomes = specific.expected_outcomes; // Override with better ones if available
  }

  // 5. Clinical Timeline
  if (!protocol.clinical_timeline && specific.clinical_timeline) {
    protocol.clinical_timeline = specific.clinical_timeline;
  } else if (!protocol.clinical_timeline) {
     // Generic timeline
     protocol.clinical_timeline = [
        { phase: "Phase 1 (Initiation)", expected: "Cellular adaptation and initial biomarker shifts. Minor adjustment symptoms may occur." },
        { phase: "Phase 2 (Active/Maintenance)", expected: "Primary clinical outcomes become measurable. Sustained biological modulation." }
     ];
  }

  updatedCount++;
}

fs.writeFileSync(PROTOCOLS_FILE, JSON.stringify(protocols, null, 2), 'utf8');
console.log(`Successfully enriched ${updatedCount} protocols.`);
