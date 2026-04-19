/**
 * Hybrid Search Engine Logic
 * Combines keyword matching with semantic attribute weighting,
 * natural language intent detection, and beauty-specific boosters
 * for hair, skin, and acne recommendations.
 */

import { products as staticProducts } from '../data/products.js';
// ─── Protocol Index Builder ──────────────────────────────────────────────
export const buildProtocolIndex = (templates) => {
  if (!templates || !Array.isArray(templates)) return [];
  return templates.map(t => {
    const products = new Set();
    if (t.phases) {
      t.phases.forEach(phase => {
        if (phase.drugs_used) {
          phase.drugs_used.forEach(drug => {
            if (drug.product_slug) products.add(drug.product_slug.replace(/-/g, ' '));
          });
        }
      });
    }
    
    return {
      protocol_id: t.protocol_id,
      name: t.protocol_title || '',
      category: t.primary_goal || '',
      tags: [t.primary_goal, ...(t.tags || [])].filter(Boolean),
      duration_weeks: t.protocol_duration_weeks || 12,
      products_used: Array.from(products),
      clinical_focus: t.clinical_focus || (t.protocol_description ? t.protocol_description.substring(0, 100) + '...' : '')
    };
  });
};

// ─── FAQ Index Builder ─────────────────────────────────────────────────────
export const buildFAQIndex = (faqs, mappings) => {
  if (!faqs) return [];
  return faqs.map(f => {
    const relatedProducts = (mappings || [])
      .filter(m => m.faqId === (f.faqId || f.id))
      .map(m => m.productID)
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i);

    return {
      faq_id: f.faqId || f.id,
      question: f.question,
      short_answer: f.shortAnswer || f.answer?.substring(0, 120) + '...',
      category: f.category || f.categoryId,
      tags: f.tags || [],
      related_products: relatedProducts,
      related_protocols: f.relatedProtocols || [],
      active: f.active ?? true,
      visibility: f.visibility || 'public',
      is_global: f.isGlobal || false,
      answer: f.answer // Keep for full view
    };
  });
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
  { phrases: ["brain", "cerebro", "memory", "memoria", "focus", "concentración", "cognitive", "cognitivo", "mental clarity", "alzheimer", "neuroprotection"], goals: ["cognitive_enhancement", "neuroprotection", "focus"], boost: 7 },
  { phrases: ["mood", "estado de ánimo", "depression", "depresión", "anxiety", "ansiedad", "stress", "estrés"], goals: ["mood_enhancement", "stress_reduction"], boost: 6 },
  { phrases: ["sleep", "sueño", "dormir", "insomnia", "insomnio"], goals: ["sleep_improvement"], boost: 6 },

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
    const matched = phrases.some(p => normalizedQuery.includes(p) || tokens.some(t => p.includes(t)));
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
    const staticVersion = staticProducts.find(p => p.name === product.name && p.dosage === p.dosage);
    const enrichedProduct = {
      ...product,
      goals: product.goals?.length > 0 ? product.goals : (staticVersion?.goals || []),
      secondaryFactors: product.secondaryFactors?.length > 0 ? product.secondaryFactors : (staticVersion?.secondaryFactors || []),
      tags: product.tags?.length > 0 ? product.tags : (staticVersion?.tags || []),
      mechanisms: product.mechanisms?.length > 0 ? product.mechanisms : (staticVersion?.mechanisms || []),
      semanticKeywords: product.semanticKeywords?.length > 0 ? product.semanticKeywords : (staticVersion?.semanticKeywords || []),
      synonyms: product.synonyms?.length > 0 ? product.synonyms : (staticVersion?.synonyms || []),
    };

    let score = 0;
    const matchedThemes = new Set();

    const searchTarget = (enrichedProduct.displayName || enrichedProduct.name || "").toLowerCase();
    if (searchTarget.includes(normalizedQuery)) {
      score += 12;
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

      const strengths = new Set(allFamilyMembers.map(p => p.dosage || p.strength).filter(Boolean));

      uniqueFamilies.set(normalizedName, {
        ...product,
        strengthCount: strengths.size > 0 ? strengths.size : 1,
        allStrengths: Array.from(strengths)
      });
    }
  });

  return Array.from(uniqueFamilies.values());
};

// ─── Protocol Search Function ─────────────────────────────────────────────
export const searchProtocols = (query, protocolIndex = []) => {
  if (!query || !query.trim() || !protocolIndex.length) return [];
  const searchTerm = query.toLowerCase();
  
  return protocolIndex.map(protocol => {
    let score = 0;
    const { name, category, tags, products_used, clinical_focus } = protocol;
    
    const safeName = (name || '').toLowerCase();
    const safeCategory = (category || '').toLowerCase();
    const safeFocus = (clinical_focus || '').toLowerCase();
    const safeTags = Array.isArray(tags) ? tags : [];
    const safeProducts = Array.isArray(products_used) ? products_used : [];

    // Direct match (Exact match on Protocol Title)
    if (safeName === searchTerm) score += 100;
    
    // Title match
    if (safeName.includes(searchTerm)) score += 50;
    
    // Tags match
    if (safeTags.some(tag => (tag || '').toLowerCase().includes(searchTerm))) score += 30;
    
    // Products used match
    if (safeProducts.some(p => (p || '').toLowerCase().includes(searchTerm))) score += 20;
    
    // Category match
    if (safeCategory.includes(searchTerm)) score += 15;
    
    // Clinical focus match
    if (safeFocus.includes(searchTerm)) score += 10;
    
    return { ...protocol, score };
  })
  .filter(p => p.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 5);
};

// ─── FAQ Search Function ──────────────────────────────────────────────────
export const searchFAQ = (query, faqIndex, isProfessional = false) => {
  if (!query || !faqIndex?.length) return [];

  const q = query.toLowerCase().trim();
  const words = q.split(/\s+/).filter(w => !STOP_WORDS.has(w));
  const questionBoost = isQuestion(query) ? 1.5 : 1.0;

  const visibleItems = faqIndex.filter(
    (faq) => faq.active && (faq.visibility === 'public' || isProfessional)
  );

  const scored = visibleItems.map((faq) => {
    let score = 0;
    
    // Global items get a baseline visibility boost
    if (faq.is_global) score += 2;

    const searchFields = [
      faq.question || '',
      faq.short_answer || '',
      faq.answer || '',
      ...(faq.tags || []),
      ...(faq.related_products || []),
    ].map((f) => f.toLowerCase());

    const combined = searchFields.join(' ');

    if (combined.includes(q)) score += 10;
    
    words.forEach((word) => {
      if (combined.includes(word)) score += 2;
    });

    // Special Boost: If the query mentions a product this FAQ is mapped to
    if (faq.related_products) {
      faq.related_products.forEach(p => {
        if (q.includes(p.toLowerCase())) score += 8;
      });
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


