 
export const API_ENDPOINT = 'https://clinicalaiassistant-jtlgnxrofa-ew.a.run.app';

export const GREETINGS = {
  en: "Hey! 👋 I'm your Clinical Assistant. How can I help your research today?",
  es: "Hey! 👋 I'm your Clinical Assistant. How can I help your research today?"
};

export const DEFAULT_GREETING = GREETINGS.en;

export const KNOWN_GOAL_TERMS = new Set([
  'anti-aging', 'antiaging', 'anti aging',
  'hair-loss', 'hair loss', 'hair-growth', 'hair growth',
  'fat-loss', 'fat loss', 'weight-loss', 'weight loss',
  'brain-fog', 'brain fog',
  'gut-health', 'gut health',
  'skin-health', 'skin health',
  'sexual-health', 'sexual health',
  'joint-health', 'joint health',
  'muscle-growth', 'muscle growth',
  'longevity', 'energy', 'sleep', 'muscle', 'recovery',
  'immunity', 'inflammation', 'cognitive', 'stress', 'mood',
  'testosterone', 'libido', 'injury', 'aging', 'performance',
]);

export const PRE_SEARCH_SYNONYMS = {
  // ── Anti-aging / longevity ──────────────────────────────────────────────────
  'anti aging':       'longevity epithalon nad ghk-cu mots-c humanin cellular regeneration',
  'anti-aging':       'longevity epithalon nad ghk-cu mots-c humanin cellular regeneration',
  'antiaging':        'longevity epithalon nad ghk-cu mots-c humanin cellular regeneration',
  'longevity':        'epithalon nad mots-c humanin telomere aging lifespan',

  // ── Metabolic / weight ──────────────────────────────────────────────────────
  'fat loss':         'weight loss semaglutide aod metabolic tirzepatide retatrutide',
  'fat-loss':         'weight loss semaglutide aod metabolic tirzepatide retatrutide',
  'weight loss':      'semaglutide aod tirzepatide retatrutide cagrilintide metabolic',
  'weight-loss':      'semaglutide aod tirzepatide retatrutide cagrilintide metabolic',
  // ↓ Top unresolved queries from clinical_logs
  'glp-1':            'semaglutide tirzepatide retatrutide cagrilintide glp weight',
  'glp-1 research':   'semaglutide tirzepatide retatrutide cagrilintide glp weight metabolic',
  'glp1':             'semaglutide tirzepatide retatrutide cagrilintide glp weight',
  'metabolic':        'semaglutide tirzepatide mots-c aod metabolic insulin',

  // ── Recovery / repair ───────────────────────────────────────────────────────
  'injury':           'bpc-157 tb-500 tissue repair healing ara-290 recovery',
  'recovery':         'bpc-157 tb-500 tissue repair healing recovery ara-290',
  'repair':           'bpc-157 tb-500 ghk-cu tissue repair collagen healing',
  'tissue repair':    'bpc-157 tb-500 ghk-cu collagen healing injury recovery',

  // ── Cognitive / mood ────────────────────────────────────────────────────────
  'brain fog':        'cognitive focus semax selank dihexa',
  'brain-fog':        'cognitive focus semax selank dihexa',
  'cognitive':        'semax selank dihexa cognitive nootropic brain pinealon',
  'focus':            'semax selank pe-22-28 cognitive nootropic',
  'mood':             'selank semax pe-22-28 serotonin wellbeing oxytocin',
  'stress':           'selank semax cortisol adaptogen oxytocin',

  // ── Sleep ───────────────────────────────────────────────────────────────────
  'sleep':            'dsip epithalon sleep circadian cjc',
  'better sleep':     'dsip epithalon sleep circadian selank',
  'insomnia':         'dsip epithalon sleep circadian selank',
  'sleep quality':    'dsip epithalon pinealon sleep circadian',

  // ── GH axis / muscle ────────────────────────────────────────────────────────
  'muscle':           'ipamorelin cjc ghrp sermorelin growth hormone hexarelin mk-677',
  'muscle growth':    'ipamorelin cjc ghrp sermorelin growth hormone hexarelin mk-677',
  'muscle-growth':    'ipamorelin cjc ghrp sermorelin growth hormone hexarelin mk-677',
  'energy':           'nad nmn mots-c mitochondrial ss-31 slu-pp-332',

  // ── Immune ──────────────────────────────────────────────────────────────────
  'immune':           'thymosin ta-1 thymagen thymulin ll-37 immunity',
  'immunity':         'thymosin ta-1 thymagen thymulin ll-37 immune',
  'inflammation':     'bpc-157 tb-500 kpv ara-290 ll-37 anti-inflammatory',

  // ── Skin / hair ─────────────────────────────────────────────────────────────
  'skin':             'ghk-cu snap-8 kpv collagen palmitoyl glow',
  'skin health':      'ghk-cu snap-8 kpv collagen palmitoyl glow',
  'skin-health':      'ghk-cu snap-8 kpv collagen palmitoyl glow',
  'hair loss':        'ghk-cu hair follicle alopecia keratinocyte stem cell growth factor',
  'hair-loss':        'ghk-cu hair follicle alopecia keratinocyte stem cell growth factor',
  'hair growth':      'ghk-cu hair follicle alopecia keratinocyte stem cell regrowth',
  'hair-growth':      'ghk-cu hair follicle alopecia keratinocyte stem cell regrowth',
  'gut health':       'bpc-157 kpv leaky gut gastro intestinal',
  'gut-health':       'bpc-157 kpv leaky gut gastro intestinal',

  // ── Hormonal / sexual ───────────────────────────────────────────────────────
  'testosterone':     'testosterone hormonal libido kisspeptin hcg',
  'sexual health':    'pt-141 melanotan libido sexual kisspeptin oxytocin',
  'sexual-health':    'pt-141 melanotan libido sexual kisspeptin oxytocin',
  'libido':           'pt-141 melanotan oxytocin kisspeptin libido',

  // ── Athletic / performance (log: "athletic performance research") ───────────
  'athletic performance': 'ipamorelin cjc tb-500 bpc-157 sermorelin mk-677 ghrp',
  'performance':          'ipamorelin cjc ghrp sermorelin bpc-157 tb-500',

  // ── Beginner queries (log: "what is easiest peptide") ──────────────────────
  'beginner':         'bpc-157 ipamorelin sermorelin reconstitution protocol starter',
  'first peptide':    'bpc-157 ipamorelin sermorelin reconstitution protocol',
  'easiest peptide':  'bpc-157 ipamorelin sermorelin reconstitution',
  'get started':      'protocol reconstitution beginner bpc-157 ipamorelin',
  'how to start':     'protocol reconstitution beginner bpc-157 ipamorelin',

  // ── Supplements (log: "which supplements support energy") ───────────────────
  'supplements energy':       'nmn nad mots-c',
  'supplements aging':        'nmn nad epithalon ghk-cu',
  'supplements recovery':     'nmn nad bpc-157',
  'supplements performance':  'nmn nad ipamorelin cjc',

  // ── Joint / connective tissue ────────────────────────────────────────────────
  'joint health':     'bpc-157 tb-500 collagen joint repair cartalax',
  'joint-health':     'bpc-157 tb-500 collagen joint repair cartalax',
};

