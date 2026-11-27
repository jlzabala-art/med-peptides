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
  RotateCcw,
  Calendar,
  Calculator,
  FlaskConical
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
    safetyEn: 'Intact Uterus Rule: Mandatory oral micronized progesterone (100–200 mg nightly) for endometrial protection. Hysterectomized patients may use estrogen-only pellets (or optional progesterone for sleep/neurosteroid support).',
    safetyEs: 'Regla de Útero Intacto: Progesterona micronizada oral obligatoria (100–200 mg/noche) para protección endometrial. En pacientes histerectomizadas puede emplearse solo estradiol (o progesterona opcional para sueño/neuroprotección).',
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
    safetyEn: 'Monitor for mild acne or hirsutism if Free T exceeds upper female physiologic range; consider Spironolactone 25–50 mg or Saw Palmetto if sensitive, and step down next cycle.',
    safetyEs: 'Vigilar acné leve o hirsutismo si la T Libre supera el rango fisiológico femenino; valorar Espironolactona 25–50 mg/día o Saw Palmetto si hay sensibilidad y ajustar dosis en el siguiente ciclo.',
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
  { id: 'anesthesia', group: 'tray', en: 'Buffered 9:1 Lidocaine 2% w/ Epi (1.8 mL) + 8.4% NaHCO₃ (0.2 mL) · Wait 3–5 min for full vasoconstriction', es: 'Lidocaína 2% con Epi amortiguada 9:1 (1.8 mL + 0.2 mL NaHCO₃ 8.4%) · Esperar 3–5 min para vasoconstricción completa' },
  { id: 'trocar', group: 'tray', en: 'Single-use sterile disposable trocar kit (3.2 mm or 4.5 mm), #11 scalpel (2–3 mm stab, 0° horizontal subcutaneous plane) & Adson forceps', es: 'Kit de trócar desechable estéril (3.2 mm o 4.5 mm), bisturí #11 (incisión 2–3 mm, plano subcutáneo horizontal a 0°) y pinzas Adson sin dientes' },
  { id: 'pellets', group: 'tray', en: 'EU GMP sterile pellet vials verified (lot #, BUD, strength & quantity)', es: 'Viales estériles de pellets EU GMP verificados (lote, caducidad, dosis y unidades)' },
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

const CONTRAINDICATIONS_DATA = [
  {
    level: 'red',
    badgeEn: 'Absolute Contraindication',
    badgeEs: 'Contraindicación Absoluta',
    itemsEn: [
      'Active or suspected hormone-sensitive malignancy (breast, endometrial, or prostate cancer)',
      'Pregnancy, breastfeeding, or active desire for near-term male spermatogenesis (without hCG co-therapy)',
      'Acute venous thromboembolism (DVT/PE) or untreated severe thrombophilia',
      'Baseline Hematocrit > 54% or uncontrolled severe polycythemia',
    ],
    itemsEs: [
      'Neoplasia hormono-dependiente activa o sospechada (mama, endometrio o próstata)',
      'Embarazo, lactancia o deseo activo de espermatogénesis a corto plazo (sin co-terapia hCG)',
      'Tromboembolismo venoso agudo (TVP/TEP) o trombofilia grave no tratada',
      'Hematocrito basal > 54% o policitemia severa no controlada',
    ],
  },
  {
    level: 'amber',
    badgeEn: 'Precaution · Evaluate First',
    badgeEs: 'Precaución · Evaluar Antes',
    itemsEn: [
      'Intact uterus without concurrent micronized progesterone protection (100–200 mg nightly)',
      'Untreated Obstructive Sleep Apnea (OSA) in men — screen before high-dose Testosterone',
      'PSA > 4.0 ng/mL or abnormal DRE — require urological clearance prior to TRT',
      'Active anticoagulants / antiplatelets — extend hemostasis wait & monitor hematoma',
    ],
    itemsEs: [
      'Útero intacto sin cobertura simultánea con progesterona micronizada (100–200 mg/noche)',
      'Apnea obstructiva del sueño (SAOS) no tratada en varones — cribar antes de TRT alta',
      'PSA > 4.0 ng/mL o tacto anómalo — requiere valoración urológica previa a TRT',
      'Anticoagulación o antiagregación activa — prolongar espera de hemostasia y vigilar hematoma',
    ],
  },
];

