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
    keyGenes: 'TCF7L2 (rs7903146), FTO (rs9939609), SLC2A2',
    dnaFindingEn: 'Elevated sensitivity to refined carbohydrates and risk allele for postprandial glucose spikes and abdominal visceral adiposity.',
    dnaFindingEs: 'Sensibilidad acusada a carbohidratos refinados con tendencia a picos glucémicos postprandiales y acúmulo de grasa visceral.',
    clinicalRationaleEn: 'TCF7L2 reduces beta-cell GLP-1 responsiveness. Activating AMPK phosphorylation and enhancing insulin receptor tyrosine kinase activity flattens glycemic curves.',
    clinicalRationaleEs: 'TCF7L2 atenúa la respuesta a GLP-1. La activación de AMPK y la sensibilización del receptor de insulina previenen la lipogénesis.',
    statusEn: 'GLUCOSE SENSITIVITY',
    statusEs: 'SENSIBILIDAD A GLUCOSA',
    statusColor: '#0d9488',
    assignedCapsules: ['Capsule B (Daytime)', 'Capsule C (Evening)']
  },
  {
    id: 'pillar2_methylation',
    number: 2,
    titleEn: 'Pillar 2: Cellular Methylation & Homocysteine Clearance',
    titleEs: 'Pilar 2: Metilación Celular & Reciclaje de Homocisteína',
    keyGenes: 'MTHFR (C677T rs1801133 TT), MTR, MTRR',
    dnaFindingEn: 'Homozygous C677T mutation causing approximately 70% reduction in MTHFR enzymatic activity. Synthetic folic acid is contraindicated.',
    dnaFindingEs: 'Mutación homocigota C677T que reduce un 70% la actividad MTHFR. El ácido fólico sintético común queda contraindicado.',
    clinicalRationaleEn: 'Cannot efficiently reduce 5,10-methylene-THF to active 5-MTHF. Requires already-methylated folates to clear homocysteine and fuel neurotransmitter synthesis.',
    clinicalRationaleEs: 'Incapacidad de activar ácido fólico. Requiere folato biológicamente activo para desintoxicación y neurotransmisión.',
    statusEn: 'MTHFR PRIORITY',
    statusEs: 'PRIORIDAD MTHFR',
    statusColor: '#b91c1c',
    assignedCapsules: ['Capsule B (Daytime)', 'Capsule C (Evening)']
  },
  {
    id: 'pillar3_microbiota',
    number: 3,
    titleEn: 'Pillar 3: Gut Microbiome & Mucosal Barrier',
    titleEs: 'Pilar 3: Microbiota & Barrera Intestinal',
    keyGenes: 'MCM6 / LCT (rs4988235 CC), FUT2 Non-Secretor Risk',
    dnaFindingEn: 'Primary adult hypolactasia (lactose intolerance) with increased risk of mucosal hyperpermeability and reduced protective Bifidobacteria.',
    dnaFindingEs: 'Déficit primario de lactasa (intolerancia) con riesgo de hiperpermeabilidad mucosa y reducción de Bifidobacterias benéficas.',
    clinicalRationaleEn: 'Unabsorbed dairy lactose causes colonic osmotic fermentation and endotoxemia. Requires live mucosal colonization and enterocyte tight-junction sealing.',
    clinicalRationaleEs: 'La lactosa no absorbida produce fermentación y disbiosis. Requiere probióticos puros y sellado de uniones estrechas con L-Glutamina.',
    statusEn: 'MICROBIOME & LACTOSE-FREE',
    statusEs: 'MICROBIOMA & SIN LACTOSA',
    statusColor: '#0284c7',
    assignedCapsules: ['Capsule A (Fasting)']
  },
  {
    id: 'pillar4_immunity_vitamins',
    number: 4,
    titleEn: 'Pillar 4: Cellular Immunity & Bone Density (VDR)',
    titleEs: 'Pilar 4: Inmunidad Celular & Densidad Ósea (VDR)',
    keyGenes: 'VDR FokI (rs2228570 CT), CYP2R1',
    dnaFindingEn: 'Altered translation start site producing lower-affinity vitamin D nuclear receptor, requiring higher serum targets (60-80 ng/mL).',
    dnaFindingEs: 'Receptor nuclear con menor afinidad que requiere niveles séricos de 25-OH-D más altos (60-80 ng/mL) para activación celular.',
    clinicalRationaleEn: 'Co-administering therapeutic D3 with all-trans MK-7 K2 routes calcium exclusively to the hydroxyapatite bone matrix while preventing vascular calcification.',
    clinicalRationaleEs: 'La combinación de D3 con K2 MK-7 enruta el calcio al hueso y evita calcificaciones arteriales indeseadas.',
    statusEn: 'VDR RECEPTOR RESISTANCE',
    statusEs: 'RESISTENCIA RECEPTOR VDR',
    statusColor: '#b45309',
    assignedCapsules: ['Capsule B (Daytime)', 'Capsule C (Evening)']
  }
];

