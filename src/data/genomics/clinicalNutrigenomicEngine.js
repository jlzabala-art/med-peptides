/**
 * clinicalNutrigenomicEngine.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized, authoritative clinical logic for processing nutritional genetic tests
 * (24Genetics Nutrition Panels, Fagron Genomics NutriGen™, and general nutrigenomic files).
 * 
 * Provides:
 * 1. Pharmacokinetic and Galenic Compatibility Engine.
 * 2. 3-Capsule Protocol Architecture (Zero Redundancy, Zero Incompatibilities).
 * 3. 4 Functional Clinical Pillars.
 * 4. Concrete High-Adherence Dietary Guidelines.
 * 5. Synchronized bilingual (EN/ES) data model used identically by:
 *    - /api/compounding/parse-24genetics (General AI processor for genetic test uploads)
 *    - /api/reports/24genomics-patient-pdf (Official 2-Page English Prescription PDF)
 *    - /patient/dna-report (Public 1-Click Interactive Patient Portal)
 *    - /pricing/24genomics-qatar (Doctor Copilot & Clinical Case tab)
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const GALENIC_COMPATIBILITY_ANALYSIS = {
  rationale: 'Galenic and pharmacokinetic analysis strictly contraindicates combining all 9 active ingredients into a single monolithic capsule due to physical volume overload, botanical antimicrobial antagonism against live probiotics, and conflicting absorption kinetics.',
  conflictsIdentified: [
    {
      title: 'Botanical Antimicrobial Antagonism vs Live Probiotics',
      severity: 'Critical Galenic Incompatibility',
      detail: 'Standardized Berberine is a potent plant isoquinoline alkaloid with broad-spectrum antimicrobial activity. Co-encapsulating berberine with live probiotics kills or dramatically reduces colony-forming unit (CFU) viability during storage and gastric transit.'
    },
    {
      title: 'Lipophilic vs Hydrophilic Pharmacokinetics',
      severity: 'Absorption Conflict',
      detail: 'Fat-soluble vitamins (Cholecalciferol D3 and Menaquinone-7 K2) require biliary salt emulsification and dietary lipids for optimal micellar absorption. Conversely, probiotics and mucosal L-glutamine are best absorbed on an empty stomach to avoid competitive uptake and premature gastric acid degradation.'
    },
    {
      title: 'Circadian Metabolic & Neurochemical Timing',
      severity: 'Chronobiological Conflict',
      detail: 'Berberine and Chromium sensitize daytime insulin receptors to mealtime carbohydrates. Conversely, Magnesium Bisglycinate and 5-HTP activate evening parasympathetic tone, serotonin-to-melatonin conversion, and nocturnal cellular repair.'
    },
    {
      title: 'Physical Bulk Volume Constraints',
      severity: 'Patient Adherence & Galenic Feasibility',
      detail: 'Total combined daily active mass exceeds 1,600 mg. Encapsulating this in a single unit would require an unswallowable "000" capsule, leading to patient non-adherence and esophageal discomfort.'
    }
  ],
  resolvedArchitecture: '3-Capsule Compartmentalized Protocol (Capsule A: Fasting Gut Shield · Capsule B: Daytime Metabolic Activator · Capsule C: Evening Cellular Recovery)'
};

export const CLINICAL_PILLARS = [
  {
    id: 'pillar1_metabolism',
    number: 1,
    titleEn: 'Pillar 1: Glycemic Metabolism & Insulin Sensitivity',
    titleEs: 'Pilar 1: Metabolismo Glucémico & Sensibilidad a la Insulina',
    shortTitleEn: 'Carbohydrate Sensitivity & Midday Energy Dips',
    shortTitleEs: 'Sensibilidad a Carbohidratos & Bajones de Energía',
    keyGenes: 'TCF7L2 (rs7903146), FTO (rs9939609), SLC2A2',
    dnaFindingEn: 'Refined carbs trigger rapid insulin surges, promoting mid-afternoon energy crashes and abdominal fat storage.',
    dnaFindingEs: 'Los carbohidratos refinados generan picos de insulina acusados, provocando bajones vespertinos y acumulación de grasa visceral.',
    clinicalRationaleEn: 'TCF7L2 reduces beta-cell GLP-1 responsiveness. Activating AMPK phosphorylation and enhancing insulin receptor tyrosine kinase activity flattens glycemic curves.',
    clinicalRationaleEs: 'TCF7L2 atenúa la respuesta a GLP-1. La activación de AMPK y la sensibilización del receptor de insulina previenen la lipogénesis.',
    statusEn: 'GLUCOSE SENSITIVE',
    statusEs: 'SENSIBILIDAD A GLUCOSA',
    statusColor: '#0d9488',
    statusBg: '#f0fdfa',
    assignedCapsules: ['Capsule B (Midday)'],
    assignedFormulation: {
      code: 'FORMULATION 2',
      formulationNumber: 2,
      capsuleId: 'capsule_b',
      capsuleNameEn: 'Capsule B (Midday)',
      capsuleNameEs: 'Cápsula B (Mediodía)',
      timingEn: 'With Breakfast / Lunch (Healthy Fats)',
      timingEs: 'Con el Desayuno / Almuerzo (Grasas Saludables)',
      referenceLabelEn: 'Formulation 2 (Capsule B · Midday Activator) — See Page 2',
      referenceLabelEs: 'Formulación 2 (Cápsula B · Activador de Mediodía) — Ver Hoja 2',
      clinicalGoalEn: 'Blunts postprandial glycemic excursions and enhances insulin receptor sensitivity.'
    }
  },
  {
    id: 'pillar2_methylation',
    number: 2,
    titleEn: 'Pillar 2: Cellular Methylation & Homocysteine Clearance',
    titleEs: 'Pilar 2: Metilación Celular & Reciclaje de Homocisteína',
    shortTitleEn: 'Active Folate & Homocysteine Recycling Deficit',
    shortTitleEs: 'Déficit de Folato Activo & Reciclaje de Homocisteína',
    keyGenes: 'MTHFR (C677T rs1801133 TT), MTR, MTRR',
    dnaFindingEn: 'Your liver is 70% slower at activating synthetic folic acid, which impairs cellular detox and neurotransmitters.',
    dnaFindingEs: 'Tu hígado activa el ácido fólico sintético un 70% más lento, afectando la detoxificación celular y los neurotransmisores.',
    clinicalRationaleEn: 'Cannot efficiently reduce 5,10-methylene-THF to active 5-MTHF. Requires already-methylated folates to clear homocysteine and fuel neurotransmitter synthesis.',
    clinicalRationaleEs: 'Incapacidad de activar ácido fólico. Requiere folato biológicamente activo para desintoxicación y neurotransmisión.',
    statusEn: 'MTHFR PRIORITY',
    statusEs: 'PRIORIDAD MTHFR',
    statusColor: '#b91c1c',
    statusBg: '#fef2f2',
    assignedCapsules: ['Capsule B (Midday)'],
    assignedFormulation: {
      code: 'FORMULATION 2',
      formulationNumber: 2,
      capsuleId: 'capsule_b',
      capsuleNameEn: 'Capsule B (Midday)',
      capsuleNameEs: 'Cápsula B (Mediodía)',
      timingEn: 'With Breakfast / Lunch (Healthy Fats)',
      timingEs: 'Con el Desayuno / Almuerzo (Grasas Saludables)',
      referenceLabelEn: 'Formulation 2 (Capsule B · Midday Activator) — See Page 2',
      referenceLabelEs: 'Formulación 2 (Cápsula B · Activador de Mediodía) — Ver Hoja 2',
      clinicalGoalEn: 'Bypasses the enzymatic MTHFR block with active L-methylfolate to clear homocysteine.'
    }
  },
  {
    id: 'pillar3_microbiota',
    number: 3,
    titleEn: 'Pillar 3: Gut Microbiome & Mucosal Barrier',
    titleEs: 'Pilar 3: Microbiota & Barrera Intestinal',
    shortTitleEn: 'Lactose Intolerance & Mucosal Barrier Support',
    shortTitleEs: 'Intolerancia a la Lactosa & Sellado de Barrera Mucosa',
    keyGenes: 'MCM6 / LCT (rs4988235 CC), FUT2 Non-Secretor Risk',
    dnaFindingEn: 'Adult lactase deficiency causes dairy fermentation, abdominal bloating, and reduced beneficial Bifidobacteria.',
    dnaFindingEs: 'El déficit de lactasa causa fermentación colónica, hinchazón abdominal y menor recuento de Bifidobacterias beneficiosas.',
    clinicalRationaleEn: 'Unabsorbed dairy lactose causes colonic osmotic fermentation and endotoxemia. Requires live mucosal colonization and enterocyte tight-junction sealing.',
    clinicalRationaleEs: 'La lactosa no absorbida produce fermentación y disbiosis. Requiere probióticos puros y sellado de uniones estrechas con L-Glutamina.',
    statusEn: 'LACTOSE-FREE SHIELD',
    statusEs: 'ESCUDO SIN LACTOSA',
    statusColor: '#0284c7',
    statusBg: '#e0f2fe',
    assignedCapsules: ['Capsule A (Morning Fasting)'],
    assignedFormulation: {
      code: 'FORMULATION 1',
      formulationNumber: 1,
      capsuleId: 'capsule_a',
      capsuleNameEn: 'Capsule A (Morning Fasting)',
      capsuleNameEs: 'Cápsula A (Ayunas Mañana)',
      timingEn: 'Upon Waking on Empty Stomach (DRcaps® with water)',
      timingEs: 'En Ayunas al Despertar (DRcaps® con agua)',
      referenceLabelEn: 'Formulation 1 (Capsule A · Morning Enteric Shield) — See Page 2',
      referenceLabelEs: 'Formulación 1 (Cápsula A · Escudo Entérico) — Ver Hoja 2',
      clinicalGoalEn: 'Restores beneficial probiotic flora and seals tight junctions in acid-resistant DRcaps®.'
    }
  },
  {
    id: 'pillar4_immunity_vitamins',
    number: 4,
    titleEn: 'Pillar 4: Cellular Immunity, Bone Density & Sleep Architecture',
    titleEs: 'Pilar 4: Inmunidad Celular, Densidad Ósea & Arquitectura del Sueño',
    shortTitleEn: 'Vitamin D Receptor Genetic Resistance & Sleep Reset',
    shortTitleEs: 'Resistencia Genética al Receptor VDR & Reparación del Sueño',
    keyGenes: 'VDR FokI (rs2228570 CT), CYP2R1, CYP1A2',
    dnaFindingEn: 'Nuclear receptor variation requires higher circulating levels (60-80 ng/mL) to activate cellular defenses and protect bones.',
    dnaFindingEs: 'La menor afinidad del receptor nuclear exige niveles séricos más altos (60-80 ng/mL) para inmunidad celular y fijación ósea.',
    clinicalRationaleEn: 'Co-administering therapeutic D3 with all-trans MK-7 K2 routes calcium exclusively to the hydroxyapatite bone matrix while preventing vascular calcification.',
    clinicalRationaleEs: 'La combinación de D3 con K2 MK-7 enruta el calcio al hueso y evita calcificaciones arteriales indeseadas.',
    statusEn: 'VDR RESISTANCE',
    statusEs: 'RESISTENCIA RECEPTOR VDR',
    statusColor: '#b45309',
    statusBg: '#fef3c7',
    assignedCapsules: ['Capsule B (Midday)', 'Capsule C (Evening)'],
    assignedFormulation: {
      code: 'FORMULATION 2 & 3',
      formulationNumber: '2 & 3',
      capsuleId: 'capsule_b_and_c',
      capsuleNameEn: 'Capsule B (D3/K2) + Capsule C (Magnesium)',
      capsuleNameEs: 'Cápsula B (D3/K2) + Cápsula C (Magnesio)',
      timingEn: 'Cap B with breakfast fats · Cap C at bedtime',
      timingEs: 'Cáp B con grasas · Cáp C al acostarse',
      referenceLabelEn: 'Formulation 2 (Midday) & Formulation 3 (Evening) — See Page 2',
      referenceLabelEs: 'Formulación 2 (Mediodía) y Formulación 3 (Noche) — Ver Hoja 2',
      clinicalGoalEn: 'Overcomes VDR resistance with micellar D3/K2 while evening chelated magnesium optimizes sleep.'
    }
  }
];

export const THREE_CAPSULE_PROTOCOL = [
  {
    capsuleId: 'capsule_a',
    code: 'CAP-A',
    formulationNumber: 1,
    nameEn: 'CAPSULE A · Morning Microbiota & Gut Barrier Shield',
    nameEs: 'CÁPSULA A · Escudo Matutino de Microbiota & Barrera Mucosa',
    timingEn: 'Upon waking on an empty stomach (30 min before breakfast) with room-temperature water',
    timingEs: 'En ayunas al despertar (30 min antes del desayuno) con un vaso de agua templada',
    targetPillar: 'Pillar 3 (Gut Microbiome & Mucosal Barrier)',
    coveredPillars: [3],
    coveredPillarsTagEn: 'Resolves: Pillar 3 · Gut Microbiome & Mucosal Barrier',
    coveredPillarsTagEs: 'Resuelve: Pilar 3 · Microbioma & Barrera Intestinal',
    pharmacyDnaHeaderEn: 'DNA Target: Pillar 3 (Gut Microbiome & Mucosal Integrity)',
    galenicVehicleEn: 'Delayed-release acid-resistant hypromellose vegetable capsule (DRcaps®). 100% Lactose-Free verified.',
    galenicVehicleEs: 'Cápsula vegetal gastrorresistente de liberación retardada (DRcaps®). Certificada 100% libre de lactosa.',
    rationaleEn: 'Taken fasting in DRcaps® to ensure fragile live probiotic bacteria bypass destructive stomach acid and release intact into the small intestine, without interference from food or antimicrobial berberine.',
    rationaleEs: 'Tomada en ayunas para asegurar que las bacterias probióticas vivas superen el ácido gástrico sin interferencia de alimentos ni de la berberina.',
    ingredients: [
      {
        apiEn: 'Multi-Strain Probiotics',
        apiEs: 'Complejo Probiótico Multicepa',
        chemicalSpec: 'Bifidobacterium lactis, Lactobacillus rhamnosus GG, Lactobacillus plantarum',
        dose: '15 Billion CFU',
        purposeEn: 'Colonizes mucosal lining and restores bacterial diversity',
        purposeEs: 'Restaura la flora intestinal benéfica y diversidad del microbioma'
      },
      {
        apiEn: 'L-Glutamine USP',
        apiEs: 'L-Glutamina Pura USP',
        chemicalSpec: 'Micronized Pharmaceutical Grade (Ph. Eur.)',
        dose: '350 mg',
        purposeEn: 'Fuels enterocytes and seals tight-junction mucosal permeability',
        purposeEs: 'Combustible preferente del enterocito para sellar la barrera intestinal'
      }
    ]
  },
  {
    capsuleId: 'capsule_b',
    code: 'CAP-B',
    formulationNumber: 2,
    nameEn: 'CAPSULE B · Midday Metabolic & Methylation Activator',
    nameEs: 'CÁPSULA B · Activador Metabólico & Metilación Matutina',
    timingEn: 'With breakfast (meal containing healthy fats: olive oil, avocado, or eggs)',
    timingEs: 'Con el desayuno (comida con grasas saludables: aceite de oliva, aguacate o huevos)',
    targetPillar: 'Pillar 1 (Metabolism), Pillar 2 (Methylation), Pillar 4 (Immunity/VDR)',
    coveredPillars: [1, 2, 4],
    coveredPillarsTagEn: 'Resolves: Pillars 1 & 2 · Glycemic & Methylation (+ D3/K2)',
    coveredPillarsTagEs: 'Resuelve: Pilares 1 y 2 · Glucemia & Metilación (+ D3/K2)',
    pharmacyDnaHeaderEn: 'DNA Targets: Pillars 1 & 2 (Glycemic Control & Cellular Methylation)',
    galenicVehicleEn: 'Vegetable hypromellose capsule (HPMC) with microcrystalline cellulose NF filler. 100% Lactose-Free.',
    galenicVehicleEs: 'Cápsula vegetal de celulosa (HPMC) con celulosa microcristalina NF. 100% libre de lactosa.',
    rationaleEn: 'Co-formulated with fat-containing breakfast to maximize micellar absorption of fat-soluble vitamins (D3/K2) while berberine blunts postprandial glucose excursions.',
    rationaleEs: 'Tomada con el desayuno graso para absorción óptima de vitaminas liposolubles (D3/K2) y estabilización glucémica inmediata.',
    ingredients: [
      {
        apiEn: 'Standardized Berberine HCl (97%)',
        apiEs: 'Extracto Estandarizado de Berberina',
        chemicalSpec: 'High-Purity Purified Botanical Extract USP · Standardized to 97% active alkaloid',
        dose: '300 mg',
        purposeEn: 'AMPK phosphorylation agonist; moderates post-breakfast glycemic curve',
        purposeEs: 'Activa AMPK y amortigua el pico de glucosa tras el desayuno'
      },
      {
        apiEn: 'Chromium Picolinate USP',
        apiEs: 'Picolinato de Cromo USP',
        chemicalSpec: 'Pharmaceutical Grade Chromium Chelate · Highly bioavailable micro-mineral',
        dose: '200 mcg',
        purposeEn: 'Enhances insulin receptor tyrosine kinase sensitivity',
        purposeEs: 'Sensibiliza los receptores celulares de insulina'
      },
      {
        apiEn: 'Active L-Methylfolate ([6S]-5-MTHF)',
        apiEs: 'L-Metilfolato Activo',
        chemicalSpec: 'Active Calcium Salt (USP Grade, Lactose-Free) · Bypasses impaired MTHFR enzyme',
        dose: '1,000 mcg',
        purposeEn: 'Direct daytime cellular methylation bypassing MTHFR mutation',
        purposeEs: 'Metilación directa sin requerir conversión hepática'
      },
      {
        apiEn: 'Methylcobalamin (Active Coenzyme B12)',
        apiEs: 'Metilcobalamina Pura',
        chemicalSpec: 'Active Enzymatic Coenzyme B12 (USP grade) · Essential methionine synthase cofactor',
        dose: '1,000 mcg',
        purposeEn: 'Homocysteine remethylation into methionine cofactor',
        purposeEs: 'Cofactor esencial en el reciclaje de homocisteína'
      },
      {
        apiEn: 'Vitamin D3 + Vitamin K2 (all-trans MK-7)',
        apiEs: 'Vitamina D3 + K2 MK-7',
        chemicalSpec: 'Cholecalciferol Crystalline USP + Microencapsulated Menaquinone-7',
        dose: '5,000 IU / 100 mcg',
        purposeEn: 'Therapeutic ligand for low-affinity VDR nuclear receptors',
        purposeEs: 'Supera la menor afinidad genética del receptor VDR'
      }
    ]
  },
  {
    capsuleId: 'capsule_c',
    code: 'CAP-C',
    formulationNumber: 3,
    nameEn: 'CAPSULE C · Evening Recovery & Sleep Architecture',
    nameEs: 'CÁPSULA C · Reparación Nocturna & Arquitectura del Sueño',
    timingEn: 'With dinner or 30 minutes before bed with a glass of water',
    timingEs: 'Con la cena o 30 minutos antes de acostarse con un vaso de agua',
    targetPillar: 'Pillar 4 (Cellular Immunity, Bone Density & Sleep Architecture)',
    coveredPillars: [4],
    coveredPillarsTagEn: 'Resolves: Pillar 4 · Immunity, Bone Density & Deep Sleep',
    coveredPillarsTagEs: 'Resuelve: Pilar 4 · Inmunidad, Fijación Ósea & Sueño Profundo',
    pharmacyDnaHeaderEn: 'DNA Target: Pillar 4 (Immunity & Neuro-Recovery Architecture)',
    galenicVehicleEn: 'Vegetable hypromellose capsule (HPMC). 100% Lactose-Free verified.',
    galenicVehicleEs: 'Cápsula vegetal de celulosa (HPMC). 100% libre de lactosa.',
    rationaleEn: 'Delivers fully chelated TRAACS® magnesium with active P5P and pure L-theanine to stimulate alpha brainwaves and nocturnal neuromuscular relaxation.',
    rationaleEs: 'Aporta magnesio quelado con P5P activa y L-teanina para inducir relajación neurovascular y sueño profundo reparador.',
    ingredients: [
      {
        apiEn: 'Magnesium Bisglycinate Chelate',
        apiEs: 'Bisglicinato de Magnesio Quelado',
        chemicalSpec: 'TRAACS® Fully Chelated Glycinate USP · High bioavailability, zero laxative threshold',
        dose: '250 mg',
        purposeEn: 'Neurovascular relaxation, deep restorative sleep, VDR cofactor',
        purposeEs: 'Relajación neurovascular, sueño profundo y cofactor VDR'
      },
      {
        apiEn: 'L-Theanine (Suntheanine® Grade)',
        apiEs: 'L-Teanina Pura',
        chemicalSpec: 'Pure Enzymatic Fermentation (99% L-Isomer) · Promotes alpha brainwave relaxation',
        dose: '150 mg',
        purposeEn: 'Reduces evening cortisol and facilitates deep sleep onset',
        purposeEs: 'Reduce el cortisol nocturno e induce ondas alfa cerebrales'
      },
      {
        apiEn: 'Pyridoxal-5-Phosphate (Active B6)',
        apiEs: 'Piridoxal-5-Fosfato (B6 Activa)',
        chemicalSpec: 'Active Enzymatic Coenzyme B6 (Ph. Eur.) · Essential cofactor for GABA synthesis',
        dose: '25 mg',
        purposeEn: 'Synergistic cofactor for magnesium absorption and GABA production',
        purposeEs: 'Cofactor sinérgico para la síntesis de GABA y absorción de magnesio'
      }
    ]
  }
];

export const TWENTY_FOUR_GENETICS_AI_ECOSYSTEM = {
  assistantName: 'Julia',
  assistantRoleEn: '24Genetics Nutrition AI Assistant',
  assistantRoleEs: 'Asistente IA de Nutrición 24Genetics',
  allAssistants: [
    { name: 'Julia', specialty: 'Nutrition & Metabolic Health', icon: '🥗' },
    { name: 'Gaia', specialty: 'Ancestry & Geographical Heritage', icon: '🌍' },
    { name: 'Jun', specialty: 'Skin, Hair & Dermogenetics', icon: '✨' },
    { name: 'Kai', specialty: 'Sport, Recovery & Performance', icon: '⚡' },
    { name: 'Nuria', specialty: 'Personality, Circadian & Wellbeing', icon: '🧠' }
  ],
  supportedLanguagesCount: 22,
  subscriptionTiers: {
    monthly: '€19 / month',
    annual: '€199 / year'
  },
  videoAsset: {
    title: '24Genetics AI Nutritional Assistant Explainer Video (Julia)',
    fileName: '24G-AI-Nutritional-Assistant.mp4',
    publicUrl: '/assets/videos/24G-AI-Nutritional-Assistant.mp4',
    format: 'MP4 1080p Full HD',
    fileSizeBytes: 33499700
  },
  disclaimerEn: '24Genetics virtual assistants provide informational guidance and educational interpretation of genetic predispositions; they do not diagnose, formulate magistral compounds, or replace medical prescriptions. Atlas Health Services provides the clinical diet protocol and official compounding pharmacy order.',
  disclaimerEs: 'Los asistentes virtuales de 24Genetics proporcionan orientación educativa sobre predisposiciones genéticas; no diagnostican, no formulan compuestos magistrales ni sustituyen recetas médicas. Atlas Health Services aporta la pauta dietética clínica y la receta oficial de formulación magistral.'
};

export const CONCRETE_DIET_GUIDELINES = [
  {
    step: 1,
    titleEn: 'Plate Sequencing Rule (Blunts Glucose by up to 45%)',
    titleEs: 'Regla de Secuencia en el Plato (Reduce la glucosa hasta un 45%)',
    ruleEn: 'Always eat fiber and green vegetables first (salads, cucumbers, broccoli). Consume proteins and healthy fats second (grilled fish, lean chicken, extra virgin olive oil). Finish with complex low-glycemic carbohydrates last (quinoa, sweet potatoes, wild rice).',
    ruleEs: 'Come siempre la verdura y fibra primero (ensaladas, brócoli, pepino). Pasa después a las proteínas y grasas buenas (pescado, pollo, aceite de oliva virgen extra). Termina al final con los carbohidratos complejos (quinoa, boniato, arroz salvaje).'
  },
  {
    step: 2,
    titleEn: 'Net Carbohydrate Boundary (<40g per meal)',
    titleEs: 'Límite Estricto de Carbohidratos (<40g netos por comida)',
    ruleEn: 'Cap net carbohydrates at <40g per meal to protect your TCF7L2 genetic sensitivity. Strictly avoid high-fructose corn syrups, fruit juices, commercial sodas, and white flour pastries.',
    ruleEs: 'Limita los carbohidratos netos a menos de 40g por comida para proteger tu sensibilidad TCF7L2. Elimina zumos industriales, refrescos azucarados y bollería de harina blanca.'
  },
  {
    step: 3,
    titleEn: 'Microbiome & Mucosal Food Protocol',
    titleEs: 'Alimentos para la Microbiota & Sellado de Mucosa',
    ruleEn: 'Because of your MCM6 hypolactasia, strictly eliminate unfermented cow milk and fresh cheeses. Ingest dairy-free fermented foods (coconut water kefir, raw unpasteurized sauerkraut) and cold-resistant resistant starch (cooked and cooled potatoes/rice) to generate anti-inflammatory butyrate.',
    ruleEs: 'Por tu intolerancia MCM6, elimina leche de vaca y quesos frescos. Consume fermentados sin lácteos (kéfir de coco, chucrut crudo) y almidón resistente enfriado 24h para generar butirato antiinflamatorio.'
  },
  {
    step: 4,
    titleEn: 'Circadian Caffeine Cutoff (Strictly Before 2:00 PM)',
    titleEs: 'Ventana Circadiana de Cafeína (Estrictamente antes de las 14:00)',
    ruleEn: 'Your CYP1A2 gene indicates gradual caffeine clearance. Consuming coffee or pre-workout stimulants in the afternoon elevates evening cortisol and disrupts deep sleep architecture. Switch to peppermint, ginger, or chamomile herbal infusions after 2:00 PM.',
    ruleEs: 'Tu gen CYP1A2 metaboliza la cafeína a velocidad moderada/lenta. Cualquier café después de las 14:00 eleva el cortisol nocturno y destruye el sueño profundo. Pasa a infusiones de jengibre o menta.'
  }
];

export const TREATMENT_CYCLE = {
  days: 60,
  capsulesPerBottle: 60,
  totalBottles: 3,
  summaryEn: '60-Day Initial Protocol (60 Capsule A + 60 Capsule B + 60 Capsule C)',
  summaryEs: 'Protocolo Inicial de 60 Días (60 Cápsula A + 60 Cápsula B + 60 Cápsula C)',
  followUpDay: 45,
  followUpNoteEn: 'At day 45, request routine blood monitoring (fasting glucose, HbA1c, serum 25-OH-D, and plasma homocysteine) to calibrate the 12-month maintenance regimen.',
  followUpNoteEs: 'En el día 45, realizar analítica de seguimiento (glucemia, HbA1c, 25-OH-D y homocisteína) para calibrar el mantenimiento a 12 meses.'
};

/**
 * Pathway 1: Personalized Local Over-The-Counter Commercial Supplements Catalog
 * Guides patients to exact active chemical forms and local Qatar pharmacy brands.
 */
