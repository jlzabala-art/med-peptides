"use client";

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  Sparkles,
  Info,
  Activity,
  FileText
} from '@/lib/icons';
import { toast } from 'react-hot-toast';
import './BloodoNadFaqCard.css';

// ── 1. NAD+ LEVEL TEST FAQS ──
const DEFAULT_NAD_FAQS = [
  {
    id: 'faq-nad-01',
    category: 'clinical',
    tag: 'Assay Scope & Redox Target',
    questionEn: 'What physiological biomarker parameters does the capillary DBS NAD assay evaluate?',
    questionEs: '¿Qué parámetros cuantitativos de biomarcadores evalúa el ensayo DBS de NAD capilar?',
    answerEn: 'The assay quantifies total intracellular NAD (oxidized NAD⁺ and reduced NADH) in whole blood via validated capillary dried blood spot (DBS) micro-sampling, establishing an objective cellular bioenergetics baseline and mitochondrial redox capacity indicator.',
    answerEs: 'El ensayo cuantifica el NAD celular total (NAD⁺ oxidado y NADH reducido) en sangre completa mediante micromuestra capilar DBS validada, estableciendo una línea de base bioenergética objetiva y un indicador de la capacidad redox mitocondrial.'
  },
  {
    id: 'faq-nad-02',
    category: 'protocol_monitoring',
    tag: 'Clinical Intent Stratification',
    questionEn: 'Clinical Intent Stratification: Baseline Native Level vs. Active Protocol Therapeutic Monitoring',
    questionEs: 'Estratificación de Objetivo Clínico: Nivel Basal Endógeno vs. Monitorización Terapéutica en Tratamiento Activo',
    answerEn: 'Clinicians must establish the diagnostic objective prior to specimen collection:\n• Baseline Assessment: Quantifies unsupplemented endogenous NAD status prior to therapy initiation (requires a planned precursor washout period).\n• In-Treatment Therapeutic Monitoring: Assesses bioavailability and biological cellular response during an active regimen to titrate dosing and administration cadence (does NOT require therapy cessation or precursor washout).',
    answerEs: 'El facultativo debe definir el objetivo clínico previo a la extracción:\n• Evaluación Basal: Cuantifica el estado endógeno sin suplementar previo al inicio terapéutico (requiere período de lavado programado).\n• Monitorización Terapéutica en Curso: Evalúa la biodisponibilidad y respuesta celular durante una pauta activa para calibrar dosis y cadencia (NO requiere suspensión del tratamiento ni períodos de lavado).'
  },
  {
    id: 'faq-nad-03',
    category: 'protocol_monitoring',
    tag: 'Active Protocol Management',
    questionEn: 'Management of Active Regimens: Oral Precursors & IV Infusion During Monitoring',
    questionEs: 'Manejo de Pautas Activas: Precursores Orales e Infusiones IV Durante la Monitorización',
    answerEn: 'When the clinical objective is evaluating patient responsiveness to an active NAD protocol, clinicians should NOT discontinue oral precursors or introduce a 2–3 week washout. Discontinuing treatment eliminates the steady-state pharmacodynamic equilibrium that the physician seeks to assess.',
    answerEs: 'Cuando el objetivo clínico es evaluar la respuesta terapéutica a un protocolo activo, el médico NO debe indicar la suspensión de precursores orales ni introducir un lavado de 2–3 semanas. La interrupción suprime el equilibrio farmacodinámico que se pretende evaluar.'
  },
  {
    id: 'faq-nad-04',
    category: 'protocol_monitoring',
    tag: 'Requisition Documentation',
    questionEn: 'Essential Requisition Metadata for Active Protocol Monitoring',
    questionEs: 'Metadatos Clínicos Requeridos para la Interpretación de Resultados en Tratamiento Activo',
    answerEn: 'Standardized interpretation requires accurate charting of:\n• Acute parenteral history: e.g. "250 mg IV NAD⁺ infusion administered 24 hours prior to sampling".\n• Active oral regimen: specific molecule (NMN, NR, NAD⁺), daily dose in mg, and exact timestamp of the last dose relative to capillary collection.',
    answerEs: 'La interpretación estandarizada requiere consignar con precisión:\n• Antecedente parenteral reciente: ej. "Infusión IV de 250 mg de NAD⁺ administrada 24 horas previas a la toma".\n• Pauta oral activa: molécula específica (NMN, NR, NAD⁺), dosificación diaria en mg y hora exacta de la última toma respecto a la punción capilar.'
  },
  {
    id: 'faq-nad-05',
    category: 'preparation',
    tag: 'Circadian Sampling Window',
    questionEn: 'Circadian Rhythm & Chronobiological Sampling Window',
    questionEs: 'Ritmo Circadiano y Ventana Cronobiológica de Muestreo',
    answerEn: 'Intracellular NAD concentrations fluctuate under circadian regulation governed by core clock proteins and rhythmic NAMPT expression. For longitudinal clinical tracking, follow-up capillary blood collections should occur consistently in the morning (within 1–2 hours post-waking) under rested conditions.',
    answerEs: 'Las concentraciones intracelulares de NAD presentan oscilaciones circadianas reguladas por el reloj biológico central y la expresión rítmica de NAMPT. Para monitorizaciones seriadas, la toma capilar debe programarse sistemáticamente por la mañana (1–2 horas tras despertar) y en reposo.'
  },
  {
    id: 'faq-nad-06',
    category: 'clinical',
    tag: 'Regulatory Status (CE-IVDR)',
    questionEn: 'Diagnostic Scope & Regulatory Status (CE-IVDR)',
    questionEs: 'Alcance Diagnóstico y Marco Regulatorio (CE-IVDR)',
    answerEn: 'The Bloodo™ NAD test is a quantitative cellular biomarker assay performed in a certified central laboratory (LifeLab1, Vilnius, EU) under CE-IVDR compliance. Results provide objective biochemical data to support licensed medical practitioners in clinical protocol calibration and therapeutic monitoring.',
    answerEs: 'El test de NAD de Bloodo™ es un ensayo cuantitativo de biomarcadores celulares procesado en laboratorio central certificado (LifeLab1, Vilna, UE) bajo directiva CE-IVDR. Los resultados aportan datos bioquímicos objetivos para orientar al facultativo en la calibración posológica y monitorización clínica.'
  }
];

