"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PublicUnifiedHeader from '@/components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '@/components/shared/PublicUnifiedFooter';
import InteractiveTrocarPelletGuide from '@/components/product/InteractiveTrocarPelletGuide';
import UniversalShareDrawer from '@/components/ui/UniversalShareDrawer';
import { usePublicWorkspace } from '@/context/PublicWorkspaceContext';
import toast from 'react-hot-toast';
import {
  Syringe,
  ShieldCheck,
  Share2,
  Package,
  Layers,
  ArrowRight,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Printer,
  ClipboardCheck,
  FileText,
  Sparkles,
  RotateCcw
} from '@/lib/icons';

// ── Clinical Planner Matrix (2025/26 BHRT Consensus) ─────────────────────────
const CLINICAL_PROFILES = [
  {
    id: 'female_peri',
    labelEn: 'Female · Perimenopause',
    labelEs: 'Mujer · Perimenopausia',
    trocarEn: '3.2 mm Single-Use Sterile Disposable',
    trocarEs: '3.2 mm Desechable Estéril (1 uso)',
    tracksEn: '1 linear subcutaneous track (3.5 cm)',
    tracksEs: '1 túnel subcutáneo único (3.5 cm)',
    pelletsEn: '17β-Estradiol 12.5 mg (± Testosterone 25–50 mg)',
    pelletsEs: '17β-Estradiol 12.5 mg (± Testosterona 25–50 mg)',
    restEn: '3–5 days (no squats / cycling / water submersion)',
    restEs: '3–5 días (sin sentadillas, ciclismo ni inmersión)',
    durationEn: '3.5 – 4.5 months',
    durationEs: '3.5 – 4.5 meses',
    labWindowEn: 'Peak serum panel at 4–6 wks (E2, Free/Total T, FSH, SHBG)',
    labWindowEs: 'Analítica pico a 4–6 sem (E2, T Libre/Total, FSH, SHBG)',
    safetyEn: 'Intact Uterus Rule: Mandatory oral micronized progesterone (100–200 mg nightly) for endometrial protection.',
    safetyEs: 'Regla de Útero Intacto: Progesterona micronizada oral obligatoria (100–200 mg/noche) para protección endometrial.',
    badgeColor: '#0284c7',
    badgeBg: '#e0f2fe',
  },
  {
    id: 'female_meno',
    labelEn: 'Female · Menopause / Surgical',
    labelEs: 'Mujer · Menopausia Establecida',
    trocarEn: '3.2 mm Single-Use Sterile Disposable',
    trocarEs: '3.2 mm Desechable Estéril (1 uso)',
    tracksEn: '1 subcutaneous track (3.5–4.0 cm)',
    tracksEs: '1 túnel subcutáneo (3.5–4.0 cm)',
    pelletsEn: '17β-Estradiol 25 mg (+ Testosterone 50 mg optional)',
    pelletsEs: '17β-Estradiol 25 mg (+ Testosterona 50 mg opcional)',
    restEn: '3–5 days (dry dressing 48h, zero gluteal strain)',
    restEs: '3–5 días (apósito seco 48h, sin tensión glútea)',
    durationEn: '4 – 5 months',
    durationEs: '4 – 5 meses',
    labWindowEn: 'Peak serum panel at 4–6 wks + bone/metabolic annual review',
    labWindowEs: 'Analítica pico a 4–6 sem + revisión ósea/metabólica anual',
    safetyEn: 'Mandatory micronized bioidentical progesterone if uterus is intact. Evaluate mammogram/pelvic ultrasound baseline.',
    safetyEs: 'Progesterona bioidéntica micronizada obligatoria si hay útero intacto. Verificar mamografía/ecografía basal.',
    badgeColor: '#db2777',
    badgeBg: '#fdf2f8',
  },
  {
    id: 'female_androgen',
    labelEn: 'Female · Androgen / Vitality',
    labelEs: 'Mujer · Sinergia Androgénica',
    trocarEn: '3.2 mm Single-Use Sterile Disposable',
    trocarEs: '3.2 mm Desechable Estéril (1 uso)',
    tracksEn: '1 subcutaneous track (3.5 cm)',
    tracksEs: '1 túnel subcutáneo (3.5 cm)',
    pelletsEn: 'Testosterone 50 mg – 75 mg (titrated by body weight & SHBG)',
    pelletsEs: 'Testosterona 50 mg – 75 mg (titulada por peso y SHBG)',
    restEn: '3–5 days lower-body rest',
    restEs: '3–5 días de reposo de tren inferior',
    durationEn: '3.5 – 4.5 months',
    durationEs: '3.5 – 4.5 meses',
    labWindowEn: 'Peak Total/Free T & DHT at 4–6 wks; monitor clinical androgenicity',
    labWindowEs: 'Pico T Total/Libre y DHT a 4–6 sem; vigilar signos androgénicos',
    safetyEn: 'Monitor for mild acne or hirsutism if Free T exceeds upper female physiologic range; consider Spironolactone/Saw Palmetto if sensitive.',
    safetyEs: 'Vigilar acné leve o hirsutismo si la T Libre supera el rango fisiológico femenino; valorar titulación conservadora en siguiente ciclo.',
    badgeColor: '#15803d',
    badgeBg: '#f0fdf4',
  },
  {
    id: 'male_trt',
    labelEn: 'Male · Andropause / TRT',
    labelEs: 'Hombre · Andropausia / TRT',
    trocarEn: '4.5 mm Single-Use Sterile Disposable',
    trocarEs: '4.5 mm Desechable Estéril (1 uso)',
    tracksEn: '2–3 Radial Fan Tracks ("V" or "W" fan) from 1 incision · max 3–4 pellets/track',
    tracksEs: '2–3 Túneles en Abanico Radial ("V" o "W") desde 1 incisión · máx 3–4 pellets/túnel',
    pelletsEn: 'Testosterone 100 mg × 6–10 pellets (or 200 mg × 4–6 pellets)',
    pelletsEs: 'Testosterona 100 mg × 6–10 pellets (o 200 mg × 4–6 pellets)',
    restEn: '5–7 days strict lower-body / cycling / hot-tub avoidance',
    restEs: '5–7 días estrictos sin piernas, ciclismo ni inmersión',
    durationEn: '4.5 – 6 months',
    durationEs: '4.5 – 6 meses',
    labWindowEn: 'Peak Total/Free T, E2, CBC/Hematocrit & PSA at 4–6 wks',
    labWindowEs: 'Pico T Total/Libre, E2, Hemograma/Hematocrito y PSA a 4–6 sem',
    safetyEn: 'Monitor Hematocrit (action threshold > 52%) and PSA baseline/follow-up. Use multi-track fanning to keep extrusion < 0.3%.',
    safetyEs: 'Controlar Hematocrito (umbral de acción > 52%) y PSA basal/seguimiento. El abanico radial es clave para mantener extrusión < 0.3%.',
    badgeColor: '#6d28d9',
    badgeBg: '#faf5ff',
  },
];

