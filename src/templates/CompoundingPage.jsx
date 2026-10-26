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
import { resolvePhysicalCapsuleSize, CAPSULE_BOTTLE_SIZES, calculatePharmapolisCost } from '../services/pharmapolisCostEngine';
import { triggerHaptic } from '../utils/haptics';
import {
  FlaskConical, ShieldCheck, Award, Zap, Search, X, Plus, Minus, Download, Sparkles,
  Trash2, Pill, Brain, Moon, Leaf, HeartPulse, AlertTriangle, CheckCircle2, Send, Link2, RotateCcw, Dna,
  Sun, Layers, TrendingUp, Sliders
} from '@/lib/icons';
import '../styles/compoundingPage.css';

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

const THERAPEUTIC_RANGES = {
  'resveratrol': { min: 50, standard: 250, max: 500, step: 25 },
  'coenzyme q10 (ubiquinol)': { min: 30, standard: 100, max: 300, step: 10 },
  'alpha-lipoic acid': { min: 100, standard: 300, max: 600, step: 25 },
  'piperine': { min: 2.5, standard: 5, max: 10, step: 0.5 },
  'ginkgo biloba': { min: 40, standard: 120, max: 240, step: 20 },
  'panax ginseng extract': { min: 50, standard: 200, max: 400, step: 25 },
  'vitamin b complex methylated': { min: 25, standard: 50, max: 100, step: 5 },
  'bitter melon extract': { min: 100, standard: 250, max: 500, step: 25 },
  'green tea extract (egcg)': { min: 50, standard: 200, max: 400, step: 25 },
  'magnesium (glycinate)': { min: 100, standard: 300, max: 600, step: 50 },
  'valerian root extract': { min: 50, standard: 200, max: 400, step: 25 },
  'melatonin': { min: 0.5, standard: 1, max: 5, step: 0.5 },
  'vitamin c (ascorbic acid)': { min: 100, standard: 250, max: 1000, step: 50 },
  'n-acetylcysteine (nac)': { min: 100, standard: 300, max: 600, step: 50 },
  'zinc (gluconate)': { min: 10, standard: 30, max: 50, step: 5 }
};