// ── 2. TESTOSTERONE+ TEST FAQS ──
const DEFAULT_TESTOSTERONE_FAQS = [
  {
    id: 'faq-testo-01',
    category: 'clinical',
    tag: 'Assay Scope & Gold Standard LC-MS/MS',
    questionEn: 'What specific parameters are quantified in the Bloodo™ Testosterone+ panel?',
    questionEs: '¿Qué parámetros cuantitativos evalúa el ensayo LC-MS/MS de Testosterona+?',
    answerEn: 'The panel directly quantifies Total Testosterone by Liquid Chromatography Tandem Mass Spectrometry (LC-MS/MS), Sex Hormone-Binding Globulin (SHBG), Albumin, and calculates Free Bioactive Testosterone using the validated Vermeulen algorithm alongside Free Androgen Index (FAI).',
    answerEs: 'El panel cuantifica directamente la Testosterona Total por Cromatografía Líquida con Espectrometría de Masas en Tándem (LC-MS/MS), Globulina Fijadora de Hormonas Sexuales (SHBG), Albúmina, y calcula la Testosterona Libre Bioactiva según el algoritmo validado de Vermeulen junto con el Índice de Andrógenos Libres (FAI).'
  },
  {
    id: 'faq-testo-02',
    category: 'clinical',
    tag: 'LC-MS/MS vs. Immunoassay Superiority',
    questionEn: 'Why is LC-MS/MS dried blood spot testing superior to standard automated immunoassays?',
    questionEs: '¿Por qué la técnica LC-MS/MS en sangre capilar es superior a los inmunoensayos automatizados convencionales?',
    answerEn: 'Standard automated immunoassays suffer from antibody cross-reactivity with structurally related endogenous and exogenous steroids (DHEA, androstenedione, epitestosterona). LC-MS/MS provides definitive mass-to-charge (m/z) molecular separation, delivering reference-grade accuracy especially in low or hypogonadal ranges as recommended by the Endocrine Society.',
    answerEs: 'Los inmunoensayos automatizados sufren de reactividad cruzada con otros esteroides endógenos y exógenos (DHEA, androstenediona, epitestosterona). LC-MS/MS ofrece separación molecular definitiva por relación masa/carga (m/z), garantizando precisión de estándar de referencia incluso en rangos bajos o hipogonadales conforme a la Endocrine Society.'
  },
  {
    id: 'faq-testo-03',
    category: 'preparation',
    tag: 'Chronobiological Sampling Window (08:00 - 10:00 AM)',
    questionEn: 'What is the mandatory chronobiological collection window for Testosterone+?',
    questionEs: '¿Cuál es la ventana horaria estandarizada para la toma de muestra capilar?',
    answerEn: 'Due to marked circadian pulsatility of pituitary LH secretion, blood sampling MUST be performed in the morning between 08:00 and 10:00 AM after a full night of sleep (minimum 6–7 hours) and under 8–10 hours of overnight fasting, as acute food intake (especially glucose and lipids) causes acute transient testosterone suppression.',
    answerEs: 'Debido a la marcada pulsatilidad circadiana de la secreción de LH hipofisaria, la punción capilar DEBE realizarse por la mañana entre las 08:00 y las 10:00 AM tras descanso nocturno adecuado (mínimo 6–7 horas) y en ayuno nocturno de 8–10 horas, ya que la ingesta aguda de carbohidratos o grasas induce una supresión transitoria de testosterona.'
  },
  {
    id: 'faq-testo-04',
    category: 'preparation',
    tag: 'Physical Exertion Standardization',
    questionEn: 'How does acute resistance training affect testosterone testing accuracy?',
    questionEs: '¿Cómo afecta el entrenamiento de fuerza o resistencia previo a la prueba?',
    answerEn: 'Strenuous physical exertion, heavy resistance training, or prolonged endurance sessions within 24 hours prior to sampling cause transient fluctuations in free testosterone, hemoconcentration, and acute cortisol surges. Patients should maintain normal moderate daily activity and refrain from exhaustive gym workouts for 24 hours prior to sampling.',
    answerEs: 'El ejercicio físico extenuante, entrenamiento de fuerza de alta intensidad o sesiones prolongadas en las 24 horas previas provocan fluctuaciones agudas en la testosterona libre, hemoconcentración y elevaciones de cortisol. Se recomienda actividad cotidiana habitual y evitar entrenamientos intensos durante las 24 horas previas.'
  },
  {
    id: 'faq-testo-05',
    category: 'protocol_monitoring',
    tag: 'TRT Washout vs. Secretagogue Monitoring',
    questionEn: 'How should TRT or peptide secretagogues (Kisspeptin, hCG, Gonadorelin) be managed?',
    questionEs: '¿Cómo debe gestionarse una pauta activa con TRT o secretagogos (Kisspeptina, hCG, Gonadorelina)?',
    answerEn: '• Native Baseline Assessment: Discontinue exogenous testosterone esters for 4–6 weeks (or longer for undecanoate) and secretagogues for 2 weeks under medical supervision.\n• In-Treatment Monitoring: Do NOT discontinue treatment. Collect blood at the standardized pharmacokinetic trough (immediately before next scheduled dose/injection) to evaluate nadir androgenic coverage.',
    answerEs: '• Evaluación Basal Nativa: Suspender ésteres exógenos de testosterona durante 4–6 semanas (o más para undecanoato) y secretagogos durante 2 semanas bajo supervisión médica.\n• Monitorización en Tratamiento Activo: NO suspender la pauta. Tomar la muestra en el valle farmacocinético estandarizado (justo antes de la siguiente dosis programada) para comprobar el nivel nadir terapéutico.'
  },
  {
    id: 'faq-testo-06',
    category: 'clinical',
    tag: 'Non-Suppressive HPTA Reactivation',
    questionEn: 'Which clinical companion protocols support testosterone without gonadal axis suppression?',
    questionEs: '¿Qué protocolos clínicos acompañantes favorecen la testosterona sin suprimir el eje gonadal?',
    answerEn: 'Peptide secretagogues such as Kisspeptin-10, Testagen, and pulsatile Gonadorelin/hCG stimulate hypothalamic GnRH and pituitary LH/FSH release, restoring Leydig cell steroidogenesis without feedback inhibition or testicular atrophy, contrasting sharply with suppressive exogenous TRT regimens.',
    answerEs: 'Los secretagogos peptídicos como Kisspeptina-10, Testagen y Gonadorelina/hCG pulsátil estimulan la secreción de GnRH hipotalámica y LH/FSH hipofisaria, reactivando la esteroidogénesis en células de Leydig sin inducir retroalimentación negativa ni atrofia testicular, a diferencia de la TRT exógena convencional.'
  }
];

