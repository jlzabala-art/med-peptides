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
    tag: 'Overview & Target',
    questionEn: 'What does the NAD test measure?',
    questionEs: '¿Qué mide exactamente la prueba de NAD?',
    answerEn: 'The test measures total cellular NAD (NAD⁺ and NADH) status in blood via capillary dried blood spot (DBS), providing an objective indication of the patient’s current intracellular NAD availability and mitochondrial redox capacity.',
    answerEs: 'La prueba cuantifica el estado celular total de NAD (NAD⁺ y NADH) en sangre mediante mancha de sangre seca capilar (DBS), proporcionando un indicador objetivo de la disponibilidad intracelular de NAD y la capacidad redox mitocondrial.'
  },
  {
    id: 'faq-nad-02',
    category: 'protocol_monitoring',
    tag: 'Clinical Intent & Strategy',
    questionEn: 'Testing Intent: Baseline Level vs. Active Protocol Therapeutic Monitoring',
    questionEs: 'Objetivo de la prueba: Nivel basal vs. Monitorización terapéutica de protocolo activo',
    answerEn: 'Before scheduling the test, clarify the primary clinical objective with the physician:\n• Baseline Assessment: Evaluates unsupplemented native NAD status prior to therapy (requires temporary washout of precursors).\n• Protocol Therapeutic Monitoring: Evaluates cellular response and precursor bioavailability while on an active regimen to assess efficacy and adjust dosage (does NOT require stopping treatment or a long washout).',
    answerEs: 'Antes de realizar la prueba, defina con el médico el objetivo clínico prioritario:\n• Evaluación Basal: Determina el nivel endógeno sin suplementación previo al inicio de una terapia (requiere suspensión previa de precursores).\n• Monitorización de Protocolo Activo: Evalúa la respuesta biológica y biodisponibilidad durante el tratamiento para calibrar dosis y pautas (NO requiere suspender el tratamiento ni períodos de lavado prolongados).'
  },
  {
    id: 'faq-nad-03',
    category: 'protocol_monitoring',
    tag: 'Active Protocol (Recommended)',
    questionEn: 'I am already on an active NAD protocol (oral or IV). Should I stop my treatment?',
    questionEs: 'Ya estoy en un protocolo activo de NAD (oral o intravenoso). ¿Debo suspender el tratamiento?',
    answerEn: 'No. If the objective is to assess therapeutic response to your current protocol and obtain an in-treatment snapshot to guide dosage adjustment, you should NOT stop oral NAD/precursors or introduce a 2–3 week washout period. Stopping would eliminate the active metabolic state the clinician intends to evaluate.',
    answerEs: 'No. Si el objetivo es valorar la respuesta terapéutica al protocolo actual y obtener una medición en tratamiento para ajustar la pauta, NO debe suspender el NAD oral ni introducir un lavado de 2–3 semanas. Suspender el tratamiento eliminaría el estado metabólico activo que el médico busca evaluar.'
  },
  {
    id: 'faq-nad-04',
    category: 'protocol_monitoring',
    tag: 'Clinical Documentation',
    questionEn: 'What clinical information must be documented if testing during an active protocol?',
    questionEs: '¿Qué información clínica debe registrarse si la prueba se realiza durante un tratamiento activo?',
    answerEn: 'Precise clinical documentation is essential for consistent interpretation:\n• Acute therapy details: e.g., "Received 250 mg IV NAD⁺ infusion yesterday at 14:00".\n• Active oral regimen: exact compound (NMN, NR, NAD⁺), daily dosage, and timing of the last dose prior to capillary blood sampling.',
    answerEs: 'Es fundamental documentar de forma precisa:\n• Terapia parenteral reciente: ej. "Recibió infusión IV de 250 mg de NAD⁺ ayer a las 14:00".\n• Pauta oral actual: compuesto exacto (NMN, NR, NAD⁺), dosis diaria y momento de la última toma respecto a la extracción capilar.'
  },
  {
    id: 'faq-nad-05',
    category: 'protocol_monitoring',
    tag: 'Serial Tracking & Comparability',
    questionEn: 'How should sample timing be standardised for serial follow-up tests?',
    questionEs: '¿Cómo debe estandarizarse el momento de toma de muestra para pruebas de seguimiento comparables?',
    answerEn: 'For serial follow-up tests, standardise the timing of blood collection in relation to your IV infusion and oral dose (e.g., consistently 24 hours post-IV infusion, or in the morning before daily oral dosing). This consistency ensures future results are directly comparable and clinically useful for fine-tuning the protocol.',
    answerEs: 'Para monitorizaciones periódicas, estandarice la ventana horaria de toma de muestra respecto a la infusión IV y la toma oral (ej. siempre 24 horas después de la infusión, o por la mañana antes de la dosis oral diaria). Esta uniformidad permite comparar resultados de forma rigurosa para ajustar la pauta médica.'
  },
  {
    id: 'faq-nad-06',
    category: 'baseline',
    tag: 'Baseline Washout Guidelines',
    questionEn: 'What if the objective IS to measure unsupplemented baseline NAD status? (Washout Guidelines)',
    questionEs: '¿Y si el objetivo clínico SÍ es conocer el nivel basal de NAD sin tratamiento? (Pautas de lavado)',
    answerEn: 'If the clinical goal is to assess native baseline NAD status before starting therapy:\n• Oral Precursors (NMN, NR, Niacin, Nicotinamide): Ideally stop NAD-boosting supplements for approximately 2–3 weeks before testing, if clinically appropriate.\n• IV NAD⁺ Therapy: Avoid testing immediately after an infusion. While universal washout consensus is limited, allowing at least several days to a few weeks is a reasonable, prudent practical approach.',
    answerEs: 'Si el objetivo médico es determinar el nivel basal puro antes de iniciar un tratamiento:\n• Suplementos orales (NMN, NR, Niacin, Nicotinamida): Suspender idealmente durante 2–3 semanas previas a la prueba, bajo criterio clínico.\n• Terapia IV de NAD⁺: Evitar la toma de muestra inmediatamente tras una infusión. Aunque no hay un consenso universal de washout, dejar transcurrir varios días o semanas es un criterio clínico prudente y razonable.'
  },
  {
    id: 'faq-nad-07',
    category: 'preparation',
    tag: 'Pre-Test Fasting',
    questionEn: 'Do I need to fast before the test?',
    questionEs: '¿Es necesario acudir en ayunas para la prueba?',
    answerEn: 'Unless otherwise instructed by your physician, fasting is generally not required for the capillary dried blood spot NAD test. However, for follow-up testing and longitudinal monitoring, it is advisable to collect samples under similar dietary and time-of-day conditions each time.',
    answerEs: 'Salvo indicación expresa de su médico, el ayuno estricto generalmente no es obligatorio para el test capilar DBS de NAD. Sin embargo, para monitorización evolutiva, es muy aconsejable tomar la muestra en condiciones similares de hidratación y horario.'
  },
  {
    id: 'faq-nad-08',
    category: 'preparation',
    tag: 'Prescription Medication',
    questionEn: 'Can I take my normal medications?',
    questionEs: '¿Puedo tomar mis medicamentos habituales?',
    answerEn: 'Do not discontinue prescribed chronic medication solely for an NAD test unless explicitly instructed by your physician. Please report all current medications and therapies on the clinical intake form.',
    answerEs: 'No suspenda medicación prescrita únicamente con motivo del test de NAD, salvo indicación expresa de su médico. Por favor reporte todos sus fármacos activos en la ficha clínica previa.'
  },
  {
    id: 'faq-nad-09',
    category: 'preparation',
    tag: 'Vitamins & Cofactors',
    questionEn: 'What about other vitamins and supplements?',
    questionEs: '¿Qué ocurre con otras vitaminas y suplementos?',
    answerEn: 'Please report any supplements that may influence NAD metabolism or salvage pathways, particularly NMN, NR, niacin (vitamin B3), nicotinamide, TMG (trimethylglycine), and CD38 inhibitors (apigenin, quercetin).',
    answerEs: 'Debe comunicar cualquier suplemento que influya en las rutas de salvamento del NAD, especialmente NMN, NR, niacina (vitamina B3), nicotinamida, TMG (trimetilglicina) e inhibidores de CD38 (apigenina, quercetina).'
  },
  {
    id: 'faq-nad-10',
    category: 'preparation',
    tag: 'Circadian Timing',
    questionEn: 'What is the best time of day to take the test?',
    questionEs: '¿Cuál es el mejor momento del día para realizar la prueba?',
    answerEn: 'NAD levels fluctuate following circadian biological rhythms. For serial monitoring over time, consistency is key. Ideally, repeat samples should be collected at approximately the same time of day (preferably morning) under rested conditions.',
    answerEs: 'Los niveles de NAD presentan oscilaciones circadianas. Para monitorización longitudinal, la consistencia horaria es clave: recoja las muestras de seguimiento aproximadamente a la misma hora del día (preferiblemente por la mañana) y en reposo.'
  },
  {
    id: 'faq-nad-11',
    category: 'preparation',
    tag: 'Physical Exercise',
    questionEn: 'Can exercise affect the test result?',
    questionEs: '¿Puede el ejercicio físico alterar el resultado?',
    answerEn: 'Yes. Strenuous exercise influences cellular energy metabolism, mitochondrial ATP demand, and NAD⁺/NADH turnover. For the most comparable measurements, avoid unusually strenuous exercise immediately before testing and keep pre-test physical activity habitual.',
    answerEs: 'Sí. El ejercicio físico intenso altera la demanda bioenergética mitocondrial y el recambio de NAD⁺/NADH. Para obtener mediciones comparables, evite entrenamientos extenuantes no habituales las 24 horas previas a la extracción.'
  },
  {
    id: 'faq-nad-12',
    category: 'clinical',
    tag: 'Pre-Test Clinical Checklist',
    questionEn: 'What clinical information should I provide before testing?',
    questionEs: '¿Qué información clínica debo facilitar antes de realizar la prueba?',
    answerEn: 'Ideally provide: patient age, active prescription medications, dietary supplements, specific NAD/NMN/NR precursor usage, IV NAD⁺ therapy history (including dose, e.g. 250 mg, and timestamp of the last infusion).',
    answerEs: 'Idealmente reporte: edad del paciente, medicación prescrita activa, suplementos nutricionales, uso de precursores NAD/NMN/NR, e historial de infusiones IV de NAD⁺ (incluyendo dosis, ej. 250 mg, y fecha/hora exacta de la última infusión).'
  },
  {
    id: 'faq-nad-13',
    category: 'clinical',
    tag: 'Diagnostic Scope & Regulatory',
    questionEn: 'Is the Bloodo™ NAD test a diagnostic test?',
    questionEs: '¿Es la prueba de NAD de Bloodo™ un test diagnóstico de enfermedades?',
    answerEn: 'The Bloodo™ NAD test is a quantitative cellular biomarker assessment. Results must be interpreted in conjunction with the patient’s full clinical context by a licensed healthcare provider, and should not be used in isolation to diagnose a medical pathology or make unilateral therapeutic changes.',
    answerEs: 'La prueba de NAD de Bloodo™ es una evaluación cuantitativa de biomarcadores celulares. Los resultados deben ser interpretados por un médico cualificado dentro del contexto clínico integral del paciente, y no deben utilizarse de forma aislada para diagnosticar patologías ni modificar tratamientos unilateralmente.'
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
  const [openIds, setOpenIds] = useState(() => new Set(['faq-nad-02', 'faq-nad-03']));
  const [copiedId, setCopiedId] = useState(null);
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

  const handleShareWhatsAppSingle = (faq) => {
    const q = isEs ? faq.questionEs : faq.questionEn;
    const a = isEs ? faq.answerEs : faq.answerEn;
    const tag = faq.tag || 'Clinical Guidance';
    const text = `*Bloodo™ NAD Test FAQ — ${tag}*\n\n*Q: ${q}*\n\n${a}\n\n_Med-Peptides Clinical Intelligence • Bloodo UAB (Vilnius, EU)_`;

    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    
    // Open WhatsApp in new tab/app
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopySingle = async (faq) => {
    const q = isEs ? faq.questionEs : faq.questionEn;
    const a = isEs ? faq.answerEs : faq.answerEn;
    const tag = faq.tag || 'Clinical Guidance';
    const text = `*Bloodo™ NAD Test FAQ — ${tag}*\n\n*Q: ${q}*\n\n${a}\n\n_Med-Peptides Clinical Intelligence • Bloodo UAB_`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(faq.id);
      toast.success(isEs ? 'Respuesta copiada para WhatsApp' : 'Answer copied for WhatsApp sharing');
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      toast.error('Could not copy to clipboard');
    }
  };

  const handleShareWhatsAppAll = () => {
    const headerTitle = isEs
      ? '*Guía Rápida para Pacientes — Test Capilar de NAD (Bloodo™)*'
      : '*Patient Clinical FAQ & Guidance — Bloodo™ NAD Test*';

    const intentSection = isEs
      ? `*1. OBJETIVO CLÍNICO Y MONITORIZACIÓN:*
• *Si está en protocolo activo (ej. NMN/NR o IV NAD+):* NO suspenda el tratamiento ni haga lavado. El médico busca evaluar la respuesta terapéutica en curso.
• *Registro clave:* Anotar dosis y momento exacto de la última toma o infusión (ej. "250 mg IV ayer a las 14:00").
• *Si busca nivel basal sin tratamiento:* Suspenda precursores orales 2-3 semanas antes (bajo criterio médico).`
      : `*1. CLINICAL OBJECTIVE & PROTOCOL MONITORING:*
• *On Active Protocol (evaluating response):* DO NOT stop oral NAD/precursors or introduce a 2-3 week washout. The physician wants an in-treatment snapshot to calibrate dosing.
• *Critical Record:* Document exact dose & timestamp of last dose or IV infusion (e.g. "Received 250 mg IV NAD+ yesterday at 14:00").
• *Baseline Native Assessment:* Stop oral precursors 2-3 weeks prior (if clinically appropriate).`;

    const prepSection = isEs
      ? `*2. PREPARACIÓN Y TOMA DE MUESTRA:*
• *Ayuno:* No es estrictamente obligatorio; se recomienda consistencia horaria (mañanas en reposo).
• *Medicamentos:* No suspenda fármacos prescritos.
• *Ejercicio:* Evite ejercicio extenuante 24h antes.
• *Seguimiento comparativo:* Mantenga el mismo intervalo horario entre su dosis e infusión y la toma de sangre en futuros tests.`
      : `*2. PRE-TEST PREPARATION & TIMING:*
• *Fasting:* Generally not required; time-of-day consistency (morning rested) is recommended.
• *Medications:* Do NOT discontinue prescribed chronic medications.
• *Exercise:* Avoid strenuous workouts for 24h prior.
• *Serial Tracking:* Maintain consistent intervals between treatment administration and blood collection.`;

    const footer = `_Consultas médicas: business@med-peptides.com • LifeLab1 (Vilna, Lituania) / CE-IVDR_`;
    const fullText = `${headerTitle}\n\n${intentSection}\n\n${prepSection}\n\n${footer}`;

    const encoded = encodeURIComponent(fullText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyAll = async () => {
    const headerTitle = isEs
      ? '*Guía Rápida para Pacientes — Test Capilar de NAD (Bloodo™)*'
      : '*Patient Clinical FAQ & Guidance — Bloodo™ NAD Test*';

    const intentSection = isEs
      ? `*1. OBJETIVO CLÍNICO Y MONITORIZACIÓN:*
• *Si está en protocolo activo (ej. NMN/NR o IV NAD+):* NO suspenda el tratamiento ni haga lavado. El médico busca evaluar la respuesta terapéutica en curso.
• *Registro clave:* Anotar dosis y momento exacto de la última toma o infusión (ej. "250 mg IV ayer a las 14:00").
• *Si busca nivel basal sin tratamiento:* Suspenda precursores orales 2-3 semanas antes (bajo criterio médico).`
      : `*1. CLINICAL OBJECTIVE & PROTOCOL MONITORING:*
• *On Active Protocol (evaluating response):* DO NOT stop oral NAD/precursors or introduce a 2-3 week washout. The physician wants an in-treatment snapshot to calibrate dosing.
• *Critical Record:* Document exact dose & timestamp of last dose or IV infusion (e.g. "Received 250 mg IV NAD+ yesterday at 14:00").
• *Baseline Native Assessment:* Stop oral precursors 2-3 weeks prior (if clinically appropriate).`;

    const prepSection = isEs
      ? `*2. PREPARACIÓN Y TOMA DE MUESTRA:*
• *Ayuno:* No es estrictamente obligatorio; se recomienda consistencia horaria (mañanas en reposo).
• *Medicamentos:* No suspenda fármacos prescritos.
• *Ejercicio:* Evite ejercicio extenuante 24h antes.
• *Seguimiento comparativo:* Mantenga el mismo intervalo horario entre su dosis e infusión y la toma de sangre en futuros tests.`
      : `*2. PRE-TEST PREPARATION & TIMING:*
• *Fasting:* Generally not required; time-of-day consistency (morning rested) is recommended.
• *Medications:* Do NOT discontinue prescribed chronic medications.
• *Exercise:* Avoid strenuous workouts for 24h prior.
• *Serial Tracking:* Maintain consistent intervals between treatment administration and blood collection.`;

    const footer = `_Consultas médicas: business@med-peptides.com • LifeLab1 (Vilna, Lituania) / CE-IVDR_`;
    const fullText = `${headerTitle}\n\n${intentSection}\n\n${prepSection}\n\n${footer}`;

    try {
      await navigator.clipboard.writeText(fullText);
      setIsCopiedAll(true);
      toast.success(isEs ? 'Guía completa copiada para WhatsApp' : 'Complete patient guide copied for WhatsApp');
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
                {isEs ? 'Pauta de Pacientes' : 'Patient Clinical FAQ'}
              </span>
            </div>
            <h3 className="bnf-title">
              {isEs ? 'Preguntas Frecuentes y Pautas Clínicas (Test de NAD)' : 'NAD Test – Frequently Asked Questions & Clinical Guidelines'}
            </h3>
            <p className="bnf-subtitle">
              {isEs
                ? 'Información rigurosa en lenguaje médico claro, diseñada para resolver dudas y compartir pautas directamente con pacientes.'
                : 'Pharma-grade clinical guidance designed for rapid practitioner reference and 1-click sharing with patients via WhatsApp.'}
            </p>
          </div>
        </div>

        {/* Global WhatsApp Share CTA */}
        <div className="bnf-header-actions">
          <button
            type="button"
            className="bnf-wa-btn bnf-wa-btn-primary"
            onClick={handleShareWhatsAppAll}
            title={isEs ? 'Compartir resumen de pautas por WhatsApp' : 'Share comprehensive patient summary via WhatsApp'}
          >
            <span className="bnf-wa-icon-circle">💬</span>
            <span>{isEs ? 'Enviar Guía por WhatsApp' : 'Share Guide on WhatsApp'}</span>
          </button>

          <button
            type="button"
            className="bnf-wa-btn bnf-wa-btn-secondary"
            onClick={handleCopyAll}
            title={isEs ? 'Copiar texto formateado para WhatsApp' : 'Copy formatted WhatsApp text to clipboard'}
          >
            {isCopiedAll ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
            <span>{isCopiedAll ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar para WhatsApp' : 'Copy WhatsApp Text')}</span>
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
          const isCopied = copiedId === faq.id;
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

                  {/* Per-Question WhatsApp Share & Copy Strip */}
                  <div className="bnf-answer-actions">
                    <button
                      type="button"
                      className="bnf-action-btn bnf-action-wa"
                      onClick={() => handleShareWhatsAppSingle(faq)}
                      title={isEs ? 'Compartir esta respuesta por WhatsApp' : 'Share this specific answer via WhatsApp'}
                    >
                      <span style={{ fontSize: '0.85rem' }}>💬</span>
                      <span>{isEs ? 'Compartir por WhatsApp' : 'Share on WhatsApp'}</span>
                    </button>

                    <button
                      type="button"
                      className="bnf-action-btn bnf-action-copy"
                      onClick={() => handleCopySingle(faq)}
                      title={isEs ? 'Copiar texto formateado de esta respuesta' : 'Copy formatted text for WhatsApp messaging'}
                    >
                      {isCopied ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                      <span>{isCopied ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Texto' : 'Copy Text')}</span>
                    </button>
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
