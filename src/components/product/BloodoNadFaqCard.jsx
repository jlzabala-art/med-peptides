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
    category: 'protocol_monitoring',
    tag: 'Longitudinal Standardization',
    questionEn: 'Chronobiological Sampling Standardization for Serial Follow-Up',
    questionEs: 'Estandarización Cronobiológica para la Comparabilidad en Pruebas de Seguimiento',
    answerEn: 'To maintain longitudinal analytical validity, clinicians should standardize sample collection timing relative to therapeutic administration (e.g. consistently 24 hours post-infusion, or fasting morning trough prior to daily oral dosing). Consistent timing enables direct intra-individual comparability to guide therapeutic adjustments.',
    answerEs: 'Para preservar la validez analítica longitudinal, el clínico debe estandarizar la ventana temporal de recogida respecto a la administración terapéutica (ej. sistemáticamente 24 horas post-infusión, o muestra matutina valle previa a la dosis oral). Esta consistencia garantiza la comparabilidad intraindividual para el ajuste posológico.'
  },
  {
    id: 'faq-nad-06',
    category: 'baseline',
    tag: 'Baseline Washout Guidelines',
    questionEn: 'Recommended Washout Parameters for True Baseline Native Assessment',
    questionEs: 'Parámetros de Lavado (Washout) para la Determinación del Nivel Basal Puro',
    answerEn: 'If the clinical intent is establishing native unsupplemented baseline NAD levels prior to initiating therapy:\n• Oral Precursors (NMN, NR, Niacin, Nicotinamide): Discontinue oral NAD-modulating supplements for 2–3 weeks prior to specimen collection, where clinically appropriate.\n• IV NAD⁺ Therapy: Allow adequate clearance following infusion. In clinical practice, an interval of 2 to 3 weeks provides a prudent window for returning to native cellular baseline.',
    answerEs: 'Si el objetivo médico es determinar el nivel basal puro antes de iniciar un tratamiento:\n• Precursores Orales (NMN, NR, Niacina, Nicotinamida): Suspender la suplementación durante 2–3 semanas previas a la prueba bajo criterio médico.\n• Terapia IV con NAD⁺: Respetar un intervalo prudente de eliminación. En la práctica clínica, un plazo de 2 a 3 semanas constituye un estándar adecuado para restablecer el nivel basal celular nativo.'
  },
  {
    id: 'faq-nad-07',
    category: 'preparation',
    tag: 'Pre-Sampling Fasting',
    questionEn: 'Is Pre-Sampling Fasting Required for Capillary DBS NAD Assessment?',
    questionEs: '¿Es Necesario el Ayuno Previo para la Punción Capilar DBS de NAD?',
    answerEn: 'Unless specified by a specific research protocol, strict caloric fasting is generally not mandatory for capillary dried blood spot NAD determination. However, to ensure intra-individual consistency in longitudinal tracking, clinicians should collect follow-up specimens under comparable dietary and time-of-day conditions.',
    answerEs: 'Salvo indicación expresa en un protocolo de investigación, el ayuno calórico estricto generalmente no es obligatorio para la determinación de NAD capilar por DBS. No obstante, para garantizar consistencia longitudinal, se recomienda tomar las muestras de seguimiento bajo condiciones similares de horario e ingesta.'
  },
  {
    id: 'faq-nad-08',
    category: 'preparation',
    tag: 'Prescription Pharmacotherapy',
    questionEn: 'Management of Chronic Prescription Pharmacotherapy',
    questionEs: 'Manejo de Farmacoterapia Crónica Prescrita',
    answerEn: 'Prescribed chronic medical treatments should not be discontinued solely for NAD biomarker assessment unless clinically directed. Clinicians must record all active pharmaceuticals on the lab requisition form to evaluate potential metabolic interactions.',
    answerEs: 'No debe suspenderse la medicación crónica prescrita con motivo exclusivo del test de NAD. El facultativo debe registrar todos los fármacos activos en la solicitud analítica para valorar posibles interacciones metabólicas.'
  },
  {
    id: 'faq-nad-09',
    category: 'preparation',
    tag: 'Pathway Modulators (TMG/CD38)',
    questionEn: 'Cofactor and Pathway Modulator Interference (TMG, CD38 Inhibitors)',
    questionEs: 'Interferencias de Cofactores y Moduladores de Vía (TMG, Inhibidores de CD38)',
    answerEn: 'Physicians should document all adjunct agents influencing the salvage pathway, including methyl donors (TMG / Trimethylglycine, SAMe), precursor intermediates, and pharmacological/nutraceutical CD38 inhibitors (apigenin, quercetin).',
    answerEs: 'El médico debe registrar todos los agentes adyuvantes que modulan la vía de salvamento, incluidos donantes de metilos (TMG / Trimetilglicina, SAMe), intermediarios y moduladores de CD38 (apigenina, quercetina).'
  },
  {
    id: 'faq-nad-10',
    category: 'preparation',
    tag: 'Circadian Sampling Window',
    questionEn: 'Circadian Rhythm & Chronobiological Sampling Window',
    questionEs: 'Ritmo Circadiano y Ventana Cronobiológica de Muestreo',
    answerEn: 'Intracellular NAD concentrations fluctuate under circadian regulation governed by core clock proteins and rhythmic NAMPT expression. For longitudinal clinical tracking, follow-up capillary blood collections should occur consistently in the morning (within 1–2 hours post-waking) under rested conditions.',
    answerEs: 'Las concentraciones intracelulares de NAD presentan oscilaciones circadianas reguladas por el reloj biológico central y la expresión rítmica de NAMPT. Para monitorizaciones seriadas, la toma capilar debe programarse sistemáticamente por la mañana (1–2 horas tras despertar) y en reposo.'
  },
  {
    id: 'faq-nad-11',
    category: 'preparation',
    tag: 'Physical Exertion Flux',
    questionEn: 'Impact of Strenuous Physical Exertion on Intracellular NAD Flux',
    questionEs: 'Impacto del Ejercicio Físico Extenuante en el Flujo Intracelular de NAD',
    answerEn: 'Exhaustive exercise alters mitochondrial ATP turnover and NAD⁺/NADH redox equilibrium. For baseline or monitoring comparability, patients should maintain habitual physical activity and avoid unusually strenuous exertion during the 24 hours preceding sample collection.',
    answerEs: 'El ejercicio físico extenuante altera la demanda de ATP mitocondrial y el balance redox NAD⁺/NADH. Para preservar la comparabilidad, se recomienda mantener actividad física habitual y evitar esfuerzos extenuantes las 24 horas previas al muestreo.'
  },
  {
    id: 'faq-nad-12',
    category: 'clinical',
    tag: 'Pre-Analytical Checklist',
    questionEn: 'Requisite Clinical Metadata on Lab Requisition Form',
    questionEs: 'Metadatos Clínicos Esenciales en la Petición Analítica',
    answerEn: 'Essential clinical requisition fields include: patient age, active therapeutic regimen, exact NAD precursor dosing, timestamp of last parenteral IV infusion (dose in mg), and blood collection timestamp.',
    answerEs: 'Los campos esenciales en la solicitud clínica incluyen: edad del paciente, pauta farmacológica activa, dosificación de precursores de NAD, fecha/hora de la última infusión parenteral IV (dosis en mg) y momento de la extracción capilar.'
  },
  {
    id: 'faq-nad-13',
    category: 'clinical',
    tag: 'Regulatory Status (CE-IVDR)',
    questionEn: 'Diagnostic Scope & Regulatory Status (CE-IVDR)',
    questionEs: 'Alcance Diagnóstico y Marco Regulatorio (CE-IVDR)',
    answerEn: 'The Bloodo™ NAD test is a quantitative cellular biomarker assay performed in a certified central laboratory (LifeLab1, Vilnius, EU) under CE-IVDR compliance. Results provide objective biochemical data to support licensed medical practitioners in clinical protocol calibration and therapeutic monitoring.',
    answerEs: 'El test de NAD de Bloodo™ es un ensayo cuantitativo de biomarcadores celulares procesado en laboratorio central certificado (LifeLab1, Vilna, UE) bajo directiva CE-IVDR. Los resultados aportan datos bioquímicos objetivos para orientar al facultativo en la calibración posológica y monitorización clínica.'
  }
];