// ── 3. CORTISOL TEST FAQS ──
const DEFAULT_CORTISOL_FAQS = [
  {
    id: 'faq-cort-01',
    category: 'clinical',
    tag: 'Circadian HPA Axis Dynamics',
    questionEn: 'What does the Bloodo™ Cortisol circadian panel measure?',
    questionEs: '¿Qué evalúa el ensayo de ritmo circadiano de Cortisol de Bloodo™?',
    answerEn: 'The panel quantifies free bioactive cortisol via validated capillary DBS or saliva sampling, measuring both the morning peak Awakening Response (CAR) and afternoon/evening levels to reconstruct the full diurnal slope of the Hypothalamic-Pituitary-Adrenal (HPA) axis.',
    answerEs: 'El panel cuantifica el cortisol libre bioactivo mediante micromuestras capilares DBS o saliva, evaluando tanto la Respuesta al Despertar (CAR) matutina como los niveles vespertinos para reconstruir la curva diurna completa del eje Hipotálamo-Hipofisario-Adrenal (HPA).'
  },
  {
    id: 'faq-cort-02',
    category: 'preparation',
    tag: 'Cortisol Awakening Response (CAR)',
    questionEn: 'Why is the exact timing of the morning sample critical?',
    questionEs: '¿Por qué es crítico el momento exacto de la toma de muestra matutina (CAR)?',
    answerEn: 'The Cortisol Awakening Response (CAR) is a steep 50–75% physiological surge occurring within 30 to 45 minutes of waking. The morning sample must be collected within this exact window while remaining calm and seated to avoid false negatives or misinterpreting HPA axis exhaustion.',
    answerEs: 'La Respuesta de Cortisol al Despertar (CAR) es un incremento fisiológico del 50–75% que ocurre entre los 30 y 45 minutos tras despertar. La toma matutina debe realizarse en esta ventana estricta en reposo y calma para evitar falsos negativos o interpretar erróneamente un agotamiento suprarrenal.'
  },
  {
    id: 'faq-cort-03',
    category: 'preparation',
    tag: 'Stimulants & Caffeine Washout',
    questionEn: 'Should coffee, caffeine, or pre-workout stimulants be avoided before sampling?',
    questionEs: '¿Deben evitarse el café, cafeína o suplementos estimulantes antes de la prueba?',
    answerEn: 'Yes. Caffeine, nicotine, and adrenergic pre-workout compounds acutely trigger sympathetic adrenomedullary stimulation and elevate cortisol by 20–40%. Fasting without coffee or stimulants is mandatory for the morning test; plain water is permitted.',
    answerEs: 'Sí. La cafeína, nicotina y suplementos pre-entreno adrenérgicos provocan activación simpática y elevan el cortisol de forma artificial entre un 20% y un 40%. Es indispensable estar en ayunas de café y estimulantes durante la prueba matutina; se permite beber agua sola.'
  },
  {
    id: 'faq-cort-04',
    category: 'clinical',
    tag: 'Mitochondrial NAD+ & HPA Synergy',
    questionEn: 'How does cortisol dysregulation correlate with intracellular NAD+ depletion?',
    questionEs: '¿Cómo se relaciona la desregulación de cortisol con el agotamiento mitocondrial de NAD+?',
    answerEn: 'Chronic allostatic hypercortisolemia accelerates NAD+ consumption by activating PARP enzymes under cellular oxidative stress, while adrenal exhaustion (flat diurnal curve) impairs mitochondrial biogenesis. Cross-testing Cortisol and NAD+ differentiates primary mitochondrial failure from chronic neuro-endocrine fatigue.',
    answerEs: 'La hipercortisolemia alostática crónica acelera el consumo de NAD⁺ al activar las enzimas reparadoras PARP ante el estrés oxidativo, mientras que el agotamiento adrenal (curva diurna plana) deteriora la biogénesis mitocondrial. Medir Cortisol y NAD⁺ conjuntamente permite distinguir el fallo mitocondrial primario de la fatiga neuroendocrina crónica.'
  },
  {
    id: 'faq-cort-05',
    category: 'protocol_monitoring',
    tag: 'Circadian Peptide Therapeutics',
    questionEn: 'Which clinical bioregulators harmonize the circadian adrenal slope?',
    questionEs: '¿Qué biorreguladores peptídicos modulan el eje adrenal y el cortisol vespertino?',
    answerEn: 'Epithalon synchronizes pineal melatonin secretion and restores normal circadian clock gene expression; Selank acts via allosteric GABA-A modulation to blunt stress-induced ACTH surges; and nocturnal DSIP restores restorative delta sleep to reset basal morning adrenocortical sensitivity.',
    answerEs: 'Epithalon sincroniza la secreción pineal de melatonina y restablece la expresión de genes reloj; Selank actúa modulando los receptores GABA-A para frenar los picos de ACTH inducidos por estrés; y DSIP nocturno restaura el sueño profundo delta reseteando la sensibilidad adrenocortical matutina.'
  }
];

