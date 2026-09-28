 
/**
 * ScientificStandards.js
 * 
 * Centralized registry for scientific data standards across all protocols.
 * Used by audit scripts to ensure unit consistency and terminology accuracy.
 */

export const SCIENTIFIC_STANDARDS = {
  units: {
    PEPTIDES: ['mcg', 'mg', 'IU'],
    SUPPLEMENTS: ['mg', 'g', 'mcg', 'IU', 'capsule', 'tablet'],
  },
  
  dosage_forms: {
    INJECTABLE: 'vial',
    NASAL: 'nasal spray',
    ORAL: 'capsules', // or 'tablets'
    TOPICAL: 'cream',
  },
  
  // Mapping of Product ID to its standard clinical parameters
  registry: {
    // Peptides
    'bpc-157': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'bpc157': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'tb-500': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tb500': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'ipamorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'cjc-1295-no-dac': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'cjc1295': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tesamorelin': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [10] },
    'sermorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'tirzepatide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [15, 30, 60] },
    'semaglutide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'retatrutide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [2, 5, 10, 20] },
    'cagrilintide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 10, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'aod-9604': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'ghk-cu': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 25, 50, 100] },
    'ghkcu': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 25, 50, 100] },
    'mot-c': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'motsc': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'mots-c': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 25] },
    'ss-31': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'ss31': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'elamipretide': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 100, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'nad-plus': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 500, stability_weeks: 4, available_vial_sizes: [500, 1000] },
    'foxo4-dri': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 20, stability_weeks: 4, available_vial_sizes: [10, 20] },
    'epitalon': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 50, 100] },
    'dsip': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5] },
    'thymalin': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [10, 50] },
    'thymosin-alpha-1': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'ta1': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 5000, stability_weeks: 4, available_vial_sizes: [5, 10] },
    'tb-4': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'tb4': { unit: 'mg', route: 'subcutaneous', form: 'vial', threshold: 50, stability_weeks: 4, available_vial_sizes: [2, 5, 10] },
    'kisspeptin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 5] },
    'gonadorelin': { unit: 'mcg', route: 'subcutaneous', form: 'vial', threshold: 2000, stability_weeks: 4, available_vial_sizes: [2, 10] },
    'selank': { unit: 'mcg', route: 'nasal', form: 'nasal spray', threshold: 5000, stability_weeks: 6, available_vial_sizes: [5, 10] },
    'semax': { unit: 'mcg', route: 'nasal', form: 'nasal spray', threshold: 5000, stability_weeks: 6, available_vial_sizes: [5, 10] },
    
    // Oral Peptides (Exceptions)
    'bpc-157-oral': { unit: 'mcg', route: 'oral', form: 'capsules', available_vial_sizes: [0.250] }, // 250mcg per tablet
    
    // Supplements (Common)
    'vitamin-d3': { unit: 'IU', route: 'oral', form: 'capsules' },
    'magnesium-threonate': { unit: 'mg', route: 'oral', form: 'capsules' },
    'berberine': { unit: 'mg', route: 'oral', form: 'capsules' },
    'omega-3': { unit: 'mg', route: 'oral', form: 'capsules' },
    'nac': { unit: 'mg', route: 'oral', form: 'capsules' },
    'coq10': { unit: 'mg', route: 'oral', form: 'capsules' },
  }
};

/**
 * Phase-by-phase vial purchasing strategy and clinical ergonomics registry.
 * Prevents needle overflow (> 100 UI / > 0.5 mL) and prevents purchasing inappropriate vial sizes.
 */
