 
/**
 * Hybrid Search Engine Logic
 * Combines keyword matching with semantic attribute weighting,
 * natural language intent detection, and beauty-specific boosters
 * for hair, skin, and acne recommendations.
 */


// ─── Protocol Index Finder ──────────────────────────────────────────────
// Supports blueprints v2.0 schema (single source of truth: 'blueprints' collection).
// Falls back gracefully to older flat-field schemas.
export const buildProtocolIndex = (templates) => {
  if (!templates || !Array.isArray(templates)) return [];
  return templates
    // Accept both schemas: legacy (protocol_id, protocol_title/name) and
    // actual Firestore export (id, overview_summary)
    .filter(t => {
      const hasId   = !!(t.protocol_id || t.id);
      const hasName = !!(t.protocol_title || t.name || t.overview_summary);
      return t && hasId && hasName;
    })
    .map(t => {
      const products = new Set();
      const meta = t.metadata || {};  // blueprints v2.0: nested metadata object

      // 1. blueprints v2.0: phase_blueprints[].drugs[]
      if (Array.isArray(t.phase_blueprints)) {
        t.phase_blueprints.forEach(phase => {
          if (Array.isArray(phase.drugs)) {
            phase.drugs.forEach(drug => {
              if (drug.product_title) products.add(drug.product_title.toLowerCase());
              if (drug.product_id)    products.add(drug.product_id.replace(/^prd_/, '').replace(/-/g, ' '));
            });
          }
        });
      }

      // 2. Legacy: flat phases[].drugs_used[]
      if (Array.isArray(t.phases)) {
        t.phases.forEach(phase => {
          if (Array.isArray(phase.drugs_used)) {
            phase.drugs_used.forEach(drug => {
              if (drug.product_slug)  products.add(drug.product_slug.replace(/-/g, ' '));
              if (drug.product_name)  products.add(drug.product_name.toLowerCase());
              if (drug.product_title) products.add(drug.product_title.toLowerCase());
            });
          }
        });
      }

      // 3. Legacy: flat top-level products_used[]
      if (Array.isArray(t.products_used)) {
        t.products_used.forEach(p => {
          if (typeof p === 'string') products.add(p.toLowerCase());
          else if (p?.name) products.add(p.name.toLowerCase());
          else if (p?.slug) products.add(p.slug.replace(/-/g, ' '));
        });
      }

      // Category: blueprints v2.0 uses metadata.primary_goal
      const category = meta.primary_goal || t.primary_goal || t.category || t.goal || '';

      // Duration: blueprints v2.0 phase_blueprints durations summed, or flat field
      let duration_weeks = t.protocol_duration_weeks || t.duration_weeks || 12;
      if (!t.protocol_duration_weeks && !t.duration_weeks && Array.isArray(t.phase_blueprints)) {
        duration_weeks = t.phase_blueprints.reduce((sum, p) => sum + (p.default_duration_weeks || 0), 0) || 12;
      }

      // Gather qualitative outcome descriptions for free-text matching
      const qualitativeOutcomes = [];
      const outcomesObj = t.expected_outcomes || {};
      if (Array.isArray(outcomesObj.qualitative)) {
        outcomesObj.qualitative.forEach(o => qualitativeOutcomes.push(o.toLowerCase()));
      }

      // Gather eligibility indication slugs (e.g. 'cognitive_fatigue_or_mental_fog')
      const indicationSlugs = [];
      const elRules = t.eligibility_rules || {};
      if (Array.isArray(elRules.indications)) {
        elRules.indications.forEach(ind => indicationSlugs.push(ind.replace(/_/g, ' ')));
      }

      return {
        protocol_id:    t.protocol_id  || t.id,
        protocol_slug:  t.protocol_slug || t.protocol_id || t.id,
        name:           t.protocol_title || t.name || t.overview_summary || '',
        overview:       t.overview_summary || t.protocol_title || t.name || '',
        category,
        tags: [
          category,
          meta.primary_goal,
          meta.primary_condition,
          t.primary_goal,
          t.category,
          ...(t.tags || []),
          ...indicationSlugs
        ].filter(Boolean),
        duration_weeks,
        products_used: Array.from(products),
        clinical_focus: meta.primary_condition ||
          t.clinical_focus ||
          t.description ||
          (t.protocol_description ? t.protocol_description.substring(0, 120) + '...' : ''),
        outcomes_text:   qualitativeOutcomes.join(' '),
        indications_text: indicationSlugs.join(' ')
      };
    });
};