export const AI_SECTION_MAP = {
  'GOAL':                   { icon: '🎯', color: '#0f766e', bg: 'rgba(15,118,110,0.06)', accentBg: 'rgba(15,118,110,0.12)', accent: '#0f766e' },
  'RECOMMENDED PROTOCOL':   { icon: '📋', color: 'var(--color-primary-hover)', bg: 'rgba(29,78,216,0.06)',  accentBg: 'rgba(29,78,216,0.12)',  accent: 'var(--color-primary-hover)' },
  'PROTOCOL':               { icon: '📋', color: 'var(--color-primary-hover)', bg: 'rgba(29,78,216,0.06)',  accentBg: 'rgba(29,78,216,0.12)',  accent: 'var(--color-primary-hover)' },
  'NEXT STEP':              { icon: '➡️', color: '#7c3aed', bg: 'rgba(124,58,237,0.06)', accentBg: 'rgba(124,58,237,0.12)', accent: '#7c3aed' },
  'NEXT STEPS':             { icon: '➡️', color: '#7c3aed', bg: 'rgba(124,58,237,0.06)', accentBg: 'rgba(124,58,237,0.12)', accent: '#7c3aed' },
  'MECHANISM':              { icon: '⚙️', color: '#b45309', bg: 'rgba(180,83,9,0.06)',   accentBg: 'rgba(180,83,9,0.12)',   accent: '#b45309' },
  'MECHANISM OF ACTION':    { icon: '⚙️', color: '#b45309', bg: 'rgba(180,83,9,0.06)',   accentBg: 'rgba(180,83,9,0.12)',   accent: '#b45309' },
  'DOSING':                 { icon: '💊', color: '#0369a1', bg: 'rgba(3,105,161,0.06)',  accentBg: 'rgba(3,105,161,0.12)',  accent: '#0369a1' },
  'DOSAGE':                 { icon: '💊', color: '#0369a1', bg: 'rgba(3,105,161,0.06)',  accentBg: 'rgba(3,105,161,0.12)',  accent: '#0369a1' },
  'SAFETY':                 { icon: '🛡️', color: 'var(--color-success)', bg: 'rgba(21,128,61,0.06)',  accentBg: 'rgba(21,128,61,0.12)',  accent: 'var(--color-success)' },
  'CONTRAINDICATIONS':      { icon: '⚠️', color: '#b91c1c', bg: 'rgba(185,28,28,0.06)', accentBg: 'rgba(185,28,28,0.12)', accent: '#b91c1c' },
  'SUMMARY':                { icon: '📝', color: 'var(--color-text-secondary)', bg: 'rgba(71,85,105,0.06)',  accentBg: 'rgba(71,85,105,0.12)',  accent: 'var(--color-text-secondary)' },
  'RESEARCH NOTE':          { icon: '🔬', color: '#7c3aed', bg: 'rgba(124,58,237,0.06)', accentBg: 'rgba(124,58,237,0.12)', accent: '#7c3aed' },
  'CLINICAL NOTE':          { icon: '🏥', color: '#0f766e', bg: 'rgba(15,118,110,0.06)', accentBg: 'rgba(15,118,110,0.12)', accent: '#0f766e' },
  'SYNERGY':                { icon: '🔗', color: 'var(--color-warning)', bg: 'rgba(217,119,6,0.06)',  accentBg: 'rgba(217,119,6,0.12)',  accent: 'var(--color-warning)' },
  'STACK':                  { icon: '🧬', color: '#0369a1', bg: 'rgba(3,105,161,0.06)',  accentBg: 'rgba(3,105,161,0.12)',  accent: '#0369a1' },
  'PEPTIDES':               { icon: '🔬', color: '#0369a1', bg: 'rgba(3,105,161,0.06)',  accentBg: 'rgba(3,105,161,0.12)',  accent: '#0369a1' },
  'SUPPLEMENTS':            { icon: '💉', color: 'var(--color-success)', bg: 'rgba(21,128,61,0.06)',  accentBg: 'rgba(21,128,61,0.12)',  accent: 'var(--color-success)' },
  'LIFESTYLE':              { icon: '🏃', color: 'var(--color-warning)', bg: 'rgba(217,119,6,0.06)',  accentBg: 'rgba(217,119,6,0.12)',  accent: 'var(--color-warning)' },
  'MONITORING':             { icon: '📊', color: 'var(--color-text-secondary)', bg: 'rgba(71,85,105,0.06)',  accentBg: 'rgba(71,85,105,0.12)',  accent: 'var(--color-text-secondary)' },
};