export const PHASE_VIAL_STRATEGIES = {
  tirzepatide: {
    name: 'Tirzepatide',
    indication: 'GLP-1 / GIP Dual Agonist Titration',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Fase 1: Iniciación (Mes 1)',
        targetDose: '2.5 mg / semana',
        doseMg: 2.5,
        recommendedVial: '10 mg o 15 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: 'Viales de 30 mg o 60 mg (Riesgo de degradación antes de consumir)',
        rationale: 'Un vial de 10 mg dura exactamente 4 semanas a 2.5 mg. Diluido con 2 mL BAC rinde 50 UI/inyección.',
        whyAvoid: 'Comprar 60 mg para 2.5 mg implicaría usar el mismo vial durante 6 meses, violando el límite de 28 días de esterilidad (USP <797>).'
      },
      {
        phaseId: 'escalation_step_1',
        name: 'Fase 2: Escalamiento 1 (Mes 2)',
        targetDose: '5 mg / semana',
        doseMg: 5.0,
        recommendedVial: '10 mg o 20 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 1.0,
        resultConcentration: '10 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: 'Viales de 5 mg (duran solo 1 semana)',
        rationale: 'Vial de 10 mg con 1.0 mL BAC permite inyecciones de 50 UI (2 semanas por vial) o vial de 20 mg (4 semanas por vial).',
        whyAvoid: 'Viales de 5 mg obligan a comprar 4 viales al mes y múltiples punciones.'
      },
      {
        phaseId: 'escalation_step_2',
        name: 'Fase 3: Escalamiento 2 (Mes 3)',
        targetDose: '7.5 mg / semana',
        doseMg: 7.5,
        recommendedVial: '30 mg',
        recommendedVialMg: 30,
        recommendedBacMl: 2.0,
        resultConcentration: '15 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: 'Viales de 10 mg (Rinde solo 1.3 dosis, genera desecho de producto)',
        rationale: 'Vial de 30 mg con 2 mL BAC rinde exactamente 4 dosis semanales de 7.5 mg a 50 UI (1 mes exacto de tratamiento).',
        whyAvoid: 'Con 10 mg sobra 2.5 mg por vial que suele desecharse o requiere mezclar viales.'
      },
      {
        phaseId: 'escalation_step_3',
        name: 'Fase 4: Escalamiento 3 (Mes 4)',
        targetDose: '10 mg / semana',
        doseMg: 10.0,
        recommendedVial: '30 mg o 40 mg',
        recommendedVialMg: 30,
        recommendedBacMl: 1.5,
        resultConcentration: '20 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: 'Viales de 10 mg (1 vial = 1 sola dosis, coste y desperdicio elevado)',
        rationale: 'Vial de 30 mg o 40 mg permite suministro continuo mensual con 50 UI por inyección.',
        whyAvoid: 'Un vial de 10 mg por semana obliga a comprar 4 kits y manipular 4 viales distintos al mes.'
      },
      {
        phaseId: 'maintenance',
        name: 'Fase 5: Mantenimiento Máximo (Mes 5+)',
        targetDose: '15 mg / semana',
        doseMg: 15.0,
        recommendedVial: '60 mg (1 mes completo) o 30 mg (2 semanas)',
        recommendedVialMg: 60,
        recommendedBacMl: 2.0,
        resultConcentration: '30 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '❌ PROHIBIDO vial de 10 mg (Desborda a 150 UI = 1.5 mL, exige 2 pinchazos por semana)',
        rationale: 'Vial de 60 mg con 2.0 mL BAC proporciona exactamente 4 semanas completas a 15 mg/semana en 50 UI con 1 solo pinchazo indoloro.',
        whyAvoid: 'Un vial de 10 mg no alcanza para 1 dosis (0.6 dosis), obliga a mezclar dos viales y dar 2 pinchazos de 75 UI semanales.'
      }
    ]
  },
  semaglutide: {
    name: 'Semaglutide',
    indication: 'GLP-1 Receptor Agonist Titration',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Fase 1: Iniciación (Mes 1)',
        targetDose: '0.25 mg / semana',
        doseMg: 0.25,
        recommendedVial: '2 mg o 3 mg',
        recommendedVialMg: 2,
        recommendedBacMl: 2.0,
        resultConcentration: '1 mg / mL',
        resultUnits: 25,
        volumeMl: 0.25,
        avoidVials: 'Viales de 10 mg (Se degrada antes de terminar las semanas recomendadas)',
        rationale: 'Vial de 2 mg con 2 mL BAC rinde para las primeras 4 semanas a 0.25 mg + 2 semanas a 0.5 mg sin caducar.',
        whyAvoid: 'Un vial de 10 mg a 0.25 mg tardaría 40 semanas en gastarse, sobrepasando los 28 días de esterilidad (USP <797>).'
      },
      {
        phaseId: 'escalation_step_1',
        name: 'Fase 2: Escalamiento 1 (Mes 2)',
        targetDose: '0.50 mg / semana',
        doseMg: 0.5,
        recommendedVial: '2 mg o 5 mg',
        recommendedVialMg: 5,
        recommendedBacMl: 2.0,
        resultConcentration: '2.5 mg / mL',
        resultUnits: 20,
        volumeMl: 0.2,
        avoidVials: 'Viales de 10 mg',
        rationale: 'Vial de 5 mg con 2 mL BAC rinde 10 dosis de 0.5 mg (20 UI por inyección).',
        whyAvoid: 'Viales gigantes pierden estabilidad biológica.'
      },
      {
        phaseId: 'escalation_step_2',
        name: 'Fase 3: Escalamiento 2 (Mes 3)',
        targetDose: '1.0 mg / semana',
        doseMg: 1.0,
        recommendedVial: '5 mg',
        recommendedVialMg: 5,
        recommendedBacMl: 2.0,
        resultConcentration: '2.5 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: 'Viales de 2 mg (duran solo 2 semanas)',
        rationale: 'Vial de 5 mg = 5 dosis de 1.0 mg (1 mes + 1 semana) a 40 UI exactas.',
        whyAvoid: 'Viales de 2 mg aumentan los costes de envío y packaging innecesariamente.'
      },
      {
        phaseId: 'maintenance',
        name: 'Fase 4 & 5: Dosis Objetivo / Mantenimiento (1.7 - 2.4 mg)',
        targetDose: '2.4 mg / semana',
        doseMg: 2.4,
        recommendedVial: '10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 48,
        volumeMl: 0.48,
        avoidVials: '❌ NO comprar viales de 2 mg o 3 mg (duran menos de 1 dosis)',
        rationale: 'Vial de 10 mg con 2.0 mL BAC rinde exactamente 4 dosis completas de 2.4 mg (48 UI = 0.48 mL en 1 solo pinchazo).',
        whyAvoid: 'Un vial de 2 mg ni siquiera cubre 1 inyección de 2.4 mg.'
      }
    ]
  },
  retatrutide: {
    name: 'Retatrutide',
    indication: 'GLP-1 / GIP / GCG Tri-Agonist Titration',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Fase 1: Iniciación (Semanas 1-4)',
        targetDose: '2.0 mg / semana',
        doseMg: 2.0,
        recommendedVial: '5 mg o 10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: 'Viales de 30 mg o 40 mg',
        rationale: 'Vial de 10 mg rinde 5 dosis de 2.0 mg (1 mes de iniciación) a 40 UI.',
        whyAvoid: 'Sobredimensionar el vial en fase 1 provoca degradación.'
      },
      {
        phaseId: 'escalation_step_1',
        name: 'Fase 2: Escalamiento (Semanas 5-8)',
        targetDose: '4.0 mg / semana',
        doseMg: 4.0,
        recommendedVial: '10 mg o 20 mg',
        recommendedVialMg: 20,
        recommendedBacMl: 2.0,
        resultConcentration: '10 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: 'Viales de 5 mg (solo duran 1 semana)',
        rationale: 'Vial de 20 mg cubre 5 semanas de escalamiento a 40 UI por inyección.',
        whyAvoid: 'Viales de 5 mg generan costes desproporcionados.'
      },
      {
        phaseId: 'escalation_step_2',
        name: 'Fase 3: Aceleración Metabólica (Semanas 9-12)',
        targetDose: '8.0 mg / semana',
        doseMg: 8.0,
        recommendedVial: '30 mg o 40 mg',
        recommendedVialMg: 40,
        recommendedBacMl: 2.0,
        resultConcentration: '20 mg / mL',
        resultUnits: 40,
        volumeMl: 0.4,
        avoidVials: 'Viales de 10 mg (Rinde solo 1.2 dosis)',
        rationale: 'Vial de 40 mg rinde 5 dosis de 8 mg a 40 UI con concentración óptima.',
        whyAvoid: 'Con 10 mg sobran 2 mg inutilizables o se requieren 2 viales.'
      },
      {
        phaseId: 'maintenance',
        name: 'Fase 4: Máxima Intensidad / Mantenimiento (Semanas 13+)',
        targetDose: '12.0 mg / semana',
        doseMg: 12.0,
        recommendedVial: '60 mg o 40 mg',
        recommendedVialMg: 60,
        recommendedBacMl: 2.5,
        resultConcentration: '24 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '❌ PROHIBIDO vial de 10 mg o 20 mg (Obliga a inyectar más de 120 UI o múltiples viales)',
        rationale: 'Vial de 60 mg con 2.5 mL BAC permite 5 dosis de 12 mg a 50 UI (1 solo pinchazo de 0.5 mL).',
        whyAvoid: 'Un vial de 10 mg no contiene la dosis de una sola semana.'
      }
    ]
  },
  'mots-c': {
    name: 'MOTS-c',
    indication: 'Mitochondrial Bioenergetics & Lipolysis',
    phases: [
      {
        phaseId: 'initiation',
        name: 'Fase 1: Activación Mitocondrial',
        targetDose: '5 mg (2x a 3x por semana)',
        doseMg: 5.0,
        recommendedVial: '10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 100,
        volumeMl: 1.0,
        avoidVials: 'Viales de 40 mg si la pauta es espaciada',
        rationale: 'Vial de 10 mg permite 2 aplicaciones exactas de 5 mg en la misma semana.',
        whyAvoid: 'MOTS-c es sensible a la oxidación; viales de 10 mg minimizan tiempo reconstituido.'
      },
      {
        phaseId: 'escalation_maintenance',
        name: 'Fase 2: Intensificación & Pauta de Carga',
        targetDose: '10 mg por administración',
        doseMg: 10.0,
        recommendedVial: '20 mg o 25 mg',
        recommendedVialMg: 20,
        recommendedBacMl: 1.0,
        resultConcentration: '20 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: '❌ NO comprar viales de 5 mg (Obliga a reconstituir 2 viales para una sola inyección)',
        rationale: 'Vial de 20 mg diluido con 1.0 mL BAC permite dosis de 10 mg en solo 50 UI (0.50 mL).',
        whyAvoid: 'Con viales de 5 mg, el paciente debe pinchar dos viales distintos para cada inyección.'
      }
    ]
  },
  'tb-500': {
    name: 'TB-500 (Thymosin Beta-4)',
    indication: 'Tissue Repair & Angiogenesis',
    phases: [
      {
        phaseId: 'loading',
        name: 'Fase de Carga (Semanas 1-4)',
        targetDose: '2.5 mg - 5.0 mg (2x por semana = 5-10 mg/sem)',
        doseMg: 2.5,
        recommendedVial: '10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.0,
        resultConcentration: '5 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: 'Viales de 2 mg (No alcanzan para 1 sola dosis de carga de 2.5 mg)',
        rationale: 'Vial de 10 mg con 2.0 mL BAC rinde exactamente 4 inyecciones de 2.5 mg a 50 UI (2 semanas completas de carga).',
        whyAvoid: 'Un vial de 2 mg deja al paciente con déficit de 0.5 mg en cada inyección.'
      },
      {
        phaseId: 'maintenance',
        name: 'Fase de Mantenimiento (Semanas 5+)',
        targetDose: '2.0 mg (1x por semana)',
        doseMg: 2.0,
        recommendedVial: '5 mg o 10 mg',
        recommendedVialMg: 10,
        recommendedBacMl: 2.5,
        resultConcentration: '4 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: 'Viales de 2 mg si se busca eficiencia económica',
        rationale: 'Vial de 10 mg rinde 5 semanas de mantenimiento con dosis exactas de 50 UI.',
        whyAvoid: 'Comprar 1 vial de 2 mg cada semana multiplica costes de packaging.'
      }
    ]
  },
  'ghk-cu': {
    name: 'GHK-Cu',
    indication: 'Remodelación de Tejido, Colágeno y Cicatrización',
    phases: [
      {
        phaseId: 'priming',
        name: 'Fase 1: Preparación Dérmica / Microdosis',
        targetDose: '2 mg / día (5 días/semana)',
        doseMg: 2.0,
        recommendedVial: '50 mg',
        recommendedVialMg: 50,
        recommendedBacMl: 2.5,
        resultConcentration: '20 mg / mL',
        resultUnits: 10,
        volumeMl: 0.1,
        avoidVials: 'Viales de 10 mg (Duran solo 5 días)',
        rationale: 'Vial de 50 mg rinde 25 dosis (5 semanas de lunes a viernes).',
        whyAvoid: 'Viales de 10 mg se agotan en 1 semana laboral.'
      },
      {
        phaseId: 'remodeling',
        name: 'Fase 2: Remodelación Activa & Consolidación',
        targetDose: '5 mg / día (5 días/semana = 25 mg/sem)',
        doseMg: 5.0,
        recommendedVial: '100 mg (o 50 mg)',
        recommendedVialMg: 100,
        recommendedBacMl: 5.0,
        resultConcentration: '20 mg / mL',
        resultUnits: 25,
        volumeMl: 0.25,
        avoidVials: '❌ NO comprar viales de 10 mg o 20 mg (se acaban en 2-4 días)',
        rationale: 'A 25 mg/semana, un vial de 100 mg cubre exactamente 1 mes completo (4 semanas de remodelación).',
        whyAvoid: 'Exigiría comprar 10 viales de 10 mg al mes.'
      }
    ]
  },
  'elamipretide': {
    name: 'Elamipretide (SS-31)',
    indication: 'Mitochondrial Cardiorenal & Cellular Repair',
    phases: [
      {
        phaseId: 'therapeutic',
        name: 'Fase Terapéutica Diaria',
        targetDose: '20 mg a 40 mg diarios',
        doseMg: 40.0,
        recommendedVial: '50 mg o 100 mg',
        recommendedVialMg: 100,
        recommendedBacMl: 2.5,
        resultConcentration: '40 mg / mL',
        resultUnits: 100,
        volumeMl: 1.0,
        avoidVials: '❌ TOTALMENTE PROHIBIDO viales de 10 mg (Un vial no alcanza ni para medio día)',
        rationale: 'Para protocolos de 40 mg diarios, los viales de 100 mg proporcionan 2.5 días por vial con concentraciones de 40 mg/mL.',
        whyAvoid: 'Con viales de 10 mg se necesitarían 4 viales DIARIOS (120 viales al mes).'
      }
    ]
  },
  'nad-plus': {
    name: 'NAD+ (Nicotinamida Adenina Dinucleótido)',
    indication: 'Cellular Redox & Sirtuin Activation',
    phases: [
      {
        phaseId: 'subcutaneous_titration',
        name: 'Fase 1: Titulación Subcutánea',
        targetDose: '50 mg - 100 mg (2x a 3x por semana)',
        doseMg: 100.0,
        recommendedVial: '500 mg',
        recommendedVialMg: 500,
        recommendedBacMl: 2.5,
        resultConcentration: '200 mg / mL',
        resultUnits: 50,
        volumeMl: 0.5,
        avoidVials: 'Viales de 100 mg o concentraciones bajas que requieran > 1 mL subcutáneo',
        rationale: 'El NAD+ arde si se inyecta en volúmenes altos. A 200 mg/mL, 100 mg son solo 50 UI (0.50 mL).',
        whyAvoid: 'Inyectar más de 0.5 mL de NAD+ causa ardor local agudo.'
      },
      {
        phaseId: 'high_dose_protocol',
        name: 'Fase 2: Protocolo Intensivo de Optimización',
        targetDose: '150 mg - 250 mg',
        doseMg: 200.0,
        recommendedVial: '1000 mg',
        recommendedVialMg: 1000,
        recommendedBacMl: 5.0,
        resultConcentration: '200 mg / mL',
        resultUnits: 100,
        volumeMl: 1.0,
        avoidVials: 'Viales de 500 mg para administración bisemanal',
        rationale: 'Vial de 1000 mg cubre 5 dosis de 200 mg.',
        whyAvoid: 'Los viales pequeños obligan a frecuentes reconstituciones y mayor degradación.'
      }
    ]
  }
};