// ─── FAQ Index Finder ─────────────────────────────────────────────────────
// Reads product_ids and protocol_ids directly from each FAQ document.
// No external mapping collection is needed.
export const buildFAQIndex = (faqs) => {
  if (!faqs) return [];
  return faqs.map(f => ({
    faq_id: f.faqId || f.id,
    question: f.question,
    short_answer: f.shortAnswer || (f.answer ? f.answer.substring(0, 120) + '...' : ''),
    category: f.category || f.categoryId,
    tags: f.tags || [],
    related_products: Array.isArray(f.product_ids) ? f.product_ids : [],
    related_protocols: Array.isArray(f.protocol_ids) ? f.protocol_ids : (f.relatedProtocols || []),
    active: f.active ?? true,
    visibility: f.visibility || 'public',
    is_global: f.isGlobal || false,
    answer: f.answer // Keep for full view
  }));
};

// ─── Natural Language Intent Map ───────────────────────────────────────────
// [Rest of content stays same...]
const INTENT_MAP = [
  // ── BEAUTY: SKIN ──
  { phrases: ["skin", "piel", "complexion", "radiance", "glow", "luminosity", "brighten", "improve skin", "mejorar piel", "face", "cara", "rostro"], goals: ["skin_health", "anti_aging"], boost: 6 },
  { phrases: ["wrinkle", "arrugas", "fine lines", "botox", "expression lines", "forehead lines", "anti-wrinkle"], goals: ["anti_wrinkle", "anti_aging"], boost: 8 },
  { phrases: ["collagen", "elasticity", "firmness", "elasticidad", "firmeza", "sagging", "tightening"], goals: ["skin_health", "anti_aging"], keywords: ["collagen", "skin elasticity"], boost: 7 },
  { phrases: ["wound", "scar", "cicatriz", "burn", "healing skin", "piel dañada"], goals: ["healing", "skin_health"], boost: 6 },
  { phrases: ["tan", "tanning", "bronceado", "melanin", "melanin", "sunless", "dark skin", "bronze"], goals: ["tanning", "skin_pigmentation"], boost: 8 },

  // ── BEAUTY: HAIR ──
  { phrases: ["hair", "pelo", "cabello", "hair loss", "crecimiento cabello", "caída de pelo", "alopecia", "thinning hair", "baldness", "calvicie", "hair growth"], goals: ["hair_growth", "anti_hair_loss"], boost: 10 },
  { phrases: ["scalp", "cuero cabelludo", "follicle", "folículo"], goals: ["hair_growth"], keywords: ["hair follicle", "scalp"], boost: 8 },

  // ── BEAUTY: ACNE ──
  { phrases: ["acne", "acné", "pimple", "grano", "pore", "poro", "blackhead", "comedone", "breakout", "brote", "rosacea"], goals: ["anti_acne", "antimicrobial", "anti_inflammatory"], boost: 9 },
  { phrases: ["sebum", "oil skin", "piel grasa", "oily", "excess oil"], goals: ["anti_acne"], keywords: ["sebum", "oil control"], boost: 7 },

  // ── WEIGHT & METABOLISM ──
  { phrases: ["weight loss", "fat loss", "perder peso", "adelgazar", "lose weight", "obesity", "obesidad", "diet", "dieta", "slim", "delgado"], goals: ["fat_loss", "metabolic_health"], boost: 7 },
  { phrases: ["belly fat", "visceral fat", "abdominal fat", "grasa abdominal", "grasa visceral", "gut fat"], goals: ["visceral_fat_loss", "fat_loss"], boost: 9 },
  { phrases: ["appetite", "hunger", "hambre", "cravings", "antojos", "suppress hunger"], goals: ["appetite_suppression", "metabolic_health"], boost: 6 },

  // ── MUSCLE / PERFORMANCE ──
  { phrases: ["muscle", "músculo", "strength", "fuerza", "bulk", "hypertrophy", "hipertrofia", "gains", "mass"], goals: ["muscle_growth", "muscle_hypertrophy", "strength_gain"], boost: 7 },
  { phrases: ["recovery", "recuperación", "soreness", "agujetas", "post workout"], goals: ["muscle_recovery", "healing", "recovery"], boost: 6 },
  { phrases: ["performance", "athletic", "sport", "deporte", "endurance", "resistencia"], goals: ["performance", "muscle_growth"], boost: 6 },

  // ── HEALING & REPAIR ──
  { phrases: ["heal", "curar", "repair", "reparar", "injury", "herida", "lesión", "tendon", "tendón", "ligament", "joint", "articulación"], goals: ["healing", "recovery", "injury_repair"], boost: 7 },
  { phrases: ["inflammation", "inflamación", "anti-inflammatory", "antiinflamatorio", "swelling", "hinchazón"], goals: ["inflammation_control", "healing"], boost: 6 },
  { phrases: ["gut", "intestino", "stomach", "estómago", "digestive", "digestion", "leaky gut", "intestinal"], goals: ["healing"], keywords: ["gut", "stomach", "intestinal"], boost: 7 },

  // ── ANTI-AGING / LONGEVITY ──
  { phrases: ["anti aging", "anti-aging", "antiaging", "antienvejecimiento", "longevity", "longevidad", "aging", "envejecimiento", "rejuvenation", "rejuvenecimiento"], goals: ["anti_aging", "longevity", "cellular_regeneration"], boost: 7 },
  { phrases: ["telomere", "telómero", "dna repair", "epigenetic", "epigenética", "nad", "nad+", "sirtuins"], goals: ["longevity", "anti_aging"], boost: 7 },

  // ── COGNITIVE / NEURO ──
  { phrases: ["brain", "cerebro", "memory", "memoria", "focus", "concentración", "cognitive", "cognitivo", "mental clarity", "claridad mental", "mental fog", "niebla mental", "alzheimer", "neuroprotection", "neurocognitive", "attention", "atención", "neuro"], goals: ["cognitive_enhancement", "neuroprotection", "focus", "cognitive_support"], boost: 8 },
  { phrases: ["mood", "estado de ánimo", "depression", "depresión", "anxiety", "ansiedad", "stress", "estrés"], goals: ["mood_enhancement", "stress_reduction"], boost: 6 },
  { phrases: ["sleep", "sueño", "dormir", "insomnia", "insomnio", "better sleep", "good sleep", "deep sleep", "sleep quality", "sleep support", "delta sleep", "improve sleep", "mejorar sueño"], goals: ["sleep_improvement", "sleep_quality", "sleep_optimization", "deep_sleep"], boost: 8 },

  // ── HORMONAL ──
  { phrases: ["testosterone", "testosterona", "hormone", "hormona", "libido", "sex drive", "fertility", "fertilidad"], goals: ["testosterone_support", "hormonal_balance", "sexual_health"], boost: 7 },
  { phrases: ["growth hormone", "hormona de crecimiento", "gh", "hgh", "igf"], goals: ["growth_hormone_release", "muscle_growth"], boost: 7 },

  // ── IMMUNE ──
  { phrases: ["immune", "inmune", "immunity", "inmunidad", "virus", "infection", "infecti", "defense", "defensa"], goals: ["immune_support", "immune_enhancement"], boost: 7 },
];

