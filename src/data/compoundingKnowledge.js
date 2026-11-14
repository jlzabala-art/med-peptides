/**
 * Compounding Knowledge Base, Pure Galenic Helpers & i18n Dictionary
 * ─────────────────────────────────────────────────────────────────────────────
 * Extracted from CompoundingPage.jsx to keep UI components focused and allow
 * reuse across the public builder, Doctor Portal, and Goals Wizard.
 */

import {
  Dna, Brain, Moon, HeartPulse, ShieldCheck, Leaf
} from '@/lib/icons';
import { getClinicalDosageProfile } from './clinicalDosageRegistry';
import { resolvePhysicalCapsuleSize, CAPSULE_BOTTLE_SIZES, calculatePharmapolisCost } from '../services/pharmapolisCostEngine';

/* ─── Galenic constants ──────────────────────────────────────────────────── */
export const MAX_FILL_MG = { 'Size 1': 350, 'Size 0': 550, 'Size 00': 750 };
export const MAX_MG_PER_CAP = 750;      // practical Size 00 fill ceiling
export const MAX_CAPS_PER_DAY = 4;      // above this the regimen is impractical
export const MAX_ACTIVES = 8;
export const MIN_DOSE = 0.1;
export const MAX_DOSE = 2000;

/* ─── Helpers ────────────────────────────────────────────────────────────── */
export const normalize = (s) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function findApiByName(catalog, name) {
  const n = normalize(name);
  return catalog.find(a => normalize(a.name) === n)
    || catalog.find(a => normalize(a.name).startsWith(n))
    || catalog.find(a => normalize(a.name).includes(n))
    || null;
}

export function clampDose(v) {
  const num = Number(v);
  if (!Number.isFinite(num)) return MIN_DOSE;
  return Math.min(MAX_DOSE, Math.max(MIN_DOSE, Math.round(num * 10) / 10));
}

export function getTherapeuticRange(name) {
  return getClinicalDosageProfile(name);
}

/* ─── Search Categories (Quick Filters) ──────────────────────────────────── */
export const SEARCH_CATEGORIES = [
  { id: 'all', label: { en: 'All', es: 'Todos' }, keywords: [] },
  {
    id: 'mitochondria',
    label: { en: 'Longevity & Mito', es: 'Longevidad' },
    keywords: ['resveratrol', 'coenzyme', 'ubiquinol', 'lipoic', 'pqq', 'quercetin', 'nad', 'nr', 'nmn', 'glutathione', 'nac']
  },
  {
    id: 'cognitive',
    label: { en: 'Focus & Brain', es: 'Cognición' },
    keywords: ['ginkgo', 'ginseng', 'tyrosine', 'citicoline', 'theanine', 'rhodiola', 'bacopa', 'lion', 'phosphatidyl', 'b complex']
  },
  {
    id: 'sleep',
    label: { en: 'Sleep & Calm', es: 'Sueño y Calma' },
    keywords: ['magnesium', 'melatonin', 'valerian', 'ashwagandha', 'gaba', 'glycine', 'chamomile', 'passionflower', '5-htp', 'tryptophan']
  },
  {
    id: 'metabolic',
    label: { en: 'Metabolic', es: 'Metabólico' },
    keywords: ['berberine', 'chromium', 'cinnamon', 'bitter melon', 'green tea', 'egcg', 'carnitine', 'gymnema', 'ino', 'ala']
  },
  {
    id: 'immune',
    label: { en: 'Immune & Detox', es: 'Inmunidad' },
    keywords: ['vitamin c', 'zinc', 'vitamin d', 'elderberry', 'selenium', 'lactoferrin', 'milk thistle', 'silymarin', 'curcumin', 'turmeric']
  }
];

export function matchesSearchCategory(api, categoryId) {
  if (!categoryId || categoryId === 'all') return true;
  const cat = SEARCH_CATEGORIES.find(c => c.id === categoryId);
  if (!cat || !cat.keywords.length) return true;
  const haystack = normalize(`${api.name} ${api.spec || ''} ${api.category || ''}`);
  return cat.keywords.some(kw => haystack.includes(kw));
}

/* ─── Clinical Synergy & Chronobiology Knowledge Base ─────────────────────── */
export const CLINICAL_SYNERGIES = [
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
  },
  {
    actives: ['Resveratrol', 'Piperine'],
    title: 'Polyphenol Bioavailability Boost',
    desc: 'Piperine inhibits hepatic/intestinal glucuronidation, markedly increasing systemic resveratrol absorption.',
    type: 'synergy'
  },
  {
    actives: ['Curcumin', 'Piperine'],
    title: '20x Curcuminoid Absorption',
    desc: 'Piperine blocks UGT glucuronidation of curcuminoids, multiplying oral plasma bioavailability.',
    type: 'synergy'
  }
];