const FOLLOWUP_MATRIX = [
  {
    id: 'female_labs',
    titleEn: 'Female BHRT · Week 4–6 Peak Targets',
    titleEs: 'Mujer BHRT · Objetivos Analíticos Pico (Sem 4–6)',
    targetsEn: 'Estradiol (E2): 80–150 pg/mL · Total T: 120–200 ng/dL · Free T: upper-normal physiologic',
    targetsEs: 'Estradiol (E2): 80–150 pg/mL · T Total: 120–200 ng/dL · T Libre: tercio superior fisiológico',
    adjustEn: 'If vasomotor symptoms persist & E2 < 70 pg/mL → step up E2 by +6.25 to +12.5 mg next cycle. If mild acne/oily skin → reduce T by 25 mg or add Spironolactone/Saw Palmetto.',
    adjustEs: 'Si persisten sofocos y E2 < 70 pg/mL → subir E2 +6.25 a +12.5 mg en el siguiente ciclo. Si acné leve → reducir T 25 mg en próximo ciclo o valorar Espironolactona/Saw Palmetto.',
  },
  {
    id: 'male_labs',
    titleEn: 'Male TRT · Week 4–6 Peak Targets',
    titleEs: 'Hombre TRT · Objetivos Analíticos Pico (Sem 4–6)',
    targetsEn: 'Total T: 800–1,100 ng/dL · Free T: 20–30 pg/mL · Hematocrit < 52% · PSA stable',
    targetsEs: 'T Total: 800–1,100 ng/dL · T Libre: 20–30 pg/mL · Hematocrito < 52% · PSA estable',
    adjustEn: 'If Hct > 52–54% → order therapeutic phlebotomy & reduce next pellet load by 200 mg. Treat E2 only if symptomatic (mastodynia/edema) with DIM 200 mg before micro-dose AI.',
    adjustEs: 'Si Hto > 52–54% → indicar flebotomía/donación y reducir carga total 200 mg en próximo ciclo. Tratar E2 solo si hay clínica (mastodinia/edema) con DIM 200 mg antes que IA.',
  },
];