const STOP_WORDS = new Set([
  "i", "want", "need", "looking", "for", "find", "give", "me", "the", "a", "an",
  "quiero", "necesito", "busco", "dame", "para", "algo", "que", "ayude", "con", "de", "del", "en", "como", "esta", "este", "estos", "estas",
  "my", "mi", "el", "la", "los", "las", "is", "are", "and", "or", "to", "mí", "ti", "su",
  "help", "best", "good", "something", "recommend", "recommendation", "which", "what", "ayuda", "mejor", "bueno", "alguno", "una", "un", "unas", "unos"
]);

const QUESTION_INDICATORS = ["how", "why", "when", "where", "what", "which", "who", "whom", "whose", "can", "does", "should", "como", "cuándo", "donde", "qué", "quien", "por qué", " ?", "?"];

export const isQuestion = (query) => {
  if (!query) return false;
  const q = query.toLowerCase().trim();
  return QUESTION_INDICATORS.some(indicator => q.startsWith(indicator) || q.endsWith('?'));
};

const resolveIntents = (normalizedQuery, tokens) => {
  const matchedGoals = new Set();
  const matchedKeywords = new Set();
  let intentBoost = 0;
  const intentLabels = [];

  INTENT_MAP.forEach(({ phrases, goals, keywords, boost }) => {
    const matched = phrases.some(p => 
      normalizedQuery === p || 
      (p.length > 3 && normalizedQuery.includes(p)) || 
      tokens.some(t => t === p || (t.length > 3 && p.includes(t)))
    );
    if (matched) {
      goals.forEach(g => matchedGoals.add(g));
      if (keywords) keywords.forEach(k => matchedKeywords.add(k));
      intentBoost = Math.max(intentBoost, boost);
      intentLabels.push(...goals.map(g => g.replace(/_/g, ' ')));
    }
  });

  return { matchedGoals, matchedKeywords, intentBoost, intentLabels };
};