export const THREE_CAPSULE_PROTOCOL = [
  {
    capsuleId: 'capsule_a',
    code: 'CAP-A',
    nameEn: 'CAPSULE A · Morning Microbiota & Gut Barrier Shield',
    nameEs: 'CÁPSULA A · Escudo Matutino de Microbiota & Barrera Mucosa',
    timingEn: 'Upon waking on an empty stomach (30 min before breakfast) with room-temperature water',
    timingEs: 'En ayunas al despertar (30 min antes del desayuno) con un vaso de agua templada',
    targetPillar: 'Pillar 3 (Gut Microbiome & Mucosal Barrier)',
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
        dose: '500 mg',
        purposeEn: 'Fuels enterocytes and seals tight-junction mucosal permeability',
        purposeEs: 'Combustible preferente del enterocito para sellar la barrera intestinal'
      },
      {
        apiEn: 'Acid-Stable Lactase Enzyme',
        apiEs: 'Enzima Lactasa Ácido-Estable',
        chemicalSpec: 'Purified Microbial Lactase (FCC ALU)',
        dose: '9,000 ALU',
        purposeEn: 'Neutralizes hidden lactose traces from daily dining',
        purposeEs: 'Degrada trazas de lactosa y previene la fermentación cólica'
      }
    ]
  },
  {
    capsuleId: 'capsule_b',
    code: 'CAP-B',
    nameEn: 'CAPSULE B · Midday Metabolic & Methylation Activator',
    nameEs: 'CÁPSULA B · Activador Metabólico & Metilación Matutina',
    timingEn: 'With breakfast (meal containing healthy fats: olive oil, avocado, or eggs)',
    timingEs: 'Con el desayuno (comida con grasas saludables: aceite de oliva, aguacate o huevos)',
    targetPillar: 'Pillar 1 (Metabolism), Pillar 2 (Methylation), Pillar 4 (Immunity/VDR)',
    galenicVehicleEn: 'Vegetable hypromellose capsule (HPMC) with microcrystalline cellulose NF filler. 100% Lactose-Free.',
    galenicVehicleEs: 'Cápsula vegetal de celulosa (HPMC) con celulosa microcristalina NF. 100% libre de lactosa.',
    rationaleEn: 'Co-formulated with fat-containing breakfast to maximize micellar absorption of fat-soluble vitamins (D3/K2) while berberine blunts postprandial glucose excursions.',
    rationaleEs: 'Tomada con el desayuno graso para absorción óptima de vitaminas liposolubles (D3/K2) y estabilización glucémica inmediata.',
    ingredients: [
      {
        apiEn: 'Standardized Berberine',
        apiEs: 'Extracto Estandarizado de Berberina',
        chemicalSpec: 'High-Bioavailability Phospholipid Complex (97% standardized)',
        dose: '150 mg',
        purposeEn: 'AMPK phosphorylation agonist; moderates post-breakfast glycemic curve',
        purposeEs: 'Activa AMPK y amortigua el pico de glucosa tras el desayuno'
      },
      {
        apiEn: 'Chromium Picolinate USP',
        apiEs: 'Picolinato de Cromo USP',
        chemicalSpec: 'Pharmaceutical Grade Chromium Chelate',
        dose: '100 mcg',
        purposeEn: 'Enhances insulin receptor tyrosine kinase sensitivity',
        purposeEs: 'Sensibiliza los receptores celulares de insulina'
      },
      {
        apiEn: 'L-Methylfolate',
        apiEs: 'L-Metilfolato Activo',
        chemicalSpec: '[6S]-5-Methyltetrahydrofolate Calcium Salt USP',
        dose: '500 mcg',
        purposeEn: 'Direct daytime cellular methylation bypassing MTHFR mutation',
        purposeEs: 'Metilación directa sin requerir conversión hepática'
      },
      {
        apiEn: 'Methylcobalamin (B12)',
        apiEs: 'Metilcobalamina Pura',
        chemicalSpec: 'Active Enzymatic Coenzyme B12 (USP grade)',
        dose: '500 mcg',
        purposeEn: 'Homocysteine remethylation into methionine cofactor',
        purposeEs: 'Cofactor esencial en el reciclaje de homocisteína'
      },
      {
        apiEn: 'Vitamin D3',
        apiEs: 'Vitamina D3 (Colecalciferol)',
        chemicalSpec: 'Cholecalciferol Crystalline Powder USP',
        dose: '5,000 IU',
        purposeEn: 'Therapeutic ligand for low-affinity VDR nuclear receptors',
        purposeEs: 'Supera la menor afinidad genética del receptor VDR'
      },
      {
        apiEn: 'Vitamin K2',
        apiEs: 'Vitamina K2 (Menaquinona-7)',
        chemicalSpec: 'all-trans MK-7 Microencapsulated',
        dose: '100 mcg',
        purposeEn: 'Carboxylates osteocalcin; guides calcium to bones, spares arteries',
        purposeEs: 'Enruta el calcio al hueso y evita calcificaciones vasculares'
      }
    ]
  },
  {
    capsuleId: 'capsule_c',
    code: 'CAP-C',
    nameEn: 'CAPSULE C · Evening Metabolic Recovery & Cellular Repair',
    nameEs: 'CÁPSULA C · Reparación Metabólica Nocturna & Relax',
    timingEn: 'With dinner or 30 minutes before bed with a glass of water',
    timingEs: 'Con la cena o 30 minutos antes de acostarse con un vaso de agua',
    targetPillar: 'Pillar 1 (Metabolism), Pillar 2 (Methylation), Pillar 4 (Magnesium Cofactor)',
    galenicVehicleEn: 'Vegetable hypromellose capsule (HPMC). 100% Lactose-Free verified.',
    galenicVehicleEs: 'Cápsula vegetal de celulosa (HPMC). 100% libre de lactosa.',
    rationaleEn: 'Balances overnight fasting insulin, completes the 1,000 mcg folate/B12 cycle, and induces neuromuscular relaxation via chelated magnesium without daytime drowsiness.',
    rationaleEs: 'Mantiene la glucemia nocturna, completa los 1.000 mcg de metilación y aporta magnesio para inducir sueño reparador.',
    ingredients: [
      {
        apiEn: 'Standardized Berberine',
        apiEs: 'Extracto Estandarizado de Berberina',
        chemicalSpec: 'High-Bioavailability Phospholipid Complex (97% standardized)',
        dose: '100 mg',
        purposeEn: 'Maintains nocturnal glycemic stability and suppresses late cravings',
        purposeEs: 'Estabilidad de glucosa nocturna y freno a antojos tardíos'
      },
      {
        apiEn: 'Chromium Picolinate USP',
        apiEs: 'Picolinato de Cromo USP',
        chemicalSpec: 'Pharmaceutical Grade Chromium Chelate',
        dose: '100 mcg',
        purposeEn: 'Maintains nocturnal insulin receptor sensitivity during fasting',
        purposeEs: 'Control de sensibilidad insulínica durante el ayuno nocturno'
      },
      {
        apiEn: 'L-Methylfolate + Methylcobalamin',
        apiEs: 'L-Metilfolato + Metilcobalamina',
        chemicalSpec: '[6S]-5-MTHF Calcium (500 mcg) + B12 (500 mcg)',
        dose: '500 mcg + 500 mcg',
        purposeEn: 'Completes 1,000 mcg daily methylation dose during nocturnal repair',
        purposeEs: 'Completa la dosis de metilación para detoxificación nocturna'
      },
      {
        apiEn: 'Magnesium Bisglycinate',
        apiEs: 'Bisglicinato de Magnesio Quelado',
        chemicalSpec: 'TRAACS® Fully Chelated Glycinate (USP)',
        dose: '200 mg',
        purposeEn: 'Neurovascular relaxation, deep restorative sleep, VDR cofactor',
        purposeEs: 'Relajación neurovascular, sueño profundo y cofactor VDR'
      },
      {
        apiEn: '5-Hydroxytryptophan (5-HTP)',
        apiEs: '5-Hidroxitriptófano (5-HTP)',
        chemicalSpec: 'Natural Botanical Extract (Griffonia simplicifolia)',
        dose: '100 mg',
        purposeEn: 'Serotonin/melatonin pathway support; blunts stress-induced snacking',
        purposeEs: 'Precursor de serotonina; inhibe el hambre por estrés vespertino'
      }
    ]
  }
];

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