// ── 4. HBA1C GLYCATION FAQS ──
const DEFAULT_HBA1C_FAQS = [
  {
    id: 'faq-hba1c-01',
    category: 'clinical',
    tag: '90-Day Glycemic Memory',
    questionEn: 'What physiological index does the Bloodo™ HbA1c test reflect?',
    questionEs: '¿Qué índice fisiológico evalúa el test de HbA1c de Bloodo™?',
    answerEn: 'The test quantifies the percentage of glycated hemoglobin in circulating erythrocytes, providing an integrated, stable 90-day biological index of mean glycemia and advanced glycation end-product (AGE) risk, independent of acute fasting fluctuations.',
    answerEs: 'El test cuantifica el porcentaje de hemoglobina glicada en los eritrocitos circulantes, proporcionando un índice biológico integrado y estable de 90 días sobre la glucemia media y el riesgo de productos finales de glicación avanzada (AGEs), independiente de fluctuaciones agudas en ayunas.'
  },
  {
    id: 'faq-hba1c-02',
    category: 'protocol_monitoring',
    tag: 'Incretin & GLP-1/GIP Monitoring',
    questionEn: 'How does this test monitor metabolic peptides like Tirzepatide, Semaglutide, and MOTS-c?',
    questionEs: '¿Cómo monitoriza este test protocolos con Tirzepatida, Semaglutida y MOTS-c?',
    answerEn: 'Serial HbA1c testing at 12-week intervals objectively verifies metabolic insulin resensitization and visceral fat mobilization during dual/triple incretin therapies and mitochondrial peptides, guiding maintenance titration schedules.',
    answerEs: 'La monitorización seriada de HbA1c cada 12 semanas verifica de forma objetiva la resensibilización a la insulina y la movilización de grasa visceral durante terapias incretínicas y con péptidos mitocondriales, guiando el ajuste a dosis de mantenimiento.'
  }
];

