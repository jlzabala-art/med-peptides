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

import {
  MASTER_FOOD_CATALOG,
  FOOD_TRAFFIC_LEVELS,
  FAGRON_17_SUBFAMILIES,
  evaluateFoodForGeneticProfile,
  getFagron17SubfamilyMatrix,
  getPersonalizedGroceryAisles
} from './masterFoodCatalog.js';

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
    nameEn: 'CAPSULE A · Morning Microbiota & Mucosal Shield',
    nameEs: 'CÁPSULA A · Escudo Matutino de Microbiota & Mucosa',
    timingEn: '15–30 minutes before breakfast on an empty stomach with a glass of water',
    timingEs: '15–30 minutos antes del desayuno en ayunas con un vaso de agua',
    targetPillar: 'Pillar 3 (Gut Microbiome & Mucosal Support)',
    coveredPillars: [3],
    coveredPillarsTagEn: 'Supports: Pillar 3 · Gut Microbiome Diversity',
    coveredPillarsTagEs: 'Soporte: Pilar 3 · Diversidad de la Microbiota',
    pharmacyDnaHeaderEn: 'DNA Target: Pillar 3 (Gut Microbiome & Mucosal Support)',
    galenicVehicleEn: 'Size 1–2 Acid-Resistant DRcaps® (delayed-release HPMC). Low-moisture excipient (MCC PH-112) with desiccant packaging. 100% Lactose-Free.',
    galenicVehicleEs: 'Cápsula vegetal gastrorresistente DRcaps® tamaño 1–2. Excipiente de baja humedad (MCC PH-112) con desecante. 100% libre de lactosa.',
    rationaleEn: 'Taken fasting in acid-resistant DRcaps® 15–30 min before breakfast to protect live probiotic strains from gastric acidity and release them intact into the small intestine.',
    rationaleEs: 'Tomada en ayunas en DRcaps® gastrorresistentes 15–30 min antes del desayuno para proteger cepas probióticas vivas del ácido gástrico.',
    ingredients: [
      {
        apiEn: 'Verified Probiotic Strains (LGG + BB-12)',
        apiEs: 'Cepas Probióticas Verificadas (LGG + BB-12)',
        chemicalSpec: 'L. rhamnosus GG (ATCC 53103) 10B CFU + B. lactis BB-12 (or HN019) 5B CFU · Guaranteed at expiry',
        dose: '15 Billion CFU total (10B LGG + 5B BB-12)',
        purposeEn: 'Colonizes mucosal lining and supports beneficial microbiota diversity',
        purposeEs: 'Coloniza la mucosa y apoya la diversidad de la microbiota intestinal'
      }
    ],
    clinicalNotesEn: 'L-Glutamine removed from capsule (sub-therapeutic at 350 mg; clinical gut doses are 5–15 g powder sachet if indicated). Adult hypolactasia (MCM6) addressed via dietary lactose avoidance or exogenous lactase enzyme.',
    clinicalNotesEs: 'L-Glutamina retirada de cápsula (subterapéutica a 350 mg; dosis clínicas son 5–15 g en sobre si hay indicación). La hipolactasia (MCM6) se maneja con dieta sin lactosa o enzima lactasa exógena.'
  },
  {
    capsuleId: 'capsule_b',
    code: 'CAP-B',
    formulationNumber: 2,
    nameEn: 'CAPSULE B · Breakfast Methylation, Cofactors & Vitamin D',
    nameEs: 'CÁPSULA B · Metilación en el Desayuno, Cofactores & Vitamina D',
    timingEn: 'With breakfast (meal containing healthy fats: olive oil, avocado, or eggs)',
    timingEs: 'Con el desayuno (comida con grasas saludables: aceite de oliva, aguacate o huevos)',
    targetPillar: 'Pillar 2 (Methylation & Cofactors), Pillar 4 (Immunity/VDR)',
    coveredPillars: [2, 4],
    coveredPillarsTagEn: 'Supports: Pillars 2 & 4 · Methylation Cofactors & Vitamin D3/K2',
    coveredPillarsTagEs: 'Soporte: Pilares 2 y 4 · Cofactores de Metilación & Vitamina D3/K2',
    pharmacyDnaHeaderEn: 'DNA Targets: Pillars 2 & 4 (Cellular Methylation & Vitamin D Metabolism)',
    galenicVehicleEn: 'Size 1–3 Vegetable HPMC Capsule. Certified triturations for micro-dose actives per Ph. Eur. 2.9.40. Opaque / light-protected packaging. 100% Lactose-Free.',
    galenicVehicleEs: 'Cápsula vegetal HPMC tamaño 1–3. Trituraciones certificadas para microdosis según Ph. Eur. 2.9.40. Envasado opaco fotoprotector. 100% libre de lactosa.',
    rationaleEn: 'Co-administered with dietary fats at breakfast to maximize micellar uptake of fat-soluble D3 and K2. Combines active methylfolate with its essential enzymatic cofactors: Riboflavin (FAD for MTHFR), Methyl-B12, and P5P.',
    rationaleEs: 'Tomada con grasas en el desayuno para absorción micelar de D3/K2. Combina metilfolato activo con sus cofactores enzimáticos: Riboflavina (FAD de MTHFR), Metil-B12 y P5P.',
    ingredients: [
      {
        apiEn: 'Active L-Methylfolate ([6S]-5-MTHF)',
        apiEs: 'L-Metilfolato Activo ([6S]-5-MTHF)',
        chemicalSpec: 'Stabilized Calcium/Glucosamine Salt (USP Grade, corrected for salt weight)',
        dose: '400 µg default (800 µg if homocysteine >12–15 µmol/L or MTHFR TT confirmed)',
        purposeEn: 'Direct bioavailable folate supporting the methylation cycle',
        purposeEs: 'Folato bioactivo directo para el ciclo de metilación'
      },
      {
        apiEn: 'Riboflavin (Vitamin B2 / P-5-P Cofactor)',
        apiEs: 'Riboflavina (Vitamina B2 / Cofactor FAD)',
        chemicalSpec: 'Riboflavin / Riboflavin-5-Phosphate USP (MTHFR FAD enzymatic cofactor)',
        dose: '2.5 mg (1.6–5 mg adjusted to homocysteine)',
        purposeEn: 'Essential FAD prosthetic group for the MTHFR enzyme (crucial for C677T TT)',
        purposeEs: 'Grupo prostético FAD esencial para la enzima MTHFR (crucial en C677T TT)'
      },
      {
        apiEn: 'Methylcobalamin (Active Coenzyme B12)',
        apiEs: 'Metilcobalamina Pura (B12 Activa)',
        chemicalSpec: 'Active Enzymatic Coenzyme B12 (USP grade) · Light-protected packaging',
        dose: '1,000 µg',
        purposeEn: 'Homocysteine remethylation into methionine cofactor',
        purposeEs: 'Cofactor esencial en la remetilación de homocisteína a metionina'
      },
      {
        apiEn: 'Pyridoxal-5-Phosphate (Active B6 / P5P)',
        apiEs: 'Piridoxal-5-Fosfato (B6 Activa / P5P)',
        chemicalSpec: 'Active Enzymatic Coenzyme B6 (Ph. Eur.) · Safe intake below EFSA UL of 12 mg',
        dose: '5 mg',
        purposeEn: 'Transsulfuration pathway cofactor (clears homocysteine to cystathionine)',
        purposeEs: 'Cofactor de la vía de transulfuración (aclara homocisteína a cistationina)'
      },
      {
        apiEn: 'Vitamin D3 (Cholecalciferol)',
        apiEs: 'Vitamina D3 (Colecalciferol)',
        chemicalSpec: 'Microencapsulated Crystalline Cholecalciferol USP (safe EU physiological baseline)',
        dose: '2,000 IU default (4,000 IU if baseline 25(OH)D <20 ng/mL; re-test at 8–12 weeks)',
        purposeEn: 'Supports healthy serum 25(OH)D levels and nuclear VDR signaling',
        purposeEs: 'Apoya niveles óptimos de 25(OH)D y señalización del receptor VDR'
      },
      {
        apiEn: 'Vitamin K2 (all-trans MK-7)',
        apiEs: 'Vitamina K2 (todo-trans MK-7)',
        chemicalSpec: 'Menaquinone-7 all-trans pure extract (Screen out patients on Warfarin/VKA)',
        dose: '100 µg',
        purposeEn: 'Carboxylates osteocalcin and matrix Gla-protein (directs calcium to bones)',
        purposeEs: 'Carboxila osteocalcina y MGP (dirige el calcio a la matriz ósea)'
      }
    ],
    conditionalActivesEn: 'Chromium Picolinate: Conditional 200 µg elemental Cr only if HbA1c 5.7–6.4% or elevated HOMA-IR confirmed. Berberine removed due to EFSA 2026 safety review and CYP interactions; replaced by dietary advice and Module D (Psyllium).',
    conditionalActivesEs: 'Picolinato de Cromo: Condicional a 200 µg de Cr elemental solo si HbA1c 5.7–6.4% o HOMA-IR elevado. Berberina retirada por revisión EFSA 2026 e interacciones CYP; sustituida por pauta dietética y Módulo D (Psyllium).'
  },
  {
    capsuleId: 'capsule_c',
    code: 'CAP-C',
    formulationNumber: 3,
    nameEn: 'CAPSULE C · Evening Neuromuscular & Sleep Support',
    nameEs: 'CÁPSULA C · Soporte Neuromuscular Nocturno & Sueño',
    timingEn: '2 capsules taken 30–60 minutes before bedtime with water',
    timingEs: '2 cápsulas tomadas 30–60 minutos antes de acostarse con agua',
    targetPillar: 'Pillar 4 (Neuromuscular Relaxation & Sleep Architecture)',
    coveredPillars: [4],
    coveredPillarsTagEn: 'Supports: Pillar 4 · Neuromuscular Relaxation & Sleep Architecture',
    coveredPillarsTagEs: 'Soporte: Pilar 4 · Relajación Neuromuscular & Arquitectura del Sueño',
    pharmacyDnaHeaderEn: 'DNA Target: Pillar 4 (Neuromuscular Relaxation & Sleep Architecture)',
    galenicVehicleEn: '2 × Size 00 Vegetable HPMC Capsules. 100% Lactose-Free verified.',
    galenicVehicleEs: '2 × Cápsulas vegetales HPMC tamaño 00. 100% libre de lactosa.',
    rationaleEn: 'Provides verified therapeutic elemental magnesium (150 mg elemental Mg across 2 capsules) combined with clinically studied pure L-theanine (200 mg) to calm COMT hyper-reactivity, lower evening cortisol, and support restorative sleep.',
    rationaleEs: 'Aporta magnesio elemental terapéutico (150 mg Mg elemental en 2 cápsulas) con L-teanina pura (200 mg) para modular COMT, reducir cortisol y favorecer sueño profundo.',
    ingredients: [
      {
        apiEn: 'Magnesium Bisglycinate Chelate (Elemental Mg)',
        apiEs: 'Bisglicinato de Magnesio Quelado (Mg Elemental)',
        chemicalSpec: 'TRAACS® / Pure Bisglycinate (≈750 mg buffered or ≈1,070 mg non-buffered per CoA assay)',
        dose: '150 mg elemental Mg (across 2 capsules)',
        purposeEn: 'Neuromuscular relaxation, GABA pathway support, and sleep quality (reduce to 100mg if eGFR <60)',
        purposeEs: 'Relajación neuromuscular, modulación GABA y calidad de sueño (reducir a 100mg si eGFR <60)'
      },
      {
        apiEn: 'L-Theanine (Suntheanine® Grade)',
        apiEs: 'L-Teanina Pura (Grado Suntheanine®)',
        chemicalSpec: 'Pure Enzymatic Fermentation (>99% L-Enantiomer) · Clinically validated dose',
        dose: '200 mg',
        purposeEn: 'Promotes alpha brainwave relaxation and eases sleep onset without sedation',
        purposeEs: 'Induce ondas alfa cerebrales y facilita la conciliación del sueño sin sedación'
      }
    ],
    clinicalNotesEn: 'P5P removed from Capsule C (moved to morning Capsule B at safe 5 mg dose). "Overnight glucose" claim removed. Note: Requires 2 x size 00 capsules to achieve 150 mg elemental magnesium.',
    clinicalNotesEs: 'P5P retirada de Cápsula C (trasladada a Cápsula B a dosis segura de 5 mg). Retirada afirmación de glucosa nocturna. Requiere 2 cápsulas tamaño 00 para 150 mg de Mg elemental.'
  }
];