export const COMMERCIAL_LOCAL_SUPPLEMENTS = [
  {
    id: 'active_folate',
    priorityLevel: 1,
    priorityBadge: 'PRIORITY 1 · ESSENTIAL',
    priorityLabelEn: 'Priority 1 · Essential Foundation (Must-Have)',
    priorityLabelEs: 'Prioridad 1 · Fundamento Esencial (Imprescindible)',
    priorityColor: '#b91c1c',
    priorityBg: '#fef2f2',
    priorityBorder: '#fecaca',
    nutrientEn: 'Active Folate (Vitamin B9)',
    nutrientEs: 'Folato Activo (Vitamina B9)',
    chemicalFormEn: 'L-5-Methyltetrahydrofolate (L-5-MTHF / Metafolin®)',
    chemicalFormEs: 'L-5-Metiltetrahidrofolato (L-5-MTHF / Metafolina®)',
    avoidEn: 'Synthetic Folic Acid (Pteroylmonoglutamic Acid) — Satures receptors and accumulates un-metabolized in MTHFR carriers',
    avoidEs: 'Ácido Fólico Sintético — No se metaboliza en portadores MTHFR y compite con folatos naturales',
    doseDaily: '800 mcg (0.8 mg)',
    timingEn: 'Morning with water or light breakfast',
    timingEs: 'Por la mañana con agua o desayuno ligero',
    targetedGenes: 'MTHFR C677T (rs1801133 TT), MTR, MTRR',
    localBrandsEn: 'Thorne 5-MTHF 1mg, Solgar Folate (as Metafolin 800mcg), Pure Encapsulations Folate 1,000',
    localBrandsEs: 'Thorne 5-MTHF 1mg, Solgar Folate (Metafolin 800mcg), Pure Encapsulations Folate 1,000',
    availabilityQatar: 'Widely available in Doha (Boots, Wellcare, Kulud Pharmacies) and GCC distributors'
  },
  {
    id: 'vitamin_d3_k2',
    priorityLevel: 1,
    priorityBadge: 'PRIORITY 1 · ESSENTIAL',
    priorityLabelEn: 'Priority 1 · Essential Foundation (Must-Have)',
    priorityLabelEs: 'Prioridad 1 · Fundamento Esencial (Imprescindible)',
    priorityColor: '#b91c1c',
    priorityBg: '#fef2f2',
    priorityBorder: '#fecaca',
    nutrientEn: 'Vitamin D3 + Vitamin K2 (Synergistic Duo)',
    nutrientEs: 'Vitamina D3 + Vitamina K2 (Dúo Sinérgico)',
    chemicalFormEn: 'Cholecalciferol (D3) + Menaquinone-7 (all-trans MK-7 K2)',
    chemicalFormEs: 'Colecalciferol (D3) + Menaquinona-7 (MK-7 todo-trans)',
    avoidEn: 'Isolated high-dose D3 without K2 (risk of arterial calcification) or Ergocalciferol (D2)',
    avoidEs: 'D3 aislada sin K2 (riesgo de depósito arterial de calcio) o D2 (Ergocalciferol vegetal)',
    doseDaily: '4,000 IU D3 + 100 mcg K2 MK-7',
    timingEn: 'With breakfast or lunch containing healthy dietary fats (olive oil, avocado, eggs)',
    timingEs: 'Con el desayuno o almuerzo con grasas saludables (aceite de oliva, aguacate, huevos)',
    targetedGenes: 'VDR FokI (rs2228570), CYP2R1, GC (DBP)',
    localBrandsEn: 'Now Foods D3 & K2 Liposomal, Carlson Labs Solar D Gems, Thorne D/K2 Liquid Drops',
    localBrandsEs: 'Now Foods D3 & K2 Liposomal, Carlson Labs Solar D Gems, Thorne D/K2 Gotas',
    availabilityQatar: 'Available in major Doha wellness centers, hospital pharmacies & health stores'
  },
  {
    id: 'chelated_magnesium',
    priorityLevel: 2,
    priorityBadge: 'PRIORITY 2 · RECOMMENDED',
    priorityLabelEn: 'Priority 2 · Metabolic & Sleep Support (Recommended)',
    priorityLabelEs: 'Prioridad 2 · Soporte Metabólico y Sueño (Recomendado)',
    priorityColor: '#0284c7',
    priorityBg: '#f0f9ff',
    priorityBorder: '#bae6fd',
    nutrientEn: 'Bioavailable Chelated Magnesium',
    nutrientEs: 'Magnesio Quelado de Alta Biodisponibilidad',
    chemicalFormEn: 'Magnesium Bisglycinate Chelate or Magnesium L-Threonate',
    chemicalFormEs: 'Bisglicinato de Magnesio Quelado o L-Treonato de Magnesio',
    avoidEn: 'Magnesium Oxide or Magnesium Sulfate (Poor <4% absorption, laxative side effects)',
    avoidEs: 'Óxido o Sulfato de Magnesio (Absorción <4%, efecto laxante indeseado sin absorción)',
    doseDaily: '300–400 mg elemental magnesium',
    timingEn: 'Evening 45–60 minutes before bedtime',
    timingEs: 'Por la noche, 45–60 minutos antes de acostarse',
    targetedGenes: 'COMT (rs4680), TRPM6, SLC41A1',
    localBrandsEn: 'Pure Encapsulations Magnesium Glycinate, Doctor’s Best High Absorption Magnesium, Thorne Magnesium Bisglycinate',
    localBrandsEs: 'Pure Encapsulations Magnesium Glycinate, Doctor’s Best High Absorption Magnesium, Thorne Magnesium',
    availabilityQatar: 'Standard inventory across leading pharmacies in Qatar & UAE'
  },
  {
    id: 'methyl_b12_b6',
    priorityLevel: 2,
    priorityBadge: 'PRIORITY 2 · RECOMMENDED',
    priorityLabelEn: 'Priority 2 · Neuro-Metabolic Cofactors (Recommended)',
    priorityLabelEs: 'Prioridad 2 · Cofactores Neuro-Metabólicos (Recomendado)',
    priorityColor: '#0284c7',
    priorityBg: '#f0f9ff',
    priorityBorder: '#bae6fd',
    nutrientEn: 'Methylated Neuro-Support B-Complex',
    nutrientEs: 'Complejo B Metilado de Soporte Neurológico',
    chemicalFormEn: 'Methylcobalamin (B12) + Pyridoxal-5-Phosphate (P-5-P active B6)',
    chemicalFormEs: 'Metilcobalamina (B12 activa) + Piridoxal-5-Fosfato (P-5-P activa B6)',
    avoidEn: 'Cyanocobalamin (releases synthetic cyanide moiety upon hepatic clearance) and Pyridoxine HCl',
    avoidEs: 'Cianocobalamina (libera cianuro sintético que requiere desintoxicación hepática)',
    doseDaily: 'B12: 1,000 mcg · B6 (P-5-P): 25 mg',
    timingEn: 'Morning with food (enhances daytime alertness and dopamine synthesis)',
    timingEs: 'Por la mañana con alimento (optimiza síntesis de dopamina y vigilia)',
    targetedGenes: 'MTRR (rs1801394), TCN2, CBS',
    localBrandsEn: 'Jarrow Formulas Methyl B-Right, Life Extension BioActive Complete B-Complex, Thorne Basic B Complex',
    localBrandsEs: 'Jarrow Formulas Methyl B-Right, Life Extension BioActive B-Complex, Thorne Basic B',
    availabilityQatar: 'Available OTC in Qatar pharmacy chains (Wellcare, Boots)'
  },
  {
    id: 'gut_barrier_probiotics',
    priorityLevel: 3,
    priorityBadge: 'PRIORITY 3 · OPTIONAL',
    priorityLabelEn: 'Priority 3 · Digestive & Mucosal Barrier (Optional / Conditional)',
    priorityLabelEs: 'Prioridad 3 · Barrera Digestiva y Mucosa (Opcional / Condicional)',
    priorityColor: '#d97706',
    priorityBg: '#fffbeb',
    priorityBorder: '#fde68a',
    nutrientEn: 'Targeted Enteric Probiotics & Gut Barrier Support',
    nutrientEs: 'Probióticos Entéricos Dirigidos & Soporte de Barrera',
    chemicalFormEn: 'Multi-strain freeze-dried CFUs (B. lactis, L. rhamnosus GG, L. plantarum) in acid-resistant enteric capsules',
    chemicalFormEs: 'Cepas probióticas vivas liofilizadas en cápsulas gastrorresistentes entéricas (DRcaps®)',
    avoidEn: 'Non-enteric cheap gummies or yogurts containing added sugars, lactose excipients, or artificial dyes',
    avoidEs: 'Gummies comerciales o yogures azucarados con lactosa residual y colorantes artificiales',
    doseDaily: '10–15 Billion CFU + 350 mg L-Glutamine',
    timingEn: 'Fasting in the morning upon waking with room-temperature water',
    timingEs: 'En ayunas al despertar con agua a temperatura ambiente',
    targetedGenes: 'MCM6 / LCT (rs4988235 Lactase deficiency), FUT2 Non-Secretor',
    localBrandsEn: 'Culturelle Digestive Daily Probiotic, Seed DS-01 Daily Synbiotic, Renew Life Extra Care',
    localBrandsEs: 'Culturelle Digestive Probiotic, Seed DS-01 Synbiotic, Renew Life Probiotics',
    availabilityQatar: 'Available across premium wellness pharmacies in Doha & online delivery (can be omitted if following a 100% strict dairy-free diet)'
  }
];

