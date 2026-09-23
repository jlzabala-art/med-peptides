const { adminDb } = require('../src/lib/firebaseAdmin');

const SOMATOTROPIC_METADATA = {
  is_reference_standard: true,
  reference_standard_tier: 'gold',
  reference_label_en: 'Primary Clinical Reference Standard',
  reference_label_es: 'Protocolo de Referencia Clínica',
  reference_order: 4,
  somatotropic_axis_parameters: {
    fasting_window_kinetics: {
      postprandial_window_hours: '2.5 – 3.0 hours strict fasting prior to administration',
      postprandial_window_hours_es: '2,5 – 3,0 horas de ayuno estricto antes de la administración',
      biochemical_mechanism: 'Postprandial glycemic elevations and hyperinsulinemia directly trigger hypothalamic somatostatin (GHIH) release. Somatostatin binds to SSTR2/SSTR5 receptors on pituitary somatotrophs, attenuating GH secretagogue response by > 80%.',
      biochemical_mechanism_es: 'La elevación de glucosa e hiperinsulinemia postprandial activan la liberación de somatostatina hipotalámica (GHIH). La somatostatina bloquea los receptores SSTR2/SSTR5 en somatotropos hipofisarios, reduciendo la respuesta a secretagogos en más del 80%.',
      chronobiology_window: 'Administer strictly at bedtime (22:00 – 23:30) immediately prior to Stage 3 / Slow-Wave Delta sleep.',
      chronobiology_window_es: 'Administrar rigurosamente al acostarse (22:00 – 23:30) inmediatamente antes del sueño profundo de ondas lentas (Fase 3 / Delta).'
    },
    pituitary_selectivity_comparison: [
      {
        compound: 'Ipamorelin (3rd Gen Pentapeptide)',
        compound_es: 'Ipamorelina (Pentapéptido de 3.ª Gen)',
        gh_potency: 'High (Calibrated pulsatile peak ~45–60 min)',
        gh_potency_es: 'Alta (Pico pulsátil calibrado a 45–60 min)',
        prolactin_stimulation: 'None (0.0% Δ vs baseline)',
        prolactin_stimulation_es: 'Nula (0,0% Δ sobre el nivel basal)',
        cortisol_acth_stimulation: 'None (Maintains physiological circadian ACTH)',
        cortisol_acth_stimulation_es: 'Nula (Mantiene ritmo circadiano fisiológico de ACTH)',
        appetite_hyperphagia: 'Zero ghrelin hunger stimulation',
        appetite_hyperphagia_es: 'Cero estimulación de hambre o hiperfagia'
      },
      {
        compound: 'GHRP-6 / GHRP-2 (Historical Benchmarks)',
        compound_es: 'GHRP-6 / GHRP-2 (Compuestos de Referencia Histórica)',
        gh_potency: 'High (Abrupt unphysiological spike)',
        gh_potency_es: 'Alta (Pico abrupto no fisiológico)',
        prolactin_stimulation: 'Moderate to High (+150% to +300% surge; gynecomastia risk)',
        prolactin_stimulation_es: 'Moderada a Alta (+150% a +300%; riesgo de ginecomastia)',
        cortisol_acth_stimulation: 'Marked (+100% to +250% cortisol spike; water retention)',
        cortisol_acth_stimulation_es: 'Marcada (+100% a +250% cortisol; retención hídrica)',
        appetite_hyperphagia: 'Intense ravenous hunger within 20 min',
        appetite_hyperphagia_es: 'Hambre voraz inmediata a los 20 min'
      }
    ],
    cycling_schedule: {
      weekly_cadence: '5 Days Active / 2 Days Washout (e.g. Monday through Friday on, weekends off)',
      weekly_cadence_es: '5 Días Activo / 2 Días Descanso (ej. Lunes a Viernes inyección, fines de semana descanso)',
      cycle_duration: '10 – 12 Weeks per cycle',
      cycle_duration_es: '10 – 12 Semanas por ciclo terapéutico',
      washout_period: '4 Weeks clearance prior to subsequent cycle resumption',
      washout_period_es: '4 Semanas de aclaramiento antes de reiniciar un nuevo ciclo',
      rationale: 'Intermittent 2-day weekly pause and 4-week cycle break prevents pituitary GHRH-R and GHS-R1a receptor internalization, preserving physiological pulsatility and endogenous feedback loops.',
      rationale_es: 'La pausa de 2 días semanales y el descanso de 4 semanas evitan la internalización y desensibilización de los receptores hipofisarios GHRH-R y GHS-R1a, preservando la pulsatilidad fisiológica natural.'
    },
    laboratory_surveillance: {
      primary_target_biomarker: 'Serum Total IGF-1 and Age-Adjusted Z-Score',
      primary_target_biomarker_es: 'IGF-1 Total Sérico y Z-Score ajustado por edad y sexo',
      target_range: 'Upper tertile of physiological age-matched normal (e.g., 200 – 260 ng/mL for age 40–55)',
      target_range_es: 'Tercil superior del rango fisiológico para la edad (ej. 200 – 260 ng/mL en 40–55 años)',
      surveillance_panel: [
        'Serum Total IGF-1 & IGFBP-3 (Baseline & Week 8)',
        'Fasting Blood Glucose (Monthly verification)',
        'Glycated Hemoglobin (HbA1c DBS Bloodo™)',
        'Morning Serum Cortisol (Baseline validation)',
        'Serum Prolactin (Safety screening)'
      ],
      surveillance_panel_es: [
        'IGF-1 Sérico Total & IGFBP-3 (Basal y Semana 8)',
        'Glucemia en Ayunas (Verificación mensual)',
        'Hemoglobina Glicosilada (HbA1c DBS Bloodo™)',
        'Cortisol Matutino (Validación basal)',
        'Prolactina Sérica (Cribado de seguridad)'
      ]
    }
  }
};