export const OPTIONAL_MODULE_D = {
  moduleId: 'module_d',
  code: 'MOD-D',
  nameEn: 'MODULE D (Optional) · Glycaemic & Viscous Fiber Sachet',
  nameEs: 'MÓDULO D (Opcional) · Sobre de Fibra Viscosa y Control Glucémico',
  timingEn: '1 sachet (5 g) in a large glass of water taken immediately before the largest meal of the day',
  timingEs: '1 sobre (5 g) en un vaso grande de agua inmediatamente antes de la comida principal',
  activeEn: 'Organic Psyllium Husk Powder (Plantago ovata) 5 g sachet',
  activeEs: 'Polvo de Cáscara de Psyllium Orgánico (Plantago ovata) 5 g en sobre',
  ruleEn: 'Take 2 hours apart from any prescription capsules or medications. Indicated only with physician approval if baseline HbA1c is 5.7–6.4% or HOMA-IR is elevated. If HbA1c ≥6.5%, refer to physician for medical co-management.',
  ruleEs: 'Tomar con 2 horas de separación de cualquier cápsula o fármaco. Indicado con aprobación médica si HbA1c está entre 5.7–6.4% o HOMA-IR elevado. Si HbA1c ≥6.5%, derivar a médico.'
};

export const BASELINE_LAB_DECISION_RULES = [
  {
    parameter: '25-OH-Vitamin D',
    labResult: '<20 ng/mL (Deficiency)',
    adjustmentEn: 'Increase Vitamin D3 to 4,000 IU/day in Capsule B; re-test at 8–12 weeks.',
    adjustmentEs: 'Aumentar Vitamina D3 a 4,000 UI/día en Cápsula B; repetir analítica a las 8–12 semanas.'
  },
  {
    parameter: '25-OH-Vitamin D',
    labResult: '20–30 ng/mL (Sub-optimal) / >30 ng/mL (Adequate)',
    adjustmentEn: '2,000 IU/day default maintenance (reduce to 1,000 IU if >30 ng/mL in sunny season).',
    adjustmentEs: '2,000 UI/día de mantenimiento estándar (reducir a 1,000 UI si >30 ng/mL en meses de sol).'
  },
  {
    parameter: 'Plasma Homocysteine / MTHFR',
    labResult: 'Homocysteine >12–15 µmol/L or MTHFR C677T TT confirmed',
    adjustmentEn: 'Increase L-5-MTHF to 800 µg and Riboflavin to 5 mg in Capsule B.',
    adjustmentEs: 'Aumentar L-5-MTHF a 800 µg y Riboflavina a 5 mg en Cápsula B.'
  },
  {
    parameter: 'Glycated Hemoglobin (HbA1c)',
    labResult: 'HbA1c 5.7–6.4% or elevated HOMA-IR',
    adjustmentEn: 'Add Chromium Picolinate (200 µg elemental Cr) to Capsule B + add Module D (Psyllium 5g).',
    adjustmentEs: 'Añadir Picolinato de Cromo (200 µg Cr elemental) en Cápsula B + añadir Módulo D (Psyllium 5g).'
  },
  {
    parameter: 'Glycated Hemoglobin (HbA1c)',
    labResult: 'HbA1c ≥6.5% or on glucose-lowering drugs',
    adjustmentEn: 'Refer to physician; no glycaemic compounding module without medical co-management.',
    adjustmentEs: 'Derivar a médico prescriptor; no iniciar módulo glucémico sin co-manejo clínico.'
  },
  {
    parameter: 'Renal Function (eGFR)',
    labResult: 'eGFR <60 mL/min/1.73 m²',
    adjustmentEn: 'Reduce elemental magnesium in Capsule C to 100 mg, or omit.',
    adjustmentEs: 'Reducir el magnesio elemental en Cápsula C a 100 mg, o suprimir.'
  },
  {
    parameter: 'Anticoagulation Therapy',
    labResult: 'Warfarin or Vitamin K Antagonist (VKA) therapy',
    adjustmentEn: 'Strictly remove Vitamin K2 from Capsule B to prevent INR interference.',
    adjustmentEs: 'Eliminar estrictamente la Vitamina K2 de la Cápsula B para evitar interferencia con el INR.'
  }
];

