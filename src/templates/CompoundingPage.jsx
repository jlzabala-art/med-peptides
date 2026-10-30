"use client";

/**
 * CompoundingPage — Public Custom Compounding Lab (/compounding)
 * ─────────────────────────────────────────────────────────────────────────────
 * 3-step builder: (1) pick a base blueprint → (2) adjust actives & bottle size
 * with live galenic capsule sizing → (3) validate with Atlas AI and request an
 * official batch quotation through the institutional inquiry drawer.
 *
 * Data: actives come from `ultramanApiRepository` (Firestore `ultraman_apis`
 * with RAM → localStorage → Firestore → static fallback layers, Rule #2).
 * Galenics: `resolvePhysicalCapsuleSize` + `CAPSULE_BOTTLE_SIZES` from the
 * Pharmapolis cost engine. No B2B manufacturing cost is exposed publicly;
 * pricing is delivered in the official quotation.
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import PublicUnifiedHeader from '../components/shared/PublicUnifiedHeader';
import PublicUnifiedFooter from '../components/shared/PublicUnifiedFooter';
import PublicStickyActionBar from '../components/shared/PublicStickyActionBar';
import PublicInstitutionalInquiryDrawer from '../components/shared/PublicInstitutionalInquiryDrawer';
import { getUltramanApis } from '../repositories/ultramanApiRepository';
import { ULTRAMAN_APIS_MASTER } from '../data/ultramanApisMaster';
import { getClinicalDosageProfile, getDoseAssessment } from '../data/clinicalDosageRegistry';
import { resolvePhysicalCapsuleSize, CAPSULE_BOTTLE_SIZES, calculatePharmapolisCost } from '../services/pharmapolisCostEngine';
import CompoundingGoalWizard from '../components/compounding/CompoundingGoalWizard';
import PageHeader from '@/components/ui/PageHeader';
import { triggerHaptic } from '../utils/haptics';
import {
  FlaskConical, ShieldCheck, Award, Zap, Search, X, Plus, Minus, Download, Sparkles,
  Trash2, Pill, Brain, Moon, Leaf, HeartPulse, AlertTriangle, CheckCircle2, Send, Link2, RotateCcw, Dna,
  Sun, Layers, TrendingUp, Sliders
} from '@/lib/icons';
import '../styles/compoundingPage.css';
import '@/styles/publicDesignSystem.css';

/* ─── Galenic constants ──────────────────────────────────────────────────── */
const MAX_FILL_MG = { 'Size 1': 350, 'Size 0': 550, 'Size 00': 750 };
const MAX_MG_PER_CAP = 750;      // practical Size 00 fill ceiling
const MAX_CAPS_PER_DAY = 4;      // above this the regimen is impractical
const MAX_ACTIVES = 8;
const MIN_DOSE = 0.1;
const MAX_DOSE = 2000;

/* ─── Clinical Synergy & Chronobiology Knowledge Base ─────────────────────── */
const CLINICAL_SYNERGIES = [
  {
    actives: ['Resveratrol', 'Coenzyme Q10 (Ubiquinol)'],
    title: 'Sirtuin & Mitochondrial Synergy',
    desc: 'CoQ10 boosts cellular electron transport chain while Resveratrol activates SIRT1 longevity deacetylases.',
    type: 'synergy'
  },
  {
    actives: ['Vitamin C (Ascorbic Acid)', 'N-Acetylcysteine (NAC)'],
    title: 'Intracellular Glutathione Synthesis',
    desc: 'NAC provides rate-limiting cysteine while Vitamin C recycles oxidized GSSG into active glutathione.',
    type: 'synergy'
  },
  {
    actives: ['Vitamin C (Ascorbic Acid)', 'Zinc (Gluconate)'],
    title: 'Epithelial Barrier & Immune Priming',
    desc: 'Synergistic enzymatic cofactors for neutrophil activation, mucosal repair and antioxidant protection.',
    type: 'synergy'
  },
  {
    actives: ['Ginkgo Biloba', 'Panax Ginseng Extract'],
    title: 'Cerebrovascular & Adaptogenic Synergy',
    desc: 'Improves cerebral microperfusion and neuronal oxygenation without cardiovascular tachycardia.',
    type: 'synergy'
  },
  {
    actives: ['Alpha-Lipoic Acid', 'Coenzyme Q10 (Ubiquinol)'],
    title: 'Universal Redox Cycling',
    desc: 'ALA regenerates lipophilic ubiquinol and hydrophilic ascorbic acid, preventing free radical cascades.',
    type: 'synergy'
  },
  {
    actives: ['Magnesium (Glycinate)', 'Melatonin'],
    title: 'Circadian GABAergic Sedation',
    desc: 'Magnesium modulates NMDA receptors to potentiate pineal melatonin sleep induction.',
    type: 'synergy'
  }
];

const CHRONO_OPPOSING = [
  {
    dayActives: ['Panax Ginseng Extract', 'Ginkgo Biloba', 'Coenzyme Q10 (Ubiquinol)', 'Green Tea Extract (EGCG)'],
    nightActives: ['Melatonin', 'Valerian Root Extract', 'Magnesium (Glycinate)'],
    warning: {
      en: 'Opposing chronobiological signals detected (stimulating morning actives paired with nocturnal relaxants). We recommend splitting into a Dual Day/Night Protocol.',
      es: 'Se detectaron señales cronobiológicas opuestas (activos estimulantes combinados con inductores de sueño). Recomendamos dividir la fórmula en Protocolo Día/Noche.'
    }
  }
];

function getTherapeuticRange(name) {
  return getClinicalDosageProfile(name);
}

/* ─── Base blueprints (resolved against the live API catalog by name) ─────── */
const BLUEPRINTS = [
  {
    id: 'longevity',
    icon: Dna,
    color: '#7c3aed',
    label: { en: 'Longevity & Mitochondria', es: 'Longevidad y Mitocondria' },
    desc: { en: 'Cellular energy, sirtuin & antioxidant support', es: 'Energía celular, sirtuinas y antioxidantes' },
    items: [['Resveratrol', 250], ['Coenzyme Q10 (Ubiquinol)', 100], ['Alpha-Lipoic Acid', 150], ['Piperine', 5]]
  },
  {
    id: 'cognitive',
    icon: Brain,
    color: '#0284c7',
    label: { en: 'Cognitive Focus', es: 'Foco Cognitivo' },
    desc: { en: 'Microcirculation, clarity & adaptogenic drive', es: 'Microcirculación, claridad y adaptógenos' },
    items: [['Ginkgo Biloba', 120], ['Panax Ginseng Extract', 200], ['Vitamin B Complex Methylated', 50]]
  },
  {
    id: 'metabolic',
    icon: HeartPulse,
    color: '#ea580c',
    label: { en: 'Metabolic Balance', es: 'Balance Metabólico' },
    desc: { en: 'Glycemic control & insulin sensitivity', es: 'Control glucémico y sensibilidad a la insulina' },
    items: [['Alpha-Lipoic Acid', 300], ['Bitter Melon Extract', 250], ['Green Tea Extract (EGCG)', 150]]
  },
  {
    id: 'sleep',
    icon: Moon,
    color: '#4f46e5',
    label: { en: 'Deep Sleep & Calm', es: 'Sueño Profundo y Calma' },
    desc: { en: 'Circadian reset & nervous system recovery', es: 'Reajuste circadiano y recuperación nerviosa' },
    items: [['Magnesium (Glycinate)', 300], ['Valerian Root Extract', 200], ['Melatonin', 1]]
  },
  {
    id: 'immune',
    icon: ShieldCheck,
    color: '#16a34a',
    label: { en: 'Immune Defense', es: 'Defensa Inmune' },
    desc: { en: 'Antioxidant & mucosal immunity co-factors', es: 'Cofactores antioxidantes e inmunidad mucosa' },
    items: [['Vitamin C (Ascorbic Acid)', 250], ['N-Acetylcysteine (NAC)', 300], ['Zinc (Gluconate)', 50]]
  },
  {
    id: 'blank',
    icon: Leaf,
    color: '#64748b',
    label: { en: 'Start from scratch', es: 'Empezar desde cero' },
    desc: { en: 'Build your own blend ingredient by ingredient', es: 'Crea tu mezcla activo por activo' },
    items: []
  }
];

