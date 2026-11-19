"use client";

import React, { useState } from 'react';
import {
  Syringe,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Sparkles
} from '@/lib/icons';
import toast from 'react-hot-toast';
import './InteractiveTrocarPelletGuide.css';

const STEPS_DATA = [
  {
    step: 1,
    id: 'site-selection',
    tagEn: 'Phase 1 · Anatomic Mapping',
    tagEs: 'Fase 1 · Mapeo Anatómico',
    shortEn: 'Site & Pinch Test',
    shortEs: 'Zona & Pliegue',
    titleEn: 'Anatomic Mapping, Pinch Test & Antisepsis',
    titleEs: 'Mapeo Anatómico, Test de Pliegue & Asepsia',
    descEn: 'Primary site: upper outer gluteal quadrant, 3–5 cm below the posterior iliac crest — dense subcutaneous fat, low vascularity, zero sitting pressure, and clear of the sciatic notch. Perform a pre-insertion pinch test (≥ 2.5 cm adipose fold). In very lean/athletic patients (BMI < 20), select the posterior flank / hip adipose pad or confirm depth via point-of-care ultrasound.',
    descEs: 'Sitio de primera elección: cuadrante súpero-externo glúteo, 3–5 cm bajo la cresta ilíaca posterior (grasa subcutánea densa, baja vascularización, nula compresión al sentarse y lejos del nervio ciático). Realice test del pliegue (≥ 2.5 cm). En pacientes muy atléticos (IMC < 20), utilice el flanco posterior o confirme espesor por ecografía.',
    svgType: 'anatomy',
    clinicalSpecsEn: '2% Chlorhexidine Gluconate in 70% Isopropyl Alcohol; allow a strict 2-minute sterile air dry. Mark entry dot + planned 3.5 cm track with sterile surgical pen.',
    clinicalSpecsEs: 'Clorhexidina al 2% en alcohol isopropílico 70%; secado estéril al aire durante 2 minutos estrictos. Marcar punto de entrada y trayectoria de 3.5 cm con marcador quirúrgico estéril.',
    trendEn: '2025/26 Trend: Pre-insertion pinch test (≥ 2.5 cm) + posterior flank alternate site for lean athletes eliminates inadvertent fascial/intramuscular placement.',
    trendEs: 'Tendencia 2025/26: Test del pliegue (≥ 2.5 cm) + zona alternativa en flanco posterior en deportistas evita la implantación fascial o intramuscular.',
    dangerWarningEn: 'CRITICAL: Never direct the trocar medially or inferiorly toward the sciatic notch, superior gluteal vessels, or deep gluteal fascia.',
    dangerWarningEs: 'CRÍTICO: Nunca dirigir el trócar hacia medial o inferior (escotadura ciática, vasos glúteos superiores o fascia muscular profunda).'
  },
  {
    step: 2,
    id: 'local-anesthesia',
    tagEn: 'Phase 2 · Pain-Free Tumescence',
    tagEs: 'Fase 2 · Tumescencia Sin Dolor',
    titleEn: 'pH-Buffered Infiltrative Anesthesia (9:1 Ratio)',
    titleEs: 'Anestesia Local Amortiguada pH 7.2 (Ratio 9:1)',
    descEn: 'Raise anesthetic pH from acidic ~4.5 to physiologic 7.2 using Sodium Bicarbonate to eliminate injection burn. Infiltrate across three planes with a 27G × 1.5" needle: a 0.3 mL intradermal wheal at the entry mark followed by 1.5–2.0 mL fan-pattern subcutaneous hydro-dissection along the planned 3.5–4.0 cm track(s).',
    descEs: 'Eleve el pH del anestésico de ~4.5 a pH fisiológico 7.2 con bicarbonato sódico para eliminar el ardor. Infiltre en 3 planos con aguja 27G × 1.5": pápula intradérmica de 0.3 mL y 1.5–2.0 mL de hidrodisección subcutánea en abanico a lo largo del túnel planificado de 3.5–4.0 cm.',
    svgType: 'anesthesia',
    clinicalSpecsEn: 'Buffered Mix (9:1): 1.8 mL 2% Lidocaine with Epinephrine (1:100,000) + 0.2 mL 8.4% Sodium Bicarbonate. Aspirate gently before advancing.',
    clinicalSpecsEs: 'Mezcla Amortiguada (9:1): 1.8 mL Lidocaína 2% con Epinefrina (1:100.000) + 0.2 mL Bicarbonato de Sodio 8.4%. Aspirar suavemente antes de infiltrar.',
    trendEn: '2025/26 Trend: Strict 3–5 minute "bloodless field" wait after epinephrine cuts hematoma incidence by >70% and dramatically lowers pellet washout/extrusion.',
    trendEs: 'Tendencia 2025/26: Espera estricta de 3–5 min ("campo exangüe") tras epinefrina reduce hematomas >70% y minimiza la extrusión.',
    dangerWarningEn: 'Do not incise immediately after injection — wait a full 3–5 minutes for complete capillary vasoconstriction and sensory block.',
    dangerWarningEs: 'No incidir de inmediato — esperar 3 a 5 minutos completos para vasoconstricción capilar total y bloqueo sensitivo.'
  },
  {
    step: 3,
    id: 'micro-incision',
    tagEn: 'Phase 3 · Calibrated Access',
    tagEs: 'Fase 3 · Acceso Calibrado',
    shortEn: 'Micro-Incision',
    shortEs: 'Micro-Incisión',
    titleEn: '3.5–4.0 mm Micro-Incision & Single-Use Disposable Trocar',
    titleEs: 'Micro-Incisión 3.5–4.0 mm & Trócar Desechable Estéril',
    descEn: 'Using a #11 surgical scalpel aligned with Langer’s relaxed skin tension lines, perform a crisp 3.5 mm (female 3.2 mm trocar) or 4.0 mm (male 4.5 mm trocar) stab incision strictly traversing epidermis and dermis. Modern clinical standards strongly favor single-use sterile disposable trocars over autoclaved reusable kits.',
    descEs: 'Con bisturí quirúrgico #11 alineado a las líneas de tensión de Langer, realice una incisión limpia de 3.5 mm (trócar femenino 3.2 mm) o 4.0 mm (trócar masculino 4.5 mm) atravesando solo epidermis y dermis. El estándar clínico actual prioriza kits desechables estériles de un solo uso frente a trócares reutilizables.',
    svgType: 'incision',
    clinicalSpecsEn: 'Single-use sterile trocars guarantee razor-sharp bevel geometry, zero micro-burring, minimal tissue drag, and zero cross-contamination or biofilm risk.',
    clinicalSpecsEs: 'Los trócares desechables garantizan bisel intacto sin micro-rebabas, menor trauma tisular y cero riesgo de biofilm o contaminación cruzada.',
    trendEn: '2025/26 Trend: Calibrated incision-to-trocar match (≤ 4 mm) prevents dead space at the entry ostium, keeping extrusion below 0.3%.',
    trendEs: 'Tendencia 2025/26: Incisión exactamente calibrada al trócar (≤ 4 mm) evita espacio muerto en el ostium, manteniendo la extrusión < 0.3%.',
    dangerWarningEn: 'Never exceed 5 mm incision width — oversized skin openings weaken dermal closure and significantly elevate pellet extrusion risk.',
    dangerWarningEs: 'Nunca superar los 5 mm de longitud — incisiones sobredimensionadas debilitan el cierre dérmico y disparan el riesgo de extrusión.'
  },
  {
    step: 4,
    id: 'trocar-cannulation',
    tagEn: 'Phase 4 · Subcutaneous Plane & Fanning',
    tagEs: 'Fase 4 · Plano Subcutáneo & Abanico',
    shortEn: '30°→0° & Fanning',
    shortEs: '30°→0° & Abanico',
    titleEn: '30° Dermal Entry, 0° Leveling & Radial Fanning ("V/W")',
    titleEs: 'Entrada a 30°, Nivelación 0° & Abanico Radial ("V/W")',
    descEn: 'Insert the beveled trocar at 30° through the dermis until you feel the tactile loss of resistance in subcutaneous fat; immediately drop the barrel to 0°–10° parallel to the skin/fascia and advance 3.5–4.0 cm. For male TRT (6–10 pellets), use Radial Multi-Track Fanning (2–3 fan tracks from ONE single incision, max 3–4 pellets per track).',
    descEs: 'Introduzca el trócar a 30° hasta notar la pérdida de resistencia en el tejido adiposo subcutáneo; abata de inmediato el cuerpo a 0°–10° paralelo a la piel/fascia y avance 3.5–4.0 cm. En TRT masculino (6–10 pellets), aplique Abanico Radial (2–3 túneles en "V" o "W" desde UNA única incisión, máximo 3–4 pellets por túnel).',
    svgType: 'trocar',
    clinicalSpecsEn: 'Radial "V" or "W" fan tracks keep pellets spaced within distinct well-perfused adipose corridors, preventing foreign-body crowding and inflammation.',
    clinicalSpecsEs: 'El abanico radial en "V" o "W" distribuye los pellets en corredores adiposos independientes bien perfundidos, evitando congestión inflamatoria.',
    trendEn: '2025/26 Trend: Multi-track radial fanning (≤ 4 pellets/track) is the #1 technique reducing male TRT extrusion rates by more than half.',
    trendEs: 'Tendencia 2025/26: El abanico radial (≤ 4 pellets/túnel) es la maniobra n.º 1 para reducir a más de la mitad las extrusiones en TRT masculino.',
    dangerWarningEn: 'NEVER force the trocar into deep muscle or fascia. Resistance indicates incorrect plane — withdraw slightly, re-level horizontally, and advance smoothly.',
    dangerWarningEs: 'NUNCA forzar el trócar en músculo o fascia. La resistencia indica plano incorrecto — retroceda ligeramente, nivele en horizontal y avance sin fuerza.'
  },
  {
    step: 5,
    id: 'pellet-deployment',
    tagEn: 'Phase 5 · Zero-Force Deposition',
    tagEs: 'Fase 5 · Desnudamiento Sin Fuerza',
    shortEn: 'Retrograde Release',
    shortEs: 'Desnudamiento',
    titleEn: 'Retrograde Cannula Unsheathing (Zero-Force Release)',
    titleEs: 'Desnudamiento Retrógrado de Cánula (Cero Fuerza)',
    descEn: 'Remove the sharp trocar/obturator. Load sterile bioidentical pellets into the cannula with non-toothed Adson forceps. Reinsert the blunt obturator gently until it contacts the pellet column. Hold the obturator completely stationary while retracting the outer cannula 2 cm backward to unsheathe the pellets into the pocket.',
    descEs: 'Retire el estilete/obturador. Cargue los pellets estériles en la cánula con pinzas Adson sin dientes. Reintroduzca el obturador romo hasta hacer contacto suave con la columna de pellets. Mantenga el obturador fijo y retire la cánula externa 2 cm hacia atrás para depositar los pellets por desnudamiento.',
    svgType: 'deployment',
    clinicalSpecsEn: 'Pellets are laid softly in the subcutaneous pocket by withdrawing the outer sleeve — NEVER by ramming the obturator forward.',
    clinicalSpecsEs: 'Los pellets se depositan en el lecho vascular retirando la camisa exterior — NUNCA empujando el obturador hacia adelante.',
    trendEn: '2025/26 Trend: Pure crystalline EU GMP pellets contain zero polymer binders; intact cylindrical geometry preserves smooth zero-order release over 3.5–6 months.',
    trendEs: 'Tendencia 2025/26: Los pellets cristalinos puros EU GMP carecen de aglutinantes poliméricos; mantener su geometría intacta asegura liberación de orden cero durante 3.5–6 meses.',
    dangerWarningEn: 'Forward pushing can fracture pure crystalline pellets, massively increasing surface area and triggering an unintended supraphysiological spike ("pellet dumping").',
    dangerWarningEs: 'Empujar con fuerza puede fracturar los pellets cristalinos, multiplicando la superficie de absorción y provocando un pico hormonal brusco ("pellet dumping").'
  },
  {
    step: 6,
    id: 'sutureless-closure',
    tagEn: 'Phase 6 · Closure & Discharge',
    tagEs: 'Fase 6 · Cierre & Alta',
    shortEn: 'Closure & Post-Op',
    shortEs: 'Cierre & Post-Op',
    titleEn: 'Sutureless Steri-Strip Closure, Edge Seal & Recovery Rules',
    titleEs: 'Cierre Sin Suturas, Sellado & Protocolo Post-Implante',
    descEn: 'Apply brief firm gauze hemostasis (60 seconds). Appose dermal edges precisely and apply two sterile Steri-Strips in a cross or parallel bridge, covered by a waterproof transparent pressure dressing (Tegaderm / Opsite). For athletes or humid climates, a drop of 2-octyl cyanoacrylate tissue adhesive (Dermabond) provides extra moisture sealing.',
    descEs: 'Realice hemostasia firme con gasa estéril (60 segundos). Aproxime los bordes cutáneos y aplique dos Steri-Strips en cruz, cubiertos con apósito transparente impermeable a presión (Tegaderm / Opsite). En deportistas o climas cálidos, una gota de adhesivo tisular (cianoacrilato / Dermabond) aporta sellado extra.',
    svgType: 'closure',
    clinicalSpecsEn: 'Keep dry 48h. Lower-body / gluteal exercise & water immersion rest: 3–5 days (Female 3.2 mm) · 5–7 days (Male 4.5 mm / multi-track). Schedule peak bloodwork at 4–6 weeks.',
    clinicalSpecsEs: 'Mantener seco 48h. Reposo de glúteos/piernas e inmersión en agua: 3–5 días (Mujer 3.2 mm) · 5–7 días (Hombre 4.5 mm / múltiples túneles). Analítica pico a las 4–6 semanas.',
    trendEn: '2025/26 Trend: Differentiated female (3–5d) vs. male (5–7d) activity protocols + optional cyanoacrylate edge seal deliver documented extrusion rates < 0.3%.',
    trendEs: 'Tendencia 2025/26: Protocolos diferenciados de reposo mujer (3–5d) vs. hombre (5–7d) + sellado opcional con cianoacrilato logran tasas de extrusión < 0.3%.',
    dangerWarningEn: 'No hot tubs, pools, sea swimming, squats, or cycling during the rest window — gluteal shear force is the primary mechanical cause of late extrusion.',
    dangerWarningEs: 'Evitar piscinas, jacuzzi, mar, sentadillas o ciclismo durante el reposo — la fricción muscular glútea es la causa mecánica principal de extrusión tardía.'
  }
];