const BODY_HABITUS = [
  {
    id: 'normal',
    labelEn: 'Normal BMI (20–28)',
    labelEs: 'IMC Normal (20–28)',
    siteEn: 'Primary Upper-Outer Gluteal Quadrant (3–5 cm below iliac crest)',
    siteEs: 'Cuadrante Súpero-Externo Glúteo (3–5 cm bajo cresta ilíaca)',
    depthEn: 'Standard pinch fold ≥ 2.5 cm · Mid-subcutaneous adipose plane',
    depthEs: 'Pliegue estándar ≥ 2.5 cm · Plano adiposo subcutáneo medio',
  },
  {
    id: 'lean',
    labelEn: 'Athletic / Lean (BMI < 20)',
    labelEs: 'Atlético / Delgado (IMC < 20)',
    siteEn: 'Posterior Flank / Lateral Hip Adipose Pad (verify ≥ 2.5 cm pinch fold)',
    siteEs: 'Flanco Posterior / Cadera Lateral (verificar pliegue ≥ 2.5 cm)',
    depthEn: 'Ultra-shallow 0° tunneling + optional POCUS depth verification; avoid deep fascia',
    depthEs: 'Túnel superficial a 0° + verificación ecográfica opcional; evitar fascia profunda',
  },
  {
    id: 'high',
    labelEn: 'Higher Adiposity (BMI > 28)',
    labelEs: 'Mayor Adiposidad (IMC > 28)',
    siteEn: 'Upper-Outer Gluteal Quadrant (superficial-to-mid fat layer)',
    siteEs: 'Cuadrante Súpero-Externo Glúteo (capa grasa superficial-media)',
    depthEn: 'Avoid overly deep tunneling (> 2 cm below dermis) to ensure predictable vascular absorption & consider aromatization monitoring',
    depthEs: 'Evitar túneles excesivamente profundos (> 2 cm) para absorción vascular estable y vigilar conversión a E2 (aromatasa)',
  },
];

const PREOP_CHECKLIST = [
  { id: 'consent', group: 'patient', en: 'Signed BHRT informed consent & pre-procedure medication review', es: 'Consentimiento informado BHRT firmado y revisión de medicación' },
  { id: 'washout', group: 'patient', en: 'Confirmed 5–7 day washout of NSAIDs, Aspirin (if elective), Fish Oil / Vitamin E', es: 'Confirmada suspensión 5–7 días de AINEs, Omega-3 / Vitamina E (si electivo)' },
  { id: 'labs', group: 'labs', en: 'Baseline lab panel verified (E2, Total/Free T, FSH/LH, CBC/Hct, Thyroid, SHBG; PSA in men)', es: 'Analítica basal verificada (E2, T Total/Libre, FSH/LH, Hemograma/Hto, Tiroides, SHBG; PSA en varón)' },
  { id: 'antiseptic', group: 'tray', en: '2% Chlorhexidine / 70% Alcohol prep + sterile fenestrated drape + surgical marker', es: 'Clorhexidina 2% en alcohol 70% + paño fenestrado estéril + marcador quirúrgico' },
  { id: 'anesthesia', group: 'tray', en: 'Buffered 9:1 Lidocaine 2% w/ Epi (1.8 mL) + 8.4% NaHCO₃ (0.2 mL) + 27G × 1.5" needle', es: 'Lidocaína 2% con Epi amortiguada 9:1 (1.8 mL + 0.2 mL Bicarbonato 8.4%) + aguja 27G × 1.5"' },
  { id: 'trocar', group: 'tray', en: 'Single-use sterile disposable trocar kit (3.2 mm or 4.5 mm), #11 scalpel & non-toothed Adson forceps', es: 'Kit de trócar desechable estéril (3.2 mm o 4.5 mm), bisturí #11 y pinzas Adson sin dientes' },
  { id: 'pellets', group: 'tray', en: 'Pharmapolis EU GMP sterile pellet vials verified (lot #, BUD, strength & quantity)', es: 'Viales estériles de pellets Pharmapolis EU GMP verificados (lote, caducidad, dosis y unidades)' },
  { id: 'closure', group: 'tray', en: 'Steri-Strips, waterproof Tegaderm dressing (+ optional Dermabond adhesive) & sterile gauze', es: 'Steri-Strips, apósito impermeable Tegaderm (+ opcional Dermabond) y gasas estériles' },
];

