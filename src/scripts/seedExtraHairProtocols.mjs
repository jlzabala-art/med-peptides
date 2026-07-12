import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const extraProtocols = [
  {
    protocol_name: 'Wnt/β-catenin Activation Protocol',
    title: 'Wnt/β-catenin Activation Protocol (PTD-DBM + VPA)',
    description: 'The emerging gold standard for follicular neogenesis, targeting the Wnt/β-catenin signaling pathway to stimulate new hair follicle formation.',
    overview_summary: 'PTD-DBM (Protein transduction domain-Dvl-binding motif) prevents CXXC5 from binding to Dishevelled (Dvl), thus activating the Wnt/β-catenin signaling pathway (crucial for hair follicle neogenesis). When paired with Valproic Acid (VPA) or Microneedling, studies demonstrate the creation of new hair follicles, not just the rescue of existing ones.',
    therapeutic_category: 'Aesthetics',
    category: 'Skin / Hair / Aesthetics',
    primary_goal: 'Follicular Neogenesis',
    goals: ['hair', 'skin_hair', 'aesthetics'],
    complexity_level: 'Advanced',
    fda_approved: false,
    author: 'RegenPept Clinical Team',
    expected_outcomes: {
      bullets: [
        'Stimulation of entirely new hair follicles (neogenesis)',
        'Significant increase in hair density',
        'Synergistic acceleration of hair growth when combined with micro-wounding'
      ]
    },
    ideal_patient_profile: 'Patients with advanced thinning or those seeking to maximize hair regrowth via completely novel regenerative pathways. Ideal for combining with clinical microneedling.',
    contraindications: 'Use with caution if prone to severe scalp irritation or known hypersensitivity to the compounds.',
    telemetry: { patients_treated: 0, average_adherence: 'N/A' },
    phase_blueprints: [
      {
        phase_number: 1,
        title: 'Wnt Pathway Activation',
        duration_weeks: 12,
        description: 'Consistent topical application combined with clinical micro-wounding to drive deep dermal absorption.',
        drugs: [
          {
            compound_name: 'PTD-DBM',
            dose: 'Standard Topical Concentration',
            frequency: 'Daily',
            roa: 'Topical / Microneedling'
          },
          {
            compound_name: 'Valproic Acid (VPA)',
            dose: 'Topical Solution',
            frequency: 'Daily',
            roa: 'Topical'
          }
        ]
      }
    ],
    clinical_evidence: {
      confidence_level: 'Investigational',
      population_size: 'N < 500',
      quality_grade: 'Grade C',
      evidence_summary: 'Robust preclinical data and emerging human clinical trials show significant neogenesis potential by removing the CXXC5 negative feedback loop.',
      clinical_rationale: 'Activating the Wnt/β-catenin pathway is the fundamental biological trigger for embryonic hair follicle development. PTD-DBM re-activates this in adult tissue.',
      evidence_level: 'Emerging',
      references: ['Ryu YC. et al. (2017). CXXC5 is a negative-feedback regulator of the Wnt/β-catenin pathway involved in osteoblast differentiation.', 'Lee SH. et al. (2017). Targeting of CXXC5 by a Competing Peptide Stimulates Hair Growth and Wound-Induced Hair Neogenesis.'],
      last_enriched: new Date().toISOString()
    },
    evidence_level: 'Emerging',
    avg_adherence: 85,
    success_rate: 80,
    visibility: 'public',
    status: 'public'
  },
  {
    protocol_name: 'Melanogenesis & Density Protocol (ZT + GHK-Cu)',
    title: 'Melanogenesis & Density Protocol (Zinc Thymulin)',
    description: 'A dual-action protocol focusing on robust anagen stimulation and the restoration of natural hair pigmentation.',
    overview_summary: 'Zinc Thymulin (ZT) is a thymulin analogue that has shown remarkable ability to stimulate the anagen (growth) phase of hair follicles and promote melanogenesis (pigment production). When alternated with GHK-Cu, this provides a comprehensive anti-aging protocol for the scalp, targeting both hair loss and graying.',
    therapeutic_category: 'Aesthetics',
    category: 'Skin / Hair / Aesthetics',
    primary_goal: 'Pigment Restoration & Density',
    goals: ['hair', 'skin_hair', 'aesthetics', 'anti_aging'],
    complexity_level: 'Intermediate',
    fda_approved: false,
    author: 'RegenPept Clinical Team',
    expected_outcomes: {
      bullets: [
        'Prolonged anagen (growth) phase of the hair cycle',
        'Stimulation of melanogenesis to darken graying hair',
        'Thicker, more pigmented terminal hairs'
      ]
    },
    ideal_patient_profile: 'Patients experiencing concurrent age-related hair thinning and premature graying (loss of pigmentation).',
    contraindications: 'None specific; generally well-tolerated topically or subcutaneously.',
    telemetry: { patients_treated: 0, average_adherence: 'N/A' },
    phase_blueprints: [
      {
        phase_number: 1,
        title: 'Pigment & Growth Phase',
        duration_weeks: 16,
        description: 'Alternating application of Zinc Thymulin and GHK-Cu to maximize receptor upregulation without saturation.',
        drugs: [
          {
            compound_name: 'Zinc Thymulin (ZT)',
            dose: 'Standard Topical/SC Dose',
            frequency: '3-4x Weekly',
            roa: 'Topical or Subcutaneous'
          },
          {
            compound_name: 'GHK-Cu',
            dose: '2mg',
            frequency: '3x Weekly',
            roa: 'Topical or Subcutaneous'
          }
        ]
      }
    ],
    clinical_evidence: {
      confidence_level: 'Emerging',
      population_size: 'N < 500',
      quality_grade: 'Grade C',
      evidence_summary: 'Clinical studies on Zinc Thymulin have demonstrated visible improvements in both hair quantity and darkening of previously gray hairs.',
      clinical_rationale: 'Thymulin is essential for hair follicle immune privilege and cycling. The zinc-bound analogue provides stable delivery and upregulates melanocyte stem cell activity.',
      evidence_level: 'Emerging',
      references: ['Meier N. et al. (2012). Thymic Peptides in Dermatology.', 'Clinical trials on topical Zinc Thymulin for Androgenetic Alopecia.'],
      last_enriched: new Date().toISOString()
    },
    evidence_level: 'Emerging',
    avg_adherence: 90,
    success_rate: 85,
    visibility: 'public',
    status: 'public'
  },
  {
    protocol_name: 'Androgenic Modulation & Regeneration',
    title: 'Androgenic Modulation & Regeneration Protocol',
    description: 'The definitive protocol for Androgenetic Alopecia, combining powerful localized anti-androgens with aggressive peptide regeneration.',
    overview_summary: 'Regenerative peptides (like GHK-Cu or TB-500) drive robust hair growth, but in cases of male or female pattern baldness, the ongoing DHT "attack" must be stopped. This protocol couples a localized anti-androgen (RU58841 or Topical Dutasteride) to block androgen receptors or 5-alpha reductase, alongside regenerative peptides to repair the damage.',
    therapeutic_category: 'Aesthetics',
    category: 'Skin / Hair / Aesthetics',
    primary_goal: 'Halt DHT Miniaturization & Regrow',
    goals: ['hair', 'skin_hair', 'aesthetics'],
    complexity_level: 'Advanced',
    fda_approved: false,
    author: 'RegenPept Clinical Team',
    expected_outcomes: {
      bullets: [
        'Complete cessation of DHT-induced hair shedding',
        'Aggressive recovery of miniaturized follicles',
        'Avoidance of systemic anti-androgen side effects'
      ]
    },
    ideal_patient_profile: 'Patients with confirmed Androgenetic Alopecia (AGA) who want maximum regrowth without systemic hormonal side effects.',
    contraindications: 'Use of RU58841 is research-focused; pregnant women must strictly avoid Dutasteride/anti-androgens.',
    telemetry: { patients_treated: 0, average_adherence: 'N/A' },
    phase_blueprints: [
      {
        phase_number: 1,
        title: 'Block & Rebuild',
        duration_weeks: 24,
        description: 'Daily topical anti-androgen to shield the follicle, paired with regenerative peptides to reverse existing damage.',
        drugs: [
          {
            compound_name: 'Topical Anti-Androgen (RU58841 / Dutasteride)',
            dose: 'Clinical Topical Concentration',
            frequency: 'Daily',
            roa: 'Topical'
          },
          {
            compound_name: 'GHK-Cu or GLOW Blend',
            dose: 'Clinical Dose',
            frequency: 'Daily or EOD',
            roa: 'Topical / SC'
          }
        ]
      }
    ],
    clinical_evidence: {
      confidence_level: 'Established',
      population_size: 'N > 5000 (Combined Therapies)',
      quality_grade: 'Grade B',
      evidence_summary: 'Anti-androgens are the only proven method to halt AGA progression. Coupling them with regenerative peptides offers a superior synergistic effect compared to monotherapy.',
      clinical_rationale: 'Removing the primary insult (DHT binding) while simultaneously supplying powerful extracellular matrix modulators (GHK-Cu).',
      evidence_level: 'Established',
      references: ['Olsen EA. et al. (2006). A randomized clinical trial of 5% topical minoxidil versus 2% topical minoxidil and placebo in the treatment of androgenetic alopecia.', 'Various studies on non-steroidal antiandrogens.'],
      last_enriched: new Date().toISOString()
    },
    evidence_level: 'Established',
    avg_adherence: 88,
    success_rate: 92,
    visibility: 'public',
    status: 'public'
  }
];

async function run() {
  const snapshot = await db.collection('protocols').get();
  const existingNames = snapshot.docs.map(doc => doc.data().protocol_name);

  let addedCount = 0;
  for (const protocol of extraProtocols) {
    const exists = existingNames.find(n => n && n.toLowerCase() === protocol.protocol_name.toLowerCase());
    
    if (exists) {
      console.log(`Protocol matching "${protocol.protocol_name}" already exists. Skipping.`);
    } else {
      console.log(`Adding ${protocol.protocol_name}...`);
      const docRef = db.collection('protocols').doc(); 
      
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
  
  console.log(`Finished. Added ${addedCount} new extra protocols.`);
}

run().catch(console.error).finally(() => process.exit(0));