const IMMUNE_METADATA = {
  is_reference_standard: true,
  reference_standard_tier: 'gold',
  reference_label_en: 'Primary Clinical Reference Standard',
  reference_label_es: 'Protocolo de Referencia Clínica',
  reference_order: 5,
  immune_modulation_matrix: {
    regulatory_lineage: {
      fda_status: 'FDA Orphan Drug Designation / Approved in >30 Countries as Zadaxin (Zadaxin® lineage)',
      fda_status_es: 'Estatus de Fármaco Huérfano FDA / Aprobado en >30 países como Zadaxin (Línea Zadaxin®)',
      clinical_indications: 'Chronic viral infections (HBV, HCV), severe sepsis, immunosenescence, vaccine adjuvant in immunocompromised hosts, and oncology supportive care.',
      clinical_indications_es: 'Hepatitis virales crónicas (VHB, VHC), sepsis severa, inmunosenescencia, adyuvante vacunal en inmunocomprometidos y soporte oncológico.'
    },
    dual_orchestration_mechanism: {
      effector_activation: 'Directly upregulates Toll-Like Receptors (TLR2, TLR9) on dendritic cells, amplifying CD4+ helper and CD8+ cytotoxic T-lymphocyte maturation and natural killer (NK) lytic efficiency.',
      effector_activation_es: 'Estimula de forma directa los receptores Toll-Like (TLR2, TLR9) en células dendríticas, acelerando la maduración de linfocitos T colaboradores (CD4+), citotóxicos (CD8+) y la actividad lítica de células Natural Killer (NK).',
      tolerance_paradox: 'Simultaneously stimulates Indoleamine 2,3-dioxygenase (IDO) and drives FoxP3+ Regulatory T-cell (T-reg) transcription, dampening excessive autoimmune and hyperinflammatory cascades.',
      tolerance_paradox_es: 'Estimula simultáneamente la indolamina 2,3-dioxigenasa (IDO) y promueve la transcripción de linfocitos T reguladores (T-reg FoxP3+), amortiguando respuestas autoinmunes excesivas y tormentas hiperinflamatorias.'
    },
    stratified_dosing_schemes: [
      {
        tier: 'Tier 1: Clinical Induction / Active Viral or Infectious Stress',
        tier_es: 'Nivel 1: Inducción Clínica / Estrés Infeccioso Activo',
        dosage: '1.6 mg (1,600 mcg) SubQ 2 – 3 times weekly (e.g. Mon / Wed / Fri)',
        dosage_es: '1,6 mg (1.600 mcg) SubQ 2 – 3 veces por semana (ej. Lunes / Miércoles / Viernes)',
        duration: '4 – 8 Weeks continuous',
        duration_es: '4 – 8 Semanas continuas',
        clinical_goal: 'Rapid restoration of naive T-cell repertoire and restoration of depressed CD4/CD8 ratio.',
        clinical_goal_es: 'Restauración acelerada del repertorio de células T vírgenes y normalización del ratio CD4/CD8.'
      },
      {
        tier: 'Tier 2: Seasonal Resilience & Cellular Longevity Maintenance',
        tier_es: 'Nivel 2: Resiliencia Estacional & Mantenimiento de Longevidad Celular',
        dosage: '1.6 mg SubQ once or twice weekly, or 10-day pulsed cycle (1.6 mg daily for 10 days)',
        dosage_es: '1,6 mg SubQ 1 o 2 veces por semana, o ciclo pulsado de 10 días (1,6 mg diario durante 10 días)',
        duration: 'Twice annually during seasonal transitions or travel stress',
        duration_es: 'Dos veces al año durante cambios estacionales o periodos de alta demanda inmunitaria',
        clinical_goal: 'Reversal of thymic involution markers and prevention of senescent immunopause.',
        clinical_goal_es: 'Atenuación de los marcadores de involución tímica y prevención de la inmunopausia senescente.'
      }
    ],
    laboratory_biomarkers: {
      primary_immune_panel: [
        'Flow Cytometry CD4+ / CD8+ T-Cell Ratio (Target 1.5 – 2.5)',
        'Absolute Lymphocyte Count (ALC) in Complete Blood Count',
        'Natural Killer (NK) Cell Quantification (CD16+ / CD56+)',
        'High-Sensitivity C-Reactive Protein (hs-CRP)',
        'Quantitative Immunoglobulins (Total IgG, IgA, IgM)'
      ],
      primary_immune_panel_es: [
        'Citometría de Flujo: Ratio Linfocitos T CD4+ / CD8+ (Objetivo 1,5 – 2,5)',
        'Recuento Absoluto de Linfocitos (ALC) en Hemograma',
        'Cuantificación de Células Natural Killer (NK) (CD16+ / CD56+)',
        'Proteína C Reactiva de Alta Sensibilidad (hs-CRP)',
        'Inmunoglobulinas Cuantitativas (IgG, IgA, IgM totales)'
      ]
    }
  }
};

async function seedBothProtocols() {
  console.log('Seeding CJC-1295 & Ipamorelin (HCFtYVhkbeEnHX4FJ7FR)...');
  await adminDb.collection('protocols').doc('HCFtYVhkbeEnHX4FJ7FR').update({
    ...SOMATOTROPIC_METADATA,
    updatedAt: new Date().toISOString()
  });
  console.log('✓ CJC-1295 & Ipamorelin updated with somatotropic axis clinical metadata.');

  console.log('Seeding Thymosin Alpha-1 (1k0p4FgSekpmUyAJhbsT)...');
  await adminDb.collection('protocols').doc('1k0p4FgSekpmUyAJhbsT').update({
    ...IMMUNE_METADATA,
    updatedAt: new Date().toISOString()
  });
  console.log('✓ Thymosin Alpha-1 updated with immune modulation matrix metadata.');
}

seedBothProtocols().catch(err => {
  console.error('Error seeding protocols:', err);
  process.exit(1);
});
