/**
 * src/scripts/seedUltramanFormulations.mjs
 * 
 * Registers the 9 Official Chronotherapeutic AM/PM Formulations for UltraMan / UltraPerson
 * in Cloud Firestore under the canonical schema (_schemaVersion: 2).
 * 
 * Language: 100% English across all clinical descriptions, specs, and labels.
 * Supplier: Pharmapolis Compounding Pharmacy (Plovdiv, Bulgaria)
 * Collection: "ultraman" / "ultraperson"
 * Category: "supplement" · Subcategory: "compounding_formula"
 */

import { readFileSync } from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { calculatePharmapolisCost, resolvePhysicalCapsuleSize } from '../services/pharmapolisCostEngine.js';

const serviceAccount = JSON.parse(readFileSync('src/scripts/serviceAccountKey.json', 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

export const ULTRAMAN_9_FORMULATIONS = [
  {
    id: 'ultraperson-am-pm-vitality-sleep',
    slug: 'ultraperson-am-pm-vitality-sleep',
    canonicalKey: 'ultraperson-am-pm-vitality-sleep',
    name: 'UltraMan™ Circadian Vitality & Neuro-Restorative Sleep Duo',
    product_name: 'UltraMan™ Circadian Vitality & Neuro-Restorative Sleep Duo',
    canonicalName: 'UltraMan™ Circadian Vitality & Neuro-Restorative Sleep Duo',
    shortDescription: 'Circadian AM/PM chronotherapy delivering morning bioenergetic co-factors and nocturnal GABAergic neuro-restorative sleep support.',
    description: 'Precision dual-capsule chronotherapeutic system engineered to align with circadian biological rhythms. The morning (AM) capsule provides active B-complex co-factors (P-5-P, Niacin), Zinc, and Vitamin D3/C to stimulate cellular bioenergetics and diurnal alertness. The evening (PM) capsule combines pharmaceutical-grade N-Acetylcysteine (NAC), Valerian Root Extract, Methylcobalamin, and Mixed Tocopherols to facilitate nocturnal hepatic detoxification, GABA-A receptor modulation, and deep restorative sleep.',
    therapeuticArea: 'Circadian Synchronization, Bioenergetics & Sleep Architecture',
    goals: [
      'Circadian Optimization',
      'Daily Vitality',
      'Neuro-Restorative Sleep',
      'Antioxidant Defense'
    ],
    goalIds: ['energy_vitality', 'sleep_recovery', 'anti_aging'],
    amActives: [
      { name: 'Vitamin D3 (Cholecalciferol)', apiId: 'pharmapolis-vitamin-d3-cholecalciferol', doseMg: 0.05, unit: 'mg (2000 IU)', role: 'Immune modulation and circadian diurnal gene expression' },
      { name: 'Vitamin C (Ascorbic Acid)', apiId: 'pharmapolis-vitamin-c-ascorbic-acid', doseMg: 200, unit: 'mg', role: 'Adrenal antioxidant support and catecholamine synthesis' },
      { name: 'Zinc Gluconate', apiId: 'pharmapolis-zinc-gluconate', doseMg: 15, unit: 'mg', role: 'DNA polymerase cofactor and metabolic enzyme activation' },
      { name: 'Niacin (Nicotinic Acid)', apiId: 'pharmapolis-niacin-nicotinic-acid', doseMg: 50, unit: 'mg', role: 'NAD+/NADH ratio precursor and microvascular perfusion' },
      { name: 'Vitamin B6 (Pyridoxal-5-Phosphate)', apiId: 'pharmapolis-vitamin-b6-p-5-p', doseMg: 25, unit: 'mg', role: 'Active coenzyme for dopamine and serotonin biosynthesis' }
    ],
    pmActives: [
      { name: 'N-Acetylcysteine (NAC)', apiId: 'pharmapolis-n-acetylcysteine-nac', doseMg: 250, unit: 'mg', role: 'Intracellular glutathione substrate and nocturnal lung/hepatic detox' },
      { name: 'Valerian Root Extract', apiId: 'pharmapolis-valerian-root-extract-valeriana-officinalis', doseMg: 300, unit: 'mg', role: 'Allosteric GABA-A receptor agonist and slow-wave sleep facilitator' },
      { name: 'Vitamin B12 (Methylcobalamin)', apiId: 'pharmapolis-vitamin-b12-methylcobalamin', doseMg: 0.5, unit: 'mg (500 mcg)', role: 'Nocturnal methylation and myelin sheath metabolic maintenance' },
      { name: 'Vitamin E (Mixed Tocopherols)', apiId: 'pharmapolis-vitamin-e-mixed-tocopherols', doseMg: 67, unit: 'mg (100 IU)', role: 'Lipophilic membrane antioxidant preventing nocturnal lipid peroxidation' },
      { name: 'Manganese', apiId: 'pharmapolis-manganese', doseMg: 2, unit: 'mg', role: 'Mitochondrial superoxide dismutase (MnSOD) essential trace mineral' }
    ]
  },
  {
    id: 'ultraperson-am-pm-detox-cardio',
    slug: 'ultraperson-am-pm-detox-cardio',
    canonicalKey: 'ultraperson-am-pm-detox-cardio',
    name: 'UltraMan™ Hepato-Cellular Detox & Cardiovascular Shield Duo',
    product_name: 'UltraMan™ Hepato-Cellular Detox & Cardiovascular Shield Duo',
    canonicalName: 'UltraMan™ Hepato-Cellular Detox & Cardiovascular Shield Duo',
    shortDescription: 'Advanced hepatic Phase I/II biotransformation matrix combined with marine algal omega-3 and endothelial vascular protection.',
    description: 'Comprehensive dual-action chronotherapeutic protocol targeting vascular endothelial resilience and hepatic biotransformation. The AM capsule provides high-potency Algal Omega-3 (EPA/DHA), bioactive Methylfolate, Zinc, and Vitamin D3/C to support endothelial nitric oxide synthase and morning arterial compliance. The PM capsule delivers Silibin (Milk Thistle), Trans-Resveratrol, Taurine, and NAC to accelerate Phase II sulfation and glutathione conjugation during nighttime liver regeneration.',
    therapeuticArea: 'Hepatic Biotransformation, Endothelial Function & Lipid Homeostasis',
    goals: [
      'Cardiovascular Resilience',
      'Liver Detoxification',
      'Nitric Oxide Synthesis',
      'Systemic Antioxidant Protection'
    ],
    goalIds: ['cardiovascular', 'liver_detox', 'anti_aging'],
    amActives: [
      { name: 'Vitamin D3 (Cholecalciferol)', apiId: 'pharmapolis-vitamin-d3-cholecalciferol', doseMg: 0.05, unit: 'mg (2000 IU)', role: 'Vascular endothelial VDR receptor signaling' },
      { name: 'Vitamin C (Ascorbic Acid)', apiId: 'pharmapolis-vitamin-c-ascorbic-acid', doseMg: 200, unit: 'mg', role: 'Protects tetrahydrobiopterin (BH4) to sustain eNOS uncoupling' },
      { name: 'Zinc Gluconate', apiId: 'pharmapolis-zinc-gluconate', doseMg: 15, unit: 'mg', role: 'Metallothionein synthesis and antioxidant enzyme stabilization' },
      { name: 'Vitamin B9 (Methylfolate)', apiId: 'pharmapolis-vitamin-b9-methylfolate', doseMg: 0.4, unit: 'mg (400 mcg)', role: 'Lowers plasma homocysteine to protect coronary microvasculature' },
      { name: 'Algal Omega-3 (EPA/DHA)', apiId: 'pharmapolis-algal-omega-3-epa-dha', doseMg: 300, unit: 'mg', role: 'Bioactive plant-derived polyunsaturated fatty acids for cell membrane fluidity' }
    ],
    pmActives: [
      { name: 'N-Acetylcysteine (NAC)', apiId: 'pharmapolis-n-acetylcysteine-nac', doseMg: 250, unit: 'mg', role: 'Rate-limiting precursor for nocturnal glutathione replenishment' },
      { name: 'Taurine', apiId: 'pharmapolis-taurine', doseMg: 250, unit: 'mg', role: 'Bile acid conjugation, myocardial calcium handling, and osmoprotection' },
      { name: 'Trans-Resveratrol', apiId: 'pharmapolis-resveratrol', doseMg: 150, unit: 'mg', role: 'SIRT-1 activator and vascular anti-inflammatory polyphenol' },
      { name: 'Silibin (Milk Thistle)', apiId: 'pharmapolis-silibin-milk-thistle', doseMg: 140, unit: 'mg', role: 'Inhibits lipid peroxidation and stabilizes hepatocyte cell membranes' },
      { name: 'Vitamin E (Mixed Tocopherols)', apiId: 'pharmapolis-vitamin-e-mixed-tocopherols', doseMg: 67, unit: 'mg (100 IU)', role: 'Synergistic lipophilic antioxidant network' }
    ]
  },
  {
    id: 'ultraperson-am-pm-mitoshield-antiox',
    slug: 'ultraperson-am-pm-mitoshield-antiox',
    canonicalKey: 'ultraperson-am-pm-mitoshield-antiox',
    name: 'UltraMan™ Mitochondrial Shield & Master Glutathione Booster Duo',
    product_name: 'UltraMan™ Mitochondrial Shield & Master Glutathione Booster Duo',
    canonicalName: 'UltraMan™ Mitochondrial Shield & Master Glutathione Booster Duo',
    shortDescription: 'Targeted electron transport chain Complex I/II bioenergetics paired with master intracellular glutathione and curcumin redox defense.',
    description: 'High-potency cellular bioenergetics and antioxidant regeneration protocol. The AM formulation provides active Kaneka Ubiquinol CoQ10, microencapsulated Astaxanthin, Vitamin K2 MK-7, Algal Omega-3, and bioactive Methylfolate to optimize mitochondrial ATP generation in high-demand cardiac and cerebral tissues. The PM capsule unifies Pharmaceutical-Grade Reduced Glutathione (GSH), Cureit® Curcumin Phytosome, NAC, and Taurine to recharge the endogenous redox pool during nightly tissue repair.',
    therapeuticArea: 'Mitochondrial Bioenergetics, Redox Equilibrium & Cellular Longevity',
    goals: [
      'Mitochondrial ATP Synthesis',
      'Endogenous Glutathione Replenishment',
      'Systemic Anti-Inflammatory',
      'Cardiometabolic Vitality'
    ],
    goalIds: ['mitochondrial', 'anti_aging', 'longevity'],
    amActives: [
      { name: 'Coenzyme Q10 (Ubiquinol)', apiId: 'pharmapolis-coenzyme-q10-ubiquinol', doseMg: 100, unit: 'mg', role: 'Reduced active electron carrier for mitochondrial respiratory chain' },
      { name: 'Vitamin K2 (MK-7)', apiId: 'pharmapolis-vitamin-k2-mk-7', doseMg: 0.1, unit: 'mg (100 mcg)', role: 'Activates osteocalcin and matrix Gla-protein (MGP) preventing arterial calcification' },
      { name: 'Algal Omega-3 (EPA/DHA)', apiId: 'pharmapolis-algal-omega-3-epa-dha', doseMg: 300, unit: 'mg', role: 'Mitochondrial cristae cardiolipin phospholipid support' },
      { name: 'Astaxanthin', apiId: 'pharmapolis-astaxanthin', doseMg: 8, unit: 'mg', role: 'Super-antioxidant spanning the entire lipid bilayer membrane' },
      { name: 'Vitamin B9 (Methylfolate)', apiId: 'pharmapolis-vitamin-b9-methylfolate', doseMg: 0.4, unit: 'mg (400 mcg)', role: 'Direct donor for mitochondrial one-carbon folate cycle' }
    ],
    pmActives: [
      { name: 'Curcumin (Cureit)', apiId: 'pharmapolis-curcumin-cureit', doseMg: 250, unit: 'mg', role: '100% natural turmeric matrix with 10x bioavailability; downregulates NF-kB' },
      { name: 'N-Acetylcysteine (NAC)', apiId: 'pharmapolis-n-acetylcysteine-nac', doseMg: 250, unit: 'mg', role: 'Sustains de novo cysteine supply for glutathione synthesis' },
      { name: 'Reduced Glutathione', apiId: 'pharmapolis-reduced-glutathione', doseMg: 250, unit: 'mg', role: 'Master intracellular antioxidant neutralizer of reactive oxygen species (ROS)' },
      { name: 'Taurine', apiId: 'pharmapolis-taurine', doseMg: 250, unit: 'mg', role: 'Mitochondrial tRNA hypoxanthine taurinomethylation cofactor' },
      { name: 'Zinc Gluconate', apiId: 'pharmapolis-zinc-gluconate', doseMg: 15, unit: 'mg', role: 'Superoxide dismutase (Cu/Zn SOD) prosthetic co-factor' }
    ]
  },
  {
    id: 'ultraperson-am-pm-longevity-sirtuin',
    slug: 'ultraperson-am-pm-longevity-sirtuin',
    canonicalKey: 'ultraperson-am-pm-longevity-sirtuin',
    name: 'UltraMan™ Advanced Longevity Sirtuin & Telomere Defense Duo',
    product_name: 'UltraMan™ Advanced Longevity Sirtuin & Telomere Defense Duo',
    canonicalName: 'UltraMan™ Advanced Longevity Sirtuin & Telomere Defense Duo',
    shortDescription: 'Cutting-edge longevity chronotherapy activating SIRT-1 deacetylases, cellular autophagy, and telomere integrity.',
    description: 'The pinnacle of compounded longevity medicine. Engineered for maximum sirtuin upregulation, senescent cell management, and telomeric protection. The AM capsule provides Mitocondrin®, CitrusiM® flavanones, Brocophanus® glucoraphanin/sulforaphane precursors, CoQ10, and Astaxanthin to activate Nrf2 and AMP-activated protein kinase (AMPK). The PM capsule combines Trans-Resveratrol, Miodesin®, Reduced Glutathione, Cureit® Curcumin, and bioavailable SiliciuMax® to stimulate overnight chaperone-mediated autophagy and suppress SASP (Senescence-Associated Secretory Phenotype).',
    therapeuticArea: 'Sirtuin Activation, Autophagy & Cellular Senescence Clearance',
    goals: [
      'SIRT-1 / AMPK Activation',
      'Autophagy Stimulation',
      'Nrf2 Phase II Detox Induction',
      'Telomere & Epigenetic Longevity'
    ],
    goalIds: ['anti_aging', 'longevity', 'cellular_repair'],
    amActives: [
      { name: 'Coenzyme Q10 (Ubiquinol)', apiId: 'pharmapolis-coenzyme-q10-ubiquinol', doseMg: 100, unit: 'mg', role: 'Mitochondrial electron transport and anti-aging energy donor' },
      { name: 'Mitocondrin', apiId: 'pharmapolis-mitocondrin', doseMg: 250, unit: 'mg', role: 'Specialized mitochondrial protective complex stimulating mitochondrial biogenesis' },
      { name: 'CitrusiM', apiId: 'pharmapolis-citrusim', doseMg: 250, unit: 'mg', role: 'Red orange anthocyanin and flavanone complex for metabolic AMPK stimulation' },
      { name: 'Brocophanus', apiId: 'pharmapolis-brocophanus', doseMg: 250, unit: 'mg', role: 'Glucoraphanin & myrosinase sulforaphane generator; master Nrf2 activator' },
      { name: 'Astaxanthin', apiId: 'pharmapolis-astaxanthin', doseMg: 8, unit: 'mg', role: 'Protects nuclear and mitochondrial DNA from oxidative double-strand breaks' }
    ],
    pmActives: [
      { name: 'Curcumin (Cureit)', apiId: 'pharmapolis-curcumin-cureit', doseMg: 250, unit: 'mg', role: 'Epigenetic histone deacetylase (HDAC) and NF-kB inhibitor' },
      { name: 'Trans-Resveratrol', apiId: 'pharmapolis-resveratrol', doseMg: 150, unit: 'mg', role: 'Direct allosteric activator of SIRT1 longevity gene' },
      { name: 'Reduced Glutathione', apiId: 'pharmapolis-reduced-glutathione', doseMg: 250, unit: 'mg', role: 'Nocturnal cellular nucleophilic scavenger of reactive electrophiles' },
      { name: 'Miodesin', apiId: 'pharmapolis-miodesin', doseMg: 250, unit: 'mg', role: 'Potent botanical anti-inflammatory matrix targeting somatic cellular aging' },
      { name: 'SiliciuMax', apiId: 'pharmapolis-siliciumax', doseMg: 10, unit: 'mg', role: 'Monomeric bioavailable orthosilicic acid for extracellular matrix crosslinking' }
    ]
  },
  {
    id: 'ultraperson-am-pm-dermal-matrix',
    slug: 'ultraperson-am-pm-dermal-matrix',
    canonicalKey: 'ultraperson-am-pm-dermal-matrix',
    name: 'UltraMan™ Dermal Matrix & Hair Follicle Regeneration Duo',
    product_name: 'UltraMan™ Dermal Matrix & Hair Follicle Regeneration Duo',
    canonicalName: 'UltraMan™ Dermal Matrix & Hair Follicle Regeneration Duo',
    shortDescription: 'Nutraceutical follicle and dermal collagen renewal formula with high-dose Biotin, SiliciuMax orthosilicic acid, Horsetail, and Panax Ginseng.',
    description: 'Precision systemic dermatological formulation calibrated for hair follicle miniaturization reversal and extracellular dermal matrix crosslinking. The AM capsule provides Pharmaceutical-Grade Biotin (5,000 mcg), SiliciuMax® bioavailable silicon, Horsetail Extract (Equisetum arvense), Zinc, and high-dose Vitamin D3 to stimulate trichocyte keratinization and anagen phase prolongation. The PM capsule delivers Algal Omega-3, NAC, Vitamin C, Silibin, and Panax Ginseng extract to enhance scalp dermal papilla microcirculation and reduce DHT-mediated perifollicular fibrosis during sleep.',
    therapeuticArea: 'Trichology, Collagen Crosslinking & Dermal Papilla Vitality',
    goals: [
      'Hair Follicle Anagen Extension',
      'Collagen & Keratin Synthesis',
      'Scalp Microvascular Perfusion',
      'Connective Tissue Elasticity'
    ],
    goalIds: ['hair_skin_nails', 'tissue_repair', 'wellness'],
    amActives: [
      { name: 'Biotin', apiId: 'pharmapolis-biotin', doseMg: 5, unit: 'mg (5000 mcg)', role: 'Essential carboxylase cofactor for keratin matrix structural protein synthesis' },
      { name: 'SiliciuMax', apiId: 'pharmapolis-siliciumax', doseMg: 10, unit: 'mg', role: 'Orthosilicic acid activates prolyl hydroxylase for collagen fibril crosslinking' },
      { name: 'Horsetail Extract', apiId: 'pharmapolis-horsetail-extract-equisetum-arvense', doseMg: 300, unit: 'mg', role: 'High organic silica plant extract strengthening hair shaft tensile durability' },
      { name: 'Zinc Gluconate', apiId: 'pharmapolis-zinc-gluconate', doseMg: 30, unit: 'mg', role: 'Inhibits 5-alpha reductase and accelerates follicle matrix cell division' },
      { name: 'Vitamin D3 (Cholecalciferol)', apiId: 'pharmapolis-vitamin-d3-cholecalciferol', doseMg: 0.1, unit: 'mg (4000 IU)', role: 'Stimulates hair follicle cycling and activates dormant stem cell niches' }
    ],
    pmActives: [
      { name: 'Algal Omega-3 (EPA/DHA)', apiId: 'pharmapolis-algal-omega-3-epa-dha', doseMg: 300, unit: 'mg', role: 'Normalizes scalp sebum fatty acid profiles and dampens perifollicular erythema' },
      { name: 'N-Acetylcysteine (NAC)', apiId: 'pharmapolis-n-acetylcysteine-nac', doseMg: 250, unit: 'mg', role: 'Supplies cysteine for disulfide bond formation in hard hair keratin' },
      { name: 'Vitamin C (Ascorbic Acid)', apiId: 'pharmapolis-vitamin-c-ascorbic-acid', doseMg: 200, unit: 'mg', role: 'Rate-limiting cofactor for lysine and proline collagen hydroxylation' },
      { name: 'Silibin (Milk Thistle)', apiId: 'pharmapolis-silibin-milk-thistle', doseMg: 140, unit: 'mg', role: 'Protects microvascular capillaries from oxidative lipid breakdown' },
      { name: 'Panax Ginseng Extract', apiId: 'pharmapolis-panax-ginseng-extract', doseMg: 200, unit: 'mg', role: 'Ginsenoside Rg3/Rb1 promotes dermal papilla cell proliferation and VEGF expression' }
    ]
  },
  {
    id: 'ultraperson-am-pm-hepato-neuro',
    slug: 'ultraperson-am-pm-hepato-neuro',
    canonicalKey: 'ultraperson-am-pm-hepato-neuro',
    name: 'UltraMan™ Hepato-Biliary Detox & Neuro-Restoration Duo',
    product_name: 'UltraMan™ Hepato-Biliary Detox & Neuro-Restoration Duo',
    canonicalName: 'UltraMan™ Hepato-Biliary Detox & Neuro-Restoration Duo',
    shortDescription: 'Cynarin-driven biliary clearance, copper-zinc enzymatic balance, and nocturnal neuro-glial glymphatic cleansing.',
    description: 'Synergistic chronotherapeutic regimen combining hepatobiliary choleretic clearance with nocturnal glymphatic central nervous system detoxification. The morning formula delivers standardized Cynara Artichoke extract, Copper Bisglycinate, Vitamin B5 (Pantothenic Acid), and Retinol to promote bile acid synthesis, Phase I enzyme equilibrium, and gastrointestinal motility. The evening formula combines Taurine, Silibin, Valerian, Methylcobalamin, and NAC to support heavy metal conjugation, deep stage-4 NREM sleep, and cerebral glymphatic clearance.',
    therapeuticArea: 'Biliary Flow, Heavy Metal Chelation & Glymphatic Clearance',
    goals: [
      'Bile Flow Stimulation',
      'Heavy Metal Conjugation',
      'Neuro-Glial Glymphatic Cleansing',
      'Parasympathetic Nervous System Tone'
    ],
    goalIds: ['liver_detox', 'sleep_recovery', 'cognitive_mood'],
    amActives: [
      { name: 'Artichoke Extract (Cynara scolymus)', apiId: 'pharmapolis-artichoke-extract-cynara-scolymus', doseMg: 300, unit: 'mg', role: 'Standardized 5% cynarin stimulating choleresis and gallbladder emptying' },
      { name: 'Copper (Bisglycinate)', apiId: 'pharmapolis-copper-bisglycinate', doseMg: 2, unit: 'mg', role: 'Ceruloplasmin and cytochrome c oxidase essential trace element' },
      { name: 'Vitamin B5 (Calcium Pantothenate)', apiId: 'pharmapolis-vitamin-b5-calcium-pantothenate', doseMg: 100, unit: 'mg', role: 'Coenzyme A (CoA) precursor for fatty acid oxidation and acetylation' },
      { name: 'Vitamin A (Retinol)', apiId: 'pharmapolis-vitamin-a-retinol', doseMg: 0.75, unit: 'mg (2500 IU)', role: 'Biliary epithelial lining and immune mucosal barrier maintenance' },
      { name: 'Vitamin E (Mixed Tocopherols)', apiId: 'pharmapolis-vitamin-e-mixed-tocopherols', doseMg: 67, unit: 'mg (100 IU)', role: 'Protects bile canalicular membranes from surfactant bile salt damage' }
    ],
    pmActives: [
      { name: 'Taurine', apiId: 'pharmapolis-taurine', doseMg: 250, unit: 'mg', role: 'Essential for conjugating hydrophobic bile acids into water-soluble taurocholate' },
      { name: 'Silibin (Milk Thistle)', apiId: 'pharmapolis-silibin-milk-thistle', doseMg: 140, unit: 'mg', role: 'Stimulates nucleolar RNA polymerase I, accelerating hepatocyte ribosomal protein repair' },
      { name: 'Valerian Root Extract', apiId: 'pharmapolis-valerian-root-extract-valeriana-officinalis', doseMg: 300, unit: 'mg', role: 'Inhibits GABA transaminase to enhance cerebral parasympathetic relaxation' },
      { name: 'Vitamin B12 (Methylcobalamin)', apiId: 'pharmapolis-vitamin-b12-methylcobalamin', doseMg: 0.5, unit: 'mg (500 mcg)', role: 'Supplies methyl groups for neurological myelin sheath repair' },
      { name: 'N-Acetylcysteine (NAC)', apiId: 'pharmapolis-n-acetylcysteine-nac', doseMg: 250, unit: 'mg', role: 'Chelates divalent toxic heavy metals and replenishes hepatic glutathione' }
    ]
  },
  {
    id: 'ultraperson-am-pm-cardio-stress',
    slug: 'ultraperson-am-pm-cardio-stress',
    canonicalKey: 'ultraperson-am-pm-cardio-stress',
    name: 'UltraMan™ Essential Cardiometabolic & Adaptogenic Calm Duo',
    product_name: 'UltraMan™ Essential Cardiometabolic & Adaptogenic Calm Duo',
    canonicalName: 'UltraMan™ Essential Cardiometabolic & Adaptogenic Calm Duo',
    shortDescription: 'Core cardiovascular homocysteine balance, algal EPA/DHA, and targeted evening HPA axis adaptogenic calm.',
    description: 'Fundamental daily wellness and cardiometabolic maintenance protocol. Features a diurnal split calibrated for executive and active clinical populations experiencing elevated allostatic stress. The AM dose provides high-bioavailability Algal Omega-3 (EPA/DHA), bioactive L-Methylfolate, Zinc Gluconate, Vitamin C, and Vitamin D3 to buffer cortisol-mediated vascular tension and optimize lipid ratios. The PM dose pairs NAC, Taurine, and Valerian Root to induce rapid autonomic nervous system downshift and optimize nocturnal heart rate variability (HRV).',
    therapeuticArea: 'Cardiometabolic Balance, Homocysteine Control & HPA Axis Dampening',
    goals: [
      'Heart Rate Variability (HRV) Support',
      'Homocysteine Neutralization',
      'Cortisol Downregulation',
      'Endothelial Nitric Oxide Tone'
    ],
    goalIds: ['cardiovascular', 'stress_mood', 'general_wellness'],
    amActives: [
      { name: 'Vitamin D3 (Cholecalciferol)', apiId: 'pharmapolis-vitamin-d3-cholecalciferol', doseMg: 0.05, unit: 'mg (2000 IU)', role: 'Renin-angiotensin-aldosterone system (RAAS) downregulatory hormone' },
      { name: 'Vitamin C (Ascorbic Acid)', apiId: 'pharmapolis-vitamin-c-ascorbic-acid', doseMg: 200, unit: 'mg', role: 'Scavenges peroxynitrite radicals in coronary endothelium' },
      { name: 'Zinc Gluconate', apiId: 'pharmapolis-zinc-gluconate', doseMg: 15, unit: 'mg', role: 'Essential for insulin storage in pancreatic beta-cell hexamers' },
      { name: 'Vitamin B9 (Methylfolate)', apiId: 'pharmapolis-vitamin-b9-methylfolate', doseMg: 0.4, unit: 'mg (400 mcg)', role: 'Essential co-factor for remethylation of homocysteine to methionine' },
      { name: 'Algal Omega-3 (EPA/DHA)', apiId: 'pharmapolis-algal-omega-3-epa-dha', doseMg: 300, unit: 'mg', role: 'Decreases triglyceride synthesis and suppresses pro-inflammatory eicosanoids' }
    ],
    pmActives: [
      { name: 'N-Acetylcysteine (NAC)', apiId: 'pharmapolis-n-acetylcysteine-nac', doseMg: 250, unit: 'mg', role: 'Reduces vascular cell adhesion molecules (VCAM-1) and buffers arterial wall stress' },
      { name: 'Taurine', apiId: 'pharmapolis-taurine', doseMg: 250, unit: 'mg', role: 'Calms sympathetic overactivity and optimizes vascular smooth muscle tonus' },
      { name: 'Valerian Root Extract', apiId: 'pharmapolis-valerian-root-extract-valeriana-officinalis', doseMg: 300, unit: 'mg', role: 'Reduces sleep latency and elevates restorative delta-wave sleep' }
    ]
  },
  {
    id: 'ultraperson-am-pm-gut-inflammation',
    slug: 'ultraperson-am-pm-gut-inflammation',
    canonicalKey: 'ultraperson-am-pm-gut-inflammation',
    name: 'UltraMan™ Systemic Anti-Inflammatory & Microbiome Barrier Duo',
    product_name: 'UltraMan™ Systemic Anti-Inflammatory & Microbiome Barrier Duo',
    canonicalName: 'UltraMan™ Systemic Anti-Inflammatory & Microbiome Barrier Duo',
    shortDescription: 'Dual-target formulation addressing mucosal tight junction integrity via Biointestil and systemic NF-kB suppression via Cureit Curcumin, Resveratrol, and ALA.',
    description: 'Precision gastroenterological and systemic anti-inflammatory regimen designed to resolve mucosal gut hyperpermeability ("leaky gut") and downregulate systemic inflammatory cytokines (TNF-alpha, IL-6). The AM capsule combines Cureit® Full-Spectrum Curcumin, Trans-Resveratrol, Alpha-Lipoic Acid (ALA), and Vitamin D3 to suppress nuclear factor kappa B (NF-kB) and normalize cellular glucose metabolism. The PM capsule delivers patented Biointestil® (Palmarosa oil geraniol + Zingiber officinale gingerols) with Valerian to soothe visceral hypersensitivity, eliminate dysbiotic gut fermentation, and rebuild intestinal tight junctions.',
    therapeuticArea: 'Gastrointestinal Permeability, Microbiome Dysbiosis & Systemic Inflammation',
    goals: [
      'Intestinal Tight Junction Integrity',
      'Systemic NF-kB Suppression',
      'Microbiome Dysbiosis Resolution',
      'Visceral Nerve Soothing'
    ],
    goalIds: ['gut_health', 'anti_aging', 'tissue_repair'],
    amActives: [
      { name: 'Vitamin D3 (Cholecalciferol)', apiId: 'pharmapolis-vitamin-d3-cholecalciferol', doseMg: 0.075, unit: 'mg (3000 IU)', role: 'Upregulates occludin and claudin tight junction protein expression' },
      { name: 'Curcumin (Cureit)', apiId: 'pharmapolis-curcumin-cureit', doseMg: 250, unit: 'mg', role: 'Bioavailable turmeric matrix blocking I-kappa-B kinase (IKK) activation' },
      { name: 'Resveratrol', apiId: 'pharmapolis-resveratrol', doseMg: 100, unit: 'mg', role: 'SIRT-1 activator protecting intestinal epithelial monolayer from apoptotic stress' },
      { name: 'Alpha-Lipoic Acid (ALA)', apiId: 'pharmapolis-alpha-lipoic-acid-ala', doseMg: 300, unit: 'mg', role: 'Universal hydrophilic/lipophilic antioxidant recharging Vitamin C and E' }
    ],
    pmActives: [
      { name: 'Valerian Root Extract', apiId: 'pharmapolis-valerian-root-extract-valeriana-officinalis', doseMg: 300, unit: 'mg', role: 'Antispasmodic action on enteric smooth muscle and enteric nervous system calm' },
      { name: 'Biointestil', apiId: 'pharmapolis-biointestil', doseMg: 300, unit: 'mg', role: 'Patented geraniol-gingerol phytocomplex selectively targeting gut dysbiosis and bloating' }
    ]
  },
  {
    id: 'ultraperson-am-pm-neuro-metabolic',
    slug: 'ultraperson-am-pm-neuro-metabolic',
    canonicalKey: 'ultraperson-am-pm-neuro-metabolic',
    name: 'UltraMan™ Neuro-Metabolic Synaptic & Insulin Sensitivity Duo',
    product_name: 'UltraMan™ Neuro-Metabolic Synaptic & Insulin Sensitivity Duo',
    canonicalName: 'UltraMan™ Neuro-Metabolic Synaptic & Insulin Sensitivity Duo',
    shortDescription: 'High-potency Methylcobalamin one-carbon methylation donor paired with Myo-Inositol for insulin receptor second messenger cascade and synaptic density.',
    description: 'Targeted neuro-metabolic protocol engineered to enhance cerebral glucose uptake, insulin sensitivity, and monoamine neurotransmitter turnover. The AM capsule provides ultra-pure Methylcobalamin (1,000 mcg), Zinc Gluconate, Algal Omega-3 (EPA/DHA), and Vitamin D3 to fuel S-adenosylmethionine (SAMe) synthesis, myelin sheath repair, and membrane phospholipid signaling. The PM capsule combines Taurine and Myo-Inositol to support phosphatidylinositol secondary messenger signaling, enhance GABAergic tone, and stabilize evening glycaemic fluctuations.',
    therapeuticArea: 'Cerebral Insulin Sensitivity, One-Carbon Metabolism & Synaptic Density',
    goals: [
      'One-Carbon Methylation Support',
      'Insulin Receptor Sensitization',
      'Inositol Phospholipid Second Messengers',
      'Cognitive Synaptic Speed'
    ],
    goalIds: ['cognitive_mood', 'metabolic', 'general_wellness'],
    amActives: [
      { name: 'Vitamin B12 (Methylcobalamin)', apiId: 'pharmapolis-vitamin-b12-methylcobalamin', doseMg: 1, unit: 'mg (1000 mcg)', role: 'Bioactive cobalamin cofactor for methionine synthase and homocysteine clearance' },
      { name: 'Vitamin D3 (Cholecalciferol)', apiId: 'pharmapolis-vitamin-d3-cholecalciferol', doseMg: 0.05, unit: 'mg (2000 IU)', role: 'Enhances neurotrophic factor synthesis (NGF, BDNF) in hippocampal neurons' },
      { name: 'Zinc Gluconate', apiId: 'pharmapolis-zinc-gluconate', doseMg: 15, unit: 'mg', role: 'Modulates synaptic glutamatergic NMDA and AMPA receptor transmission' },
      { name: 'Algal Omega-3 (EPA/DHA)', apiId: 'pharmapolis-algal-omega-3-epa-dha', doseMg: 250, unit: 'mg', role: 'Essential structural component of synaptic dendritic membranes' }
    ],
    pmActives: [
      { name: 'Taurine', apiId: 'pharmapolis-taurine', doseMg: 250, unit: 'mg', role: 'Neuroprotective amino acid supporting hippocampal neurogenesis and calcium homeostasis' },
      { name: 'Myo-Inositol', apiId: 'pharmapolis-myo-inositol', doseMg: 250, unit: 'mg', role: 'Precursor of inositol triphosphate (IP3) second messenger; improves cellular insulin sensitivity' }
    ]
  }
];

async function seed() {
  console.log('🚀 Seeding 9 Official UltraMan AM/PM Formulations to Firestore...');

  for (const form of ULTRAMAN_9_FORMULATIONS) {
    const docRef = db.collection('products').doc(form.id);

    // Compute exact physical capsule specs
    const amSize = resolvePhysicalCapsuleSize(form.amActives);
    const pmSize = resolvePhysicalCapsuleSize(form.pmActives);

    // Compute exact Pharmapolis manufacturing costs (CAT-CAP v1.1)
    const costAm = calculatePharmapolisCost({ activeIngredients: form.amActives, capsPerBottle: 30 });
    const costPm = calculatePharmapolisCost({ activeIngredients: form.pmActives, capsPerBottle: 30 });
    const netManufacturingPriceEur = Number((costAm.finalPricing.netSellingPriceEur + costPm.finalPricing.netSellingPriceEur).toFixed(2));
    const totalProductionCostEur = Number((costAm.totalProductionCostEur + costPm.totalProductionCostEur).toFixed(2));

    // Pricing tiers
    const wholesalePriceEur = Math.round(netManufacturingPriceEur * 1.35);
    const clinicPriceEur = Math.round(netManufacturingPriceEur * 1.65);
    const retailPriceEur = Math.round(netManufacturingPriceEur * 2.20);

    // Construct unified active ingredients list for display & compounding engine
    const activeIngredients = [
      ...form.amActives.map(a => ({ ...a, schedule: 'AM', administration: 'Morning with food' })),
      ...form.pmActives.map(a => ({ ...a, schedule: 'PM', administration: 'Evening 30-60m before sleep' }))
    ];

    const variants = [
      {
        id: `${form.id}-30d-duo`,
        variantId: `${form.id}-30d-duo`,
        docId: `${form.id}-30d-duo`,
        productId: form.id,
        name: `${form.name} - 30-Day Duo Pack (60 Caps)`,
        productName: form.name,
        label: '30-Day Duo Protocol (30 AM Caps + 30 PM Caps)',
        dosage: '60 Capsules Total (30 AM + 30 PM)',
        dose: '60 Capsules',
        format: `Duo Pack (${amSize.size} AM Bottle + ${pmSize.size} PM Bottle)`,
        capsulesCount: 60,
        durationDays: 30,
        dailyServing: '1 AM Capsule (Morning) + 1 PM Capsule (Evening)',
        pricing: {
          master: { perUnit: totalProductionCostEur, currency: 'EUR' },
          wholesale: { perUnit: wholesalePriceEur, currency: 'EUR' },
          clinic: { perUnit: clinicPriceEur, currency: 'EUR' },
          retail: { perUnit: retailPriceEur, currency: 'EUR' }
        },
        costPrice: totalProductionCostEur,
        wholesalePrice: wholesalePriceEur,
        clinicPrice: clinicPriceEur,
        retailPrice: retailPriceEur,
        price: retailPriceEur,
        unit_price: clinicPriceEur,
        currency: 'EUR',
        inStock: true,
        stockType: 'compounded_on_demand',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        supplier: 'PharmaPolis',
        leadTime: '3-5 business days',
        status: 'published'
      },
      {
        id: `${form.id}-90d-protocol`,
        variantId: `${form.id}-90d-protocol`,
        docId: `${form.id}-90d-protocol`,
        productId: form.id,
        name: `${form.name} - 90-Day Full Protocol (180 Caps)`,
        productName: form.name,
        label: '90-Day Clinical Protocol (90 AM Caps + 90 PM Caps)',
        dosage: '180 Capsules Total (90 AM + 90 PM)',
        dose: '180 Capsules',
        format: `Triple Master Pack (3x AM Bottles + 3x PM Bottles)`,
        capsulesCount: 180,
        durationDays: 90,
        dailyServing: '1 AM Capsule (Morning) + 1 PM Capsule (Evening)',
        treatmentType: '90-Day Precision Clinical Regimen',
        pricing: {
          master: { perUnit: Math.round(totalProductionCostEur * 2.7), currency: 'EUR' },
          wholesale: { perUnit: Math.round(wholesalePriceEur * 2.7), currency: 'EUR' },
          clinic: { perUnit: Math.round(clinicPriceEur * 2.7), currency: 'EUR' },
          retail: { perUnit: Math.round(retailPriceEur * 2.7), currency: 'EUR' }
        },
        costPrice: Math.round(totalProductionCostEur * 2.7),
        wholesalePrice: Math.round(wholesalePriceEur * 2.7),
        clinicPrice: Math.round(clinicPriceEur * 2.7),
        retailPrice: Math.round(retailPriceEur * 2.7),
        price: Math.round(retailPriceEur * 2.7),
        unit_price: Math.round(clinicPriceEur * 2.7),
        currency: 'EUR',
        inStock: true,
        stockType: 'compounded_on_demand',
        supplierId: 'supplier-pharmapolis',
        supplierName: 'Pharmapolis Compounding Pharmacy',
        supplier: 'PharmaPolis',
        leadTime: '3-5 business days',
        status: 'published'
      }
    ];

    const payload = {
      id: form.id,
      name: form.name,
      product_name: form.name,
      canonicalName: form.name,
      slug: form.slug,
      canonicalKey: form.canonicalKey,
      brand: 'UltraPerson',
      brandScope: 'ultraperson',
      collection: 'ultraman',
      collections: ['ultraman', 'ultraperson', 'compounding', 'supplements'],
      categoryId: 'supplement',
      category: 'supplement',
      subcategory: 'compounding_formula',
      categoryLabel: 'Supplements',
      line: 'UltraMan Chronotherapeutic AM/PM Compounding',
      supplierId: 'supplier-pharmapolis',
      supplierIds: ['supplier-pharmapolis'],
      supplierName: 'Pharmapolis Compounding Pharmacy',
      supplierHub: 'pharmapolis',
      supplier: 'PharmaPolis',
      isCompounded: true,
      status: 'published',
      isActive: true,
      type: 'finished_product',
      format: `Acid-Resistant Vegan HPMC Capsules (AM: ${amSize.size} · PM: ${pmSize.size})`,
      deliveryFormat: 'capsules',
      dailyServing: '1 AM Capsule (Morning) + 1 PM Capsule (Evening)',
      dosageInstructions: 'Take 1 AM capsule in the morning with food; take 1 PM capsule in the evening 30-60 minutes before sleep.',
      therapeuticArea: form.therapeuticArea,
      description: form.description,
      shortDescription: form.shortDescription,
      amCapsuleSize: amSize.size,
      pmCapsuleSize: pmSize.size,
      amActives: form.amActives,
      pmActives: form.pmActives,
      activeIngredients,
      compoundingCostBenchmarks: {
        '60_caps_duo': {
          caps: 60,
          totalProductionCostEur,
          netManufacturingPriceEur,
          costAmEur: costAm.finalPricing.netSellingPriceEur,
          costPmEur: costPm.finalPricing.netSellingPriceEur
        }
      },
      min_unit_price: clinicPriceEur,
      price_wholesale: wholesalePriceEur,
      price_clinic: clinicPriceEur,
      price_retail: retailPriceEur,
      variants,
      variantsCount: variants.length,
      goals: form.goals,
      goalIds: form.goalIds,
      dietaryFlags: [
        '100% Vegan HPMC',
        'Acid-Resistant Delayed Release',
        'Non-GMO',
        'Gluten-Free',
        'Allergen-Free',
        'Titanium Dioxide Free'
      ],
      certifications: [
        'EU GMP Compounded',
        'ISO 22000 Certified Laboratory',
        'Third-Party Heavy Metals Tested (< 0.01 ppm)',
        'Standardized Botanical Extracts'
      ],
      storageConditions: 'Store in a cool, dry place away from direct sunlight (15°C–25°C). Keep bottles tightly sealed.',
      shelfLife: '24 Months',
      _schemaVersion: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(payload, { merge: true });
    console.log(`✅ Registered in Firestore: [${form.id}] - ${form.name} (Wholesale: €${wholesalePriceEur} | Clinic: €${clinicPriceEur} | MSRP: €${retailPriceEur})`);
  }

  console.log('🎉 Successfully seeded all 9 UltraMan AM/PM Formulations into Firestore!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
