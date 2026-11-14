import {
  Zap,
  Heart,
  Activity,
  Brain,
  Shield,
  ShieldAlert,
  Sparkles,
  Moon,
  FlaskConical,
  Award,
} from '@/lib/icons';
import { GOAL_TRANSLATIONS } from './protocolTranslations';

export const GOAL_BUCKETS = [
  { id: 'all', label: 'All Protocols', icon: FlaskConical, color: '#003666', bg: '#eff6ff' },
  { id: 'reference_standards', label: '★ Reference Standards', icon: Award, color: '#b45309', bg: '#fffbeb', isReferenceChip: true },
  { id: 'fat_loss', label: 'Metabolism & GLP-1 / GIP', icon: Zap, color: '#ea580c', bg: '#fff7ed' },
  { id: 'longevity', label: 'Longevity & Anti-Aging', icon: Heart, color: '#0d9488', bg: '#f0fdfa' },
  { id: 'recovery', label: 'Tissue & Joint Regeneration', icon: Activity, color: '#0284c7', bg: '#f0f9ff' },
  { id: 'cognitive', label: 'Neuroplasticity & Cognition', icon: Brain, color: '#7c3aed', bg: '#faf5ff' },
  { id: 'muscle_growth', label: 'Muscle Mass & Performance', icon: Shield, color: '#16a34a', bg: '#f0fdf4' },
  { id: 'immune', label: 'Immunity & Cellular Defense', icon: ShieldAlert, color: '#0891b2', bg: '#ecfeff' },
  { id: 'sexual_health', label: 'Hormonal & Sexual Health', icon: Sparkles, color: '#db2777', bg: '#fdf2f8' },
  { id: 'sleep', label: 'Sleep & Circadian Rhythm', icon: Moon, color: '#4338ca', bg: '#eef2ff' },
  { id: 'skin_hair', label: 'Skin, Hair & Aesthetics', icon: Sparkles, color: '#d97706', bg: '#fffbeb' },
];

export const REFERENCE_TELEMETRY_PILLS = {
  'bpc-157-tb-500-protocol': { en: 'Anatomical Geometry', es: 'Geometría Anatómica' },
  'metabolic-retatrutide-motsc-12w': { en: 'Incretin / DEXA Safety', es: 'Seguridad Incretina / DEXA' },
  'nad-cellular-restoration-protocol': { en: 'Bloodo™ Companion Test', es: 'Test Acompañante Bloodo™' },
  'cjc-1295-ipamorelin-synergistic-hgh-optimization': { en: 'Somatotropic Axis', es: 'Eje Somatotrópico' },
  'thymosin-alpha-1-immune-resilience': { en: 'Immune Lineage', es: 'Linaje Inmunitario' },
};

const REFERENCE_SLUGS = new Set([
  'bpc-157-tb-500-protocol',
  'metabolic-retatrutide-motsc-12w',
  'nad-cellular-restoration-protocol',
  'cjc-1295-ipamorelin-synergistic-hgh-optimization',
  'thymosin-alpha-1-immune-resilience',
]);

/**
 * Maps arbitrary Firestore goal tags to standard bucket IDs.
 */
export function mapProtocolToGoals(p) {
  const text = [
    ...(Array.isArray(p.goals) ? p.goals : [p.goals]),
    p.goal,
    p.category,
    p.therapeutic_category,
    p.name,
    p.protocol_name,
    p.title,
    p.description,
  ].filter(Boolean).join(' ').toLowerCase();

  const matched = new Set(['all']);

  if (text.match(/glp|gip|fat|weight|metabolic|tirzepatide|semaglutide|retatrutide|aod|5-amino|adipotide/i)) {
    matched.add('fat_loss');
  }
  if (text.match(/longevity|aging|epithalon|nad|foxo4|telomere|mitochondr|ghk/i)) {
    matched.add('longevity');
  }
  if (text.match(/recovery|tissue|joint|repair|bpc|tb-500|tb500|kpv|pentosan|collagen|cartilage/i)) {
    matched.add('recovery');
  }
  if (text.match(/cognit|neuro|brain|semax|selank|dihexa|cerebro|memory|focus|anxiety/i)) {
    matched.add('cognitive');
  }
  if (text.match(/muscle|lean|performance|growth|strength|cjc|ipamorelin|sermorelin|tesamorelin|ghrh|ghrp/i)) {
    matched.add('muscle_growth');
  }
  if (text.match(/immune|thymosin|ll-37|ta-1|ta1|inflam|defense|antimicrobial/i)) {
    matched.add('immune');
  }
  if (text.match(/sexual|libido|pt-141|kisspeptin|bremelanotide|hormon|fertility|testosterone/i)) {
    matched.add('sexual_health');
  }
  if (text.match(/sleep|dsip|circadian|insomnia|rest|pineal/i)) {
    matched.add('sleep');
  }
  if (text.match(/skin|hair|ghk-cu|copper|cosmetic|aesthetics|wrinkle|melanogen|density|snap-8|follicul|scalp/i)) {
    matched.add('skin_hair');
  }

  return Array.from(matched);
}

