// src/skills/clinical_ai.js
/**
 * Clinical AI Skill
 * Handles:
 *   - Query classification & intent detection
 *   - Recommendation generation (products & protocols)
 *   - Mapping recommendations to product IDs / protocol IDs
 */

/** Simple mock intent classifier (replace with actual model call) */
export function classifyIntent(query) {
  const lowered = query.toLowerCase();
  const intents = [];
  if (/(pain|ache|stiff)/.test(lowered)) intents.push('symptom_analysis');
  if (/(dosage|dose|frequency)/.test(lowered)) intents.push('dosage_query');
  if (/(recommend|suggest)/.test(lowered)) intents.push('recommendation');
  return { intents, confidence: 0.9 };
}

/** Extract entities (products, protocols) from the query – placeholder implementation */
export function extractEntities(query, productCatalog = [], protocolCatalog = []) {
  const foundProducts = productCatalog.filter(p =>
    query.toLowerCase().includes(p.name.toLowerCase())
  );
  const foundProtocols = protocolCatalog.filter(pr =>
    query.toLowerCase().includes(pr.title.toLowerCase())
  );
  return { products: foundProducts, protocols: foundProtocols };
}

/** Generate ranked recommendations based on intent and extracted entities */
export function generateRecommendations({ intents, confidence }, entities, options = {}) {
  const recs = [];
  // Simple rule‑based ranking – in real life this would be ML‑driven.
  if (intents.includes('recommendation')) {
    recs.push(...entities.products.map(p => ({ id: p.id, type: 'product', score: 0.8 })));
    recs.push(...entities.protocols.map(pr => ({ id: pr.id, type: 'protocol', score: 0.75 })));
  }
  // Apply optional weighting from options
  if (options.weight) {
    recs.forEach(r => (r.score *= options.weight));
  }
  // Sort by score descending
  return recs.sort((a, b) => b.score - a.score);
}

/** Map recommendation IDs to full objects using provided lookups */
export function mapRecommendations(recs, productLookup, protocolLookup) {
  return recs.map(r => {
    if (r.type === 'product') {
      return { ...r, data: productLookup[r.id] || null };
    }
    if (r.type === 'protocol') {
      return { ...r, data: protocolLookup[r.id] || null };
    }
    return r;
  });
}

export default {
  classifyIntent,
  extractEntities,
  generateRecommendations,
  mapRecommendations,
};
