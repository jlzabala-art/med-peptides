"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Syringe,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles,
  Lock,
  ExternalLink,
  Download
} from '@/lib/icons';
import toast from 'react-hot-toast';
import './InteractiveTrocarPelletGuide.css';

const STEPS_DATA = [
  {
    step: 1,
    id: 'site-selection',
    tagEn: 'Phase 1 · Anatomic Mapping',
    tagEs: 'Fase 1 · Mapeo Anatómico',
    titleEn: 'Site Selection & Antiseptic Preparation',
    titleEs: 'Selección Anatómica & Preparación Aséptica',
    descEn: 'The primary anatomical site is the upper outer quadrant of the buttock, 3 to 5 cm below the posterior iliac crest. This region offers dense subcutaneous adipose tissue, low vascularity, and complete freedom from sciatic nerve contact and sitting compression.',
    descEs: 'El sitio anatómico de primera elección es el cuadrante súpero-externo del glúteo, 3 a 5 cm por debajo de la cresta ilíaca posterior. Esta región ofrece abundante tejido celular subcutáneo, baja vascularización y nula compresión al sentarse.',
    svgType: 'anatomy',
    clinicalSpecsEn: 'Cleanse with Chlorhexidine Gluconate 2% in 70% Isopropyl Alcohol. Allow 2 minutes of sterile air dry.',
    clinicalSpecsEs: 'Asepsia con Clorhexidina al 2% en alcohol isopropílico 70%. Dejar secar 2 minutos al aire estéril.',
    dangerWarningEn: 'CRITICAL: Never insert pellets medially or inferiorly towards the sciatic notch or directly over the gluteal muscular fascia.',
    dangerWarningEs: 'CRÍTICO: Nunca insertar hacia la escotadura ciática medial o directamente sobre la fascia muscular profunda.'
  },
  {
    step: 2,
    id: 'local-anesthesia',
    tagEn: 'Phase 2 · Local Tumescence',
    tagEs: 'Fase 2 · Tumescencia Local',
    titleEn: 'Buffered Infiltrative Anesthesia',
    titleEs: 'Anestesia Local Infiltrativa Amortiguada',
    descEn: 'Perform three-plane infiltration using a 27G x 1.5-inch needle: first a 0.3 mL intradermal wheal, followed by 1.5 mL fan-pattern infiltration into the planned 3.5 cm subcutaneous track.',
    descEs: 'Infiltración en tres planos con aguja 27G x 1.5": primero una pápula intradérmica de 0.3 mL, seguida de 1.5 mL en abanico a lo largo del túnel subcutáneo planificado de 3.5 cm.',
    svgType: 'anesthesia',
    clinicalSpecsEn: 'Buffered Solution: 1.8 mL 2% Lidocaine with Epinephrine (1:100,000) + 0.2 mL 8.4% Sodium Bicarbonate.',
    clinicalSpecsEs: 'Solución Amortiguada: 1.8 mL Lidocaína al 2% con Epinefrina (1:100.000) + 0.2 mL Bicarbonato de Sodio 8.4%.',
    dangerWarningEn: 'Wait a strict 3 minutes for epinephrine vasoconstriction to establish a completely bloodless field.',
    dangerWarningEs: 'Esperar 3 minutos estrictos para que la epinefrina induzca vasoconstricción plena y campo exangüe.'
  },
  {
    step: 3,
    id: 'micro-incision',
    tagEn: 'Phase 3 · Skin Access',
    tagEs: 'Fase 3 · Acceso Cutáneo',
    titleEn: '3.5 mm Precision Micro-Incision',
    titleEs: 'Micro-Incisión Quirúrgica de 3.5 mm',
    descEn: 'Using a #11 surgical scalpel, make a sharp 3.5 mm to 4.0 mm vertical puncture matching the exact diameter of the 3.2 mm or 4.5 mm trocar. The cut must traverse only the epidermal and dermal layers.',
    descEs: 'Con bisturí quirúrgico #11, realizar una micro-incisión de 3.5 a 4.0 mm acorde al diámetro del trócar (3.2 mm o 4.5 mm). El corte debe atravesar estrictamente la epidermis y la dermis.',
    svgType: 'incision',
    clinicalSpecsEn: 'Follow Langer’s skin cleavage lines to ensure imperceptible scar maturation.',
    clinicalSpecsEs: 'Seguir las líneas de tensión dérmica de Langer para asegurar cicatrización invisible.',
    dangerWarningEn: 'Do not make the incision too wide (>5 mm), as an oversized incision significantly increases pellet extrusion risk.',
    dangerWarningEs: 'No realizar una incisión superior a 5 mm; incisiones sobredimensionadas aumentan el riesgo de extrusión.'
  },
  {
    step: 4,
    id: 'trocar-cannulation',
    tagEn: 'Phase 4 · Trocar Cannulation',
    tagEs: 'Fase 4 · Canalización con Trócar',
    titleEn: '30° Dermal Puncture & 0° Horizontal Leveling',
    titleEs: 'Entrada a 30° & Nivelación Horizontal a 0°',
    descEn: 'Introduce the beveled trocar at a 30° angle through the incision to clear the dermis. Immediately upon feeling the loss of resistance in the subcutaneous fat, drop the trocar barrel parallel (0° to 10°) to the deep muscular fascia.',
    descEs: 'Introducir el trócar biselado a 30° a través de la incisión para franquear la dermis. Al sentir la pérdida de resistencia en el tejido adiposo, abatir de inmediato el cuerpo del trócar a 0°-10° paralelo a la fascia.',
    svgType: 'trocar',
    clinicalSpecsEn: 'Advance smoothly 3.5 to 4.0 cm into the superficial subcutaneous fat layer without twisting.',
    clinicalSpecsEs: 'Avanzar suavemente 3.5 a 4.0 cm en el plano adiposo superficial sin movimientos de torsión bruscos.',
    dangerWarningEn: 'NEVER force the trocar into deep muscle. Pellets must reside strictly in well-perfused subcutaneous fat.',
    dangerWarningEs: 'NUNCA forzar el trócar en músculo. Los pellets deben residir estrictamente en la grasa subcutánea.'
  },
  {
    step: 5,
    id: 'pellet-deployment',
    tagEn: 'Phase 5 · Atraumatic Deposition',
    tagEs: 'Fase 5 · Desnudamiento Atraumático',
    titleEn: 'Trocar Withdrawal Deployment (Zero-Force)',
    titleEs: 'Técnica de Desnudamiento por Retroceso',
    descEn: 'Remove the blunt obturator. Load the sterile bioidentical pellets into the cannula using non-toothed Adson forceps. Re-insert the blunt obturator against the pellets. Hold the obturator fixed while withdrawing the outer cannula 2 cm.',
    descEs: 'Retirar el obturador interno. Cargar los pellets estériles con pinzas Adson sin dientes. Reintroducir el obturador apoyándolo contra el pellet. Sostener el obturador fijo y retirar la cánula exterior 2 cm hacia atrás.',
    svgType: 'deployment',
    clinicalSpecsEn: 'Pellets are released into the tissue pocket by cannula retraction, NOT by pushing the obturator forward.',
    clinicalSpecsEs: 'El pellet se deposita por desnudamiento de la cánula, NUNCA empujando el obturador con fuerza.',
    dangerWarningEn: 'Pure crystalline pellets have zero polymer binders. Excessive forward pressure can crush the pellet cylinder.',
    dangerWarningEs: 'Los pellets son cristalinos puros sin aglutinantes. Presión excesiva hacia adelante puede fracturarlos.'
  },
  {
    step: 6,
    id: 'sutureless-closure',
    tagEn: 'Phase 6 · Post-Op Protocol',
    tagEs: 'Fase 6 · Cierre & Postoperatorio',
    titleEn: 'Sutureless Steri-Strip Closure & Pressure Dressing',
    titleEs: 'Cierre Atraumático con Steri-Strips & Apósito',
    descEn: 'Appose the skin edges and apply two sterile Steri-Strips in a cross pattern. Cover with a waterproof transparent pressure dressing (Tegaderm). No sutures are required, ensuring zero stitch marks.',
    descEs: 'Aproximar los bordes cutáneos y aplicar dos Steri-Strips estériles en cruz. Cubrir con apósito transparente impermeable a presión. No se requieren suturas, evitando marcas cicatriciales.',
    svgType: 'closure',
    clinicalSpecsEn: 'Post-op rules: Keep dressing dry for 48 hours. No deep squats, lower-body gym training, or immersion for 5 days.',
    clinicalSpecsEs: 'Reglas postoperatorias: Mantener seco 48 horas. Sin sentadillas pesadas ni inmersión durante 5 días.',
    dangerWarningEn: 'Compliance with the 5-day lower-body rest protocol achieves a documented extrusion rate of < 0.3%.',
    dangerWarningEs: 'El reposo de glúteos durante 5 días asegura una tasa documentada de extrusión inferior al 0.3%.'
  }
];