/**
 * Resolves the most clinically accurate goal to display on the protocol card badge.
 */
export function resolveDisplayedGoal(proto, groupBucketId, selectedGoal) {
  if (!proto) return 'longevity';
  const mapped = Array.isArray(proto.mappedGoals) ? proto.mappedGoals : [];

  if (selectedGoal && selectedGoal !== 'all' && selectedGoal !== 'reference_standards') {
    if (mapped.includes(selectedGoal)) return selectedGoal;
  }

  if (groupBucketId && groupBucketId !== 'all' && groupBucketId !== 'reference_standards') {
    if (mapped.includes(groupBucketId)) return groupBucketId;
  }

  const explicit = proto.goal || proto.primary_goal || proto.category || proto.therapeutic_category;
  if (explicit && GOAL_BUCKETS.some((b) => b.id === explicit)) {
    return explicit;
  }

  const specificityHierarchy = [
    'skin_hair',
    'recovery',
    'cognitive',
    'fat_loss',
    'muscle_growth',
    'sexual_health',
    'sleep',
    'immune',
    'longevity',
  ];

  for (const goalId of specificityHierarchy) {
    if (mapped.includes(goalId)) return goalId;
  }

  return mapped.find((g) => g !== 'all') || 'longevity';
}

export function getGoalBadgeLabel(goalId, lang = 'en') {
  const shortLabels = {
    skin_hair: { en: 'Skin, Hair & Aesthetics', es: 'Piel, Cabello & Estética' },
    recovery: { en: 'Tissue & Joint Repair', es: 'Regeneración Tisular' },
    cognitive: { en: 'Neuroplasticity & Brain', es: 'Neuroplasticidad' },
    fat_loss: { en: 'Metabolic & GLP-1', es: 'Metabolismo & GLP-1' },
    muscle_growth: { en: 'Muscle & Performance', es: 'Masa Muscular' },
    immune: { en: 'Immunity & Defense', es: 'Inmunidad & Defensa' },
    sexual_health: { en: 'Hormonal & Vitality', es: 'Salud Hormonal' },
    sleep: { en: 'Sleep & Circadian', es: 'Sueño & Circadiano' },
    longevity: { en: 'Longevity & Cellular', es: 'Longevidad & Celular' },
    reference_standards: { en: 'Reference Standard', es: 'Estándar Clínico' },
    all: { en: 'Clinical Protocol', es: 'Protocolo Clínico' },
  };
  return shortLabels[goalId]?.[lang] || GOAL_TRANSLATIONS[goalId]?.[lang] || goalId;
}

/**
 * Extracts distinct active compounds for chip rendering and filtering.
 */
export function extractCompounds(p) {
  const list = [];
  const seen = new Set();

  const add = (name, slug) => {
    if (!name) return;
    const clean = String(name).trim();
    const key = clean.toLowerCase();
    if (!seen.has(key) && clean.length > 1) {
      seen.add(key);
      const autoSlug = slug || clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      list.push({ name: clean, slug: autoSlug });
    }
  };

  if (Array.isArray(p.bom)) {
    p.bom.forEach((b) => add(b.name || b.compound || b.product_name, b.slug || b.productId));
  }
  if (Array.isArray(p.peptides)) {
    p.peptides.forEach((c) => add(c.name || c.compound, c.slug));
  }
  if (Array.isArray(p.phases)) {
    p.phases.forEach((ph) => {
      if (Array.isArray(ph.compounds)) {
        ph.compounds.forEach((c) => add(c.name || c.compound, c.slug));
      }
    });
  }

  return list;
}

/**
 * Infers primary administration route from protocol metadata/title.
 */
export function extractAdministrationRoute(p) {
  const raw = [
    p.route,
    p.administration_route,
    ...(Array.isArray(p.administration_modalities) ? p.administration_modalities : []),
    p.name,
    p.slug,
  ].filter(Boolean).join(' ').toLowerCase();

  if (raw.includes('nasal') || raw.includes('intranasal')) return 'Intranasal';
  if (raw.includes('topical') || raw.includes('trichosol') || raw.includes('pentravan') || raw.includes('scalp')) return 'Topical';
  if (raw.includes('oral') || raw.includes('capsule')) return 'Oral';
  return 'Subcutaneous (SubQ)';
}