// ── 5. OMEGA-3/6 RATIO FAQS ──
const DEFAULT_OMEGA_FAQS = [
  {
    id: 'faq-omg-01',
    category: 'clinical',
    tag: 'Cell Membrane Lipidome',
    questionEn: 'What does the capillary DBS Omega-3/6 ratio evaluate?',
    questionEs: '¿Qué evalúa el análisis capilar de ratio Omega-3/Omega-6?',
    answerEn: 'It analyzes the exact fatty acid composition of erythrocyte cell membranes using high-resolution Gas Chromatography (GC-MS), quantifying the Omega-3 Index (target ≥ 8%), Arachidonic Acid to EPA ratio (AA/EPA), and trans fatty acid levels.',
    answerEs: 'Analiza la composición lipídica exacta de las membranas eritrocitarias mediante Cromatografía de Gases (GC-MS), cuantificando el Índice Omega-3 (objetivo ≥ 8%), la ratio Ácido Araquidónico/EPA (AA/EPA) y los niveles de ácidos grasos trans.'
  },
  {
    id: 'faq-omg-02',
    category: 'protocol_monitoring',
    tag: 'Tissue Repair & Resolvin Synergy',
    questionEn: 'Why is membrane lipid testing essential before tissue regeneration protocols (BPC-157, TB-500)?',
    questionEs: '¿Por qué es fundamental el perfil lipídico celular previo a protocolos de reparación tisular (BPC-157, TB-500)?',
    answerEn: 'Excessive membrane omega-6 drives pro-inflammatory eicosanoids that antagonize tissue healing. Normalizing the omega ratio provides essential substrates for specialized pro-resolving mediators (SPMs like resolvins and protectins), maximizing the angiogenic and regenerative efficacy of BPC-157 and TB-500.',
    answerEs: 'El exceso de omega-6 en membrana promueve eicosanoides proinflamatorios que antagonizan la cicatrización. Normalizar el balance omega aporta sustratos esenciales para la síntesis de mediadores pro-resolutivos (resolvinas y protectinas), potenciando la eficacia angiogénica y regenerativa de BPC-157 y TB-500.'
  }
];