export const SESSION_INTENT_MAP = [
  { theme: 'recovery & repair',    keywords: ['recovery', 'repair', 'healing', 'injury', 'tendon', 'joint', 'bpc', 'tb-500', 'tissue'] },
  { theme: 'sleep & circadian',    keywords: ['sleep', 'insomnia', 'circadian', 'dsip', 'melatonin', 'rest', 'wake', 'rem'] },
  { theme: 'cognitive & nootropic',keywords: ['cognitive', 'focus', 'memory', 'brain', 'nootropic', 'semax', 'selank', 'dihexa', 'mental'] },
  { theme: 'longevity & anti-aging',keywords: ['longevity', 'aging', 'anti-aging', 'antiaging', 'lifespan', 'epithalon', 'mots-c', 'nad', 'humanin', 'senescence'] },
  { theme: 'metabolic & weight',   keywords: ['weight', 'fat', 'metabolic', 'metabolism', 'glp-1', 'semaglutide', 'tirzepatide', 'aod', 'obesity', 'insulin'] },
  { theme: 'growth hormone & muscle', keywords: ['growth hormone', 'gh', 'ipamorelin', 'cjc', 'ghrp', 'muscle', 'lean mass', 'sermorelin', 'igf'] },
  { theme: 'sexual health',        keywords: ['libido', 'sexual', 'pt-141', 'melanotan', 'erectile', 'desire'] },
  { theme: 'immune & thymic',      keywords: ['immune', 'thymosin', 'thymic', 'immunity', 'infection', 'autoimmune', 'ta-1'] },
  { theme: 'hair loss & growth',   keywords: ['hair loss', 'hair-loss', 'hair growth', 'hair-growth', 'alopecia', 'hair follicle', 'thinning hair', 'hairloss', 'baldness', 'hair regrowth'] },
  { theme: 'skin & collagen',      keywords: ['skin', 'collagen', 'ghk', 'wrinkle', 'complexion', 'wound', 'palmitoyl'] },
];