export default function InteractiveTrocarPelletGuide({ lang = 'en', showDosingMatrix = true }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedPatientGuide, setCopiedPatientGuide] = useState(false);
  const isEs = lang === 'es';

  const currentStep = STEPS_DATA[activeStepIndex];

  const handleCopyPatientCare = async () => {
    const text = isEs
      ? `🏥 *Atlas Health Services — Pautas Post-Implante de Pellets Hormonales (BHRT)*
1. *Primeras 48 Horas*: Mantener el apósito impermeable completamente seco e intacto. Aplicar frío local intermitente (15 min) si hay ligera molestia.
2. *Reposo de Zona Glútea*: Evitar sentadillas, peso muerto, ciclismo, correr o inmersión (piscina/mar/bañera) durante *3–5 días (mujeres)* o *5–7 días (hombres)*.
3. *Ducha*: Permitida suavemente a partir de las 48h sin frotar ni retirar las tiras Steri-Strips. Secar a toques suaves.
4. *Retirada de Tiras*: Las Steri-Strips se desprenden solas entre los días 5 y 7.
5. *Seguimiento Clínico*: Analítica hormonal de control en pico a las *4–6 semanas*.`
      : `🏥 *Atlas Health Services — Post-Trocar Hormone Pellet Patient Care (BHRT)*
1. *First 48 Hours*: Keep the waterproof pressure dressing completely dry and intact. Apply brief cold pack (15 min) if mild soreness occurs.
2. *Gluteal Rest Window*: Avoid squats, deadlifts, cycling, running, or water submersion (pools/hot tubs/sea) for *3–5 days (female)* or *5–7 days (male)*.
3. *Showering*: Gentle shower allowed after 48h without rubbing or peeling Steri-Strips. Pat dry gently.
4. *Steri-Strip Removal*: Strips fall off naturally between days 5 and 7.
5. *Clinical Follow-Up*: Scheduled peak serum hormone lab panel at *4–6 weeks*.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedPatientGuide(true);
      toast.success(isEs ? 'Pautas para el paciente copiadas ✓' : 'Patient discharge instructions copied ✓');
      setTimeout(() => setCopiedPatientGuide(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudieron copiar las pautas' : 'Could not copy instructions');
    }
  };

  return (
    <div className="trocar-guide-container">
      {/* ── HEADER ── */}
      <div className="trocar-guide-header">
        <div className="trocar-guide-title-row">
          <div className="trocar-guide-icon-box">
            <Syringe size={20} />
          </div>
          <div>
            <h3 className="trocar-guide-title">
              {isEs ? 'Simulador Quirúrgico Visual · Técnica de 6 Pasos' : 'Interactive Visual Surgical Protocol · 6 Steps'}
            </h3>
            <p className="trocar-guide-subtitle">
              {isEs
                ? 'Estándar clínico 2025/26 · Abanico radial, anestesia pH 7.2 y desnudamiento sin fuerza'
                : '2025/26 Clinical Standard · Radial fanning, pH 7.2 buffered anesthesia & zero-force unsheathing'}
            </p>
          </div>
        </div>
        <span className="trocar-guide-badge">
          {isEs ? `Paso ${activeStepIndex + 1} / 6` : `Step ${activeStepIndex + 1} / 6`}
        </span>
      </div>

      {/* ── STEP PROGRESSION TRACK ── */}
      <div className="trocar-step-track" role="tablist">
        {STEPS_DATA.map((s, idx) => {
          const isActive = activeStepIndex === idx;
          const isCompleted = idx < activeStepIndex;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveStepIndex(idx)}
              className={`trocar-step-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <span className="trocar-step-btn-num">
                <span className="trocar-step-dot">{isCompleted ? '✓' : s.step}</span>
                <span>{isEs ? `Paso 0${s.step}` : `Step 0${s.step}`}</span>
              </span>
              <span className="trocar-step-btn-label">
                {isEs ? (s.shortEs || s.titleEs) : (s.shortEn || s.titleEn)}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── INTERACTIVE BODY (HIGH-CLARITY MEDICAL SVG + CLINICAL DIRECTIVES) ── */}
      <div className="trocar-step-body">
        {/* Left: Crisp Bilingual Vector Medical Illustration */}
        <div className="trocar-visual-stage">
          {currentStep.svgType === 'anatomy' && (
            <svg viewBox="0 0 420 230" className="trocar-svg-canvas" role="img" aria-label={isEs ? 'Mapeo anatómico glúteo y flanco' : 'Gluteal and flank anatomical mapping'}>
              <rect x="8" y="8" width="404" height="214" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Gluteal & Flank contour */}
              <path d="M 48 195 C 58 90, 145 48, 232 58 C 312 68, 354 128, 358 195" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
              {/* Quadrant crosshair */}
              <line x1="204" y1="54" x2="204" y2="195" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="4 4" />
              <line x1="56" y1="130" x2="352" y2="130" stroke="#93c5fd" strokeWidth="1.2" strokeDasharray="4 4" />
              {/* Posterior Iliac Crest */}
              <path d="M 86 64 Q 168 42 252 54" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeDasharray="5 3" />
              <text x="108" y="34" fill="#1e3a8a" fontSize="10.5" fontWeight="800">
                {isEs ? 'Cresta Ilíaca Posterior' : 'Posterior Iliac Crest'}
              </text>
              {/* Caliper 3-5 cm */}
              <line x1="148" y1="54" x2="148" y2="92" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="143" y1="54" x2="153" y2="54" stroke="#0f172a" strokeWidth="1.5" />
              <line x1="143" y1="92" x2="153" y2="92" stroke="#0f172a" strokeWidth="1.5" />
              <rect x="94" y="65" width="46" height="16" rx="4" fill="#0f172a" />
              <text x="117" y="76" fill="#ffffff" fontSize="8.5" fontWeight="700" textAnchor="middle">3–5 cm</text>
              {/* Primary Safe Zone */}
              <circle cx="152" cy="96" r="24" fill="#22c55e" fillOpacity="0.22" stroke="#16a34a" strokeWidth="2" />
              <circle cx="152" cy="96" r="4.5" fill="#15803d" />
              <text x="184" y="88" fill="#15803d" fontSize="10.5" fontWeight="800">
                {isEs ? 'Zona Segura Primaria' : 'Primary Safe Zone'}
              </text>
              <text x="184" y="102" fill="#475569" fontSize="9">
                {isEs ? 'Pliegue adiposo ≥ 2.5 cm' : 'Pinch fold ≥ 2.5 cm'}
              </text>
              {/* Secondary Flank Zone (Lean/Athletic) */}
              <ellipse cx="90" cy="112" rx="18" ry="12" fill="#0ea5e9" fillOpacity="0.22" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x="20" y="148" fill="#0369a1" fontSize="8.5" fontWeight="700">
                {isEs ? 'Alt: Flanco (IMC < 20)' : 'Alt: Flank (BMI < 20)'}
              </text>
              {/* Danger Zone: Sciatic Nerve */}
              <circle cx="268" cy="158" r="18" fill="#ef4444" fillOpacity="0.2" stroke="#dc2626" strokeWidth="1.8" strokeDasharray="3 2" />
              <path d="M 268 142 L 268 195" stroke="#dc2626" strokeWidth="2.2" strokeDasharray="4 2" />
              <text x="268" y="210" fill="#b91c1c" fontSize="9.5" fontWeight="800" textAnchor="middle">
                {isEs ? '⚠ Nervio Ciático (Zona Prohibida)' : '⚠ Sciatic Notch (No-Go Zone)'}
              </text>
            </svg>
          )}

          {currentStep.svgType === 'anesthesia' && (
            <svg viewBox="0 0 420 230" className="trocar-svg-canvas" role="img" aria-label={isEs ? 'Infiltración anestésica amortiguada' : 'Buffered local tumescent anesthesia'}>
              <rect x="8" y="8" width="404" height="214" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* pH badge */}
              <rect x="242" y="18" width="156" height="26" rx="6" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1" />
              <text x="320" y="34" fill="#0369a1" fontSize="9.5" fontWeight="800" textAnchor="middle">
                {isEs ? 'pH 4.5 → 7.2 (Sin Ardor)' : 'pH 4.5 → 7.2 (Sting-Free)'}
              </text>
              {/* Epidermis & Dermis */}
              <rect x="24" y="62" width="372" height="22" fill="#fed7aa" stroke="#f97316" strokeWidth="1.4" rx="4" />
              <text x="34" y="55" fill="#c2410c" fontSize="9.5" fontWeight="800">
                {isEs ? 'Epidermis & Dermis (~3 mm)' : 'Epidermis & Dermis (~3 mm)'}
              </text>
              {/* Subcutaneous Fat */}
              <rect x="24" y="86" width="372" height="90" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" rx="4" />
              <text x="34" y="102" fill="#b45309" fontSize="9.5" fontWeight="800">
                {isEs ? 'Plano Subcutáneo Adiposo (Tumescencia 3.5 cm)' : 'Subcutaneous Fat Plane (3.5 cm Tumescence)'}
              </text>
              {/* Deep Muscle */}
              <rect x="24" y="178" width="372" height="30" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1.2" rx="4" />
              <text x="34" y="197" fill="#991b1b" fontSize="9" fontWeight="700">
                {isEs ? 'Fascia & Músculo Glúteo (NO infiltrar profundo)' : 'Gluteal Fascia & Muscle (Stay Above)'}
              </text>
              {/* Intradermal wheal */}
              <ellipse cx="106" cy="73" rx="14" ry="7" fill="#38bdf8" fillOpacity="0.6" stroke="#0284c7" strokeWidth="1.2" />
              {/* Fan hydro-dissection zone */}
              <path d="M 106 78 L 285 118 L 275 152 Z" fill="#38bdf8" fillOpacity="0.28" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 2" />
              {/* 27G Needle */}
              <line x1="56" y1="26" x2="215" y2="128" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" />
              <text x="210" y="168" fill="#0369a1" fontSize="9.5" fontWeight="800">
                {isEs ? '⏱ Esperar 3–5 min (Campo Exangüe)' : '⏱ Wait 3–5 min (Bloodless Field)'}
              </text>
            </svg>
          )}

          {currentStep.svgType === 'incision' && (
            <svg viewBox="0 0 420 230" className="trocar-svg-canvas" role="img" aria-label={isEs ? 'Micro-incisión calibrada y trócar desechable' : 'Calibrated micro-incision and disposable trocar'}>
              <rect x="8" y="8" width="404" height="214" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Skin block */}
              <rect x="34" y="84" width="352" height="58" fill="#ffedd5" stroke="#fb923c" strokeWidth="1.6" rx="6" />
              {/* Langer lines */}
              <path d="M 46 100 Q 210 92 374 100" fill="none" stroke="#fdba74" strokeWidth="1" strokeDasharray="4 4" />
              <path d="M 46 126 Q 210 118 374 126" fill="none" stroke="#fdba74" strokeWidth="1" strokeDasharray="4 4" />
              {/* #11 Scalpel */}
              <polygon points="122,22 182,108 168,108 110,22" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
              <text x="64" y="42" fill="#334155" fontSize="9.5" fontWeight="800">
                {isEs ? 'Bisturí #11' : '#11 Blade'}
              </text>
              {/* Exact incision mark */}
              <line x1="176" y1="112" x2="220" y2="112" stroke="#dc2626" strokeWidth="4" strokeLinecap="round" />
              <text x="198" y="133" fill="#dc2626" fontSize="10" fontWeight="800" textAnchor="middle">
                3.5 – 4.0 mm
              </text>
              {/* Calibrated Trocar comparison boxes */}
              <rect x="34" y="158" width="168" height="48" rx="6" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
              <text x="118" y="177" fill="#1d4ed8" fontSize="10" fontWeight="800" textAnchor="middle">
                {isEs ? 'Trócar 3.2 mm (Mujer)' : '3.2 mm Trocar (Female)'}
              </text>
              <text x="118" y="194" fill="#475569" fontSize="8.5" textAnchor="middle">
                {isEs ? 'Desechable estéril · 1 uso' : 'Sterile single-use · Zero burrs'}
              </text>
              <rect x="218" y="158" width="168" height="48" rx="6" fill="#f5f3ff" stroke="#c4b5fd" strokeWidth="1.2" />
              <text x="302" y="177" fill="#6d28d9" fontSize="10" fontWeight="800" textAnchor="middle">
                {isEs ? 'Trócar 4.5 mm (Hombre)' : '4.5 mm Trocar (Male TRT)'}
              </text>
              <text x="302" y="194" fill="#475569" fontSize="8.5" textAnchor="middle">
                {isEs ? 'Pellets 100–200 mg · Abanico' : '100–200 mg pellets · Fanning'}
              </text>
            </svg>
          )}

          {currentStep.svgType === 'trocar' && (
            <svg viewBox="0 0 420 230" className="trocar-svg-canvas" role="img" aria-label={isEs ? 'Entrada 30 grados, nivelación 0 grados y abanico radial' : '30 degree entry, 0 degree leveling and radial fanning'}>
              <rect x="8" y="8" width="404" height="214" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Left half: Cross-section 30° -> 0° */}
              <text x="112" y="26" fill="#003666" fontSize="9.5" fontWeight="800" textAnchor="middle">
                {isEs ? 'Corte Lateral: 30° → 0°' : 'Side View: 30° → 0°'}
              </text>
              <rect x="18" y="42" width="194" height="18" fill="#fed7aa" stroke="#f97316" strokeWidth="1" rx="2" />
              <rect x="18" y="62" width="194" height="106" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" rx="2" />
              <rect x="18" y="170" width="194" height="24" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" rx="2" />
              {/* Entry angle ghost */}
              <line x1="28" y1="30" x2="62" y2="78" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />
              <text x="48" y="38" fill="#0284c7" fontSize="8.5" fontWeight="800">30°</text>
              {/* Horizontal Trocar */}
              <rect x="52" y="96" width="124" height="13" rx="2" fill="#cbd5e1" stroke="#334155" strokeWidth="1.4" />
              <polygon points="176,96 196,102.5 176,109" fill="#94a3b8" stroke="#334155" strokeWidth="1.4" />
              <line x1="24" y1="120" x2="206" y2="120" stroke="#0284c7" strokeWidth="1.2" strokeDasharray="4 3" />
              <text x="115" y="138" fill="#0369a1" fontSize="8.5" fontWeight="700" textAnchor="middle">
                {isEs ? '0° paralelo · 3.5–4.0 cm' : '0° parallel · 3.5–4.0 cm'}
              </text>
              <text x="115" y="185" fill="#991b1b" fontSize="8" fontWeight="700" textAnchor="middle">
                {isEs ? 'Músculo (Evitar)' : 'Muscle (Avoid)'}
              </text>

              {/* Right half: Top view Radial V/W Fanning */}
              <rect x="224" y="16" width="178" height="196" rx="8" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.2" />
              <text x="313" y="34" fill="#1e3a8a" fontSize="9.5" fontWeight="800" textAnchor="middle">
                {isEs ? 'Vista Superior: Abanico V/W' : 'Top View: Radial V/W Fan'}
              </text>
              {/* Single incision ostium */}
              <circle cx="248" cy="116" r="5" fill="#dc2626" />
              <text x="248" y="136" fill="#b91c1c" fontSize="8" fontWeight="700" textAnchor="middle">
                {isEs ? '1 incisión' : '1 entry'}
              </text>
              {/* 3 fan tracks */}
              <line x1="252" y1="114" x2="374" y2="66" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="252" y1="116" x2="380" y2="116" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
              <line x1="252" y1="118" x2="374" y2="166" stroke="#0284c7" strokeWidth="2" strokeDasharray="4 2" />
              {/* Pellets spaced per track */}
              <rect x="310" y="84" width="16" height="7" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="1.4" transform="rotate(-21 318 87)" />
              <rect x="336" y="74" width="16" height="7" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="1.4" transform="rotate(-21 344 77)" />
              <rect x="314" y="112" width="16" height="7" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="1.4" />
              <rect x="342" y="112" width="16" height="7" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="1.4" />
              <rect x="310" y="142" width="16" height="7" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="1.4" transform="rotate(21 318 145)" />
              <rect x="336" y="152" width="16" height="7" rx="3" fill="#ffffff" stroke="#003666" strokeWidth="1.4" transform="rotate(21 344 155)" />
              <text x="313" y="198" fill="#166534" fontSize="8.5" fontWeight="800" textAnchor="middle">
                {isEs ? 'Máx 3–4 pellets / túnel' : 'Max 3–4 pellets / track'}
              </text>
            </svg>
          )}

          {currentStep.svgType === 'deployment' && (
            <svg viewBox="0 0 420 230" className="trocar-svg-canvas" role="img" aria-label={isEs ? 'Desnudamiento retrógrado sin fuerza' : 'Zero-force retrograde cannula unsheathing'}>
              <rect x="8" y="8" width="404" height="214" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              {/* Tissue Pocket */}
              <rect x="24" y="72" width="372" height="106" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.4" rx="6" />
              {/* Deployed intact crystalline pellets */}
              <rect x="262" y="114" width="28" height="14" rx="4" fill="#ffffff" stroke="#003666" strokeWidth="2" />
              <rect x="298" y="114" width="28" height="14" rx="4" fill="#ffffff" stroke="#003666" strokeWidth="2" />
              <rect x="334" y="114" width="28" height="14" rx="4" fill="#ffffff" stroke="#003666" strokeWidth="2" />
              {/* Outer retracting cannula */}
              <rect x="52" y="111" width="176" height="20" rx="3" fill="#cbd5e1" stroke="#334155" strokeWidth="1.6" />
              {/* Stationary blunt obturator */}
              <line x1="36" y1="121" x2="254" y2="121" stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" />
              {/* Fixed lock indicator on obturator */}
              <rect x="30" y="142" width="108" height="22" rx="5" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
              <text x="84" y="156" fill="#0369a1" fontSize="8.8" fontWeight="800" textAnchor="middle">
                {isEs ? 'Obturador FIJO' : 'Obturator FIXED'}
              </text>
              {/* Withdrawal arrow */}
              <path d="M 186 52 L 96 52 M 112 42 L 96 52 L 112 62" stroke="#dc2626" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x="142" y="36" fill="#dc2626" fontSize="10" fontWeight="800" textAnchor="middle">
                {isEs ? 'Retirar cánula 2 cm ←' : 'Retract outer sleeve 2 cm ←'}
              </text>
              {/* Intact pellets label */}
              <text x="312" y="152" fill="#166534" fontSize="9.5" fontWeight="800" textAnchor="middle">
                {isEs ? '✓ Pellets intactos (sin aplastar)' : '✓ Intact cylinders (zero crush)'}
              </text>
              <text x="210" y="204" fill="#475569" fontSize="9" fontWeight="700" textAnchor="middle">
                {isEs ? 'Técnica de desnudamiento: cero fuerza axial sobre el cristal puro' : 'Retrograde unsheathing: zero axial compression on pure crystalline pellet'}
              </text>
            </svg>
          )}

          {currentStep.svgType === 'closure' && (
            <svg viewBox="0 0 420 230" className="trocar-svg-canvas" role="img" aria-label={isEs ? 'Cierre sin suturas con Steri-Strips y Tegaderm' : 'Sutureless Steri-Strip and waterproof Tegaderm closure'}>
              <rect x="8" y="8" width="404" height="214" rx="12" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.2" />
              <rect x="34" y="34" width="352" height="128" rx="10" fill="#ffedd5" stroke="#fdba74" strokeWidth="1.4" />
              {/* Transparent Waterproof Tegaderm */}
              <rect x="118" y="48" width="184" height="100" rx="8" fill="#38bdf8" fillOpacity="0.18" stroke="#0284c7" strokeWidth="1.8" strokeDasharray="4 3" />
              {/* Skin micro-incision apposed */}
              <line x1="186" y1="98" x2="234" y2="98" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" />
              {/* Steri-Strips */}
              <rect x="195" y="66" width="11" height="64" rx="2" fill="#fefce8" stroke="#ca8a04" strokeWidth="1.2" />
              <rect x="214" y="66" width="11" height="64" rx="2" fill="#fefce8" stroke="#ca8a04" strokeWidth="1.2" />
              <text x="210" y="25" fill="#003666" fontSize="10.5" fontWeight="800" textAnchor="middle">
                {isEs ? 'Steri-Strips + Apósito Impermeable (+ Opcional Dermabond)' : 'Steri-Strips + Waterproof Tegaderm (+ Optional Dermabond)'}
              </text>
              {/* Differentiated rest pills */}
              <rect x="34" y="174" width="170" height="36" rx="6" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.2" />
              <text x="119" y="190" fill="#15803d" fontSize="9.2" fontWeight="800" textAnchor="middle">
                {isEs ? 'Mujer (3.2 mm): 3–5 días' : 'Female (3.2 mm): 3–5 days'}
              </text>
              <text x="119" y="203" fill="#475569" fontSize="8" textAnchor="middle">
                {isEs ? 'Sin sentadillas ni inmersión' : 'No squats or water immersion'}
              </text>
              <rect x="216" y="174" width="170" height="36" rx="6" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.2" />
              <text x="301" y="190" fill="#1d4ed8" fontSize="9.2" fontWeight="800" textAnchor="middle">
                {isEs ? 'Hombre (4.5 mm): 5–7 días' : 'Male (4.5 mm): 5–7 days'}
              </text>
              <text x="301" y="203" fill="#475569" fontSize="8" textAnchor="middle">
                {isEs ? 'Seco 48h · Extrusión < 0.3%' : 'Dry 48h · Extrusion < 0.3%'}
              </text>
            </svg>
          )}

          <div className="trocar-visual-caption">
            {isEs ? `Esquema Anatómico-Quirúrgico · Fase ${currentStep.step} de 6` : `Anatomical & Surgical Schematic · Stage ${currentStep.step} of 6`}
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
              <strong>{isEs ? 'Especificación Técnica:' : 'Technical Specification:'}</strong>{' '}
              {isEs ? currentStep.clinicalSpecsEs : currentStep.clinicalSpecsEn}
            </div>
          </div>

          <div className="trocar-info-callout trocar-callout-trend">
            <Sparkles size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#15803d' }} />
            <div>
              {isEs ? currentStep.trendEs : currentStep.trendEn}
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

      {/* ── OPTIONAL CLINICAL DOSING MATRIX (kept for embedded monograph views) ── */}
      {showDosingMatrix && (
        <div className="trocar-calculator-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.90rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={15} color="#0284c7" />
                <span>{isEs ? 'Matriz Clínica de Combinación & Titulación BHRT' : 'Clinical BHRT Synergy & Titration Matrix'}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                {isEs ? 'Directrices de posología para los pellets del catálogo Pharmapolis' : 'Prescription guidelines across Pharmapolis pellet strengths'}
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
                {isEs ? 'Para sofocos leves, transición hormonal y pacientes de bajo IMC (< 22 kg/m²). Duración: 3.5 a 5 meses.' : 'Mild hot flashes, early transition, and low-BMI (<22 kg/m²) patients. Release: 3.5–5 months.'}
              </p>
            </div>

            <div className="trocar-calc-card">
              <div className="trocar-calc-card-title">{isEs ? '2. Menopausia Establecida / Quirúrgica' : '2. Established Menopause / Surgical'}</div>
              <div className="trocar-calc-pellet-pill" style={{ background: '#fdf2f8', borderColor: '#fbcfe8', color: '#db2777' }}>
                <span>Estradiol 25 mg</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                {isEs ? 'Estándar clínico para control vasomotor y densidad ósea. Requiere progesterona micronizada si el útero está intacto.' : 'Clinical gold standard for vasomotor control and bone density. Requires micronized progesterone if uterus is intact.'}
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
                <span>Testosterona 100–200 mg (Abanico V/W)</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#475569', lineHeight: 1.4 }}>
                {isEs ? 'Protocolo andrológico con trócar de 4.5 mm en 2–3 túneles radiales. Nivel eugonadal continuo de 4 a 6 meses.' : 'Andrology protocol with 4.5 mm trocar across 2–3 radial fan tracks. Sustained eugonadal levels for 4–6 months.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