export default function PelletImplantationGuideClient({ initialLang = 'en' }) {
  const workspace = usePublicWorkspace();
  const [localLang, setLocalLang] = useState(initialLang === 'es' ? 'es' : 'en');
  const lang = workspace?.hydrated ? (workspace?.lang || localLang) : localLang;
  const isEs = lang === 'es';

  const handleLangChange = (nextLang) => {
    setLocalLang(nextLang);
    if (workspace?.setLang) workspace.setLang(nextLang);
  };

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('female_meno');
  const [selectedHabitusId, setSelectedHabitusId] = useState('normal');
  const [patientWeightKg, setPatientWeightKg] = useState(68);
  const [cycleStage, setCycleStage] = useState('initial'); // 'initial' | 'maintenance'
  const [implantDate, setImplantDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [copiedReminder, setCopiedReminder] = useState(false);
  const [opsTab, setOpsTab] = useState('checklist'); // 'checklist' | 'followup' | 'contraindications' | 'complications' | 'patient'
  const [checkedItems, setCheckedItems] = useState({});
  const [copiedPatientCare, setCopiedPatientCare] = useState(false);

  const shareUrl = isEs
    ? 'https://www.atlashealth-services.com/guides/hormone-pellets-implantation?lang=es'
    : 'https://www.atlashealth-services.com/guides/hormone-pellets-implantation';

  const activeProfile = useMemo(
    () => CLINICAL_PROFILES.find((p) => p.id === selectedProfileId) || CLINICAL_PROFILES[1],
    [selectedProfileId]
  );
  const activeHabitus = useMemo(
    () => BODY_HABITUS.find((h) => h.id === selectedHabitusId) || BODY_HABITUS[0],
    [selectedHabitusId]
  );

  const titrationSuggestion = useMemo(() => {
    const w = Math.max(40, Math.min(150, Number(patientWeightKg) || 68));
    const isMaint = cycleStage === 'maintenance';
    if (selectedProfileId === 'male_trt') {
      const baseMg = w < 75 ? 650 : w <= 95 ? 800 : 950;
      const targetMg = isMaint ? baseMg + 50 : baseMg - 50;
      const pellets200 = Math.max(3, Math.round(targetMg / 200));
      const totalRounded = pellets200 * 200;
      const tracks = pellets200 <= 4 ? 2 : 3;
      return {
        doseLabel: `${totalRounded} mg Testosterone`,
        comboEn: `${pellets200} × 200 mg pellets (or ${pellets200 * 2} × 100 mg) across ${tracks} radial fan tracks`,
        comboEs: `${pellets200} × pellets de 200 mg (o ${pellets200 * 2} × 100 mg) en ${tracks} túneles radiales`,
        kitEn: '4.5 mm CE Sterile Trocar Kit + 2 mL Buffered Lidocaine (9:1) + Steri-Strips & Tegaderm',
        kitEs: 'Kit Trócar Estéril CE 4.5 mm + 2 mL Lidocaína Amortiguada (9:1) + Steri-Strips & Tegaderm',
      };
    }
    if (selectedProfileId === 'female_androgen') {
      const tMg = w < 60 && !isMaint ? 50 : 75;
      return {
        doseLabel: `${tMg} mg Testosterone`,
        comboEn: tMg === 50 ? '1 × 50 mg T pellet (single 3.5 cm track)' : '1 × 50 mg + 1 × 25 mg T pellets (single 3.5 cm track)',
        comboEs: tMg === 50 ? '1 × pellet T 50 mg (1 túnel de 3.5 cm)' : '1 × 50 mg + 1 × 25 mg T (1 túnel de 3.5 cm)',
        kitEn: '3.2 mm CE Sterile Trocar Kit + 2 mL Buffered Lidocaine (9:1) + Steri-Strips & Tegaderm',
        kitEs: 'Kit Trócar Estéril CE 3.2 mm + 2 mL Lidocaína Amortiguada (9:1) + Steri-Strips & Tegaderm',
      };
    }
    const e2Mg = selectedProfileId === 'female_peri' ? 12.5 : 25;
    const tMg = w < 58 && !isMaint ? 37.5 : 50;
    return {
      doseLabel: `${e2Mg} mg E2 + ${tMg} mg T`,
      comboEn: `1 × ${e2Mg} mg Estradiol + ${tMg === 50 ? '1 × 50 mg' : '1 × 37.5 mg'} Testosterone (1 linear track)`,
      comboEs: `1 × ${e2Mg} mg Estradiol + ${tMg === 50 ? '1 × 50 mg' : '1 × 37.5 mg'} Testosterona (1 túnel lineal)`,
      kitEn: '3.2 mm CE Sterile Trocar Kit + Oral Micronized Progesterone (if intact uterus) + Tegaderm',
      kitEs: 'Kit Trócar Estéril CE 3.2 mm + Progesterona Micronizada Oral (si útero intacto) + Tegaderm',
    };
  }, [selectedProfileId, patientWeightKg, cycleStage]);

  const followUpSchedule = useMemo(() => {
    const base = implantDate ? new Date(`${implantDate}T12:00:00`) : new Date();
    const safeBase = Number.isNaN(base.getTime()) ? new Date() : base;
    const addDays = (d) => {
      const copy = new Date(safeBase);
      copy.setDate(copy.getDate() + d);
      return copy.toLocaleDateString(isEs ? 'es-ES' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };
    const isMale = selectedProfileId === 'male_trt';
    return {
      labStart: addDays(28),
      labEnd: addDays(42),
      reimplantStart: addDays(isMale ? 135 : 105),
      reimplantEnd: addDays(isMale ? 180 : 135),
    };
  }, [implantDate, selectedProfileId, isEs]);

  const handleCopyFollowUpReminder = async () => {
    const msg = isEs
      ? `📅 *Atlas Health Services — Calendario de Seguimiento de Pellets (BHRT)*\n• *Analítica de control en pico (Sem 4–6)*: entre el *${followUpSchedule.labStart}* y el *${followUpSchedule.labEnd}*.\n• *Ventana estimada de renovación de ciclo*: entre el *${followUpSchedule.reimplantStart}* y el *${followUpSchedule.reimplantEnd}*.`
      : `📅 *Atlas Health Services — Hormone Pellet Follow-Up Schedule (BHRT)*\n• *Peak Serum Lab Panel (Wk 4–6)*: between *${followUpSchedule.labStart}* and *${followUpSchedule.labEnd}*.\n• *Estimated Next Cycle Window*: between *${followUpSchedule.reimplantStart}* and *${followUpSchedule.reimplantEnd}*.`;
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedReminder(true);
      toast.success(isEs ? 'Recordatorio de seguimiento copiado ✓' : 'Follow-up schedule copied ✓');
      setTimeout(() => setCopiedReminder(false), 2500);
    } catch {
      toast.error(isEs ? 'No se pudo copiar al portapapeles' : 'Could not copy to clipboard');
    }
  };

  const completedChecklistCount = Object.values(checkedItems).filter(Boolean).length;

  const toggleCheck = (id) => {
    setCheckedItems((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id] && typeof document !== 'undefined') {
        const nextUnchecked = PREOP_CHECKLIST.find((item) => item.id !== id && !next[item.id]);
        setTimeout(() => {
          if (nextUnchecked) {
            document.getElementById(`preop-item-${nextUnchecked.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            toast.success(isEs ? 'Checklist Pre-Quirúrgico completo ✓' : 'Pre-Op Checklist complete ✓');
          }
        }, 120);
      }
      return next;
    });
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
          .pellet-guide-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        }
        @media (max-width: 768px) {
          .pellet-guide-kpi-grid { display: none !important; }
        }
        .pellet-guide-planner-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 860px) {
          .pellet-guide-planner-grid { grid-template-columns: 1fr; }
        }
        .pellet-guide-complications-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 720px) {
          .pellet-guide-complications-grid { grid-template-columns: 1fr; }
        }
        .pellet-guide-monographs-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .pellet-guide-monographs-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 540px) {
          .pellet-guide-monographs-grid { grid-template-columns: 1fr; }
        }
        .pellet-ops-tabs-scroll {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
        .pellet-ops-tabs-scroll::-webkit-scrollbar { display: none; }
        .pellet-ops-tab-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 12px 14px;
          min-height: 44px;
          background: transparent;
          border: none;
          border-bottom: 2.5px solid transparent;
          color: #5f6368;
          font-size: 0.80rem;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }
        .pellet-ops-tab-btn.active {
          border-bottom-color: #1a73e8;
          color: #1a73e8;
          font-weight: 700;
        }
        .pellet-planner-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pellet-planner-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #3c4043;
          min-width: 115px;
        }
        .pellet-guide-pill-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .pellet-guide-pill-btn:focus-visible,
        .pellet-guide-icon-btn:focus-visible {
          outline: 2px solid #1a73e8;
          outline-offset: 2px;
        }
        @media (max-width: 768px) {
          .pellet-guide-btn-label { display: none; }
          .pellet-guide-icon-btn {
            min-width: 44px;
            min-height: 44px;
            padding: 0 !important;
            justify-content: center;
          }
          .pellet-guide-primary-cta {
            min-height: 44px;
            flex: 1;
            justify-content: center;
          }
          .pellet-guide-toolbar { width: 100%; flex-wrap: nowrap !important; }
        }
        .pellet-planner-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pellet-guide-main {
          max-width: 1240px;
          margin: 0 auto;
          padding: 1.5rem 1.5rem 6.5rem;
          box-sizing: border-box;
        }
        .pellet-responsive-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        .pellet-pubmed-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(290px, 1fr));
          gap: 12px;
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
        @media (max-width: 768px) {
          .pellet-guide-main {
            padding: 0.9rem 0.85rem 6.5rem;
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }
          .pellet-responsive-grid,
          .pellet-pubmed-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 10px;
          }
          .pellet-planner-row {
            flex-direction: column;
            align-items: stretch;
            gap: 6px;
          }
          .pellet-planner-label {
            min-width: 0;
          }
          .pellet-planner-pills {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .pellet-planner-pills--3 > :last-child {
            grid-column: 1 / -1;
          }
          .pellet-guide-pill-btn {
            min-height: 44px;
            padding: 8px 10px;
            font-size: 0.75rem;
            text-align: center;
            line-height: 1.25;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .pellet-ops-tabs-scroll {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px;
            padding: 10px 0;
            width: 100%;
            overflow-x: visible;
          }
          .pellet-ops-tab-btn {
            border: 1px solid #dadce0;
            border-bottom: 1px solid #dadce0;
            border-radius: 8px;
            background: #ffffff;
            padding: 8px 10px;
            font-size: 0.73rem;
            white-space: normal;
            text-align: left;
            line-height: 1.25;
            justify-content: flex-start;
          }
          .pellet-ops-tab-btn.active {
            background: #e8f0fe;
            border-color: #1a73e8;
            border-bottom-color: #1a73e8;
            color: #1a73e8;
          }
          .pellet-ops-tabs-scroll > :last-child {
            grid-column: 1 / -1;
          }
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
        hideAiButton={false}
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
              <span>Atlas Health · EU GMP</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span>{isEs ? 'Protocolo Ambulatorio de 10 min' : '10-Min Outpatient Procedure'}</span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span>{isEs ? 'Abanico Radial & Desnudamiento Sin Fuerza' : 'Radial Fanning & Zero-Force Unsheathing'}</span>
            </div>
          </div>

          {/* Monochrome GCP Action Toolbar (Rule #40 & #57: 1 primary CTA + neutral secondary buttons) */}
          <div className="pellet-guide-no-print pellet-guide-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => typeof window !== 'undefined' && window.print()}
              className="gcp-btn-secondary pellet-guide-icon-btn"
              aria-label={isEs ? 'Imprimir / PDF' : 'Print / PDF'}
              title={isEs ? 'Imprimir / PDF' : 'Print / PDF'}
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={14} />
              <span className="pellet-guide-btn-label">{isEs ? 'Imprimir / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="gcp-btn-secondary pellet-guide-icon-btn"
              aria-label={isEs ? 'Compartir' : 'Share'}
              title={isEs ? 'Compartir' : 'Share'}
              style={{ padding: '7px 12px', fontSize: '0.76rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Share2 size={14} />
              <span className="pellet-guide-btn-label">{isEs ? 'Compartir' : 'Share'}</span>
            </button>

            <Link
              href="/pricing/pellets"
              className="gcp-btn-primary pellet-guide-primary-cta"
              style={{ padding: '7px 14px', fontSize: '0.76rem', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Package size={14} />
              <span>{isEs ? 'Tarifa Pellets (41 SKUs)' : 'Pellet Tariff (41 SKUs)'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY CLINICAL PROGRESS BAR ── */}
      <style>{`
        .pellet-mobile-progress-bar { display: none; }
        @media (max-width: 768px) {
          .pellet-mobile-progress-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            position: sticky;
            top: 0;
            z-index: 35;
            background: rgba(255, 255, 255, 0.96);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid #e2e8f0;
            padding: 8px 14px;
            font-size: 0.74rem;
          }
        }
      `}</style>
      <div className="pellet-mobile-progress-bar no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 700, color: '#003666', whiteSpace: 'nowrap' }}>
            {isEs ? 'Checklist pre-op' : 'Pre-op checklist'} {completedChecklistCount}/{PREOP_CHECKLIST.length}
          </span>
          <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.round((completedChecklistCount / PREOP_CHECKLIST.length) * 100)}%`, height: '100%', background: completedChecklistCount === PREOP_CHECKLIST.length ? '#16a34a' : '#0284c7', transition: 'width 0.2s ease' }} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpsTab('checklist');
            document.getElementById('clinical-ops')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          aria-label={isEs ? 'Abrir checklist pre-quirúrgico' : 'Open pre-op checklist'}
          style={{ padding: '4px 12px', minHeight: '36px', borderRadius: '6px', border: '1px solid #dadce0', background: '#ffffff', color: '#1a73e8', fontWeight: 700, fontSize: '0.72rem', whiteSpace: 'nowrap', cursor: 'pointer' }}
        >
          {isEs ? 'Abrir' : 'Open'}
        </button>
      </div>

      {/* ── MAIN CONTENT CONTAINER (Generous bottom padding so floating dock never overlaps) ── */}
      <div className="pellet-guide-main">

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
          <InteractiveTrocarPelletGuide
            lang={lang}
            showDosingMatrix={false}
            completeAction={{ href: '#dosing-planner', labelEn: 'Continue to planner', labelEs: 'Ir al planificador' }}
          />
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

          <div style={{ padding: '1.15rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Selectors Row (GCP Stacked Form Groups on Mobile) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="pellet-planner-row">
                <span className="pellet-planner-label" id="planner-profile-label">
                  {isEs ? '1. Perfil clínico' : '1. Clinical profile'}
                </span>
                <div className="pellet-planner-pills" role="radiogroup" aria-labelledby="planner-profile-label">
                  {CLINICAL_PROFILES.map((p) => {
                    const isSel = selectedProfileId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        role="radio"
                        aria-checked={isSel}
                        onClick={() => setSelectedProfileId(p.id)}
                        className={`pellet-guide-pill-btn ${isSel ? 'active' : ''}`}
                      >
                        {isSel && <Check size={13} style={{ flexShrink: 0 }} />}
                        <span>{isEs ? p.labelEs : p.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pellet-planner-row">
                <span className="pellet-planner-label" id="planner-habitus-label">
                  {isEs ? '2. Composición corporal' : '2. Body habitus'}
                </span>
                <div className="pellet-planner-pills pellet-planner-pills--3" role="radiogroup" aria-labelledby="planner-habitus-label">
                  {BODY_HABITUS.map((h) => {
                    const isSel = selectedHabitusId === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        role="radio"
                        aria-checked={isSel}
                        onClick={() => setSelectedHabitusId(h.id)}
                        className={`pellet-guide-pill-btn ${isSel ? 'active' : ''}`}
                      >
                        {isSel && <Check size={13} style={{ flexShrink: 0 }} />}
                        <span>{isEs ? h.labelEs : h.labelEn}</span>
                      </button>
                    );
                  })}
                </div>
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

            {/* Value-Add Physician Tools: Titration Load Estimator + Re-Implant Calendar */}
            <div className="pellet-guide-complications-grid" style={{ paddingTop: '4px' }}>
              {/* Tool A: Weight & Cycle Titration Estimator + Ready-for-Consult Kit */}
              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#003666', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Calculator size={15} color="#1a73e8" />
                    <span>{isEs ? 'Calculadora Orientativa de Carga & Kit de Consulta' : 'Pellet Load Estimator & Ready-to-Use Consult Kit'}</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                    <span>{isEs ? 'Peso (kg):' : 'Weight (kg):'}</span>
                    <input
                      type="number"
                      min={40}
                      max={150}
                      value={patientWeightKg}
                      onChange={(e) => setPatientWeightKg(e.target.value)}
                      style={{ width: '68px', minHeight: '36px', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.80rem', fontWeight: 700, color: '#0f172a' }}
                    />
                  </label>

                  <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '2px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    {[
                      { id: 'initial', en: '1st Implant (Conservative)', es: '1.º Implante (Conservador)' },
                      { id: 'maintenance', en: 'Re-Implant / Titrated', es: 'Re-implante / Ajuste' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setCycleStage(st.id)}
                        style={{
                          padding: '5px 9px',
                          minHeight: '32px',
                          borderRadius: '5px',
                          border: 'none',
                          fontSize: '0.72rem',
                          fontWeight: cycleStage === st.id ? 700 : 600,
                          background: cycleStage === st.id ? '#ffffff' : 'transparent',
                          color: cycleStage === st.id ? '#003666' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {isEs ? st.es : st.en}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', fontSize: '0.77rem', color: '#1e293b', lineHeight: 1.45 }}>
                  <div style={{ fontWeight: 800, color: '#1a73e8', marginBottom: '2px' }}>
                    {titrationSuggestion.doseLabel}
                  </div>
                  <div>{isEs ? titrationSuggestion.comboEs : titrationSuggestion.comboEn}</div>
                  <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed #cbd5e1', color: '#475569', fontSize: '0.74rem' }}>
                    <strong>{isEs ? 'Material necesario:' : 'Consult Tray:'}</strong> {isEs ? titrationSuggestion.kitEs : titrationSuggestion.kitEn}
                  </div>
                </div>
              </div>

              {/* Tool B: Peak Lab & Next Cycle Date Calculator + 1-Click WhatsApp */}
              <div style={{ background: '#ffffff', border: '1px solid #dadce0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.80rem', fontWeight: 800, color: '#003666', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={15} color="#16a34a" />
                    <span>{isEs ? 'Calendario de Analítica Pico & Re-implante' : 'Peak Bloodwork & Re-Implant Date Planner'}</span>
                  </span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.73rem', fontWeight: 700, color: '#475569' }}>
                    <span>{isEs ? 'Fecha implante:' : 'Implant date:'}</span>
                    <input
                      type="date"
                      value={implantDate}
                      onChange={(e) => setImplantDate(e.target.value)}
                      style={{ minHeight: '34px', padding: '3px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.76rem', color: '#0f172a' }}
                    />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '9px 10px' }}>
                    <div style={{ fontSize: '0.67rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase' }}>
                      {isEs ? 'Analítica Pico (Sem 4–6)' : 'Peak Labs (Wk 4–6)'}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {followUpSchedule.labStart} – {followUpSchedule.labEnd}
                    </div>
                  </div>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '9px 10px' }}>
                    <div style={{ fontSize: '0.67rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                      {isEs ? 'Próximo Re-implante' : 'Next Cycle Window'}
                    </div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      {followUpSchedule.reimplantStart} – {followUpSchedule.reimplantEnd}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: 'auto' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {isEs ? 'Fideliza al paciente agendando su control antes de salir.' : 'Boost clinic retention by scheduling follow-up at discharge.'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyFollowUpReminder}
                    className="gcp-btn-secondary"
                    style={{ padding: '6px 11px', minHeight: '36px', fontSize: '0.74rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                  >
                    {copiedReminder ? <Check size={13} /> : <Copy size={13} />}
                    <span>{copiedReminder ? (isEs ? 'Copiado ✓' : 'Copied ✓') : (isEs ? 'Copiar Fechas WhatsApp' : 'Copy WhatsApp Dates')}</span>
                  </button>
                </div>
              </div>
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

        {/* ── BLOCK 4B: PHYSICIAN PRE-IMPLANT SCREENING TRAFFIC LIGHT (GO / CAUTION / NO-GO) ── */}
        <section
          className="pellet-guide-section"
          style={{
            background: '#ffffff',
            border: '1px solid #dadce0',
            borderRadius: '12px',
            padding: '1.25rem 1.35rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 3px rgba(60, 64, 67, 0.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#003666' }}>
                {isEs ? 'Cribado Rápido Pre-Implante (Semáforo Clínico)' : 'Chair-Side Pre-Implant Screening (Go / Caution / No-Go)'}
              </h2>
              <p style={{ margin: '3px 0 0', fontSize: '0.78rem', color: '#475569' }}>
                {isEs
                  ? 'Resumen ejecutivo basado en guías Endocrine Society, TMS/NAMS, AUA e ISSWSH para verificación en 15 segundos antes de implantar.'
                  : '15-second chair-side decision matrix aligned with Endocrine Society, TMS/NAMS, AUA & ISSWSH clinical practice standards.'}
              </p>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                isEs
                  ? `Instrucciones Post-Implante de Pellets (${selectedProfileId === 'male_trt' ? 'Hombre 4.5 mm' : 'Mujer 3.2 mm'}):\n• Mantener apósito seco 48h.\n• Evitar sentadillas, ciclismo, piscina/sauna/inmersión durante ${selectedProfileId === 'male_trt' ? '5–7 días' : '3–5 días'}.\n• Retirar Steri-Strips a los 5–7 días si no se desprenden solos.\n• Analítica de control pico: semana 4–6 post-implante.\n• Ante enrojecimiento creciente, fiebre o secreción, contactar a la clínica.`
                  : `Post-Implant Hormone Pellet Care (${selectedProfileId === 'male_trt' ? 'Male 4.5 mm' : 'Female 3.2 mm'}):\n• Keep dressing dry for 48 hours.\n• Avoid squats, cycling, swimming, hot tubs/saunas for ${selectedProfileId === 'male_trt' ? '5–7 days' : '3–5 days'}.\n• Remove Steri-Strips after 5–7 days if still attached.\n• Peak follow-up serum labs: Week 4–6 post-implant.\n• Contact clinic for spreading redness, fever, or drainage.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="gcp-btn-secondary no-print"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.76rem', fontWeight: 700, textDecoration: 'none' }}
            >
              <Share2 size={13} />
              <span>{isEs ? 'Enviar Alta Post-Implante (WhatsApp)' : 'Send Post-Implant Care (WhatsApp)'}</span>
            </a>
          </div>

          <div className="pellet-pubmed-grid">
            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                🟢 {isEs ? 'GO · Analítica Basal Requerida' : 'GO · Required Baseline Workup'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.77rem', color: '#14532d', lineHeight: 1.5 }}>
                <li>{isEs ? 'E2, T Total/Libre, SHBG, FSH/LH y perfil tiroideo.' : 'E2, Total/Free T, SHBG, FSH/LH & thyroid panel.'}</li>
                <li>{isEs ? 'Hemograma completo (Hto < 49%) y perfil hepático/lipídico.' : 'CBC (Hct < 49%) & hepatic/lipid panel.'}</li>
                <li>{isEs ? 'PSA basal en varones >40 años; mamografía/citología vigente en mujeres.' : 'Baseline PSA in men >40y; up-to-date mammogram/Pap in women.'}</li>
                <li>{isEs ? 'Útero intacto: confirmar pauta de progesterona micronizada oral (100–200 mg/noche).' : 'Intact uterus: confirm oral micronized progesterone (100–200 mg nightly).'}</li>
              </ul>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                🟡 {isEs ? 'CAUTION · Valoración Individual' : 'CAUTION · Individualized Risk Review'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.77rem', color: '#78350f', lineHeight: 1.5 }}>
                <li>{isEs ? 'Hematocrito 49–52%: iniciar con carga conservadora y reevaluar en 6 sem.' : 'Hematocrit 49–52%: start conservatively and recheck at 6 wks.'}</li>
                <li>{isEs ? 'Anticoagulantes/antiagregantes: hemostasia firme 90s + compresión fría.' : 'Anticoagulants/antiplatelets: 90s firm hemostasis + cold compression.'}</li>
                <li>{isEs ? 'Apnea del sueño (SAOS) no tratada: estudiar/tratar antes de TRT.' : 'Untreated OSA: evaluate/treat prior to escalating TRT.'}</li>
                <li>{isEs ? 'Deseo gestacional en varón: advertir supresión de espermatogénesis.' : 'Male fertility plans: counsel on spermatogenesis suppression.'}</li>
              </ul>
            </div>

            <div style={{ padding: '12px 14px', borderRadius: '10px', background: '#fef2f2', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b91c1c', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                🔴 {isEs ? 'NO-GO · Contraindicación Absoluta' : 'NO-GO · Absolute Contraindications'}
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.77rem', color: '#7f1d1d', lineHeight: 1.5 }}>
                <li>{isEs ? 'Cáncer hormonodependiente activo (mama o próstata).' : 'Active hormone-sensitive malignancy (breast or prostate).'}</li>
                <li>{isEs ? 'Hematocrito > 54% o PSA elevado/nódulo prostático sin estudio.' : 'Hematocrit > 54% or unevaluated elevated PSA / prostate nodule.'}</li>
                <li>{isEs ? 'Sangrado uterino anormal no diagnosticado o embarazo.' : 'Undiagnosed abnormal uterine bleeding or pregnancy.'}</li>
                <li>{isEs ? 'Tromboembolismo venoso activo o insuficiencia cardíaca descompensada.' : 'Active VTE or uncontrolled/decompensated heart failure.'}</li>
              </ul>
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
            <div className="pellet-ops-tabs-scroll" role="tablist">
              {[
                { id: 'checklist', icon: ClipboardCheck, en: `Pre-Op Checklist (${completedChecklistCount}/${PREOP_CHECKLIST.length})`, es: `Checklist Pre-Op (${completedChecklistCount}/${PREOP_CHECKLIST.length})` },
                { id: 'followup', icon: FlaskConical, en: 'Wk 4–6 Labs & Titration', es: 'Analítica 4–6s & Ajuste' },
                { id: 'contraindications', icon: ShieldCheck, en: 'Contraindications Screening', es: 'Cribado Contraindicaciones' },
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
                    className={`pellet-ops-tab-btn ${active ? 'active' : ''}`}
                  >
                    <Icon size={15} style={{ flexShrink: 0 }} />
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

                <div className="pellet-responsive-grid" style={{ gap: '8px' }}>
                  {PREOP_CHECKLIST.map((item) => {
                    const checked = Boolean(checkedItems[item.id]);
                    return (
                      <label
                        key={item.id}
                        id={`preop-item-${item.id}`}
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

            {/* TAB: WEEK 4-6 LAB FOLLOW-UP & 2ND CYCLE TITRATION */}
            {opsTab === 'followup' && (
              <div className="pellet-guide-complications-grid">
                {FOLLOWUP_MATRIX.map((row) => (
                  <div
                    key={row.id}
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
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#003666' }}>
                      {isEs ? row.titleEs : row.titleEn}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#1d4ed8', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '7px 10px', borderRadius: '6px', fontWeight: 700 }}>
                      {isEs ? row.targetsEs : row.targetsEn}
                    </div>
                    <div style={{ fontSize: '0.77rem', color: '#1e293b', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', lineHeight: 1.45 }}>
                      <strong>{isEs ? 'Regla de titulación (2.º ciclo):' : '2nd-Cycle Titration Rule:'}</strong>{' '}
                      {isEs ? row.adjustEs : row.adjustEn}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: CONTRAINDICATIONS TRAFFIC LIGHT */}
            {opsTab === 'contraindications' && (
              <div className="pellet-guide-complications-grid">
                {CONTRAINDICATIONS_DATA.map((block) => {
                  const isRed = block.level === 'red';
                  return (
                    <div
                      key={block.level}
                      style={{
                        border: isRed ? '1px solid #fecaca' : '1px solid #fde68a',
                        borderRadius: '8px',
                        padding: '14px',
                        background: isRed ? '#fef2f2' : '#fffbeb',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isRed ? '#b91c1c' : '#92400e', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                        {isEs ? block.badgeEs : block.badgeEn}
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.77rem', color: '#1e293b', lineHeight: 1.45 }}>
                        {(isEs ? block.itemsEs : block.itemsEn).map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB: COMPLICATIONS & RED FLAGS (Symmetric 2x2 GCP Grid on Desktop) */}
            {opsTab === 'complications' && (
              <div className="pellet-guide-complications-grid">
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

        {/* ── BLOCK 6: EU GMP PELLETS CATALOG SHORTCUTS ── */}
        <section id="catalog-pellets" className="pellet-guide-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#003666', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#0284c7" />
              <span>{isEs ? 'Monografías Clínicas de Pellets & Kits Desechables' : 'Hormone Pellet Monographs & Trocar Kits'}</span>
            </h3>
            <Link
              href="/pricing/pellets"
              style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1a73e8', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{isEs ? 'Ver catálogo completo (41 SKUs)' : 'View full catalog (41 SKUs)'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="pellet-guide-monographs-grid">
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

          <div className="pellet-pubmed-grid">
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', minWidth: 0 }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#1a73e8', textTransform: 'uppercase', minWidth: 0 }}>
                    {study.journal} · {study.year}
                  </span>
                  <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '999px', whiteSpace: 'nowrap', flexShrink: 0 }}>
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