export const MOCK_PRODUCTS_FALLBACK = []; // If needed for dev

export const CLINICAL_GLOSSARY = {
  // English
  'agonist': 'A substance that initiates a physiological response when combined with a receptor.',
  'antagonist': 'A substance that interferes with or inhibits the physiological action of another.',
  'pharmacokinetics': 'The branch of pharmacology concerned with the movement of drugs within the body.',
  'angiogenesis': 'The development of new blood vessels.',
  'anabolism': 'The synthesis of complex molecules in living organisms from simpler ones.',
  'peptide': 'A compound consisting of two or more amino acids linked in a chain.',
  'lyophilized': 'Freeze-dried for preservation and stability.',
  'subcutaneous': 'Applied under the skin, usually referring to an injection into the fat layer.',
  'reconstitution': 'The process of adding a liquid (solvent) to a dry substance (solute) to create a solution.',
  'synergy': 'The interaction of two or more agents to produce a combined effect greater than the sum of their separate effects.',
  'lipolysis': 'The breakdown of fats and other lipids by hydrolysis to release fatty acids.',
  'homeostasis': 'The tendency toward a relatively stable equilibrium between physiological elements.',
  'secretagogue': 'A substance that promotes secretion.',
  'half-life': 'The time taken for the radioactivity of a specified isotope to fall to half its original value.',
  'bioavailability': 'The proportion of a drug or other substance which enters the circulation when introduced into the body.',

  // Spanish
  'agonista': 'Sustancia que inicia una respuesta fisiológica al combinarse con un receptor.',
  'antagonista': 'Sustancia que interfiere o inhibe la acción fisiológica de otra.',
  'angiogénesis': 'El desarrollo de nuevos vasos sanguíneos.',
  'anabolismo': 'La síntesis de moléculas complejas en organismos vivos a partir de otras más simples.',
  'péptido': 'Molécula que consiste en dos o más aminoácidos unidos en cadena.',
  'liofilizado': 'Secado por congelación para su preservación y estabilidad.',
  'subcutáneo': 'Aplicado debajo de la piel, generalmente se refiere a una inyección en la capa de grasa.',
  'reconstitución': 'El proceso de añadir un líquido (solvente) a una sustancia seca (soluto) para crear una solución.',
  'sinergia': 'La interacción de dos o más agentes para producir un efecto combinado mayor que la suma de sus efectos por separado.',
  'lipólisis': 'La descomposición de grasas y otros lípidos para liberar ácidos grasos.',
  'homeostasis': 'Tendencia hacia un equilibrio relativamente estable entre los elementos fisiológicos.',
  'secretagogo': 'Sustancia que promueve la secreción.',
  'vida media': 'El tiempo necesario para que la concentración de una sustancia en el cuerpo se reduzca a la mitad.',
  'biodisponibilidad': 'La proporción de una sustancia que entra en la circulación cuando se introduce en el cuerpo.'
};