const COMPLICATIONS_DATA = [
  {
    id: 'extrusion',
    severity: 'low',
    rate: '< 0.3%',
    titleEn: 'Pellet Extrusion / Surface Migration',
    titleEs: 'Extrusión / Migración Superficial del Pellet',
    causeEn: 'Oversized incision (> 5 mm), excessive pellets stacked in 1 tunnel (> 4), or premature gluteal exercise/submersion.',
    causeEs: 'Incisión sobredimensionada (> 5 mm), apilar > 4 pellets en un túnel o ejercicio glúteo/inmersión precoz.',
    actionEn: 'If pellet is visible at skin edge, remove cleanly with sterile forceps — NEVER re-insert. Apply sterile dressing; prescribe topical/oral antibiotic only if localized cellulitis develops.',
    actionEs: 'Si el pellet asoma por el borde cutáneo, retirar de forma estéril — NUNCA reinsertar. Cubrir con apósito estéril; antibiótico solo si hay signos de celulitis localizada.',
  },
  {
    id: 'hematoma',
    severity: 'moderate',
    rate: '1 – 2%',
    titleEn: 'Localized Ecchymosis or Hematoma',
    titleEs: 'Equimosis Localizada o Hematoma',
    causeEn: 'Insufficient wait time (< 3 min) after epinephrine infiltration or unpaused antiplatelets/fish oil.',
    causeEs: 'Espera insuficiente (< 3 min) tras epinefrina o consumo activo de antiagregantes/Omega-3.',
    actionEn: 'Apply firm manual pressure (5 min) + intermittent ice packs for 24h. Reassure patient that minor bruising resolves in 7–10 days. Rule out expanding collection if severe pain occurs.',
    actionEs: 'Compresión manual firme (5 min) + frío local intermitente 24h. Tranquilizar al paciente (reabsorción en 7–10 días). Descartar colección expansiva si existe dolor creciente.',
  },
  {
    id: 'erythrocytosis',
    severity: 'watch',
    rate: 'Male TRT',
    titleEn: 'Secondary Erythrocytosis (Hematocrit > 52%)',
    titleEs: 'Eritrocitosis Secundaria (Hematocrito > 52%)',
    causeEn: 'Sustained erythropoietin stimulation during high-dose male Testosterone pellet therapy (especially with sleep apnea).',
    causeEs: 'Estímulo sostenido de eritropoyesis en TRT masculino a dosis altas (especialmente si coexiste apnea del sueño).',
    actionEn: 'Verify hydration and screen for OSA. If Hct > 52–54%, perform therapeutic phlebotomy / blood donation and step down total testosterone pellet dosage on next cycle.',
    actionEs: 'Verificar hidratación y descartar SAOS. Si Hto > 52–54%, indicar flebotomía terapéutica/donación y reducir la carga total de testosterona en el siguiente ciclo.',
  },
  {
    id: 'aromatase',
    severity: 'watch',
    rate: 'Male TRT',
    titleEn: 'Elevated Estradiol / Aromatase Conversion',
    titleEs: 'Elevación de Estradiol / Aromatización',
    causeEn: 'Increased peripheral CYP19A1 conversion in adipose tissue (BMI > 28) during steady testosterone release.',
    causeEs: 'Mayor conversión periférica vía aromatasa (CYP19A1) en tejido adiposo (IMC > 28).',
    actionEn: 'Treat symptoms (nipple tenderness, water retention), not isolated lab numbers. First-line: DIM 200 mg + Zinc; reserve micro-dose Anastrozole strictly for symptomatic confirmed hyperestrogenemia.',
    actionEs: 'Tratar clínica (sensibilidad mamaria, retención), no cifras aisladas. 1.ª línea: DIM 200 mg + Zinc; reservar Anastrozol a microdosis solo ante hiperestrogenismo sintomático confirmado.',
  },
];