export const RAMADAN_CHRONOBIOLOGY_SCHEDULE = {
  titleEn: 'Ramadan Circadian Schedule Adjustment',
  titleEs: 'Ajuste Circadiano para el Periodo de Ramadán',
  suhoor: 'Capsule A (15–30 min before Suhoor meal) + Capsule B with Suhoor meal (containing healthy fats).',
  beforeIftar: 'Module D (Optional Psyllium sachet) in water before Iftar.',
  afterIftar: 'Capsule C (2 capsules) after Iftar / 30–60 min before sleep.'
};

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
    id: 'vitamin_d3_k2',
    num: 1,
    priorityLevel: 1,
    priorityBadge: 'PRIORITY 1 · ESSENTIAL',
    priorityLabelEn: 'Priority 1 · Essential Foundation (Must-Have)',
    priorityLabelEs: 'Prioridad 1 · Fundamento Esencial (Imprescindible)',
    priorityColor: '#b91c1c',
    priorityBg: '#fef2f2',
    priorityBorder: '#fecaca',
    nutrientEn: '[1] Vitamin D3 + Vitamin K2 (Synergistic Duo)',
    nutrientEs: '[1] Vitamina D3 + Vitamina K2 (Dúo Sinérgico)',
    chemicalFormEn: 'Cholecalciferol (D3) + Menaquinone-7 (all-trans MK-7 K2)',
    chemicalFormEs: 'Colecalciferol (D3) + Menaquinona-7 (MK-7 todo-trans)',
    avoidEn: 'Isolated high-dose D3 without K2 (risk of arterial calcification) or Ergocalciferol (D2)',
    avoidEs: 'D3 aislada sin K2 (riesgo de depósito arterial de calcio) o D2 (Ergocalciferol vegetal)',
    doseDaily: '4,000 IU D3 + 100 mcg K2 MK-7',
    timingEn: 'Dose 2 (Breakfast): With breakfast containing healthy dietary fats (eggs, avocado, olive oil)',
    timingEs: 'Dosis 2 (Desayuno): Con desayuno rico en grasas saludables (aceite de oliva, aguacate, huevos)',
    targetedGenes: 'VDR FokI (rs2228570), CYP2R1, GC (DBP)',
    localBrandsEn: 'Clinical-Grade Bioavailable Formulations (HPLC ≥99% Tested)',
    localBrandsEs: 'Formulaciones Clínicas de Alta Biodisponibilidad (Pureza HPLC ≥99%)',
    availabilityQatar: 'Available in major Doha wellness centers, hospital pharmacies & health stores'
  },
  {
    id: 'active_folate',
    num: 2,
    priorityLevel: 1,
    priorityBadge: 'PRIORITY 1 · ESSENTIAL',
    priorityLabelEn: 'Priority 1 · Essential Foundation (Must-Have)',
    priorityLabelEs: 'Prioridad 1 · Fundamento Esencial (Imprescindible)',
    priorityColor: '#b91c1c',
    priorityBg: '#fef2f2',
    priorityBorder: '#fecaca',
    nutrientEn: '[2] Active Folate (Vitamin B9)',
    nutrientEs: '[2] Folato Activo (Vitamina B9)',
    chemicalFormEn: 'L-5-Methyltetrahydrofolate (L-5-MTHF / Metafolin®)',
    chemicalFormEs: 'L-5-Metiltetrahidrofolato (L-5-MTHF / Metafolina®)',
    avoidEn: 'Synthetic Folic Acid (Pteroylmonoglutamic Acid) — Saturates receptors and accumulates un-metabolized in MTHFR carriers',
    avoidEs: 'Ácido Fólico Sintético — No se metaboliza en portadores MTHFR y compite con folatos naturales',
    doseDaily: '800 mcg (0.8 mg)',
    timingEn: 'Dose 2 (Breakfast): Morning with your breakfast',
    timingEs: 'Dosis 2 (Desayuno): Por la mañana con tu desayuno',
    targetedGenes: 'MTHFR C677T (rs1801133 TT), MTR, MTRR',
    localBrandsEn: 'Pure L-5-MTHF Active Folate (Third-Party Tested)',
    localBrandsEs: 'L-5-MTHF Puro Activo (Certificado por Terceros)',
    availabilityQatar: 'Widely available in Doha (Boots, Wellcare, Kulud Pharmacies) and GCC distributors'
  },
  {
    id: 'chelated_magnesium',
    num: 3,
    priorityLevel: 2,
    priorityBadge: 'PRIORITY 2 · RECOMMENDED',
    priorityLabelEn: 'Priority 2 · Metabolic & Sleep Support (Recommended)',
    priorityLabelEs: 'Prioridad 2 · Soporte Metabólico y Sueño (Recomendado)',
    priorityColor: '#0284c7',
    priorityBg: '#f0f9ff',
    priorityBorder: '#bae6fd',
    nutrientEn: '[3] Bioavailable Chelated Magnesium',
    nutrientEs: '[3] Magnesio Quelado de Alta Biodisponibilidad',
    chemicalFormEn: 'Magnesium Bisglycinate Chelate or Magnesium L-Threonate',
    chemicalFormEs: 'Bisglicinato de Magnesio Quelado o L-Treonato de Magnesio',
    avoidEn: 'Magnesium Oxide or Magnesium Sulfate (Poor <4% absorption, laxative side effects)',
    avoidEs: 'Óxido o Sulfato de Magnesio (Absorción <4%, efecto laxante indeseado sin absorción)',
    doseDaily: '300–400 mg elemental magnesium (2 Capsules)',
    timingEn: 'Dose 3 (Bedtime): Take 2 capsules 30–60 minutes before bed with room-temp water',
    timingEs: 'Dosis 3 (Antes de Dormir): Tomar 2 cápsulas 30–60 minutos antes de acostarse con agua',
    targetedGenes: 'COMT (rs4680), TRPM6, SLC41A1',
    localBrandsEn: 'Pure Chelated Bisglycinate (Clinical Grade, Non-Buffered)',
    localBrandsEs: 'Bisglicinato Quelado Puro (Grado Clínico, No Tamponado)',
    availabilityQatar: 'Standard inventory across leading pharmacies in Qatar & UAE'
  },
  {
    id: 'methyl_b12_b6',
    num: 4,
    priorityLevel: 2,
    priorityBadge: 'PRIORITY 2 · RECOMMENDED',
    priorityLabelEn: 'Priority 2 · Neuro-Metabolic Cofactors (Recommended)',
    priorityLabelEs: 'Prioridad 2 · Cofactores Neuro-Metabólicos (Recomendado)',
    priorityColor: '#0284c7',
    priorityBg: '#f0f9ff',
    priorityBorder: '#bae6fd',
    nutrientEn: '[4] Methylated Neuro-Support B-Complex',
    nutrientEs: '[4] Complejo B Metilado de Soporte Neurológico',
    chemicalFormEn: 'Methylcobalamin (B12) + Pyridoxal-5-Phosphate (P-5-P active B6)',
    chemicalFormEs: 'Metilcobalamina (B12 activa) + Piridoxal-5-Fosfato (P-5-P activa B6)',
    avoidEn: 'Cyanocobalamin (releases synthetic cyanide moiety upon hepatic clearance) and Pyridoxine HCl',
    avoidEs: 'Cianocobalamina (libera cianuro sintético que requiere desintoxicación hepática)',
    doseDaily: 'B12: 1,000 mcg · B6 (P-5-P): 25 mg',
    timingEn: 'Dose 2 (Breakfast): Morning with breakfast (enhances daytime alertness)',
    timingEs: 'Dosis 2 (Desayuno): Por la mañana con alimento (optimiza vigilia)',
    targetedGenes: 'MTRR (rs1801394), TCN2, CBS',
    localBrandsEn: 'Active Coenzymated B-Complex (Methylcobalamin + P-5-P)',
    localBrandsEs: 'Complejo B Coenzimado Activo (Metilcobalamina + P-5-P)',
    availabilityQatar: 'Available OTC in Qatar pharmacy chains (Wellcare, Boots)'
  },
  {
    id: 'gut_barrier_probiotics',
    num: 5,
    priorityLevel: 3,
    priorityBadge: 'PRIORITY 3 · OPTIONAL',
    priorityLabelEn: 'Priority 3 · Digestive & Mucosal Barrier (Optional / Conditional)',
    priorityLabelEs: 'Prioridad 3 · Barrera Digestiva y Mucosa (Opcional / Condicional)',
    priorityColor: '#d97706',
    priorityBg: '#fffbeb',
    priorityBorder: '#fde68a',
    nutrientEn: '[5] Targeted Acid-Resistant Probiotics (LGG + BB-12)',
    nutrientEs: '[5] Probióticos Gastrorresistentes Dirigidos (LGG + BB-12)',
    chemicalFormEn: 'Multi-strain freeze-dried CFUs (L. rhamnosus GG ATCC 53103, B. lactis BB-12) in acid-resistant DRcaps®',
    chemicalFormEs: 'Cepas probióticas vivas liofilizadas (LGG + BB-12) en cápsulas gastrorresistentes (DRcaps®)',
    avoidEn: 'Non-enteric cheap gummies or yogurts containing added sugars, lactose excipients, or artificial dyes',
    avoidEs: 'Gummies comerciales o yogures azucarados con lactosa residual y colorantes artificiales',
    doseDaily: '10–15 Billion CFU (1 Capsule)',
    timingEn: 'Dose 1 (Upon Waking): Fasting in morning upon waking with room-temperature water',
    timingEs: 'Dosis 1 (Al Despertar): En ayunas al despertar con agua a temperatura ambiente',
    targetedGenes: 'MCM6 / LCT (rs4988235 Lactase deficiency), FUT2 Non-Secretor',
    localBrandsEn: 'Clinical Synbiotic DRcaps (LGG + BB-12 Acid-Resistant)',
    localBrandsEs: 'Sinbiótico Clínico DRcaps (LGG + BB-12 Gastrorresistente)',
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

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DYNAMIC CLINICAL NUTRIGENOMICS RULES ENGINE (24Genetics / NutriGen / Atlas)
 * Automated inference system for clinical nutritionists and patients.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const DEFAULT_HOSSAM_GENOTYPES = {
  MC4R: { gene: 'MC4R', rsId: 'rs17782313', genotype: 'TC', effect: 'delayed_satiety', risk: 'high', label: 'Delayed Satiety Response' },
  TAS2R38: { gene: 'TAS2R38', rsId: 'rs713598', genotype: 'AG', effect: 'emotional_eater', risk: 'high', label: 'Stress & Emotional Craving' },
  FUT1: { gene: 'FUT1', rsId: 'rs601338', genotype: 'AA', effect: 'sweet_craving_low_fat', risk: 'high', label: 'Elevated Sweet Craving / Low Fat Tendency' },
  FTO: { gene: 'FTO', rsId: 'rs9939609', genotype: 'AC', effect: 'overweight_carb_sensitivity', risk: 'high', label: 'Overweight Predisposition & Carb Vulnerability' },
  IRS1: { gene: 'IRS1', rsId: 'rs1801278', genotype: 'TT', effect: 'insulin_sensitivity_deficit', risk: 'high', label: 'Reduced Insulin Sensitivity' },
  CLOCK: { gene: 'CLOCK', rsId: 'rs1801260', genotype: 'AA', effect: 'evening_metabolic_slowdown', risk: 'moderate', label: 'Circadian Phase Delay' },
  MTHFR: { gene: 'MTHFR', rsId: 'rs1801133', genotype: 'TT', effect: 'homocysteine_methylation_deficit', risk: 'critical', label: 'MTHFR 677TT Severe Methylation Impairment' },
  ZPR1: { gene: 'ZPR1', rsId: 'rs964184', genotype: 'CG', effect: 'synthetic_vit_e_toxicity_risk', risk: 'critical', label: 'Synthetic Vitamin E Hyper-Accumulation Alert' },
  CYP4F2: { gene: 'CYP4F2', rsId: 'rs2108622', genotype: 'TC', effect: 'altered_tocopherol_clearance', risk: 'critical', label: 'Altered Tocopherol Degradation' },
  MCM6: { gene: 'MCM6', rsId: 'rs4988235', genotype: 'AG', effect: 'moderate_hypolactasia', risk: 'moderate', label: 'Adult Hypolactasia (Lactose Malabsorption)' },
  ADORA2A: { gene: 'ADORA2A', rsId: 'rs5751876', genotype: 'TC', effect: 'caffeine_induced_anxiety', risk: 'high', label: 'Adenosine Receptor Caffeine Anxiety' },
  CYP1A2: { gene: 'CYP1A2', rsId: 'rs762551', genotype: 'AC', effect: 'slow_caffeine_clearance', risk: 'moderate', label: 'Slow Hepatic Caffeine Clearance' },
  VDR: { gene: 'VDR', rsId: 'rs2228570', genotype: 'CT', effect: 'reduced_vitamin_d_nuclear_affinity', risk: 'moderate', label: 'FokI Nuclear Vitamin D Receptor Resistance' }
};

/**
 * Patient: Ms. Wafa Burud — Sample G000943568 (24Genetics Nutrition 2.0)
 * Extracted from 57-page PDF uploaded 2026-11-13.
 * Doctor: Dr. Sajid Burud (Drsajidburud2022@gmail.com)
 *
 * KEY DIFFERENCES vs Hossam Ahmed:
 *  - MTHFR GG  → Normal methylation (wild-type). NO synthetic folic acid alert.
 *  - ZPR1  CC  → Normal vitamin E metabolism. NO toxicity warning.
 *  - CYP4F2 TT → Normal tocopherol clearance (gene not in 24Gen report; safe default).
 *  - VDR   CC  → Normal vitamin D receptor (GC TT in report = not deficient).
 *  - TAS2R38 AA → Normal bitter taste; lower emotional eating risk.
 *  - FUT1  GG  → Normal sweet craving.
 *  - IRS1  TC  → Moderate insulin sensitivity reduction (strand-flip of CT).
 *  - MCM6  GG  → Severe hypolactasia (worse than Hossam's AG).
 *  - ADORA2A TT → Above-average caffeine anxiety (homozygous risk).
 *  - CYP1A2 AA → Normal caffeine clearance (gene not in 24Gen report; safe default).
 */
export const WAFA_BURUD_GENOTYPES = {
  MC4R: { gene: 'MC4R', rsId: 'rs17782313', genotype: 'TC', effect: 'delayed_satiety', risk: 'high', label: 'Delayed Satiety Response' },
  TAS2R38: { gene: 'TAS2R38', rsId: 'rs713598', genotype: 'AA', effect: 'normal_bitter_taste', risk: 'low', label: 'Normal Bitter Taste Perception' },
  FUT1: { gene: 'FUT1', rsId: 'rs601338', genotype: 'GG', effect: 'normal_sweet_craving', risk: 'low', label: 'Normal Sweet Craving Tendency' },
  FTO: { gene: 'FTO', rsId: 'rs9939609', genotype: 'AC', effect: 'overweight_carb_sensitivity', risk: 'high', label: 'Overweight Predisposition & Carb Vulnerability' },
  IRS1: { gene: 'IRS1', rsId: 'rs1801278', genotype: 'TC', effect: 'moderate_insulin_sensitivity', risk: 'moderate', label: 'Moderate Insulin Sensitivity Reduction' },
  CLOCK: { gene: 'CLOCK', rsId: 'rs1801260', genotype: 'AA', effect: 'evening_metabolic_slowdown', risk: 'moderate', label: 'Circadian Phase Delay' },
  MTHFR: { gene: 'MTHFR', rsId: 'rs1801133', genotype: 'GG', effect: 'normal_methylation', risk: 'low', label: 'Normal Methylation Capacity (Wild-Type)' },
  ZPR1: { gene: 'ZPR1', rsId: 'rs964184', genotype: 'CC', effect: 'normal_vit_e_metabolism', risk: 'low', label: 'Normal Vitamin E Metabolism' },
  CYP4F2: { gene: 'CYP4F2', rsId: 'rs2108622', genotype: 'TT', effect: 'normal_tocopherol_clearance', risk: 'low', label: 'Normal Tocopherol Clearance' },
  MCM6: { gene: 'MCM6', rsId: 'rs4988235', genotype: 'GG', effect: 'severe_hypolactasia', risk: 'high', label: 'Severe Adult Hypolactasia (Complete Lactose Malabsorption)' },
  ADORA2A: { gene: 'ADORA2A', rsId: 'rs5751876', genotype: 'TT', effect: 'caffeine_induced_anxiety', risk: 'high', label: 'Adenosine Receptor Caffeine Anxiety (Homozygous Risk)' },
  CYP1A2: { gene: 'CYP1A2', rsId: 'rs762551', genotype: 'AA', effect: 'normal_caffeine_clearance', risk: 'low', label: 'Normal Hepatic Caffeine Clearance' },
  VDR: { gene: 'VDR', rsId: 'rs2228570', genotype: 'CC', effect: 'normal_vitamin_d_receptor', risk: 'low', label: 'Normal Vitamin D Receptor Function' }
};

/**
 * Patient profile lookup by sample code.
 * Allows the engine to auto-select the correct genotypes for any registered patient.
 */
const PATIENT_GENOTYPE_PROFILES = {
  'G000943568': WAFA_BURUD_GENOTYPES,
  '24G-QA-90421': DEFAULT_HOSSAM_GENOTYPES
};

const PATIENT_DEFAULTS = {
  'G000943568': {
    patientName: 'Wafa Burud',
    doctor: 'Dr. Sajid Burud',
    clinic: 'Dr. Sajid Burud Medical Practice',
    analysisDate: 'November 2026'
  },
  '24G-QA-90421': {
    patientName: 'Hossam Ahmed',
    doctor: 'Dr. Ryhanh Medical',
    clinic: 'Atlas Health Services · Doha, Qatar',
    analysisDate: 'November 2026'
  }
};

/**
 * Universal evaluator function that processes any patient genetic payload
 * (24Genetics nutrition PDF, Fagron NutriGen, raw JSON or default).
 * Returns complete, structured, food-first clinical nutritionist data.
 */
export function evaluateNutrigenomicProfile(inputData = {}) {
  const sampleCode = inputData.sampleCode || inputData.sample || '24G-QA-90421';

  // Auto-select patient defaults by sample code (if registered)
  const patientDefaults = PATIENT_DEFAULTS[sampleCode] || {};
  const patientName = inputData.patientName || inputData.patient || patientDefaults.patientName || 'Hossam Ahmed';
  const doctor = inputData.doctor || inputData.doctorName || patientDefaults.doctor || 'Dr. Ryhanh Medical';
  const clinic = inputData.clinic || patientDefaults.clinic || 'Atlas Health Services · Doha, Qatar';
  const testPlatform = inputData.testPlatform || '24Genetics / Illumina GSA-24 Human Multi-Disease BeadChip';
  const analysisDate = inputData.analysisDate || patientDefaults.analysisDate || 'November 2026';

  // Auto-select genotype profile by sample code, or fall back to Hossam defaults
  const profileGenotypes = PATIENT_GENOTYPE_PROFILES[sampleCode] || DEFAULT_HOSSAM_GENOTYPES;

  // Normalize genotypes map — explicit input overrides auto-selected profile
  const rawG = inputData.genotypes || {};
  const g = {
    MC4R: typeof rawG.MC4R === 'string' ? rawG.MC4R : (rawG.MC4R?.genotype || profileGenotypes.MC4R.genotype),
    TAS2R38: typeof rawG.TAS2R38 === 'string' ? rawG.TAS2R38 : (rawG.TAS2R38?.genotype || profileGenotypes.TAS2R38.genotype),
    FUT1: typeof rawG.FUT1 === 'string' ? rawG.FUT1 : (rawG.FUT1?.genotype || profileGenotypes.FUT1.genotype),
    FTO: typeof rawG.FTO === 'string' ? rawG.FTO : (rawG.FTO?.genotype || profileGenotypes.FTO.genotype),
    IRS1: typeof rawG.IRS1 === 'string' ? rawG.IRS1 : (rawG.IRS1?.genotype || profileGenotypes.IRS1.genotype),
    CLOCK: typeof rawG.CLOCK === 'string' ? rawG.CLOCK : (rawG.CLOCK?.genotype || profileGenotypes.CLOCK.genotype),
    MTHFR: typeof rawG.MTHFR === 'string' ? rawG.MTHFR : (rawG.MTHFR?.genotype || profileGenotypes.MTHFR.genotype),
    ZPR1: typeof rawG.ZPR1 === 'string' ? rawG.ZPR1 : (rawG.ZPR1?.genotype || profileGenotypes.ZPR1.genotype),
    CYP4F2: typeof rawG.CYP4F2 === 'string' ? rawG.CYP4F2 : (rawG.CYP4F2?.genotype || profileGenotypes.CYP4F2.genotype),
    MCM6: typeof rawG.MCM6 === 'string' ? rawG.MCM6 : (rawG.MCM6?.genotype || profileGenotypes.MCM6.genotype),
    ADORA2A: typeof rawG.ADORA2A === 'string' ? rawG.ADORA2A : (rawG.ADORA2A?.genotype || profileGenotypes.ADORA2A.genotype),
    CYP1A2: typeof rawG.CYP1A2 === 'string' ? rawG.CYP1A2 : (rawG.CYP1A2?.genotype || profileGenotypes.CYP1A2.genotype),
    VDR: typeof rawG.VDR === 'string' ? rawG.VDR : (rawG.VDR?.genotype || profileGenotypes.VDR.genotype)
  };

  // 1. Calculate Axis 1: Satiety & Appetite Regulation
  const hasMc4rVariant = g.MC4R === 'TC' || g.MC4R === 'CC';
  const hasTas2r38Variant = g.TAS2R38 === 'AG' || g.TAS2R38 === 'GG';
  const hasFut1Variant = g.FUT1 === 'AA' || g.FUT1 === 'AG';
  const hasFtoVariant = g.FTO === 'AC' || g.FTO === 'AA';

  let satietyScore = 20;
  if (hasMc4rVariant) satietyScore += 30;
  if (hasTas2r38Variant) satietyScore += 20;
  if (hasFut1Variant) satietyScore += 15;
  if (hasFtoVariant) satietyScore += 15;
  satietyScore = Math.min(satietyScore, 95);

  const axis1 = {
    id: 'axis_satiety_appetite',
    number: 1,
    titleEn: 'Appetite & Fullness Signal (Genes MC4R & FTO)',
    titleEs: 'Control del Apetito y Saciedad (Genes MC4R y FTO)',
    score: satietyScore,
    riskLevel: satietyScore >= 75 ? 'HIGH PRIORITY' : satietyScore >= 45 ? 'MODERATE' : 'OPTIMAL',
    badgeColor: satietyScore >= 75 ? '#c5221f' : satietyScore >= 45 ? '#b06000' : '#137333',
    badgeBg: satietyScore >= 75 ? '#fce8e6' : satietyScore >= 45 ? '#fef7e0' : '#e6f4ea',
    keyGenes: `MC4R (${g.MC4R}), TAS2R38 (${g.TAS2R38}), FUT1 (${g.FUT1}), FTO (${g.FTO})`,
    clinicalFindingEn: satietyScore >= 75
      ? 'Your brain receives the "I am full" signal slower after eating, making it easier to crave sweet or crunchy snacks in the afternoon.'
      : satietyScore >= 45
      ? 'Your appetite control has moderate genetic variability. Delayed fullness signals from MC4R and carb sensitivity from FTO mean structured meals with protein are essential.'
      : 'Your appetite and satiety signals function within normal genetic parameters. Maintain regular meal timing and prioritize protein.',
    clinicalFindingEs: satietyScore >= 75
      ? 'Tu cerebro recibe la señal de saciedad más despacio al comer, facilitando el deseo de picotear dulce o salado por la tarde.'
      : satietyScore >= 45
      ? 'Tu control del apetito tiene variabilidad genética moderada. Las señales de saciedad de MC4R y la sensibilidad a carbohidratos de FTO requieren comidas estructuradas con proteína.'
      : 'Tus señales de apetito y saciedad funcionan dentro de los parámetros genéticos normales. Mantén horarios regulares y prioriza la proteína.',
    proteinTargetEn: 'Eat 1 palm-sized protein portion (30–35g: eggs, fish, or poultry) at every meal to keep you full for 5 hours.',
    proteinTargetEs: 'Toma 1 ración de proteína (30–35g: huevos, pescado o ave) en cada comida para mantenerte saciado 5 horas.',
    emotionalEatingProtocolEn: 'Healthy afternoon swaps: 2 squares of 85% dark chocolate, crunchy cucumber/celery with olive oil, or 1 handful of raw walnuts.',
    emotionalEatingProtocolEs: 'Snacks saludables de tarde: 2 onzas de chocolate negro 85%, pepino/apio crujiente o 1 puñado de nueces crudas.',
    sweetCravingProtocolEn: 'Add Ceylon cinnamon to berries to calm sweet cravings naturally. Avoid artificial sweeteners (sucralose/aspartame).',
    sweetCravingProtocolEs: 'Añade canela de Ceilán a los frutos rojos para calmar el deseo de dulce. Evita edulcorantes artificiales.'
  };

  // 2. Calculate Axis 2: Methylation & Homocysteine Clearance
  const hasMthfrTT = g.MTHFR === 'TT';
  const hasMthfrCT = g.MTHFR === 'CT';
  let methylationScore = 25;
  if (hasMthfrTT) methylationScore = 92;
  else if (hasMthfrCT) methylationScore = 65;

  const axis2 = {
    id: 'axis_methylation_homocysteine',
    number: 2,
    titleEn: 'Active Vitamins & Daily Vitality (Gene MTHFR)',
    titleEs: 'Vitaminas Activas y Vitalidad (Gen MTHFR)',
    score: methylationScore,
    riskLevel: methylationScore >= 75 ? 'HIGH PRIORITY' : methylationScore >= 45 ? 'MODERATE' : 'OPTIMAL',
    badgeColor: methylationScore >= 75 ? '#c5221f' : methylationScore >= 45 ? '#b06000' : '#137333',
    badgeBg: methylationScore >= 75 ? '#fce8e6' : methylationScore >= 45 ? '#fef7e0' : '#e6f4ea',
    keyGenes: `MTHFR C677T (${g.MTHFR}), MTR, MTRR`,
    clinicalFindingEn: hasMthfrTT
      ? 'Your body utilizes only about 30% of common synthetic folic acid. You need Active Natural Folate (L-5-MTHF) and daily leafy greens for clean energy.'
      : hasMthfrCT
      ? 'Moderate folate conversion. Prioritize natural food folates over synthetic fortified products.'
      : 'Great news: your methylation pathway works normally (MTHFR wild-type). Standard dietary folate from leafy greens is sufficient. No special supplement required.',
    clinicalFindingEs: hasMthfrTT
      ? 'Tu cuerpo aprovecha solo el 30% del ácido fólico común. Necesitas Folato Natural Activo (L-5-MTHF) y hojas verdes a diario.'
      : hasMthfrCT
      ? 'Conversión moderada de folato. Prioriza folatos naturales frente a harinas enriquecidas.'
      : 'Buena noticia: tu vía de metilación funciona con normalidad (MTHFR wild-type). El folato natural de hojas verdes es suficiente. No necesitas suplemento especial.',
    foodPrescriptionEn: 'Eat daily natural folate foods: baby spinach, wild arugula, asparagus, lentils, beetroot, and pasture-raised egg yolks.',
    foodPrescriptionEs: 'Consume a diario alimentos ricos en folato natural: espinacas, rúcula, espárragos, lentejas, remolacha y yema de huevo.',
    criticalWarningEn: 'AVOID: Common synthetic "Folic Acid" found in cheap multivitamins, white flour bread, and commercial breakfast cereals.',
    criticalWarningEs: 'EVITAR: El "Ácido Fólico" sintético presente en multivitamínicos comunes, pan blanco y cereales industriales.'
  };

  // 3. Calculate Axis 3: Glycemia & Carbohydrate Sensitivity
  const hasIrs1TT = g.IRS1 === 'TT' || g.IRS1 === 'CT' || g.IRS1 === 'TC'; // TC = strand-flip of CT
  let glycemicScore = 30;
  if (hasIrs1TT) glycemicScore += 35;
  if (hasFtoVariant) glycemicScore += 20;
  glycemicScore = Math.min(glycemicScore, 90);

  const axis3 = {
    id: 'axis_glycemia_carbohydrates',
    number: 3,
    titleEn: 'Steady Blood Sugar & Energy (Gene IRS1)',
    titleEs: 'Azúcar y Energía Estable (Gen IRS1)',
    score: glycemicScore,
    riskLevel: glycemicScore >= 70 ? 'HIGH PRIORITY' : glycemicScore >= 45 ? 'MODERATE' : 'OPTIMAL',
    badgeColor: glycemicScore >= 70 ? '#c5221f' : glycemicScore >= 45 ? '#b06000' : '#137333',
    badgeBg: glycemicScore >= 70 ? '#fce8e6' : glycemicScore >= 45 ? '#fef7e0' : '#e6f4ea',
    keyGenes: `IRS1 (${g.IRS1}), FTO (${g.FTO}), TCF7L2`,
    clinicalFindingEn: 'White bread, hot white rice, and sugary drinks trigger a fast insulin spike that makes you feel sleepy after lunch.',
    clinicalFindingEs: 'El pan blanco, el arroz rápido y los dulces te provocan un pico de azúcar que da sueño después de comer.',
    maxNetCarbsPerMeal: 'Max 1 small fist-sized carb side per meal (<35–40g)',
    plateSequencingRuleEn: '1-2-3 Plate Rule: Eat salad/veggies FIRST -> fish/meat/eggs SECOND -> rice/potato/quinoa LAST.',
    plateSequencingRuleEs: 'Regla del Plato 1-2-3: Come primero la ensalada -> luego la proteína -> deja el arroz/patata para el final.'
  };

  // 4. Calculate Axis 4: Micronutrients & Safety Toxicity Alerts
  const hasVitEToxicityRisk = g.ZPR1 === 'CG' || g.ZPR1 === 'GG' || g.CYP4F2 === 'TC' || g.CYP4F2 === 'CC';
  const hasVdrRisk = g.VDR === 'CT' || g.VDR === 'TT';

  let micronutrientScore = 40;
  if (hasVitEToxicityRisk) micronutrientScore += 35;
  if (hasVdrRisk) micronutrientScore += 15;
  micronutrientScore = Math.min(micronutrientScore, 95);

  const axis4 = {
    id: 'axis_micronutrients_safety',
    number: 4,
    titleEn: 'Caution With Vitamin E Pills & Vitamin D Needs (Genes ZPR1 & VDR)',
    titleEs: 'Cuidado con Pastillas de Vitamina E y Vitamina D (Genes ZPR1 y VDR)',
    score: micronutrientScore,
    riskLevel: hasVitEToxicityRisk ? 'SAFETY ALERT' : hasVdrRisk ? 'MODERATE' : 'OPTIMAL',
    badgeColor: hasVitEToxicityRisk ? '#c5221f' : hasVdrRisk ? '#b06000' : '#137333',
    badgeBg: hasVitEToxicityRisk ? '#fce8e6' : hasVdrRisk ? '#fef7e0' : '#e6f4ea',
    keyGenes: `ZPR1 (${g.ZPR1}), CYP4F2 (${g.CYP4F2}), VDR FokI (${g.VDR})`,
    criticalToxicityAlertEn: hasVitEToxicityRisk
      ? 'SAFETY RULE: Your body clears synthetic Vitamin E pills slowly. Do NOT take Vitamin E capsules; get Vitamin E naturally from Extra Virgin Olive Oil, avocado, and raw almonds.'
      : 'Your vitamin E metabolism is normal (ZPR1/CYP4F2 wild-type). Standard dietary sources provide adequate vitamin E. No specific supplement restriction.',
    criticalToxicityAlertEs: hasVitEToxicityRisk
      ? 'REGLA DE SEGURIDAD: Tu cuerpo acumula la Vitamina E sintética de bote. No tomes suplementos con Vitamina E; obtenla de alimentos naturales (AOVE, aguacate y almendras).'
      : 'Tu metabolismo de vitamina E es normal (ZPR1/CYP4F2 wild-type). Las fuentes dietéticas aportan la vitamina E necesaria. Sin restricción de suplementos.',
    vitaminDStrategyEn: hasVdrRisk
      ? 'Your Vitamin D receptors work slower (VDR gene): take Vitamin D3 + K2 with breakfast fats (eggs or olive oil) for full absorption.'
      : 'Your Vitamin D receptors function normally. Maintain adequate sun exposure and include dietary vitamin D sources (fatty fish, eggs).',
    vitaminDStrategyEs: hasVdrRisk
      ? 'Tus receptores de Vitamina D son más lentos (gen VDR): toma Vitamina D3 + K2 en el desayuno con grasas buenas.'
      : 'Tus receptores de Vitamina D funcionan con normalidad. Mantén una exposición solar adecuada e incluye fuentes dietéticas (pescado azul, huevos).'
  };

  // 5. Calculate Axis 5: Food Sensitivities & Neuro-Stimulants
  const hasLactoseIntolerance = g.MCM6 === 'AG' || g.MCM6 === 'GG';
  const hasCaffeineAnxiety = g.ADORA2A === 'TC' || g.ADORA2A === 'TT' || g.ADORA2A === 'CC'; // TT = homozygous risk for rs5751876
  const hasSlowCaffeineClearance = g.CYP1A2 === 'AC' || g.CYP1A2 === 'CC';

  let sensitivityScore = 35;
  if (hasLactoseIntolerance) sensitivityScore += 25;
  if (hasCaffeineAnxiety) sensitivityScore += 25;
  if (hasSlowCaffeineClearance) sensitivityScore += 10;
  sensitivityScore = Math.min(sensitivityScore, 95);

  const axis5 = {
    id: 'axis_sensitivities_neuro',
    number: 5,
    titleEn: 'Lactose Digestion & Sleep-Friendly Coffee (Genes MCM6 & ADORA2A)',
    titleEs: 'Digestión de Lácteos y Café según tu Sueño (Genes MCM6 y ADORA2A)',
    score: sensitivityScore,
    riskLevel: sensitivityScore >= 70 ? 'ACTIONABLE' : 'MODERATE',
    badgeColor: sensitivityScore >= 70 ? '#c5221f' : '#b06000',
    badgeBg: sensitivityScore >= 70 ? '#fce8e6' : '#fef7e0',
    keyGenes: `MCM6 (${g.MCM6}), ADORA2A (${g.ADORA2A}), CYP1A2 (${g.CYP1A2})`,
    lactoseDirectiveEn: 'Cow milk and soft cheeses cause bloating (MCM6 gene). Swap for fermented goat/sheep kefir, sheep feta, or almond/coconut milk.',
    lactoseDirectiveEs: 'La leche de vaca y quesos blandos causan hinchazón (gen MCM6). Usa kéfir de cabra/oveja, queso feta de oveja o bebida de almendra/coco.',
    caffeineCutoffEn: 'Enjoy coffee only before 11:00 AM. Afternoon caffeine stays active for 8+ hours and blocks deep sleep (switch to matcha before noon or chamomile at night).',
    caffeineCutoffEs: 'Toma café solo antes de las 11:00 AM. El café de tarde bloquea tu sueño profundo durante más de 8 horas (pasa a infusiones sin cafeína).'
  };

  const fiveClinicalAxes = [axis1, axis2, axis3, axis4, axis5];

  // Food Traffic Light Matrix
  const foodTrafficLight = {
    greenSuperfoods: [
      {
        name: 'Wild Rocket (Arugula) & Baby Spinach',
        category: 'Produce & Greens',
        activeCompound: 'Natural Folate & Betaine',
        geneTarget: 'MTHFR C677T',
        benefitEn: 'Supplies bioavailable methyl donors without the unmetabolized toxicity of synthetic folic acid.',
        benefitEs: 'Aporta donantes de metilo bioactivos sin la toxicidad del ácido fólico sintético.'
      },
      {
        name: 'Steamed Asparagus & Raw Beetroot',
        category: 'Produce & Roots',
        activeCompound: 'Betaine & Prebiotic Inulin',
        geneTarget: 'MTHFR / Gut Barrier',
        benefitEn: 'Feeds Akkermansia muciniphila and provides substrate for hepatic homocysteine transmethylation.',
        benefitEs: 'Nutre a Akkermansia muciniphila y aporta sustratos para la transmetilación hepática.'
      },
      {
        name: 'Wild Alaskan Salmon & Sardines',
        category: 'Clean Marine Proteins',
        activeCompound: 'Preformed EPA/DHA & Selenium',
        geneTarget: 'IRS1 & FTO',
        benefitEn: 'Enhances cell membrane fluidity, lowers insulin resistance, and activates leptin signaling.',
        benefitEs: 'Aumenta la fluidez de membrana, atenúa la resistencia a la insulina y activa leptina.'
      },
      {
        name: 'Pasture-Raised Organic Eggs (Soft Yolk)',
        category: 'Whole Protein & Lipids',
        activeCompound: 'Phosphatidylcholine & Lutein',
        geneTarget: 'MTHFR Alternate Pathway',
        benefitEn: 'Powers the BHMT alternative transmethylation pathway, preserving vital SAMe production.',
        benefitEs: 'Alimenta la vía alterna BHMT de transmetilación, preservando la síntesis de SAMe.'
      },
      {
        name: 'Dark Wild Berries + Ceylon Cinnamon',
        category: 'Polyphenols & Spices',
        activeCompound: 'Anthocyanins & Cinnamaldehyde',
        geneTarget: 'FUT1 / FGF21 Sweet Loop',
        benefitEn: 'Resets central sweet reward pathways and inhibits alpha-glucosidase digestive enzymes.',
        benefitEs: 'Reajusta la vía de recompensa de dulce e inhibe las enzimas alfa-glucosidasas.'
      },
      {
        name: 'Cold-Pressed Extra Virgin Olive Oil & Avocado',
        category: 'Monounsaturated Fats',
        activeCompound: 'Oleocanthal & Natural Vit E (Gamma-Tocopherol)',
        geneTarget: 'ZPR1 / CYP4F2 Safe Vit E',
        benefitEn: 'Provides safe, natural, whole-food vitamin E without triggering synthetic over-accumulation risk.',
        benefitEs: 'Aporta vitamina E natural y segura sin riesgo de acumulación de alfa-tocoferol sintético.'
      },
      {
        name: 'Ceremonial Grade Japanese Matcha Tea',
        category: 'Functional Beverages',
        activeCompound: 'EGCG + Natural L-Theanine',
        geneTarget: 'ADORA2A Neuro-Shield',
        benefitEn: 'Sustained cognitive energy without anxiety or heart rate spikes thanks to natural L-Theanine buffering.',
        benefitEs: 'Energía cognitiva sostenida sin ansiedad ni taquicardia gracias al amortiguador de L-teanina.'
      },
      {
        name: 'Raw Walnuts & Pumpkin Seeds',
        category: 'Nuts & Seeds',
        activeCompound: 'Plant Omega-3 ALA, Zinc & Magnesium',
        geneTarget: 'MC4R Satiety & VDR',
        benefitEn: 'High satiety density; supplies elemental cofactors for enzymatic phosphorylation.',
        benefitEs: 'Alta densidad de saciedad; aporta cofactores elementales para fosforilación enzimática.'
      }
    ],
    yellowCaution: [
      {
        name: 'A2 Fermented Goat/Sheep Milk Kefir',
        conditionEn: 'Consume maximum 150 mL daily. Avoid cow dairy completely.',
        conditionEs: 'Consumir máximo 150 mL al día. Evitar por completo lácteos de vaca.',
        geneTarget: 'MCM6 Hypolactasia'
      },
      {
        name: 'Cooked & Cooled Resistant Starch (Potatoes / Quinoa / Basmati)',
        conditionEn: 'Must be cooked and refrigerated for 24h before eating to convert starch into resistant Type-3.',
        conditionEs: 'Debe cocinarse y refrigerarse 24h antes para generar almidón resistente Tipo-3.',
        geneTarget: 'IRS1 Glycemia & Microbiota'
      },
      {
        name: 'Single Morning Espresso / Black Coffee',
        conditionEn: 'Strictly before 11:00 AM. Maximum 1 serving. Zero sugar or commercial syrups.',
        conditionEs: 'Estrictamente antes de las 11:00 AM. Máximo 1 taza. Cero azúcar ni siropes.',
        geneTarget: 'ADORA2A Anxiety & CYP1A2'
      },
      {
        name: 'Organic Sourdough Bread (Fermented 48h)',
        conditionEn: 'Only 1 slice (30g) as carb portion during lunch, never at dinner.',
        conditionEs: 'Solo 1 rebanada (30g) como porción de carbohidrato en el almuerzo, nunca en la cena.',
        geneTarget: 'TCF7L2 & IRS1'
      }
    ],
    redStrictExclusions: [
      {
        name: 'Commercial Multivitamins with Synthetic Folic Acid',
        hazardEn: 'Pteroylmonoglutamic acid blocks folate receptors and circulates un-metabolized (UMFA) in MTHFR 677TT.',
        hazardEs: 'El ácido pteroilmonoglutámico bloquea receptores de folato y circula sin metabolizar en MTHFR 677TT.',
        geneTarget: 'MTHFR 677TT'
      },
      {
        name: 'Synthetic Alpha-Tocopherol Supplements (High-Dose Vit E)',
        hazardEn: 'ZPR1 / CYP4F2 genetic variants prevent normal hepatic clearance, leading to vascular endothelial stress.',
        hazardEs: 'Las variantes ZPR1 y CYP4F2 impiden la depuración normal, provocando sobreacumulación endotelial.',
        geneTarget: 'ZPR1 / CYP4F2'
      },
      {
        name: 'Refined Flours, Commercial Fruit Juices & Sodas',
        hazardEn: 'Triggers severe insulin spikes, driving ectopic visceral adipogenesis under FTO and IRS1 risk alleles.',
        hazardEs: 'Dispara picos severos de insulina, acelerando lipogénesis visceral bajo alelos FTO e IRS1.',
        geneTarget: 'FTO & IRS1'
      },
      {
        name: 'Artificial Sweeteners (Sucralose, Aspartame, Acesulfame-K)',
        hazardEn: 'Perpetuates hypothalamic sweet craving loop via FUT1/FGF21 and alters beneficial colonic microbiome.',
        hazardEs: 'Perpetúa el bucle de apetencia por dulce vía FUT1/FGF21 y daña la microbiota intestinal.',
        geneTarget: 'FUT1 / FGF21'
      },
      {
        name: 'Unfermented Cow Milk, Fresh Cheeses & Commercial Ice Cream',
        hazardEn: 'High lactose osmotic draw causes colonic fermentation, mucosal endotoxemia, and chronic bloating.',
        hazardEs: 'La carga osmótica de lactosa causa fermentación colónica, endotoxemia e hinchazón crónica.',
        geneTarget: 'MCM6'
      }
    ]
  };

  // Plate Sequencing Architecture
  const plateSequencing = {
    titleEn: 'The 3-Step Genetic Plate Sequencing Protocol',
    titleEs: 'Protocolo de Secuencia en el Plato en 3 Pasos',
    impactEn: 'Reduces postprandial glucose spike by up to 45% and stimulates satiety hormones 20 minutes earlier.',
    impactEs: 'Reduce el pico glucémico postprandial hasta un 45% y adelanta la saciedad 20 minutos.',
    steps: [
      {
        step: 1,
        titleEn: 'Step 1: Fiber & Cruciferous Greens First (50% Plate Volume)',
        titleEs: 'Paso 1: Fibra & Verduras Crucíferas Primero (50% del Plato)',
        examplesEn: 'Arugula, baby spinach, steamed broccoli, asparagus, cucumbers dressed with extra virgin olive oil and lemon.',
        examplesEs: 'Rúcula, espinacas, brócoli al vapor, espárragos, pepino aliñados con AOVE y zumo de limón.',
        rationaleEn: 'Soluble fiber creates a viscous mesh in the duodenum, physically slowing glucose absorption.'
      },
      {
        step: 2,
        titleEn: 'Step 2: Clean Protein & Healthy Lipids Second (30–35% Plate)',
        titleEs: 'Paso 2: Proteínas Limpias & Grasas Saludables Segundo (30–35%)',
        examplesEn: 'Wild salmon, chicken breast, pasture eggs, sardines, grass-fed lean beef, avocado.',
        examplesEs: 'Salmón salvaje, pechuga de pollo, huevos ecológicos, sardinas, ternera magra, aguacate.',
        rationaleEn: 'Triggers CCK and peptide YY release in the distal ileum to turn off the hypothalamic MC4R hunger signal.'
      },
      {
        step: 3,
        titleEn: 'Step 3: Low-GI Complex Carbs Last (<15–20% Plate Volume)',
        titleEs: 'Paso 3: Carbohidratos Complejos de Bajo IG al Final (<15–20%)',
        examplesEn: 'Chilled sweet potato, resistant starch basmati/quinoa, lentils or chickpeas (maximum 35–40g net carbs).',
        examplesEs: 'Boniato asado frío, arroz basmati o quinoa enfriados 24h, lentejas o garbanzos (máx 35–40g netos).',
        rationaleEn: 'Reaching the intestine after fiber and protein blunts the glycemic curve and prevents fat storage.'
      }
    ]
  };

  // Circadian Chrono-Nutrition 24h Schedule
  const circadianChronoSchedule = [
    {
      time: '07:30 – 08:30 AM',
      phaseEn: 'Morning Metabolic Ignition',
      phaseEs: 'Arranque Metabólico Matutino',
      actionEn: 'High-protein breakfast (30g protein + healthy lipids). E.g., 3 pasture-raised scrambled eggs with baby spinach and avocado. Natural light exposure.',
      actionEs: 'Desayuno alto en proteína (30g + grasas saludables). Ej: 3 huevos revueltos con espinacas y aguacate. Exposición a luz natural.',
      target: 'MC4R Satiety & Cortisol Sync'
    },
    {
      time: '11:00 AM SHARP',
      phaseEn: 'Strict Caffeine Curfew',
      phaseEs: 'Tope Estricto de Cafeína',
      actionEn: 'Final allowable coffee serving. After 11:00 AM, switch strictly to ceremonial green matcha or herbal infusions.',
      actionEs: 'Último café permitido. A partir de las 11:00 AM, cambiar exclusivamente a té matcha ceremonial o infusiones.',
      target: 'ADORA2A Anxiety & Sleep Architecture'
    },
    {
      time: '01:00 – 02:30 PM',
      phaseEn: 'Peak Digestion Lunch',
      phaseEs: 'Almuerzo Principal (Máxima Eficiencia)',
      actionEn: 'Apply Plate Sequencing strictly: Arugula & steamed asparagus first -> Grilled wild salmon second -> Chilled quinoa last.',
      actionEs: 'Aplicar secuencia estricta: Rúcula y espárragos primero -> Salmón salvaje segundo -> Quinoa enfriada al final.',
      target: 'IRS1 Glycemia & MTHFR Betaine'
    },
    {
      time: '05:30 – 06:00 PM',
      phaseEn: 'Anti-Craving Dopamine Window',
      phaseEs: 'Ventana Dopaminérgica Anti-Snacking',
      actionEn: '2 squares of >85% dark raw cacao + 1 handful of raw walnuts + warm Ceylon cinnamon rooibos tea.',
      actionEs: '2 onzas de cacao amargo >85% + puñado de nueces crudas + infusión de rooibos con canela de Ceilán.',
      target: 'TAS2R38 & FUT1 Emotional Craving'
    },
    {
      time: '08:00 – 08:45 PM',
      phaseEn: 'Evening Cellular Repair Dinner',
      phaseEs: 'Cena Ligera de Reparación Celular',
      actionEn: 'Zucchini-leek cream soup with olive oil + baked white fish (sea bass or cod). Zero starchy carbs to prevent nocturnal lipogenesis.',
      actionEs: 'Crema de calabacín y puerro con AOVE + pescado blanco al horno (lubina o bacalao). Cero carbohidratos simples.',
      target: 'CLOCK Evening Metabolic Reset'
    },
    {
      time: '09:30 PM – 07:30 AM',
      phaseEn: '10–12 Hour Fasting & Melatonin Window',
      phaseEs: 'Ventana de Ayuno Nocturno & Melatonina (10–12h)',
      actionEn: 'Zero caloric intake. Room-temperature water or chamomile tea only. Deep parasympathetic nervous system recovery.',
      actionEs: 'Cero calorías. Agua o manzanilla templada. Recuperación parasimpática y detoxificación glial nocturna.',
      target: 'Autophagy & Hepatic Regeneration'
    }
  ];

  // 7-Day Precision Meal Plan (Appetizing, GCC/Qatar realistic, culturally versatile)
  const sevenDayMealPlan = [
    {
      day: 1,
      dayName: 'Monday',
      themeEn: 'Cellular Methylation & Leptin Satiety Reset',
      themeEs: 'Metilación Celular & Reset de Saciedad Leptínica',
      breakfast: 'Omelette of 3 organic pasture-raised eggs with 2 cups of fresh baby spinach and 1/4 ripe avocado cooked in extra virgin olive oil.',
      lunch: 'Plate Sequencing: Large bitter arugula & radish salad with lemon-EVOO dressing -> 180g grilled wild sea bass fillet -> 1/2 cup cooked and refrigerated brown basmati.',
      snack: '20g raw walnuts + 2 squares of 90% dark raw cacao + hot Ceylon cinnamon rooibos infusion.',
      dinner: 'Velvety zucchini and leek soup made with bone broth and EVOO + 170g steamed cod fillet with asparagus spears.',
      bedtimeTea: 'Pure Egyptian chamomile & fresh peppermint leaves infusion.'
    },
    {
      day: 2,
      dayName: 'Tuesday',
      themeEn: 'Insulin Sensitization & Marine Omega-3 Optimization',
      themeEs: 'Sensibilización a la Insulina & Omega-3 Marino',
      breakfast: 'Bowl of full-fat coconut yogurt with 1 scoop of clean grass-fed collagen, 1 tbsp crushed chia seeds, wild blueberries, and a pinch of Ceylon cinnamon.',
      lunch: 'Plate Sequencing: Steamed broccoli florets with toasted sesame and EVOO -> 200g wild Norwegian salmon steak -> 1 small roasted chilled sweet potato.',
      snack: 'Crunchy cucumber spears and celery sticks with raw tahini paste and sea salt.',
      dinner: 'Free-range chicken breast paillard marinated in garlic and rosemary + grilled zucchini and yellow bell peppers.',
      bedtimeTea: 'Lemon balm & lavender restorative night infusion.'
    },
    {
      day: 3,
      dayName: 'Wednesday',
      themeEn: 'Gut Microbiome Colonization & Resistant Starch',
      themeEs: 'Colonización de Microbiota & Almidón Resistente',
      breakfast: 'Shakshuka with 3 eggs poached in fresh tomato, bell pepper, and cumin sauce with fresh cilantro and olive oil.',
      lunch: 'Plate Sequencing: Shaved fennel, cucumber, and dill salad -> 180g grass-fed beef tenderloin medallions -> 1/2 cup warm pre-cooled green lentils.',
      snack: 'Small handful of raw pumpkin seeds + 1 cup of unsweetened ceremonial green matcha tea (before 11 AM) or herbal tea.',
      dinner: 'Oven-roasted sea bream with thyme and sliced lemon + large bowl of steamed green beans and artichoke hearts.',
      bedtimeTea: 'Warm ginger and chamomile tisane.'
    },
    {
      day: 4,
      dayName: 'Thursday',
      themeEn: 'Neurotransmitter Dopamine & Focus Alignment',
      themeEs: 'Alineación de Neurotransmisores & Dopamina',
      breakfast: '3 pasture-raised poached eggs over a bed of sautéed kale and sliced portobello mushrooms in virgin olive oil.',
      lunch: 'Plate Sequencing: Crispy mixed green salad with pumpkin seed oil -> 180g grilled turkey breast with rosemary -> 1/2 cup pre-cooled quinoa pilaf.',
      snack: '15 raw almonds + 1 cup fresh wild blackberries with ground Ceylon cinnamon.',
      dinner: 'Steamed wild gulf prawns with garlic-parsley olive oil dressing over a warm cauliflower mash with nutritional yeast.',
      bedtimeTea: 'Passionflower and holy basil (Tulsi) nervous system calm infusion.'
    },
    {
      day: 5,
      dayName: 'Friday',
      themeEn: 'Mitochondrial Energy & Endothelial VDR Support',
      themeEs: 'Energía Mitocondrial & Soporte Endotelial VDR',
      breakfast: 'Smoked wild salmon (120g) rolled around cucumber slices with 2 soft-boiled organic eggs and fresh dill.',
      lunch: 'Plate Sequencing: Steamed asparagus dressed with lemon and flaky sea salt -> 200g grilled local hammour fish -> 1/2 cup roasted beetroot wedges.',
      snack: 'Crunchy raw celery with unsweetened almond butter and raw cocoa nibs.',
      dinner: 'Slow-cooked lamb shank (lean meat only) in cumin-coriander broth served over a generous bed of steamed baby spinach.',
      bedtimeTea: 'Chamomile flower infusion with fresh mint.'
    },
    {
      day: 6,
      dayName: 'Saturday',
      themeEn: 'Social Circadian Dining & Metabolic Flexibility',
      themeEs: 'Flexibilidad Metabólica & Cena Social Consciente',
      breakfast: 'Weekend Scramble: 3 organic eggs scrambled with smoked turkey breast, cherry tomatoes, and fresh chives in EVOO.',
      lunch: 'Mediterranean seafood grill: Calamari and sea bass with a massive Greek salad (cucumber, olives, bell peppers, olive oil; no cow feta).',
      snack: 'Handful of raw macadamia nuts + chilled hibiscus iced tea with fresh mint (sugar-free).',
      dinner: 'Grilled tender chicken skewers (shish tawook style, garlic and olive oil marinade) with grilled eggplant and tahini dip.',
      bedtimeTea: 'Warm lemon verbena & chamomile tea.'
    },
    {
      day: 7,
      dayName: 'Sunday',
      themeEn: 'Longevity Autophagy & Deep Gastrointestinal Rest',
      themeEs: 'Autofagia de Longevidad & Descanso Gastrointestinal',
      breakfast: 'Fasting friendly morning: Large glass of filtered water with pinch of Celtic salt -> 10:00 AM: 2 soft-boiled eggs with fresh avocado and arugula.',
      lunch: 'Plate Sequencing: Massaged kale salad with lemon and olive oil -> 180g grilled wild tuna steak with sesame crust -> 1/3 cup chilled brown rice.',
      snack: '2 squares of >85% single-origin dark chocolate + warm cinnamon rooibos tea.',
      dinner: 'Mineral-rich vegetable broth with poached chicken shreds, ginger root, and baby bok choy.',
      bedtimeTea: 'Pure German chamomile flower infusion.'
    }
  ];

  // Minimal Targeted Co-Factors (Food-First Complement)
  const minimalTargetedCoFactors = [
    {
      nutrient: 'Active Natural Folate (L-5-MTHF)',
      dose: '400–800 mcg daily',
      timing: 'Morning with breakfast',
      foodSynergy: 'Works together with natural folates from spinach, arugula & egg yolks',
      rationaleEn: 'Directly provides active folate that your body can use 100% (bypassing the slow MTHFR gene) without leaving synthetic folic acid buildup.',
      rationaleEs: 'Aporta folato natural activo que tu cuerpo aprovecha al 100% (compensando tu gen MTHFR) sin acumular ácido fólico sintético.'
    },
    {
      nutrient: 'Chelated Magnesium Bisglycinate + L-Theanine',
      dose: '150–200 mg elemental Mg',
      timing: 'Evening 45 min before sleep',
      foodSynergy: 'Complements dietary magnesium from pumpkin seeds, almonds & 85% dark cacao',
      rationaleEn: 'Calms the nervous system, relaxes muscles, and promotes deep restorative sleep without causing stomach discomfort.',
      rationaleEs: 'Relaja el sistema nervioso y la musculatura favoreciendo el sueño profundo sin molestias digestivas.'
    },
    {
      nutrient: 'Targeted Probiotics in Acid-Resistant Vegetable Capsule (LGG + BB-12)',
      dose: '15 Billion Live Cultures',
      timing: 'Upon waking on an empty stomach with water',
      foodSynergy: 'Nourished by prebiotic fibers from asparagus, artichokes & cooled rice/potato',
      rationaleEn: 'Protected in a delayed-release vegetable capsule so live beneficial bacteria pass through stomach acid intact and protect your gut from lactose irritation (MCM6).',
      rationaleEs: 'En cápsula vegetal gastrorresistente para que las bacterias vivas lleguen intactas al intestino y reduzcan la sensibilidad a la lactosa (MCM6).'
    }
  ];

  // Supermarket Grocery Checklist (categorized for easy patient shopping in Doha/GCC)
  const supermarketGroceryList = [
    {
      category: 'Fresh Produce & Greens (Metabolism & Methylation)',
      categoryEs: 'Verdulería & Hojas Verdes (Metilación & Saciedad)',
      icon: '🥬',
      items: [
        'Wild Rocket / Arugula (4 packs)',
        'Baby Spinach (fresh, organic)',
        'Fresh Asparagus spears (2 bunches)',
        'Raw Beetroot (fresh, not pickled)',
        'English Cucumbers (crunchy snacks)',
        'Celery stalks (organic)',
        'Broccoli & Cauliflower heads',
        'Zucchini & Leeks (for evening creams)',
        'Fresh Lemons & Limes (daily dressing)',
        'Fresh Avocados (Hass, semi-ripe)'
      ]
    },
    {
      category: 'Clean Wild Proteins (Leptin & Muscle Preservation)',
      categoryEs: 'Proteínas Limpias & Pesca Salvaje (Saciedad & PYY)',
      icon: '🐟',
      items: [
        'Pasture-Raised Organic Eggs (3 dozen)',
        'Wild Alaskan Salmon fillets',
        'Fresh Local Sea Bass / Hammour fillets',
        'Fresh Sardines or Mackerel in olive oil',
        'Free-Range Chicken Breast (hormone-free)',
        'Grass-Fed Beef tenderloin or lean steak',
        'Clean collagen peptides powder (unflavored)'
      ]
    },
    {
      category: 'Healthy Fats, Seeds & Spices (Safe Vit E & Glycemia)',
      categoryEs: 'Grasas Buenas, Semillas & Especias (Vit E Dietética)',
      icon: '🫒',
      items: [
        'Extra Virgin Olive Oil (First cold-pressed, dark bottle)',
        'Raw Walnuts & Raw Almonds (unroasted, unsalted)',
        'Raw Pumpkin Seeds (rich in zinc/magnesium)',
        'Whole Chia Seeds',
        'Raw Tahini Paste (100% sesame)',
        'Ceylon Cinnamon powder (True Cinnamon, Cinnamomum verum)',
        'Pure Dark Raw Cacao (>85% or 90% cocoa)',
        'Raw cocoa nibs (unrefined)'
      ]
    },
    {
      category: 'Functional Beverages & Ferments',
      categoryEs: 'Bebidas Funcionales & Fermentados',
      icon: '🍵',
      items: [
        'Ceremonial Grade Japanese Matcha Green Tea',
        'Organic German Chamomile dried flowers',
        'Pure Peppermint leaf tea',
        'Caffeine-free South African Rooibos tea',
        'A2 Goat Milk Kefir or Raw Coconut Water Kefir',
        'Celtic Sea Salt or Himalayan Flaky Salt'
      ]
    }
  ];

  // Clinical Nutritionist Consultation Guide
  const nutritionistConsultationDirectives = {
    intakeQuestions: [
      {
        questionEn: 'Do you feel a sharp energy crash or intense craving for sweets 90–120 minutes after eating pasta, rice, or bread?',
        rationale: 'Screens for IRS1 / TCF7L2 reactive hypoglycemia and postprandial glucose surges.'
      },
      {
        questionEn: 'When under acute work stress or evening fatigue, do you feel an irresistible urge to open the fridge or snack on crunchies?',
        rationale: 'Screens for TAS2R38 and MC4R emotional dopamine reward behaviors.'
      },
      {
        questionEn: 'Have you ever experienced abdominal bloating, distension, or gas within 2–4 hours of drinking cow milk or eating fresh soft cheese?',
        rationale: 'Correlates MCM6 genotype with symptomatic adult hypolactasia.'
      },
      {
        questionEn: 'Does a coffee taken after 1:00 PM make you feel jittery, anxious, or interfere with your sleep onset at night?',
        rationale: 'Directly validates ADORA2A adenosine receptor sensitivity and CYP1A2 slow clearance.'
      }
    ],
    actionPlanPhases: [
      {
        phase: 'Weeks 1–2: Glycemic & Appetite Foundation',
        milestone: 'Implement Plate Sequencing strictly at lunch and dinner. Eliminate synthetic folic acid and all liquid sugars.'
      },
      {
        phase: 'Weeks 3–4: Gut Barrier & Neuro-Stimulant Calibration',
        milestone: 'Transition to A2 goat kefir and enforce the 11:00 AM caffeine curfew. Start morning active L-5-MTHF co-factor.'
      },
      {
        phase: 'Weeks 5–8: Metabolic Consolidation & Biomarker Re-check',
        milestone: 'Evaluate HbA1c, serum 25(OH)D, and plasma homocysteine to verify full metabolic recalibration.'
      }
    ]
  };

  // Dynamically compute risk flags from actual genotype evaluation
  const riskFlags = {
    mthfrRisk: hasMthfrTT ? 'HIGH' : hasMthfrCT ? 'MODERATE' : 'LOW',
    mcm6Intolerant: hasLactoseIntolerance,
    mc4rLowSatiety: hasMc4rVariant,
    irs1Resistant: hasIrs1TT,
    cyp4f2Risk: hasVitEToxicityRisk,
    caffeineSensitive: hasCaffeineAnxiety || hasSlowCaffeineClearance
  };

  // Dynamically evaluated Master Food Catalog (Fagron-inspired standard)
  const masterFoodItemsEvaluated = MASTER_FOOD_CATALOG.map(f => evaluateFoodForGeneticProfile(f, riskFlags));

  // Sourced directly from Fagron Master Catalog via personalized genetic filtering
  const dynamicGroceryAisles = getPersonalizedGroceryAisles(riskFlags);

  const fagron17SubfamilyMatrix = getFagron17SubfamilyMatrix(riskFlags);

  return {
    patient: {
      name: patientName,
      sampleCode,
      doctor,
      clinic,
      testPlatform,
      analysisDate
    },
    genotypesEvaluated: g,
    fiveClinicalAxes,
    plateSequencing,
    foodTrafficLight,
    circadianChronoSchedule,
    sevenDayMealPlan,
    minimalTargetedCoFactors,
    supermarketGroceryList: dynamicGroceryAisles.length > 0 ? dynamicGroceryAisles : supermarketGroceryList,
    masterFoodCatalog: masterFoodItemsEvaluated,
    fagron17Subfamilies: FAGRON_17_SUBFAMILIES,
    fagron17SubfamilyMatrix,
    nutritionistConsultationDirectives,
    // Preserves backward compatibility with existing components
    concreteDietGuidelines: CONCRETE_DIET_GUIDELINES,
    threeCapsuleProtocol: THREE_CAPSULE_PROTOCOL,
    commercialLocalSupplements: COMMERCIAL_LOCAL_SUPPLEMENTS,
    galenicCompatibility: GALENIC_COMPATIBILITY_ANALYSIS,
    treatmentCycle: TREATMENT_CYCLE
  };
}



