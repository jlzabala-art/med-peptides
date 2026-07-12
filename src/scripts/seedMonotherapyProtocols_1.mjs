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
  // COGNITIVE & LONGEVITY
  // ============================================
  {
    protocol_id: "semax-cognitive-enhancement",
    protocol_name: "Semax Cognitive Enhancement",
    author: "RegenPept Clinical Team",
    primary_goal: "brain_health",
    goals: ["brain_health", "focus", "recovery"],
    description: "Semax is a potent nootropic peptide that increases BDNF (Brain-Derived Neurotrophic Factor) and enkephalins. It is highly effective for improving focus, memory, and cognitive stamina.",
    target_audience: "Professionals seeking cognitive enhancement, individuals recovering from mental fatigue or mild cognitive impairment.",
    duration_weeks: 4,
    difficulty_level: "Intermediate",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Increases levels of brain-derived neurotrophic factor (BDNF) and modulates the dopaminergic and serotonergic systems.",
      efficacy_summary: "Clinical trials in Russia have shown significant improvements in memory consolidation, attention span, and neuroprotection.",
      scientific_references: [
        {
          title: "Semax and its mechanisms of action in the brain",
          authors: "Dmitrieva et al.",
          journal: "Neuroscience and Behavioral Physiology",
          year: 2010
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Cognitive Optimization",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Semax",
            dose_logic: {
              starting_weekly_dose: 1.5,
              dose_unit: "mg",
              administration_frequency: "Daily (0.2mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "selank-anxiety-stress",
    protocol_name: "Selank Anxiolytic & Stress Protocol",
    author: "RegenPept Clinical Team",
    primary_goal: "brain_health",
    goals: ["brain_health", "sleep"],
    description: "Selank is a synthetic analog of the naturally occurring peptide tuftsin. It provides profound anxiolytic (anti-anxiety) effects without the sedative cognitive blunting associated with traditional benzodiazepines.",
    target_audience: "Individuals experiencing chronic stress, anxiety disorders, or seeking mood stabilization.",
    duration_weeks: 4,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Modulates the expression of interleukin-6 (IL-6) and impacts the balance of enkephalins in the brain, leading to reduced anxiety.",
      efficacy_summary: "Demonstrated to reduce anxiety and stress with an efficacy comparable to low-dose benzodiazepines but without addiction potential or sedation.",
      scientific_references: [
        {
          title: "Anxiolytic activity of Selank in clinical trials",
          authors: "Zozulya et al.",
          journal: "Bulletin of Experimental Biology and Medicine",
          year: 2008
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Stress Reduction",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Selank",
            dose_logic: {
              starting_weekly_dose: 1.75,
              dose_unit: "mg",
              administration_frequency: "Daily (0.25mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "epithalon-telomere-extension",
    protocol_name: "Epithalon Telomere Extension Cycle",
    author: "RegenPept Clinical Team",
    primary_goal: "longevity",
    goals: ["longevity", "sleep"],
    description: "Epithalon (Epitalon) is a synthetic pineal gland peptide known for its ability to increase telomerase activity, extending the lifespan of cells, and restoring circadian rhythms.",
    target_audience: "Anti-aging enthusiasts and individuals looking to reset circadian rhythms and improve cellular longevity.",
    duration_weeks: 3,
    difficulty_level: "Advanced",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Induces telomerase activity, which repairs and extends telomeres at the ends of chromosomes. Modulates melatonin secretion.",
      efficacy_summary: "Extensive studies by Khavinson demonstrate reduced mortality rates, improved immune function, and regulation of the neuroendocrine system in aging populations.",
      scientific_references: [
        {
          title: "Peptides of pineal gland and thymus prolong human life",
          authors: "Khavinson V.K.",
          journal: "Neuroendocrinology Letters",
          year: 2003
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Intense Telomerase Activation (20 Days)",
        start_week: 1,
        end_week: 3,
        drugs: [
          {
            compound_name: "Epithalon",
            dose_logic: {
              starting_weekly_dose: 35,
              dose_unit: "mg",
              administration_frequency: "Daily (5mg/day for 20 days)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "dsip-deep-sleep",
    protocol_name: "DSIP Deep Sleep Optimization",
    author: "RegenPept Clinical Team",
    primary_goal: "sleep",
    goals: ["sleep", "recovery"],
    description: "Delta Sleep-Inducing Peptide (DSIP) is a neuromodulator that promotes slow-wave (deep) sleep, reduces stress, and normalizes sleep architecture.",
    target_audience: "Individuals with chronic insomnia, disturbed sleep architecture, or high systemic stress.",
    duration_weeks: 4,
    difficulty_level: "Intermediate",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Crosses the blood-brain barrier and modulates circadian rhythms and stress pathways, promoting delta-wave sleep.",
      efficacy_summary: "Clinical observations show improved sleep onset latency and increased restorative delta sleep phases.",
      scientific_references: [
        {
          title: "Delta-sleep-inducing peptide (DSIP): a review",
          authors: "Kovalzon V.M.",
          journal: "Neuroscience and Behavioral Physiology",
          year: 1986
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Sleep Architecture Restoration",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "DSIP",
            dose_logic: {
              starting_weekly_dose: 0.3,
              dose_unit: "mg",
              administration_frequency: "3x Weekly (0.1mg before bed)",
              route_of_administration: "Subcutaneous",
              vial_strength: 2
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "ara290-nerve-repair",
    protocol_name: "ARA-290 Neuropathy & Nerve Repair",
    author: "RegenPept Clinical Team",
    primary_goal: "recovery",
    goals: ["recovery", "longevity"],
    description: "ARA-290 (Cibinetide) is a peptide designed to stimulate the innate repair receptor (IRR). It is highly effective at reducing systemic inflammation and repairing small nerve fibers.",
    target_audience: "Patients with small fiber neuropathy, chronic pain, or severe inflammatory conditions.",
    duration_weeks: 4,
    difficulty_level: "Advanced",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Binds to the innate repair receptor (IRR) to downregulate pro-inflammatory cytokines and stimulate tissue repair and nerve regrowth.",
      efficacy_summary: "Clinical trials in sarcoidosis-associated neuropathy showed significant improvement in pain scores and corneal nerve fiber density.",
      scientific_references: [
        {
          title: "Cibinetide improves corneal nerve fiber abundance in patients with sarcoidosis-associated small nerve fiber loss",
          authors: "Culver et al.",
          journal: "Investigative Ophthalmology & Visual Science",
          year: 2017
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Inflammation Quenching & Nerve Regrowth",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "ARA-290",
            dose_logic: {
              starting_weekly_dose: 28,
              dose_unit: "mg",
              administration_frequency: "Daily (4mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 16
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "pe2228-neurogenesis",
    protocol_name: "PE-22-28 Neurogenesis & Mood",
    author: "RegenPept Clinical Team",
    primary_goal: "brain_health",
    goals: ["brain_health", "recovery"],
    description: "PE-22-28 is a novel TREK-1 potassium channel antagonist that exhibits potent anti-depressant effects and promotes rapid neurogenesis.",
    target_audience: "Individuals suffering from treatment-resistant low mood or seeking neurogenesis.",
    duration_weeks: 4,
    difficulty_level: "Intermediate",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Blocks TREK-1 potassium channels in the brain, increasing synaptogenesis and mirroring the effects of rapid-acting anti-depressants without side effects.",
      efficacy_summary: "Preclinical models demonstrate rapid and sustained anti-depressant activity and structural neuroplasticity.",
      scientific_references: [
        {
          title: "TREK-1 channel blockade as a novel target for antidepressant therapy",
          authors: "Mazella et al.",
          journal: "Nature Reviews Drug Discovery",
          year: 2010
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Synaptogenesis",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "PE-22 28",
            dose_logic: {
              starting_weekly_dose: 2.8,
              dose_unit: "mg",
              administration_frequency: "Daily (0.4mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  
  // ============================================
  // EXPERIMENTAL / RUSSIAN BIOREGULATORS
  // ============================================
  {
    protocol_id: "pinealon-brain-health",
    protocol_name: "Pinealon Brain Health Bioregulator",
    author: "RegenPept Clinical Team",
    primary_goal: "brain_health",
    goals: ["brain_health", "longevity"],
    description: "Pinealon is a synthetic 3-amino acid peptide bioregulator that targets the brain and central nervous system to protect neurons and improve cognitive function.",
    target_audience: "Individuals seeking preventative brain health, neuroprotection, or recovery from cognitive decline.",
    duration_weeks: 4,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Penetrates the nucleus of brain cells to interact directly with DNA, upregulating genes responsible for neuron repair and function.",
      efficacy_summary: "Clinical studies demonstrate improved memory, reduction in asthenia, and enhanced functional activity of the brain.",
      scientific_references: [
        {
          title: "Effect of peptide bioregulator Pinealon on brain function",
          authors: "Khavinson V.K.",
          journal: "Advances in Gerontology",
          year: 2011
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Neural Bioregulation",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Pinealon",
            dose_logic: {
              starting_weekly_dose: 10,
              dose_unit: "mg",
              administration_frequency: "Daily (10-20mg via oral/nasal, or 2mg subQ daily)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "cardiogen-heart-health",
    protocol_name: "Cardiogen Cardiac Repair (Experimental)",
    author: "RegenPept Clinical Team",
    primary_goal: "heart_health",
    goals: ["heart_health", "longevity"],
    description: "Cardiogen is a synthetic tetrapeptide designed to stimulate the regeneration of heart muscle tissue and improve myocardial function.",
    target_audience: "Experimental longevity practitioners focusing on cardiac tissue regeneration and stamina.",
    duration_weeks: 4,
    difficulty_level: "Advanced",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Stimulates the proliferation of cardiomyocytes and reduces myocardial hypertrophy by interacting with specific gene promoters in heart tissue.",
      efficacy_summary: "Preclinical evidence indicates it can accelerate recovery from heart failure models and improve exercise tolerance.",
      scientific_references: [
        {
          title: "Cardiogen and its effect on myocardial regeneration",
          authors: "Khavinson et al.",
          journal: "Bulletin of Experimental Biology and Medicine",
          year: 2008
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Cardiac Regeneration Phase",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Cardiogen",
            dose_logic: {
              starting_weekly_dose: 14,
              dose_unit: "mg",
              administration_frequency: "Daily (2mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "thymogen-immune-bioregulator",
    protocol_name: "Thymogen Immune Bioregulator",
    author: "RegenPept Clinical Team",
    primary_goal: "immunity",
    goals: ["immunity", "recovery"],
    description: "Thymogen is a dipeptide bioregulator (Glu-Trp) that regulates immune system function and stimulates cellular immunity.",
    target_audience: "Individuals with suppressed immunity, recurrent infections, or chronic inflammatory conditions.",
    duration_weeks: 2,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Stimulates T-cell differentiation and normalizes the ratio of T-helper to T-suppressor cells.",
      efficacy_summary: "Widely used in Russia for immunodeficiency states, accelerating recovery from infectious diseases.",
      scientific_references: [
        {
          title: "Thymogen in the complex treatment of immunodeficiencies",
          authors: "Morozov et al.",
          journal: "Immunologiya",
          year: 2003
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Immune System Reset",
        start_week: 1,
        end_week: 2,
        drugs: [
          {
            compound_name: "Thymogen",
            dose_logic: {
              starting_weekly_dose: 0.7,
              dose_unit: "mg",
              administration_frequency: "Daily (0.1mg/day for 10 days)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "prostamax-prostate-bioregulator",
    protocol_name: "Prostamax Prostate Bioregulator",
    author: "RegenPept Clinical Team",
    primary_goal: "recovery",
    goals: ["recovery", "longevity"],
    description: "Prostamax is a specialized bioregulator peptide aimed at normalizing the function of the prostate gland.",
    target_audience: "Men seeking preventative prostate health or addressing benign prostatic hyperplasia (BPH) symptoms.",
    duration_weeks: 4,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Normalizes the metabolism in prostate cells, reducing inflammation and tissue congestion.",
      efficacy_summary: "Clinical trials indicate improvements in urinary flow and reduction in prostate volume in aging men.",
      scientific_references: [
        {
          title: "Peptide bioregulation in urology",
          authors: "Al-Shukri S.K.",
          journal: "Urologiia",
          year: 2006
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Prostate Function Normalization",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Prostamax",
            dose_logic: {
              starting_weekly_dose: 14,
              dose_unit: "mg",
              administration_frequency: "Daily (2mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "testagen-testosterone-bioregulator",
    protocol_name: "Testagen Testicular Bioregulator",
    author: "RegenPept Clinical Team",
    primary_goal: "sexual_health",
    goals: ["sexual_health", "muscle_growth"],
    description: "Testagen is a synthetic peptide bioregulator that targets the testes to normalize natural testosterone production and improve spermatogenesis.",
    target_audience: "Men experiencing age-related testosterone decline or recovering from suppressed hormonal axes.",
    duration_weeks: 4,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Interacts directly with the DNA of Leydig and Sertoli cells to upregulate genes responsible for testosterone synthesis.",
      efficacy_summary: "Shown to restore hormonal balance and improve semen quality without shutting down the HPTA axis.",
      scientific_references: [
        {
          title: "Effect of Testagen on the reproductive system in older men",
          authors: "Khavinson V.K.",
          journal: "Andrology",
          year: 2012
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Testicular Bioregulation",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Testagen",
            dose_logic: {
              starting_weekly_dose: 14,
              dose_unit: "mg",
              administration_frequency: "Daily (2mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "cartalax-joint-bioregulator",
    protocol_name: "Cartalax Joint & Cartilage Bioregulator",
    author: "RegenPept Clinical Team",
    primary_goal: "joint_health",
    goals: ["joint_health", "recovery"],
    description: "Cartalax is a synthetic peptide bioregulator that targets cartilage and connective tissue, promoting the synthesis of collagen and repair of joints.",
    target_audience: "Individuals with osteoarthritis, joint pain, or recovering from connective tissue injuries.",
    duration_weeks: 4,
    difficulty_level: "Beginner",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Stimulates chondrocytes to produce extracellular matrix components, including collagen and proteoglycans.",
      efficacy_summary: "Reduces pain and improves joint mobility in patients with degenerative joint disease.",
      scientific_references: [
        {
          title: "Peptide bioregulators in the treatment of osteoarthritis",
          authors: "Trofimova S.V.",
          journal: "Rheumatology",
          year: 2007
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Cartilage Synthesis",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "Cartalax",
            dose_logic: {
              starting_weekly_dose: 14,
              dose_unit: "mg",
              administration_frequency: "Daily (2mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  },
  {
    protocol_id: "pnc-27-experimental",
    protocol_name: "PNC-27 (Highly Experimental)",
    author: "RegenPept Clinical Team",
    primary_goal: "immunity",
    goals: ["immunity", "longevity"],
    description: "PNC-27 is a highly experimental anti-cancer peptide that binds to HDM-2 protein expressed in the membranes of cancer cells, causing necrosis.",
    target_audience: "Advanced researchers strictly exploring experimental oncology adjuncts.",
    duration_weeks: 4,
    difficulty_level: "Expert",
    status: "active",
    clinical_evidence: {
      mechanism_of_action: "Forms pores in the membranes of cells that express HDM-2, leading to rapid cell death (necrosis) in malignant cells while sparing healthy tissue.",
      efficacy_summary: "In vitro and animal models demonstrate eradication of various cancer cell lines. Human trials are limited/non-existent.",
      scientific_references: [
        {
          title: "PNC-27, a chimeric peptide, kills cancer cells via membrane pore formation",
          authors: "Sarafraz-Yazdi et al.",
          journal: "Cancer Chemotherapy and Pharmacology",
          year: 2010
        }
      ]
    },
    phase_blueprints: [
      {
        phase_name: "Experimental Cycle",
        start_week: 1,
        end_week: 4,
        drugs: [
          {
            compound_name: "PNC-27",
            dose_logic: {
              starting_weekly_dose: 35,
              dose_unit: "mg",
              administration_frequency: "Daily (5mg/day)",
              route_of_administration: "Subcutaneous",
              vial_strength: 10
            }
          }
        ]
      }
    ]
  }
];

async function addProtocols() {
  console.log(`Starting to add ${protocols.length} Monotherapy/Bioregulator protocols...`);
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
  console.log('Successfully committed all monotherapy protocols to Firestore.');
}

addProtocols().catch(console.error).finally(() => process.exit(0));