export const CHRONO_OPPOSING = [
  {
    dayActives: ['Panax Ginseng Extract', 'Ginkgo Biloba', 'Coenzyme Q10 (Ubiquinol)', 'Green Tea Extract (EGCG)', 'L-Tyrosine', 'Rhodiola Rosea'],
    nightActives: ['Melatonin', 'Valerian Root Extract', 'Magnesium (Glycinate)'],
    warning: {
      en: 'Opposing chronobiological signals detected (stimulating morning actives paired with nocturnal relaxants). We recommend splitting into a Dual Day/Night Protocol.',
      es: 'Se detectaron señales cronobiológicas opuestas (activos estimulantes combinados con inductores de sueño). Recomendamos dividir la fórmula en Protocolo Día/Noche.'
    }
  }
];

/* ─── Bioavailability & Overlap Rules ────────────────────────────────────── */
export const BIOAVAILABILITY_TRIGGERS = [
  {
    targetKeywords: ['curcumin', 'resveratrol', 'quercetin', 'egcg', 'green tea'],
    enhancerName: 'Piperine',
    reason: {
      en: 'Polyphenol absorption enhancer (inhibits rapid glucuronidation)',
      es: 'Potenciador de absorción de polifenoles (inhibe glucuronidación rápida)'
    }
  }
];

export const OVERLAP_GROUPS = [
  {
    id: 'stimulants',
    keywords: ['ginseng', 'green tea', 'egcg', 'tyrosine', 'rhodiola', 'caffeine'],
    maxCount: 2,
    warning: {
      en: 'Multiple stimulating/catecholaminergic actives combined. Monitor evening sleep latency or split into Morning Phase.',
      es: 'Múltiples activos estimulantes/catecolaminérgicos combinados. Vigila la latencia del sueño o separa en fase matutina.'
    }
  },
  {
    id: 'sedatives',
    keywords: ['melatonin', 'valerian', 'gaba', '5-htp', 'ashwagandha'],
    maxCount: 3,
    warning: {
      en: 'High sedative/GABAergic stacking. Recommended strictly for evening administration.',
      es: 'Alta carga sedante/GABAérgica. Recomendada exclusivamente para administración nocturna.'
    }
  }
];

