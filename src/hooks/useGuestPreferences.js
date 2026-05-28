/**
 * useGuestPreferences.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Cookie-based guest preference system.
 *
 * Cookie name: rp_guest_prefs
 * Expiry: 90 days
 * Storage: JSON-encoded string, no PII — only behavioral preferences
 *
 * Preference shape:
 * {
 *   goal:            string
 *   context:         string
 *   experienceLevel: string
 *   preferences:     string[]
 *   visitCount:      number
 *   lastVisit:       string
 *   firstVisit:      string
 * }
 */

import { useState, useCallback, useEffect } from 'react';

const COOKIE_NAME  = 'rp_guest_prefs';
const EXPIRY_DAYS  = 90;

// ── Cookie helpers ────────────────────────────────────────────────────────────

function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))};expires=${d.toUTCString()};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const match = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match.split('=').slice(1).join('=')));
  } catch {
    return null;
  }
}

function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// ── Goal → AI seed phrase mapping ─────────────────────────────────────────────

export const GOAL_META = {
  recovery:    { label: 'Recovery & Repair',   icon: '🔬', color: '#22d3ee' },
  longevity:   { label: 'Longevity',           icon: '🧬', color: '#34d399' },
  cognitive:   { label: 'Cognitive & Mood',    icon: '🧠', color: '#f59e0b' },
  sleep:       { label: 'Sleep & Circadian',   icon: '🌙', color: '#818cf8' },
  metabolic:   { label: 'Metabolic Health',    icon: '⚡', color: '#a78bfa' },
  performance: { label: 'Athletic Performance',icon: '💪', color: '#f97316' },
  hormonal:    { label: 'Hormonal Balance',    icon: '⚖️', color: '#ec4899' },
  explore:     { label: 'Explore / Not sure',  icon: '🧭', color: 'var(--color-text-tertiary)' },
};

export const LEVEL_META = {
  never:        { label: 'Never',                icon: '🌱' },
  beginner:     { label: 'Beginner',             icon: '📖' },
  intermediate: { label: 'Intermediate',         icon: '🔬' },
  advanced:     { label: 'Advanced',             icon: '🎓' },
  professional: { label: 'Clinical professional',icon: '⚕️' },
};

export const PREFERENCE_OPTIONS = [
  { id: 'efficacy', label: 'Max Efficacy' },
  { id: 'safety', label: 'High Safety Margin' },
  { id: 'convenience', label: 'Easy Protocol (Pills/Drops)' },
  { id: 'budget', label: 'Budget Friendly' },
  { id: 'fast', label: 'Fast Results' },
];

export const CONTEXT_QUICK_CHIPS = [
  'Better sleep', 'Lose fat', 'Build muscle', 'More energy',
  'Fix joints', 'Brain fog', 'Anti-aging', 'Gut health'
];

