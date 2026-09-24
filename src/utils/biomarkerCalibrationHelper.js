/**
 * biomarkerCalibrationHelper.js
 * 
 * Precision Biomarker Diagnostic Integration Helper
 * Stratifies clinical biomarkers (Testosterone, Cortisol, HbA1c, Omega-3, Vitamin D, NAD+)
 * into personalized therapeutic tiers and action plans.
 */

export function extractBiomarkerCalibrationFromUrl(slug, protocolCategory) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const nadLevel = params.get('nad_level');
  const testoLevel = params.get('testosterone_level') || params.get('testo_level');
  const cortisolLevel = params.get('cortisol_level');
  const hba1cLevel = params.get('hba1c_level');
  const omegaRatio = params.get('omega_ratio') || params.get('omega_index');
  const vitdLevel = params.get('vitd_level') || params.get('vit_d_level');
  const baseline = params.get('baseline');
  const tier = params.get('tier');
  const modality = params.get('modality');
  const retest = params.get('retest');

  if (testoLevel || (baseline && (slug?.includes('hormon') || slug?.includes('hpta') || protocolCategory === 'Hormonal Support'))) {
    return {
      type: 'testosterone',
      level: testoLevel ? parseFloat(testoLevel) : (baseline === 'optimal' ? 22 : 8.5),
      unit: 'nmol/L',
      baseline: baseline || 'deficient',
      tier: tier || 'critical',
      modality: modality || 'secretagogues',
      retest: retest || '8w'
    };
  }

  if (cortisolLevel || (baseline && (slug?.includes('sleep') || slug?.includes('cortisol') || slug?.includes('stress')))) {
    return {
      type: 'cortisol',
      level: cortisolLevel ? parseFloat(cortisolLevel) : (baseline === 'optimal' ? 380 : 110),
      unit: 'nmol/L',
      baseline: baseline || 'exhaustion',
      tier: tier || 'critical',
      modality: modality || 'neurorestoration',
      retest: retest || '8w'
    };
  }

  if (hba1cLevel || (baseline && (slug?.includes('metabolic') || slug?.includes('weight') || slug?.includes('glp') || protocolCategory === 'Weight Management' || protocolCategory === 'Metabolic Health'))) {
    return {
      type: 'hba1c',
      level: hba1cLevel ? parseFloat(hba1cLevel) : (baseline === 'optimal' ? 5.2 : 6.2),
      unit: '%',
      baseline: baseline || 'elevated',
      tier: tier || 'warning',
      modality: modality || 'incretin',
      retest: retest || '12w'
    };
  }

  if (omegaRatio || (baseline && (slug?.includes('injury') || slug?.includes('recovery') || slug?.includes('repair') || slug?.includes('omega')))) {
    return {
      type: 'omega',
      level: omegaRatio ? parseFloat(omegaRatio) : (baseline === 'optimal' ? 9.2 : 3.8),
      unit: '%',
      baseline: baseline || 'suboptimal',
      tier: tier || 'warning',
      modality: modality || 'repletion',
      retest: retest || '12w'
    };
  }

  if (vitdLevel || (baseline && (slug?.includes('immune') || slug?.includes('defense') || protocolCategory === 'Immune & Inflammation'))) {
    return {
      type: 'vitd',
      level: vitdLevel ? parseFloat(vitdLevel) : (baseline === 'optimal' ? 58 : 18),
      unit: 'ng/mL',
      baseline: baseline || 'deficient',
      tier: tier || 'critical',
      modality: modality || 'repletion',
      retest: retest || '10w'
    };
  }

  if (nadLevel || (baseline && (slug?.includes('nad') || slug?.includes('longev') || protocolCategory === 'Longevity')) || baseline) {
    return {
      type: 'nad',
      level: nadLevel ? parseFloat(nadLevel) : (baseline === 'optimal' ? 40.0 : 18.0),
      nadLevel: nadLevel ? parseFloat(nadLevel) : (baseline === 'optimal' ? 40.0 : 18.0),
      unit: 'µmol/L',
      baseline: baseline || 'severe',
      tier: tier || 'critical',
      modality: modality || 'intravenous',
      retest: retest || '4w'
    };
  }

  return null;
}