// ─── Main Search Function ───────────────────────────────────────────────────
export const searchProducts = (query, products, protocolIndex = []) => {
  if (!query || !query.trim()) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const rawTokens = normalizedQuery.split(/\s+/).filter(t => t.length >= 2);
  const tokens = rawTokens.filter(t => !STOP_WORDS.has(t)); 

  const { matchedGoals, matchedKeywords, intentBoost, intentLabels } = resolveIntents(normalizedQuery, tokens);

  const scoredResults = products.map(product => {
    const enrichedProduct = {
      ...product,
      goals: product.goals?.length > 0 ? product.goals : [],
      secondaryFactors: product.secondaryFactors?.length > 0 ? product.secondaryFactors : [],
      tags: product.tags?.length > 0 ? product.tags : [],
      mechanisms: product.mechanisms?.length > 0 ? product.mechanisms : [],
      semanticKeywords: product.semanticKeywords?.length > 0 ? product.semanticKeywords : [],
      synonyms: product.synonyms?.length > 0 ? product.synonyms : [],
    };

    let score = 0;
    const matchedThemes = new Set();

    // Use id as ultimate fallback so products with no name/displayName can still be found
    const searchTarget = (enrichedProduct.displayName || enrichedProduct.name || enrichedProduct.id || "").toLowerCase();
    if (searchTarget.includes(normalizedQuery)) {
      score += 12;
      if (searchTarget.startsWith(normalizedQuery)) score += 20; // Strong boost for name starts
      matchedThemes.add("Direct Match");
    }

    if (enrichedProduct.scientificName && enrichedProduct.scientificName.toLowerCase().includes(normalizedQuery)) {
      score += 10;
      matchedThemes.add("Scientific Match");
    }

    if (enrichedProduct.searchAliases) {
      enrichedProduct.searchAliases.forEach(alias => {
        if (typeof alias !== 'string') return;
        if (alias.toLowerCase() === normalizedQuery) {
          score += 10;
          matchedThemes.add("Alias Match");
        } else if (alias.toLowerCase().includes(normalizedQuery)) {
          score += 5;
        }
      });
    }

    tokens.forEach(token => {
      if (searchTarget.includes(token)) score += 4;
      if (enrichedProduct.scientificName && enrichedProduct.scientificName.toLowerCase().includes(token)) score += 4;
      if (enrichedProduct.category && enrichedProduct.category.toLowerCase().includes(token)) {
        score += 2;
        matchedThemes.add(enrichedProduct.category);
      }
    });

    if (enrichedProduct.goals && matchedGoals.size > 0) {
      enrichedProduct.goals.forEach(goal => {
        if (matchedGoals.has(goal)) {
          score += intentBoost;
          matchedThemes.add(goal.replace(/_/g, ' '));
        }
      });
    }

    // Also boost products whose secondaryFactors match the detected intent goals
    if (enrichedProduct.secondaryFactors && matchedGoals.size > 0) {
      enrichedProduct.secondaryFactors.forEach(factor => {
        if (matchedGoals.has(factor)) {
          score += Math.ceil(intentBoost * 0.6); // Slightly lower than primary goals
          matchedThemes.add(factor.replace(/_/g, ' '));
        }
      });
    }

    if (enrichedProduct.goals) {
      enrichedProduct.goals.forEach(goal => {
        const readable = goal.replace(/_/g, ' ');
        if (normalizedQuery.includes(readable) || tokens.some(t => goal.includes(t))) {
          score += 5;
          matchedThemes.add(readable);
        }
      });
    }

    if (enrichedProduct.secondaryFactors) {
      enrichedProduct.secondaryFactors.forEach(factor => {
        const readable = factor.replace(/_/g, ' ');
        if (normalizedQuery.includes(readable) || tokens.some(t => factor.includes(t))) {
          score += 3;
          matchedThemes.add(readable);
        }
      });
    }

    if (enrichedProduct.semanticKeywords) {
      enrichedProduct.semanticKeywords.forEach(kw => {
        if (normalizedQuery.includes(kw) || tokens.some(t => kw.includes(t)) || matchedKeywords.has(kw)) {
          score += 4;
          matchedThemes.add(kw);
        }
      });
    }
    if (enrichedProduct.synonyms) {
      enrichedProduct.synonyms.forEach(syn => {
        if (normalizedQuery.includes(syn) || tokens.some(t => syn.includes(t))) {
          score += 4;
          matchedThemes.add(syn);
        }
      });
    }

    if (enrichedProduct.tags) {
      enrichedProduct.tags.forEach(tag => {
        if (normalizedQuery.includes(tag.toLowerCase()) || tokens.some(t => tag.toLowerCase().includes(t))) {
          score += 2;
          matchedThemes.add(tag);
        }
      });
    }

    if (enrichedProduct.mechanisms) {
      enrichedProduct.mechanisms.forEach(mech => {
        const mechLower = mech.toLowerCase();
        if (normalizedQuery.includes(mechLower) || tokens.some(t => mechLower.includes(t))) {
          score += 2;
          matchedThemes.add(mech);
        }
      });
    }

    if (enrichedProduct.desc && (enrichedProduct.desc.toLowerCase().includes(normalizedQuery) || tokens.some(t => enrichedProduct.desc.toLowerCase().includes(t)))) {
      score += 1;
    }

    // New: Boost protocols mentioning this product
    const protocolsUsingThis = protocolIndex.filter(p => 
      p.products_used?.some(pu => pu.toLowerCase().includes(searchTarget.substring(0, 10)))
    ).length;
    
    if (protocolsUsingThis > 0) {
      score += Math.min(protocolsUsingThis, 3);
    }

    return {
      ...enrichedProduct,
      searchScore: score,
      protocolCount: protocolsUsingThis,
      detectedThemes: [...Array.from(matchedThemes), ...intentLabels]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 6)
    };
  });

  const sortedResults = scoredResults
    .filter(res => res.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore);

  const uniqueFamilies = new Map();

  sortedResults.forEach(product => {
    const normalizedName = (product.name || product.displayName || "").toLowerCase().trim();
    if (!normalizedName) return;

    if (!uniqueFamilies.has(normalizedName)) {
      const allFamilyMembers = products.filter(p => 
        (p.name || p.displayName || "").toLowerCase().trim() === normalizedName
      );

      // Collect strengths from: 1) top-level dosage/strength fields,
      // 2) already-populated allStrengths, 3) subcollection variants array
      const strengths = new Set();
      allFamilyMembers.forEach(p => {
        if (p.dosage) strengths.add(p.dosage);
        if (p.strength) strengths.add(p.strength);
        if (Array.isArray(p.allStrengths)) p.allStrengths.forEach(s => strengths.add(s));
        if (Array.isArray(p.variants)) {
          p.variants.forEach(v => {
            if (v.strength) strengths.add(v.strength);
            if (v.dosage) strengths.add(v.dosage);
            if (v.label) strengths.add(v.label);
          });
        }
      });
      // Also include any strengths already on the scored product itself
      if (Array.isArray(product.allStrengths)) product.allStrengths.forEach(s => strengths.add(s));
      if (Array.isArray(product.variants)) {
        product.variants.forEach(v => {
          if (v.strength) strengths.add(v.strength);
          if (v.dosage) strengths.add(v.dosage);
          if (v.label) strengths.add(v.label);
        });
      }

      const allStrengthsArr = Array.from(strengths).filter(Boolean);
      uniqueFamilies.set(normalizedName, {
        ...product,
        strengthCount: allStrengthsArr.length > 0 ? allStrengthsArr.length : 1,
        allStrengths: allStrengthsArr
      });
    }
  });

  return Array.from(uniqueFamilies.values());
};

