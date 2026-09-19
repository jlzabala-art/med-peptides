/**
 * protocolTranslations.js
 * Internationalization dictionaries and helpers for clinical protocols and protocol directory.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'ES', name: 'Español', flag: '🇪🇸' },
];

export const PROTOCOL_I18N = {
  en: {
    // TopBar & Header
    clinicalProtocolGuide: 'CLINICAL PROTOCOL GUIDE',
    clinicalRegistryBadge: 'Atlas Services Clinical Registry • Evidence-Based Pathways',
    standardizedBlueprint: 'Standardized Clinical Pathway Blueprint',
    blueprintNotice: 'This treatment protocol guide is curated exclusively for certified medical practitioners and clinical research protocols. All active pharmaceutical ingredients and administration schedules adhere to Atlas Services clinical research standards.',
    certifiedOnlyBadge: 'Certified Practitioner Use Only',
    exploreAllProtocols: 'Explore All Protocols',
    peptidesBadge: 'Peptides',
    
    // QR Verification Box
    verifiedProtocol: 'VERIFIED PROTOCOL',
    scanForAccess: 'Scan for Instant Clinical Access',
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied',
    copySuccessToast: 'Protocol guide link copied to clipboard ✓',

    // 4 KPIs
    kpiDurationTitle: 'PROTOCOL DURATION',
    kpiDurationUnit: 'Weeks',
    kpiDurationSubtitle: 'Titration Stages',
    kpiPeptidesTitle: 'ACTIVE PEPTIDES',
    kpiPeptidesSubtitle: 'Dual Metabolic Synergy',
    kpiPeptidesFallbackSubtitle: 'Pharmacological Synergy',
    kpiFormulations: 'Formulations',
    kpiFormulation: 'Formulation',
    kpiVialsTitle: 'FULL CYCLE VIALS',
    kpiVialsUnit: 'Vials',
    kpiVialsSubtitle: 'Active Formulation Vials',
    kpiInjectionsTitle: 'ADMINISTRATION EVENTS',
    kpiInjectionsUnit: 'Micro-Doses',
    kpiInjectionsSubtitle: 'U-100 Sterile Syringes',

    // Section 1: Biological Rationale & Mechanism
    sec1Title: 'Biological Rationale & Therapeutic Axis',
    sec1Subtitle: 'Evidence-based mechanistic rationale and receptor target dynamics',
    primaryMechanism: 'Primary Pharmacological Mechanism',
    cellularSignaling: 'Cellular Signaling & Target Pathway',
    clinicalSynergy: 'Clinical Synergy & Rationale',

    // Section 2: Treatment Timeline & Phase Structure
    sec2Title: 'Clinical Protocol Schedule & Dosing Titration',
    sec2Subtitle: 'Sequential treatment stages calibrated for cellular receptor adaptation',
    clickToExpandNotice: 'Interactive Phase Explorer — Click any phase to inspect exact titration, dosages and administration parameters.',
    phaseLabel: 'Phase',
    weekLabel: 'Week',
    weeksLabel: 'Weeks',
    clinicalIntent: 'Clinical Intent / Stage Goal',
    phaseDosageTable: 'Phase Dosage Schedule & Active Formulations',
    colPeptide: 'Active Compound',
    colDosage: 'Calibrated Dose',
    colFrequency: 'Frequency',
    colTiming: 'Timing / Route',
    colNotes: 'Clinical Precision Guidance',
    subcutaneousInjection: 'Subcutaneous (SubQ)',
    administrationNotes: 'Phase Administration Guidance',

    // Section 3: Biomarkers & Laboratory Monitoring
    sec3Title: 'Biomarkers & Laboratory Monitoring',
    sec3Subtitle: 'Standardized clinical surveillance panels before, during, and after cycle',
    baselineTesting: 'Recommended Laboratory Surveillance Panels',

    // Section 4: Cycle Dispensing & Logistics Blueprint
    sec4Title: 'Cycle Dispensing & Logistics Blueprint',
    sec4Subtitle: 'Total compounding supply requirements for the full cycle',
    colVialsNeeded: 'Vials Required',
    colConcentration: 'Active Strength',
    colTotalUnits: 'Total Treatment Units',
    coldChainStorage: 'Cold-Chain & Storage Verification',
    coldChainDesc: 'All lyophilized formulations require refrigerated storage at 2°C – 8°C (or -20°C for extended stability). Protect from direct light.',

    // Section 5: Administration Guidance & Precision Notes
    sec5Title: 'Administration Guidance & Precision Notes',
    sec5Subtitle: 'Standard operating procedures for aseptic compounding and patient instruction',
    subqProtocolTitle: 'Subcutaneous Micro-Injection Technique',
    subqProtocolDesc: 'Administer at a 45° to 90° angle into clean abdominal adipose tissue (periumbilical region, avoiding 2 inches around navel) using sterile U-100 insulin syringes (29G–31G). Rotate injection quadrants with each administration.',
    reconstitutionTitle: 'Aseptic Reconstitution Standards',
    reconstitutionDesc: 'Introduce Bacteriostatic Water slowly down the inner glass vial wall. Gently rotate vial between palms until dissolved. Never vortex or shake vigorously to prevent peptide denaturation.',

    // Section 6: Safety, Contraindications & Storage
    sec6Title: 'Safety, Contraindications & Medical Governance',
    sec6Subtitle: 'Clinical risk evaluation and institutional monitoring protocols',
    contraindicationsTitle: 'Primary Contraindications',
    contraindicationsDesc: 'Known hypersensitivity to active peptides; active endocrine neoplasms; severe unmanaged renal or hepatic impairment; pregnancy and lactation unless explicitly indicated.',
    medicalSupervisionTitle: 'Mandatory Medical Supervision',
    medicalSupervisionDesc: 'This protocol blueprint is an informational framework for certified healthcare professionals. Prescribing clinicians must tailor dosages and monitor patient tolerance.',

    // Catalog Directory translations (/proto)
    catalogHeroPill: 'Ecosystem Clinical Pathways • Single Source of Truth',
    catalogHeroTitle: 'Clinical Protocols & Peptides Directory',
    catalogHeroSubtitle: 'Explore 77 standardized therapeutic protocols formulated with certified pharmaceutical grade compounds. Monotherapies and combined synergies with dosage schedules, titration phases, and laboratory surveillance.',
    
    // 4 Directory KPIs (Rule #22)
    kpiActiveProtocolsTitle: 'ACTIVE PROTOCOLS',
    kpiActiveProtocolsSub: 'Standardized pathways in registry',
    kpiGoalsTitle: 'THERAPEUTIC GOALS',
    kpiGoalsSub: 'Target biomarker categories',
    kpiSsotTitle: 'DOSIMETRIC SSOT',
    kpiSsotSub: 'Calibrated titration formulas',
    kpiCyclesTitle: 'CYCLE HORIZON',
    kpiCyclesSub: 'Treatment duration spectrum',

    // Key aliases for seamless backward compatibility
    activeProtocols: 'Active Protocols',
    therapeuticGoals: 'Therapeutic Goals',
    ssotClinicalFormulas: 'Dosimetric SSOT',
    treatmentCycles: 'Treatment Horizon',

    searchPlaceholder: 'Search protocols by name, compound (e.g. Tirzepatide, BPC-157), indication, or code...',
    allGoals: 'All Protocols',
    allDurations: 'All Durations',
    shortCycle: 'Short Cycle (≤8w)',
    standardCycle: 'Standard (9–12w)',
    extendedCycle: 'Extended (13w+)',
    allStructures: 'All Phase Structures',
    allPhases: 'All Phase Structures',
    singlePhase: 'Monophasic (1 Phase)',
    monophasic: 'Monophasic (1 Phase)',
    titrationPhase: 'Progressive Titration (2+ Phases)',
    progressiveTitration: 'Progressive Titration (2+ Phases)',
    sortBy: 'Sort by',
    sortRecommended: 'Recommended',
    sortRelevance: 'Recommended',
    sortDurationAsc: 'Duration (Short to Long)',
    sortDurationDesc: 'Duration (Long to Short)',
    sortPhasesDesc: 'Phases: Highest Complexity',
    sortNameAsc: 'Protocol Name (A - Z)',
    resetFilters: 'Reset Filters',
    viewTimeline: 'Explore Timeline & Dosing',
    copyProtocolLink: 'Copy Guide Link',
    noResultsTitle: 'No clinical protocols match the selected criteria',
    noResultsSubtitle: 'Try adjusting your search query, therapeutic goal, or duration filter.',
  },

  es: {
    // TopBar & Header
    clinicalProtocolGuide: 'GUÍA CLÍNICA DE PROTOCOLO',
    clinicalRegistryBadge: 'Registro Clínico Atlas Services • Vías Basadas en Evidencia',
    standardizedBlueprint: 'Guía Estandarizada de Vía Clínica',
    blueprintNotice: 'Esta guía de protocolo terapéutico está curada exclusivamente para profesionales médicos certificados e investigación clínica. Todos los principios activos y calendarios de dosificación cumplen los estándares clínicos de Atlas Services.',
    certifiedOnlyBadge: 'Uso Exclusivo Profesional Certificado',
    exploreAllProtocols: 'Ver Todos los Protocolos',
    peptidesBadge: 'Péptidos',

    // QR Verification Box
    verifiedProtocol: 'PROTOCOLO VERIFICADO',
    scanForAccess: 'Escanear para Acceso Clínico Inmediato',
    copyLink: 'Copiar Enlace',
    linkCopied: 'Enlace Copiado',
    copySuccessToast: 'Enlace del protocolo copiado al portapapeles ✓',

    // 4 KPIs
    kpiDurationTitle: 'DURACIÓN DEL PROTOCOLO',
    kpiDurationUnit: 'Semanas',
    kpiDurationSubtitle: 'Etapas de Titulación',
    kpiPeptidesTitle: 'PÉPTIDOS ACTIVOS',
    kpiPeptidesSubtitle: 'Sinergia Metabólica Dual',
    kpiPeptidesFallbackSubtitle: 'Sinergia Farmacológica',
    kpiFormulations: 'Formulaciones',
    kpiFormulation: 'Formulación',
    kpiVialsTitle: 'VIALES DE CICLO COMPLETO',
    kpiVialsUnit: 'Viales',
    kpiVialsSubtitle: 'Viales de Formulación Activa',
    kpiInjectionsTitle: 'EVENTOS DE ADMINISTRACIÓN',
    kpiInjectionsUnit: 'Microdosis',
    kpiInjectionsSubtitle: 'Jeringas Estériles U-100',

    // Section 1: Biological Rationale & Mechanism
    sec1Title: 'Justificación Biológica & Eje Terapéutico',
    sec1Subtitle: 'Fundamento mecanístico basado en evidencia y dinámica de receptores diana',
    primaryMechanism: 'Mecanismo Farmacológico Primario',
    cellularSignaling: 'Señalización Celular & Vía Diana',
    clinicalSynergy: 'Sinergia Clínica & Justificación',

    // Section 2: Treatment Timeline & Phase Structure
    sec2Title: 'Cronograma Clínico de Dosificación & Titulación',
    sec2Subtitle: 'Fases secuenciales de tratamiento calibradas para la adaptación de receptores',
    clickToExpandNotice: 'Explorador Interactivo de Fases — Haz clic en cualquier fase para examinar su titulación, dosis y parámetros exactos.',
    phaseLabel: 'Fase',
    weekLabel: 'Semana',
    weeksLabel: 'Semanas',
    clinicalIntent: 'Objetivo Clínico / Intención de Fase',
    phaseDosageTable: 'Cronograma de Dosificación de Fase & Formulaciones Activas',
    colPeptide: 'Compuesto Activo',
    colDosage: 'Dosis Calibrada',
    colFrequency: 'Frecuencia',
    colTiming: 'Momento / Vía',
    colNotes: 'Guía Clínica de Precisión',
    subcutaneousInjection: 'Subcutánea (SubQ)',
    administrationNotes: 'Guía de Administración de Fase',

    // Section 3: Biomarkers & Laboratory Monitoring
    sec3Title: 'Biomarcadores & Monitorización de Laboratorio',
    sec3Subtitle: 'Paneles estandarizados de vigilancia clínica antes, durante y después del ciclo',
    baselineTesting: 'Paneles de Vigilancia Analítica Recomendados',

    // Section 4: Cycle Dispensing & Logistics Blueprint
    sec4Title: 'Plan Logístico & Dispensación de Ciclo',
    sec4Subtitle: 'Requerimientos de suministro analítico para la totalidad del ciclo',
    colVialsNeeded: 'Viales Requeridos',
    colConcentration: 'Concentración Activa',
    colTotalUnits: 'Unidades Totales del Ciclo',
    coldChainStorage: 'Cadena de Frío & Verificación de Almacenamiento',
    coldChainDesc: 'Todas las formulaciones liofilizadas requieren conservación refrigerada a 2°C – 8°C (o -20°C para estabilidad prolongada). Proteger de la luz directa.',

    // Section 5: Administration Guidance & Precision Notes
    sec5Title: 'Guía de Administración & Notas de Precisión',
    sec5Subtitle: 'Procedimientos operativos estándar para formulación aséptica e instrucción al paciente',
    subqProtocolTitle: 'Técnica de Microinyección Subcutánea',
    subqProtocolDesc: 'Administrar en un ángulo de 45° a 90° en tejido adiposo abdominal limpio (región periumbilical, evitando 5 cm alrededor del ombligo) con jeringas estériles U-100 (29G–31G). Alternar cuadrantes de inyección en cada aplicación.',
    reconstitutionTitle: 'Estándares de Reconstitución Aséptica',
    reconstitutionDesc: 'Introducir el agua bacteriostática lentamente por la pared interior del vial de vidrio. Rotar suavemente el vial entre las palmas hasta disolución total. Nunca agitar con violencia para evitar desnaturalizar las cadenas peptídicas.',

    // Section 6: Safety, Contraindications & Storage
    sec6Title: 'Seguridad, Contraindicaciones & Gobernanza Médica',
    sec6Subtitle: 'Evaluación de riesgos clínicos y protocolos de vigilancia institucional',
    contraindicationsTitle: 'Contraindicaciones Principales',
    contraindicationsDesc: 'Hipersensibilidad conocida a los principios activos; neoplasias endocrinas activas; insuficiencia renal o hepática grave descompensada; embarazo y lactancia salvo indicación facultativa explícita.',
    medicalSupervisionTitle: 'Supervisión Médica Obligatoria',
    medicalSupervisionDesc: 'Esta guía de protocolo es un marco orientativo para profesionales sanitarios certificados. El médico prescriptor debe individualizar las dosis y evaluar la respuesta clínica del paciente.',

    // Catalog Directory translations (/proto)
    catalogHeroPill: 'Vías Clínicas del Ecosistema • Single Source of Truth',
    catalogHeroTitle: 'Directorio de Protocolos Clínicos & Péptidos',
    catalogHeroSubtitle: 'Explora los 77 protocolos terapéuticos formulados bajo estándares clínicos avanzados. Monoterapias y sinergias combinadas con calendarios de dosificación, fases de titulación y biomarcadores de seguridad.',
    
    // 4 Directory KPIs (Rule #22)
    kpiActiveProtocolsTitle: 'PROTOCOLOS ACTIVOS',
    kpiActiveProtocolsSub: 'Vías estandarizadas en el registro',
    kpiGoalsTitle: 'OBJETIVOS TERAPÉUTICOS',
    kpiGoalsSub: 'Categorías de biomarcadores objetivo',
    kpiSsotTitle: 'SSOT DOSIMÉTRICO',
    kpiSsotSub: 'Fórmulas calibradas de titulación',
    kpiCyclesTitle: 'HORIZONTE DEL CICLO',
    kpiCyclesSub: 'Rango de duración del tratamiento',

    // Key aliases for backward compatibility
    activeProtocols: 'Protocolos Activos',
    therapeuticGoals: 'Objetivos Terapéuticos',
    ssotClinicalFormulas: 'SSOT Dosimétrico',
    treatmentCycles: 'Horizonte de Ciclos',

    searchPlaceholder: 'Buscar protocolos por nombre, compuesto (ej. Tirzepatide, BPC-157), indicación o código...',
    allGoals: 'Todos los Protocolos',
    allDurations: 'Todas las Duraciones',
    shortCycle: 'Ciclo Corto (≤8 sem)',
    standardCycle: 'Estándar (9–12 sem)',
    extendedCycle: 'Extendido (13+ sem)',
    allStructures: 'Todas las Estructuras de Fase',
    allPhases: 'Todas las Estructuras de Fase',
    singlePhase: 'Monofásico (1 Fase)',
    monophasic: 'Monofásico (1 Fase)',
    titrationPhase: 'Titulación Progresiva (2+ Fases)',
    progressiveTitration: 'Titulación Progresiva (2+ Fases)',
    sortBy: 'Ordenar por',
    sortRecommended: 'Recomendados',
    sortRelevance: 'Recomendados',
    sortDurationAsc: 'Duración (Menor a Mayor)',
    sortDurationDesc: 'Duración (Mayor a Menor)',
    sortPhasesDesc: 'Fases: Mayor Complejidad',
    sortNameAsc: 'Nombre del Protocolo (A - Z)',
    resetFilters: 'Restablecer Filtros',
    viewTimeline: 'Explorar Timeline & Dosificación',
    copyProtocolLink: 'Copiar Enlace de Guía',
    noResultsTitle: 'No hay protocolos clínicos que coincidan con los filtros',
    noResultsSubtitle: 'Prueba ajustando el término de búsqueda, el objetivo terapéutico o el rango de duración.',
  }
};

/**
 * Returns localized strings for protocol views
 */