/* ─── Base blueprints (resolved against the live API catalog by name) ─────── */
export const BLUEPRINTS = [
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

/* ─── Galenic & Split Computation ────────────────────────────────────────── */
export function computeGalenics(itemsList, capsPerBottle) {
  const totalMg = itemsList.reduce((s, i) => s + (Number(i.doseMg) || 0), 0);
  if (totalMg <= 0) return null;
  const capsPerDay = Math.max(1, Math.ceil(totalMg / MAX_MG_PER_CAP));
  const mgPerCap = totalMg / capsPerDay;
  const size = resolvePhysicalCapsuleSize([{ amount: mgPerCap }]);
  const maxFill = MAX_FILL_MG[size.size] || MAX_MG_PER_CAP;
  const fillPct = Math.min(100, Math.round((mgPerCap / maxFill) * 100));
  const supplyDays = Math.floor(capsPerBottle / capsPerDay);
  const tooMany = capsPerDay > MAX_CAPS_PER_DAY;
  return {
    totalMg: Math.round(totalMg * 10) / 10,
    capsPerDay,
    mgPerCap: Math.round(mgPerCap),
    size,
    fillPct,
    supplyDays,
    tooMany
  };
}

export function computeCostEstimate(itemsList, galenicsObj, capsPerBottle, catalog) {
  if (!itemsList.length || !galenicsObj) return null;
  try {
    const perCapIngredients = itemsList.map(i => ({
      apiId: i.apiId,
      name: i.name,
      doseMg: (Number(i.doseMg) || 0) / galenicsObj.capsPerDay
    }));
    return calculatePharmapolisCost({
      activeIngredients: perCapIngredients,
      capsPerBottle,
      apisCatalog: catalog
    });
  } catch {
    return null;
  }
}

export function computeSplitPhases(items) {
  if (!items.length) return null;
  const morningItems = [];
  const eveningItems = [];
  items.forEach(i => {
    const norm = normalize(i.name);
    const isEvening =
      norm.includes('melatonin') ||
      norm.includes('valerian') ||
      norm.includes('magnesium') ||
      norm.includes('gaba') ||
      norm.includes('theanine') ||
      norm.includes('ashwagandha');
    if (isEvening) eveningItems.push(i);
    else morningItems.push(i);
  });

  if (morningItems.length === 0 || eveningItems.length === 0) {
    const half = Math.ceil(items.length / 2);
    return {
      phase1: items.slice(0, half),
      phase2: items.slice(half)
    };
  }
  return { phase1: morningItems, phase2: eveningItems };
}

export function parseFormulaFromUrl(catalog) {
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

/* ─── Bilingual copy ─────────────────────────────────────────────────────── */
export const COMPOUNDING_I18N = {
  en: {
    badge: 'Atlas Custom Compounding Lab',
    regulatoryBadge: 'EU Food Supplement Directive 2002/46/EC',
    title: 'Build your own compounded formula',
    goalsWizardBtn: 'Not sure? Find your formula in 30s',
    goalsWizardSub: 'Take a 30s clinical questionnaire to receive 3 tailored formulas based on your goals',
    subtitle:
      'Design a personalized formula in acid-resistant vegan HPMC capsules. Pick a base, adjust the actives, and request your official batch quotation — in under 2 minutes.',
    kpis: [
      { label: 'Quality Standard', value: 'EU GMP · Ph. Eur.', sub: 'Authorized food supplements' },
      { label: 'Capsule Shell', value: 'Vegan HPMC', sub: 'Acid-resistant · Zero TiO2' },
      { label: 'Active Pool', value: '118 Actives', sub: 'Pharmacopeial-grade APIs' },
      { label: 'Smart Galenics', value: 'Size 1 · 0 · 00', sub: 'Automatic capsule sizing' }
    ],
    step1: 'Choose a base', step1Hint: 'Start from a clinical blueprint, health goals wizard, or blank formula.',
    step2: 'Adjust your actives', step2Hint: 'Daily dose per active, in milligrams.',
    step3: 'Review & request', step3Hint: 'Galenic summary of your formula.',
    searchPh: 'Search 118 actives (e.g. Resveratrol, Magnesium, CoQ10)…',
    popularHeader: 'Popular pharmacopeial actives',
    noResults: 'No matching actives in the catalog.',
    emptyTitle: 'Your formula is empty',
    emptySub: 'Choose a blueprint above, launch the Goals Wizard, or search an active to add it.',
    formulaName: 'Formula name', formulaNamePh: 'e.g. Morning Longevity Blend',
    bottle: 'Bottle size',
    capsule: 'Capsule',
    perCapsule: 'per capsule',
    dailyIntake: 'Daily intake',
    capsDay: 'caps / day',
    supply: 'Supply',
    days: 'days',
    fill: 'Fill',
    totalDaily: 'Total active load',
    actives: 'Actives',
    perDay: 'mg / day',
    reset: 'Reset',
    request: 'Request Official Quotation',
    pdf: 'Download Formula Sheet (PDF)',
    copy: 'Copy Shareable Link',
    copied: 'Shareable formula link copied',
    ai: 'Check synergies with Atlas AI',
    priceNote: 'Pricing is provided in your official quotation, adjusted to the actives, quantities and channel (patient, clinic or wholesale).',
    warnTooMany: 'Your formula requires more than 4 capsules per day. Consider reducing doses or splitting it into two formulas.',
    warnMax: `Maximum of ${MAX_ACTIVES} actives per formula reached.`,
    ok: 'Galenically viable in vegan HPMC capsules.',
    added: 'added to formula',
    removed: 'removed',
    already: 'is already in your formula',
    disclaimer: 'All active ingredients are authorized food supplements conforming to EU Directive 2002/46/EC and Regulation (EC) 1925/2006. Compounded formulations are prepared on request under pharmaceutical supervision. They are not intended to diagnose, treat, cure or prevent any disease. Consult your physician before use.',
    channelB2B: 'Clinic / B2B Cost',
    channelRRP: 'Suggested Patient RRP',
    b2bDesc: 'Est. wholesale compounding cost',
    rrpDesc: 'Suggested patient retail with practice dispensing margin',
    marginLabel: 'Practice Margin',
    splitProtocol: 'Split into Day / Night Protocol',
    recombineProtocol: 'Recombine into Single Formula',
    allPhases: 'All Actives',
    phase1Title: 'Phase 1: Morning Energy',
    phase2Title: 'Phase 2: Evening Repair',
    undo: 'Undo',
    formulaReplaced: 'Formula updated',
    formulaReset: 'Formula cleared',
    saveFormula: 'Save to Compare',
    savedFormulasTitle: 'Saved Formulas',
    loadSaved: 'Load'
  },
  es: {
    badge: 'Laboratorio de Formulación Magistral Atlas',
    regulatoryBadge: 'Complementos Alimenticios · Directiva UE 2002/46/CE',
    title: 'Diseña tu propia fórmula magistral',
    goalsWizardBtn: '¿Dudas? Descubre tu fórmula en 30s',
    goalsWizardSub: 'Responde un test clínico de 30s para recibir 3 fórmulas personalizadas según tus objetivos',
    subtitle:
      'Crea una fórmula personalizada en cápsulas veganas HPMC ácido-resistentes. Elige una base, ajusta los activos y solicita tu cotización oficial en menos de 2 minutos.',
    kpis: [
      { label: 'Estándar de Calidad', value: 'EU GMP · Ph. Eur.', sub: 'Complementos autorizados' },
      { label: 'Cápsula', value: 'Vegana HPMC', sub: 'Ácido-resistente · Sin TiO2' },
      { label: 'Catálogo Activo', value: '118 Activos', sub: 'Grado farmacopeico' },
      { label: 'Galénica Inteligente', value: 'Size 1 · 0 · 00', sub: 'Calibración automática' }
    ],
    step1: 'Elige una base', step1Hint: 'Parte de una fórmula clínica, el asistente de objetivos o una fórmula en blanco.',
    step2: 'Ajusta tus activos', step2Hint: 'Dosis diaria de cada activo, en miligramos.',
    step3: 'Revisa y solicita', step3Hint: 'Resumen galénico de tu fórmula.',
    searchPh: 'Buscar entre 118 activos (ej. Resveratrol, Magnesio, CoQ10)…',
    popularHeader: 'Activos farmacopeicos más usados',
    noResults: 'Ningún activo coincide con tu búsqueda.',
    emptyTitle: 'Tu fórmula está vacía',
    emptySub: 'Elige una base arriba, abre el Asistente de Objetivos o busca un activo para añadirlo.',
    formulaName: 'Nombre de la fórmula', formulaNamePh: 'ej. Fórmula Longevidad Mañana',
    bottle: 'Tamaño del frasco',
    capsule: 'Cápsula',
    perCapsule: 'por cápsula',
    dailyIntake: 'Toma diaria',
    capsDay: 'cáps / día',
    supply: 'Duración',
    days: 'días',
    fill: 'Llenado',
    totalDaily: 'Carga activa total',
    actives: 'Activos',
    perDay: 'mg / día',
    reset: 'Reiniciar',
    request: 'Solicitar Cotización Oficial',
    pdf: 'Descargar Ficha Técnica (PDF)',
    copy: 'Copiar Enlace Compartible',
    copied: 'Enlace de la fórmula copiado',
    ai: 'Analizar sinergias con Atlas AI',
    priceNote: 'El precio se entrega en tu cotización oficial según activos, volumen y canal (paciente, clínica o distribuidor).',
    warnTooMany: 'Tu fórmula supera las 4 cápsulas diarias. Reduce dosis o divídela en dos fórmulas.',
    warnMax: `Máximo de ${MAX_ACTIVES} activos por fórmula alcanzado.`,
    ok: 'Fórmula galénicamente viable en cápsulas veganas HPMC.',
    added: 'añadido a la fórmula',
    removed: 'eliminado',
    already: 'ya está en tu fórmula',
    disclaimer: 'Todos los activos son complementos alimenticios autorizados bajo la Directiva UE 2002/46/CE y el Reglamento (CE) 1925/2006. Las fórmulas magistrales se elaboran bajo pedido y supervisión farmacéutica. No están destinadas a diagnosticar, tratar, curar ni prevenir enfermedades. Consulta a tu médico antes de usarlas.',
    channelB2B: 'Coste Clínica / B2B',
    channelRRP: 'PVP Sugerido Paciente',
    b2bDesc: 'Coste mayorista estimado de elaboración',
    rrpDesc: 'PVP sugerido al paciente con margen clínico de dispensación',
    marginLabel: 'Margen Clínico',
    splitProtocol: 'Dividir en Protocolo Día / Noche',
    recombineProtocol: 'Unificar en Fórmula Única',
    allPhases: 'Todos los Activos',
    phase1Title: 'Fase 1: Energía Diurna',
    phase2Title: 'Fase 2: Reparación Nocturna',
    undo: 'Deshacer',
    formulaReplaced: 'Fórmula actualizada',
    formulaReset: 'Fórmula reiniciada',
    saveFormula: 'Guardar para comparar',
    savedFormulasTitle: 'Fórmulas guardadas',
    loadSaved: 'Cargar'
  }
};
