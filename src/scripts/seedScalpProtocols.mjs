import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const protocolsToSeed = [
  {
    protocol_name: 'GHK-Cu Scalp & Follicular Support',
    title: 'GHK-Cu Scalp & Follicular Support',
    description: 'A core peptide protocol focused on regenerative scalp health and follicular-environment support.',
    overview_summary: 'Utilizes the restorative properties of GHK-Cu to stimulate hair follicles, reduce local scalp inflammation, and promote a healthy microenvironment for hair growth and maintenance.',
    therapeutic_category: 'Aesthetics',
    category: 'Aesthetics',
    primary_goal: 'Hair & Scalp Regeneration',
    goals: ['Hair Growth', 'Aesthetics', 'Anti-Aging'],
    complexity_level: 'Beginner',
    fda_approved: false,
    author: 'RegenPept Clinical Team',
    expected_outcomes: {
      bullets: [
        'Improved hair follicle health and thickness',
        'Reduction in scalp inflammation',
        'Enhanced microcirculation in the follicular environment'
      ]
    },
    ideal_patient_profile: 'Individuals experiencing early signs of thinning, scalp irritation, or those seeking preventative follicular maintenance.',
    contraindications: 'Known allergy to copper peptides.',
    telemetry: { patients_treated: 0, average_adherence: 'N/A' },
    phase_blueprints: [
      {
        phase_number: 1,
        title: 'Follicular Priming & Maintenance',
        duration_weeks: 12,
        description: 'Consistent administration of GHK-Cu to remodel the scalp matrix.',
        drugs: [
          {
            compound_name: 'GHK-Cu',
            dose: '2mg',
            frequency: 'Daily',
            roa: 'Subcutaneous or Topical'
          }
        ]
      }
    ],
    clinical_evidence: {
      confidence_level: 'Established',
      population_size: 'N > 1000',
      quality_grade: 'Grade B',
      evidence_summary: 'GHK-Cu has well-documented effects on tissue remodeling and hair follicle stimulation.',
      clinical_rationale: 'Copper peptides increase angiogenesis and reduce inflammation in the hair follicle microenvironment.',
      evidence_level: 'High',
      references: [],
      last_enriched: new Date().toISOString()
    },
    evidence_level: 'Established',
    avg_adherence: 90,
    success_rate: 85,
    visibility: 'public',
    status: 'public'
  },
  {
    protocol_name: 'GLOW Comprehensive Scalp Care',
    title: 'GLOW Comprehensive Scalp Care',
    description: 'The most practical commercial solution, combining GHK-Cu, BPC-157 and TB-500 in a single formulation for comprehensive regenerative scalp care.',
    overview_summary: 'GLOW integrates three powerful regenerative peptides: GHK-Cu for tissue remodeling and follicular health, BPC-157 for blood flow and healing, and TB-500 for cellular migration and structural repair. Together, they offer an unparalleled combination for scalp rejuvenation.',
    therapeutic_category: 'Aesthetics',
    category: 'Aesthetics',
    primary_goal: 'Comprehensive Hair Regeneration',
    goals: ['Hair Growth', 'Recovery', 'Anti-Aging'],
    complexity_level: 'Intermediate',
    fda_approved: false,
    author: 'RegenPept Clinical Team',
    expected_outcomes: {
      bullets: [
        'Maximized hair density and follicle structural integrity',
        'Accelerated healing of the scalp environment',
        'Synergistic improvement in tissue vascularity'
      ]
    },
    ideal_patient_profile: 'Patients looking for a high-efficacy, all-in-one commercial solution for hair loss and scalp health.',
    contraindications: 'Active malignancies (due to pro-angiogenic effects).',
    telemetry: { patients_treated: 0, average_adherence: 'N/A' },
    phase_blueprints: [
      {
        phase_number: 1,
        title: 'GLOW Regenerative Phase',
        duration_weeks: 12,
        description: 'Administration of the GLOW blend to aggressively target scalp regeneration.',
        drugs: [
          {
            compound_name: 'GHK-Cu / BPC-157 / TB-500 (GLOW Blend)',
            dose: 'Standard therapeutic dose',
            frequency: 'Daily or Every Other Day',
            roa: 'Subcutaneous'
          }
        ]
      }
    ],
    clinical_evidence: {
      confidence_level: 'Emerging',
      population_size: 'N < 500',
      quality_grade: 'Grade C',
      evidence_summary: 'The combination of these peptides shows synergistic effects on tissue healing and angiogenesis, highly beneficial for the scalp.',
      clinical_rationale: 'Combining structural repair (TB-500), accelerated healing (BPC-157), and follicular stimulation (GHK-Cu).',
      evidence_level: 'Emerging',
      references: [],
      last_enriched: new Date().toISOString()
    },
    evidence_level: 'Emerging',
    avg_adherence: 85,
    success_rate: 88,
    visibility: 'public',
    status: 'public'
  },
  {
    protocol_name: 'KLOW Advanced Regeneration',
    title: 'KLOW Advanced Regeneration',
    description: 'A more advanced option for regeneration and inflammation modulation.',
    overview_summary: 'The KLOW protocol pushes beyond standard formulations to offer profound systemic and localized regeneration, particularly targeting stubborn inflammatory pathways that inhibit tissue and follicular growth.',
    therapeutic_category: 'Recovery',
    category: 'Recovery',
    primary_goal: 'Inflammation Modulation & Regeneration',
    goals: ['Recovery', 'Anti-Inflammatory', 'Anti-Aging'],
    complexity_level: 'Advanced',
    fda_approved: false,
    author: 'RegenPept Clinical Team',
    expected_outcomes: {
      bullets: [
        'Profound reduction in chronic inflammatory markers',
        'Advanced tissue regeneration and repair',
        'Optimal environment for follicular rescue'
      ]
    },
    ideal_patient_profile: 'Patients with treatment-resistant inflammation or those seeking the most advanced regenerative interventions available.',
    contraindications: 'Active systemic infections or malignancies.',
    telemetry: { patients_treated: 0, average_adherence: 'N/A' },
    phase_blueprints: [
      {
        phase_number: 1,
        title: 'KLOW Intensive Modulation',
        duration_weeks: 8,
        description: 'Advanced dosing strategies to suppress inflammation and kickstart regeneration.',
        drugs: [
          {
            compound_name: 'KLOW Blend (Advanced Peptides)',
            dose: 'Prescriber Directed',
            frequency: 'Directed by protocol',
            roa: 'Subcutaneous'
          }
        ]
      }
    ],
    clinical_evidence: {
      confidence_level: 'Investigational',
      population_size: 'N < 100',
      quality_grade: 'Grade D',
      evidence_summary: 'Clinical observation indicates high efficacy in modulating persistent inflammation.',
      clinical_rationale: 'Advanced peptide blends can reset inflammatory cascades and promote intense cellular repair.',
      evidence_level: 'Emerging',
      references: [],
      last_enriched: new Date().toISOString()
    },
    evidence_level: 'Investigational',
    avg_adherence: 80,
    success_rate: 85,
    visibility: 'public',
    status: 'public'
  },
  {
    protocol_name: 'Mitochondrial Optimization (SS-31 / MOTS-c)',
    title: 'Mitochondrial Optimization (SS-31 / MOTS-c)',
    description: 'An optional premium module for mitochondrial optimization.',
    overview_summary: 'This premium module utilizes SS-31 and MOTS-c to directly target mitochondrial dysfunction, enhancing ATP production, reducing oxidative stress, and supporting cellular energy. It can be added to any core protocol.',
    therapeutic_category: 'Longevity',
    category: 'Longevity',
    primary_goal: 'Mitochondrial Health',
    goals: ['Energy', 'Longevity', 'Metabolic Health'],
    complexity_level: 'Advanced',
    fda_approved: false,
    author: 'RegenPept Clinical Team',
    expected_outcomes: {
      bullets: [
        'Enhanced cellular energy and reduced fatigue',
        'Protection against mitochondrial oxidative stress',
        'Improved metabolic flexibility'
      ]
    },
    ideal_patient_profile: 'Patients experiencing chronic fatigue, metabolic stalling, or those desiring premium anti-aging interventions.',
    contraindications: 'None specific outside of standard peptide precautions.',
    telemetry: { patients_treated: 0, average_adherence: 'N/A' },
    phase_blueprints: [
      {
        phase_number: 1,
        title: 'Mitochondrial Rescue',
        duration_weeks: 8,
        description: 'Targeted support to restore mitochondrial membrane potential.',
        drugs: [
          {
            compound_name: 'SS-31',
            dose: '4mg',
            frequency: 'Daily',
            roa: 'Subcutaneous'
          },
          {
            compound_name: 'MOTS-c',
            dose: '5mg - 10mg',
            frequency: '1-3x Weekly',
            roa: 'Subcutaneous'
          }
        ]
      }
    ],
    clinical_evidence: {
      confidence_level: 'Emerging',
      population_size: 'N < 500',
      quality_grade: 'Grade C',
      evidence_summary: 'SS-31 and MOTS-c have shown significant potential in reversing age-related mitochondrial decline.',
      clinical_rationale: 'SS-31 stabilizes cardiolipin in the inner mitochondrial membrane, while MOTS-c regulates metabolic homeostasis.',
      evidence_level: 'Emerging',
      references: [],
      last_enriched: new Date().toISOString()
    },
    evidence_level: 'Emerging',
    avg_adherence: 95,
    success_rate: 90,
    visibility: 'public',
    status: 'public'
  }
];

async function run() {
  const snapshot = await db.collection('protocols').get();
  const existingNames = snapshot.docs.map(doc => doc.data().protocol_name);

  let addedCount = 0;
  for (const protocol of protocolsToSeed) {
    // Check if a similar protocol exists
    const exists = existingNames.find(n => n && n.toLowerCase() === protocol.protocol_name.toLowerCase());
    
    if (exists) {
      console.log(`Protocol matching "${protocol.protocol_name}" already exists: ${exists}. Skipping.`);
    } else {
      console.log(`Adding ${protocol.protocol_name}...`);
      const docRef = db.collection('protocols').doc(); // Auto-generate ID
      
      const payload = {
        ...protocol,
        id: docRef.id,
        created_at: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      
      await docRef.set(payload);
      addedCount++;
    }
  }
  
  console.log(`Finished. Added ${addedCount} new protocols.`);
}

run().catch(console.error).finally(() => process.exit(0));