/* ─── i18n ───────────────────────────────────────────────────────────────── */
const T = {
  en: {
    badge: 'Atlas Compounding Network · EU GMP',
    regulatoryBadge: '100% Authorized Food Supplements · EU Directive 2002/46/EC',
    goalsWizardBtn: '🎯 Personalize by Health Goals',
    goalsWizardSub: 'Take a 30s clinical questionnaire to receive 3 tailored formulas based on your goals',
    title: 'Custom Compounding Lab',
    subtitle: 'Design a personalized formula in acid-resistant vegan HPMC capsules. Pick a base, adjust the actives, and request your official batch quotation — in under 2 minutes.',
    kpis: [
      { label: 'EU GMP Certified', value: 'Pharma Grade', sub: 'No stearates, fillers or allergens' },
      { label: 'Nutraceutical Library', value: '118 Actives', sub: 'Food Supplements (EU 2002/46/EC)' },
      { label: 'Smart Galenics', value: 'Size 1 · 0 · 00', sub: 'Automatic capsule sizing' },
      { label: 'Batch Release', value: '48–72h', sub: 'Compounded on demand' }
    ],
    step1: 'Choose a base', step1Hint: 'Start from a clinical blueprint, health goals wizard, or blank formula.',
    step2: 'Adjust your actives', step2Hint: 'Daily dose per active, in milligrams.',
    step3: 'Review & request', step3Hint: 'Galenic summary of your formula.',
    searchPh: 'Search 118 food supplement actives (e.g. CoQ10, Magnesium, NAC)…',
    noResults: 'No actives match your search.',
    emptyTitle: 'Your formula is empty',
    emptySub: 'Choose a blueprint above, launch the Goals Wizard, or search an active to add it.',
    perDay: 'mg / day',
    bottle: 'Bottle size',
    capsule: 'Capsule',
    perCapsule: 'per capsule',
    dailyIntake: 'Daily intake',
    capsDay: 'caps/day',
    supply: 'Supply',
    days: 'days',
    totalDaily: 'Total active load',
    fill: 'Capsule fill',
    formulaName: 'Formula name',
    formulaNamePh: 'e.g. My Morning Longevity Stack',
    request: 'Request this batch',
    pdf: 'Download formula sheet (PDF)',
    copy: 'Copy shareable link',
    copied: 'Formula link copied ✓',
    ai: 'Check synergies with Atlas AI',
    priceNote: 'Pricing is provided in your official quotation, adjusted to the actives, quantities and channel (patient, clinic or wholesale).',
    warnTooMany: 'Your formula requires more than 4 capsules per day. Consider reducing doses or splitting it into two formulas.',
    warnMax: `Maximum ${MAX_ACTIVES} actives per formula.`,
    ok: 'Galenically viable formula',
    reset: 'Reset',
    added: 'added', removed: 'removed', already: 'is already in your formula',
    disclaimer: 'All active ingredients are authorized food supplements conforming to EU Directive 2002/46/EC and Regulation (EC) 1925/2006. Compounded formulations are prepared on request under pharmaceutical supervision. They are not intended to diagnose, treat, cure or prevent any disease. Consult your physician before use.',
    actives: 'actives',
    channelB2B: 'Clinic Wholesale (B2B)',
    channelRRP: 'Patient RRP',
    b2bDesc: 'EU GMP wholesale cost for dispensing practices',
    rrpDesc: 'Suggested patient retail with practice dispensing margin',
    marginLabel: 'Practice Gross Margin',
    splitProtocol: 'Split into Day/Night Protocol',
    splitProtocolDesc: 'Opposing chronobiology or high active load detected. Split into morning and evening phases.',
    recombineProtocol: 'Recombine into Single Formula',
    phase1Title: 'Phase 1: Morning Focus',
    phase2Title: 'Phase 2: Evening Repair',
    allPhases: 'All Actives',
    synergyDetected: 'Clinical Synergy Verified',
    addSynergyActive: 'Add complementary active'
  },
  es: {
    badge: 'Atlas Compounding Network · EU GMP',
    regulatoryBadge: '100% Complementos Alimenticios Autorizados · Directiva UE 2002/46/CE',
    goalsWizardBtn: '🎯 Diseñar según Objetivos de Salud',
    goalsWizardSub: 'Cuestionario clínico de 30s para generar 3 fórmulas personalizadas según tus objetivos',
    title: 'Laboratorio de Formulación Magistral',
    subtitle: 'Diseña una fórmula personalizada en cápsulas veganas HPMC gastrorresistentes. Elige una base, ajusta los activos y solicita tu cotización oficial de lote — en menos de 2 minutos.',
    kpis: [
      { label: 'Certificación EU GMP', value: 'Grado Farma', sub: 'Sin estearatos, rellenos ni alérgenos' },
      { label: 'Catálogo Nutracéutico', value: '118 Activos', sub: 'Complementos Alimenticios (UE 2002/46/CE)' },
      { label: 'Galénica Inteligente', value: 'Size 1 · 0 · 00', sub: 'Cálculo automático de cápsula' },
      { label: 'Liberación de Lote', value: '48–72h', sub: 'Elaborado bajo demanda' }
    ],
    step1: 'Elige una base', step1Hint: 'Parte de una fórmula clínica, el asistente de objetivos o una fórmula en blanco.',
    step2: 'Ajusta tus activos', step2Hint: 'Dosis diaria de cada activo, en miligramos.',
    step3: 'Revisa y solicita', step3Hint: 'Resumen galénico de tu fórmula.',
    searchPh: 'Busca entre 118 activos nutracéuticos (ej. CoQ10, Magnesio, NAC)…',
    noResults: 'Ningún activo coincide con tu búsqueda.',
    emptyTitle: 'Tu fórmula está vacía',
    emptySub: 'Elige una base arriba, inicia el Asistente por Objetivos o busca un activo para añadirlo.',
    perDay: 'mg / día',
    bottle: 'Tamaño del frasco',
    capsule: 'Cápsula',
    perCapsule: 'por cápsula',
    dailyIntake: 'Toma diaria',
    capsDay: 'caps/día',
    supply: 'Duración',
    days: 'días',
    totalDaily: 'Carga activa total',
    fill: 'Llenado de cápsula',
    formulaName: 'Nombre de la fórmula',
    formulaNamePh: 'ej. Mi Stack de Longevidad Matutino',
    request: 'Solicitar este lote',
    pdf: 'Descargar ficha de fórmula (PDF)',
    copy: 'Copiar enlace para compartir',
    copied: 'Enlace de la fórmula copiado ✓',
    ai: 'Analizar sinergias con Atlas AI',
    priceNote: 'El precio se indica en tu cotización oficial, ajustado a los activos, cantidades y canal (paciente, clínica o mayorista).',
    warnTooMany: 'Tu fórmula requiere más de 4 cápsulas al día. Reduce dosis o divídela en dos fórmulas.',
    warnMax: `Máximo ${MAX_ACTIVES} activos por fórmula.`,
    ok: 'Fórmula galénicamente viable',
    reset: 'Reiniciar',
    added: 'añadido', removed: 'eliminado', already: 'ya está en tu fórmula',
    disclaimer: 'Todos los activos son complementos alimenticios autorizados bajo la Directiva UE 2002/46/CE y el Reglamento (CE) 1925/2006. Las fórmulas magistrales se elaboran bajo pedido y supervisión farmacéutica. No están destinadas a diagnosticar, tratar, curar ni prevenir enfermedades. Consulta a tu médico antes de usarlas.',
    actives: 'activos',
    channelB2B: 'Precio Mayorista Clínica (B2B)',
    channelRRP: 'PVP Paciente Sugerido',
    b2bDesc: 'Coste mayorista EU GMP para consultas médicas',
    rrpDesc: 'Precio de venta al paciente con margen de dispensación',
    marginLabel: 'Margen Bruto de la Consulta',
    splitProtocol: 'Dividir en Protocolo Día/Noche',
    splitProtocolDesc: 'Cronobiología opuesta o alta carga activa detectada. Divide en fase matutina y nocturna.',
    recombineProtocol: 'Recombinar en Fórmula Única',
    phase1Title: 'Fase 1: Enfoque Matutino',
    phase2Title: 'Fase 2: Reparación Nocturna',
    allPhases: 'Todos los Activos',
    synergyDetected: 'Sinergia Clínica Verificada',
    addSynergyActive: 'Añadir activo complementario'
  }
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const normalize = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

function findApiByName(catalog, name) {
  const n = normalize(name);
  return catalog.find(a => normalize(a.name) === n)
    || catalog.find(a => normalize(a.name).startsWith(n))
    || catalog.find(a => normalize(a.name).includes(n))
    || null;
}

function clampDose(v) {
  const num = Number(v);
  if (!Number.isFinite(num)) return MIN_DOSE;
  return Math.min(MAX_DOSE, Math.max(MIN_DOSE, Math.round(num * 10) / 10));
}

function parseFormulaFromUrl(catalog) {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const f = params.get('f');
  if (!f) return null;
  const items = f.split(',').map(chunk => {
    const [id, mg] = chunk.split(':');
    const api = catalog.find(a => a.id === id || a.id === `pharmapolis-${id}`);
    return api ? { apiId: api.id, name: api.name, spec: api.spec, doseMg: clampDose(mg) } : null;
  }).filter(Boolean).slice(0, MAX_ACTIVES);
  const caps = Number(params.get('caps'));
  return {
    items,
    caps: CAPSULE_BOTTLE_SIZES.some(b => b.count === caps) ? caps : null,
    name: params.get('name') || ''
  };
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function CompoundingPage({
  embedded = false,
  initialLang = null,
  doctorId = null,
  doctorMeta = null,
  patients = [],
  onPrescriptionIssued = null
}) {
  const [lang, setLang] = useState(initialLang || 'en');
  const t = T[lang] || T.en;

  const [catalog, setCatalog] = useState(ULTRAMAN_APIS_MASTER);
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [items, setItems] = useState([]);
  const [capsPerBottle, setCapsPerBottle] = useState(60);
  const [formulaName, setFormulaName] = useState('');
  const [activeGeneticProfile, setActiveGeneticProfile] = useState(null);
  const [activeFineTuningNotes, setActiveFineTuningNotes] = useState([]);
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pricingChannel, setPricingChannel] = useState('b2b'); // 'b2b' | 'patient_rrp'
  const [isSplitProtocol, setIsSplitProtocol] = useState(false);
  const [blueprintViewMode, setBlueprintViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('cmp_bp_view_mode');
        if (stored === 'chips' || stored === 'grid') return stored;
      } catch { /* ignore */ }
    }
    return 'grid'; // Default 'grid' per user preference
  });
  const [isGoalsWizardOpen, setIsGoalsWizardOpen] = useState(false);

  // Doctor Clinical Integration State
  const [selectedPatientId, setSelectedPatientId] = useState(() => patients?.[0]?.id || '');
  const [isNewPatientInline, setIsNewPatientInline] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('');
  const [newPatientGender, setNewPatientGender] = useState('Male');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [clinicalIndications, setClinicalIndications] = useState('');
  const [isIssuingPrescription, setIsIssuingPrescription] = useState(false);

  const hydratedRef = useRef(false);
  const searchWrapRef = useRef(null);

  const handleLangChange = useCallback((code) => {
    setLang(code);
    try { localStorage.setItem('atlas_public_lang', code); } catch { /* ignore */ }
  }, []);

  /* Load live catalog (4-layer cache) + hydrate from shareable URL */
  useEffect(() => {
    let cancelled = false;
    getUltramanApis()
      .then(list => {
        if (cancelled) return;
        const usable = Array.isArray(list) && list.length > 0 ? list : ULTRAMAN_APIS_MASTER;
        setCatalog(usable);
        if (!hydratedRef.current) {
          hydratedRef.current = true;
          try {
            const stored = localStorage.getItem('atlas_public_lang');
            if (stored === 'es' || stored === 'en') setLang(stored);
            else if (navigator.language?.toLowerCase().startsWith('es')) setLang('es');
          } catch { /* ignore */ }
          const fromUrl = parseFormulaFromUrl(usable);
          if (fromUrl && fromUrl.items.length > 0) {
            setItems(fromUrl.items);
            if (fromUrl.caps) setCapsPerBottle(fromUrl.caps);
            if (fromUrl.name) setFormulaName(fromUrl.name);
            setActiveBlueprint('blank');
          }
        }
      })
      .catch(() => { /* static fallback already in state */ });
    return () => { cancelled = true; };
  }, []);

  /* Sync formula to URL (shareable views, Rule #24) */
  useEffect(() => {
    if (!hydratedRef.current || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (items.length > 0) {
      params.set('f', items.map(i => `${i.apiId.replace(/^pharmapolis-/, '')}:${i.doseMg}`).join(','));
      params.set('caps', String(capsPerBottle));
      if (formulaName.trim()) params.set('name', formulaName.trim()); else params.delete('name');
    } else {
      params.delete('f'); params.delete('caps'); params.delete('name');
    }
    const qs = params.toString();
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`);
  }, [items, capsPerBottle, formulaName]);

  /* Close search dropdown on outside click */
  useEffect(() => {
    if (!isSearchOpen) return;
    const onDown = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [isSearchOpen]);

  /* ─── Actions ─────────────────────────────────────────────────────────── */
  const applyBlueprint = useCallback((bp) => {
    triggerHaptic('selection');
    setActiveBlueprint(bp.id);
    const resolved = bp.items.map(([name, mg]) => {
      const api = findApiByName(catalog, name);
      return api ? { apiId: api.id, name: api.name, spec: api.spec, doseMg: mg } : null;
    }).filter(Boolean);
    setItems(resolved);
    if (bp.id !== 'blank') setFormulaName(bp.label[lang] || bp.label.en);
    else setFormulaName('');
  }, [catalog, lang]);

  const handleApplyProposal = useCallback((proposal) => {
    if (!proposal || !proposal.items || !proposal.items.length) return;
    triggerHaptic('success');
    const resolved = proposal.items.map(propItem => {
      const api = catalog.find(a => a.id === propItem.apiId)
        || catalog.find(a => normalize(a.name) === normalize(propItem.apiId.replace(/^pharmapolis-/, '')))
        || findApiByName(catalog, propItem.apiId);
      return api ? {
        apiId: api.id,
        name: api.name,
        spec: api.spec,
        doseMg: clampDose(propItem.doseMg)
      } : null;
    }).filter(Boolean);

    if (resolved.length > 0) {
      setItems(resolved);
      setFormulaName(proposal.name || '');
      if (proposal.capsPerBottle) setCapsPerBottle(proposal.capsPerBottle);
      setIsSplitProtocol(Boolean(proposal.isSplit));
      setActiveBlueprint('blank');
      if (proposal.geneticProfile) {
        setActiveGeneticProfile(proposal.geneticProfile);
        setActiveFineTuningNotes(proposal.fineTuningNotes || []);
      } else {
        setActiveGeneticProfile(null);
        setActiveFineTuningNotes([]);
      }
      toast.success(
        lang === 'es'
          ? `Fórmula cargada con éxito: ${proposal.name} (${resolved.length} activos)`
          : `Formula loaded successfully: ${proposal.name} (${resolved.length} actives)`,
        { id: 'cmp-loaded-wizard' }
      );
    }
  }, [catalog, lang]);

  const addActive = useCallback((api) => {
    setItems(prev => {
      if (prev.some(i => i.apiId === api.id)) {
        toast(`${api.name} ${t.already}`, { id: 'cmp-dup' });
        return prev;
      }
      if (prev.length >= MAX_ACTIVES) {
        toast.error(t.warnMax, { id: 'cmp-max' });
        return prev;
      }
      const dosageProfile = getClinicalDosageProfile(api.name);
      const defaultDose = dosageProfile.standard || 100;
      toast.success(`${api.name} ${t.added} (${defaultDose} mg)`, { id: `cmp-add-${api.id}` });
      return [...prev, { apiId: api.id, name: api.name, spec: api.spec, doseMg: defaultDose }];
    });
    if (!activeBlueprint) setActiveBlueprint('blank');
    setQuery('');
    setIsSearchOpen(false);
    triggerHaptic('light');
  }, [t, activeBlueprint]);

  const removeActive = useCallback((apiId) => {
    setItems(prev => {
      const target = prev.find(i => i.apiId === apiId);
      if (target) toast(`${target.name} ${t.removed}`, { id: `cmp-rm-${apiId}` });
      return prev.filter(i => i.apiId !== apiId);
    });
    triggerHaptic('light');
  }, [t]);

  const updateDose = useCallback((apiId, value) => {
    setItems(prev => prev.map(i => (i.apiId === apiId ? { ...i, doseMg: value === '' ? '' : value } : i)));
  }, []);

  const commitDose = useCallback((apiId) => {
    setItems(prev => prev.map(i => (i.apiId === apiId ? { ...i, doseMg: clampDose(i.doseMg) } : i)));
  }, []);

  const stepDose = useCallback((apiId, delta) => {
    setItems(prev => prev.map(i => {
      if (i.apiId !== apiId) return i;
      const cur = Number(i.doseMg) || 0;
      const step = cur < 10 ? 1 : cur < 100 ? 10 : 25;
      return { ...i, doseMg: clampDose(cur + delta * step) };
    }));
  }, []);

  const resetAll = useCallback(() => {
    setItems([]); setActiveBlueprint(null); setFormulaName(''); setCapsPerBottle(60);
  }, []);

  /* ─── Galenic computation ─────────────────────────────────────────────── */
  const galenics = useMemo(() => {
    const totalMg = items.reduce((s, i) => s + (Number(i.doseMg) || 0), 0);
    if (totalMg <= 0) return null;
    const capsPerDay = Math.max(1, Math.ceil(totalMg / MAX_MG_PER_CAP));
    const mgPerCap = totalMg / capsPerDay;
    const size = resolvePhysicalCapsuleSize([{ amount: mgPerCap }]);
    const maxFill = MAX_FILL_MG[size.size] || MAX_MG_PER_CAP;
    const fillPct = Math.min(100, Math.round((mgPerCap / maxFill) * 100));
    const supplyDays = Math.floor(capsPerBottle / capsPerDay);
    const tooMany = capsPerDay > MAX_CAPS_PER_DAY;
    return { totalMg: Math.round(totalMg * 10) / 10, capsPerDay, mgPerCap: Math.round(mgPerCap), size, fillPct, supplyDays, tooMany };
  }, [items, capsPerBottle]);

  const costEstimate = useMemo(() => {
    if (!items.length || !galenics) return null;
    try {
      const perCapIngredients = items.map(i => ({
        apiId: i.apiId,
        name: i.name,
        doseMg: (Number(i.doseMg) || 0) / galenics.capsPerDay
      }));
      return calculatePharmapolisCost({
        activeIngredients: perCapIngredients,
        capsPerBottle,
        apisCatalog: catalog
      });
    } catch {
      return null;
    }
  }, [items, galenics, capsPerBottle, catalog]);

  /* ─── Clinical Intelligence Recommender (Phase 2 & 5) ─────────────────── */
  const activeSynergies = useMemo(() => {
    if (items.length < 2) return [];
    const itemNamesNorm = items.map(i => normalize(i.name));
    return CLINICAL_SYNERGIES.filter(syn => {
      return syn.actives.every(act => itemNamesNorm.some(n => n.includes(normalize(act)) || normalize(act).includes(n)));
    });
  }, [items]);

  const chronoWarning = useMemo(() => {
    if (items.length < 2) return null;
    const itemNamesNorm = items.map(i => normalize(i.name));
    for (const rule of CHRONO_OPPOSING) {
      const hasDay = rule.dayActives.some(d => itemNamesNorm.some(n => n.includes(normalize(d))));
      const hasNight = rule.nightActives.some(n => itemNamesNorm.some(m => m.includes(normalize(n))));
      if (hasDay && hasNight) {
        return rule.warning[lang] || rule.warning.en;
      }
    }
    return null;
  }, [items, lang]);

  const synergySuggestions = useMemo(() => {
    if (items.length >= MAX_ACTIVES) return [];
    const itemNamesNorm = items.map(i => normalize(i.name));
    const suggestions = [];
    CLINICAL_SYNERGIES.forEach(syn => {
      const present = syn.actives.filter(act => itemNamesNorm.some(n => n.includes(normalize(act))));
      const missing = syn.actives.filter(act => !itemNamesNorm.some(n => n.includes(normalize(act))));
      if (present.length > 0 && missing.length > 0) {
        missing.forEach(missName => {
          const apiObj = findApiByName(catalog, missName);
          if (apiObj && !suggestions.some(s => s.api.id === apiObj.id)) {
            suggestions.push({
              api: apiObj,
              reason: syn.title,
              pairedWith: present.join(', ')
            });
          }
        });
      }
    });
    return suggestions.slice(0, 2);
  }, [items, catalog]);

  const splitData = useMemo(() => {
    if (!isSplitProtocol || !items.length) {
      return null;
    }
    const morningItems = [];
    const eveningItems = [];

    items.forEach(i => {
      const norm = normalize(i.name);
      const isEvening = norm.includes('melatonin') || norm.includes('valerian') || norm.includes('magnesium');
      if (isEvening) {
        eveningItems.push(i);
      } else {
        morningItems.push(i);
      }
    });

    if (morningItems.length === 0 || eveningItems.length === 0) {
      const half = Math.ceil(items.length / 2);
      return {
        phase1: items.slice(0, half),
        phase2: items.slice(half)
      };
    }

    return {
      phase1: morningItems,
      phase2: eveningItems
    };
  }, [isSplitProtocol, items]);

  const toggleSplitProtocol = useCallback(() => {
    triggerHaptic('medium');
    setIsSplitProtocol(prev => {
      const next = !prev;
      if (next) {
        toast.success(lang === 'es' ? 'Fórmula dividida en Protocolo Día/Noche ✓' : 'Split into Day/Night Protocol ✓');
      } else {
        toast(lang === 'es' ? 'Fórmula unificada en fase única' : 'Recombined into single formula');
      }
      return next;
    });
  }, [lang]);

  /* ─── Search ──────────────────────────────────────────────────────────── */
  const searchResults = useMemo(() => {
    const q = normalize(query.trim());
    const selected = new Set(items.map(i => i.apiId));
    const pool = catalog.filter(a => !selected.has(a.id));
    if (!q) {
      return pool.filter(a => a.priority === 'A').slice(0, 8);
    }
    return pool.filter(a => normalize(`${a.name} ${a.spec || ''}`).includes(q)).slice(0, 10);
  }, [query, catalog, items]);

  /* ─── Formula summary (used for inquiry, AI and PDF) ──────────────────── */
  const displayName = formulaName.trim() || (lang === 'es' ? 'Fórmula personalizada' : 'Custom formula');
  const formulaSummary = useMemo(() => {
    if (!items.length) return '';
    const lines = items.map(i => `${i.name} ${i.doseMg} mg`).join(' + ');
    const gal = galenics ? ` · ${galenics.size.size} HPMC · ${galenics.capsPerDay} ${t.capsDay} · ${capsPerBottle} caps` : '';
    return `${lines}${gal}`;
  }, [items, galenics, capsPerBottle, t]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://www.atlashealth-services.com/compounding';

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t.copied, { id: 'cmp-copy' });
      triggerHaptic('success');
    } catch {
      toast.error('Clipboard unavailable');
    }
  }, [t]);

  const handleRequest = useCallback(() => {
    if (!items.length) {
      toast.error(t.emptyTitle, { id: 'cmp-empty' });
      return;
    }
    triggerHaptic('medium');
    setIsInquiryOpen(true);
  }, [items.length, t]);

  const handleIssueDoctorPrescription = useCallback(async () => {
    if (!items.length) {
      toast.error(lang === 'es' ? 'Añade al menos un principio activo a la fórmula' : 'Add at least one active ingredient to the formula');
      return;
    }

    const chosenPatient = isNewPatientInline
      ? {
          name: newPatientName.trim(),
          dob: newPatientDob || '1985-06-15',
          gender: newPatientGender || 'Male',
          email: newPatientEmail || '',
          phone: newPatientPhone || ''
        }
      : (patients.find(p => String(p.id) === String(selectedPatientId)) || {
          id: selectedPatientId || 'pat-selected',
          name: patients.find(p => String(p.id) === String(selectedPatientId))?.name || 'Assigned Patient'
        });

    if (!chosenPatient?.name) {
      toast.error(lang === 'es' ? 'Selecciona o escribe el nombre del paciente asignado' : 'Select or enter the assigned patient name');
      return;
    }

    setIsIssuingPrescription(true);
    triggerHaptic('medium');
    try {
      const res = await fetch('/api/prescriptions/create-compounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: doctorId || doctorMeta?.id || 'dr-marina-cordeiro-fernandes',
          doctorMeta: {
            name: doctorMeta?.name || 'Dr. Marina Cordeiro Fernandes',
            license: doctorMeta?.license || doctorMeta?.licenseNumber || 'DHA-91105367',
            clinicName: doctorMeta?.clinicName || doctorMeta?.clinic || 'NOVA Aesthetics & Wellness',
            specialty: doctorMeta?.specialty || 'General Practitioner · Longevity & Aesthetic Medicine',
            email: doctorMeta?.email || 'dr.marina@novaclinic.ae',
            phone: doctorMeta?.phone || '+971 4 384 5678'
          },
          patient: chosenPatient,
          formulaName: formulaName || (activeBlueprint && activeBlueprint !== 'blank' ? activeBlueprint.title : 'Custom Compounded Formula'),
          items: items.map(it => ({
            name: it.name,
            doseMg: it.doseMg,
            unit: it.unit || 'mg',
            activeIngredient: it.activeIngredient || it.name,
            category: it.category || 'Compounded Active',
            role: it.role || ''
          })),
          capsuleDetails: {
            capsPerBottle,
            size: galenics?.size?.size || 'Size 0',
            totalMgPerCap: totalMg,
            capsPerDay: galenics?.capsPerDay || 2
          },
          nutrigenomics: activeGeneticProfile ? {
            source: activeGeneticProfile.source || '24Genetics Nutrition Report',
            sampleCode: activeGeneticProfile.sampleCode || '',
            fineTuningNotes: activeFineTuningNotes || []
          } : null,
          clinicalNotes: clinicalIndications || ''
        })
      });

      const data = await res.json();
      if (data.success && data.prescription) {
        toast.success(
          lang === 'es'
            ? `¡Prescripción #${data.prescription.prescriptionNumber || data.prescription.code} emitida y registrada con éxito!`
            : `Prescription #${data.prescription.prescriptionNumber || data.prescription.code} issued successfully!`,
          { duration: 5000, icon: '📜' }
        );
        onPrescriptionIssued?.(data.prescription);
      } else {
        throw new Error(data.error || 'Failed to issue prescription');
      }
    } catch (err) {
      toast.error(err.message || 'Error issuing compounded prescription');
    } finally {
      setIsIssuingPrescription(false);
    }
  }, [
    items,
    isNewPatientInline,
    newPatientName,
    newPatientDob,
    newPatientGender,
    newPatientEmail,
    newPatientPhone,
    patients,
    selectedPatientId,
    doctorId,
    doctorMeta,
    formulaName,
    activeBlueprint,
    capsPerBottle,
    galenics,
    totalMg,
    activeGeneticProfile,
    activeFineTuningNotes,
    clinicalIndications,
    lang,
    onPrescriptionIssued
  ]);

  const handleExportPdf = useCallback(async () => {
    if (!items.length || isExporting) return;
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      doc.setFillColor(0, 54, 102);
      doc.rect(0, 0, 210, 28, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(17);
      doc.text('Atlas Health · Custom Compounding', 14, 13);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.text(lang === 'es' ? 'Complementos Alimenticios · Directiva UE 2002/46/CE · Cápsulas veganas HPMC' : 'EU Directive 2002/46/EC Food Supplements · EU GMP · Vegan HPMC capsules', 14, 21);
      doc.text(new Date().toLocaleDateString(), 196, 21, { align: 'right' });

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
      doc.text(displayName, 14, 42);

      let y = 54;
      doc.setFontSize(10); doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 6, 182, 9, 'F');
      doc.text('#', 17, y);
      doc.text(lang === 'es' ? 'Activo Nutracéutico' : 'Nutraceutical Active', 26, y);
      doc.text(lang === 'es' ? 'Especificación' : 'Specification', 110, y);
      doc.text('mg/day', 194, y, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      items.forEach((i, idx) => {
        y += 9;
        doc.text(String(idx + 1), 17, y);
        doc.text(doc.splitTextToSize(i.name, 80)[0], 26, y);
        doc.text(doc.splitTextToSize(i.spec || '—', 72)[0], 110, y);
        doc.text(String(i.doseMg), 194, y, { align: 'right' });
      });

      if (galenics) {
        y += 16;
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.text('Galenic specification', 14, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        const rows = [
          ['Capsule', `${galenics.size.size} vegan HPMC (${galenics.size.volumeCapacityMl} mL)`],
          ['Total active load', `${galenics.totalMg} mg / day`],
          ['Daily intake', `${galenics.capsPerDay} capsule(s) · ${galenics.mgPerCap} mg per capsule`],
          ['Bottle', `${capsPerBottle} capsules · ${galenics.supplyDays} days supply`]
        ];
        rows.forEach(([k, v]) => { y += 7; doc.text(`${k}:`, 14, y); doc.text(v, 60, y); });
      }

      y += 14;
      doc.setFontSize(8.5); doc.setTextColor(100, 116, 139);
      doc.text(doc.splitTextToSize(lang === 'es' ? T.es.disclaimer : T.en.disclaimer, 182), 14, y);
      doc.text(doc.splitTextToSize(`Formula link: ${window.location.href}`, 182), 14, 285);

      doc.save(`atlas-formula-${Date.now()}.pdf`);
      toast.success(lang === 'es' ? `Ficha "${displayName}" descargada ✓` : `"${displayName}" sheet downloaded ✓`);
    } catch (err) {
      console.error('[CompoundingPage] PDF export failed', err);
      toast.error(lang === 'es' ? 'No se pudo generar el PDF' : 'Could not generate the PDF');
    } finally {
      setIsExporting(false);
    }
  }, [items, galenics, capsPerBottle, displayName, isExporting, lang]);

  const aiContextQuery = items.length
    ? (lang === 'es'
      ? `Analiza la sinergia, seguridad e interacciones de esta fórmula magistral en cápsulas: ${formulaSummary}. Sugiere optimizaciones de dosis y absorción.`
      : `Analyze synergy, safety and interactions of this compounded capsule formula: ${formulaSummary}. Suggest dose and absorption optimizations.`)
    : (lang === 'es' ? '¿Qué fórmula magistral en cápsulas me recomiendas para longevidad?' : 'Which compounded capsule formula would you recommend for longevity?');

  /* ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div className={`cmp-page ${embedded ? 'is-embedded' : ''}`}>
      {!embedded && (
        <PublicUnifiedHeader track="compounds" lang={lang} onLangChange={handleLangChange} copyUrl={shareUrl} />
      )}

      {/* ── Public Hero (Hidden when embedded in Doctor Portal) ── */}
      {!embedded && (
        <header className="cmp-hero">
          <div className="cmp-container">
            <div className="cmp-hero-badges">
              <span className="cmp-badge"><FlaskConical size={13} /> {t.badge}</span>
              <span className="cmp-badge is-regulatory"><ShieldCheck size={13} /> {t.regulatoryBadge}</span>
            </div>
            <h1 className="cmp-title">{t.title}</h1>
            <p className="cmp-subtitle">{t.subtitle}</p>

            <div className="cmp-kpis">
              {[ShieldCheck, Pill, FlaskConical, Zap].map((Icon, idx) => (
                <div key={idx} className="cmp-kpi">
                  <div className="cmp-kpi-head">
                    <span>{t.kpis[idx].label}</span>
                    <Icon size={15} />
                  </div>
                  <div className="cmp-kpi-value">{t.kpis[idx].value}</div>
                  <div className="cmp-kpi-sub">{t.kpis[idx].sub}</div>
                </div>
              ))}
            </div>
          </div>
        </header>
      )}

      {/* ── Embedded Doctor Portal Header & 4 GCP KPIs (Golden Rule #9, #22) ── */}
      {embedded && (
        <div className="cmp-container" style={{ paddingTop: '10px' }}>
          <PageHeader
            title={lang === 'es' ? 'Laboratorio de Fórmulas Magistrales' : 'Compounding Laboratory'}
            subtitle={lang === 'es'
              ? 'Formulación personalizada en cápsulas veganas HPMC (Ph. Eur.) certificadas con ajuste nutrigenómico'
              : 'Personalized vegan HPMC capsule compounding (Ph. Eur.) with optional 24Genetics DNA fine-tuning'}
            panel="doctor"
            breadcrumbs={[
              { label: 'Doctor', href: '/doctor' },
              { label: 'Clinical Tools', href: '/doctor/tools' },
              { label: 'Compounding Lab' }
            ]}
          />

          {/* 4 GCP KPIs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginTop: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                <span>{lang === 'es' ? 'Principios Activos' : 'Active Ingredients'}</span>
                <FlaskConical size={14} color="#0d9488" />
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {items.length} / {MAX_ACTIVES} {lang === 'es' ? 'Activos' : 'Actives'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                Ph. Eur. / USP Active Pool
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                <span>{lang === 'es' ? 'Cápsula Galénica' : 'Capsule Architecture'}</span>
                <Pill size={14} color="#1a73e8" />
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {galenics?.size?.size || 'Size 0'} · {totalMg} mg
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                {capsPerBottle} caps · Vegan HPMC
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                <span>{lang === 'es' ? 'Pauta y Posología' : 'Daily Regimen'}</span>
                <Sun size={14} color="#ea580c" />
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                {galenics?.capsPerDay || 2} {lang === 'es' ? 'cápsulas / día' : 'caps / day'}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                {isSplitProtocol ? (lang === 'es' ? 'Doble fase (Día/Noche)' : 'Dual Phase (Day/Night)') : (lang === 'es' ? 'Toma matutina' : 'Morning Intake')}
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                <span>{lang === 'es' ? 'Nutrigenómica' : 'Genomic Tuning'}</span>
                <Dna size={14} color="#7c3aed" />
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: activeGeneticProfile ? '#7c3aed' : '#0f172a', marginTop: '4px' }}>
                {activeGeneticProfile ? (lang === 'es' ? 'Calibrado 24Genetics ✓' : '24Genetics Tuned ✓') : (lang === 'es' ? 'Estándar Ph. Eur.' : 'Standard Baseline')}
              </div>
              <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '2px' }}>
                {activeGeneticProfile ? `${activeFineTuningNotes.length} ${lang === 'es' ? 'ajustes genéticos' : 'DNA biomarker rules'}` : (lang === 'es' ? 'Sin informe genético cargado' : 'No DNA report loaded')}
              </div>
            </div>
          </div>

          {/* Prescribing Doctor & Patient Assignment Bar */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.15rem' }}>👨‍⚕️</span>
                <div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 750, color: '#0f172a' }}>
                    {doctorMeta?.name || 'Dr. Marina Cordeiro Fernandes'}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', marginLeft: '6px' }}>
                    · Lic. {doctorMeta?.license || 'DHA-91105367'} · {doctorMeta?.clinicName || doctorMeta?.clinic || 'NOVA Aesthetics & Wellness'}
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: '0.70rem',
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
                padding: '3px 8px',
                borderRadius: '12px',
                fontWeight: 700
              }}>
                ✓ {lang === 'es' ? 'Prescriptor Acreditado' : 'Verified Prescriber'}
              </span>
            </div>

            {/* Patient Assignment Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {lang === 'es' ? 'Paciente Asignado' : 'Assigned Patient'}
                </label>
                {!isNewPatientInline ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      style={{
                        flex: 1,
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        fontSize: '0.85rem',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                    >
                      {patients && patients.length > 0 ? (
                        patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name || p.fullName} {p.dob ? `· DOB: ${p.dob}` : ''} {p.gender ? `(${p.gender})` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="pat-carlos-mendez">Carlos Méndez (DOB: 1980-04-12 · 46 yrs)</option>
                      )}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsNewPatientInline(true)}
                      style={{
                        padding: '0 12px',
                        height: '38px',
                        background: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.76rem',
                        fontWeight: 650,
                        color: '#334155',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      + {lang === 'es' ? 'Nuevo' : 'New'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      placeholder={lang === 'es' ? 'Nombre completo' : 'Full name'}
                      value={newPatientName}
                      onChange={(e) => setNewPatientName(e.target.value)}
                      style={{
                        flex: '2 1 140px',
                        height: '38px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.84rem'
                      }}
                    />
                    <input
                      type="date"
                      value={newPatientDob}
                      onChange={(e) => setNewPatientDob(e.target.value)}
                      style={{
                        flex: '1 1 110px',
                        height: '38px',
                        padding: '0 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.80rem'
                      }}
                    />
                    <select
                      value={newPatientGender}
                      onChange={(e) => setNewPatientGender(e.target.value)}
                      style={{
                        flex: '1 1 70px',
                        height: '38px',
                        padding: '0 6px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.80rem'
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsNewPatientInline(false)}
                      style={{
                        padding: '0 8px',
                        height: '38px',
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        color: '#64748b',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div style={{ flex: '1 1 260px' }}>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {lang === 'es' ? 'Indicación Clínica / Objetivos' : 'Clinical Indications / Target'}
                </label>
                <input
                  type="text"
                  placeholder={lang === 'es' ? 'Ej. Apoyo mitocondrial, longevidad y control metabólico' : 'E.g. Mitochondrial bioenergetics & metabolic regulation'}
                  value={clinicalIndications}
                  onChange={(e) => setClinicalIndications(e.target.value)}
                  style={{
                    width: '100%',
                    height: '38px',
                    boxSizing: 'border-box',
                    padding: '0 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="cmp-container cmp-main">
        {/* ── Step 1: Blueprints (High-Density Chips + Grid Toggle) ── */}
        <section className="cmp-card" aria-labelledby="cmp-step1">
          <div className="cmp-step-head">
            <span className="cmp-step-num">1</span>
            <div style={{ flex: 1 }}>
              <h2 id="cmp-step1">{t.step1}</h2>
              <p>{t.step1Hint}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="cmp-goals-wizard-btn"
                onClick={() => {
                  triggerHaptic('selection');
                  setIsGoalsWizardOpen(true);
                }}
              >
                <Sparkles size={14} />
                <span>{t.goalsWizardBtn}</span>
              </button>
              <button
                type="button"
                className="cmp-ghost-btn"
                onClick={() => {
                  triggerHaptic('light');
                  setBlueprintViewMode(prev => {
                    const next = prev === 'chips' ? 'grid' : 'chips';
                    try { localStorage.setItem('cmp_bp_view_mode', next); } catch { /* ignore */ }
                    return next;
                  });
                }}
                style={{ fontSize: '0.72rem' }}
              >
                <Sliders size={12} />
                <span>{blueprintViewMode === 'chips' ? (lang === 'es' ? 'Ver Tarjetas' : 'View Grid') : (lang === 'es' ? 'Ver Chips' : 'View Chips')}</span>
              </button>
            </div>
          </div>

          {blueprintViewMode === 'chips' ? (
            <div>
              <div className="cmp-bp-chips">
                {BLUEPRINTS.map(bp => {
                  const Icon = bp.icon;
                  const isActive = activeBlueprint === bp.id;
                  return (
                    <button
                      key={bp.id}
                      type="button"
                      className={`cmp-bp-chip ${isActive ? 'is-active' : ''}`}
                      style={{ '--bp-color': bp.color }}
                      onClick={() => applyBlueprint(bp)}
                      aria-pressed={isActive}
                    >
                      <span className="cmp-bp-chip-icon"><Icon size={14} /></span>
                      <span>{bp.label[lang] || bp.label.en}</span>
                      {isActive && <CheckCircle2 size={13} />}
                    </button>
                  );
                })}
              </div>
              {activeBlueprint && activeBlueprint !== 'blank' && (
                <div className="cmp-bp-active-callout">
                  <span>
                    <strong>{BLUEPRINTS.find(b => b.id === activeBlueprint)?.label[lang] || ''}:</strong>{' '}
                    {BLUEPRINTS.find(b => b.id === activeBlueprint)?.desc[lang] || ''}
                  </span>
                  <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                    {items.length} {t.actives}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="cmp-blueprints">
              {BLUEPRINTS.map(bp => {
                const Icon = bp.icon;
                const isActive = activeBlueprint === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    className={`cmp-bp ${isActive ? 'is-active' : ''}`}
                    style={{ '--bp-color': bp.color }}
                    onClick={() => applyBlueprint(bp)}
                    aria-pressed={isActive}
                  >
                    <span className="cmp-bp-icon"><Icon size={18} /></span>
                    <span className="cmp-bp-text">
                      <strong>{bp.label[lang] || bp.label.en}</strong>
                      <small>{bp.desc[lang] || bp.desc.en}</small>
                    </span>
                    {isActive && <CheckCircle2 size={16} className="cmp-bp-check" />}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <div className="cmp-grid">
          {/* ── Step 2: Actives with Live Clinical Recommender & Dosage Controls ── */}
          <section className="cmp-card" aria-labelledby="cmp-step2">
            <div className="cmp-step-head">
              <span className="cmp-step-num">2</span>
              <div style={{ flex: 1 }}>
                <h2 id="cmp-step2">{t.step2}</h2>
                <p>{t.step2Hint}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {items.length > 0 && (
                  <button
                    type="button"
                    className="cmp-ghost-btn"
                    onClick={toggleSplitProtocol}
                    style={{
                      background: isSplitProtocol ? '#eff6ff' : 'transparent',
                      color: isSplitProtocol ? '#1d4ed8' : '#475569',
                      borderColor: isSplitProtocol ? '#bfdbfe' : 'var(--cmp-border)'
                    }}
                    title={isSplitProtocol ? t.recombineProtocol : t.splitProtocol}
                  >
                    <Layers size={13} />
                    <span>{isSplitProtocol ? (lang === 'es' ? '1 Fase' : 'Single') : (lang === 'es' ? 'Día/Noche' : 'Day/Night')}</span>
                  </button>
                )}
                {items.length > 0 && (
                  <button type="button" className="cmp-ghost-btn" onClick={resetAll}>
                    <RotateCcw size={13} /> {t.reset}
                  </button>
                )}
              </div>
            </div>

            {/* Phase 5 Tab Selector if Split Protocol is active */}
            {isSplitProtocol && splitData && (
              <div className="cmp-phase-tabs">
                <button
                  type="button"
                  className={`cmp-phase-tab ${activePhaseTab === 'all' ? 'is-active' : ''}`}
                  onClick={() => setActivePhaseTab('all')}
                >
                  <Layers size={13} />
                  <span>{t.allPhases} ({items.length})</span>
                </button>
                <button
                  type="button"
                  className={`cmp-phase-tab ${activePhaseTab === 'phase1' ? 'is-active' : ''}`}
                  onClick={() => setActivePhaseTab('phase1')}
                >
                  <Sun size={13} style={{ color: '#ea580c' }} />
                  <span>{t.phase1Title} ({splitData.phase1.length})</span>
                </button>
                <button
                  type="button"
                  className={`cmp-phase-tab ${activePhaseTab === 'phase2' ? 'is-active' : ''}`}
                  onClick={() => setActivePhaseTab('phase2')}
                >
                  <Moon size={13} style={{ color: '#6366f1' }} />
                  <span>{t.phase2Title} ({splitData.phase2.length})</span>
                </button>
              </div>
            )}

            {/* Search */}
            <div className="cmp-search" ref={searchWrapRef}>
              <Search size={16} className="cmp-search-icon" />
              <input
                type="search"
                value={query}
                placeholder={t.searchPh}
                onChange={(e) => { setQuery(e.target.value); setIsSearchOpen(true); }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults[0]) { e.preventDefault(); addActive(searchResults[0]); }
                  if (e.key === 'Escape') setIsSearchOpen(false);
                }}
                aria-label={t.searchPh}
                disabled={items.length >= MAX_ACTIVES}
              />
              {query && (
                <button type="button" className="cmp-search-clear" onClick={() => setQuery('')} aria-label="Clear">
                  <X size={14} />
                </button>
              )}
              {isSearchOpen && (
                <div className="cmp-search-results" role="listbox">
                  {searchResults.length === 0 ? (
                    <div className="cmp-search-empty">{t.noResults}</div>
                  ) : searchResults.map(api => (
                    <button key={api.id} type="button" role="option" aria-selected="false" className="cmp-search-item" onClick={() => addActive(api)}>
                      <span>
                        <strong>{api.name}</strong>
                        <small>{api.spec}</small>
                      </span>
                      <Plus size={15} />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {items.length >= MAX_ACTIVES && <p className="cmp-hint-warn">{t.warnMax}</p>}

            {/* Selected actives */}
            {items.length === 0 ? (
              <div className="cmp-empty">
                <FlaskConical size={28} />
                <strong>{t.emptyTitle}</strong>
                <span>{t.emptySub}</span>
                <button
                  type="button"
                  className="cmp-goals-wizard-btn"
                  style={{ marginTop: '10px' }}
                  onClick={() => {
                    triggerHaptic('selection');
                    setIsGoalsWizardOpen(true);
                  }}
                >
                  <Sparkles size={14} />
                  <span>{t.goalsWizardBtn}</span>
                </button>
              </div>
            ) : (
              <ul className="cmp-items">
                {items
                  .filter(i => {
                    if (!isSplitProtocol || activePhaseTab === 'all' || !splitData) return true;
                    if (activePhaseTab === 'phase1') return splitData.phase1.some(p => p.apiId === i.apiId);
                    if (activePhaseTab === 'phase2') return splitData.phase2.some(p => p.apiId === i.apiId);
                    return true;
                  })
                  .map((i, idx) => {
                    const range = getTherapeuticRange(i.name);
                    const assessment = getDoseAssessment(i.name, i.doseMg, lang);
                    return (
                      <li key={i.apiId} className="cmp-item">
                        <span className="cmp-item-idx">{idx + 1}</span>
                        <div className="cmp-item-info">
                          <strong>{i.name}</strong>
                          <small>{i.spec}</small>
                        </div>
                        <div className="cmp-dose">
                          <button type="button" onClick={() => stepDose(i.apiId, -1)} aria-label="Decrease dose"><Minus size={14} /></button>
                          <input
                            type="number"
                            inputMode="decimal"
                            min={MIN_DOSE}
                            max={MAX_DOSE}
                            step="any"
                            value={i.doseMg}
                            onChange={(e) => updateDose(i.apiId, e.target.value)}
                            onBlur={() => commitDose(i.apiId)}
                            aria-label={`${i.name} ${t.perDay}`}
                          />
                          <button type="button" onClick={() => stepDose(i.apiId, 1)} aria-label="Increase dose"><Plus size={14} /></button>
                          <span className="cmp-dose-unit">{t.perDay}</span>
                        </div>
                        <button type="button" className="cmp-item-remove" onClick={() => removeActive(i.apiId)} aria-label={`Remove ${i.name}`}>
                          <Trash2 size={15} />
                        </button>

                        {/* Phase 3 Dosage Slider & Presets */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed #e2e8f0' }}>
                          <div className="cmp-dose-slider-row">
                            <input
                              type="range"
                              min={range.min}
                              max={range.max}
                              step={range.step}
                              value={Number(i.doseMg) || range.standard}
                              onChange={(e) => updateDose(i.apiId, Number(e.target.value))}
                              className="cmp-dose-slider"
                              aria-label={`${i.name} dosage range slider`}
                            />
                            <div className="cmp-dose-presets">
                              <button
                                type="button"
                                className={`cmp-dose-preset-btn ${Number(i.doseMg) === range.min ? 'is-active' : ''}`}
                                onClick={() => updateDose(i.apiId, range.min)}
                                title={lang === 'es' ? 'Dosis Mínima Eficaz' : 'Minimum Effective Dose'}
                              >
                                Min ({range.min}mg)
                              </button>
                              <button
                                type="button"
                                className={`cmp-dose-preset-btn cmp-dose-preset-std ${Number(i.doseMg) === range.standard ? 'is-active' : ''}`}
                                onClick={() => updateDose(i.apiId, range.standard)}
                                title={lang === 'es' ? 'Dosis Clínica Recomendada' : 'Standard Clinical Dose'}
                              >
                                ⭐ Std ({range.standard}mg)
                              </button>
                              <button
                                type="button"
                                className={`cmp-dose-preset-btn ${Number(i.doseMg) === range.max ? 'is-active' : ''}`}
                                onClick={() => updateDose(i.apiId, range.max)}
                                title={lang === 'es' ? 'Dosis Terapéutica Máxima' : 'Maximum Therapeutic Dose'}
                              >
                                Max ({range.max}mg)
                              </button>
                            </div>
                          </div>

                          {/* Clinical Smart Dose Advice Strip */}
                          <div className="cmp-dose-advice-row">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span
                                  className="cmp-dose-status-badge"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.62rem',
                                    fontWeight: 750,
                                    background: `${assessment.color}15`,
                                    color: assessment.color,
                                    border: `1px solid ${assessment.color}35`
                                  }}
                                >
                                  {assessment.status === 'optimal' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                  {assessment.badgeText}
                                </span>
                                {range.indication && (
                                  <span style={{ fontSize: '0.68rem', fontWeight: 650, color: '#334155' }}>
                                    • {range.indication[lang] || range.indication.es || range.indication.en}
                                  </span>
                                )}
                              </div>
                              {Number(i.doseMg) !== range.standard && (
                                <button
                                  type="button"
                                  onClick={() => updateDose(i.apiId, range.standard)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0d9488',
                                    fontSize: '0.64rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    padding: 0,
                                    textDecoration: 'underline'
                                  }}
                                >
                                  {lang === 'es' ? `Sugerir ${range.standard} mg` : `Apply ${range.standard} mg`}
                                </button>
                              )}
                            </div>

                            <p style={{ margin: '3px 0 0', fontSize: '0.69rem', color: '#64748b', lineHeight: 1.35 }}>
                              {range.clinicalRationale ? (range.clinicalRationale[lang] || range.clinicalRationale.es || range.clinicalRationale.en) : assessment.message}
                            </p>

                            {range.yieldNote && (
                              <div style={{ fontSize: '0.64rem', color: '#0369a1', fontWeight: 600, marginTop: '2px' }}>
                                💡 {range.yieldNote[lang] || range.yieldNote.es || range.yieldNote.en}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}

            {/* Phase 2: Live Clinical Intelligence Recommender Card */}
            {items.length > 0 && (activeSynergies.length > 0 || chronoWarning || synergySuggestions.length > 0) && (
              <div className="cmp-intel-card">
                <div className="cmp-intel-head">
                  <span className="cmp-intel-title">
                    <Sparkles size={14} />
                    <span>Atlas Clinical Intelligence</span>
                  </span>
                  {activeSynergies.length > 0 && (
                    <span className="cmp-intel-badge">
                      {activeSynergies.length} {lang === 'es' ? 'Sinergias' : 'Synergies'}
                    </span>
                  )}
                </div>

                {/* Synergies */}
                {activeSynergies.map((syn, sIdx) => (
                  <div key={sIdx} className="cmp-intel-desc">
                    <strong>⚡ {syn.title}:</strong> {syn.desc}
                  </div>
                ))}

                {/* Chrono Warning */}
                {chronoWarning && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px 10px', fontSize: '0.74rem', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <span>🌓 {chronoWarning}</span>
                    {!isSplitProtocol && (
                      <button
                        type="button"
                        onClick={toggleSplitProtocol}
                        className="cmp-split-btn"
                      >
                        <Layers size={12} />
                        <span>{t.splitProtocol}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Synergy Suggestions */}
                {synergySuggestions.map((sug, sgIdx) => (
                  <div key={sgIdx} className="cmp-intel-suggest">
                    <span>
                      <strong>+ Synergy Opportunity:</strong> Add {sug.api.name} to amplify {sug.pairedWith} ({sug.reason}).
                    </span>
                    <button
                      type="button"
                      className="cmp-intel-add-btn"
                      onClick={() => addActive(sug.api)}
                    >
                      <Plus size={11} />
                      <span>{lang === 'es' ? 'Añadir' : 'Add'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Bottle size */}
            <div className="cmp-bottle" style={{ marginTop: '16px' }}>
              <span className="cmp-label">{t.bottle}</span>
              <div className="cmp-bottle-options" role="radiogroup" aria-label={t.bottle}>
                {CAPSULE_BOTTLE_SIZES.map(b => (
                  <button
                    key={b.count}
                    type="button"
                    role="radio"
                    aria-checked={capsPerBottle === b.count}
                    className={`cmp-bottle-opt ${capsPerBottle === b.count ? 'is-active' : ''}`}
                    onClick={() => { setCapsPerBottle(b.count); triggerHaptic('selection'); }}
                  >
                    <strong>{b.count} caps</strong>
                    {b.savingsPercent ? <small className="cmp-save">-{b.savingsPercent}%</small> : <small>{b.badge.split(' / ')[0]}</small>}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── Step 3: Galenic summary & request ── */}
          <aside className="cmp-card cmp-summary" aria-labelledby="cmp-step3">
            <div className="cmp-step-head">
              <span className="cmp-step-num">3</span>
              <div>
                <h2 id="cmp-step3">{t.step3}</h2>
                <p>{t.step3Hint}</p>
              </div>
            </div>

            <label className="cmp-label" htmlFor="cmp-name">{t.formulaName}</label>
            <input
              id="cmp-name"
              className="cmp-name-input"
              value={formulaName}
              maxLength={80}
              placeholder={t.formulaNamePh}
              onChange={(e) => setFormulaName(e.target.value)}
            />

            {activeGeneticProfile && (
              <div style={{
                marginTop: '12px',
                marginBottom: '16px',
                padding: '12px 14px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Dna size={15} color="#16a34a" />
                    <strong style={{ fontSize: '0.78rem', color: '#166534' }}>
                      {lang === 'es' ? `Perfil 24Genetics: ${activeGeneticProfile.patientName} (${activeGeneticProfile.sampleCode})` : `24Genetics DNA Profile: ${activeGeneticProfile.patientName} (${activeGeneticProfile.sampleCode})`}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveGeneticProfile(null); setActiveFineTuningNotes([]); }}
                    style={{ border: 'none', background: 'transparent', color: '#64748b', fontSize: '0.70rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {lang === 'es' ? 'Quitar' : 'Remove'}
                  </button>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#166534', lineHeight: 1.4 }}>
                  {lang === 'es'
                    ? `Fórmula calibrada para dieta ${activeGeneticProfile.dietAndWeight?.effectiveDietType?.toUpperCase()}, sensibilidad a carbohidratos ${activeGeneticProfile.dietAndWeight?.carbSensitivity} y metabolismo de cafeína ${activeGeneticProfile.metabolism?.caffeineMetabolism}.`
                    : `Formula tuned for ${activeGeneticProfile.dietAndWeight?.effectiveDietType?.toUpperCase()} diet, ${activeGeneticProfile.dietAndWeight?.carbSensitivity} carb sensitivity and ${activeGeneticProfile.metabolism?.caffeineMetabolism} caffeine metabolism.`}
                </div>
              </div>
            )}

            {galenics ? (
              <>
                <div className="cmp-capsule" style={{ '--cap-color': galenics.size.badgeColor }}>
                  <div className="cmp-capsule-visual" aria-hidden="true">
                    <div className="cmp-capsule-shell">
                      <div className="cmp-capsule-fill" style={{ width: `${galenics.fillPct}%` }} />
                    </div>
                  </div>
                  <div className="cmp-capsule-meta">
                    <strong>{t.capsule} {galenics.size.size} · Vegan HPMC</strong>
                    <span>{galenics.mgPerCap} mg {t.perCapsule} · {t.fill} {galenics.fillPct}%</span>
                  </div>
                </div>

                <dl className="cmp-specs">
                  <div><dt>{t.totalDaily}</dt><dd>{galenics.totalMg} mg</dd></div>
                  <div><dt>{t.dailyIntake}</dt><dd>{galenics.capsPerDay} {t.capsDay}</dd></div>
                  <div><dt>{t.supply}</dt><dd>{galenics.supplyDays} {t.days}</dd></div>
                  <div><dt>{t.actives}</dt><dd>{items.length} / {MAX_ACTIVES}</dd></div>
                </dl>

                {isSplitProtocol && splitData && (
                  <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      Dual-Phase Chronobiological Schedule
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#4c1d95', lineHeight: 1.4 }}>
                      • <strong>Phase 1 (Morning):</strong> {splitData.phase1.map(i => i.name).join(', ') || 'None'}<br />
                      • <strong>Phase 2 (Evening):</strong> {splitData.phase2.map(i => i.name).join(', ') || 'None'}
                    </div>
                  </div>
                )}

                {galenics.tooMany ? (
                  <div className="cmp-alert is-warn"><AlertTriangle size={15} /> <span>{t.warnTooMany}</span></div>
                ) : (
                  <div className="cmp-alert is-ok"><CheckCircle2 size={15} /> <span>{t.ok}</span></div>
                )}

                {/* Phase 4: Live Channel Pricing Switcher */}
                {costEstimate && (
                  <div className="cmp-pricing-card">
                    <div className="cmp-channel-switch" role="tablist">
                      <button
                        type="button"
                        role="tab"
                        aria-selected={pricingChannel === 'b2b'}
                        className={`cmp-channel-btn ${pricingChannel === 'b2b' ? 'is-active' : ''}`}
                        onClick={() => { setPricingChannel('b2b'); triggerHaptic('selection'); }}
                      >
                        {t.channelB2B}
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={pricingChannel === 'patient_rrp'}
                        className={`cmp-channel-btn ${pricingChannel === 'patient_rrp' ? 'is-active' : ''}`}
                        onClick={() => { setPricingChannel('patient_rrp'); triggerHaptic('selection'); }}
                      >
                        {t.channelRRP}
                      </button>
                    </div>

                    <div className="cmp-pricing-row">
                      <div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          {pricingChannel === 'b2b' ? t.b2bDesc : t.rrpDesc}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>
                          {capsPerBottle} caps · ~€{((pricingChannel === 'b2b' ? costEstimate.finalPricing.netPerCapEur : costEstimate.finalPricing.netPerCapEur * 1.85) * galenics.capsPerDay).toFixed(2)}/{lang === 'es' ? 'día' : 'day'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.30rem', fontWeight: 800, color: '#0f172a' }}>
                          €{(pricingChannel === 'b2b' ? costEstimate.finalPricing.netSellingPriceEur : costEstimate.finalPricing.netSellingPriceEur * 1.85).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>
                          {lang === 'es' ? 'por frasco (sin IVA)' : 'per bottle (ex. VAT)'}
                        </div>
                      </div>
                    </div>

                    {pricingChannel === 'patient_rrp' && (
                      <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.70rem', color: '#16a34a', fontWeight: 650 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <TrendingUp size={12} />
                          {t.marginLabel}
                        </span>
                        <span>+€{(costEstimate.finalPricing.netSellingPriceEur * 0.85).toFixed(2)} (+46%)</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="cmp-empty is-compact">
                <Pill size={22} />
                <span>{t.emptySub}</span>
              </div>
            )}

            <p className="cmp-price-note"><Award size={13} /> {t.priceNote}</p>

            <div className="cmp-actions">
              {embedded ? (
                <button
                  type="button"
                  className="cmp-primary-btn"
                  onClick={handleIssueDoctorPrescription}
                  disabled={!items.length || isIssuingPrescription}
                  style={{
                    background: '#0d9488',
                    color: '#ffffff',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    fontWeight: 800,
                    fontSize: '0.86rem',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: items.length && !isIssuingPrescription ? 'pointer' : 'not-allowed',
                    boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)'
                  }}
                >
                  <ShieldCheck size={16} />
                  <span>
                    {isIssuingPrescription
                      ? (lang === 'es' ? 'Emitiendo prescripción…' : 'Issuing prescription…')
                      : (lang === 'es' ? 'Emitir Prescripción Oficial Certificada' : 'Issue Certified Official Prescription')}
                  </span>
                </button>
              ) : (
                <button type="button" className="cmp-primary-btn" onClick={handleRequest} disabled={!items.length}>
                  <Send size={15} /> {t.request}
                </button>
              )}
              <button type="button" className="cmp-secondary-btn" onClick={handleExportPdf} disabled={!items.length || isExporting}>
                <Download size={14} /> {isExporting ? (lang === 'es' ? 'Generando…' : 'Generating…') : t.pdf}
              </button>
              <button type="button" className="cmp-secondary-btn" onClick={handleCopyLink} disabled={!items.length}>
                <Link2 size={14} /> {t.copy}
              </button>
            </div>
            <p
              className="cmp-ai-hint"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                triggerHaptic('selection');
                window.dispatchEvent(new CustomEvent('open-public-atlas-ai', {
                  detail: {
                    productName: displayName,
                    category: 'compounding',
                    initialQuery: aiContextQuery
                  }
                }));
              }}
              title={lang === 'es' ? 'Abrir Atlas AI' : 'Open Atlas AI'}
            >
              <Sparkles size={13} /> {t.ai} → <em>Atlas AI</em>
            </p>
          </aside>
        </div>

        <p className="cmp-disclaimer">{t.disclaimer}</p>
      </main>

      <PublicInstitutionalInquiryDrawer
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        contextType="brand_collection"
        brandType="ultraperson"
        initialEntity={{
          name: displayName,
          code: 'CUSTOM-FORMULA',
          strength: formulaSummary,
          brandSlug: 'ultraperson',
          brandName: 'Atlas Custom Compounding',
          catalogCount: items.length
        }}
        lang={lang}
      />

      <CompoundingGoalWizard
        isOpen={isGoalsWizardOpen}
        onClose={() => setIsGoalsWizardOpen(false)}
        catalog={catalog}
        lang={lang}
        onApplyProposal={handleApplyProposal}
      />

      {!embedded && <PublicUnifiedFooter lang={lang} />}

      {!embedded && (
        <PublicStickyActionBar
          title={displayName}
          subtitle={items.length
            ? `${items.length} ${t.actives}${galenics ? ` · ${galenics.size.size} · ${galenics.capsPerDay} ${t.capsDay}` : ''}`
            : t.title}
          badge="Compounding"
          badgeType="protocol"
          inquireLabel={t.request}
          onInquire={handleRequest}
          showClinicalAI={true}
          aiContextQuery={aiContextQuery}
          aiCategory="compounding"
          lang={lang}
        />
      )}
    </div>
  );
}