export function getProtocolTranslations(lang = 'en') {
  return PROTOCOL_I18N[lang] || PROTOCOL_I18N.en;
}

/**
 * Maps goal bucket titles to localized labels
 */
export const GOAL_TRANSLATIONS = {
  all: { en: 'All Protocols', es: 'Todos los Protocolos' },
  fat_loss: { en: 'Metabolism & GLP-1 / GIP', es: 'Metabolismo & GLP-1 / GIP' },
  longevity: { en: 'Longevity & Anti-Aging', es: 'Longevidad & Anti-Aging' },
  recovery: { en: 'Tissue & Joint Regeneration', es: 'Regeneración Tisular & Articular' },
  cognitive: { en: 'Neuroplasticity & Cognition', es: 'Neuroplasticidad & Cognición' },
  muscle_growth: { en: 'Muscle Mass & Performance', es: 'Masa Muscular & Rendimiento' },
  immune: { en: 'Immunity & Cellular Defense', es: 'Inmunidad & Defensa Celular' },
  sexual_health: { en: 'Hormonal & Sexual Health', es: 'Salud Hormonal & Sexual' },
  sleep: { en: 'Sleep & Circadian Rhythm', es: 'Sueño & Ritmo Circadiano' },
  skin_hair: { en: 'Skin, Hair & Aesthetics', es: 'Piel, Cabello & Estética' },
};