export const GOAL_DRAWER_DETAILS = {
  'Muscle Growth & Recovery': {
    pathway: 'Mecanismo de Reconstrucción Muscular y Reparación de Tejidos',
    description: 'La modulación de la curación de tejidos blandos y la síntesis proteica se investiga principalmente a través de la estimulación de fibroblastos, la expresión de colágeno de tipo I/III y la activación de células satélite para la regeneración miofibrilar tras microrroturas inducidas.',
    peptides: [
      { name: 'BPC-157', slug: 'bpc-157', desc: 'Promueve la angiogénesis y curación de tendones, ligamentos y músculo.' },
      { name: 'TB-500', slug: 'tb-500', desc: 'Regula la actina, facilitando la migración celular y la reparación celular sistémica.' },
      { name: 'Ipamorelin', slug: 'ipamorelin', desc: 'Estimulador selectivo de la hormona del crecimiento para la síntesis de colágeno.' }
    ],
    category: 'Recovery & Repair'
  },
  'Fat Loss & Metabolic Health': {
    pathway: 'Vía Metabólica, Lipólisis y Regulación de Glucosa',
    description: 'Investiga la activación selectiva de los receptores de GLP-1 y el incremento de la tasa metabólica basal. Los péptidos en esta categoría modulan la secreción de insulina, retardan el vaciamiento gástrico y estimulan la movilización de ácidos grasos del tejido adiposo blanco.',
    peptides: [
      { name: 'Tirzepatide', slug: 'tirzepatide', desc: 'Co-agonista dual de receptores GIP y GLP-1 para modulación metabólica.' },
      { name: 'Semaglutide', slug: 'semaglutide', desc: 'Agonista de receptores de GLP-1 con alta estabilidad farmacocinética.' },
      { name: 'AOD-9604', slug: 'aod-9604', desc: 'Fraccionario de HGH que promueve la lipólisis sin efectos glucémicos.' }
    ],
    category: 'Metabolic & Weight'
  },
  'Cognitive Performance & Focus': {
    pathway: 'Plasticidad Sináptica y Neuroprotección Cognitiva',
    description: 'Se centra en la expresión del factor neurotrófico derivado del cerebro (BDNF) y del factor de crecimiento nervioso (NGF). Estimula la potenciación a largo plazo (LTP), modula la neurotransmisión colinérgica y protege las neuronas del estrés oxidativo.',
    peptides: [
      { name: 'Semax', slug: 'semax', desc: 'Aumenta los niveles de BDNF y mejora la microcirculación cerebral.' },
      { name: 'Selank', slug: 'selank', desc: 'Modula la actividad GABAérgica para reducir el estrés sin sedación.' },
      { name: 'Dihexa', slug: 'dihexa', desc: 'Facilita la sinaptogénesis de alta afinidad para la memoria a largo plazo.' }
    ],
    category: 'Cognitive & Mood'
  },
  'Longevity & Biological Repair': {
    pathway: 'Mantenimiento Telomérico y Senescencia Celular',
    description: 'Estudio de la activación de la telomerasa, reducción de la senescencia celular y estimulación de la autofagia. Estos compuestos ayudan a regular los ritmos circadianos epigenéticos y la integridad del ADN celular.',
    peptides: [
      { name: 'Epithalon', slug: 'epithalon', desc: 'Péptido pineal regulador de la telomerasa y la producción de melatonina.' },
      { name: 'GHK-Cu', slug: 'ghk-cu', desc: 'Complejo de cobre implicado en la remodelación tisular y transcripción génica.' },
      { name: 'CJC-1295', slug: 'cjc-1295', desc: 'Análogo de GHRH de acción prolongada para la regeneración celular sistémica.' }
    ],
    category: 'Longevity & Anti-Aging'
  },
  'Hormonal Vitality & Balance': {
    pathway: 'Optimización de Ejes Endocrinos y Vitalidad Física',
    description: 'Explora la regulación de la secreción pulsátil de la hormona del crecimiento y la activación de receptores de melanocortina para mejorar la energía física, el rendimiento cardiovascular y el equilibrio neuroendocrino general.',
    peptides: [
      { name: 'Sermorelin', slug: 'sermorelin', desc: 'Secretagogo de HGH de alta pureza que emula la GHRH endógena.' },
      { name: 'PT-141', slug: 'pt-141', desc: 'Agonista de melanocortina MC4R con impacto en el deseo y la vitalidad física.' },
      { name: 'Ipamorelin', slug: 'ipamorelin', desc: 'Estimulador altamente específico de la hormona del crecimiento con mínimos efectos colaterales.' }
    ],
    category: 'Hormonal Optimization'
  },
  'Skin, Hair & Cellular Health': {
    pathway: 'Síntesis de Colágeno y Mantenimiento de la Barrera Cutánea',
    description: 'Enfoque en la síntesis de colágeno tipo I, III y IV, la proliferación de queratinocitos y la modulación de metaloproteinasas para restaurar la densidad capilar y elasticidad de la piel.',
    peptides: [
      { name: 'GHK-Cu', slug: 'ghk-cu', desc: 'Estimulador de colágeno y elastina con potentes propiedades de reparación tisular.' },
      { name: 'KPV', slug: 'kpv', desc: 'Tripéptido antiinflamatorio derivado de alfa-MSH para la salud de barreras.' },
      { name: 'BPC-157', slug: 'bpc-157', desc: 'Acelera la curación microvascular y de fibroblastos dérmicos.' }
    ],
    category: 'Recovery & Repair'
  },
  'Immune Function & Defense': {
    pathway: 'Inmunomodulación Celular y Defensa Adaptativa',
    description: 'Investiga la maduración de células T a nivel tímico, la modulación de citocinas inflamatorias y la producción de péptidos antimicrobianos endógenos para optimizar la resiliencia celular.',
    peptides: [
      { name: 'Thymosin Alpha-1', slug: 'thymosin-alpha-1', desc: 'Inmunomodulador peptídico que estimula la respuesta celular adaptativa.' },
      { name: 'BPC-157', slug: 'bpc-157', desc: 'Protección citoprotectora y modulación de la respuesta inflamatoria.' },
      { name: 'LL-37', slug: 'll-37', desc: 'Péptido antimicrobiano humano implicado en la defensa inmune innata.' }
    ],
    category: 'Immune Support'
  },
  'Better Sleep & Circadian Restoration': {
    pathway: 'Modulación Circadiana y Sueño Delta de Reparación',
    description: 'Estudio de la modulación de las ondas delta de sueño lento y la regulación del marcapasos circadiano central (núcleo supraquiasmático). Promueve la restauración celular profunda nocturna.',
    peptides: [
      { name: 'DSIP', slug: 'dsip', desc: 'Péptido inductor del sueño delta que regula ritmos de secreción endocrina.' },
      { name: 'Epitalon', slug: 'epithalon', desc: 'Restaura la producción de melatonina pineal y regula la actividad circadiana.' },
      { name: 'Selank', slug: 'selank', desc: 'Ayuda a regular los niveles de serotonina para la relajación reparadora.' }
    ],
    category: 'Sleep & Circadian'
  }
};