function getTherapeuticRange(name) {
  const norm = String(name || '').toLowerCase();
  for (const [key, val] of Object.entries(THERAPEUTIC_RANGES)) {
    if (norm.includes(key)) return val;
  }
  return { min: 25, standard: 100, max: 500, step: 25 };
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
    title: 'Custom Compounding Lab',
    subtitle: 'Design a personalized formula in acid-resistant vegan HPMC capsules. Pick a base, adjust the actives, and request your official batch quotation — in under 2 minutes.',
    kpis: [
      { label: 'EU GMP Certified', value: 'Pharma Grade', sub: 'No stearates, fillers or allergens' },
      { label: 'Active Library', value: '118 APIs', sub: 'Pharmacopeial & branded actives' },
      { label: 'Smart Galenics', value: 'Size 1 · 0 · 00', sub: 'Automatic capsule sizing' },
      { label: 'Batch Release', value: '48–72h', sub: 'Compounded on demand' }
    ],
    step1: 'Choose a base', step1Hint: 'Start from a clinical blueprint or a blank formula.',
    step2: 'Adjust your actives', step2Hint: 'Daily dose per active, in milligrams.',
    step3: 'Review & request', step3Hint: 'Galenic summary of your formula.',
    searchPh: 'Search 118 actives (e.g. CoQ10, Magnesium, NAC)…',
    noResults: 'No actives match your search.',
    emptyTitle: 'Your formula is empty',
    emptySub: 'Choose a blueprint above or search an active to add it.',
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
    disclaimer: 'Compounded formulations are prepared on request under pharmaceutical supervision. They are not intended to diagnose, treat, cure or prevent any disease. Consult your physician before use.',
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
    title: 'Laboratorio de Formulación Magistral',
    subtitle: 'Diseña una fórmula personalizada en cápsulas veganas HPMC gastrorresistentes. Elige una base, ajusta los activos y solicita tu cotización oficial de lote — en menos de 2 minutos.',
    kpis: [
      { label: 'Certificación EU GMP', value: 'Grado Farma', sub: 'Sin estearatos, rellenos ni alérgenos' },
      { label: 'Biblioteca de Activos', value: '118 APIs', sub: 'Activos farmacopeicos y de marca' },
      { label: 'Galénica Inteligente', value: 'Size 1 · 0 · 00', sub: 'Cálculo automático de cápsula' },
      { label: 'Liberación de Lote', value: '48–72h', sub: 'Elaborado bajo demanda' }
    ],
    step1: 'Elige una base', step1Hint: 'Parte de una fórmula clínica o de una fórmula en blanco.',
    step2: 'Ajusta tus activos', step2Hint: 'Dosis diaria de cada activo, en miligramos.',
    step3: 'Revisa y solicita', step3Hint: 'Resumen galénico de tu fórmula.',
    searchPh: 'Busca entre 118 activos (ej. CoQ10, Magnesio, NAC)…',
    noResults: 'Ningún activo coincide con tu búsqueda.',
    emptyTitle: 'Tu fórmula está vacía',
    emptySub: 'Elige una base arriba o busca un activo para añadirlo.',
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
    disclaimer: 'Las fórmulas magistrales se elaboran bajo pedido y supervisión farmacéutica. No están destinadas a diagnosticar, tratar, curar ni prevenir enfermedades. Consulta a tu médico antes de usarlas.',
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
export default function CompoundingPage() {
  const [lang, setLang] = useState('en');
  const t = T[lang] || T.en;

  const [catalog, setCatalog] = useState(ULTRAMAN_APIS_MASTER);
  const [activeBlueprint, setActiveBlueprint] = useState(null);
  const [items, setItems] = useState([]);
  const [capsPerBottle, setCapsPerBottle] = useState(60);
  const [formulaName, setFormulaName] = useState('');
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pricingChannel, setPricingChannel] = useState('b2b'); // 'b2b' | 'patient_rrp'
  const [isSplitProtocol, setIsSplitProtocol] = useState(false);
  const [activePhaseTab, setActivePhaseTab] = useState('all'); // 'all' | 'phase1' | 'phase2'
  const [blueprintViewMode, setBlueprintViewMode] = useState('chips'); // 'chips' | 'grid'
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
      toast.success(`${api.name} ${t.added}`, { id: `cmp-add-${api.id}` });
      return [...prev, { apiId: api.id, name: api.name, spec: api.spec, doseMg: 100 }];
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
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      doc.text('EU GMP · Acid-resistant vegan HPMC capsules', 14, 21);
      doc.text(new Date().toLocaleDateString(), 196, 21, { align: 'right' });

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
      doc.text(displayName, 14, 42);

      let y = 54;
      doc.setFontSize(10); doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 6, 182, 9, 'F');
      doc.text('#', 17, y); doc.text('Active ingredient', 26, y); doc.text('Specification', 110, y); doc.text('mg/day', 194, y, { align: 'right' });
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
      doc.text(doc.splitTextToSize(T.en.disclaimer, 182), 14, y);
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
    <div className="cmp-page">
      <PublicUnifiedHeader track="compounds" lang={lang} onLangChange={handleLangChange} copyUrl={shareUrl} />

      {/* ── Hero ── */}
      <header className="cmp-hero">
        <div className="cmp-container">
          <span className="cmp-badge"><FlaskConical size={13} /> {t.badge}</span>
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

      <main className="cmp-container cmp-main">
        {/* ── Step 1: Blueprints (High-Density Chips + Grid Toggle) ── */}
        <section className="cmp-card" aria-labelledby="cmp-step1">
          <div className="cmp-step-head">
            <span className="cmp-step-num">1</span>
            <div style={{ flex: 1 }}>
              <h2 id="cmp-step1">{t.step1}</h2>
              <p>{t.step1Hint}</p>
            </div>
            <button
              type="button"
              className="cmp-ghost-btn"
              onClick={() => {
                triggerHaptic('light');
                setBlueprintViewMode(prev => prev === 'chips' ? 'grid' : 'chips');
              }}
              style={{ fontSize: '0.72rem' }}
            >
              <Sliders size={12} />
              <span>{blueprintViewMode === 'chips' ? (lang === 'es' ? 'Ver Tarjetas' : 'View Grid') : (lang === 'es' ? 'Ver Chips' : 'View Chips')}</span>
            </button>
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
                              >
                                Min ({range.min}mg)
                              </button>
                              <button
                                type="button"
                                className={`cmp-dose-preset-btn ${Number(i.doseMg) === range.standard ? 'is-active' : ''}`}
                                onClick={() => updateDose(i.apiId, range.standard)}
                              >
                                Std ({range.standard}mg)
                              </button>
                              <button
                                type="button"
                                className={`cmp-dose-preset-btn ${Number(i.doseMg) === range.max ? 'is-active' : ''}`}
                                onClick={() => updateDose(i.apiId, range.max)}
                              >
                                Max ({range.max}mg)
                              </button>
                            </div>
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
              <button type="button" className="cmp-primary-btn" onClick={handleRequest} disabled={!items.length}>
                <Send size={15} /> {t.request}
              </button>
              <button type="button" className="cmp-secondary-btn" onClick={handleExportPdf} disabled={!items.length || isExporting}>
                <Download size={14} /> {isExporting ? (lang === 'es' ? 'Generando…' : 'Generating…') : t.pdf}
              </button>
              <button type="button" className="cmp-secondary-btn" onClick={handleCopyLink} disabled={!items.length}>
                <Link2 size={14} /> {t.copy}
              </button>
            </div>
            <p className="cmp-ai-hint"><Sparkles size={13} /> {t.ai} → <em>Atlas AI</em></p>
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

      <PublicUnifiedFooter lang={lang} />

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
    </div>
  );
}