// ─── Protocol Search Function ─────────────────────────────────────────────
export const searchProtocols = (query, protocolIndex = []) => {
  if (!query || !query.trim() || !protocolIndex.length) return [];
  const normalizedQuery = query.toLowerCase().trim();
  const tokens = normalizedQuery.split(/\s+/).filter(t => t.length >= 2 && !STOP_WORDS.has(t));

  return protocolIndex.map(protocol => {
    let score = 0;
    const { name, category, tags, products_used, clinical_focus, overview, outcomes_text, indications_text } = protocol;

    const safeName = (name || '').toLowerCase();
    const safeOverview = (overview || '').toLowerCase();
    const safeCategory = (category || '').toLowerCase();
    const safeFocus = (clinical_focus || '').toLowerCase();
    const safeOutcomes = (outcomes_text || '').toLowerCase();
    const safeIndications = (indications_text || '').toLowerCase();
    const safeTags = Array.isArray(tags) ? tags : [];
    const safeProducts = Array.isArray(products_used) ? products_used : [];

    // Exact protocol title match
    if (safeName === normalizedQuery) score += 100;
    // Partial title match
    if (safeName.includes(normalizedQuery)) score += 50;
    // Overview summary match
    if (safeOverview.includes(normalizedQuery)) score += 30;

    // Token-level scoring for multi-word queries
    tokens.forEach(token => {
      if (safeName.includes(token)) score += 15;
      if (safeOverview.includes(token)) score += 10;
      if (safeCategory.includes(token)) score += 10;
      if (safeFocus.includes(token)) score += 6;
      if (safeOutcomes.includes(token)) score += 5;
      if (safeIndications.includes(token)) score += 5;
      if (safeTags.some(tag => (tag || '').toLowerCase().includes(token))) score += 8;
      if (safeProducts.some(p => (p || '').toLowerCase().includes(token))) score += 8;
    });

    // Full-query matches for secondary fields
    if (safeTags.some(tag => (tag || '').toLowerCase().includes(normalizedQuery))) score += 30;
    if (safeProducts.some(p => (p || '').toLowerCase().includes(normalizedQuery))) score += 20;
    if (safeCategory.includes(normalizedQuery)) score += 15;
    if (safeFocus.includes(normalizedQuery)) score += 10;

    // Intent matching via INTENT_MAP
    const { matchedGoals } = resolveIntents(normalizedQuery, tokens);
    if (matchedGoals.size > 0) {
      safeTags.forEach(tag => {
        if (matchedGoals.has(tag) || matchedGoals.has(tag?.replace(/ /g, '_'))) score += 12;
      });
      if (matchedGoals.has(safeCategory) || matchedGoals.has(safeCategory.replace(/ /g, '_'))) score += 12;
    }

    return { ...protocol, searchScore: score };
  })
  .filter(p => p.searchScore > 0)
  .sort((a, b) => b.searchScore - a.searchScore)
  .slice(0, 5);
};