/**
 * Normalizes a sanitized Firestore protocol into a slim, catalog-ready DTO.
 * Safe to run on either Server Component (page.jsx) or Client Component.
 */
export function enrichProtocolForCatalog(p) {
  if (!p) return null;
  if (p._catalogEnriched) return p;

  const durationWeeks =
    p.durationWeeks ||
    p.duration_weeks ||
    (typeof p.duration === 'string' ? parseInt(p.duration, 10) || 8 : 8);

  const rawPhases = Array.isArray(p.phases) ? p.phases : [];
  const phasesCount = rawPhases.length || p.phasesCount || 1;
  const slimPhases = rawPhases.map((ph, idx) => ({
    id: ph.id || `phase-${idx + 1}`,
    name: ph.name || ph.title || `Phase ${idx + 1}`,
    durationWeeks: ph.durationWeeks || ph.duration_weeks || 4,
    startWeek: ph.startWeek || ph.start_week || 1,
    endWeek: ph.endWeek || ph.end_week || (ph.durationWeeks || 4),
  }));

  const compounds = Array.isArray(p.compounds) && p.compounds.length > 0 && p.compounds[0]?.slug
    ? p.compounds
    : extractCompounds(p);

  const mappedGoals = mapProtocolToGoals(p);
  const cleanName = p.cleanName || p.name || p.protocol_name || p.title || 'Clinical Protocol';
  const cleanCode =
    p.cleanCode ||
    p.sku ||
    p.code ||
    p.protocol_id ||
    p.protocolCode ||
    (p.id ? `PR-${String(p.id).slice(0, 6).toUpperCase()}` : 'PR-CLIN');
  const cleanSlug = p.cleanSlug || p.slug || p.protocol_slug || p.id;
  const summary =
    p.summary ||
    p.overview_summary ||
    p.description ||
    p.executiveSummary ||
    p.clinical_rationale ||
    'Prescription protocol calibrated for cellular receptor adaptation and targeted biomarker outcomes.';

  const isRef = Boolean(
    p.is_reference_standard ||
    REFERENCE_SLUGS.has(cleanSlug) ||
    cleanCode === 'PR-REC-002' ||
    cleanCode === 'PR-MET-011' ||
    cleanCode === 'PR-LON-003' ||
    p.id === 'HCFtYVhkbeEnHX4FJ7FR' ||
    p.id === '1k0p4FgSekpmUyAJhbsT'
  );

  const refOrder =
    p.reference_order !== undefined
      ? p.reference_order
      : (cleanSlug === 'bpc-157-tb-500-protocol' || cleanCode === 'PR-REC-002') ? 1
      : (cleanSlug === 'metabolic-retatrutide-motsc-12w' || cleanCode === 'PR-MET-011') ? 2
      : (cleanSlug === 'nad-cellular-restoration-protocol' || cleanCode === 'PR-LON-003') ? 3
      : (cleanSlug === 'cjc-1295-ipamorelin-synergistic-hgh-optimization' || p.id === 'HCFtYVhkbeEnHX4FJ7FR') ? 4
      : (cleanSlug === 'thymosin-alpha-1-immune-resilience' || p.id === '1k0p4FgSekpmUyAJhbsT') ? 5
      : 99;

  const finalGoals = isRef
    ? [...mappedGoals.filter((g) => g !== 'reference_standards'), 'reference_standards']
    : mappedGoals;

  const biomarkers = Array.isArray(p.biomarkers)
    ? p.biomarkers
    : Array.isArray(p.recommendedTests)
      ? p.recommendedTests
      : Array.isArray(p.required_labs)
        ? p.required_labs
        : [];

  const contraindications = Array.isArray(p.contraindications)
    ? p.contraindications
    : Array.isArray(p.warnings)
      ? p.warnings
      : [];

  return {
    id: p.id,
    code: p.code || cleanCode,
    cleanName,
    cleanCode,
    cleanSlug,
    goal: p.goal || null,
    primary_goal: p.primary_goal || null,
    category: p.category || null,
    therapeutic_category: p.therapeutic_category || null,
    durationWeeks,
    phasesCount,
    phases: slimPhases,
    compounds,
    mappedGoals: finalGoals,
    summary,
    route: extractAdministrationRoute(p),
    evidence_grade: p.evidence_grade || p.evidence_level || 'Clinical Standard',
    biomarkers: biomarkers.slice(0, 6),
    contraindications: contraindications.slice(0, 4),
    is_reference_standard: isRef,
    reference_order: refOrder,
    reference_label_es: p.reference_label_es || 'Protocolo de Referencia Clínica',
    reference_label_en: p.reference_label_en || 'Primary Clinical Reference Standard',
    reference_standard_tier: p.reference_standard_tier || 'gold',
    _catalogEnriched: true,
  };
}