export default function BloodoNadFaqCard({ product, lang = 'en' }) {
  const isEs = lang === 'es';
  const faqs = useMemo(() => {
    return Array.isArray(product?.clinical_faq) && product.clinical_faq.length > 0
      ? product.clinical_faq
      : (Array.isArray(product?.faq) && product.faq.length > 0 ? product.faq : DEFAULT_NAD_FAQS);
  }, [product]);

  const [activeCategory, setActiveCategory] = useState('all');
  const [openIds, setOpenIds] = useState(() => new Set());
  const [isCopiedAll, setIsCopiedAll] = useState(false);

  const filteredFaqs = useMemo(() => {
    if (activeCategory === 'all') return faqs;
    return faqs.filter(f => f.category === activeCategory);
  }, [faqs, activeCategory]);

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

  const handleCopyAll = async () => {
    const headerTitle = isEs
      ? 'Especificaciones Clínicas y Protocolo de Monitorización — Test Capilar de NAD (Bloodo™)'
      : 'Clinical Specifications & Therapeutic Monitoring Guidelines — Bloodo™ NAD Test';

    const intentSection = isEs
      ? `1. OBJETIVO CLÍNICO Y MONITORIZACIÓN TERAPÉUTICA:
• Monitorización en Protocolo Activo (respuesta biológica): NO suspender tratamiento oral ni indicar lavado de 2-3 semanas. El médico evalúa el estado metabólico activo para calibrar dosis.
• Registro Clínico Obligatorio: Consignar dosis exacta y hora de la última infusión IV o toma oral (ej. "250 mg IV ayer a las 14:00").
• Nivel Basal Puro Sin Tratamiento: Suspender precursores orales 2-3 semanas antes bajo supervisión médica.`
      : `1. CLINICAL OBJECTIVE & THERAPEUTIC MONITORING:
• In-Treatment Protocol Monitoring (biological response): DO NOT discontinue oral precursors or introduce a 2-3 week washout. The clinician evaluates active metabolic equilibrium to calibrate dosage.
• Essential Requisition Documentation: Record exact dose and timestamp of last parenteral infusion or oral dose (e.g. "Received 250 mg IV NAD+ yesterday at 14:00").
• True Baseline Native Assessment: Discontinue oral precursors 2-3 weeks prior under medical direction.`;

    const prepSection = isEs
      ? `2. ESTANDARIZACIÓN PREANALÍTICA:
• Ayuno: No obligatorio; se requiere consistencia horaria (mañanas en reposo).
• Farmacoterapia Crónica: Mantener tratamientos prescritos; documentar en la petición analítica.
• Actividad Física: Evitar ejercicio extenuante no habitual las 24h previas.
• Estandarización Seriada: Mantener intervalo temporal idéntico respecto a la administración terapéutica.`
      : `2. PRE-ANALYTICAL STANDARDIZATION:
• Fasting Status: Generally not mandatory; time-of-day consistency (morning rested) is required.
• Chronic Medications: Maintain prescribed therapies; report all active agents on requisition.
• Physical Activity: Avoid exhaustive exercise for 24 hours preceding collection.
• Serial Comparability: Maintain identical timing intervals relative to therapeutic administration.`;

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
              {isEs ? 'Preguntas Frecuentes y Pautas Clínicas (Test de NAD)' : 'NAD Test – Frequently Asked Questions & Clinical Guidelines'}
            </h3>
            <p className="bnf-subtitle">
              {isEs
                ? 'Información farmacológica rigurosa y parámetros de monitorización estandarizados para médicos, investigadores clínicos y consultas especializadas.'
                : 'Pharma-grade clinical guidance and standardized testing parameters for medical practitioners, clinical investigators, and prescribing clinics.'}
            </p>
          </div>
        </div>

        {/* Global Clinical Copy Action */}
        <div className="bnf-header-actions">
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

      {/* ── Key Clinical Strategic Notice (Active Protocol vs Baseline) ── */}
      <div className="bnf-strategic-banner">
        <div className="bnf-banner-icon-col">
          <Activity size={22} className="bnf-banner-icon" />
        </div>
        <div className="bnf-banner-content">
          <div className="bnf-banner-title">
            {isEs
              ? 'Distinción Clínica Clave: Monitorización de Protocolo vs. Nivel Basal'
              : 'Key Clinical Distinction: Active Protocol Monitoring vs. Baseline Assessment'}
          </div>
          <p className="bnf-banner-desc">
            {isEs ? (
              <>
                <strong>Si el objetivo es evaluar la respuesta terapéutica a un protocolo en curso:</strong> NO proponga un lavado de 2–3 semanas ni suspenda el NAD oral. Lo esencial es <strong>documentar de forma precisa el tratamiento activo</strong> (por ejemplo: <em>recibió 250 mg IV NAD⁺ ayer a las 14:00</em>, más dosis y hora de NAD oral) y <strong>estandarizar el intervalo de extracción</strong> para futuras comparativas.
              </>
            ) : (
              <>
                <strong>If the clinical goal is evaluating response to an active regimen:</strong> Do NOT introduce a 2–3 week washout period or discontinue oral NAD. The critical clinical priority is to <strong>accurately record active treatment parameters</strong> (e.g. <em>received 250 mg IV NAD⁺ yesterday at 14:00</em>, alongside oral dose/timing) and <strong>standardise blood collection timing</strong> relative to doses for serial follow-up.
              </>
            )}
          </p>
        </div>
      </div>

      {/* ── Category Filter Pills ── */}
      <div className="bnf-filter-bar">
        <button
          type="button"
          className={`bnf-filter-tab ${activeCategory === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          {isEs ? `Todas las Preguntas (${faqs.length})` : `All Clinical Questions (${faqs.length})`}
        </button>

        <button
          type="button"
          className={`bnf-filter-tab bnf-filter-tab-active ${activeCategory === 'protocol_monitoring' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('protocol_monitoring')}
        >
          <span className="bnf-tab-dot bnf-dot-green" />
          {isEs ? 'Monitorización de Protocolo Activo' : 'Active Protocol Monitoring (On-Treatment)'}
        </button>

        <button
          type="button"
          className={`bnf-filter-tab ${activeCategory === 'baseline' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('baseline')}
        >
          <span className="bnf-tab-dot bnf-dot-amber" />
          {isEs ? 'Lavado / Estado Basal' : 'Baseline Assessment & Washout'}
        </button>

        <button
          type="button"
          className={`bnf-filter-tab ${activeCategory === 'preparation' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('preparation')}
        >
          <span className="bnf-tab-dot bnf-dot-blue" />
          {isEs ? 'Preparación (Ayuno, Ejercicio, Medicación)' : 'Patient Prep (Fasting, Exercise, Meds)'}
        </button>
      </div>

      {/* ── FAQ Accordion List ── */}
      <div className="bnf-accordion-list">
        {filteredFaqs.map((faq, index) => {
          const isOpen = openIds.has(faq.id);
          const qText = isEs ? faq.questionEs : faq.questionEn;
          const aText = isEs ? faq.answerEs : faq.answerEn;
          const isProtocolCategory = faq.category === 'protocol_monitoring';

          return (
            <div
              key={faq.id}
              className={`bnf-faq-item ${isOpen ? 'is-open' : ''} ${isProtocolCategory ? 'is-protocol-card' : ''}`}
            >
              <div
                className="bnf-faq-question-row"
                onClick={() => toggleAccordion(faq.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleAccordion(faq.id);
                  }
                }}
              >
                <div className="bnf-q-left">
                  <span className="bnf-q-number">{index + 1}</span>
                  <div className="bnf-q-content">
                    <div className="bnf-q-meta">
                      <span className={`bnf-tag-pill bnf-tag-${faq.category || 'default'}`}>
                        {faq.tag || (isProtocolCategory ? 'Protocol Monitoring' : 'Guideline')}
                      </span>
                    </div>
                    <h4 className="bnf-q-text">{qText}</h4>
                  </div>
                </div>

                <div className="bnf-q-right">
                  <div className="bnf-chevron-box">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="bnf-faq-answer-block">
                  <div className="bnf-answer-text">
                    {aText.split('\n').map((line, idx) => (
                      <p key={idx} className={line.startsWith('•') ? 'bnf-bullet-line' : 'bnf-text-line'}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer Medical Governance Note ── */}
      <div className="bnf-card-footer">
        <div className="bnf-footer-meta">
          <ShieldCheck size={16} className="bnf-footer-shield" />
          <span>
            {isEs
              ? 'Guía clínica adaptada bajo criterios farmacológicos de monitorización celular. Laboratorio central: LifeLab1 (Vilna, Lituania) / Directiva CE-IVDR.'
              : 'Formulated in accordance with clinical pharmacokinetic monitoring standards. Central Laboratory: LifeLab1 (Vilnius, EU) / CE-IVDR Compliant.'}
          </span>
        </div>
      </div>
    </section>
  );
}
