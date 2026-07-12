import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replace with your service account key path
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

const orphanProtocols = [
  {
    id: 'monotherapy-semaglutide',
    title: 'Weight Loss Protocol with Semaglutide',
    status: 'Active',
    goal: 'Metabolic & Weight',
    clinicalFocus: 'Glycemic control and weight loss via GLP-1 agonism.',
    description: 'A dedicated monotherapy protocol for sustained weight management using Semaglutide. Ideal for patients seeking significant reductions in body mass and improved insulin sensitivity.',
    duration: '16 weeks+',
    difficulty: 'Beginner',
    metrics: ['Body Fat Percentage', 'HbA1c', 'Fasting Glucose', 'BMI'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'semaglutide',
        name: 'Semaglutide',
        dosage: '0.25 mg weekly (initiation)',
        frequency: 'Weekly',
        duration: 'Weeks 1-4',
        type: 'Primary',
        notes: 'Titrate dose every 4 weeks: 0.5mg, 1.0mg, up to 1.7mg or 2.4mg maintenance dose.'
      }
    ],
    faqs: [
      { question: 'What are the main side effects?', answer: 'Nausea, vomiting, and gastrointestinal discomfort are common during dose titration.' }
    ],
    seoTitle: 'Semaglutide Weight Loss Protocol',
    seoDescription: 'Clinical protocol for glycemic control and weight loss using Semaglutide GLP-1.'
  },
  {
    id: 'monotherapy-cagrilintide',
    title: 'Advanced Metabolic Management',
    status: 'Active',
    goal: 'Metabolic & Weight',
    clinicalFocus: 'Potent weight loss via amylin analog mechanism.',
    description: 'Advanced metabolic regulation using Cagrilintide. This protocol leverages amylin pathways to enhance satiety and delay gastric emptying, often used synergistically with GLP-1s in the future.',
    duration: '12 weeks+',
    difficulty: 'Intermediate',
    metrics: ['Body Weight', 'Satiety Levels', 'Fasting Insulin'],
    evidenceLevel: 'Moderate',
    items: [
      {
        productSlug: 'cagrilintide',
        name: 'Cagrilintide',
        dosage: '0.25 mg weekly',
        frequency: 'Weekly',
        duration: 'Weeks 1-4',
        type: 'Primary',
        notes: 'Progressive titration up to 2.4 mg weekly based on patient tolerance.'
      }
    ]
  },
  {
    id: 'monotherapy-cjc-1295-dac',
    title: 'Prolonged Hormonal Support',
    status: 'Active',
    goal: 'Longevity & Anti-Aging',
    clinicalFocus: 'Long-acting Growth Hormone Releasing Hormone (GHRH).',
    description: 'A prolonged-action protocol designed for patients requiring sustained growth hormone release without the burden of multiple daily injections, utilizing CJC-1295 with DAC.',
    duration: '8-12 weeks',
    difficulty: 'Intermediate',
    metrics: ['IGF-1 Levels', 'Sleep Quality', 'Lean Muscle Mass'],
    evidenceLevel: 'Moderate',
    items: [
      {
        productSlug: 'cjc-1295-with-dac',
        name: 'CJC-1295 with DAC',
        dosage: '1 mg - 2 mg',
        frequency: '1-2 times per week',
        duration: 'Ongoing',
        type: 'Primary',
        notes: 'Administer subcutaneously. Monitor IGF-1 levels periodically.'
      }
    ]
  },
  {
    id: 'monotherapy-sermorelin',
    title: 'Anti-Aging and Vitality',
    status: 'Active',
    goal: 'Longevity & Anti-Aging',
    clinicalFocus: 'Fast-acting Growth Hormone secretagogue.',
    description: 'A restorative protocol focused on boosting endogenous growth hormone production to improve sleep architecture, skin elasticity, and overall vitality using Sermorelin.',
    duration: '12-24 weeks',
    difficulty: 'Beginner',
    metrics: ['Energy Levels', 'Skin Elasticity', 'REM Sleep'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'sermorelin',
        name: 'Sermorelin',
        dosage: '200 - 500 mcg',
        frequency: 'Nightly',
        duration: '5-7 days per week',
        type: 'Primary',
        notes: 'Administer subcutaneously just before bedtime.'
      }
    ]
  },
  {
    id: 'monotherapy-hexarelin',
    title: 'Extreme Pulsatility and Cardiac Recovery',
    status: 'Active',
    goal: 'Recovery & Repair',
    clinicalFocus: 'Potent GHRP stimulation and cardiac protection.',
    description: 'An aggressive, short-cycle protocol designed for maximum growth hormone pulsatility and myocardial recovery. Ideal for acute injury repair or advanced athletic recovery.',
    duration: '4-8 weeks',
    difficulty: 'Advanced',
    metrics: ['Cardiovascular Recovery', 'Injury Healing Rate', 'GH Serum Levels'],
    evidenceLevel: 'Moderate',
    items: [
      {
        productSlug: 'hexarelin',
        name: 'Hexarelin',
        dosage: '100 - 200 mcg',
        frequency: '1-2 times daily',
        duration: '4-8 weeks max',
        type: 'Primary',
        notes: 'Limit to 8 weeks maximum to prevent receptor desensitization.'
      }
    ]
  },
  {
    id: 'monotherapy-ghrp-2',
    title: 'Hormonal Stimulation and Mass Gain',
    status: 'Active',
    goal: 'Metabolic & Weight', // often used for mass gain
    clinicalFocus: 'GH stimulation and appetite increase.',
    description: 'A protocol tailored for patients requiring significant anabolic support and appetite stimulation. GHRP-2 strongly promotes growth hormone release and increases caloric intake.',
    duration: '8-12 weeks',
    difficulty: 'Intermediate',
    metrics: ['Appetite', 'Lean Body Mass', 'IGF-1'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'ghrp-2',
        name: 'GHRP-2',
        dosage: '100 - 300 mcg',
        frequency: '1-3 times daily',
        duration: '8-12 weeks',
        type: 'Primary',
        notes: 'Administer on an empty stomach for maximum GH pulse.'
      }
    ]
  },
  {
    id: 'monotherapy-mk-677',
    title: 'Oral GH Optimization',
    status: 'Active',
    goal: 'Longevity & Anti-Aging',
    clinicalFocus: 'Oral Growth Hormone Secretagogue.',
    description: 'An injection-free protocol designed to optimize endogenous growth hormone and IGF-1 levels. Perfect for patients with a needle aversion seeking anti-aging or recovery benefits.',
    duration: '3-6 months',
    difficulty: 'Beginner',
    metrics: ['IGF-1 Levels', 'Bone Density', 'Sleep Architecture'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'mk-677',
        name: 'MK-677 (Ibutamoren)',
        dosage: '10 - 25 mg',
        frequency: 'Daily',
        duration: 'Ongoing',
        type: 'Primary',
        notes: 'Administer orally. May increase appetite significantly in the first weeks.'
      }
    ]
  },
  {
    id: 'monotherapy-hcg',
    title: 'HPTA Axis Maintenance',
    status: 'Active',
    goal: 'Hormonal Optimization',
    clinicalFocus: 'Prevention of testicular atrophy and endogenous testosterone support.',
    description: 'A crucial protocol for maintaining the Hypothalamic-Pituitary-Testicular Axis (HPTA), often co-administered with TRT to preserve fertility and testicular volume.',
    duration: 'Ongoing',
    difficulty: 'Intermediate',
    metrics: ['Testosterone Levels', 'Sperm Count', 'Testicular Volume'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'hcg',
        name: 'HCG',
        dosage: '250 - 500 IU',
        frequency: '2-3 times per week',
        duration: 'Ongoing',
        type: 'Primary',
        notes: 'Administer subcutaneously.'
      }
    ]
  },
  {
    id: 'monotherapy-hgh',
    title: 'GH Replacement Therapy',
    status: 'Active',
    goal: 'Hormonal Optimization',
    clinicalFocus: 'Recombinant Human Growth Hormone replacement.',
    description: 'A systemic replacement protocol for clinical growth hormone deficiency, aimed at profound tissue regeneration, metabolic correction, and anti-aging.',
    duration: 'Ongoing',
    difficulty: 'Advanced',
    metrics: ['IGF-1 Levels', 'Body Composition', 'Quality of Life Score'],
    evidenceLevel: 'Very High',
    items: [
      {
        productSlug: 'hgh',
        name: 'HGH',
        dosage: '1 - 2 IU',
        frequency: 'Daily',
        duration: 'Ongoing',
        type: 'Primary',
        notes: 'Titrate dosage based on clinical need and IGF-1 response.'
      }
    ]
  },
  {
    id: 'monotherapy-hmg',
    title: 'Fertility Restoration Protocol',
    status: 'Active',
    goal: 'Hormonal Optimization',
    clinicalFocus: 'Potent stimulation of spermatogenesis.',
    description: 'A targeted fertility protocol using Human Menopausal Gonadotropin (HMG) to directly stimulate FSH and LH receptors, maximizing reproductive potential.',
    duration: '3-6 months',
    difficulty: 'Advanced',
    metrics: ['Semen Analysis', 'FSH/LH Levels'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'hmg',
        name: 'HMG',
        dosage: '75 - 150 IU',
        frequency: '2-3 times per week',
        duration: '3-6 months',
        type: 'Primary',
        notes: 'Monitor closely with fertility specialist.'
      }
    ]
  },
  {
    id: 'monotherapy-kpv',
    title: 'Systemic Inflammatory Suppression',
    status: 'Active',
    goal: 'Immune Support',
    clinicalFocus: 'Potent systemic and gastrointestinal anti-inflammatory.',
    description: 'A protocol leveraging KPV to suppress widespread inflammation. Highly effective for autoimmune flare-ups, dermatological conditions, and inflammatory bowel diseases.',
    duration: '4-8 weeks',
    difficulty: 'Intermediate',
    metrics: ['CRP Levels', 'Symptom Reduction', 'Gut Health'],
    evidenceLevel: 'Moderate',
    items: [
      {
        productSlug: 'kpv',
        name: 'KPV',
        dosage: '200 - 500 mcg',
        frequency: 'Daily',
        duration: '4-8 weeks',
        type: 'Primary',
        notes: 'Can be administered subcutaneously or orally (capsules) for gut-specific issues.'
      }
    ]
  },
  {
    id: 'monotherapy-gw-501516',
    title: 'Endurance and Lipid Optimization',
    status: 'Active',
    goal: 'Metabolic & Weight',
    clinicalFocus: 'PPARδ agonism for cardiovascular endurance and fat oxidation.',
    description: 'An advanced protocol utilizing Cardarine to dramatically boost mitochondrial capacity, cardiovascular endurance, and correct lipid profiles.',
    duration: '8-12 weeks',
    difficulty: 'Advanced',
    metrics: ['VO2 Max', 'Lipid Panel (HDL/LDL)', 'Endurance Capacity'],
    evidenceLevel: 'Moderate',
    items: [
      {
        productSlug: 'gw-501516',
        name: 'GW-501516 (Cardarine)',
        dosage: '10 - 20 mg',
        frequency: 'Daily',
        duration: '8-12 weeks',
        type: 'Primary',
        notes: 'Administer orally. Monitor liver enzymes periodically.'
      }
    ]
  },
  {
    id: 'monotherapy-slu-pp-332',
    title: 'Exercise Mimetics',
    status: 'Active',
    goal: 'Metabolic & Weight',
    clinicalFocus: 'ERR agonism to mimic cardiovascular exercise pathways.',
    description: 'A cutting-edge protocol acting as an exercise mimetic. Ideal for patients with reduced mobility or those seeking an extreme enhancer for fat loss and metabolic conditioning.',
    duration: '8 weeks',
    difficulty: 'Advanced',
    metrics: ['Fat Mass', 'Metabolic Rate', 'Endurance'],
    evidenceLevel: 'Experimental',
    items: [
      {
        productSlug: 'slu-pp-332',
        name: 'SLU PP-332',
        dosage: '250 mcg - 1 mg',
        frequency: 'Daily',
        duration: '8 weeks',
        type: 'Primary',
        notes: 'Currently highly experimental. Monitor closely.'
      }
    ]
  },
  {
    id: 'monotherapy-nmn',
    title: 'Oral Cellular and Mitochondrial Support',
    status: 'Active',
    goal: 'Longevity & Anti-Aging',
    clinicalFocus: 'NAD+ precursor for longevity.',
    description: 'A foundational anti-aging protocol using NMN to replenish declining NAD+ levels, boosting mitochondrial function, energy metabolism, and DNA repair.',
    duration: 'Ongoing',
    difficulty: 'Beginner',
    metrics: ['NAD+ Intracellular Levels', 'Energy Levels', 'Cognitive Function'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'nmn',
        name: 'NMN',
        dosage: '250 - 1000 mg',
        frequency: 'Daily',
        duration: 'Ongoing',
        type: 'Primary',
        notes: 'Administer orally, preferably in the morning.'
      }
    ]
  },
  {
    id: 'monotherapy-thymulin',
    title: 'Basic Immune Support',
    status: 'Active',
    goal: 'Immune Support',
    clinicalFocus: 'Immunological modulation and tissue repair.',
    description: 'A targeted protocol to support and modulate the immune system, particularly useful during periods of high physiological stress or autoimmune flare-ups.',
    duration: '4-12 weeks',
    difficulty: 'Intermediate',
    metrics: ['Immune Markers', 'Infection Frequency', 'T-Cell Count'],
    evidenceLevel: 'Moderate',
    items: [
      {
        productSlug: 'thymulin',
        name: 'Thymulin',
        dosage: '1 - 2 mg',
        frequency: 'Daily or 3x/week',
        duration: '4-12 weeks',
        type: 'Primary',
        notes: 'Adjust frequency based on the severity of immune suppression.'
      }
    ]
  },
  {
    id: 'monotherapy-oxytocin',
    title: 'Bonding and Stress Modulation',
    status: 'Active',
    goal: 'Cognitive & Mood',
    clinicalFocus: 'Social anxiety reduction and libido enhancement.',
    description: 'A neuro-modulatory protocol utilizing Oxytocin Acetate to reduce social anxiety, mitigate acute stress responses, and enhance interpersonal bonding and libido.',
    duration: 'As needed',
    difficulty: 'Beginner',
    metrics: ['Anxiety Levels', 'Social Engagement', 'Stress Biomarkers'],
    evidenceLevel: 'High',
    items: [
      {
        productSlug: 'oxytocin',
        name: 'Oxytocin Acetate',
        dosage: '10 - 20 IU (Intranasal) OR 100 - 200 mcg (SubQ)',
        frequency: 'As needed',
        duration: 'Ongoing',
        type: 'Primary',
        notes: 'Administer on-demand for acute stress or bonding enhancement.'
      }
    ]
  }
];

async function seedOrphanProtocols() {
  console.log('Starting Orphan Protocol seeding...');
  const batch = db.batch();
  let count = 0;

  for (const protocol of orphanProtocols) {
    const docRef = db.collection('protocols').doc(protocol.id);
    batch.set(docRef, {
      ...protocol,
      visibility: 'public',
      isPublic: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    count++;
  }

  await batch.commit();
  console.log(`Successfully seeded ${count} monotherapy protocols!`);
  process.exit(0);
}

seedOrphanProtocols().catch(console.error);