export const CLINICAL_AI_CONTEXTS = {
  'intro':
    'I want to embark on a wonderful research journey to optimize my health! ' +
    'Please act as an extremely warm, friendly, and welcoming clinical assistant. ' +
    'Explain to me what you can offer in general to guide me on this beautiful journey. ' +
    'Provide a highly visual, encouraging, and clear overview of our 8 Optimization Paths. ' +
    'Use beautiful markdown formatting with distinct sections, bullet points, and welcoming icons for each path:\n\n' +
    '*   🏋️ **Muscle Growth & Recovery**: Designed to support muscle rebuilding, strength, and active tissue healing.\n' +
    '*   ⚡ **Fat Loss & Metabolic Health**: Focused on cellular metabolic rate, glucose control, and clean biological energy.\n' +
    '*   🧠 **Cognitive Performance & Focus**: Geared toward memory retention, synaptogenesis, and clearing away brain fog.\n' +
    '*   🧬 **Longevity & Biological Repair**: Targeting cellular rejuvenation, repair, and optimal biological age.\n' +
    '*   ⚖️ **Hormonal Vitality & Balance**: Harmonizing natural endocrine systems and systemic physical vitality.\n' +
    '*   🧴 **Skin, Hair & Cellular Health**: Supporting dermal elasticity, hair follicle density, and structural collagen restoration.\n' +
    '*   🛡️ **Immune Function & Defense**: Strengthening systemic defense response and cell-mediated immunity.\n' +
    '*   🌙 **Better Sleep & Circadian Restoration**: Supporting deep delta-wave sleep, circadian rhythm synchronization, and nighttime cellular restoration.\n\n' +
    'Conclude by warmly encouraging me to click on any of the specific goal cards in the lifestyle strip to discover their detailed protocols! ' +
    'Keep the language extremely simple, welcoming, and inspiring for a beginner!',

  'Muscle Growth & Recovery': 
    'I want to explore a protocol focused on **Muscle Growth & Recovery**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a simple, inspiring, and non-technical introduction to tissue repair and strength enhancement. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [BPC-157](/product/bpc-157), [TB-500](/product/tb-500), and [Ipamorelin](/product/ipamorelin) (or [Sermorelin](/product/sermorelin)).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Advanced Recovery Protocol](/protocol/recovery-starter) or [Reconstitution Guide](/protocol/reconstitution-guide)).\n' +
    '3. **Synergistic Supplements:** Mention complementary store supplements in simple terms with links (e.g., [Creatine or Coenzyme Q10](/supplements/coq10) or [NMN](/supplements/nmn)).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.',

  'Fat Loss & Metabolic Health':
    'I want to explore a protocol focused on **Fat Loss & Metabolic Health**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a simple, inspiring, and non-technical introduction to metabolic optimization, lipid mobilization, and natural energy. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [Tirzepatide](/product/tirzepatide), [Semaglutide](/product/semaglutide), and [AOD-9604](/product/aod-9604).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Advanced Metabolic Protocol](/protocol/fat-loss) or [Fat Loss Protocol](/protocol/metabolic-health)).\n' +
    '3. **Synergistic Supplements:** Mention complementary store supplements in simple terms with links (e.g., [Berberina](/supplements/berberine) or [NMN](/supplements/nmn)).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.',

  'Cognitive Performance & Focus':
    'I want to explore a protocol focused on **Cognitive Performance & Focus**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a simple, inspiring, and non-technical introduction to mental clarity, memory support, and brain performance. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [Semax](/product/semax), [Selank](/product/selank), and [Dihexa](/product/dihexa).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Simple Nootropic Protocol](/protocol/cognitive-simple) or [Mental Clarity Protocol](/protocol/brain-performance)).\n' +
    '3. **Synergistic Supplements:** Mention complementary store supplements in simple terms with links (e.g., [Melatonin](/supplements/melatonin) or [NMN](/supplements/nmn)).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.',

  'Longevity & Biological Repair':
    'I want to explore a protocol focused on **Longevity & Biological Repair**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a simple, inspiring, and non-technical introduction to cellular repair, healthy aging, and longevity. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [Epithalon](/product/epithalon), [GHK-Cu](/product/ghk-cu), and [CJC-1295](/product/cjc-1295).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Cellular Longevity Protocol](/protocol/longevity-essentials) or [Anti-Aging Protocol](/protocol/anti-aging)).\n' +
    '3. **Synergistic Supplements:** Mention complementary store supplements in simple terms with links (e.g., [NMN](/supplements/nmn), [Resveratrol](/supplements/resveratrol), or [Berberina](/supplements/berberine)).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.',

  'Hormonal Vitality & Balance':
    'I want to explore a protocol focused on **Hormonal Vitality & Balance**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a simple, inspiring, and non-technical introduction to endocrine health, physical vitality, and biological balance. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [Sermorelin](/product/sermorelin), [PT-141](/product/pt-141), and [Ipamorelin](/product/ipamorelin).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Hormonal Vitality Protocol](/protocol/hormonal-balance) or [Secretagogues Protocol](/protocol/gh-axis)).\n' +
    '3. **Synergistic Supplements:** Mention complementary store supplements in simple terms with links (e.g., [DHEA](/supplements/dhea) or [NMN](/supplements/nmn)).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.',

  'Skin, Hair & Cellular Health':
    'I want to explore a protocol focused on **Skin, Hair & Cellular Health**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a simple, inspiring, and non-technical introduction to collagen synthesis, dermal restoration, and glowing cellular health. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [GHK-Cu](/product/ghk-cu), [KPV](/product/kpv), and [BPC-157](/product/bpc-157).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Aesthetic Health Protocol](/protocol/skin-hair-health) or [Cellular Repair Protocol](/protocol/cellular-repair)).\n' +
    '3. **Synergistic Supplements:** Mention complementary store supplements in simple terms with links (e.g., [Hydrolyzed Collagen](/supplements/collagen) or [NMN](/supplements/nmn)).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.',

  'Immune Function & Defense':
    'I want to explore a protocol focused on **Immune Function & Defense**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a simple, inspiring, and non-technical introduction to immune resilience, cellular defense, and natural strength. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [Thymosin Alpha-1](/product/thymosin-alpha-1) (TA1), [BPC-157](/product/bpc-157), and [LL-37](/product/ll-37).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Immune Defense Protocol](/protocol/immune-defense) or [Thymus Protocol](/protocol/thymus-protocol)).\n' +
    '3. **Synergistic Supplements:** Mention complementary store supplements in simple terms with links (e.g., [Berberina](/supplements/berberine) or [Vitamins](/supplements/vitamins)).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.',

  'Better Sleep & Circadian Restoration':
    'I want to explore a protocol focused on **Better Sleep & Circadian Restoration**. ' +
    'Please provide a warm, highly friendly, and easily understandable guide in English. ' +
    'START with a slightly more detailed, inspiring, and non-technical explanation of circadian rhythms, deep delta-wave sleep, and how sleep acts as the foundation for all cellular repair. ' +
    'The report must be beautifully organized, friendly, and include:\n\n' +
    '1. **Favorite Peptides (exactly 3):** Describe their key benefits in clear, simple terms, with links: [DSIP](/product/dsip), [Epitalon](/product/epitalon), and [Selank](/product/selank) (or [Ipamorelin](/product/ipamorelin) / [Sermorelin](/product/sermorelin)).\n' +
    '2. **Recommended Protocols:** Explain accessibly how they are structured and link to the protocol (e.g., [Circadian Sleep Protocol](/protocol/sleep-circadian-6w) or [Sleep Restoration Protocol](/protocol/sleep-restoration-8w)).\n' +
    '3. **Synergistic Supplements & Cofactors:** Mention complementary store supplements in simple terms with links (e.g., [Magnesium L-Threonate](/supplements/magnesium-l-threonate), [L-Theanine](/supplements/l-theanine), or [NMN](/supplements/nmn) for circadian clock genes).\n\n' +
    'Ensure the tone is motivating, supportive, easily readable, and extremely clear.'
};

