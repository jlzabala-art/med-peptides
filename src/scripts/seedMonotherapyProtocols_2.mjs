import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
if (getApps().length === 0) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const protocols = [
  // ============================================
  // METABOLIC & MUSCLE
  // ============================================
  {
    protocol_id: "5-amino-1mq-metabolic",
    protocol_name: "5-Amino-1MQ Metabolic Ignition",
    author: "RegenPept Clinical Team",
    primary_goal: "weight_loss",
    goals: ["weight_loss", "muscle_growth", "longevity"],
    description: "5-Amino-1MQ is a highly effective, small molecule that inhibits the NNMT enzyme, leading to a significant increase in NAD+ levels, basal metabolic rate, and fat burning, without stimulating the central nervous system.",
    target_audience: "Individuals targeting stubborn fat loss, metabolic syndrome reversal, and cellular energy optimization.",
    duration_weeks: 4,
    difficulty_level: "Intermediate",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Inhibits Nicotinamide N-methyltransferase (NNMT), freeing up SAM to increase cellular NAD+ concentrations, which dramatically increases lipid metabolism.",
      efficacy_summary: "In murine models, NNMT inhibition resulted in a 30% reduction in white adipose tissue volume with no loss of lean muscle mass.",
      scientific_references: [
        {
          title: "Nicotinamide N-methyltransferase knockdown protects against diet-induced obesity",
          authors: "Kraus et al.",
          journal: "Nature",
          year: 2014
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Metabolic Reprogramming",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "5-AMINO 1 MQ",
            dose_logic: {
              starting_weekly_dose: 350,
              dose_unit: "mg",
              administration_frequency: "Daily (50mg oral capsule or injection)",
              route_of_administration: "Oral / Subcutaneous",
              vial_strength: 50
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "fst-344-myostatin-blocker",
    protocol_name: "FST-344 Myostatin Inhibition",
    author: "RegenPept Clinical Team",
    primary_goal: "muscle_growth",
    goals: ["muscle_growth", "recovery"],
    description: "Follistatin-344 is a powerful myostatin inhibitor that allows for rapid and profound skeletal muscle hypertrophy.",
    target_audience: "Bodybuilders, athletes, and individuals dealing with severe muscle wasting conditions.",
    duration_weeks: 2,
    difficulty_level: "Expert",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Binds to and inhibits myostatin, a TGF-beta family member that normally limits muscle growth.",
      efficacy_summary: "Clinical and preclinical data shows significant increase in muscle mass and strength within short (10-20 day) cycles.",
      scientific_references: [
        {
          title: "Follistatin gene delivery enhances muscle growth and strength",
          authors: "Haidet et al.",
          journal: "PNAS",
          year: 2008
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Rapid Hypertrophy Window (10-14 days)",
        start_week: 1,
        end_week: 2,
        drugs: [
          {
            compound_name: "FST-344",
            dose_logic: {
              starting_weekly_dose: 0.7,
              dose_unit: "mg",
              administration_frequency: "Daily (100mcg/day for 10-14 days)",
              route_of_administration: "Subcutaneous",
              vial_strength: 1
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "igf1-lr3-muscle",
    protocol_name: "IGF-1 LR3 Hyperplasia Cycle",
    author: "RegenPept Clinical Team",
    primary_goal: "muscle_growth",
    goals: ["muscle_growth", "recovery"],
    description: "IGF-1 LR3 is a long-acting analog of human IGF-1. It significantly boosts nitrogen retention, protein synthesis, and most uniquely, promotes hyperplasia (creation of new muscle cells).",
    target_audience: "Advanced athletes looking for permanent muscle tissue gains and enhanced nutrient partitioning.",
    duration_weeks: 4,
    difficulty_level: "Advanced",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Binds to the IGF-1 receptor with high affinity and avoids deactivation by IGF-binding proteins, leading to extended half-life and cellular proliferation.",
      efficacy_summary: "Creates new satellite muscle cells (hyperplasia) rather than just increasing the size of existing cells (hypertrophy).",
      scientific_references: [
        {
          title: "IGF-1 LR3 as a potent anabolic agent",
          authors: "Tomas et al.",
          journal: "Journal of Endocrinology",
          year: 1995
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Hyperplasia Induction",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "IGF-LR3",
            dose_logic: {
              starting_weekly_dose: 0.35,
              dose_unit: "mg",
              administration_frequency: "Daily (50mcg post-workout or daily)",
              route_of_administration: "Subcutaneous / Intramuscular",
              vial_strength: 1
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "peg-mgf-muscle-repair",
    protocol_name: "PEG-MGF Localized Growth & Repair",
    author: "RegenPept Clinical Team",
    primary_goal: "recovery",
    goals: ["recovery", "muscle_growth"],
    description: "PEG-MGF (Pegylated Mechano Growth Factor) is a splice variant of IGF-1 produced naturally when a muscle is placed under stress. It stimulates stem cell proliferation to repair and grow localized muscle tissue.",
    target_audience: "Athletes recovering from specific muscle tears, injuries, or bringing up lagging muscle groups.",
    duration_weeks: 4,
    difficulty_level: "Intermediate",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Activates muscle stem cells (satellite cells) to proliferate and fuse with damaged muscle fibers. Pegylation extends its systemic half-life from minutes to days.",
      efficacy_summary: "Accelerates healing of micro-tears and promotes localized hypertrophy when administered into the target muscle.",
      scientific_references: [
        {
          title: "Mechano growth factor (MGF) and its role in muscle repair",
          authors: "Goldspink G.",
          journal: "Journal of Anatomy",
          year: 2003
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Targeted Tissue Proliferation",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "PEG MGF",
            dose_logic: {
              starting_weekly_dose: 1.2,
              dose_unit: "mg",
              administration_frequency: "3x Weekly (400mcg per application, split bilaterally)",
              route_of_administration: "Intramuscular (Localized)",
              vial_strength: 2
            }
          }
        ]
      }
    ]
  },

  // ============================================
  // HORMONAL & SEXUAL HEALTH
  // ============================================
  {
    protocol_id: "kisspeptin-hpta-restart",
    protocol_name: "Kisspeptin-10 HPTA Axis Restart",
    author: "RegenPept Clinical Team",
    primary_goal: "sexual_health",
    goals: ["sexual_health", "muscle_growth"],
    description: "Kisspeptin-10 directly stimulates the release of GnRH from the hypothalamus, leading to a robust, pulsatile release of LH and FSH, restarting natural testosterone production.",
    target_audience: "Men coming off exogenous androgens seeking PCT, or individuals with secondary hypogonadism.",
    duration_weeks: 4,
    difficulty_level: "Intermediate",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Binds to the GPR54 receptor on GnRH neurons, driving the upstream signaling cascade for gonadotropin release.",
      efficacy_summary: "Clinical trials consistently demonstrate robust, dose-dependent increases in LH and testosterone in healthy and hypogonadal men.",
      scientific_references: [
        {
          title: "Kisspeptin-10, a novel stimulator of the LH axis in men",
          authors: "Dhillo et al.",
          journal: "Journal of Clinical Endocrinology & Metabolism",
          year: 2005
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Hypothalamic Stimulation",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Kisspeptin-10",
            dose_logic: {
              starting_weekly_dose: 0.7,
              dose_unit: "mg",
              administration_frequency: "Daily (0.1mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "pt141-libido-enhancement",
    protocol_name: "PT-141 (Bremelanotide) Libido & Arousal",
    author: "RegenPept Clinical Team",
    primary_goal: "sexual_health",
    goals: ["sexual_health", "brain_health"],
    description: "PT-141 (Bremelanotide) works via the central nervous system to induce arousal and treat erectile dysfunction (ED) and hypoactive sexual desire disorder (HSDD) without relying on vascular mechanics like PDE5 inhibitors.",
    target_audience: "Men with PDE5-resistant ED, and women with low libido.",
    duration_weeks: 4,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Activates melanocortin receptors (MC3R and MC4R) in the brain, modulating sexual arousal and behavior pathways.",
      efficacy_summary: "FDA-approved (as Vyleesi) for female sexual dysfunction; highly effective in men for achieving spontaneous erections.",
      scientific_references: [
        {
          title: "Efficacy of bremelanotide for erectile dysfunction",
          authors: "Rosen et al.",
          journal: "International Journal of Impotence Research",
          year: 2004
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "On-Demand Arousal",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "PT-141",
            dose_logic: {
              starting_weekly_dose: 3.5,
              dose_unit: "mg",
              administration_frequency: "As needed (1-2mg, 2-4 hours prior to activity, max 2x/week)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  
  // ============================================
  // AESTHETICS
  // ============================================
  {
    protocol_id: "mt2-melanogenesis",
    protocol_name: "MT2 Photoprotection & Tanning",
    author: "RegenPept Clinical Team",
    primary_goal: "skin_hair",
    goals: ["skin_hair", "sexual_health"],
    description: "Melanotan II (MT2) is an alpha-MSH analog that strongly stimulates melanogenesis (skin darkening) and provides systemic photoprotection against UV damage. It also acts as an aphrodisiac.",
    target_audience: "Individuals seeking a protective tan without excessive UV exposure, or those seeking simultaneous libido enhancement.",
    duration_weeks: 4,
    difficulty_level: "Intermediate",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Non-selective agonist of melanocortin receptors (MC1R for skin, MC4R for libido), triggering melanin production.",
      efficacy_summary: "Produces significant, sustained skin pigmentation even with minimal UV exposure.",
      scientific_references: [
        {
          title: "Melanotan II: a synthetic peptide analog of alpha-MSH",
          authors: "Dorr et al.",
          journal: "Life Sciences",
          year: 1996
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Loading & Maintenance",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "MT2",
            dose_logic: {
              starting_weekly_dose: 1.5,
              dose_unit: "mg",
              administration_frequency: "Daily loading (0.25mg/day for week 1), then 2x weekly maintenance",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "snap8-wrinkle-reduction",
    protocol_name: "Snap-8 Wrinkle Defense",
    author: "RegenPept Clinical Team",
    primary_goal: "skin_hair",
    goals: ["skin_hair", "longevity"],
    description: "Snap-8 is an elongated version of Argireline (acetyl octapeptide-3). It reduces the depth of wrinkles on the face caused by the contraction of muscles of facial expression.",
    target_audience: "Individuals looking for a non-toxic alternative to Botox for facial aesthetics.",
    duration_weeks: 4,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Competes with SNAP-25 in the SNARE complex, mildly inhibiting the release of acetylcholine and thus reducing muscle contraction intensity.",
      efficacy_summary: "Clinical cosmetic studies show up to a 34% reduction in wrinkle depth after 28 days of regular application.",
      scientific_references: [
        {
          title: "Anti-wrinkle efficacy of synthetic peptides",
          authors: "Blanes-Mira et al.",
          journal: "International Journal of Cosmetic Science",
          year: 2002
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Topical Maintenance",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Snap-8",
            dose_logic: {
              starting_weekly_dose: 14,
              dose_unit: "mg",
              administration_frequency: "Daily (2mg/day via micro-needling or deep topical delivery)",
              route_of_administration: "Topical / Meso",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  }
];

async function addProtocols() {
  console.log(`Starting to add ${protocols.length} Metabolic/Hormonal/Aesthetic protocols...`);
  const batch = db.batch();
  
  for (const protocol of protocols) {
    const docRef = db.collection('protocols').doc(protocol.protocol_id);
    const dataToSave = {
      ...protocol,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    };
    batch.set(docRef, dataToSave, { merge: true });
    console.log(`Queued: ${protocol.protocol_name}`);
  }
  
  await batch.commit();
  console.log('Successfully committed all Part 2 protocols to Firestore.');
}

addProtocols().catch(console.error).finally(() => process.exit(0));