export default function InteractiveTrocarPelletGuide({ lang = 'en' }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedPatientGuide, setCopiedPatientGuide] = useState(false);
  const isEs = lang === 'es';

  const currentStep = STEPS_DATA[activeStepIndex];

  const handleCopyPatientCare = async () => {
    const text = isEs
      ? `🏥 *Atlas Health Services — Pautas Post-Implante de Pellets Hormonales*
1. *Primeras 48 Horas*: Mantener el vendaje impermeable completamente seco e intacto.
2. *Días 1 a 5*: Evitar sentadillas pesadas, ciclismo o esfuerzos vigorosos de glúteos.
3. *Higiene*: Ducha rápida a partir de las 48h sin retirar las tiras Steri-Strips. Dejar secar al aire.
4. *Retirada de Tiras*: Las Steri-Strips se desprenden solas entre los días 5 y 7.
5. *Seguimiento*: Analítica hormonal de control a las 4 semanas.`
      : `🏥 *Atlas Health Services — Post-Trocar Hormone Pellet Patient Care*
1. *First 48 Hours*: Keep the pressure dressing completely dry and intact.
2. *Days 1 to 5*: Avoid heavy squats, cycling, running, or strenuous lower-body strain.
3. *Showering*: Gentle shower allowed after 48h without peeling Steri-Strips. Pat dry.
4. *Steri-Strip Removal*: Strips naturally fall off between days 5 and 7.
5. *Follow-Up*: Scheduled serum telemetry bloodwork at 4 weeks.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedPatientGuide(true);
      toast.success(isEs ? 'Pautas para el paciente copiadas ✓' : 'Patient discharge instructions copied ✓');
      setTimeout(() => setCopiedPatientGuide(false), 2500);
    } catch {
      toast.error('Could not copy instructions');
    }
  };

  return (
    <div className="trocar-guide-container">
      {/* ── HEADER ── */}
      <div className="trocar-guide-header">
        <div className="trocar-guide-title-row">
          <Syringe size={22} />
          <div>
            <h3 className="trocar-guide-title">
              {isEs ? 'Guía Clínica de Implantación con Trócar' : 'Clinical Trocar Implantation Visual Guide'}
            </h3>
            <p className="trocar-guide-subtitle">
              {isEs
                ? 'Protocolo quirúrgico estéril de 10 minutos para pellets subcutáneos · Pharmapolis EU GMP'
                : '10-minute sterile subcutaneous pellet outpatient protocol · Pharmapolis EU GMP'}
            </p>
          </div>
        </div>
        <span className="trocar-guide-badge">
          {isEs ? 'Mejores Prácticas Quirúrgicas' : 'Surgical Best Practices'}
        </span>
      </div>

      {/* ── STEP PROGRESSION TRACK ── */}
      <div className="trocar-step-track">
        {STEPS_DATA.map((s, idx) => {
          const isActive = activeStepIndex === idx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveStepIndex(idx)}
              className={`trocar-step-btn ${isActive ? 'active' : ''}`}
            >
              <span className="trocar-step-btn-num">
                {isEs ? `Paso 0${s.step}` : `Step 0${s.step}`}
              </span>
              <span className="trocar-step-btn-label">
                {isEs ? s.titleEs : s.titleEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── INTERACTIVE BODY (GRAPHIC SVG + CLINICAL SPEC) ── */}
      <div className="trocar-step-body">
        {/* Left: Interactive Vector Medical Illustration */}
        <div className="trocar-visual-stage">
          {currentStep.svgType === 'anatomy' && (
            <svg viewBox="0 0 380 200" className="trocar-svg-canvas">
              <rect x="20" y="20" width="340" height="160" rx="10" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
              {/* Buttock Outline */}
              <path d="M 60 160 C 70 70, 150 40, 220 50 C 290 60, 320 120, 320 160" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2" />
              {/* Crest Line */}
              <path d="M 90 65 Q 160 45 230 55" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 4" />
              <text x="110" y="42" fill="#1e40af" fontSize="10" fontWeight="700">Crista Iliaca Posterior</text>
              {/* Target Insertion Zone */}
              <circle cx="165" cy="85" r="22" fill="#16a34a" fillOpacity="0.25" stroke="#16a34a" strokeWidth="2" />
              <circle cx="165" cy="85" r="4" fill="#15803d" />
              <text x="195" y="88" fill="#15803d" fontSize="11" fontWeight="800">
                {isEs ? 'Zona de Implante (Segura)' : 'Target Safe Zone'}
              </text>
              <text x="195" y="102" fill="#475569" fontSize="9">3-5 cm sub-cresta ilíaca</text>
              {/* Danger Zone: Sciatic Notch */}
              <circle cx="240" cy="140" r="14" fill="#ef4444" fillOpacity="0.2" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="2 2" />
              <text x="210" y="165" fill="#dc2626" fontSize="9" fontWeight="700">Nervus Ischiadicus (Peligro)</text>
            </svg>
          )}

          {currentStep.svgType === 'anesthesia' && (
            <svg viewBox="0 0 380 200" className="trocar-svg-canvas">
              {/* Skin Surface */}
              <rect x="30" y="50" width="320" height="18" fill="#fed7aa" stroke="#f97316" strokeWidth="1.5" rx="3" />
              <text x="40" y="42" fill="#c2410c" fontSize="10" fontWeight="700">Epidermis & Dermis (3 mm)</text>
              {/* Adipose Subcutaneous Layer */}
              <rect x="30" y="70" width="320" height="90" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1.5" rx="3" />
              <text x="40" y="85" fill="#b45309" fontSize="10" fontWeight="700">Tejido Celular Subcutáneo (Grasa)</text>
              {/* Needle Path */}
              <line x1="80" y1="20" x2="160" y2="105" stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
              <circle cx="160" cy="105" r="18" fill="#38bdf8" fillOpacity="0.35" stroke="#0284c7" strokeWidth="1.5" />
              <text x="185" y="105" fill="#0369a1" fontSize="10" fontWeight="800">Tumescencia Lidocaína + Epi</text>
              <text x="185" y="118" fill="#64748b" fontSize="8.5">Infiltración en abanico 1.8 mL</text>
            </svg>
          )}

          {currentStep.svgType === 'incision' && (
            <svg viewBox="0 0 380 200" className="trocar-svg-canvas">
              <rect x="40" y="60" width="300" height="40" fill="#ffedd5" stroke="#fdba74" strokeWidth="2" rx="4" />
              {/* #11 Blade Graphic */}
              <polygon points="120,20 170,80 160,80 110,20" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              <line x1="165" y1="80" x2="195" y2="80" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
              <text x="145" y="115" fill="#dc2626" fontSize="11" fontWeight="800">Micro-incisión: 3.5 mm</text>
              <text x="120" y="132" fill="#64748b" fontSize="9">Solo dermis · Respeta líneas de Langer</text>
            </svg>
          )}

          {currentStep.svgType === 'trocar' && (
            <svg viewBox="0 0 380 200" className="trocar-svg-canvas">
              {/* Dermis and Fat Plane */}
              <rect x="20" y="55" width="340" height="20" fill="#fed7aa" stroke="#f97316" strokeWidth="1" />
              <rect x="20" y="77" width="340" height="90" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              {/* Trocar Cannula */}
              <rect x="70" y="98" width="180" height="14" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
              {/* Trocar Bevel */}
              <polygon points="250,98 275,105 250,112" fill="#94a3b8" stroke="#475569" strokeWidth="1.5" />
              {/* Angle Indication */}
              <text x="60" y="45" fill="#0284c7" fontSize="11" fontWeight="800">Entrada 30° ➔ Basculación Horizontal a 0°</text>
              <line x1="20" y1="120" x2="360" y2="120" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x="210" y="140" fill="#0369a1" fontSize="9" fontWeight="700">Túnel paralelo a la fascia</text>
            </svg>
          )}

          {currentStep.svgType === 'deployment' && (
            <svg viewBox="0 0 380 200" className="trocar-svg-canvas">
              {/* Subcutaneous Pocket */}
              <rect x="20" y="70" width="340" height="90" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
              {/* Deployed Pellets in Tissue */}
              <rect x="240" y="100" width="22" height="12" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="2" />
              <rect x="270" y="100" width="22" height="12" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="2" />
              {/* Retracting Trocar */}
              <rect x="40" y="98" width="160" height="16" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
              {/* Blunt Obturator inside */}
              <line x1="30" y1="106" x2="225" y2="106" stroke="#0284c7" strokeWidth="4" />
              {/* Arrow Showing Trocar Withdrawal */}
              <path d="M 120 75 L 80 75 M 95 65 L 80 75 L 95 85" stroke="#dc2626" strokeWidth="2.5" fill="none" />
              <text x="65" y="55" fill="#dc2626" fontSize="10" fontWeight="800">
                {isEs ? 'Retroceso de la cánula exterior' : 'Retract outer cannula'}
              </text>
              <text x="235" y="130" fill="#166534" fontSize="10" fontWeight="800">
                {isEs ? 'Pellets en lecho vascular' : 'Pellets in vascular fat'}
              </text>
            </svg>
          )}

          {currentStep.svgType === 'closure' && (
            <svg viewBox="0 0 380 200" className="trocar-svg-canvas">
              <rect x="30" y="40" width="320" height="120" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.5" />
              {/* Skin Incision */}
              <line x1="170" y1="100" x2="210" y2="100" stroke="#dc2626" strokeWidth="3" />
              {/* Steri-Strips Cross */}
              <rect x="180" y="75" width="8" height="50" rx="1" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
              <rect x="195" y="75" width="8" height="50" rx="1" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
              {/* Transparent Dressing Border */}
              <rect x="130" y="60" width="120" height="80" rx="6" fill="#38bdf8" fillOpacity="0.15" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="145" y="50" fill="#003666" fontSize="11" fontWeight="800">Cierre Steri-Strips + Tegaderm</text>
              <text x="140" y="160" fill="#15803d" fontSize="9.5" fontWeight="700">✓ Sin puntos · Impermeable 48h</text>
            </svg>
          )}

          <div className="trocar-visual-caption">
            {isEs ? `Esquema Clínico Fase ${currentStep.step} de 6` : `Clinical Stage Step ${currentStep.step} of 6`}
          </div>
        </div>

        {/* Right: Clinical Directives */}
        <div className="trocar-info-card">
          <div className="trocar-info-phase-tag">
            <CheckCircle2 size={13} />
            <span>{isEs ? currentStep.tagEs : currentStep.tagEn}</span>
          </div>

          <h4 className="trocar-info-title">
            {isEs ? currentStep.titleEs : currentStep.titleEn}
          </h4>

          <p className="trocar-info-desc">
            {isEs ? currentStep.descEs : currentStep.descEn}
          </p>

          <div className="trocar-info-callout trocar-callout-spec">
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#0284c7' }} />
            <div>
              <strong>{isEs ? 'Detalle Técnico:' : 'Clinical Directive:'}</strong>{' '}
              {isEs ? currentStep.clinicalSpecsEs : currentStep.clinicalSpecsEn}
            </div>
          </div>

          <div className="trocar-info-callout trocar-callout-warning">
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>{isEs ? 'Alerta de Seguridad:' : 'Safety Precaution:'}</strong>{' '}
              {isEs ? currentStep.dangerWarningEs : currentStep.dangerWarningEn}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER CONTROLS ── */}
      <div className="trocar-guide-footer">
        <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
          {isEs ? `Paso ${activeStepIndex + 1} de ${STEPS_DATA.length}` : `Step ${activeStepIndex + 1} of ${STEPS_DATA.length}`}
        </div>

        <div className="trocar-nav-controls">
          <button
            type="button"
            onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeStepIndex === 0}
            className="gcp-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.75rem', fontWeight: 700 }}
          >
            <ChevronLeft size={13} />
            <span>{isEs ? 'Paso Anterior' : 'Previous'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveStepIndex((prev) => Math.min(STEPS_DATA.length - 1, prev + 1))}
            disabled={activeStepIndex === STEPS_DATA.length - 1}
            className="gcp-btn-primary"
            style={{ padding: '6px 14px', fontSize: '0.75rem', fontWeight: 700 }}
          >
            <span>{isEs ? 'Siguiente Paso' : 'Next Step'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* ── CLINICAL DOSING & COMBINATION MATRIX ── */}
      <div className="trocar-calculator-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={15} color="#0284c7" />
              <span>{isEs ? 'Matriz Clínica de Combinación & Titulación BHRT' : 'Clinical BHRT Synergy & Titration Matrix'}</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
              {isEs ? 'Directrices de posología para los 4 pellets del catálogo Pharmapolis' : 'Prescription guidelines across the 4 Pharmapolis pellet strengths'}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyPatientCare}
            className="gcp-btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.74rem', fontWeight: 700 }}
          >
            {copiedPatientGuide ? <Check size={12} color="#16a34a" /> : <Copy size={12} />}
            <span>{copiedPatientGuide ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Pautas Paciente' : 'Copy Patient Care')}</span>
          </button>
        </div>

        <div className="trocar-calc-grid">
          <div className="trocar-calc-card">
            <div className="trocar-calc-card-title">{isEs ? '1. Perimenopausia / Iniciación' : '1. Perimenopause / Conservative'}</div>
            <div className="trocar-calc-pellet-pill">
              <span>Estradiol 12.5 mg</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              {isEs ? 'Para sofocos leves, transición hormonal y pacientes de bajo peso (< 22 kg/m²). Duración: 3.5 a 5 meses.' : 'Mild hot flashes, early transition, and low-BMI (<22 kg/m²) patients. Release: 3.5–5 months.'}
            </p>
          </div>

          <div className="trocar-calc-card">
            <div className="trocar-calc-card-title">{isEs ? '2. Menopausia Establecida / Ooforrectomía' : '2. Established Menopause / Surgical'}</div>
            <div className="trocar-calc-pellet-pill" style={{ background: '#fdf2f8', borderColor: '#fbcfe8', color: '#db2777' }}>
              <span>Estradiol 25 mg</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              {isEs ? 'Estándar clínico para supresión total de síntomas vasomotores y preservación de densidad ósea mineral. Requiere progesterona si hay útero.' : 'Clinical gold standard for full vasomotor symptom control and bone mineral density preservation. Requires progesterone if uterus intact.'}
            </p>
          </div>

          <div className="trocar-calc-card">
            <div className="trocar-calc-card-title">{isEs ? '3. Sinergia Androgénica Femenina' : '3. Female Androgen Synergy'}</div>
            <div className="trocar-calc-pellet-pill" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
              <span>Testosterona 50 mg</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              {isEs ? 'Co-implantada en el mismo túnel para restaurar libido, masa magra y vitalidad neurocognitiva en mujeres.' : 'Co-implanted in the same track to restore libido, lean mass, and cognitive stamina in women.'}
            </p>
          </div>

          <div className="trocar-calc-card">
            <div className="trocar-calc-card-title">{isEs ? '4. Andropausia Masculina (TRT)' : '4. Male Andropause / TRT'}</div>
            <div className="trocar-calc-pellet-pill" style={{ background: '#faf5ff', borderColor: '#e9d5ff', color: '#6b21a8' }}>
              <span>Testosterona 100 mg (x6-10)</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
              {isEs ? 'Protocolo andrológico con trócar de 4.5 mm. Nivel eugonadal continuo de 4 a 6 meses sin picos suprafisiológicos.' : 'Andrology protocol with 4.5 mm trocar. Sustained eugonadal levels for 4–6 months without injection peaks.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