// ── 6. VITAMIN D3 FAQS ──
const DEFAULT_VITAMIN_D_FAQS = [
  {
    id: 'faq-vitd-01',
    category: 'clinical',
    tag: '25(OH)D3 LC-MS/MS Quantification',
    questionEn: 'How does the Bloodo™ Vitamin D test measure active status?',
    questionEs: '¿Cómo cuantifica el test de Bloodo™ el estado activo de Vitamina D?',
    answerEn: 'It utilizes isotope-dilution LC-MS/MS to independently quantify 25-hydroxyvitamin D3 and D2 in whole capillary blood, resolving the active genomic VDR ligand precursor without analytical interference from epimers or binding proteins.',
    answerEs: 'Utiliza LC-MS/MS con dilución isotópica para cuantificar de forma independiente la 25-hidroxivitamina D3 y D2 en sangre capilar, determinando el precursor activo del ligando genómico VDR sin interferencias analíticas de epímeros o proteínas transportadoras.'
  },
  {
    id: 'faq-vitd-02',
    category: 'protocol_monitoring',
    tag: 'Thymic & Immune Peptide Synergy',
    questionEn: 'How does Vitamin D status interact with Thymosin Alpha-1 and LL-37 protocols?',
    questionEs: '¿Cómo interactúa la Vitamina D con protocolos de Timosina Alfa-1 y LL-37?',
    answerEn: 'The Vitamin D receptor (VDR) directly transactivates the promoter region of the human cathelicidin antimicrobial peptide (CAMP/LL-37) gene and regulates T-cell receptor signaling. A 25(OH)D level ≥ 50 ng/mL is an indispensable prerequisite for optimal thymic peptide bioreregulation.',
    answerEs: 'El receptor de vitamina D (VDR) activa directamente el promotor del gen de catelicidina antimicrobiana (CAMP/LL-37) y regula la señalización de linfocitos T. Un nivel de 25(OH)D ≥ 50 ng/mL es un requisito previo indispensable para la eficacia de la biorregulación con péptidos tímicos.'
  }
];

/**
 * Helper to select the exact default FAQ collection based on product slug/id
 */
function resolveDefaultFaqs(product = {}) {
  const s = `${product?.slug || ''} ${product?.id || ''} ${product?.name || ''}`.toLowerCase();
  if (s.includes('testosterone') || s.includes('testosterona')) return { faqs: DEFAULT_TESTOSTERONE_FAQS, testKey: 'testosterone' };
  if (s.includes('cortisol')) return { faqs: DEFAULT_CORTISOL_FAQS, testKey: 'cortisol' };
  if (s.includes('hba1c') || s.includes('hemoglobin') || s.includes('hemoglobina')) return { faqs: DEFAULT_HBA1C_FAQS, testKey: 'hba1c' };
  if (s.includes('omega')) return { faqs: DEFAULT_OMEGA_FAQS, testKey: 'omega' };
  if (s.includes('vitamin-d') || s.includes('vitamina-d')) return { faqs: DEFAULT_VITAMIN_D_FAQS, testKey: 'vitamin-d' };
  return { faqs: DEFAULT_NAD_FAQS, testKey: 'nad' };
}