/**
 * Dual-Track Prescription Comparison Strategy
 */
export const PRESCRIPTION_COMPARISON = {
  pathwayA: {
    id: 'pathway_a_commercial',
    title: 'Pathway 1: Local Commercial Over-The-Counter Supplements',
    titleEs: 'Vía 1: Suplementos Comerciales Locales (Farmacia Doha / GCC)',
    subtitle: 'Immediate OTC purchase in Qatar pharmacies using genetically validated active forms',
    pros: [
      'Immediate availability in local Qatar pharmacies (Boots, Wellcare, Kulud)',
      'Zero waiting time for compounding formulation',
      'Pay-as-you-go modular purchasing for individual vitamins'
    ],
    cons: [
      'Pill fatigue: Patient must take 6 to 9 pills from 5 separate commercial bottles at different times',
      'Non-customized doses: Fixed mass manufacturer dosages may under- or over-shoot genetic target',
      'Excipient risk: Commercial capsules often contain lactose, silica, titanium dioxide, or synthetic fillers'
    ]
  },
  pathwayB: {
    id: 'pathway_b_compounded',
    title: 'Pathway 2: Personalized Compounded Formulation (Compounding Pharmacy)',
    titleEs: 'Vía 2: Formulación Magistral Personalizada (Farmacia Galénica)',
    subtitle: 'Tailor-made chronobiological 3-capsule master regimen prepared by licensed compounding laboratory',
    pros: [
      'Maximum adherence: Combines all therapeutic actives into 3 synchronized daily capsules (Morning, Midday, Evening)',
      'Exact personalized dosages calibrated to genetic polymorphism severity and patient weight',
      '100% hypoallergenic: Vegetable DRcaps®, strictly lactose-free, zero artificial excipients or chemical binders',
      'Bypasses galenic incompatibilities (protects live probiotics from berberine antagonism)'
    ],
    cons: [
      'Requires 48–72h compounding preparation and specialized cold-chain delivery',
      'Available exclusively through authorized clinical partner prescription'
    ]
  }
};