export function computeCalibrationDisplay(biomarkerCalibration, lang = 'en') {
  if (!biomarkerCalibration) return null;
  const isEs = lang === 'es';
  const bType = biomarkerCalibration.type || 'nad';
  const lvl = biomarkerCalibration.level;
  const baseline = biomarkerCalibration.baseline;

  // 1. TESTOSTERONE
  if (bType === 'testosterone') {
    let tierColor = '#dc2626';
    let tierBg = '#fef2f2';
    let tierBadgeText = isEs ? 'Déficit Androgénico · Alto Impacto' : 'Androgen Deficiency · Critical Priority';
    let tierSubText = isEs ? 'Hipogonadismo funcional / fallo de pulsatilidad GnRH' : 'Functional hypogonadism / impaired GnRH pulsatility';
    let prescribedRouteText = isEs ? 'Secretagogos HPTA (Kisspeptina-10 + Testagen)' : 'HPTA Secretagogues (Kisspeptin-10 + Testagen)';
    let prescribedRouteSub = isEs ? 'Reactivación endógena sin atrofia testicular' : 'Endogenous stimulation preserving testicular volume';
    let deltaTargetText = isEs ? `Déficit de -${Math.max(0, (20 - lvl)).toFixed(1)} nmol/L hacia diana (≥ 20 nmol/L)` : `Deficit of -${Math.max(0, (20 - lvl)).toFixed(1)} nmol/L to target (≥ 20 nmol/L)`;
    let retestScheduleText = isEs ? 'Semana 8 (En Tratamiento)' : 'Week 8 (On-Treatment)';
    let retestScheduleSub = isEs ? 'Control capilar DBS sin suspender pauta' : 'DBS capillary test without cessation';
    let targetRangeText = '18.0 – 28.0 nmol/L (520 – 800 ng/dL)';
    let titleText = isEs
      ? `Estratificación Terapéutica para Testosterona Total: ${lvl} nmol/L`
      : `Therapeutic Stratification for Total Testosterone: ${lvl} nmol/L`;
    let aiQueryText = isEs
      ? `Tengo un nivel de Testosterona de ${lvl} nmol/L (${tierBadgeText}). ¿Cómo reactiva la Kisspeptina-10 la pulsatilidad del eje HPTA sin inducir atrofia testicular en este protocolo?`
      : `My total testosterone level is ${lvl} nmol/L (${tierBadgeText}). How does Kisspeptin-10 stimulate HPTA pulsatility without testicular atrophy in this protocol?`;

    if (baseline === 'suboptimal' || (lvl >= 10 && lvl < 15)) {
      tierColor = '#d97706';
      tierBg = '#fffbeb';
      tierBadgeText = isEs ? 'Subóptimo · Margen de Optimización' : 'Borderline Suboptimal · Room for Optimization';
      tierSubText = isEs ? 'Declive androgénico y fatiga metabólica' : 'Androgenic decline & metabolic fatigue';
      prescribedRouteText = isEs ? 'Microdosificación de Secretagogos y Biorregulación' : 'Secretagogue Micro-dosing & Bioregulation';
      prescribedRouteSub = isEs ? 'Kisspeptina-10 100 mcg 2x/semana + DIM/Zinc' : 'Kisspeptin-10 100 mcg 2x/wk + DIM/Zinc';
      deltaTargetText = isEs ? `Déficit de -${Math.max(0, (20 - lvl)).toFixed(1)} nmol/L hacia diana` : `Deficit of -${Math.max(0, (20 - lvl)).toFixed(1)} nmol/L to target`;
    } else if (baseline === 'optimal' || (lvl >= 15 && lvl <= 28)) {
      tierColor = '#0d9488';
      tierBg = '#f0fdfa';
      tierBadgeText = isEs ? 'Rango Óptimo · Vitalidad Fisiológica' : 'Optimal Target · Physiological Vitality';
      tierSubText = isEs ? 'Homeostasis endocrina y masa magra' : 'Endocrine homeostasis & lean mass retention';
      prescribedRouteText = isEs ? 'Mantenimiento y Control de Aromatasa' : 'Maintenance & Aromatase Surveillance';
      prescribedRouteSub = isEs ? 'Pulsos circadianos y vigilancia de estradiol' : 'Circadian pulses & estradiol monitoring';
      deltaTargetText = isEs ? 'Nivel en zona diana androgénica (≥ 18 nmol/L)' : 'Level in target androgenic zone (≥ 18 nmol/L)';
      retestScheduleText = isEs ? '6 Meses (Vigilancia Semestral)' : '6 Months (Biannual Check)';
    } else if (baseline === 'peak' || lvl > 28) {
      tierColor = '#2563eb';
      tierBg = '#eff6ff';
      tierBadgeText = isEs ? 'Pico Suprafisiológico · Meseta' : 'Upper Physiological · Peak';
      tierSubText = isEs ? 'Respuesta máxima; vigilar hematocrito y E2' : 'Peak response; monitor hematocrit and E2';
      prescribedRouteText = isEs ? 'Ciclado / Washout de Secretagogos' : 'Secretagogue Cycling / Washout Window';
      prescribedRouteSub = isEs ? 'Ventana de descanso de 3–4 semanas' : '3-4 week physiological rest window';
      deltaTargetText = isEs ? 'Umbral superior alcanzado con éxito' : 'Upper target successfully achieved';
    }

    return {
      bType,
      measuredValStr: `${lvl} nmol/L`,
      targetRangeText,
      titleText,
      aiQueryText,
      tierColor,
      tierBg,
      tierBadgeText,
      tierSubText,
      prescribedRouteText,
      prescribedRouteSub,
      deltaTargetText,
      retestScheduleText,
      retestScheduleSub
    };
  }

  // 2. CORTISOL
  if (bType === 'cortisol') {
    const isExhaustion = baseline === 'exhaustion' || lvl < 150;
    const isHyper = baseline === 'hypercortisol' || lvl > 500;
    const tierColor = isExhaustion ? '#8b5cf6' : (isHyper ? '#dc2626' : '#0d9488');
    const tierBg = isExhaustion ? '#f5f3ff' : (isHyper ? '#fef2f2' : '#f0fdfa');
    const tierBadgeText = isExhaustion 
      ? (isEs ? 'Agotamiento Suprarrenal · Curva Aplanada' : 'Adrenal Burnout · Blunted CAR Curve')
      : (isHyper ? (isEs ? 'Hipercortisolemia · Estrés Crónico' : 'Hypercortisolemia · Chronic Stress') : (isEs ? 'Ritmo Circadiano Equilibrado' : 'Balanced Circadian Rhythm'));

    return {
      bType,
      measuredValStr: `${lvl} nmol/L`,
      targetRangeText: 'CAR: 300 – 500 nmol/L · PM: < 150 nmol/L',
      titleText: isEs ? `Estratificación Circadiana para Cortisol Diurno: ${lvl} nmol/L` : `Circadian Stratification for Diurnal Cortisol: ${lvl} nmol/L`,
      aiQueryText: isEs ? `Mi nivel de cortisol diurno es ${lvl} nmol/L (${tierBadgeText}). ¿Cómo modula este protocolo la curva circadiana y el eje HPA?` : `My diurnal cortisol is ${lvl} nmol/L (${tierBadgeText}). How does this protocol modulate circadian rhythm and HPA axis?`,
      tierColor,
      tierBg,
      tierBadgeText,
      tierSubText: isEs ? 'Carga alostática y modulación del eje HPA' : 'Allostatic load and HPA neuro-modulation',
      prescribedRouteText: isEs ? 'Neuropéptidos Biorreguladores (Selank + DSIP)' : 'Bioregulatory Neuropeptides (Selank + DSIP)',
      prescribedRouteSub: isEs ? 'Armonización del ciclo vigilia-sueño y resiliencia' : 'Sleep-wake harmonization & stress resilience',
      deltaTargetText: isEs ? 'Optimización de la curva matutina CAR' : 'Optimization of awakening CAR slope',
      retestScheduleText: isEs ? 'Semana 8 (En Tratamiento)' : 'Week 8 (On-Treatment)',
      retestScheduleSub: isEs ? 'Control capilar matutino + vespertino' : 'Morning + Evening paired DBS check'
    };
  }

  // 3. HBA1C
  if (bType === 'hba1c') {
    let tierColor = '#dc2626';
    let tierBg = '#fef2f2';
    let tierBadgeText = isEs ? 'Glucemia Elevada · Alerta Diabética' : 'Elevated Glycemia · Clinical Action Required';
    let tierSubText = isEs ? 'Resistencia insulínica crónica y riesgo de glicación AGEs' : 'Chronic insulin resistance & advanced glycation risk';
    let prescribedRouteText = isEs ? 'Incretinas Duales GLP-1/GIP + Sensibilizadores' : 'Dual GLP-1/GIP Incretins + Insulin Sensitizers';
    let prescribedRouteSub = isEs ? 'Titulación semanal progresiva para control glucémico' : 'Weekly titration schedule for glycemic control';
    let deltaTargetText = isEs ? `Exceso de +${Math.max(0, (lvl - 5.4)).toFixed(1)}% sobre diana (≤ 5.4%)` : `Excess of +${Math.max(0, (lvl - 5.4)).toFixed(1)}% above target (≤ 5.4%)`;
    let retestScheduleText = isEs ? '12 Semanas (Ciclo Recambio Eritrocitario)' : '12 Weeks (Erythrocyte Turnover Cycle)';
    let retestScheduleSub = isEs ? 'Control capilar DBS de hemoglobina glicosilada' : 'Capillary DBS HbA1c verification';
    let targetRangeText = '< 5.4% (< 36 mmol/mol)';
    let titleText = isEs
      ? `Estratificación Terapéutica para Hemoglobina Glicosilada (HbA1c): ${lvl}%`
      : `Therapeutic Stratification for Glycated Hemoglobin (HbA1c): ${lvl}%`;
    let aiQueryText = isEs
      ? `Tengo una HbA1c de ${lvl}% (${tierBadgeText}). ¿Cómo optimiza este protocolo incretínico la sensibilidad a la insulina y la recomposición metabólica?`
      : `My HbA1c level is ${lvl}% (${tierBadgeText}). How does this incretin protocol optimize insulin sensitivity and metabolic recomposition?`;

    if (baseline === 'optimal' || lvl < 5.4) {
      tierColor = '#0d9488';
      tierBg = '#f0fdfa';
      tierBadgeText = isEs ? 'Sensibilidad Insulínica Óptima' : 'Optimal Insulin Sensitivity';
      tierSubText = isEs ? 'Excelente homeostasis glucémica y protección cardiovascular' : 'Superior glycemic homeostasis & vascular resilience';
      prescribedRouteText = isEs ? 'Mantenimiento Metabólico y Flexibilidad' : 'Metabolic Maintenance & Flexibility';
      prescribedRouteSub = isEs ? 'Microdosificación o soporte con péptidos mitocondriales' : 'Micro-dosing or mitochondrial peptide support';
      deltaTargetText = isEs ? 'Nivel en zona diana óptima (< 5.4%)' : 'Level in optimal target zone (< 5.4%)';
      retestScheduleText = isEs ? '6 Meses (Vigilancia Semestral)' : '6 Months (Biannual Check)';
    } else if (baseline === 'normal' || (lvl >= 5.4 && lvl <= 5.6)) {
      tierColor = '#16a34a';
      tierBg = '#f0fdf4';
      tierBadgeText = isEs ? 'Rango Fisiológico Normal' : 'Standard Normoglycemic Range';
      tierSubText = isEs ? 'Metabolismo glucídico compensado' : 'Compensated glucose metabolism';
      prescribedRouteText = isEs ? 'Optimización del Estilo de Vida y Longevidad' : 'Lifestyle & Longevity Optimization';
      prescribedRouteSub = isEs ? 'Apoyo nutricional y ejercicio de resistencia' : 'Nutritional support & resistance training';
      deltaTargetText = isEs ? 'Nivel dentro de límites clínicos estándar' : 'Level within standard clinical boundaries';
      retestScheduleText = isEs ? '6 Meses (Control Rutinario)' : '6 Months (Routine Check)';
    } else if (baseline === 'warning' || (lvl >= 5.7 && lvl < 6.5)) {
      tierColor = '#d97706';
      tierBg = '#fffbeb';
      tierBadgeText = isEs ? 'Prediabetes · Resistencia Insulínica' : 'Prediabetes · Insulin Resistance Window';
      tierSubText = isEs ? 'Ventana clave para intervención metabólica preventiva' : 'Key therapeutic window for preventative intervention';
      prescribedRouteText = isEs ? 'Titulación Incretínica Temprana (Tirzepatida/Semaglutida)' : 'Early Incretin Titration (Tirzepatide/Semaglutide)';
      prescribedRouteSub = isEs ? 'Dosis inicial baja de sensibilización pancreática' : 'Low starting dose for pancreatic resensitization';
      deltaTargetText = isEs ? `Exceso de +${Math.max(0, (lvl - 5.4)).toFixed(1)}% sobre diana` : `Excess of +${Math.max(0, (lvl - 5.4)).toFixed(1)}% above target`;
    }

    return {
      bType,
      measuredValStr: `${lvl}%`,
      targetRangeText,
      titleText,
      aiQueryText,
      tierColor,
      tierBg,
      tierBadgeText,
      tierSubText,
      prescribedRouteText,
      prescribedRouteSub,
      deltaTargetText,
      retestScheduleText,
      retestScheduleSub
    };
  }

  // 4. OMEGA-3
  if (bType === 'omega') {
    let tierColor = '#dc2626';
    let tierBg = '#fef2f2';
    let tierBadgeText = isEs ? 'Alto Riesgo Inflamatorio · Rigidez de Membrana' : 'High Inflammatory Risk · Membrane Rigidity';
    let tierSubText = isEs ? 'Desbalance severo AA/EPA y fragilidad de membrana celular' : 'Severe AA/EPA imbalance & membrane fragility';
    let prescribedRouteText = isEs ? 'Biorregulación Tisular (BPC-157 + TB-500) + EPA/DHA' : 'Tissue Bioregulation (BPC-157 + TB-500) + EPA/DHA';
    let prescribedRouteSub = isEs ? 'Resolución activa de inflamación y remodelado de membrana' : 'Active resolution of inflammation & membrane remodeling';
    let deltaTargetText = isEs ? `Déficit de -${Math.max(0, (8.0 - lvl)).toFixed(1)}% hacia diana cardioprotectora (≥ 8.0%)` : `Deficit of -${Math.max(0, (8.0 - lvl)).toFixed(1)}% to target (≥ 8.0%)`;
    let retestScheduleText = isEs ? '12 Semanas (Recambio Lipídico Membranas)' : '12 Weeks (Membrane Lipid Turnover)';
    let retestScheduleSub = isEs ? 'Control capilar DBS GC-MS de 24 ácidos grasos' : 'Capillary DBS GC-MS fatty acid profile';
    let targetRangeText = '> 8.0% (Cardioprotegido)';
    let titleText = isEs
      ? `Estratificación Terapéutica para Índice Omega-3: ${lvl}%`
      : `Therapeutic Stratification for Omega-3 Index: ${lvl}%`;
    let aiQueryText = isEs
      ? `Tengo un Índice Omega-3 de ${lvl}% (${tierBadgeText}). ¿Cómo aceleran los péptidos de reparación tisular la resolución antiinflamatoria en este protocolo?`
      : `My Omega-3 Index is ${lvl}% (${tierBadgeText}). How do tissue repair peptides accelerate anti-inflammatory resolution in this protocol?`;

    if (baseline === 'optimal' || lvl >= 8.0) {
      tierColor = '#0d9488';
      tierBg = '#f0fdfa';
      tierBadgeText = isEs ? 'Zona Cardioprotectora · Homeostasis Óptima' : 'Cardioprotective Target · Optimal Fluidity';
      tierSubText = isEs ? 'Fluidez máxima de bicapa lipídica y baja producción de eicosanoides pro-inflamatorios' : 'Peak bilayer fluidity & suppressed pro-inflammatory eicosanoids';
      prescribedRouteText = isEs ? 'Mantenimiento Vascular y Ciclado Preventivo' : 'Vascular Maintenance & Preventative Cycling';
      prescribedRouteSub = isEs ? 'Dosis de mantenimiento y péptidos endoteliales' : 'Maintenance dose & endothelial peptide support';
      deltaTargetText = isEs ? 'Nivel en zona diana cardioprotectora (≥ 8.0%)' : 'Level in target cardioprotective zone (≥ 8.0%)';
      retestScheduleText = isEs ? '6 Meses (Vigilancia Semestral)' : '6 Months (Biannual Check)';
    } else if (baseline === 'warning' || (lvl >= 4.0 && lvl < 8.0)) {
      tierColor = '#d97706';
      tierBg = '#fffbeb';
      tierBadgeText = isEs ? 'Rango Moderado · Protección Parcial' : 'Moderate Protection · Room for Optimization';
      tierSubText = isEs ? 'Protección cardiovascular intermedia con respuesta tisular lenta' : 'Intermediate protection with sluggish tissue recovery';
      prescribedRouteText = isEs ? 'Titulación Nutracéutica y Biorregulación Celular' : 'Nutraceutical Titration & Cellular Bioregulation';
      prescribedRouteSub = isEs ? 'EPA/DHA 3.000 mg + microdosificación de péptidos reparadores' : 'EPA/DHA 3,000 mg + repair peptide micro-dosing';
      deltaTargetText = isEs ? `Déficit de -${Math.max(0, (8.0 - lvl)).toFixed(1)}% hacia diana` : `Deficit of -${Math.max(0, (8.0 - lvl)).toFixed(1)}% to target`;
    }

    return {
      bType,
      measuredValStr: `${lvl}%`,
      targetRangeText,
      titleText,
      aiQueryText,
      tierColor,
      tierBg,
      tierBadgeText,
      tierSubText,
      prescribedRouteText,
      prescribedRouteSub,
      deltaTargetText,
      retestScheduleText,
      retestScheduleSub
    };
  }

  // 5. VITAMIN D
  if (bType === 'vitd') {
    let tierColor = '#dc2626';
    let tierBg = '#fef2f2';
    let tierBadgeText = isEs ? 'Deficiencia Severa · Disfunción Inmunológica' : 'Severe Deficiency · Compromised Immunity';
    let tierSubText = isEs ? 'Inmunocompetencia reducida y desmineralización ósea' : 'Impaired innate immunity & bone demineralization';
    let prescribedRouteText = isEs ? 'Inmunomodulación Tímica (Thymosin Alpha-1) + D3/K2' : 'Thymic Immunomodulation (Thymosin Alpha-1) + D3/K2';
    let prescribedRouteSub = isEs ? 'Reconstitución inmune celular activa y corrección genómica' : 'Active cellular immune replenishment & genomic regulation';
    let deltaTargetText = isEs ? `Déficit de -${Math.max(0, (50 - lvl)).toFixed(1)} ng/mL hacia diana óptima (≥ 50 ng/mL)` : `Deficit of -${Math.max(0, (50 - lvl)).toFixed(1)} ng/mL to target (≥ 50 ng/mL)`;
    let retestScheduleText = isEs ? '8–10 Semanas (Cinética 25(OH)D)' : '8–10 Weeks (25(OH)D Kinetics)';
    let retestScheduleSub = isEs ? 'Control capilar DBS LC-MS/MS' : 'Capillary DBS LC-MS/MS verification';
    let targetRangeText = '50.0 – 70.0 ng/mL (125 – 175 nmol/L)';
    let titleText = isEs
      ? `Estratificación Terapéutica para Vitamina D Total [25(OH)D]: ${lvl} ng/mL`
      : `Therapeutic Stratification for Total Vitamin D [25(OH)D]: ${lvl} ng/mL`;
    let aiQueryText = isEs
      ? `Tengo un nivel de Vitamina D de ${lvl} ng/mL (${tierBadgeText}). ¿Cómo sinergizan Thymosin Alpha-1 y la corrección de 25(OH)D para optimizar la inmunidad celular?`
      : `My Vitamin D level is ${lvl} ng/mL (${tierBadgeText}). How do Thymosin Alpha-1 and 25(OH)D repletion synergize for cellular immune defense?`;

    if (baseline === 'optimal' || (lvl >= 50 && lvl <= 70)) {
      tierColor = '#0d9488';
      tierBg = '#f0fdfa';
      tierBadgeText = isEs ? 'Rango Óptimo de Longevidad e Inmunorregulación' : 'Optimal Longevity & Immunoregulation Range';
      tierSubText = isEs ? 'Máxima expresión de péptidos antimicrobianos y homeostasis endocrina' : 'Peak antimicrobial peptide induction & endocrine homeostasis';
      prescribedRouteText = isEs ? 'Mantenimiento Domiciliario Fisiológico' : 'Physiological At-Home Maintenance';
      prescribedRouteSub = isEs ? 'Pulsos de mantenimiento D3/K2 y vigilancia semestral' : 'D3/K2 maintenance pulses & biannual check';
      deltaTargetText = isEs ? 'Nivel en zona diana de longevidad (50–70 ng/mL)' : 'Level in target longevity zone (50–70 ng/mL)';
      retestScheduleText = isEs ? '6 Meses (Vigilancia Semestral)' : '6 Months (Biannual Check)';
    } else if (baseline === 'sufficient' || (lvl >= 30 && lvl < 50)) {
      tierColor = '#16a34a';
      tierBg = '#f0fdf4';
      tierBadgeText = isEs ? 'Suficiencia Clínica Estándar' : 'Standard Clinical Sufficiency';
      tierSubText = isEs ? 'Homeostasis de calcio adecuada; margen para optimización funcional' : 'Adequate calcium balance; room for longevity optimization';
      prescribedRouteText = isEs ? 'Optimización Progresiva hacia Rango Funcional' : 'Progressive Functional Range Titration';
      prescribedRouteSub = isEs ? 'Aporte moderado diario D3/K2 con cofactor magnesio' : 'Moderate daily D3/K2 with magnesium cofactor';
      deltaTargetText = isEs ? `Margen de mejora de +${Math.max(0, (50 - lvl)).toFixed(1)} ng/mL hacia rango óptimo` : `Margin of +${Math.max(0, (50 - lvl)).toFixed(1)} ng/mL to longevity range`;
      retestScheduleText = isEs ? '12 Semanas (Control Trimestral)' : '12 Weeks (Quarterly Check)';
    } else if (baseline === 'warning' || (lvl >= 20 && lvl < 30)) {
      tierColor = '#d97706';
      tierBg = '#fffbeb';
      tierBadgeText = isEs ? 'Insuficiencia · Riesgo Inmunitario Moderado' : 'Insufficiency · Moderate Immune Risk';
      tierSubText = isEs ? 'Reducción de defensas mucosas y modulación Th1/Th2 subóptima' : 'Diminished mucosal immunity & suboptimal Th1/Th2 balance';
      prescribedRouteText = isEs ? 'Soporte Tímico y D3/K2 Terapéutico' : 'Thymic Support & Therapeutic D3/K2';
      prescribedRouteSub = isEs ? 'Thymosin Alpha-1 1.6 mg bisemanal + D3 50.000 UI semanal' : 'Thymosin Alpha-1 1.6 mg biweekly + D3 50,000 IU weekly';
      deltaTargetText = isEs ? `Déficit de -${Math.max(0, (50 - lvl)).toFixed(1)} ng/mL hacia diana` : `Deficit of -${Math.max(0, (50 - lvl)).toFixed(1)} ng/mL to target`;
    }

    return {
      bType,
      measuredValStr: `${lvl} ng/mL`,
      targetRangeText,
      titleText,
      aiQueryText,
      tierColor,
      tierBg,
      tierBadgeText,
      tierSubText,
      prescribedRouteText,
      prescribedRouteSub,
      deltaTargetText,
      retestScheduleText,
      retestScheduleSub
    };
  }

  // 6. NAD+ (DEFAULT)
  let tierColor = '#dc2626';
  let tierBg = '#fef2f2';
  let tierBadgeText = isEs ? 'Agotamiento Crítico · Acción Inmediata' : 'Critical Depletion · Immediate Action';
  let tierSubText = isEs ? 'Déficit celular severo y colapso sirtuínico' : 'Severe cellular deficit & sirtuin collapse';
  let prescribedRouteText = isEs ? 'Vía Intravenosa (IV Slow Drip)' : 'Intravenous Route (IV Slow Drip)';
  let prescribedRouteSub = isEs ? 'Infusión clínica 500 mg supervisada' : 'Supervised 500 mg clinical infusion';
  let deltaTargetText = isEs ? `Déficit de -${Math.max(0, (30 - lvl)).toFixed(1)} µmol/L hacia diana (≥ 30)` : `Deficit of -${Math.max(0, (30 - lvl)).toFixed(1)} µmol/L to target (≥ 30)`;
  let retestScheduleText = isEs ? 'Semana 4 (Re-evaluación DBS)' : 'Week 4 (DBS Follow-up)';
  let retestScheduleSub = isEs ? 'Control capilar post-fase de choque' : 'Post-induction capillary check';

  if (baseline === 'suboptimal' || (lvl >= 20 && lvl < 30)) {
    tierColor = '#d97706';
    tierBg = '#fffbeb';
    tierBadgeText = isEs ? 'Déficit Moderado · Ventana Terapéutica' : 'Moderate Deficit · Therapeutic Window';
    tierSubText = isEs ? 'Reserva bioenergética comprometida' : 'Compromised bioenergetic reserve';
    prescribedRouteText = isEs ? 'Vía Subcutánea (SubQ Titration)' : 'Subcutaneous Route (SubQ Titration)';
    prescribedRouteSub = isEs ? 'Micro-inyecciones 100 mg 3x/semana' : 'Micro-injections 100 mg 3x/week';
    deltaTargetText = isEs ? `Déficit de -${Math.max(0, (30 - lvl)).toFixed(1)} µmol/L hacia diana` : `Deficit of -${Math.max(0, (30 - lvl)).toFixed(1)} µmol/L to target`;
    retestScheduleText = isEs ? 'Semana 8 (Control Intermedio)' : 'Week 8 (Mid-Cycle Check)';
  } else if (baseline === 'optimal' || (lvl >= 30 && lvl <= 50)) {
    tierColor = '#0d9488';
    tierBg = '#f0fdfa';
    tierBadgeText = isEs ? 'Rango Óptimo · Longevidad' : 'Optimal Target · Longevity';
    tierSubText = isEs ? 'Máxima activación SIRT1 y resiliencia' : 'Peak SIRT1 activation & resilience';
    prescribedRouteText = isEs ? 'Mantenimiento Domiciliario Circadiano' : 'Circadian At-Home Maintenance';
    prescribedRouteSub = isEs ? 'Micro-pulsos matutinos 50 mg SC semanal' : 'Morning micro-pulses 50 mg SC weekly';
    deltaTargetText = isEs ? 'Nivel en zona diana terapéutica (≥ 30)' : 'Level in target therapeutic zone (≥ 30)';
    retestScheduleText = isEs ? '6 Meses (Vigilancia Semestral)' : '6 Months (Biannual Check)';
    retestScheduleSub = isEs ? 'Mantenimiento de estabilidad biológica' : 'Biological stability maintenance';
  } else if (baseline === 'peak' || lvl > 50) {
    tierColor = '#2563eb';
    tierBg = '#eff6ff';
    tierBadgeText = isEs ? 'Pico Pos-Tratamiento · Meseta' : 'Post-Treatment Peak · Plateau';
    tierSubText = isEs ? 'Saturación mitocondrial alcanzada' : 'Mitochondrial saturation achieved';
    prescribedRouteText = isEs ? 'Ciclado / Washout (2–4 Semanas)' : 'Cycling / Washout (2–4 Weeks)';
    prescribedRouteSub = isEs ? 'Pausa exógena y balance de metilos' : 'Exogenous pause & methyl balance';
    deltaTargetText = isEs ? 'Nivel supramáximo post-intervención' : 'Supra-maximal post-intervention level';
    retestScheduleText = isEs ? '12 Semanas (Monitoreo de Meseta)' : '12 Weeks (Plateau Monitoring)';
    retestScheduleSub = isEs ? 'Evaluación post-ventana de descanso' : 'Post-washout window check';
  }

  return {
    bType: 'nad',
    measuredValStr: `${lvl} µmol/L`,
    targetRangeText: '30.0 – 50.0 µmol/L',
    titleText: isEs ? `Estratificación Terapéutica para NAD⁺ Intracelular: ${lvl} µmol/L` : `Therapeutic Stratification for Intracellular NAD+: ${lvl} µmol/L`,
    aiQueryText: isEs 
      ? `Tengo un nivel de NAD+ de ${lvl} µmol/L (${tierBadgeText}). ¿Cómo debo administrar la vía ${biomarkerCalibration.modality} y los protectores de metilación con este protocolo?`
      : `My intracellular NAD+ level is ${lvl} µmol/L (${tierBadgeText}). What is the clinical protocol for ${biomarkerCalibration.modality} dosing and methylation support?`,
    tierColor,
    tierBg,
    tierBadgeText,
    tierSubText,
    prescribedRouteText,
    prescribedRouteSub,
    deltaTargetText,
    retestScheduleText,
    retestScheduleSub
  };
}