/**
 * Resolves the clinical phase vial strategy for a given peptide and target dose.
 */
export function getPhaseVialStrategy(peptideOrName, targetDoseMg = null) {
  if (!peptideOrName) return null;
  const p = String(peptideOrName).toLowerCase();
  
  let key = null;
  if (p.includes('tirzepatide')) key = 'tirzepatide';
  else if (p.includes('semaglutide') || p.includes('cagrilintide')) key = 'semaglutide';
  else if (p.includes('retatrutide')) key = 'retatrutide';
  else if (p.includes('mots')) key = 'mots-c';
  else if (p.includes('tb-500') || p.includes('tb500') || p.includes('thymosin beta')) key = 'tb-500';
  else if (p.includes('ghk')) key = 'ghk-cu';
  else if (p.includes('elamipretide') || p.includes('ss-31') || p.includes('ss31')) key = 'elamipretide';
  else if (p.includes('nad')) key = 'nad-plus';

  if (!key || !PHASE_VIAL_STRATEGIES[key]) return null;

  const strategy = PHASE_VIAL_STRATEGIES[key];
  if (targetDoseMg === null || targetDoseMg === undefined) return strategy;

  const d = parseFloat(targetDoseMg) || 0;
  // Find best matching phase in strategy
  const match = strategy.phases.find(ph => Math.abs(ph.doseMg - d) <= 0.05) ||
                strategy.phases.slice().reverse().find(ph => d >= ph.doseMg) ||
                strategy.phases[0];

  return {
    strategy,
    matchedPhase: match
  };
}

/**
 * Normalizes units and terminology based on the registry.
 * @param {string} productId 
 * @param {object} currentData 
 * @returns {object} The corrected/standardized data
 */
export function standardizeData(productId, currentData = {}) {
  const cleanId = productId.toLowerCase().replace('prd_', '');
  const standard = SCIENTIFIC_STANDARDS.registry[cleanId];
  if (!standard) return currentData;
  
  const updated = { ...currentData };
  
  // Apply standard unit if missing or mismatched
  if (standard.unit && updated.dose_unit !== standard.unit) {
    updated.dose_unit = standard.unit;
  }
  
  // Apply standard form based on route
  if (standard.form) {
    updated.dosage_form = standard.form;
  }
  
  if (standard.route) {
    updated.route = standard.route;
  }
  
  // Inject scientific metadata
  updated.stability_weeks = standard.stability_weeks || 4;
  updated.available_vial_sizes = standard.available_vial_sizes || [];
  
  return updated;
}