export default function PelletImplantationGuideClient() {
  const workspace = usePublicWorkspace();
  const [localLang, setLocalLang] = useState('en');
  const lang = workspace?.lang || localLang;
  const isEs = lang === 'es';

  const handleLangChange = (nextLang) => {
    setLocalLang(nextLang);
    if (workspace?.setLang) workspace.setLang(nextLang);
  };

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('female_meno');
  const [selectedHabitusId, setSelectedHabitusId] = useState('normal');
  const [opsTab, setOpsTab] = useState('checklist'); // 'checklist' | 'complications' | 'patient'
  const [checkedItems, setCheckedItems] = useState({});
  const [copiedPatientCare, setCopiedPatientCare] = useState(false);

  const shareUrl = 'https://www.atlashealth-services.com/guides/hormone-pellets-implantation';

  const activeProfile = useMemo(
    () => CLINICAL_PROFILES.find((p) => p.id === selectedProfileId) || CLINICAL_PROFILES[1],
    [selectedProfileId]
  );
  const activeHabitus = useMemo(
    () => BODY_HABITUS.find((h) => h.id === selectedHabitusId) || BODY_HABITUS[0],
    [selectedHabitusId]
  );

  const completedChecklistCount = Object.values(checkedItems).filter(Boolean).length;

  const toggleCheck = (id) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyPatientCare = async () => {
    const text = isEs
      ? `🏥 *Atlas Health Services — Pautas Post-Implante de Pellets Hormonales (BHRT)*
1. *Primeras 48 Horas*: Mantener el vendaje impermeable completamente seco e intacto. Aplicar frío local breve (15 min) si hay ligera molestia.
2. *Reposo de Zona Glútea*: Evitar sentadillas, peso muerto, ciclismo, correr o inmersión en agua (piscina/mar/bañera) durante *3–5 días (mujeres)* o *5–7 días (hombres)*.
3. *Ducha*: Permitida suavemente a partir de las 48h sin frotar ni retirar las tiras Steri-Strips. Secar a toques suaves.
4. *Retirada de Tiras*: Las Steri-Strips se desprenden solas entre los días 5 y 7.
5. *Seguimiento*: Analítica hormonal de control en pico a las *4–6 semanas*.`
      : `🏥 *Atlas Health Services — Post-Trocar Hormone Pellet Patient Care (BHRT)*
1. *First 48 Hours*: Keep the waterproof pressure dressing completely dry and intact. Brief cold pack (15 min) if mild soreness occurs.
2. *Gluteal Rest Window*: Avoid squats, deadlifts, cycling, running, or water submersion (pool/hot tub/sea) for *3–5 days (female)* or *5–7 days (male)*.
3. *Showering*: Gentle shower allowed after 48h without rubbing or peeling Steri-Strips. Pat dry gently.
4. *Steri-Strip Removal*: Strips fall off naturally between days 5 and 7.
5. *Follow-Up*: Scheduled peak serum hormone bloodwork at *4–6 weeks*.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedPatientCare(true);
      toast.success(isEs ? 'Pautas para WhatsApp copiadas ✓' : 'WhatsApp patient care copied ✓');
      setTimeout(() => setCopiedPatientCare(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudo copiar al portapapeles' : 'Could not copy to clipboard');
    }
  };

  const breadcrumbItems = useMemo(() => [
    { label: isEs ? 'Catálogo' : 'Catalog', href: '/catalog' },
    { label: isEs ? 'Pellets Hormonales (BHRT)' : 'Hormone Pellets (BHRT)', href: '/pricing/pellets' },
    { label: isEs ? 'Guía Clínica de Implantación' : 'Trocar Implantation Guide' },
  ], [isEs]);

  const anchorTabs = useMemo(() => [
    { id: 'protocol-sim', label: isEs ? 'Protocolo 6 Pasos' : '6-Step Visual Guide', href: '#protocol-sim' },
    { id: 'dosing-planner', label: isEs ? 'Planificador & Trócar' : 'Dosing & Trocar Planner', href: '#dosing-planner' },
    { id: 'pk-curve', label: isEs ? 'Farmacocinética' : 'Pharmacokinetics', href: '#pk-curve' },
    { id: 'clinical-ops', label: isEs ? 'Checklist & Seguridad' : 'Checklist & Safety', href: '#clinical-ops' },
    { id: 'catalog-pellets', label: isEs ? 'Monografías' : 'Monographs', href: '#catalog-pellets' },
  ], [isEs]);

  return (
    <div className="pellet-guide-page" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
      <style>{`
        .pellet-guide-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        @media (max-width: 900px) {
          .pellet-guide-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 520px) {
          .pellet-guide-kpi-grid { grid-template-columns: 1fr; }
        }
        .pellet-guide-planner-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 860px) {
          .pellet-guide-planner-grid { grid-template-columns: 1fr; }
        }
        .pellet-guide-pill-btn {
          padding: 7px 12px;
          border-radius: 6px;
          border: 1px solid #dadce0;
          background: #ffffff;
          color: #3c4043;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pellet-guide-pill-btn:hover {
          background: #f1f5f9;
          border-color: #93c5fd;
        }
        .pellet-guide-pill-btn.active {
          background: #e8f0fe;
          border-color: #1a73e8;
          color: #1a73e8;
          font-weight: 700;
        }
        .pellet-guide-section {
          scroll-margin-top: 112px;
          margin-bottom: 1.75rem;
        }
        @media print {
          .puh-header, .pellet-guide-no-print, footer, .global-bottom-sticky-bar {
            display: none !important;
          }
          .pellet-guide-page {
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* ── SINGLE 100% PUBLIC GOOGLE CLOUD CONSOLE HEADER (ZERO ADMIN CHROME) ── */}
      <PublicUnifiedHeader
        purePublic={true}
        lang={lang}
        onLangChange={handleLangChange}
        copyUrl={shareUrl}
        breadcrumb={breadcrumbItems}
        anchorTabs={anchorTabs}
      />

      {/* ── COMPACT GCP RESOURCE HEADER (NO DUPLICATE BREADCRUMB / NO DUPLICATE EN-ES) ── */}
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #dadce0',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: '#e8f0fe',
                color: '#1a73e8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Syringe size={18} />
              </div>

              <h1 style={{ fontSize: '1.28rem', fontWeight: 700, color: '#202124', margin: 0, letterSpacing: '-0.015em' }}>
                {isEs
                  ? 'Guía Clínica Visual de Implantación de Pellets Hormonales (BHRT)'
                  : 'Subcutaneous Hormone Pellet Trocar Implantation Clinical Guide'}
              </h1>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 9px',
                borderRadius: '12px',
                fontSize: '0.70rem',
                fontWeight: 700,
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                <span>{isEs ? 'Estándar EU GMP · 2025/26' : 'EU GMP Standard · 2025/26'}</span>
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: '#5f6368' }}>
              <span>Pharmapolis EU GMP</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span>{isEs ? 'Protocolo Ambulatorio de 10 min' : '10-Min Outpatient Procedure'}</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span>{isEs ? 'Abanico Radial & Desnudamiento Sin Fuerza' : 'Radial Fanning & Zero-Force Unsheathing'}</span>
            </div>
          </div>

          {/* Monochrome GCP Action Toolbar (Rule #40 & #57: 1 primary CTA + neutral secondary buttons) */}
          <div className="pellet-guide-no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="gcp-btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} />
              <span>{isEs ? 'Imprimir / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="gcp-btn-secondary"
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Share2 size={14} />
              <span>{isEs ? 'Compartir' : 'Share'}</span>
            </button>

            <Link
              href="/pricing/pellets"
              className="gcp-btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.76rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Package size={14} />
              <span>{isEs ? 'Tarifa Pellets (41 SKUs)' : 'Pellet Tariff (41 SKUs)'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (Generous bottom padding so floating dock never overlaps) ── */}
      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '1.5rem 1.5rem 6.5rem' }}>

        {/* ── BLOCK 1: 4 CLINICAL KPI METRIC CARDS (GCP Standard · Rule #22) ── */}
        <div className="pellet-guide-kpi-grid">
          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.71rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Tiempo en Consulta' : 'Chair Time'}
              </span>
              <Clock size={15} color="#1a73e8" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>~10 min</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Ambulatorio · Sin suturas · Alta inmediata' : 'Outpatient · Sutureless · Immediate discharge'}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.71rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Tasa Extrusión' : 'Extrusion Benchmark'}
              </span>
              <ShieldCheck size={15} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d' }}>&lt; 0.3%</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Abanico V/W + espera vasoconstricción 3–5m' : 'Radial V/W fan + 3–5m bloodless field'}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.71rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Trócar Desechable' : 'Disposable Trocar'}
              </span>
              <Syringe size={15} color="#7c3aed" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>3.2 / 4.5 mm</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Estéril de 1 uso · Mujer 3.2 · Hombre 4.5' : 'Single-use sterile · Female 3.2 · Male 4.5'}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.71rem', fontWeight: 700, color: '#5f6368', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isEs ? 'Liberación Orden Cero' : 'Zero-Order Release'}
              </span>
              <Activity size={15} color="#0284c7" />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#003666' }}>3.5 – 6 mo</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {isEs ? 'Pellets cristalinos puros · Sin picos' : 'Pure crystalline pellets · Steady curve'}
            </div>
          </div>
        </div>

        {/* ── BLOCK 2: INTERACTIVE 6-STEP VISUAL SURGICAL PROTOCOL ── */}
        <section id="protocol-sim" className="pellet-guide-section">
          <InteractiveTrocarPelletGuide lang={lang} showDosingMatrix={false} />
        </section>

        {/* ── BLOCK 3: INTERACTIVE PHYSICIAN DOSING, TROCAR & FAN-TRACK PLANNER ── */}
        <section
          id="dosing-planner"
          className="pellet-guide-section"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(60, 64, 67, 0.06)',
          }}
        >
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#1a73e8" />
                <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#003666' }}>
                  {isEs ? 'Planificador Rápido de Trócar, Túneles y Dosificación' : 'Interactive Physician Trocar, Fan-Track & Dosing Planner'}
                </h2>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#5f6368' }}>
                {isEs
                  ? 'Selecciona el perfil clínico y la composición corporal para visualizar el calibre de trócar, geometría de abanico y controles obligatorios.'
                  : 'Select patient clinical profile and body composition to review recommended trocar gauge, radial track geometry, and mandatory lab checks.'}
              </p>
            </div>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#5f6368',
              background: '#ffffff',
              border: '1px solid #dadce0',
              borderRadius: '999px',
              padding: '3px 10px',
            }}>
              {isEs ? 'Referencia Clínica Orientativa' : 'Clinical Decision Aid'}
            </span>
          </div>

          <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Selectors Row */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', minWidth: '115px' }}>
                  {isEs ? '1. Perfil Clínico:' : '1. Clinical Profile:'}
                </span>
                {CLINICAL_PROFILES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`pellet-guide-pill-btn ${selectedProfileId === p.id ? 'active' : ''}`}
                  >
                    {isEs ? p.labelEs : p.labelEn}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', minWidth: '115px' }}>
                  {isEs ? '2. Composición:' : '2. Body Habitus:'}
                </span>
                {BODY_HABITUS.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setSelectedHabitusId(h.id)}
                    className={`pellet-guide-pill-btn ${selectedHabitusId === h.id ? 'active' : ''}`}
                  >
                    {isEs ? h.labelEs : h.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Recommendation Output */}
            <div className="pellet-guide-planner-grid" style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px',
            }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isEs ? 'Trócar & Geometría de Túnel' : 'Trocar & Track Geometry'}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#003666', marginBottom: '4px' }}>
                  {isEs ? activeProfile.trocarEs : activeProfile.trocarEn}
                </div>
                <div style={{ fontSize: '0.77rem', color: '#334155', lineHeight: 1.45 }}>
                  {isEs ? activeProfile.tracksEs : activeProfile.tracksEn}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isEs ? 'Sitio & Plano Anatómico' : 'Anatomic Site & Depth'}
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#15803d', marginBottom: '4px' }}>
                  {isEs ? activeHabitus.siteEs : activeHabitus.siteEn}
                </div>
                <div style={{ fontSize: '0.77rem', color: '#334155', lineHeight: 1.45 }}>
                  {isEs ? activeHabitus.depthEs : activeHabitus.depthEn}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {isEs ? 'Pellets & Ventana Analítica' : 'Reference Pellets & Telemetry'}
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: activeProfile.badgeColor,
                  background: activeProfile.badgeBg,
                  marginBottom: '6px',
                }}>
                  {isEs ? activeProfile.pelletsEs : activeProfile.pelletsEn}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#334155', lineHeight: 1.45 }}>
                  <strong>{isEs ? 'Duración:' : 'Duration:'}</strong> {isEs ? activeProfile.durationEs : activeProfile.durationEn}
                  <br />
                  <strong>{isEs ? 'Control:' : 'Labs:'}</strong> {isEs ? activeProfile.labWindowEs : activeProfile.labWindowEn}
                </div>
              </div>
            </div>

            {/* Mandatory Clinical Safety Banner for selected profile */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '0.78rem',
              color: '#92400e',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1, minWidth: '240px' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>{isEs ? 'Seguridad Clínica Obligatoria:' : 'Mandatory Clinical Safeguard:'}</strong>{' '}
                  {isEs ? activeProfile.safetyEs : activeProfile.safetyEn}{' '}
                  <span style={{ color: '#78350f' }}>
                    ({isEs ? 'Reposo:' : 'Rest:'} {isEs ? activeProfile.restEs : activeProfile.restEn})
                  </span>
                </div>
              </div>
              <Link
                href="/pricing/pellets"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1a73e8',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{isEs ? 'Ver dosis en Tarifa' : 'View Strengths in Tariff'}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── BLOCK 4: ZERO-ORDER PHARMACOKINETICS VISUAL COMPARISON ── */}
        <section
          id="pk-curve"
          className="pellet-guide-section"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '12px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 1px 4px rgba(60, 64, 67, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#003666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={17} color="#0284c7" />
                <span>{isEs ? 'Farmacocinética de Orden Cero: Pellets vs. Inyectables vs. Geles' : 'Zero-Order Pharmacokinetics: Pellets vs. Injections vs. Creams'}</span>
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.76rem', color: '#5f6368' }}>
                {isEs
                  ? 'Comparativa visual de niveles séricos durante 16 semanas — por qué la liberación subcutánea por erosión superficial evita el efecto "montaña rusa".'
                  : 'Visual 16-week serum concentration comparison — why surface-erosion subcutaneous pellets avoid the hormonal "rollercoaster" effect.'}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            alignItems: 'center',
          }}>
            {/* Responsive Pharmacokinetics SVG */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
              <svg viewBox="0 0 540 215" style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label={isEs ? 'Curva farmacocinética comparativa BHRT' : 'Comparative BHRT pharmacokinetic curve'}>
                {/* Optimal physiological green band */}
                <rect x="46" y="64" width="474" height="68" fill="#dcfce7" fillOpacity="0.55" rx="4" />
                <text x="514" y="78" fill="#15803d" fontSize="9" fontWeight="800" textAnchor="end">
                  {isEs ? 'Ventana Terapéutica Óptima' : 'Optimal Physiologic Window'}
                </text>
                {/* Supraphysiological red zone */}
                <rect x="46" y="18" width="474" height="44" fill="#fee2e2" fillOpacity="0.35" rx="4" />
                <text x="514" y="32" fill="#b91c1c" fontSize="8.5" fontWeight="700" textAnchor="end">
                  {isEs ? 'Zona Suprafisiológica (Picos / Efectos adversos)' : 'Supraphysiologic Zone (Spikes / Side effects)'}
                </text>
                {/* Axes */}
                <line x1="46" y1="18" x2="46" y2="180" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="46" y1="180" x2="520" y2="180" stroke="#94a3b8" strokeWidth="1.5" />
                {/* Y label */}
                <text x="14" y="102" fill="#475569" fontSize="9" fontWeight="700" transform="rotate(-90 14 102)" textAnchor="middle">
                  {isEs ? 'Nivel Sérico' : 'Serum Level'}
                </text>
                {/* X ticks (Weeks 0, 4, 8, 12, 16) */}
                {[
                  { x: 46, label: isEs ? 'Sem 0' : 'Wk 0' },
                  { x: 164, label: isEs ? 'Sem 4' : 'Wk 4' },
                  { x: 282, label: isEs ? 'Sem 8' : 'Wk 8' },
                  { x: 400, label: isEs ? 'Sem 12' : 'Wk 12' },
                  { x: 512, label: isEs ? 'Sem 16' : 'Wk 16' },
                ].map((t) => (
                  <g key={t.label}>
                    <line x1={t.x} y1="180" x2={t.x} y2="185" stroke="#64748b" strokeWidth="1.2" />
                    <text x={t.x} y="198" fill="#475569" fontSize="9" fontWeight="700" textAnchor="middle">{t.label}</text>
                  </g>
                ))}

                {/* Injectable IM Rollercoaster Curve (Red dashed) */}
                <path
                  d="M 46 168 Q 66 26, 86 92 T 126 158 Q 146 28, 166 94 T 206 160 Q 226 30, 246 95 T 286 158 Q 306 28, 326 92 T 366 160 Q 386 30, 406 94 T 446 158 Q 466 32, 486 96 T 518 156"
                  fill="none" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="4 3" opacity="0.85"
                />

                {/* Transdermal Creams Daily Waves (Amber dotted) */}
                <path
                  d="M 46 152 Q 62 118, 78 148 T 110 146 T 142 150 T 174 144 T 206 152 T 238 146 T 270 150 T 302 145 T 334 152 T 366 146 T 398 151 T 430 146 T 462 152 T 494 148 T 518 150"
                  fill="none" stroke="#d97706" strokeWidth="1.6" strokeDasharray="2 2" opacity="0.9"
                />

                {/* Subcutaneous Bioidentical Pellet Zero-Order Curve (Bold Deep Blue) */}
                <path
                  d="M 46 168 C 72 120, 108 92, 164 88 C 245 84, 340 88, 415 100 C 460 108, 492 126, 518 148"
                  fill="none" stroke="#1a73e8" strokeWidth="3.2" strokeLinecap="round"
                />
                {/* Peak lab window marker at Wk 4-6 */}
                <circle cx="164" cy="88" r="4.5" fill="#1a73e8" stroke="#ffffff" strokeWidth="1.5" />
                <text x="164" y="76" fill="#1a73e8" fontSize="8.5" fontWeight="800" textAnchor="middle">
                  {isEs ? 'Pico Lab 4–6s' : 'Peak Lab 4–6w'}
                </text>
              </svg>
            </div>

            {/* Legend & Clinical Takeaways */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '11px 14px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1d4ed8', marginBottom: '2px' }}>
                  ━━ {isEs ? 'Pellets Subcutáneos (Liberación Orden Cero)' : 'Subcutaneous Pellets (Zero-Order Release)'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
                  {isEs
                    ? 'Absorción continua dependiente del gasto cardíaco capilar durante 3.5–6 meses. 100% adherencia y mínimo impacto hepático de primer paso.'
                    : 'Continuous capillary-perfusion absorption over 3.5–6 months. 100% patient compliance and zero hepatic first-pass effect.'}
                </div>
              </div>

              <div style={{ padding: '11px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#dc2626', marginBottom: '2px' }}>
                  ┅┅ {isEs ? 'Inyectables IM (Picos & Valles)' : 'IM Injections (Peaks & Troughs)'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
                  {isEs
                    ? 'Picos suprafisiológicos a los 2–3 días (mayor riesgo de eritrocitosis/aromatización) seguidos de caída sintomática antes de la siguiente dosis.'
                    : 'Supraphysiologic spikes at day 2–3 (higher erythrocytosis/aromatization risk) followed by symptomatic trough crashes.'}
                </div>
              </div>

              <div style={{ padding: '11px 14px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#b45309', marginBottom: '2px' }}>
                  ┈┈ {isEs ? 'Geles / Cremas Transdérmicas' : 'Transdermal Gels / Creams'}
                </div>
                <div style={{ fontSize: '0.76rem', color: '#334155', lineHeight: 1.45 }}>
                  {isEs
                    ? 'Absorción dérmica variable día a día, fatiga de aplicación diaria y riesgo documentado de transferencia secundaria por contacto.'
                    : 'Variable daily skin absorption, daily adherence drop-off, and documented secondary transfer risk to partners or children.'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BLOCK 5: CLINICAL OPS SUITE (CHECKLIST · COMPLICATIONS · PATIENT HANDOUT) ── */}
        <section
          id="clinical-ops"
          className="pellet-guide-section"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(60, 64, 67, 0.06)',
          }}
        >
          {/* Tab Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '0 1.25rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}>
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }} role="tablist">
              {[
                { id: 'checklist', icon: ClipboardCheck, en: `Pre-Op Sterile Checklist (${completedChecklistCount}/${PREOP_CHECKLIST.length})`, es: `Checklist Pre-Quirúrgico (${completedChecklistCount}/${PREOP_CHECKLIST.length})` },
                { id: 'complications', icon: AlertTriangle, en: 'Complications & Red Flags', es: 'Complicaciones & Manejo' },
                { id: 'patient', icon: FileText, en: 'Patient Post-Op Handout', es: 'Hoja Post-Implante Paciente' },
              ].map((t) => {
                const Icon = t.icon;
                const active = opsTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setOpsTab(t.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 14px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: active ? '2.5px solid #1a73e8' : '2.5px solid transparent',
                      color: active ? '#1a73e8' : '#5f6368',
                      fontSize: '0.80rem',
                      fontWeight: active ? 700 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={15} />
                    <span>{isEs ? t.es : t.en}</span>
                  </button>
                );
              })}
            </div>

            {opsTab === 'checklist' && completedChecklistCount > 0 && (
              <button
                type="button"
                onClick={() => setCheckedItems({})}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'transparent',
                  border: 'none',
                  color: '#5f6368',
                  fontSize: '0.73rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                <span>{isEs ? 'Reiniciar' : 'Reset'}</span>
              </button>
            )}
          </div>

          <div style={{ padding: '1.25rem 1.5rem' }}>
            {/* TAB 1: INTERACTIVE PRE-OP CHECKLIST */}
            {opsTab === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.76rem', color: '#5f6368' }}>
                    {isEs
                      ? 'Marca cada punto durante la preparación de mesa estéril y verificación del paciente antes de iniciar.'
                      : 'Check off each item during sterile tray setup and patient verification prior to physician entry.'}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 9px',
                    borderRadius: '999px',
                    background: completedChecklistCount === PREOP_CHECKLIST.length ? '#f0fdf4' : '#eff6ff',
                    color: completedChecklistCount === PREOP_CHECKLIST.length ? '#16a34a' : '#1a73e8',
                    border: completedChecklistCount === PREOP_CHECKLIST.length ? '1px solid #bbf7d0' : '1px solid #bfdbfe',
                    whiteSpace: 'nowrap',
                  }}>
                    {completedChecklistCount === PREOP_CHECKLIST.length
                      ? (isEs ? '✓ Listo para implantación' : '✓ Ready for Procedure')
                      : `${Math.round((completedChecklistCount / PREOP_CHECKLIST.length) * 100)}%`}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '8px' }}>
                  {PREOP_CHECKLIST.map((item) => {
                    const checked = Boolean(checkedItems[item.id]);
                    return (
                      <label
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: checked ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          background: checked ? '#f0fdf4' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCheck(item.id)}
                          style={{ marginTop: '2px', accentColor: '#16a34a', width: '16px', height: '16px', flexShrink: 0 }}
                        />
                        <span style={{
                          fontSize: '0.80rem',
                          color: checked ? '#166534' : '#1e293b',
                          textDecoration: checked ? 'line-through' : 'none',
                          lineHeight: 1.4,
                        }}>
                          {isEs ? item.es : item.en}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: COMPLICATIONS & RED FLAGS */}
            {opsTab === 'complications' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {COMPLICATIONS_DATA.map((c) => {
                  const pillColors = c.severity === 'low'
                    ? { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }
                    : c.severity === 'moderate'
                    ? { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }
                    : { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' };
                  return (
                    <div
                      key={c.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '14px',
                        background: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666' }}>
                          {isEs ? c.titleEs : c.titleEn}
                        </span>
                        <span style={{
                          fontSize: '0.67rem',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '999px',
                          background: pillColors.bg,
                          color: pillColors.color,
                          border: `1px solid ${pillColors.border}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {c.rate}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.45 }}>
                        <strong>{isEs ? 'Causa habitual:' : 'Common Cause:'}</strong> {isEs ? c.causeEs : c.causeEn}
                      </div>
                      <div style={{ fontSize: '0.77rem', color: '#1e293b', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', lineHeight: 1.45 }}>
                        <strong>{isEs ? 'Conducta clínica:' : 'Clinical Action:'}</strong> {isEs ? c.actionEs : c.actionEn}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: PATIENT DISCHARGE & WHATSAPP HANDOUT */}
            {opsTab === 'patient' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.80rem', color: '#475569' }}>
                    {isEs
                      ? 'Entrega estas instrucciones al paciente al alta o envíalas en 1 clic por WhatsApp para asegurar una tasa de extrusión < 0.3%.'
                      : 'Provide these instructions at discharge or send via WhatsApp in 1 click to maintain an extrusion rate < 0.3%.'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleCopyPatientCare}
                      className="gcp-btn-primary"
                      style={{ padding: '7px 14px', fontSize: '0.76rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      {copiedPatientCare ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedPatientCare ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar para WhatsApp' : 'Copy for WhatsApp')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => typeof window !== 'undefined' && window.print()}
                      className="gcp-btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Printer size={14} />
                      <span>{isEs ? 'Imprimir' : 'Print'}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
                  {[
                    { num: '48h', titleEn: 'Keep Dry & Intact', titleEs: 'Seco e Intacto 48h', bodyEn: 'Do not wet or peel the waterproof dressing. Optional brief ice pack (15 min) for mild soreness.', bodyEs: 'No mojar ni retirar el apósito impermeable. Frío local opcional (15 min) si hay ligera molestia.' },
                    { num: '3–7d', titleEn: 'Lower-Body Rest', titleEs: 'Reposo Glúteo', bodyEn: 'Avoid squats, cycling, running, pools, hot tubs, or sea for 3–5d (female) or 5–7d (male).', bodyEs: 'Sin sentadillas, ciclismo, piscina, jacuzzi ni mar durante 3–5 días (mujer) o 5–7 días (hombre).' },
                    { num: '5–7d', titleEn: 'Steri-Strips Natural Off', titleEs: 'Caída Natural de Tiras', bodyEn: 'Gentle shower after 48h; pat dry. Steri-Strips peel off naturally around days 5–7.', bodyEs: 'Ducha suave desde las 48h; secar a toques. Las Steri-Strips se desprenden solas días 5–7.' },
                    { num: '4–6w', titleEn: 'Peak Hormone Labs', titleEs: 'Analítica en Pico', bodyEn: 'Complete scheduled follow-up serum bloodwork at weeks 4–6 to verify optimal titration.', bodyEs: 'Realizar analítica hormonal de control en las semanas 4–6 para verificar titulación óptima.' },
                  ].map((card) => (
                    <div key={card.num} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a73e8', marginBottom: '2px' }}>{card.num}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{isEs ? card.titleEs : card.titleEn}</div>
                      <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>{isEs ? card.bodyEs : card.bodyEn}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── BLOCK 6: PHARMAPOLIS EU GMP PELLETS CATALOG SHORTCUTS ── */}
        <section id="catalog-pellets" className="pellet-guide-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#003666', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#0284c7" />
              <span>{isEs ? 'Monografías Clínicas de Pellets & Kits Desechables' : 'Pharmapolis Hormone Pellet Monographs & Trocar Kits'}</span>
            </h3>
            <Link
              href="/pricing/pellets"
              style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a73e8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{isEs ? 'Ver catálogo completo (41 SKUs)' : 'View full catalog (41 SKUs)'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {[
              { href: '/p/estradiol-12-5mg-pellet', tag: 'Estradiol (E2)', color: '#0284c7', title: '17β-Estradiol 12.5 mg', subEs: 'Perimenopausia / Iniciación · Trócar 3.2 mm', subEn: 'Perimenopause / Initiation · 3.2 mm Trocar' },
              { href: '/p/estradiol-25mg-pellet', tag: 'Estradiol (E2)', color: '#db2777', title: '17β-Estradiol 25 mg', subEs: 'Estándar Menopausia · Trócar 3.2 mm', subEn: 'Menopause Standard · 3.2 mm Trocar' },
              { href: '/p/testosterone-50mg-pellet', tag: isEs ? 'Testosterona' : 'Testosterone', color: '#166534', title: isEs ? 'Testosterona 50 mg' : 'Testosterone 50 mg', subEs: 'Sinergia Femenina · Trócar 3.2 mm', subEn: 'Female Synergy · 3.2 mm Trocar' },
              { href: '/p/testosterone-100mg-pellet', tag: isEs ? 'Testosterona' : 'Testosterone', color: '#6b21a8', title: isEs ? 'Testosterona 100 mg' : 'Testosterone 100 mg', subEs: 'TRT Masculino · Abanico V/W · Trócar 4.5 mm', subEn: 'Male TRT · Radial V/W Fan · 4.5 mm Trocar' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '10px',
                  padding: '14px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: item.color, textTransform: 'uppercase' }}>{item.tag}</div>
                <div style={{ fontSize: '0.94rem', fontWeight: 800, color: '#003666' }}>{item.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px' }}>{isEs ? item.subEs : item.subEn}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: '#1a73e8', fontWeight: 700, marginTop: 'auto' }}>
                  <CheckCircle2 size={12} />
                  <span>{isEs ? 'Abrir Monografía' : 'Open Monograph'}</span>
                  <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── BLOCK 7: CLINICAL EVIDENCE, PUBMED STUDIES & REGULATORY STANDARDS ── */}
        <section id="clinical-studies" className="pellet-guide-section" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#003666', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={16} color="#166534" />
              <span>{isEs ? 'Evidencia Clínica (PubMed) & Estándares Regulatorios' : 'Peer-Reviewed Clinical Studies (PubMed) & Quality Standards'}</span>
            </h3>
            <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#166534', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: '999px' }}>
              {isEs ? 'EU GMP · Kits Trócar Marcado CE · CoA por Lote' : 'EU GMP Sterile · CE-Marked Trocar Kits · Batch CoA'}
            </span>
          </div>

          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '14px', fontSize: '0.80rem', color: '#334155', lineHeight: 1.5 }}>
            {isEs ? (
              <>
                <strong>Calidad y Certificación:</strong> Los pellets hormonales bioidénticos son implantes estériles magistrales elaborados bajo estándares <strong>EU GMP / USP &lt;797&gt; y &lt;71&gt;</strong>, con Certificado de Análisis (CoA), ensayo de potencia, esterilidad y endotoxinas por lote. Los <strong>kits de inserción quirúrgica (trócares estériles de un solo uso)</strong> cuentan con <strong>Marcado CE</strong> como producto sanitario.
              </>
            ) : (
              <>
                <strong>Quality &amp; Regulatory Status:</strong> Bioidentical hormone pellets are sterile patient-specific compounded implants prepared under <strong>EU GMP / USP &lt;797&gt; &amp; &lt;71&gt;</strong> sterile compounding standards, backed by batch-level Certificate of Analysis (CoA), potency, sterility, and endotoxin testing. Single-use sterile <strong>trocar insertion kits carry CE Marking</strong> as Class IIa sterile medical devices.
              </>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {[
              {
                pmid: '35893288',
                year: '2022',
                journal: 'Journal of Personalized Medicine',
                authors: 'Donovitz GS',
                title: 'A Personal Prospective on Testosterone Therapy in Women — What We Know in 2022',
                summaryEs: 'Revisión clínica de implantes subcutáneos de testosterona en mujeres: eficacia sintomática, perfil de seguridad y reducción de incidencia de cáncer de mama frente a cohortes históricas.',
                summaryEn: 'Clinical outcomes of subcutaneous testosterone pellet therapy in women, demonstrating symptom relief, metabolic benefits, and long-term safety follow-up.'
              },
              {
                pmid: '23265303',
                year: '2013',
                journal: 'Maturitas',
                authors: 'Glaser R, Kalantaridou S, Dimitrakakis C',
                title: 'Testosterone implants in women: pharmacological dosing for a physiologic effect',
                summaryEs: 'Estudio farmacocinético en mujeres que demuestra liberación fisiológica estable sin picos suprafisiológicos ni metabolismo hepático de primer paso.',
                summaryEn: 'Pharmacokinetic study confirming steady physiologic serum levels with subcutaneous testosterone implants and avoidance of first-pass hepatic metabolism.'
              },
              {
                pmid: '11528362',
                year: '2001',
                journal: 'Menopause',
                authors: 'del Carmen Cravioto M, Larrea F et al.',
                title: 'Pharmacokinetics and pharmacodynamics of 25-mg estradiol implants in postmenopausal women',
                summaryEs: 'Evaluación farmacocinética de pellets de estradiol de 25 mg en mujeres posmenopáusicas con alivio sostenido de síntomas vasomotores.',
                summaryEn: 'Pharmacokinetic & pharmacodynamic evaluation of 25 mg estradiol subcutaneous pellets showing sustained relief of vasomotor menopausal symptoms.'
              },
              {
                pmid: '23859250',
                year: '2013',
                journal: 'Journal of Sexual Medicine',
                authors: 'Smith RP, Khanna A et al.',
                title: 'Factors influencing patient decisions to initiate and discontinue subcutaneous testosterone pellets',
                summaryEs: 'Estudio clínico en varones con hipogonadismo que muestra alta adherencia y satisfacción frente a inyecciones frecuentes o geles diarios.',
                summaryEn: 'Clinical adherence study in hypogonadal men showing high patient satisfaction and continuation rates compared with daily gels or frequent injections.'
              },
              {
                pmid: '36912031',
                year: '2023',
                journal: 'The Aging Male',
                authors: 'Dorr B, Abdelaziz A',
                title: 'Subcutaneous testosterone pellet therapy for reversal of male osteoporosis',
                summaryEs: 'Revisión clínica del impacto positivo de los pellets subcutáneos de testosterona sobre la densidad mineral ósea en varones.',
                summaryEn: 'Clinical review documenting bone mineral density improvements and osteoprotective outcomes with subcutaneous testosterone pellet therapy.'
              }
            ].map((study) => (
              <a
                key={study.pmid}
                href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #dadce0',
                  borderRadius: '10px',
                  padding: '14px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase' }}>
                    {study.journal} · {study.year}
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>
                    PMID {study.pmid}
                  </span>
                </div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
                  {study.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                  {study.authors}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.45 }}>
                  {isEs ? study.summaryEs : study.summaryEn}
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.73rem', color: '#1a73e8', fontWeight: 700, marginTop: 'auto', paddingTop: '4px' }}>
                  <span>{isEs ? 'Ver estudio en PubMed' : 'Read Study on PubMed'}</span>
                  <ArrowRight size={12} />
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>

      {/* ── SHARE DRAWER ── */}
      <UniversalShareDrawer
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        docType="protocol"
        shareUrl={shareUrl}
        title={isEs ? 'Compartir Guía Quirúrgica de Pellets' : 'Share Pellet Implantation Guide'}
        subtitle={isEs ? 'Protocolo clínico 2025/26 con abanico radial y anestesia pH 7.2' : '2025/26 clinical trocar guide with radial fanning & buffered anesthesia'}
        itemName={isEs ? 'Guía Quirúrgica Pellets Hormonales' : 'Trocar Pellet Implantation Guide'}
      />

      {/* ── SINGLE UNIFIED ATLAS PUBLIC FOOTER ── */}
      <PublicUnifiedFooter />
    </div>
  );
}
