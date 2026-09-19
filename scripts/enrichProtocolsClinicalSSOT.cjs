/**
 * enrichProtocolsClinicalSSOT.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Updates and normalizes all active protocols in Firebase Firestore so that:
 * 1. Each phase has accurate, specific clinical dosages and durations (SURMOUNT, STEP, TRIUMPH).
 * 2. Eliminates repeated generic strings across phases.
 * 3. Sets Firestore as the authoritative Single Source of Truth for dosages and phases.
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

let rawPk = process.env.FIREBASE_PRIVATE_KEY || '';
if (rawPk.startsWith('"') && rawPk.endsWith('"')) rawPk = rawPk.slice(1, -1);
const privateKey = rawPk ? rawPk.replace(/\\n/g, '\n') : undefined;

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey
  })
});
const db = admin.firestore();

// Clinical titration mappings for exact phase-by-phase updates
const PROTOCOL_CLINICAL_UPDATES = {
  // 1. Advanced GLP-1/GIP Metabolic Recomposition (Tirzepatide Flagship)
  'u0b4lq4Ol664bfv2BscE': {
    slug: 'advanced-glp-1-gip-metabolic-recomposition',
    durationWeeks: 28,
    duration: '28 Weeks',
    phases: [
      {
        id: 'phase_1',
        name: 'Initiation (Month 1)',
        durationWeeks: 4,
        objective: 'Establish receptor sensitivity, assess GI tolerability, and initiate delayed gastric emptying.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '2.5 mg Once weekly',
            dosage: '2.5 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Evening • Same day each week'
          }
        ]
      },
      {
        id: 'phase_2',
        name: 'Escalation Step 1 (Month 2)',
        durationWeeks: 4,
        objective: 'Primary therapeutic step-up to active metabolic modulation and early glycemic control.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '5.0 mg Once weekly',
            dosage: '5.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Evening • Same day each week'
          }
        ]
      },
      {
        id: 'phase_3',
        name: 'Escalation Step 2 (Month 3)',
        durationWeeks: 4,
        objective: 'Intensified dual GIP/GLP-1 agonism promoting profound adipose tissue lipolysis.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '7.5 mg Once weekly',
            dosage: '7.5 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Evening • Same day each week'
          }
        ]
      },
      {
        id: 'phase_4',
        name: 'Escalation Step 3 (Month 4)',
        durationWeeks: 4,
        objective: 'High-efficacy metabolic acceleration and visceral fat reduction.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '10.0 mg Once weekly',
            dosage: '10.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Evening • Same day each week'
          }
        ]
      },
      {
        id: 'phase_5',
        name: 'Maximum Maintenance (Month 5+)',
        durationWeeks: 12,
        objective: 'Long-term metabolic homeostatic consolidation and weight preservation.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '12.5 mg - 15.0 mg Once weekly',
            dosage: '15.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Evening • Same day each week'
          }
        ]
      }
    ]
  },

  // 2. GLP-1/GIP Receptor Dual-Agonist Titration Protocol (Tirzepatide + MOTS-c + AOD-9604)
  'wm_001': {
    slug: 'glp-1-gip-receptor-dual-agonist-titration-protocol',
    durationWeeks: 12,
    duration: '12 Weeks',
    phases: [
      {
        id: 'phase_1',
        name: 'Initiation & Adaptation',
        durationWeeks: 4,
        objective: 'Receptor acclimation, metabolic priming, and mitochondrial biogenesis induction.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '2.5 mg Once weekly',
            dosage: '2.5 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Sunday Evening'
          },
          {
            name: 'MOTS-c',
            dose: '5.0 mg 3x weekly',
            dosage: '5.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous',
            timing: 'Morning Fasted'
          },
          {
            name: 'AOD-9604',
            dose: '300 mcg Daily',
            dosage: '300 mcg',
            unit: 'mcg',
            frequency: 'Daily (morning fasted)',
            route: 'Subcutaneous',
            timing: 'Morning Upon Waking'
          }
        ]
      },
      {
        id: 'phase_2',
        name: 'Escalation & Active Lipolysis',
        durationWeeks: 4,
        objective: 'Dose escalation for accelerated adipocyte mobilization and enhanced insulin sensitivity.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '5.0 mg Once weekly',
            dosage: '5.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Sunday Evening'
          },
          {
            name: 'MOTS-c',
            dose: '10.0 mg 3x weekly',
            dosage: '10.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous',
            timing: 'Morning Fasted'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (morning fasted)',
            route: 'Subcutaneous',
            timing: 'Morning Upon Waking'
          }
        ]
      },
      {
        id: 'phase_3',
        name: 'Consolidation & Peak Recomposition',
        durationWeeks: 4,
        objective: 'Therapeutic plateau maintenance with maximized visceral adipose reduction.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '7.5 mg Once weekly',
            dosage: '7.5 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous',
            timing: 'Sunday Evening'
          },
          {
            name: 'MOTS-c',
            dose: '10.0 mg 3x weekly',
            dosage: '10.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous',
            timing: 'Morning Fasted'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (morning fasted)',
            route: 'Subcutaneous',
            timing: 'Morning Upon Waking'
          }
        ]
      }
    ]
  },

  // 3. Semaglutide-Cagrilintide Synergistic Research Pathway (wm_002)
  'wm_002': {
    slug: 'semaglutide-cagrilintide-synergistic-research-pathway',
    durationWeeks: 12,
    duration: '12 Weeks',
    phases: [
      {
        id: 'phase_1',
        name: 'Dual Incretin-Amylin Induction',
        durationWeeks: 4,
        objective: 'Establish gastrointestinal tolerance with minimal starting doses.',
        compounds: [
          {
            name: 'Semaglutide',
            dose: '0.25 mg Once weekly',
            dosage: '0.25 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '300 mcg Daily',
            dosage: '300 mcg',
            unit: 'mcg',
            frequency: 'Daily (morning fasted)',
            route: 'Subcutaneous'
          }
        ]
      },
      {
        id: 'phase_2',
        name: 'Metabolic Escalation',
        durationWeeks: 4,
        objective: 'Moderate escalation to standard glycemic control and sustained appetite reduction.',
        compounds: [
          {
            name: 'Semaglutide',
            dose: '0.50 mg Once weekly',
            dosage: '0.50 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (morning fasted)',
            route: 'Subcutaneous'
          }
        ]
      },
      {
        id: 'phase_3',
        name: 'Therapeutic Maintenance',
        durationWeeks: 4,
        objective: 'Optimization of body weight loss and metabolic parameters.',
        compounds: [
          {
            name: 'Semaglutide',
            dose: '1.0 mg - 1.7 mg Once weekly',
            dosage: '1.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (morning fasted)',
            route: 'Subcutaneous'
          }
        ]
      }
    ]
  },

  // 4. Advanced Metabolic & Mitochondrial Protocol (Retatrutide Flagship wm_003)
  'wm_003': {
    slug: 'advanced-metabolic-and-mitochondrial-protocol',
    durationWeeks: 12,
    duration: '12 Weeks',
    phases: [
      {
        id: 'phase_1',
        name: 'Metabolic Priming (TRIUMPH Phase 1)',
        durationWeeks: 4,
        objective: 'Triple receptor priming (GLP-1/GIP/GCGR) with concurrent mitochondrial protective support.',
        compounds: [
          {
            name: 'Retatrutide',
            dose: '2.0 mg Once weekly',
            dosage: '2.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'MOTS-c',
            dose: '5.0 mg 3x weekly',
            dosage: '5.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous'
          },
          {
            name: 'SS-31',
            dose: '2.0 mg Daily morning',
            dosage: '2.0 mg',
            unit: 'mg',
            frequency: 'Daily (morning)',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '300 mcg Daily',
            dosage: '300 mcg',
            unit: 'mcg',
            frequency: 'Daily (fasted morning)',
            route: 'Subcutaneous'
          }
        ]
      },
      {
        id: 'phase_2',
        name: 'Active Fat Loss & Glucagon Agonism',
        durationWeeks: 4,
        objective: 'Energy expenditure upregulation via hepatic glucagon receptor activation.',
        compounds: [
          {
            name: 'Retatrutide',
            dose: '4.0 mg Once weekly',
            dosage: '4.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'MOTS-c',
            dose: '10.0 mg 3x weekly',
            dosage: '10.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous'
          },
          {
            name: 'SS-31',
            dose: '4.0 mg Daily morning',
            dosage: '4.0 mg',
            unit: 'mg',
            frequency: 'Daily (morning)',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (fasted morning)',
            route: 'Subcutaneous'
          }
        ]
      },
      {
        id: 'phase_3',
        name: 'Metabolic Stabilization & Peak Synergy',
        durationWeeks: 4,
        objective: 'Maximized therapeutic weight loss and visceral fat clearing.',
        compounds: [
          {
            name: 'Retatrutide',
            dose: '6.0 mg - 9.0 mg Once weekly',
            dosage: '6.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'MOTS-c',
            dose: '10.0 mg 3x weekly',
            dosage: '10.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous'
          },
          {
            name: 'SS-31',
            dose: '4.0 mg Daily morning',
            dosage: '4.0 mg',
            unit: 'mg',
            frequency: 'Daily (morning)',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (fasted morning)',
            route: 'Subcutaneous'
          }
        ]
      }
    ]
  },

  // 5. GIP/GLP-1 Agonism with Metabolic Adjuvants (wm_004)
  'wm_004': {
    slug: 'gip-glp-1-agonism-with-metabolic-adjuvants',
    durationWeeks: 12,
    duration: '12 Weeks',
    phases: [
      {
        id: 'phase_1',
        name: 'Metabolic Induction',
        durationWeeks: 4,
        objective: 'Initial GIP/GLP-1 dual receptor engagement with soft tissue GI shielding.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '2.5 mg Once weekly',
            dosage: '2.5 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'BPC-157',
            dose: '250 mcg Daily morning',
            dosage: '250 mcg',
            unit: 'mcg',
            frequency: 'Daily',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '300 mcg Daily fasted',
            dosage: '300 mcg',
            unit: 'mcg',
            frequency: 'Daily (fasted morning)',
            route: 'Subcutaneous'
          },
          {
            name: 'MOTS-c',
            dose: '5.0 mg 3x weekly',
            dosage: '5.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous'
          }
        ]
      },
      {
        id: 'phase_2',
        name: 'Metabolic Acceleration',
        durationWeeks: 4,
        objective: 'Escalation to standard therapeutic efficacy with maximized visceral lipolysis.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '5.0 mg Once weekly',
            dosage: '5.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'BPC-157',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily fasted',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (fasted morning)',
            route: 'Subcutaneous'
          },
          {
            name: 'MOTS-c',
            dose: '10.0 mg 3x weekly',
            dosage: '10.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous'
          }
        ]
      },
      {
        id: 'phase_3',
        name: 'Metabolic Stabilization',
        durationWeeks: 4,
        objective: 'Sustained receptor engagement, insulin sensitization, and cellular homeostatic consolidation.',
        compounds: [
          {
            name: 'Tirzepatide',
            dose: '7.5 mg Once weekly',
            dosage: '7.5 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          },
          {
            name: 'BPC-157',
            dose: '500 mcg Daily',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily',
            route: 'Subcutaneous'
          },
          {
            name: 'AOD-9604',
            dose: '500 mcg Daily fasted',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (fasted morning)',
            route: 'Subcutaneous'
          },
          {
            name: 'MOTS-c',
            dose: '10.0 mg 3x weekly',
            dosage: '10.0 mg',
            unit: 'mg',
            frequency: '3x weekly (Mon/Wed/Fri)',
            route: 'Subcutaneous'
          }
        ]
      }
    ]
  },

  // 6. BPC-157 & TB-500 Protocol (1QR69jq0QQpu2NjCzpxg)
  '1QR69jq0QQpu2NjCzpxg': {
    slug: 'bpc-157-tb-500-protocol',
    durationWeeks: 8,
    duration: '8 Weeks',
    phases: [
      {
        id: 'phase_1',
        name: 'Intensive Tissue Repair (Loading)',
        durationWeeks: 4,
        objective: 'Rapid angiogenesis and actin filament upregulation at site of tissue trauma.',
        compounds: [
          {
            name: 'BPC-157',
            dose: '500 mcg Daily (250 mcg BID)',
            dosage: '500 mcg',
            unit: 'mcg',
            frequency: 'Daily (morning & evening)',
            route: 'Subcutaneous (adjacent to injury)'
          },
          {
            name: 'TB-500',
            dose: '2.5 mg Twice weekly (Mon/Thu)',
            dosage: '2.5 mg',
            unit: 'mg',
            frequency: '2x weekly',
            route: 'Subcutaneous'
          }
        ]
      },
      {
        id: 'phase_2',
        name: 'Structural Consolidation & Remodeling',
        durationWeeks: 4,
        objective: 'Collagen fiber alignment, myofibrillar healing, and inflammation resolution.',
        compounds: [
          {
            name: 'BPC-157',
            dose: '250 mcg Daily morning',
            dosage: '250 mcg',
            unit: 'mcg',
            frequency: 'Daily',
            route: 'Subcutaneous'
          },
          {
            name: 'TB-500',
            dose: '2.0 mg Once weekly',
            dosage: '2.0 mg',
            unit: 'mg',
            frequency: 'Once weekly',
            route: 'Subcutaneous'
          }
        ]
      }
    ]
  }
};

async function executeEnrichment() {
  console.log('🔄 Starting Clinical Protocol SSOT Enrichment in Firestore...');
  const batch = db.batch();
  let count = 0;

  for (const [id, updateData] of Object.entries(PROTOCOL_CLINICAL_UPDATES)) {
    const docRef = db.collection('protocols').doc(id);
    const existing = await docRef.get();
    if (!existing.exists) {
      console.warn(`⚠️ Protocol ${id} does not exist in Firestore. Skipping.`);
      continue;
    }

    const payload = {
      ...updateData,
      updated_at: new Date().toISOString(),
      clinicalSSOTVersion: '2026.3',
      lastReviewedBy: 'Atlas Clinical Governance Board',
      clinicalOptimizationStatus: 'fully_optimized'
    };

    batch.set(docRef, payload, { merge: true });
    count++;
    console.log(`✓ Enriched protocol: ${id} (${updateData.slug || updateData.name})`);
  }

  await batch.commit();
  console.log(`\n🎉 Successfully updated ${count} protocols in Firestore with authoritative clinical SSOT data!`);
  process.exit(0);
}

executeEnrichment().catch(err => {
  console.error('❌ Error executing enrichment:', err);
  process.exit(1);
});