// ── Main hook ─────────────────────────────────────────────────────────────────

export default function useGuestPreferences() {
  const [prefs, setPrefsState] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read cookie on mount
  useEffect(() => {
    const stored = getCookie(COOKIE_NAME);
    if (stored) {
      // Increment visit count
      const updated = {
        ...stored,
        visitCount: (stored.visitCount || 1) + 1,
        lastVisit: new Date().toISOString().split('T')[0],
      };
      setCookie(COOKIE_NAME, updated, EXPIRY_DAYS);
      setPrefsState(updated);
    }
    setIsLoaded(true);
  }, []);

  // Generate seed query from complete context
  const generateAiSeedQuery = (p) => {
    let query = `I am a user seeking protocol recommendations. `;
    if (p.goal && p.goal !== 'explore') {
      const g = GOAL_META[p.goal]?.label || p.goal;
      query += `My primary goal is "${g}". `;
    }
    if (p.context) {
      query += `Context: "${p.context}". `;
    }
    if (p.experienceLevel) {
      const e = LEVEL_META[p.experienceLevel]?.label || p.experienceLevel;
      query += `My experience level with peptides/protocols is: ${e}. `;
    }
    if (p.preferences && p.preferences.length > 0) {
      const prefLabels = p.preferences.map(id => PREFERENCE_OPTIONS.find(o => o.id === id)?.label || id);
      query += `What matters most to me: ${prefLabels.join(', ')}.`;
    }
    return query;
  };

  // Save preferences
  const savePrefs = useCallback((newPrefs) => {
    const existing = getCookie(COOKIE_NAME) || {};
    const full = {
      ...existing,
      ...newPrefs,
      visitCount: existing.visitCount || 1,
      firstVisit: existing.firstVisit || new Date().toISOString().split('T')[0],
      lastVisit:  new Date().toISOString().split('T')[0],
    };
    setCookie(COOKIE_NAME, full, EXPIRY_DAYS);
    setPrefsState(full);

    // Seed ClinicalAI for this session
    const seed = generateAiSeedQuery(full);
    sessionStorage.setItem('ai_seed_query', seed);
  }, []);

  // Clear preferences
  const clearPrefs = useCallback(() => {
    deleteCookie(COOKIE_NAME);
    setPrefsState(null);
    sessionStorage.removeItem('ai_seed_query');
  }, []);

  // Derived state
  const isReturning = Boolean(prefs && (prefs.visitCount || 0) > 1);
  const hasCompleted = Boolean(prefs?.goal && prefs?.experienceLevel);
  const goalMeta     = prefs?.goal ? GOAL_META[prefs.goal] : null;
  const levelMeta    = prefs?.experienceLevel ? LEVEL_META[prefs.experienceLevel] : null;

  // Personalized search chips based on preferences
  const getPersonalizedChips = useCallback(() => {
    if (!prefs?.goal) return null;
    const meta = GOAL_META[prefs.goal];
    if (!meta) return null;

    const levelHint = prefs.experienceLevel === 'beginner' || prefs.experienceLevel === 'never' ? 'beginner ' 
                    : prefs.experienceLevel === 'advanced' || prefs.experienceLevel === 'professional' ? 'advanced ' : '';
    
    return [
      { label: meta.label },
      { label: `${levelHint}${prefs.goal} stack` },
      { label: `Best peptides for ${prefs.goal}` },
      { label: 'Ask ClinicalAI for my goal' },
    ].slice(0, 5);
  }, [prefs]);

  return {
    prefs,
    isLoaded,
    isReturning,
    hasCompleted,
    goalMeta,
    levelMeta,
    savePrefs,
    clearPrefs,
    getPersonalizedChips,
    GOAL_META,
    LEVEL_META,
    PREFERENCE_OPTIONS,
    CONTEXT_QUICK_CHIPS,
  };
}