export default function BloodoNadFaqCard({ product, lang = 'en' }) {
  const isEs = lang === 'es';
  const { faqs: fallbackFaqs, testKey } = useMemo(() => resolveDefaultFaqs(product), [product]);

  const faqs = useMemo(() => {
    return Array.isArray(product?.clinical_faq) && product.clinical_faq.length > 0
      ? product.clinical_faq
      : (Array.isArray(product?.faq) && product.faq.length > 0 ? product.faq : fallbackFaqs);
  }, [product, fallbackFaqs]);

  const [openIds, setOpenIds] = useState(() => new Set());
  const [isCopiedAll, setIsCopiedAll] = useState(false);
  const filteredFaqs = faqs;

  const isAllExpanded = filteredFaqs.length > 0 && filteredFaqs.every(f => openIds.has(f.id));

  const toggleExpandAll = () => {
    if (isAllExpanded) {
      setOpenIds(new Set());
    } else {
      setOpenIds(new Set(filteredFaqs.map(f => f.id)));
    }
  };

  const toggleAccordion = (id) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTestTitle = () => {
    switch (testKey) {
      case 'testosterone':
        return isEs ? 'Testosterona+ (Total & Libre)' : 'Testosterone+ (Total & Free)';
      case 'cortisol':
        return isEs ? 'Cortisol Ritmo Circadiano' : 'Circadian Cortisol Curve';
      case 'hba1c':
        return isEs ? 'HbA1c & Glucosa Media 90 Días' : 'HbA1c & 90-Day Mean Glucose';
      case 'omega':
        return isEs ? 'Ratio Omega-3/Omega-6 & Membrana' : 'Omega-3/6 Ratio & Cell Membrane';
      case 'vitamin-d':
        return isEs ? 'Vitamina D3 (25-OH) & Eje VDR' : 'Vitamin D3 (25-OH) & VDR Axis';
      default:
        return isEs ? 'Test de NAD+ Celular' : 'NAD+ Cellular Level Test';
    }
  };

  const handleCopyAll = async () => {
    const testTitle = getTestTitle();
    const headerTitle = isEs
      ? `Especificaciones Clínicas y Protocolo de Monitorización — ${testTitle} (Bloodo™)`
      : `Clinical Specifications & Therapeutic Monitoring Guidelines — ${testTitle} (Bloodo™)`;

    const intentSection = isEs
      ? `1. OBJETIVO CLÍNICO Y MONITORIZACIÓN TERAPÉUTICA:
• Protocolo Activo (respuesta biológica): Mantener la pauta terapéutica sin interrumpir para verificar equilibrio farmacodinámico.
• Registro Obligatorio: Consignar dosis exacta y hora de la última dosis administrada.
• Nivel Basal Puro: Respetar períodos de lavado previo bajo dirección facultativa.`
      : `1. CLINICAL OBJECTIVE & THERAPEUTIC MONITORING:
• In-Treatment Protocol Monitoring: Do NOT discontinue treatment; evaluate active steady-state equilibrium.
• Requisition Documentation: Chart exact therapeutic dose and timestamp of last administration.
• True Baseline Native Assessment: Allow planned washout periods under physician guidance.`;

    const prepSection = isEs
      ? `2. ESTANDARIZACIÓN PREANALÍTICA:
• Toma de Muestra: Ventana matutina estandarizada en reposo (08:00 - 10:00 AM).
• Farmacoterapia Crónica: Mantener tratamientos prescritos; documentar en la petición analítica.
• Actividad Física: Evitar ejercicio extenuante no habitual las 24h previas.`
      : `2. PRE-ANALYTICAL STANDARDIZATION:
• Specimen Timing: Morning standardized window at rest (08:00 - 10:00 AM).
• Chronic Medications: Maintain prescribed therapies; report all active agents on requisition.
• Physical Activity: Avoid exhaustive exercise for 24 hours preceding collection.`;

    const footer = `Med-Peptides Clinical Intelligence • LifeLab1 (Vilnius, Lithuania) / CE-IVDR Certified`;
    const fullText = `${headerTitle}\n\n${intentSection}\n\n${prepSection}\n\n${footer}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopiedAll(true);
      toast.success(isEs ? 'Pautas clínicas copiadas al portapapeles ✓' : 'Clinical guidelines copied to clipboard ✓');
      setTimeout(() => setIsCopiedAll(false), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const testTitle = getTestTitle();

  return (
    <section id="nad-clinical-faq" className="bnf-card-container">
      {/* ── Card Header ── */}
      <div className="bnf-card-header">
        <div className="bnf-header-left">
          <div className="bnf-header-icon-box">
            <HelpCircle size={20} className="bnf-header-icon" />
          </div>
          <div>
            <div className="bnf-header-badge-row">
              <span className="bnf-chip bnf-chip-pharma">CE-IVDR Certified • Dried Blood Spot (DBS)</span>
              <span className="bnf-chip bnf-chip-protocol">
                {isEs ? 'Guía para Profesionales' : 'Physician Clinical FAQ'}
              </span>
            </div>
            <h3 className="bnf-title">
              {isEs ? `Preguntas Frecuentes y Pautas Clínicas (${testTitle})` : `${testTitle} – Frequently Asked Questions & Clinical Guidelines`}
            </h3>
            <p className="bnf-subtitle">
              {isEs
                ? 'Información farmacológica rigurosa y parámetros de monitorización estandarizados para médicos, investigadores clínicos y consultas especializadas.'
                : 'Pharma-grade clinical guidance and standardized testing parameters for medical practitioners, clinical investigators, and prescribing clinics.'}
            </p>
          </div>
        </div>

        {/* Global Clinical Actions */}
        <div className="bnf-header-actions">
          <button
            type="button"
            className="bnf-btn-expand-all"
            onClick={toggleExpandAll}
            title={isAllExpanded ? (isEs ? 'Colapsar todas las preguntas' : 'Collapse all questions') : (isEs ? 'Expandir todas las preguntas' : 'Expand all questions')}
          >
            {isAllExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>{isAllExpanded ? (isEs ? 'Colapsar Todo' : 'Collapse All') : (isEs ? 'Expandir Todo' : 'Expand All')}</span>
          </button>

          <button
            type="button"
            className="bnf-btn-copy-guideline"
            onClick={handleCopyAll}
            title={isEs ? 'Copiar especificaciones clínicas al portapapeles' : 'Copy clinical specifications to clipboard'}
          >
            {isCopiedAll ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{isCopiedAll ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Pautas Clínicas' : 'Copy Clinical Guidelines')}</span>
          </button>
        </div>
      </div>

      {/* ── FAQ Accordion Body ── */}
      <div className="bnf-faq-list">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIds.has(faq.id);
          const questionText = (isEs && faq.questionEs) ? faq.questionEs : (faq.questionEn || faq.question);
          const answerText = (isEs && faq.answerEs) ? faq.answerEs : (faq.answerEn || faq.answer);

          return (
            <div
              key={faq.id || index}
              data-category={faq.category || 'clinical'}
              className={`bnf-accordion-item ${isOpen ? 'bnf-accordion-item--open' : ''}`}
            >
              <button
                type="button"
                className="bnf-accordion-trigger"
                onClick={() => toggleAccordion(faq.id)}
                aria-expanded={isOpen}
              >
                <div className="bnf-trigger-content">
                  <div className="bnf-trigger-meta">
                    <span className="bnf-faq-number">#{String(index + 1).padStart(2, '0')}</span>
                    {faq.tag && <span className="bnf-faq-tag">{faq.tag}</span>}
                  </div>
                  <span className="bnf-faq-question">{questionText}</span>
                </div>
                <div className="bnf-trigger-icon">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {isOpen && (
                <div className="bnf-accordion-content">
                  <div className="bnf-answer-text">
                    {answerText.split('\n').map((paragraph, pIdx) => {
                      if (!paragraph.trim()) return null;
                      if (paragraph.startsWith('•')) {
                        return (
                          <div key={pIdx} className="bnf-bullet-item">
                            <span className="bnf-bullet-dot">•</span>
                            <span>{paragraph.replace(/^•\s*/, '')}</span>
                          </div>
                        );
                      }
                      return <p key={pIdx} className="bnf-paragraph">{paragraph}</p>;
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Clinical Requisition Notice ── */}
      <div className="bnf-footer-notice">
        <ShieldCheck size={16} className="bnf-notice-icon" />
        <div className="bnf-notice-text">
          <strong>{isEs ? 'Gobernanza y Trazabilidad Centralizada:' : 'Centralized Analytical Governance:'}</strong>{' '}
          {isEs
            ? 'Todos los kits diagnósticos de Bloodo™ se procesan en laboratorio central acreditado LifeLab1 (Vilna, Lituania) bajo especificaciones CE-IVDR y trazabilidad ISO 15189. Los informes incluyen curvas de calibración y rango de referencia estratificado por edad y sexo.'
            : 'All Bloodo™ diagnostic test kits are processed at LifeLab1 central accredited facilities (Vilnius, Lithuania) adhering to CE-IVDR directives and ISO 15189 traceability. Clinical laboratory reports include calibration curves and age/sex-stratified reference ranges.'}
        </div>
      </div>
    </section>
  );
}
