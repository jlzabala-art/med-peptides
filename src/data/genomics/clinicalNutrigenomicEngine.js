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