// ─── Supplement Search Function ───────────────────────────────────────────
/**
 * Search the supplements catalogue.
 * Reuses the same INTENT_MAP / token scoring machinery as searchProducts.
 * Returns up to 8 best-matching supplements sorted by score.
 *
 * @param {string}   query       - Raw user query
 * @param {Array}    supplements - Array of supplement objects from supplements.js
 * @returns {Array}              - Scored, sorted supplement objects
 */
export const searchSupplements = (query, supplements = []) => {
  if (!query || !query.trim() || !supplements.length) return [];

  const normalizedQuery = query.toLowerCase().trim();
  const rawTokens = normalizedQuery.split(/\s+/).filter(t => t.length >= 2);
  const tokens = rawTokens.filter(t => !STOP_WORDS.has(t));

  const { matchedGoals, matchedKeywords, intentBoost } = resolveIntents(normalizedQuery, tokens);

  const scored = supplements.map(supp => {
    let score = 0;

    const safeName     = (supp.name     || '').toLowerCase();
    const safeCat      = (supp.category || '').toLowerCase();
    const safeObj      = (supp.objective|| '').toLowerCase();
    const safeDesc     = (supp.desc     || '').toLowerCase();
    const safeGoals    = Array.isArray(supp.goals)            ? supp.goals            : [];
    const safeTags     = Array.isArray(supp.tags)             ? supp.tags             : [];
    const safeKws      = Array.isArray(supp.semanticKeywords) ? supp.semanticKeywords : [];
    const safeSyns     = Array.isArray(supp.synonyms)         ? supp.synonyms         : [];
    const safeMechs    = Array.isArray(supp.mechanisms)       ? supp.mechanisms       : [];
    const safeBenefits = Array.isArray(supp.clinical_benefits)? supp.clinical_benefits: [];

    // ── Exact / prefix name match ──
    if (safeName === normalizedQuery)          { score += 100; }
    else if (safeName.startsWith(normalizedQuery)) { score += 50; }
    else if (safeName.includes(normalizedQuery))   { score += 30; }

    // ── Category / objective ──
    if (safeCat.includes(normalizedQuery)) score += 15;
    if (safeObj.includes(normalizedQuery)) score += 10;

    // ── Token-level scoring ──
    tokens.forEach(token => {
      if (safeName.includes(token))  score += 8;
      if (safeCat.includes(token))   score += 5;
      if (safeObj.includes(token))   score += 4;
      if (safeDesc.includes(token))  score += 2;
      safeTags.forEach(tag => { if ((tag || '').toLowerCase().includes(token)) score += 3; });
      safeKws.forEach(kw  => { if ((kw  || '').toLowerCase().includes(token)) score += 3; });
      safeSyns.forEach(syn => { if ((syn || '').toLowerCase().includes(token)) score += 5; });
      safeMechs.forEach(m  => { if ((m   || '').toLowerCase().includes(token)) score += 2; });
      safeBenefits.forEach(b => { if ((b  || '').toLowerCase().includes(token)) score += 2; });
    });

    // ── Intent / goal matching ──
    if (matchedGoals.size > 0) {
      safeGoals.forEach(goal => {
        if (matchedGoals.has(goal) || matchedGoals.has(goal.replace(/ /g, '_'))) {
          score += intentBoost;
        }
      });
      safeTags.forEach(tag => {
        const t = (tag || '').toLowerCase().replace(/ /g, '_');
        if (matchedGoals.has(t)) score += 4;
      });
    }

    // ── Semantic keyword boost ──
    safeKws.forEach(kw => {
      const k = (kw || '').toLowerCase();
      if (normalizedQuery.includes(k) || matchedKeywords.has(k)) score += 4;
    });

    return { ...supp, searchScore: score };
  });

  // Deduplicate by name (keep highest-scoring variant)
  const byName = new Map();
  scored
    .filter(s => s.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .forEach(s => {
      const key = (s.name || '').toLowerCase().trim();
      if (!byName.has(key)) byName.set(key, s);
    });

  return Array.from(byName.values()).slice(0, 8);
};

// ─── FAQ Search Function ──────────────────────────────────────────────────
export const searchFAQ = (query, faqIndex, isProfessional = false) => {
  if (!query || !faqIndex?.length) return [];

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => w.length >= 2 && !STOP_WORDS.has(w));
  const questionBoost = isQuestion(query) ? 1.5 : 1.0;

  const visibleItems = faqIndex.filter(
    (faq) => faq.active && (faq.visibility === 'public' || isProfessional)
  );

  const scored = visibleItems.map((faq) => {
    let score = 0;

    // Global items get a baseline visibility boost
    if (faq.is_global) score += 1;

    const searchFields = [
      faq.question || '',
      faq.short_answer || '',
      faq.answer || '',
      ...(faq.tags || []),
    ].map((f) => f.toLowerCase());

    const combined = searchFields.join(' ');

    // Exact query match in question/answer
    if (combined.includes(q)) score += 10;

    // Word-level scoring
    words.forEach((word) => {
      if (combined.includes(word)) score += 2;
    });

    // ── Product-relevance logic ──────────────────────────────────────────────
    const hasRelatedProducts = Array.isArray(faq.related_products) && faq.related_products.length > 0;

    if (hasRelatedProducts) {
      let productBoost = 0;
      let productMatch = false;

      faq.related_products.forEach(pid => {
        const pidLower = (pid || '').toLowerCase();
        // Strong boost: query mentions this product directly
        if (q.includes(pidLower) || pidLower.includes(q)) {
          productBoost += 12;
          productMatch = true;
        }
        // Partial token match
        else if (words.some(w => pidLower.includes(w) || w.includes(pidLower.substring(0, 6)))) {
          productBoost += 4;
        }
      });

      score += productBoost;

      // Penalize product-specific FAQs when the query is about a different product
      // (i.e., score > 0 from text but no product match)
      if (!productMatch && score > 0 && !faq.is_global) {
        score = Math.max(0, score - 6);
      }
    }

    return { ...faq, searchScore: score * questionBoost };
  });

  return scored
    .filter((f) => f.searchScore > 0)
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, 10);
};

export const getSearchThemes = (results) => {
  if (!results || results.length === 0) return [];
  const themes = new Set();
  results.slice(0, 5).forEach(res => {
    if (res.detectedThemes) {
      res.detectedThemes.forEach(t => themes.add(t));
    }
  });
  return Array.from(themes).slice(0, 8);
};


